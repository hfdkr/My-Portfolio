// A tiny app-wide event bus (window CustomEvents), used where React state would
// cause needless re-renders: toasts, the easter-egg wave, the 3D scene.

/** @param {string} name @param {unknown} [detail] */
export const emit = (name, detail) => window.dispatchEvent(new CustomEvent(`hk:${name}`, { detail }));

/** @param {string} name @param {(detail: any) => void} fn @returns {() => void} unsubscribe */
export function on(name, fn) {
  const handler = (e) => fn(e.detail);
  window.addEventListener(`hk:${name}`, handler);
  return () => window.removeEventListener(`hk:${name}`, handler);
}

export const toast = (message) => emit("toast", message);
