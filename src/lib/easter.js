// Secrets for the curious. Nothing here is required to use the site.
import { emit, toast } from "./events";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** ↑ ↑ ↓ ↓ ← → ← → B A → the zellige field flips in a spiral. @returns {() => void} cleanup */
export function listenKonami(message) {
  let i = 0;
  const onKey = (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && (target.isContentEditable || /input|textarea/i.test(target.tagName))) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    i = key === KONAMI[i] ? i + 1 : key === KONAMI[0] ? 1 : 0;
    if (i === KONAMI.length) {
      i = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
      emit("wave");
      toast(message());
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}

/** A note for developers who open the console. Shown once per page load. */
export function greetDevelopers() {
  if (typeof window === "undefined" || window.__hkGreeted) return;
  window.__hkGreeted = true;
  const style = "font: 600 13px/1.6 ui-monospace, monospace; color: #ff7a45";
  // Intentional: the one console message of the site, for curious developers.
  console.info(
    "%c✦ Hello, fellow developer.\n  The hero is one InstancedMesh, animated in the vertex shader.\n  Try the terminal (Ctrl `), or ↑ ↑ ↓ ↓ ← → ← → B A.\n  Source: https://github.com/hfdkr",
    style,
  );
}
