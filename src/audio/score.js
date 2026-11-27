/* ----------------------------------------------------------------------------
   "GRAVITY WELL" — an original generative score.

   Written for this site; it quotes no existing piece. The harmony, motifs and
   rhythms below are its sheet music; engine.js performs them live, with small
   variations every phrase, so it develops instead of looping.

   Time: 66 BPM. A chord lasts 2 bars (8 beats ≈ 7.3 s); a phrase is 4 chords
   (≈ 29 s). Movement changes wait for the next chord, progression changes for
   the next phrase — the music follows the visitor, never jumps.
   Pitches are MIDI note numbers (60 = middle C).
---------------------------------------------------------------------------- */

export const TEMPO = 66;
export const BEATS_PER_CHORD = 8;
export const CHORDS_PER_PHRASE = 4;

// Three progressions in D: suspended minor → lifted major → home.
export const PROGRESSIONS = {
  // D dorian, open and unresolved
  shadow: [
    [38, 50, 57, 60, 64, 65], // Dm(add9)
    [34, 46, 53, 57, 62, 64], // B♭maj7(#11)
    [43, 50, 55, 58, 62, 69], // Gm(add9)/D
    [45, 52, 57, 60, 62, 67], // Am7(sus4)
  ],
  // the lift: the bass climbs while the top holds
  lift: [
    [41, 53, 57, 60, 67, 69], // F(add9)
    [40, 52, 55, 60, 64, 71], // C/E (add maj7)
    [38, 50, 57, 62, 65, 69], // Dm9
    [34, 50, 53, 58, 62, 64], // B♭(add9 #11)
  ],
  // home: from suspension to a bright D major
  home: [
    [34, 46, 53, 57, 62, 65], // B♭maj7
    [33, 45, 53, 57, 60, 64], // F/A
    [43, 50, 55, 58, 62, 67], // Gm(add9)
    [38, 50, 57, 62, 64, 66], // D(add9) — the light at the end
  ],
};

// Arpeggio contours over the chord's upper voices (indices into the sorted notes).
// Each phrase picks the next one, so the figure keeps evolving.
export const ARP_FIGURES = [
  [1, 3, 2, 4, 3, 5, 4, 2],
  [1, 2, 4, 3, 5, 3, 4, 2],
  [2, 4, 3, 5, 4, 3, 5, 1],
  [1, 4, 2, 5, 3, 5, 2, 4],
];

// The piano motif: scale degrees of the chord (from the top) and beat positions.
export const MOTIFS = [
  { notes: [5, 3, 4, 2], beats: [0, 1.5, 3, 6] },
  { notes: [4, 5, 3, 1], beats: [0, 2, 3.5, 5] },
  { notes: [5, 4, 2, 3], beats: [0.5, 2, 4, 6.5] },
];

/**
 * The five movements. Layers are gains (0…1); `arpRate` is notes per beat,
 * `arpBright` the arpeggio filter cutoff (Hz), `tick` the clock pattern,
 * `swell` whether phrases build to a climax.
 */
export const MOVEMENTS = {
  intro: {
    index: 0,
    progression: "shadow",
    layers: { organ: 0.28, pad: 0.55, piano: 0.4, arp: 0, bass: 0.25, tick: 0, swell: 0 },
    pianoDensity: 0.3,
    arpRate: 2,
    arpBright: 700,
    tick: "none",
  },
  exploration: {
    index: 1,
    progression: "shadow",
    layers: { organ: 0.55, pad: 0.45, piano: 0.3, arp: 0.3, bass: 0.32, tick: 0.16, swell: 0 },
    pianoDensity: 0.2,
    arpRate: 2,
    arpBright: 1100,
    tick: "beat",
  },
  development: {
    index: 2,
    progression: "lift",
    layers: { organ: 0.62, pad: 0.4, piano: 0.5, arp: 0.5, bass: 0.45, tick: 0.26, swell: 0.3 },
    pianoDensity: 0.45,
    arpRate: 2,
    arpBright: 1800,
    tick: "eighth",
  },
  projects: {
    index: 3,
    progression: "lift",
    layers: { organ: 0.85, pad: 0.5, piano: 0.3, arp: 0.7, bass: 0.6, tick: 0.3, swell: 0.8 },
    pianoDensity: 0.25,
    arpRate: 4,
    arpBright: 3200,
    tick: "eighth",
  },
  contact: {
    index: 4,
    progression: "home",
    layers: { organ: 0.38, pad: 0.6, piano: 0.6, arp: 0.15, bass: 0.25, tick: 0.06, swell: 0 },
    pianoDensity: 0.45,
    arpRate: 2,
    arpBright: 900,
    tick: "bar",
  },
};

export const MOVEMENT_ORDER = ["intro", "exploration", "development", "projects", "contact"];

// Which movement each section of the page asks for.
export const SECTION_TO_MOVEMENT = {
  top: "intro",
  about: "exploration",
  work: "projects",
  skills: "development",
  experience: "development",
  contact: "contact",
};
