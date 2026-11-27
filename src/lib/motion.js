// The animation language of the site, in one place.
//   [data-split]        heading → masked lines rise in, once
//   [data-reveal]       element → rises 24px and fades in, batched per scroll position
//   [data-reveal-group] children rise in with a stagger
//   [data-draw]         a line that grows from the reading direction
// Everything is transform/opacity only (GPU-composited) and runs once.
// Reduced motion → nothing is hidden and nothing animates.

import { useEffect, useLayoutEffect } from "react";
import { gsap, ScrollTrigger, SplitText } from "./gsap";

const START = "top 86%";

/**
 * Wire every reveal inside `scope`. Re-runs when `deps` change (e.g. language).
 * @param {{ current: HTMLElement | null }} scope
 * @param {{ reduced: boolean, deps?: unknown[] }} opts
 */
export function useReveals(scope, { reduced, deps = [] }) {
  useLayoutEffect(() => {
    const root = scope.current;
    if (reduced || !root) return;
    const ctx = gsap.context(() => {
      root.querySelectorAll("[data-split]").forEach((el) => {
        // InteractiveText headings already have their letters: rise them in with a stagger.
        // (No DOM rewriting, so React stays in charge of the markup.)
        const letters = el.querySelectorAll(".it-c");
        if (letters.length) {
          const stagger = Number(el.dataset.stagger) || Math.min(0.028, 0.7 / letters.length);
          gsap.from(letters, {
            yPercent: 70,
            autoAlpha: 0,
            duration: 1.1,
            stagger,
            scrollTrigger: { trigger: el, start: START, once: true },
          });
          return;
        }
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              duration: 1.15,
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: START, once: true },
            }),
        });
      });

      const singles = gsap.utils.toArray(root.querySelectorAll("[data-reveal]"));
      if (singles.length) {
        gsap.set(singles, { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(singles, {
          start: START,
          once: true,
          onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, overwrite: true }),
        });
      }

      root.querySelectorAll("[data-reveal-group]").forEach((group) => {
        gsap.from(group.children, {
          autoAlpha: 0,
          y: 28,
          duration: 1,
          stagger: 0.07,
          scrollTrigger: { trigger: group, start: START, once: true },
        });
      });

      root.querySelectorAll("[data-draw]").forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: document.documentElement.dir === "rtl" ? "right center" : "left center",
          duration: 1.4,
          ease: "expo.inOut",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Elements that lean toward the pointer. Uses gsap.quickTo (no React re-render, no layout thrash:
 * the rect is read once on enter).
 * @param {{ current: HTMLElement | null }} ref
 * @param {{ enabled: boolean, strength?: number }} opts
 */
export function useMagnetic(ref, { enabled, strength = 0.32 }) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" });
    let rect = null;
    const enter = () => (rect = el.getBoundingClientRect());
    const move = (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      xTo((e.clientX - (rect.left + rect.width / 2)) * strength);
      yTo((e.clientY - (rect.top + rect.height / 2)) * strength);
    };
    const leave = () => {
      rect = null;
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [ref, enabled, strength]);
}

/**
 * A pointer "field" over a line of InteractiveText letters (the hero name).
 * Each letter gets --f (0…1, closeness to the pointer) and --dx (a slight magnetic pull),
 * smoothed every frame. The letter under the pointer reacts fully, its neighbours fade off
 * with distance. The loop only runs while the pointer is near and until letters settle.
 * @param {{ current: HTMLElement | null }} ref  element containing .it-c letters
 * @param {{ enabled: boolean, deps?: unknown[] }} opts
 */
export function useLetterField(ref, { enabled, deps = [] }) {
  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    let letters = [];
    let raf = 0;
    let px = -1e4;
    let py = -1e4;
    let inside = false;

    const measure = () => {
      const previous = new Map(letters.map((l) => [l.el, l]));
      letters = [...root.querySelectorAll(".it-c")].map((el) => {
        const r = el.getBoundingClientRect();
        const old = previous.get(el); // keep letters that are mid-motion where they are
        return { el, glyph: el.firstElementChild, x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, f: old?.f ?? 0, dx: old?.dx ?? 0 };
      });
    };

    const frame = () => {
      raf = 0;
      let moving = false;
      for (const l of letters) {
        const sx = Math.max(l.w * 0.75, 24);
        const nx = (px - l.x) / sx;
        const ny = (py - l.y) / (l.h * 0.6);
        const target = inside ? Math.exp(-(nx * nx) - ny * ny) : 0;
        const pull = inside ? Math.max(-1, Math.min(1, nx)) * target * 6 : 0;
        l.f += (target - l.f) * 0.18;
        l.dx += (pull - l.dx) * 0.18;
        if (Math.abs(target - l.f) > 0.002 || Math.abs(pull - l.dx) > 0.02) moving = true;
        l.glyph.style.setProperty("--f", l.f.toFixed(3));
        l.glyph.style.setProperty("--dx", l.dx.toFixed(2));
      }
      if (moving) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onEnter = () => {
      measure(); // rects read once per visit, never inside the frame loop
      inside = true;
    };
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      if (!letters.length) measure();
      px = e.clientX;
      py = e.clientY;
      inside = true;
      kick();
    };
    const onLeave = () => {
      inside = false;
      kick();
    };
    const onScroll = () => {
      if (inside) measure();
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      for (const l of letters) {
        l.glyph.style.removeProperty("--f");
        l.glyph.style.removeProperty("--dx");
      }
    };
  }, [ref, enabled, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}
