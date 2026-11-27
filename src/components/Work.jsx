import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { usePrefersReducedMotion, useFinePointer } from "../lib/hooks";
import { gsap } from "../lib/gsap";
import { useReveals } from "../lib/motion";
import { projects } from "../data/projects";
import { CloseIcon } from "./Icons";
import { SectionHead, ArrowUpRight, ArrowIcon, Mark } from "./Primitives";
import Lab from "./Lab";
import InteractiveText from "./InteractiveText";

const BASE = import.meta.env.BASE_URL;
const pad = (n) => String(n).padStart(2, "0");
const host = (url) => url.replace("https://", "").replace(/\/$/, "");

function Shot({ s, alt, sizes = "(min-width: 1024px) 60vw, 100vw", eager = false, className = "" }) {
  return (
    <img
      src={`${BASE}projects/${s.src}-800.webp`}
      srcSet={`${BASE}projects/${s.src}-800.webp 800w, ${BASE}projects/${s.src}-1600.webp ${Math.min(1600, s.width)}w`}
      sizes={sizes}
      width={1600}
      height={1000}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`h-full w-full object-cover object-top ${className}`}
    />
  );
}

function ProjectLinks({ p }) {
  const { t } = usePrefs();
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {p.live && (
        <a href={p.live} target="_blank" rel="noopener noreferrer" data-cursor="open" className="btn btn-sm">
          {t("work.live")} <ArrowUpRight />
          <span className="sr-only">({t("work.newTab")})</span>
        </a>
      )}
      <a href={p.repo} target="_blank" rel="noopener noreferrer" data-cursor="open" className="link-line inline-flex items-center gap-1.5 py-1 text-sm font-medium">
        {t("work.repo")} <span className="mono text-xs text-muted">github</span> <ArrowUpRight />
        <span className="sr-only">({t("work.newTab")})</span>
      </a>
    </div>
  );
}

