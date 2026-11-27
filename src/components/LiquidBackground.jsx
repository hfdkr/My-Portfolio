import { useEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { useIsMobile, usePrefersReducedMotion, hasWebGL } from "../lib/hooks";
import { ScrollTrigger } from "../lib/gsap";
import { on } from "../lib/events";
import { SECTION_ORDER } from "../liquid/atmospheres";

/**
 * The page's one and only canvas: a fixed liquid-chrome background behind everything.
 * Loaded after the page is idle (the text is what loads first), never intercepts input,
 * and leaves a static still in place when WebGL is missing, the device is low-end or
 * the visitor saves data.
 */
export default function LiquidBackground() {
  const { theme } = usePrefs();
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const canvas = useRef(null);
  const api = useRef(null);
  const themeRef = useRef(theme);
  const sectionRef = useRef("top");
  const [ready, setReady] = useState(false);
  themeRef.current = theme;

  useEffect(() => {
    const nav = window.navigator;
    const lowEnd = (nav.deviceMemory && nav.deviceMemory <= 2) || (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2);
    if (!hasWebGL() || lowEnd || nav.connection?.saveData) return;

    let cancelled = false;
    const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback || window.clearTimeout;
    const handle = idle(
      () => {
        import("../liquid/engine.js")
          .then(({ createLiquid }) => {
            if (cancelled || !canvas.current) return;
            try {
              api.current = createLiquid(canvas.current, {
                theme: themeRef.current,
                section: sectionRef.current,
                mobile,
                reduced,
                onReady: () => !cancelled && setReady(true),
                onLost: () => !cancelled && setReady(false),
              });
            } catch {
              // shader or context failure: the static still stays — the page is unaffected
              setReady(false);
            }
          })
          .catch(() => setReady(false));
      },
      { timeout: 1200 },
    );
    return () => {
      cancelled = true;
      cancelIdle(handle);
      api.current?.dispose();
      api.current = null;
      setReady(false);
    };
  }, [mobile, reduced]);

  useEffect(() => {
    api.current?.setTheme(theme);
  }, [theme]);

  // Each section sets the atmosphere while it holds the middle of the viewport.
  useEffect(() => {
    const triggers = SECTION_ORDER.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (!self.isActive) return;
          sectionRef.current = id;
          api.current?.setSection(id);
        },
      });
    }).filter(Boolean);
    return () => triggers.forEach((t) => t.kill());
  }, []);

  useEffect(() => on("wave", () => api.current?.mercury()), []);

  // Micro-interactions: the metal swells under what you point at, and the light leans toward it.
  // One delegated listener for the whole page; strength follows the element's importance.
  useEffect(() => {
    const TARGETS = "a[href], button, [data-cursor], .it[data-variant='title'], .it[data-variant='hero']";
    let currentEl = null;
    const strengthOf = (el) => (el.matches(".btn, [data-cursor]") ? 1 : el.matches(".it") ? 0.6 : 0.75);
    const onOver = (e) => {
      if (e.pointerType !== "mouse") return;
      const el = e.target instanceof Element ? e.target.closest(TARGETS) : null;
      if (el === currentEl) return;
      currentEl = el;
      if (!el) return api.current?.attract(0.5, 0.5, 0);
      const r = el.getBoundingClientRect();
      api.current?.attract((r.left + r.width / 2) / window.innerWidth, 1 - (r.top + r.height / 2) / window.innerHeight, strengthOf(el));
    };
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => document.removeEventListener("pointerover", onOver);
  }, []);

  return (
    <div className="liquid-still pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <canvas ref={canvas} className={`h-full w-full transition-opacity duration-[1600ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}
