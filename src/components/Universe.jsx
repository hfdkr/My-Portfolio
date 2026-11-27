import { Suspense, lazy, useEffect, useLayoutEffect, useRef } from "react";
import { usePrefs } from "../lib/preferences";
import { useIsMobile, useNearViewport, usePrefersReducedMotion, hasWebGL, useLocalTime, LOCALES } from "../lib/hooks";
import { scrollToSection } from "../lib/ui";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { scene } from "../lib/store";
import { profile } from "../data/profile";
import StackFallback from "./StackFallback";
import { ExternalIcon } from "./Icons";

const StackScene = lazy(() => import("../three/StackScene"));

const LAYER_COLORS = ["var(--accent)", "var(--cyan)", "var(--amber)"];

/** Letters that widen under the pointer (Archivo's width axis) — the name reacts like the 3D does. */
function SplitName({ text, lang }) {
  if (lang === "ar") return <span className="char inline-block">{text}</span>;
  return [...text.toUpperCase()].map((ch, i) => (
    <span
      key={i}
      className="char inline-block transition-[font-stretch] duration-500 ease-[var(--ease-out-expo)] hover:[font-stretch:62%]"
      style={{ fontStretch: "125%" }}
    >
      {ch}
    </span>
  ));
}

export default function Universe() {
  const { t, lang, theme, dir, pick } = usePrefs();
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const webgl = hasWebGL();
  const time = useLocalTime(profile.timeZone, LOCALES[lang]);

  const root = useRef(null);
  const stage = useRef(null);
  const hero = useRef(null);
  const steps = useRef([]);
  const facts = useRef(null);
  const near = useNearViewport(root, "100px");

  const lines = lang === "ar" ? profile.nameLines.ar : profile.nameLines.latin;

  // Cinematic but short entrance (≈1.2 s). Content is in the DOM and readable from the start.
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(stage.current, { opacity: 0, scale: 1.08, duration: 1.6 }, 0)
        .from(".hero-line .char", { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.035 }, 0.05)
        .from(".hero-meta", { y: 18, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.35);
    }, hero);
    return () => ctx.revert();
  }, [reduced, lang]);

  // Scroll choreography for the 3D stack.
  useLayoutEffect(() => {
    const st = scene.stack;
    st.explode = 0;
    st.focus = -1;
    st.camera = 0;
    st.spin = 0;
    const triggers = [];
    const narrative = root.current.querySelector("[data-narrative]");

    triggers.push(
      ScrollTrigger.create({
        trigger: narrative,
        start: "top bottom",
        end: "top 20%",
        scrub: true,
        onUpdate: (s) => {
          st.camera = s.progress;
        },
      }),
      ScrollTrigger.create({
        trigger: narrative,
        start: "top 70%",
        end: "bottom 60%",
        scrub: true,
        onUpdate: (s) => {
          st.explode = Math.min(1, s.progress * 1.6);
          st.spin = s.progress * 0.9 * (dir === "rtl" ? -1 : 1);
        },
      }),
    );
    steps.current.forEach((el, i) => {
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          toggleClass: { targets: el, className: "is-active" },
          onToggle: (s) => {
            if (s.isActive) st.focus = i;
            else if (st.focus === i) st.focus = -1;
          },
        }),
      );
    });
    // Dim the scene behind the facts block.
    if (facts.current && stage.current) {
      triggers.push(
        ScrollTrigger.create({
          trigger: facts.current,
          start: "top 85%",
          end: "top 30%",
          scrub: true,
          onUpdate: (s) => {
            stage.current.style.opacity = String(1 - s.progress * 0.75);
          },
        }),
      );
    }
    // Hero text drifts up and fades as the stack opens.
    if (!reduced) {
      triggers.push(
        gsap.to(".hero-depth", {
          yPercent: -18,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true },
        }).scrollTrigger,
      );
    }
    return () => triggers.forEach((tr) => tr?.kill());
  }, [dir, reduced, lang]);

  // Pointer parallax on the two name lines (depth).
  useEffect(() => {
    if (reduced || mobile) return;
    const a = hero.current?.querySelector("[data-depth='1']");
    const b = hero.current?.querySelector("[data-depth='2']");
    let raf = 0;
    const loop = () => {
      const { x, y } = scene.pointer;
      if (a) a.style.transform = `translate3d(${x * -18}px, ${y * 10}px, 0)`;
      if (b) b.style.transform = `translate3d(${x * 26}px, ${y * -14}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, mobile]);

  const layers = [0, 1, 2].map((i) => ({
    name: t(`about.l${i + 1}.name`),
    state: t(`about.l${i + 1}.state`),
    body: t(`about.l${i + 1}.body`),
    color: LAYER_COLORS[i],
  }));

  return (
    <div ref={root} className="relative">
      {/* 3D stage: sticky behind hero + about */}
      <div ref={stage} className="sticky top-0 h-[100svh] w-full overflow-hidden" data-cursor={webgl ? "drag" : undefined}>
        {/* atmosphere */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              theme === "dark"
                ? "radial-gradient(60% 50% at 50% 45%, rgb(91 77 255 / .22), transparent 70%), radial-gradient(40% 35% at 80% 80%, rgb(82 224 255 / .08), transparent 70%)"
                : "radial-gradient(60% 50% at 50% 42%, #ffffff, transparent 72%), radial-gradient(40% 35% at 85% 85%, rgb(74 61 208 / .08), transparent 70%)",
          }}
        />
        <div className="grid-floor pointer-events-none absolute inset-x-0 bottom-0 h-[45%] [mask-image:linear-gradient(to_top,black,transparent)] [transform:perspective(600px)_rotateX(60deg)] origin-bottom" aria-hidden="true" />
        {webgl ? (
          <Suspense fallback={<StackFallback compact={mobile} />}>
            <StackScene theme={theme} mobile={mobile} active={near} reduced={reduced} side={dir === "rtl" ? -1 : 1} label={t("hero.sceneLabel")} />
          </Suspense>
        ) : (
          <StackFallback compact={mobile} caption={t("hero.fallback")} />
        )}
      </div>

      <div className="relative -mt-[100svh]">
        {/* ---------------------------------- HERO ---------------------------------- */}
        <section id="top" ref={hero} aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col px-5 pt-24 pb-28 sm:px-8 md:pb-28">
          <div className="hero-depth pointer-events-none relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
            <div className="hero-meta flex justify-end">
              <p className="mono text-end text-xs leading-relaxed text-muted sm:text-[13px]">
                <span className="block text-ink">{t("hero.role1")}</span>
                <span className="block">{t("hero.role2")}</span>
                <span className="mt-1 block tnum" dir="auto">
                  {pick(profile.facts[0].value)} · {time}
                </span>
              </p>
            </div>

            <h1 id="hero-title" className="display pointer-events-auto mt-auto select-none text-ink md:mt-0">
              <span className="sr-only">{profile.name}</span>
              <span aria-hidden="true" className="flex flex-col">
                <span data-depth="1" className="hero-line block overflow-hidden pb-[0.06em] text-[clamp(3.4rem,13.5vw,13rem)]">
                  <SplitName text={lines[0]} lang={lang} />
                </span>
                <span
                  data-depth="2"
                  className="hero-line block self-end overflow-hidden pb-[0.06em] text-[clamp(2.6rem,10.4vw,10rem)] md:mt-[14vh]"
                >
                  <SplitName text={lines[1]} lang={lang} />
                </span>
              </span>
            </h1>
          </div>

          <div className="relative mx-auto mt-8 grid w-full max-w-[1440px] gap-6 md:mt-6 md:grid-cols-12">
            <div className="hero-meta md:col-span-5 lg:col-span-4">
              <p className="max-w-[46ch] text-[0.98rem] leading-relaxed text-ink/90">{t("hero.intro")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#work"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("work");
                  }}
                  className="group relative inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-full bg-accent px-6 text-sm font-bold text-accent-ink shadow-[0_10px_40px_-10px_var(--accent)]"
                >
                  <span className="relative z-10">{t("hero.ctaWork")}</span>
                  <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-accent-ink transition-transform duration-500 group-hover:scale-[2.5]" aria-hidden="true" />
                </a>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("contact");
                  }}
                  className="panel inline-flex min-h-12 items-center rounded-full px-6 text-sm font-bold text-ink transition-colors hover:text-accent"
                >
                  {t("hero.ctaContact")}
                </a>
              </div>
            </div>
          </div>

          <p className="hero-meta mono pointer-events-none absolute bottom-10 start-1/2 hidden -translate-x-1/2 items-center gap-3 text-xs text-muted md:flex rtl:translate-x-1/2">
            <span className="relative block h-8 w-px overflow-hidden bg-line" aria-hidden="true">
              <span className="absolute inset-x-0 top-0 h-3 animate-[float-y_1.6s_ease-in-out_infinite] bg-accent" />
            </span>
            {t("hero.scroll")}
          </p>
        </section>

        {/* ---------------------------------- ABOUT --------------------------------- */}
        <section id="about" aria-labelledby="about-title" className="relative px-5 sm:px-8">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-xl pt-[10vh] md:pt-[18vh]">
              <h2 id="about-title" className="display text-[clamp(2.2rem,5.5vw,4.6rem)]">
                {t("about.title")}
              </h2>
              <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">{t("about.intro")}</p>
            </div>

            <ol data-narrative className="mt-[30vh] md:mt-[12vh]">
              {layers.map((l, i) => (
                <li
                  key={i}
                  ref={(el) => (steps.current[i] = el)}
                  className="group flex min-h-[78svh] items-center md:min-h-[90vh]"
                >
                  <article
                    className="panel hud w-full max-w-md rounded-2xl p-6 transition-[transform,box-shadow,border-color] duration-700 ease-[var(--ease-out-expo)] group-[.is-active]:translate-x-0 group-[.is-active]:border-line-strong group-[.is-active]:shadow-[0_0_0_1px_var(--accent-glow),0_30px_80px_-30px_var(--accent-glow)] md:-translate-x-6 md:p-8 rtl:md:translate-x-6"
                  >
                    <p className="mono flex items-center gap-3 text-xs text-muted">
                      <span className="h-2.5 w-2.5 rounded-full shadow-[0_0_14px_currentColor]" style={{ background: l.color, color: l.color }} aria-hidden="true" />
                      {lang === "ar" ? `الطبقة ${i + 1} / 3` : lang === "fr" ? `Couche ${i + 1} / 3` : `Layer ${i + 1} / 3`}
                    </p>
                    <h3 className="display mt-4 text-[clamp(2rem,4vw,3.2rem)]" style={{ color: l.color }}>
                      {l.name}
                    </h3>
                    <p className="mt-2 font-semibold">{l.state}</p>
                    <p className="mt-4 leading-relaxed text-muted">{l.body}</p>
                  </article>
                </li>
              ))}
            </ol>

            <div ref={facts} className="grid gap-10 pt-[10vh] pb-[16vh] md:grid-cols-12">
              <div className="space-y-5 text-lg leading-relaxed md:col-span-6">
                <p>{t("about.p1")}</p>
                <p className="text-muted">{t("about.p2")}</p>
              </div>
              <dl className="panel self-start rounded-2xl p-2 md:col-span-5 md:col-start-8">
                {profile.facts.map((f) => (
                  <div key={f.label} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-line px-4 py-3.5 text-sm last:border-b-0">
                    <dt className="text-muted">{t(f.label)}</dt>
                    <dd className="font-medium">
                      {f.href ? (
                        <a href={f.href} target="_blank" rel="noopener noreferrer" className="link-line inline-flex items-baseline gap-1">
                          {pick(f.value)}
                          <ExternalIcon className="translate-y-0.5 rtl:-scale-x-100" />
                          <span className="sr-only">({t("work.newTab")})</span>
                        </a>
                      ) : (
                        pick(f.value)
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
