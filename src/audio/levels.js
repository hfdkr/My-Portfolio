// Live audio levels shared with anything that animates (visualizer, liquid) — without React.
// The music engine registers a sampler; readers call sampleLevels() inside their own frame
// loop. Sampling happens at most once per animation frame, however many readers there are.

export const levels = { bass: 0, mid: 0, high: 0, energy: 0, active: false };

let sampler = null;
let lastFrame = -1;

/** @param {((out: typeof levels) => void) | null} fn */
export function setLevelSampler(fn) {
  sampler = fn;
  if (!fn) {
    levels.bass = levels.mid = levels.high = levels.energy = 0;
    levels.active = false;
  }
}

/** @returns {typeof levels} */
export function sampleLevels() {
  const now = performance.now();
  if (sampler && now - lastFrame > 8) {
    lastFrame = now;
    sampler(levels);
  }
  return levels;
}
