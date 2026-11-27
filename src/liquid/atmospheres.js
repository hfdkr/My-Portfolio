// How the liquid looks in each part of the page, in each theme.
// The engine glides between these (≈1.2 s) when a section takes over the viewport.
//
// presence: how much liquid shows (the rest is the page colour)   warp: calm 0.4 … wild 1.2
// iri: iridescence   speed: flow speed   focus: where the pool sits (-1 left … 1 right)
// tilt: perspective of the metal plane — 0 seen from above … 1.2 a deep horizon
// floor/sky/box/key/hue: what the chrome reflects (see shader.js → studio(), film())

const OBSIDIAN = "#090a0e";
const PEARL = "#f1f0eb";

export const ATMOSPHERES = {
  dark: {
    // cinematic opening — cobalt and ultraviolet in polished metal
    top: { presence: 1, warp: 0.95, iri: 0.75, speed: 1, focus: 0.35, bg: OBSIDIAN, floor: "#040509", sky: "#1c1640", box: "#4169ff", key: "#f1f0eb", hue: "#8957e5", tilt: 1.05 },
    // the CV: quiet steel and cobalt, low presence — this section is for reading
    resume: { presence: 0.26, warp: 0.5, iri: 0.25, speed: 0.45, focus: 0.85, bg: OBSIDIAN, floor: "#06070b", sky: "#121626", box: "#4f66c9", key: "#a9b3d6", hue: "#9297a2", tilt: 0.45 },
    // calmer, warmer — emerald and champagne
    about: { presence: 0.4, warp: 0.75, iri: 0.4, speed: 0.55, focus: -0.55, bg: OBSIDIAN, floor: "#05080a", sky: "#0e1c19", box: "#138f75", key: "#9c8862", hue: "#9297a2", tilt: 0.7 },
    // technical: low warp, steel — the work is the colour here
    work: { presence: 0.3, warp: 0.4, iri: 0.15, speed: 0.4, focus: 0.7, bg: OBSIDIAN, floor: "#06070a", sky: "#161a22", box: "#7a7f8a", key: "#aab0bf", hue: "#4169ff", tilt: 0.35 },
    // subtle violet reflections
    skills: { presence: 0.36, warp: 0.65, iri: 0.45, speed: 0.5, focus: -0.7, bg: OBSIDIAN, floor: "#06060b", sky: "#191430", box: "#7a4fd0", key: "#9a9dcc", hue: "#4169ff", tilt: 0.8 },
    // champagne, quiet
    experience: { presence: 0.34, warp: 0.7, iri: 0.25, speed: 0.45, focus: 0.75, bg: OBSIDIAN, floor: "#08080a", sky: "#1c1912", box: "#a8936a", key: "#b9b6ae", hue: "#9297a2", tilt: 0.6 },
    // the ending: the liquid rises again, ultraviolet with a coral horizon
    contact: { presence: 0.6, warp: 0.85, iri: 0.65, speed: 0.7, focus: 0.85, bg: OBSIDIAN, floor: "#05040a", sky: "#22133a", box: "#8957e5", key: "#ffd9bf", hue: "#ff7777", tilt: 1.15 },
  },
  light: {
    // pearl chrome: bright metal, pastel iridescence
    top: { presence: 0.92, warp: 0.95, iri: 0.6, speed: 1, focus: 0.35, bg: PEARL, floor: "#8a90a0", sky: "#fbfaf7", box: "#7e95ff", key: "#ffffff", hue: "#b79bf0", tilt: 1.05 },
    resume: { presence: 0.26, warp: 0.5, iri: 0.2, speed: 0.45, focus: 0.85, bg: PEARL, floor: "#b4b8c4", sky: "#f8f8f6", box: "#9fb0f0", key: "#ffffff", hue: "#c9ccd4", tilt: 0.45 },
    about: { presence: 0.42, warp: 0.75, iri: 0.35, speed: 0.55, focus: -0.55, bg: PEARL, floor: "#b4bab5", sky: "#f7f6f1", box: "#5cc7ab", key: "#ffffff", hue: "#e3cfa2", tilt: 0.7 },
    work: { presence: 0.3, warp: 0.4, iri: 0.12, speed: 0.4, focus: 0.7, bg: PEARL, floor: "#b2b6bf", sky: "#f8f8f6", box: "#c9ccd4", key: "#ffffff", hue: "#7e95ff", tilt: 0.35 },
    skills: { presence: 0.38, warp: 0.65, iri: 0.4, speed: 0.5, focus: -0.7, bg: PEARL, floor: "#b3b0c2", sky: "#f8f7f4", box: "#b79bf0", key: "#ffffff", hue: "#7e95ff", tilt: 0.8 },
    experience: { presence: 0.36, warp: 0.7, iri: 0.25, speed: 0.45, focus: 0.75, bg: PEARL, floor: "#bcb6a8", sky: "#f9f8f4", box: "#e3cfa2", key: "#ffffff", hue: "#c9ccd4", tilt: 0.6 },
    contact: { presence: 0.55, warp: 0.85, iri: 0.55, speed: 0.7, focus: 0.85, bg: PEARL, floor: "#aaa6ba", sky: "#fbfaf7", box: "#b79bf0", key: "#ffffff", hue: "#ff9a9a", tilt: 1.15 },
  },
};

export const SECTION_ORDER = ["top", "resume", "about", "work", "skills", "experience", "contact"];
