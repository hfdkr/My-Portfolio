import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { useIsMobile, usePrefersReducedMotion, useFinePointer, hasWebGL, useLocalTime, LOCALES } from "../lib/hooks";
import { scrollToSection } from "../lib/ui";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { useMagnetic, useLetterField } from "../lib/motion";
import { on } from "../lib/events";
import { profile } from "../data/profile";
import { LiveDot, ArrowIcon } from "./Primitives";
import InteractiveText, { Marked } from "./InteractiveText";

/** The same motif drawn flat — shown before the 3D arrives, and instead of it without WebGL. */
function ZelligeFallback() {
  return (
    <svg className="absolute inset-0 h-full w-full text-ink/[0.06]" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="khatam" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
          <path
            transform="translate(28 28) scale(2.4)"
            d="M0-11 3.2-7.7 7.8-7.8 7.7-3.2 11 0 7.7 3.2 7.8 7.8 3.2 7.7 0 11-3.2 7.7-7.8 7.8-7.7 3.2-11 0-7.7-3.2-7.8-7.8-3.2-7.7Z"
            fill="currentColor"
          />
        </pattern>
        <radialGradient id="khatam-fade" cx="50%" cy="40%" r="65%">
          <stop offset="0" stopColor="white" />
          <stop offset="1" stopColor="black" />
        </radialGradient>
        <mask id="khatam-mask">
          <rect width="100%" height="100%" fill="url(#khatam-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#khatam)" mask="url(#khatam-mask)" />
    </svg>
  );
}

function useZellige(canvasRef, { theme, mobile, reduced }) {
  const api = useRef(null);
  const [state, setState] = useState("idle"); // idle → ready | failed
  const [tiles, setTiles] = useState(0);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    // No WebGL, a low-memory device or Data Saver → the flat drawing is the experience.
    const nav = window.navigator;
    const lowEnd = (nav.deviceMemory && nav.deviceMemory <= 2) || (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2);
    if (!hasWebGL() || lowEnd || nav.connection?.saveData) {
      setState("failed");
      return;
    }
    let cancelled = false;
    // Wait for the page to be painted and idle: the text is the LCP, the 3D is a bonus.
    const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 300));
    const cancelIdle = window.cancelIdleCallback || window.clearTimeout;
    const handle = idle(
      () => {
        import("../three/zellige.js")
          .then(({ createZellige }) => {
            if (cancelled || !canvasRef.current) return;
            api.current = createZellige(canvasRef.current, {
              theme: themeRef.current,
              mobile,
              reduced,
              onFirstFrame: () => !cancelled && setState("ready"),
              onContextLost: () => !cancelled && setState("failed"),
            });
            setTiles(api.current.tiles);
          })
          .catch(() => !cancelled && setState("failed"));
      },
      { timeout: 1500 },
    );
    return () => {
      cancelled = true;
      cancelIdle(handle);
      api.current?.dispose();
      api.current = null;
      setState("idle");
    };
  }, [canvasRef, mobile, reduced]);

  useEffect(() => {
    api.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => on("wave", () => api.current?.wave()), []);

  return { api, state, tiles };
}

