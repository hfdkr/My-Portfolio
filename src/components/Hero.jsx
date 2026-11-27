import { useLayoutEffect, useRef } from "react";
import { usePrefs } from "../lib/preferences";
import { usePrefersReducedMotion, useFinePointer, useLocalTime, LOCALES } from "../lib/hooks";
import { scrollToSection } from "../lib/ui";
import { gsap } from "../lib/gsap";
import { useMagnetic, useLetterField } from "../lib/motion";
import { profile } from "../data/profile";
import { LiveDot, ArrowIcon } from "./Primitives";
import InteractiveText, { Marked } from "./InteractiveText";
import { cvUrl } from "./Resume";
import { cvFile } from "../data/resume";

// The liquid itself lives in <LiquidBackground> (fixed, behind the whole page);
// the hero is pure typography composed over its strongest moment.
export default function Hero() {
  const { t, lang, pick } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const time = useLocalTime(profile.timeZone, LOCALES[lang]);

  const root = useRef(null);
  const cta = useRef(null);
  const name = useRef(null);
  useMagnetic(cta, { enabled: fine && !reduced, strength: 0.28 });
  useLetterField(name, { enabled: fine && !reduced, deps: [lang] });

  const ar = lang === "ar";
  const first = ar ? profile.nameLines.ar[0] : profile.nameLines.latin[0].toUpperCase();
  const last = ar ? profile.nameLines.ar[1] : profile.nameLines.latin[1];

  // Entrance: the name rises through its masks letter by letter, then the details settle.
  // Content is in the DOM and usable from the first frame — nothing waits for this.
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.1 })
        .from(".hero-name .it-c", { yPercent: 118, rotate: ar ? 0 : 7, duration: 1.4, stagger: 0.045 }, 0)
        .from(".hero-meta", { autoAlpha: 0, y: 18, duration: 1.1, stagger: 0.08 }, 0.45)
        // the intro only rises — never invisible, so it counts as painted immediately (LCP)
        .from(".hero-intro", { y: 18, duration: 1.1 }, 0.45)
        .from(".hero-rule", { scaleX: 0, duration: 1.6, ease: "expo.inOut" }, 0.2)
        // the masks only exist for the entrance — afterwards letters may rise freely on hover
        .set(".hero-name .line-mask", { overflow: "visible" });
    }, root);
    return () => ctx.revert();
  }, [reduced, lang, ar]);

  // Leaving: the name drifts up slower than the page, the details fade.
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.to(".hero-name", { yPercent: -24, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-fade", { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "60% top", scrub: true } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="top" ref={root} aria-labelledby="hero-title" className="relative h-[100svh] min-h-[640px] overflow-hidden">
      {/* scrim: keeps type readable wherever the metal is brightest */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgb(var(--scrim)) 0%, rgb(var(--scrim) / 0.78) 22%, rgb(var(--scrim) / 0) 58%), linear-gradient(to bottom, rgb(var(--scrim) / 0.88), rgb(var(--scrim) / 0.4) 18%, rgb(var(--scrim) / 0) 30%)",
        }}
      />

      {/* a real coordinate on the edge — the kind of detail you only see if you look */}
      <p className="hero-meta mono pointer-events-none absolute end-5 top-1/2 hidden origin-center translate-x-1/2 rotate-90 text-[10px] tracking-[0.3em] text-muted lg:block rtl:-translate-x-1/2" aria-hidden="true">
        AGADIR · 30.42°N 9.60°W
      </p>

      <div className="gutter relative mx-auto flex h-full max-w-[1440px] flex-col pt-24 pb-8 sm:pb-10">
        <div className="hero-fade flex items-start justify-between gap-6">
          <p className="hero-meta inline-flex items-center gap-2.5 text-[0.8rem] text-ink-2">
            <LiveDot />
            {t("status.text")}
          </p>
          <p className="hero-meta mono hidden text-end text-[11px] leading-relaxed text-muted [text-shadow:0_0_14px_rgb(var(--scrim)),0_0_4px_rgb(var(--scrim))] md:block">
            <span className="block text-ink-2">{t("hero.fig")}</span>
            <span className="block">{t("hero.figTech")}</span>
            {fine && <span className="block text-accent">↳ {t("hero.figHint")}</span>}
          </p>
        </div>

        <h1 ref={name} id="hero-title" className="hero-name display mt-auto text-ink">
          <span className="sr-only">{profile.name}</span>
          <span aria-hidden="true" className="block">
            <span className="line-mask block whitespace-nowrap text-[clamp(3.8rem,20vw,15rem)] leading-[0.86] md:text-[clamp(3.8rem,15vw,15rem)]">
              <InteractiveText text={first} variant="hero" />
            </span>
            <span className="line-mask mt-[0.1em] block whitespace-nowrap ps-[0.25em] text-[clamp(3.6rem,18.5vw,14rem)] leading-[0.95] md:mt-0 md:ps-[1.1em] md:text-[clamp(3.6rem,13.5vw,14rem)]">
              <InteractiveText text={`*${last}*`} variant="hero" emClassName="" />
            </span>
          </span>
        </h1>

        <div className="hero-rule mt-8 h-px origin-left bg-line-strong rtl:origin-right" aria-hidden="true" />

        <div className="hero-fade mt-6 grid gap-6 md:grid-cols-12 md:items-end md:gap-8">
          <p className="hero-meta eyebrow md:col-span-3">
            <span className="block text-ink-2">{t("hero.role1")}</span>
            <span className="mt-1 block">{t("hero.role2")}</span>
          </p>
          <p className="hero-intro max-w-[40ch] text-[1.05rem] leading-relaxed text-ink-2 md:col-span-5 md:text-lg">
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
            <a href={cvUrl} download={cvFile.downloadName} className="link-line inline-flex items-center gap-1.5 py-1 text-sm font-medium">
              {t("hero.cv")} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

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
