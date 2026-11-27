/* ----------------------------------------------------------------------------
   AUDIO ENGINE — performs "Gravity Well" (score.js) live, or plays a licensed
   file if one is configured in src/data/music.js.

   - Lookahead scheduler ("a tale of two clocks"): a light timer schedules notes
     a fraction of a second ahead on the sample-accurate audio clock.
   - Pause = fade out, then suspend the AudioContext: its clock stops, so play
     resumes exactly where the music was — nothing restarts.
   - Every layer has its own bus (gain + reverb send); movements only move those
     gains, slowly, at chord boundaries.
   - An AnalyserNode after the master feeds the visualizer and the liquid.
   No React in here: UI talks to it through MusicProvider.
---------------------------------------------------------------------------- */

import { TEMPO, BEATS_PER_CHORD, CHORDS_PER_PHRASE, PROGRESSIONS, ARP_FIGURES, MOTIFS, MOVEMENTS } from "./score.js";
import { createTimbres, createReverb, createNoise, organ, pad, piano, pluck, bass, tick, swell } from "./instruments.js";

const BEAT = 60 / TEMPO;
const STEP = BEAT / 2; // eighth notes
const STEPS_PER_CHORD = BEATS_PER_CHORD * 2;
const FADE_IN = 2.6;
const FADE_OUT = 1.2;

// [layer]: [dry level, reverb send]
const BUSES = { organ: [0.55, 0.7], pad: [0.5, 0.55], piano: [0.6, 0.65], arp: [0.4, 0.55], bass: [0.8, 0.15], tick: [0.5, 0.25], swell: [0.35, 0.6] };

export class AudioEngine {
  /**
   * @param {{ file?: string | null, lite?: boolean, onStatus?: (s: string) => void, onMovement?: (m: string) => void }} options
   */
  constructor({ context = null, file = null, lite = false, onStatus, onMovement } = {}) {
    this.givenContext = context;
    this.file = file;
    this.lite = lite;
    this.onStatus = onStatus;
    this.onMovement = onMovement;
    this.status = "idle";
    this.volume = 0.7;
    this.muted = false;
    this.ctx = null;
    this.requested = "intro";
    this.movement = "intro";
    this.timer = 0;
    this.freq = null;
    this.wave = null;
  }

  // ------------------------------------------------------------------ public
  /** Must be called from a user gesture (click / key). Resolves to the new status. */
  async play() {
    if (this.status === "playing") return this.status;
    try {
      if (!this.ctx) this.#build();
    } catch {
      return this.#set("error");
    }
    this.#set("loading");
    // a browser that blocks audio leaves the context suspended (sometimes the promise never settles)
    const resumed = await Promise.race([this.ctx.resume().then(() => true, () => false), new Promise((r) => setTimeout(() => r(false), 1500))]);
    if (!resumed || this.ctx.state !== "running") return this.#set("blocked");

    if (this.media) {
      try {
        await this.media.play();
      } catch {
        // the licensed file is missing or unplayable: fall back to the live score
        this.#dropMedia();
      }
    }
    if (!this.media) this.#startScheduler();
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
    this.master.gain.linearRampToValueAtTime(this.#level(), now + FADE_IN);
    return this.#set("playing");
  }

  pause() {
    if (!this.ctx || this.status !== "playing") return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.0001, now + FADE_OUT);
    this.#set("paused");
    clearTimeout(this.suspendTimer);
    this.suspendTimer = setTimeout(() => {
      if (this.status !== "paused") return;
      this.#stopScheduler();
      this.media?.pause();
      this.ctx.suspend();
    }, FADE_OUT * 1000 + 80);
  }

  setVolume(v) {
    this.volume = Math.min(1, Math.max(0, v));
    this.#applyLevel();
  }

  setMuted(m) {
    this.muted = m;
    this.#applyLevel();
  }

  /** The page asks for a movement; the music moves there at the next chord. */
  setMovement(name) {
    if (MOVEMENTS[name]) this.requested = name;
  }

  /** Writes { bass, mid, high, energy } (0…1) into `out` from the real signal. */
  getLevels(out) {
    if (!this.analyser || this.status === "idle") {
      out.bass = out.mid = out.high = out.energy = 0;
      return out;
    }
    const f = this.freq;
    this.analyser.getByteFrequencyData(f);
    const avg = (a, b) => {
      let s = 0;
      for (let i = a; i < b; i++) s += f[i];
      return s / ((b - a) * 255);
    };
    out.bass = Math.min(1, avg(1, 7) * 1.25);
    out.mid = Math.min(1, avg(7, 48) * 1.5);
    out.high = Math.min(1, avg(48, 180) * 2.4);
    out.energy = Math.min(1, out.bass * 0.45 + out.mid * 0.4 + out.high * 0.15);
    return out;
  }

  /** Where the journey is: movement, chord, and progress through the current phrase (0…1). */
  getPosition() {
    if (!this.ctx || this.media) return { movement: this.movement, phrase: 0 };
    const elapsed = this.ctx.currentTime - this.phraseStart;
    const phraseLength = STEP * STEPS_PER_CHORD * CHORDS_PER_PHRASE;
    return { movement: this.movement, phrase: Math.min(1, Math.max(0, elapsed / phraseLength)) };
  }

