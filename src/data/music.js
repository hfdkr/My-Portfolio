// Soundtrack settings.
//
// By default the site performs "Gravity Well", an original generative score written for it
// (src/audio/score.js): nothing to download, nothing to license.
//
// To use a recorded track instead, put a file you have the rights to in /public/audio/ and set
// `file` (e.g. "audio/my-track.mp3"), then fill `credit`. If the file is missing or cannot play,
// the player falls back to the generative score automatically.

export const music = {
  // Your track: drop it at public/audio/soundtrack.mp3 (any other name: change this path).
  // Until the file exists, the live score below plays instead — nothing breaks.
  file: "audio/soundtrack.mp3",
  fileTitle: null, // e.g. { en: "Track title — Artist", fr: "…" } — shown in the player for the MP3
  credit: null, // e.g. { en: "Licence / source", fr: "…" }
  title: { en: "Gravity Well", fr: "Puits de gravité" }, // the generative score's title
};