export default function Hero() {
  const { t, lang, theme, pick } = usePrefs();
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const time = useLocalTime(profile.timeZone, LOCALES[lang]);

  const root = useRef(null);
  const canvas = useRef(null);
  const cta = useRef(null);
  const name = useRef(null);
  const { api, state, tiles } = useZellige(canvas, { theme, mobile, reduced });
  useMagnetic(cta, { enabled: fine && !reduced, strength: 0.28 });
  useLetterField(name, { enabled: fine && !reduced, deps: [lang] });

  const lines = lang === "ar" ? profile.nameLines.ar : profile.nameLines.latin;

  // Entrance: the name rises through its mask, letter by letter, then the details settle in.
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });
      tl.from(".hero-name .it-c", { yPercent: 118, rotate: lang === "ar" ? 0 : 6, duration: 1.4, stagger: 0.045 }, 0)
        .from(".hero-meta", { autoAlpha: 0, y: 18, duration: 1.1, stagger: 0.09 }, 0.45)
        .from(".hero-rule", { scaleX: 0, duration: 1.6, ease: "expo.inOut" }, 0.2)
        // the masks only exist for the entrance — afterwards letters may rise freely on hover
        .set(".hero-name .line-mask", { overflow: "visible" });
    }, root);
    return () => ctx.revert();
  }, [reduced, lang]);

  // Scroll: hand the progress to the 3D (tiles peel away) and let the type drift up.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => api.current?.setScroll(self.progress),
      });
      if (!reduced) {
        gsap.to(".hero-name", {
          yPercent: -22,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-fade", {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "60% top", scrub: true },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [reduced, api]);

  return (
    <section id="top" ref={root} aria-labelledby="hero-title" className="relative h-[100svh] min-h-[620px] overflow-hidden">
      {/* stage */}
      <div className="absolute inset-0" aria-hidden="true">
        <ZelligeFallback />
        <canvas
          ref={canvas}
          className={`absolute inset-0 h-full w-full transition-opacity duration-[1400ms] ease-out ${state === "ready" ? "opacity-100" : "opacity-0"}`}
        />
        {/* scrim: keeps the type readable over any tile */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgb(var(--scrim)) 0%, rgb(var(--scrim) / 0.82) 24%, rgb(var(--scrim) / 0) 62%), linear-gradient(to bottom, rgb(var(--scrim) / 0.7), rgb(var(--scrim) / 0) 22%)",
          }}
        />
      </div>

      <div className="gutter relative mx-auto flex h-full max-w-[1440px] flex-col pt-24 pb-8 sm:pb-10">
        {/* top meta */}
        <div className="hero-fade flex items-start justify-between gap-6">
          <p className="hero-meta inline-flex items-center gap-2.5 text-[0.8rem] text-ink-2">
            <LiveDot />
            {t("status.text")}
          </p>
          <p className="hero-meta mono hidden text-end text-[11px] leading-relaxed text-muted md:block">
            <span className="block text-ink-2">{t("hero.fig")}</span>
            {state === "ready" && <span className="fade-in block">{t("hero.figTiles", { n: tiles })}</span>}
            {state === "ready" && fine && <span className="fade-in block text-accent">↳ {t("hero.figHint")}</span>}
          </p>
        </div>

        {/* name */}
        <h1 ref={name} id="hero-title" className="hero-name display mt-auto text-ink">
          <span className="sr-only">{profile.name}</span>
          <span aria-hidden="true" className="block">
            <span className="line-mask block whitespace-nowrap text-[clamp(3.6rem,19vw,14rem)] md:text-[clamp(3.6rem,14vw,14rem)] leading-[0.88]"><InteractiveText text={lines[0]} variant="hero" /></span>
            <span className="line-mask block whitespace-nowrap ps-[0.3em] text-[clamp(3.6rem,19vw,14rem)] md:text-[clamp(3.6rem,14vw,14rem)] leading-[0.88] md:ps-[1.15em]">
              <InteractiveText text={`*${lines[1]}*`} variant="hero" emClassName="font-[290] text-accent" />
            </span>
          </span>
        </h1>

        <div className="hero-rule mt-8 h-px origin-left bg-line-strong rtl:origin-right" aria-hidden="true" />

        {/* intro row */}
        <div className="hero-fade mt-6 grid gap-6 md:grid-cols-12 md:items-end md:gap-8">
          <p className="hero-meta eyebrow md:col-span-3">
            <span className="block text-ink-2">{t("hero.role1")}</span>
            <span className="mt-1 block">{t("hero.role2")}</span>
          </p>
          <p className="hero-meta max-w-[40ch] text-[1.05rem] leading-relaxed text-ink-2 md:col-span-5 md:text-lg">
            <Marked text={t("hero.intro")} className="text-ink" />
          </p>
          <div className="hero-meta flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-4 md:justify-end">
            <a
              ref={cta}
              href="#work"
              data-cursor="view"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("work");
              }}
              className="btn btn-solid"
            >
              <InteractiveText text={t("hero.ctaWork")} variant="cta" />
              <ArrowIcon />
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact");
              }}
              className="link-line py-1 text-sm font-medium"
            >
              {t("hero.ctaContact")}
            </a>
          </div>
        </div>

        {/* bottom bar */}
        <div className="hero-fade hero-meta mono mt-8 flex items-center justify-between text-[11px] text-muted">
          <span dir="auto" className="tnum">
            {pick(profile.facts[0].value)} · {t("hero.local")} {time}
          </span>
          <span className="flex items-center gap-3">
            {t("hero.scroll")}
            <span className="relative block h-9 w-px overflow-hidden bg-line-strong" aria-hidden="true">
              <span className="scroll-cue absolute inset-x-0 top-0 h-3 bg-accent" />
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