  dispose() {
    this.#stopScheduler();
    clearTimeout(this.suspendTimer);
    this.media?.pause();
    this.media = null;
    this.ctx?.close();
    this.ctx = null;
    this.status = "idle";
  }

  // ------------------------------------------------------------------ graph
  #build() {
    let ctx = this.givenContext;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error("Web Audio unavailable");
      ctx = new AC({ latencyHint: "playback" });
    }
    this.ctx = ctx;
    this.timbres = createTimbres(ctx);
    this.noise = createNoise(ctx);

    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    comp.attack.value = 0.02;
    comp.release.value = 0.4;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;
    this.freq = new Uint8Array(this.analyser.frequencyBinCount);
    this.wave = new Uint8Array(this.analyser.fftSize);

    const mix = ctx.createGain();
    mix.gain.value = 0.8;
    const reverb = createReverb(ctx, this.lite ? 3.2 : 5.2);
    const reverbReturn = ctx.createGain();
    reverbReturn.gain.value = 0.75;
    reverb.connect(reverbReturn);
    reverbReturn.connect(mix);
    mix.connect(comp);
    comp.connect(this.master);
    this.master.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    // one bus per layer: gain (the movement's level) → dry + reverb send
    this.bus = {};
    for (const [name, [dry, wet]] of Object.entries(BUSES)) {
      const g = ctx.createGain();
      g.gain.value = 0;
      const d = ctx.createGain();
      d.gain.value = dry;
      const w = ctx.createGain();
      w.gain.value = wet;
      g.connect(d);
      g.connect(w);
      d.connect(mix);
      w.connect(reverb);
      this.bus[name] = g;
    }
    // the arpeggio has its own filter (brightness rises with the movement) and a soft echo
    this.arpFilter = ctx.createBiquadFilter();
    this.arpFilter.type = "lowpass";
    this.arpFilter.Q.value = 2;
    this.arpFilter.frequency.value = 700;
    this.arpFilter.connect(this.bus.arp);
    const delay = ctx.createDelay(2); // the echo is 3 eighths (≈1.36 s)
    delay.delayTime.value = STEP * 3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const echo = ctx.createGain();
    echo.gain.value = 0.35;
    this.arpFilter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(echo);
    echo.connect(reverb);

    if (this.file) this.#buildMedia(this.file);
  }

  #buildMedia(url) {
    const el = new Audio();
    el.crossOrigin = "anonymous";
    el.loop = true;
    el.preload = "auto";
    el.src = url;
    el.addEventListener("error", () => {
      if (!this.media) return;
      const wasPlaying = this.status === "playing";
      this.#dropMedia();
      if (wasPlaying) this.#startScheduler();
    });
    this.mediaNode = this.ctx.createMediaElementSource(el);
    const g = this.ctx.createGain();
    g.gain.value = 0.9;
    this.mediaNode.connect(g);
    g.connect(this.master);
    this.media = el;
  }

  #dropMedia() {
    this.media?.pause();
    this.media = null;
  }

  #level() {
    return this.muted ? 0.0001 : Math.max(0.0001, this.volume * this.volume * 0.9); // perceptual curve
  }

  #applyLevel() {
    if (!this.ctx || this.status !== "playing") return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(this.#level(), now, 0.12);
  }

  #set(status) {
    this.status = status;
    this.onStatus?.(status);
    return status;
  }

  // ------------------------------------------------------------------ the performance
  #startScheduler() {
    if (this.timer) return;
    if (this.nextStep == null) {
      // first performance: begin in the movement of the section being read
      this.movement = this.requested;
      this.onMovement?.(this.movement);
      this.nextStep = this.ctx.currentTime + 0.12;
      this.step = 0;
      this.chord = 0;
      this.phrase = 0;
      this.phraseStart = this.nextStep;
      this.age = 0;
      this.progression = MOVEMENTS[this.movement].progression;
      this.#enterMovement(this.movement, this.nextStep);
    }
    const loop = () => {
      // background tabs throttle timers to ~1/s: schedule further ahead then
      const ahead = document.hidden ? 1.6 : 0.35;
      while (this.nextStep < this.ctx.currentTime + ahead) {
        this.#perform(this.nextStep);
        this.nextStep += STEP;
      }
    };
    loop();
    this.timer = setInterval(loop, 60);
  }

  #stopScheduler() {
    clearInterval(this.timer);
    this.timer = 0;
  }

  #enterMovement(name, t) {
    const m = MOVEMENTS[name];
    // the longer the visitor stays, the fuller the movement grows (up to +24%)
    const grow = 1 + Math.min(this.age, 3) * 0.08;
    for (const [layer, level] of Object.entries(m.layers)) {
      const v = layer === "organ" || layer === "arp" ? level * grow : level;
      this.bus[layer].gain.setTargetAtTime(v, t, 2.4);
    }
    this.arpFilter.frequency.setTargetAtTime(m.arpBright * (1 + Math.min(this.age, 3) * 0.12), t, 3);
  }

  #perform(t) {
    const s = this.step;

    if (s === 0) {
      // chord boundary: follow the page if it asked for another movement
      if (this.chord === 0) {
        this.phraseStart = t;
        if (this.requested !== this.movement) {
          this.movement = this.requested;
          this.age = 0;
          this.onMovement?.(this.movement);
        } else if (this.phrase > 0) {
          this.age += 1;
        }
        this.progression = MOVEMENTS[this.movement].progression;
        this.#enterMovement(this.movement, t);
      } else if (this.requested !== this.movement && MOVEMENTS[this.requested].progression === this.progression) {
        // same harmony: the change can happen at the next chord, not wait for the phrase
        this.movement = this.requested;
        this.age = 0;
        this.onMovement?.(this.movement);
        this.#enterMovement(this.movement, t);
      }
      this.#chord(t);
    }
    this.#rhythm(t, s);

    this.step = (s + 1) % STEPS_PER_CHORD;
    if (this.step === 0) {
      this.chord = (this.chord + 1) % CHORDS_PER_PHRASE;
      if (this.chord === 0) this.phrase += 1;
    }
  }

  #notes() {
    return PROGRESSIONS[this.progression][this.chord];
  }

  #chord(t) {
    const ctx = this.ctx;
    const m = MOVEMENTS[this.movement];
    const notes = this.#notes();
    const dur = STEP * STEPS_PER_CHORD;
    const variation = this.phrase;

    // bass: the root, two octaves of weight
    bass(ctx, this.bus.bass, t, notes[0] - 12, dur, 0.5);

    // organ: drop the top voice on alternate phrases (voicing breathes); in the intro only root + fifth
    const organNotes = this.movement === "intro" ? [notes[1], notes[2]] : notes.slice(1, variation % 2 ? 5 : 6);
    const ranks = this.lite ? organNotes.slice(0, 3) : organNotes;
    ranks.forEach((n) => organ(ctx, this.bus.organ, this.timbres, t, n, dur, 0.09));
    // climax: the projects movement doubles the organ an octave up on every second phrase's last chord
    if (m.layers.swell > 0.5 && variation % 2 === 1 && this.chord === CHORDS_PER_PHRASE - 1) {
      notes.slice(3).forEach((n) => organ(ctx, this.bus.organ, this.timbres, t, n + 12, dur, 0.06));
    }

    // pad: the middle voices, an octave up
    const padNotes = this.lite ? [notes[2], notes[4]] : [notes[2], notes[3], notes[4]];
    padNotes.forEach((n) => pad(ctx, this.bus.pad, t, n + 12, dur, 0.035));

    // swell into the last chord of a phrase, when the movement builds
    if (m.layers.swell > 0 && this.chord === CHORDS_PER_PHRASE - 2) {
      swell(ctx, this.bus.swell, this.noise, t + dur * 0.35, dur * 0.65, 0.18);
    }
  }

  #rhythm(t, s) {
    const ctx = this.ctx;
    const m = MOVEMENTS[this.movement];
    const notes = this.#notes();
    const top = notes.slice(1).sort((a, b) => a - b); // upper voices, low → high

    // arpeggio
    if (m.layers.arp > 0) {
      const figure = ARP_FIGURES[this.phrase % ARP_FIGURES.length];
      const lift = this.phrase % 3 === 2 ? 12 : 0;
      const per = m.arpRate / 2; // notes per eighth
      for (let k = 0; k < per; k++) {
        const i = (s * per + k) % figure.length;
        const n = top[Math.min(top.length - 1, figure[i] - 1)] + 12 + lift;
        const accent = (s * per + k) % 8 === 0 ? 1 : 0.72;
        pluck(ctx, this.arpFilter, this.timbres, t + k * (STEP / per), n, 0.075 * accent, per > 1 ? 0.32 : 0.55);
      }
    }

    // clock
    const pattern = m.tick;
    const onBeat = s % 2 === 0;
    const onBar = s % 8 === 0;
    if ((pattern === "eighth") || (pattern === "beat" && onBeat) || (pattern === "bar" && onBar)) {
      tick(ctx, this.bus.tick, this.noise, t, onBar);
    }

    // piano: the motif on its beats, plus sparse answering notes
    const motif = MOTIFS[(this.phrase + m.index) % MOTIFS.length];
    motif.beats.forEach((b, i) => {
      if (b * 2 !== s) return; // motif beats fall on eighth notes
      const n = top[Math.max(0, top.length - motif.notes[i])] + 12;
      piano(ctx, this.bus.piano, this.timbres, t, n, 0.16);
    });
    if (onBeat && !onBar && Math.random() < m.pianoDensity * 0.35) {
      const n = top[Math.floor(Math.random() * top.length)] + (Math.random() < 0.5 ? 12 : 24);
      piano(ctx, this.bus.piano, this.timbres, t + STEP * 0.5, n, 0.07);
    }
  }
}
