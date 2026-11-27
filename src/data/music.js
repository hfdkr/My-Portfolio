// Soundtrack settings.
//
// By default the site performs "Gravity Well", an original generative score written for it
// (src/audio/score.js): nothing to download, nothing to license.
//
// To use a recorded track instead, put a file you have the rights to in /public/audio/ and set
// `file` (e.g. "audio/my-track.mp3"), then fill `credit`. If the file is missing or cannot play,
// the player falls back to the generative score automatically.

export const music = {
  file: null,
  credit: null, // e.g. { en: "Composer — Title (licence)", fr: "…", ar: "…" }
  title: { en: "Gravity Well", fr: "Puits de gravité", ar: "بئر الجاذبية" },
};