/** Framed preview: tilt toward the pointer, a soft light reflection, and a scrubbed parallax inside. */
function Preview({ p, screen, onOpen, tilt }) {
  const { t, pick } = usePrefs();
  const card = useRef(null);
  const glare = useRef(null);
  const raf = useRef(0);

  const onMove = (e) => {
    if (!tilt) return;
    const el = card.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transform = `rotateX(${(0.5 - y) * 4}deg) rotateY(${(x - 0.5) * 6}deg)`;
      glare.current.style.opacity = "1";
      glare.current.style.background = `radial-gradient(600px circle at ${x * 100}% ${y * 100}%, rgb(255 255 255 / .12), transparent 45%)`;
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(raf.current);
    if (card.current) card.current.style.transform = "";
    if (glare.current) glare.current.style.opacity = "0";
  };

  return (
    <div className="[perspective:1800px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      <button
        ref={card}
        type="button"
        onClick={onOpen}
        data-cursor="view"
        className="p-frame group relative block w-full overflow-hidden border border-line-strong bg-surface text-start shadow-[0_60px_120px_-60px_rgb(0_0_0/0.55)] transition-transform duration-500 ease-out will-change-transform"
      >
        <span className="sr-only">
          {p.name} — {t("work.case")}
        </span>
        <span className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5" aria-hidden="true">
          <span className="mono truncate text-[11px] text-muted" dir="ltr">
            {host(p.live || p.repo)}
          </span>
          <span className="mono shrink-0 text-[11px] text-[var(--pc)]">
            {pad(screen + 1)} / {pad(p.screens.length)}
          </span>
        </span>
        <span className="relative block aspect-[16/10] overflow-hidden bg-bg-2">
          <span className="p-parallax absolute -inset-y-[6%] inset-x-0 block">
            {p.screens.map((s, i) => (
              <span key={s.src} className={`absolute inset-0 transition-opacity duration-700 ${i === screen ? "opacity-100" : "opacity-0"}`} aria-hidden={i !== screen}>
                <Shot s={s} alt={pick(s.alt)} className="transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.025]" />
              </span>
            ))}
          </span>
          <span ref={glare} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300" aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}

function ScreenTabs({ p, screen, setScreen }) {
  const { t, pick } = usePrefs();
  if (p.screens.length < 2) return null;
  return (
    <div role="group" aria-label={`${p.name}: ${t("work.screens")}`} className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
      {p.screens.map((s, i) => (
        <button
          key={s.src}
          type="button"
          aria-pressed={i === screen}
          onClick={() => setScreen(i)}
          className={`group relative min-h-10 text-[0.82rem] transition-colors ${i === screen ? "text-ink" : "text-muted hover:text-ink"}`}
        >
          <span className="mono me-1.5 text-[10px] text-[var(--pc)]">{pad(i + 1)}</span>
          {pick(s.label)}
          <span className={`absolute inset-x-0 bottom-1.5 h-px origin-left bg-[var(--pc)] transition-transform duration-500 rtl:origin-right ${i === screen ? "scale-x-100" : "scale-x-0"}`} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

/** Full case in a native <dialog> (focus trap and Esc for free). It grows out of the button that opened it. */
function CaseDialog({ p, origin, onClose }) {
  const { t, pick } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const closing = useRef(false);

  const close = () => {
    const d = ref.current;
    if (!d || closing.current) return;
    closing.current = true;
    if (reduced || !d.animate) return onClose();
    d.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(24px)" }], { duration: 320, easing: "cubic-bezier(.7,0,.84,0)" }).onfinish = onClose;
  };

  useEffect(() => {
    const d = ref.current;
    d.showModal();
    d.scrollTop = 0;
    if (!reduced && d.animate && origin) {
      const { top, left, right, bottom } = origin;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      d.animate(
        [
          { clipPath: `inset(${top}px ${vw - right}px ${vh - bottom}px ${left}px)` },
          { clipPath: "inset(0px 0px 0px 0px)" },
        ],
        { duration: 800, easing: "cubic-bezier(.76,0,.24,1)" },
      );
      d.querySelector(".case-body")?.animate([{ opacity: 0, transform: "translateY(40px)" }, { opacity: 1, transform: "none" }], {
        duration: 900,
        delay: 350,
        easing: "cubic-bezier(.16,1,.3,1)",
        fill: "backwards",
      });
    }
    const onCancel = (e) => {
      e.preventDefault();
      close();
    };
    d.addEventListener("cancel", onCancel);
    return () => d.removeEventListener("cancel", onCancel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <dialog
      ref={ref}
      aria-labelledby={`case-${p.id}`}
      className="chapter m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-y-auto bg-bg p-0 text-ink"
      style={{ "--c": p.color, "--c-l": p.colorLight }}
    >
      <div className="sticky top-0 z-10 border-b border-line bg-bg">
        <div className="gutter mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4">
          <p className="mono flex items-center gap-2 text-xs text-muted">
            <Mark size={12} className="text-[var(--pc)]" />
            {pick(p.context)}, {p.year}
          </p>
          <button type="button" onClick={close} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium" autoFocus>
            {t("work.close")} <CloseIcon />
          </button>
        </div>
      </div>
      <div className="case-body gutter mx-auto max-w-[1440px] pt-14 pb-24">
        <InteractiveText as="h2" id={`case-${p.id}`} text={p.name} color="var(--pc)" className="display text-[clamp(3rem,10vw,9rem)]" dir="ltr" />
        <p className="headline mt-8 max-w-[34ch] text-[clamp(1.4rem,2.6vw,2.2rem)] leading-snug text-ink-2">{pick(p.summary)}</p>

        <div className="mt-16 grid gap-12 border-t border-line pt-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <h3 className="eyebrow text-[var(--pc)]">{t("work.myPart")}</h3>
            <p className="mt-3 text-lg leading-relaxed">{pick(p.myPart)}</p>
            <h3 className="eyebrow mt-10 text-[var(--pc)]">{t("work.detail")}</h3>
            <p className="mt-3 leading-relaxed text-muted">{pick(p.detail)}</p>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <h3 className="eyebrow text-[var(--pc)]">{t("work.features")}</h3>
            <ul className="mt-3 border-t border-line">
              {pick(p.features).map((f) => (
                <li key={f} className="flex gap-3 border-b border-line py-3 leading-snug">
                  <Mark size={10} className="mt-[0.4em] shrink-0 text-[var(--pc)]" />
                  {f}
                </li>
              ))}
            </ul>
            <h3 className="eyebrow mt-10 text-[var(--pc)]">{t("work.learned")}</h3>
            <ul className="mt-3 space-y-2 text-muted">
              {pick(p.learned).map((l) => (
                <li key={l}>— {l}</li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="mt-12 flex flex-wrap gap-1.5" dir="ltr" aria-label={t("work.stack")}>
          {p.stack.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {p.screens.map((s) => (
            <figure key={s.src} className="m-0">
              <div className="aspect-[16/10] overflow-hidden border border-line">
                <Shot s={s} alt={pick(s.alt)} sizes="(min-width: 768px) 50vw, 100vw" />
              </div>
              <figcaption className="mono mt-2 text-[11px] text-muted">{pick(s.label)}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">{t("work.shots")}</p>
        <div className="mt-12 border-t border-line pt-8">
          <ProjectLinks p={p} />
        </div>
      </div>
    </dialog>
  );
}

function Chapter({ p, index, total, onOpen }) {
  const { t, pick } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const [screen, setScreen] = useState(0);
  const root = useRef(null);
  const flip = index % 2 === 1;

  // Frame opens like a shutter, then the screenshot drifts inside it while scrolling.
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(".p-frame", {
        clipPath: "inset(12% 8% 12% 8%)",
        duration: 1.6,
        ease: "expo.inOut",
        scrollTrigger: { trigger: ".p-frame", start: "top 85%", once: true },
      });
      gsap.fromTo(
        ".p-parallax",
        { yPercent: -5 },
        { yPercent: 5, ease: "none", scrollTrigger: { trigger: ".p-frame", start: "top bottom", end: "bottom top", scrub: true } },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const open = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    onOpen(p, r);
  };

  return (
    <article ref={root} aria-labelledby={`p-${p.id}`} className="chapter gutter mx-auto max-w-[1440px] pt-24 md:pt-36" style={{ "--c": p.color, "--c-l": p.colorLight }}>
      <div className="h-px bg-[var(--pc)]" data-draw aria-hidden="true" />
      <header className="mt-6 grid items-end gap-y-4 md:grid-cols-12 md:gap-x-8">
        <p className="mono flex items-center gap-2.5 text-xs text-muted md:col-span-3" data-reveal>
          <Mark size={12} className="text-[var(--pc)]" />
          <span className="text-ink">{pad(index + 1)}</span>
          <span>/ {pad(total)}</span>
          <span className="ms-2">{p.year}</span>
        </p>
        <InteractiveText as="h3" id={`p-${p.id}`} text={p.name} color="var(--pc)" className="display text-[clamp(3.2rem,9vw,8.4rem)] md:col-span-9" dir="ltr" data-split />
      </header>

      <div className="mt-12 grid gap-y-12 lg:grid-cols-12 lg:gap-x-10">
        <div className={`lg:col-span-7 ${flip ? "lg:order-1" : "lg:order-2"}`}>
          <div className="lg:sticky lg:top-24">
            <Preview p={p} screen={screen} onOpen={open} tilt={fine && !reduced} />
            <ScreenTabs p={p} screen={screen} setScreen={setScreen} />
          </div>
        </div>

        <div className={`lg:col-span-5 ${flip ? "lg:order-2" : "lg:order-1"}`}>
          <p className="eyebrow text-[var(--pc)]" data-reveal>
            {pick(p.context)}
          </p>
          <p className="headline mt-4 text-[clamp(1.35rem,2vw,1.75rem)] leading-snug tracking-tight" data-reveal>
            {pick(p.summary)}
          </p>

          <dl className="mt-10 border-t border-line" data-reveal-group>
            {[
              ["work.role", pick(p.role)],
              ["work.challenge", pick(p.challenge)],
              ["work.approach", pick(p.approach)],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <dt className="eyebrow pt-1">{t(k)}</dt>
                <dd className="leading-relaxed text-ink-2">{v}</dd>
              </div>
            ))}
            <div className="grid gap-2 border-b border-line py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="eyebrow pt-1">{t("work.learned")}</dt>
              <dd>
                <ul className="space-y-1.5 text-ink-2">
                  {pick(p.learned).map((l) => (
                    <li key={l} className="flex gap-2.5 leading-snug">
                      <span className="mt-[0.55em] h-1 w-1 shrink-0 bg-[var(--pc)]" aria-hidden="true" />
                      {l}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <ul className="mt-8 flex flex-wrap gap-1.5" dir="ltr" aria-label={t("work.stack")} data-reveal>
            {p.stack.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>

          <div className="mt-10 space-y-6" data-reveal>
            <button type="button" onClick={open} data-cursor="view" className="btn btn-solid w-full justify-between sm:w-auto">
              <InteractiveText text={t("work.case")} variant="cta" /> <ArrowIcon />
            </button>
            <ProjectLinks p={p} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Work() {
  const { t, lang } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const root = useRef(null);
  const [opened, setOpened] = useState(null);
  useReveals(root, { reduced, deps: [lang] });

  return (
    <section id="work" ref={root} aria-labelledby="work-title" className="relative py-28 md:py-40">
      <SectionHead id="work-title" eyebrow={t("work.eyebrow")} title={t("work.title")} intro={t("work.intro")} />
      {projects.map((p, i) => (
        <Chapter key={p.id} p={p} index={i} total={projects.length} onOpen={(proj, origin) => setOpened({ p: proj, origin })} />
      ))}
      <Lab />
      {opened && <CaseDialog p={opened.p} origin={opened.origin} onClose={() => setOpened(null)} />}
    </section>
  );
}
