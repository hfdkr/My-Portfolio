/* ----------------------------------------------------------------------------
   Instruments, synthesised with the Web Audio API.
   Each function schedules one note at an exact audio-clock time and lets its
   nodes be garbage-collected after they stop. Envelopes always start from a
   tiny value and ramp — no clicks.
---------------------------------------------------------------------------- */

export const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const EPS = 0.0001;

/** Waveforms built once per AudioContext (PeriodicWave = many harmonics, one oscillator). */
export function createTimbres(ctx) {
  const wave = (amps) => {
    const real = new Float32Array(amps.length + 1);
    const imag = new Float32Array([0, ...amps]);
    return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  };
  return {
    // church organ: 8', 4', 2⅔', 2', 1⅗', 1⅓', 1' drawbars
    organ: wave([1, 0.62, 0.38, 0.42, 0.16, 0.2, 0.05, 0.12]),
    // soft piano body: strong fundamental, quickly thinning partials
    piano: wave([1, 0.42, 0.18, 0.1, 0.05, 0.03]),
    // glassy arpeggio: odd partials, like a soft square
    glass: wave([1, 0, 0.3, 0, 0.12, 0, 0.05]),
  };
}

/** Cathedral reverb: a generated stereo impulse response (decaying, slightly darkening noise). */
export function createReverb(ctx, seconds) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const ir = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // one-pole low-pass that closes over time: the tail gets darker, like stone
      const k = 0.55 - 0.45 * t;
      lp += k * ((Math.random() * 2 - 1) - lp);
      data[i] = lp * Math.pow(1 - t, 3.2) * (i < rate * 0.012 ? i / (rate * 0.012) : 1);
    }
  }
  const node = ctx.createConvolver();
  node.buffer = ir;
  return node;
}

/** One white-noise buffer, reused by every tick and swell. */
export function createNoise(ctx) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function envelope(ctx, t, attack, peak, hold, release) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(EPS, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.setValueAtTime(peak, t + attack + hold);
  g.gain.exponentialRampToValueAtTime(EPS, t + attack + hold + release);
  return g;
}

/** Organ chord voice: two slightly detuned ranks for a breathing, chorused pipe sound. */
export function organ(ctx, out, timbres, t, midi, dur, vel) {
  const end = t + dur;
  const g = envelope(ctx, t, 1.6, vel, Math.max(0, dur - 1.6), 2.8);
  g.connect(out);
  for (const cents of [-4, 4]) {
    const o = ctx.createOscillator();
    o.setPeriodicWave(timbres.organ);
    o.frequency.value = hz(midi);
    o.detune.value = cents;
    o.connect(g);
    o.start(t);
    o.stop(end + 3);
  }
}

/** Pad: three detuned saws through a slowly opening low-pass. */
export function pad(ctx, out, t, midi, dur, vel) {
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.Q.value = 0.4;
  f.frequency.setValueAtTime(260, t);
  f.frequency.linearRampToValueAtTime(900, t + dur * 0.6);
  f.frequency.linearRampToValueAtTime(420, t + dur + 3);
  const g = envelope(ctx, t, 3.2, vel, Math.max(0, dur - 3.2), 3.5);
  f.connect(g);
  g.connect(out);
  for (const cents of [-9, 0, 8]) {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = hz(midi);
    o.detune.value = cents;
    o.connect(f);
    o.start(t);
    o.stop(t + dur + 3.6);
  }
}

/** Piano-like note: fast attack, long natural decay, the brightness fades first. */
export function piano(ctx, out, timbres, t, midi, vel) {
  const decay = 2.2 + (84 - midi) * 0.05;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(5200, t);
  f.frequency.exponentialRampToValueAtTime(900, t + decay);
  const g = ctx.createGain();
  g.gain.setValueAtTime(EPS, t);
  g.gain.linearRampToValueAtTime(vel, t + 0.008);
  g.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.35);
  g.gain.exponentialRampToValueAtTime(EPS, t + decay);
  const o = ctx.createOscillator();
  o.setPeriodicWave(timbres.piano);
  o.frequency.value = hz(midi);
  o.connect(f);
  f.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + decay + 0.05);
}

/** Arpeggio pluck (goes through the arp bus, whose filter the engine sweeps). */
export function pluck(ctx, out, timbres, t, midi, vel, length) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(EPS, t);
  g.gain.linearRampToValueAtTime(vel, t + 0.012);
  g.gain.exponentialRampToValueAtTime(EPS, t + length);
  const o = ctx.createOscillator();
  o.setPeriodicWave(timbres.glass);
  o.frequency.value = hz(midi);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + length + 0.05);
}

/** Bass: a sine sub with a soft octave above, swelling in under each chord. */
export function bass(ctx, out, t, midi, dur, vel) {
  const g = envelope(ctx, t, 1.2, vel, Math.max(0, dur - 1.2), 2);
  g.connect(out);
  [
    [midi, 1],
    [midi + 12, 0.18],
  ].forEach(([m, a]) => {
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    og.gain.value = a;
    o.frequency.value = hz(m);
    o.connect(og);
    og.connect(g);
    o.start(t);
    o.stop(t + dur + 2.2);
  });
}

/** The clock: a short, dry, wooden tick. Accented ticks are lower and louder. */
export function tick(ctx, out, noise, t, accent) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = accent ? 2600 : 3800;
  f.Q.value = 9;
  const g = ctx.createGain();
  const v = accent ? 0.9 : 0.5;
  g.gain.setValueAtTime(EPS, t);
  g.gain.linearRampToValueAtTime(v, t + 0.002);
  g.gain.exponentialRampToValueAtTime(EPS, t + 0.045);
  src.connect(f);
  f.connect(g);
  g.connect(out);
  src.start(t, Math.random() * 1.5, 0.06);
}

/** Swell: rising filtered noise — the air before a climax. */
export function swell(ctx, out, noise, t, dur, vel) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 1.4;
  f.frequency.setValueAtTime(300, t);
  f.frequency.exponentialRampToValueAtTime(4200, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(EPS, t);
  g.gain.exponentialRampToValueAtTime(vel, t + dur * 0.92);
  g.gain.exponentialRampToValueAtTime(EPS, t + dur + 1.6);
  src.connect(f);
  f.connect(g);
  g.connect(out);
  src.start(t);
  src.stop(t + dur + 1.7);
}
