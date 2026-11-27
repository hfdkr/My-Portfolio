import { useEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { useFinePointer } from "../lib/hooks";

/**
 * Context cursor (mouse and trackpad only — never on touch).
 *   default → small dot + ring
 *   link / button → ring grows around the target
 *   [data-cursor="view"] → large disc with "View"
 *   [data-cursor="drag"] → ring with "Drag" (3D canvases)
 */
export default function Cursor() {
  const fine = useFinePointer();
  const { t } = usePrefs();
  const dot = useRef(null);
  const ring = useRef(null);
  const [mode, setMode] = useState("default");
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!fine) return;
    const root = document.documentElement;
    root.classList.add("cursor-on");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;

    const loop = () => {
      const k = reduced ? 1 : 0.2;
      rx += (x - rx) * k;
      ry += (y - ry) * k;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      setHidden(false);
      const el = e.target instanceof Element ? e.target : null;
      const ctx = el?.closest("[data-cursor]")?.getAttribute("data-cursor");
      if (ctx) setMode(ctx);
      else if (el?.closest("input, textarea")) setMode("text");
      else if (el?.closest("a, button, [role='button'], [role='option'], label, summary")) setMode("link");
      else setMode("default");
    };
    const onLeave = () => setHidden(true);
    const onDown = () => ring.current?.classList.add("scale-75");
    const onUp = () => ring.current?.classList.remove("scale-75");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(loop);
    return () => {
      root.classList.remove("cursor-on");
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [fine]);

  if (!fine) return null;

  const size = { default: 34, link: 56, view: 96, drag: 76, text: 0 }[mode] ?? 34;
  const label = mode === "view" ? t("cursor.view") : mode === "drag" ? t("cursor.drag") : "";

  return (
    <div aria-hidden="true" className={`pointer-events-none fixed inset-0 z-[90] transition-opacity duration-200 ${hidden ? "opacity-0" : "opacity-100"}`}>
      <div ref={ring} className="absolute top-0 left-0 transition-transform duration-150 will-change-transform">
        <div
          className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-300 ease-[var(--ease-out-expo)] ${
            mode === "view"
              ? "border-transparent bg-accent text-accent-ink"
              : mode === "link"
                ? "border-accent bg-[var(--accent-glow)]"
                : mode === "drag"
                  ? "border-[color:var(--cyan)] border-dashed"
                  : "border-line-strong"
          }`}
          style={{ width: size, height: size }}
        >
          {label && <span className="mono text-[11px] font-semibold tracking-wide">{label}</span>}
        </div>
      </div>
      <div ref={dot} className="absolute top-0 left-0 will-change-transform">
        <div className={`h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent transition-opacity ${mode === "view" || mode === "text" ? "opacity-0" : ""}`} />
      </div>
    </div>
  );
}
