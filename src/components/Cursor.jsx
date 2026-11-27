import { useEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { useFinePointer, usePrefersReducedMotion } from "../lib/hooks";

// Contextual cursor: a dot that tracks exactly, a ring that follows with a little lag.
// Grows over interactive elements; shows a word on [data-cursor] targets.
// The animation loop only runs while the ring is catching up — idle costs nothing.

const INTERACTIVE = "a, button, [role='button'], [role='radio'], [role='option'], label, input, textarea";

export default function Cursor() {
  const { t } = usePrefs();
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const dot = useRef(null);
  const ring = useRef(null);
  const [mode, setMode] = useState({ kind: "default", label: "" });

  useEffect(() => {
    if (!fine) return;
    const root = document.documentElement;
    root.classList.add("cursor-on");
    const pos = { x: -100, y: -100 };
    const lag = { x: -100, y: -100 };
    let raf = 0;
    let shown = false;

    const loop = () => {
      const k = reduced ? 1 : 0.2;
      lag.x += (pos.x - lag.x) * k;
      lag.y += (pos.y - lag.y) * k;
      ring.current.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0)`;
      raf = Math.abs(pos.x - lag.x) + Math.abs(pos.y - lag.y) > 0.3 ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (!shown) {
        shown = true;
        lag.x = pos.x;
        lag.y = pos.y;
        dot.current.style.opacity = "1";
        ring.current.style.opacity = "1";
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const set = (kind, label = "") => setMode((m) => (m.kind === kind && m.label === label ? m : { kind, label }));
    const onOver = (e) => {
      const target = e.target instanceof Element ? e.target : null;
      const labelled = target?.closest("[data-cursor]");
      if (labelled) return set("label", labelled.getAttribute("data-cursor"));
      if (target?.closest(INTERACTIVE)) return set("hover");
      set("default");
    };
    const hide = () => {
      shown = false;
      if (dot.current) dot.current.style.opacity = "0";
      if (ring.current) ring.current.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("cursor-on");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", hide);
    };
  }, [fine, reduced]);

  if (!fine) return null;

  const labelled = mode.kind === "label";
  const size = labelled ? 76 : mode.kind === "hover" ? 46 : 30;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      <div ref={ring} className="absolute top-0 left-0 opacity-0 transition-opacity duration-300" style={{ willChange: "transform" }}>
        <div
          className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-[width,height,background-color,border-color] duration-500 ease-[var(--ease-out-expo)] ${
            labelled ? "border border-transparent bg-accent text-accent-ink" : "border border-ink/40"
          }`}
          style={{ width: size, height: size }}
        >
          <span className={`mono text-[10px] font-medium tracking-wider uppercase transition-opacity duration-300 ${labelled ? "opacity-100" : "opacity-0"}`}>
            {labelled ? t(`cursor.${mode.label}`) : ""}
          </span>
        </div>
      </div>
      <div ref={dot} className="absolute top-0 left-0 opacity-0" style={{ willChange: "transform" }}>
        <div className={`h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent transition-transform duration-300 ${labelled ? "scale-0" : "scale-100"}`} />
      </div>
    </div>
  );
}
