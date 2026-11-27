import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { useIsMobile, usePrefersReducedMotion } from "../lib/hooks";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { projects } from "../data/projects";
import { ExternalIcon, CloseIcon } from "./Icons";
import SectionTitle from "./SectionTitle";

const BASE = import.meta.env.BASE_URL;

// Project colours are bright neons; on the light theme text uses the darker variant.
const textColor = (p) => (document.documentElement.dataset.theme === "dark" ? p.color : p.colorLight || p.color);

function Shot({ s, eager, className = "", alt }) {
  return (
    <img
      src={`${BASE}projects/${s.src}-800.webp`}
      srcSet={`${BASE}projects/${s.src}-800.webp 800w, ${BASE}projects/${s.src}-1600.webp ${Math.min(1600, s.width)}w`}
      sizes="(min-width: 1024px) 58vw, 100vw"
      width={1600}
      height={1000}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`h-full w-full object-cover object-top ${className}`}
    />
  );
}

function Links({ p, small }) {
  const { t } = usePrefs();
  const cls = small ? "min-h-10 px-4 text-xs" : "min-h-11 px-5 text-sm";
  return (
    <div className="flex flex-wrap gap-2.5">
      {p.live && (
        <a
          href={p.live}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 rounded-full font-bold text-[#06071a] ${cls}`}
          style={{ background: p.color, boxShadow: `0 10px 30px -12px ${p.color}` }}
        >
          {t("work.live")} <ExternalIcon className="rtl:-scale-x-100" />
          <span className="sr-only">({t("work.newTab")})</span>
        </a>
      )}
      <a href={p.repo} target="_blank" rel="noopener noreferrer" className={`panel inline-flex items-center gap-2 rounded-full font-bold ${cls}`}>
        {t("work.repo")} <ExternalIcon className="rtl:-scale-x-100" />
        <span className="sr-only">({t("work.newTab")})</span>
      </a>
    </div>
  );
}

/** Preview with a 3D tilt that follows the pointer, plus a moving light reflection. */
function TiltPreview({ p, screen, onOpen, enabled, eager }) {
  const { pick } = usePrefs();
  const wrap = useRef(null);
  const card = useRef(null);
  const glare = useRef(null);

  const onMove = (e) => {
    if (!enabled || !card.current) return;
    const r = wrap.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.current.style.transform = `rotateX(${(0.5 - y) * 9}deg) rotateY(${(x - 0.5) * 13}deg) translateZ(0)`;
    if (glare.current) glare.current.style.background = `radial-gradient(500px circle at ${x * 100}% ${y * 100}%, rgb(255 255 255 / .18), transparent 45%)`;
  };
  const onLeave = () => {
    if (card.current) card.current.style.transform = "";
    if (glare.current) glare.current.style.background = "transparent";
  };

  return (
    <div ref={wrap} onPointerMove={onMove} onPointerLeave={onLeave} className="[perspective:1400px]">
      <button
        type="button"
        ref={card}
        onClick={onOpen}
        data-cursor="view"
        className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 text-start shadow-[0_50px_100px_-40px_rgba(0,0,0,.75)] transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        style={{ boxShadow: `0 50px 100px -40px rgba(0,0,0,.7), 0 0 0 1px ${p.color}33, 0 30px 80px -50px ${p.color}` }}
      >
        <span className="sr-only">{p.name}</span>
        {/* browser chrome */}
        <span className="flex items-center gap-1.5 border-b border-white/10 bg-[#0d0f25] px-3 py-2" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="mono ms-3 truncate text-[10px] text-white/45" dir="ltr">
            {(p.live || p.repo).replace("https://", "").replace(/\/$/, "")}
          </span>
        </span>
        <span className="relative block aspect-[16/10] bg-[#0b0d22]">
          {p.screens.map((s, i) => (
            <span key={s.src} className={`absolute inset-0 transition-opacity duration-500 ${i === screen ? "opacity-100" : "opacity-0"}`} aria-hidden={i !== screen}>
              <Shot s={s} eager={eager && i === 0} alt={pick(s.alt)} className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]" />
            </span>
          ))}
          <span ref={glare} className="pointer-events-none absolute inset-0" aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}

function ScreenTabs({ p, screen, setScreen }) {
  const { t, pick } = usePrefs();
  if (p.screens.length < 2) return null;
  return (
    <div role="group" aria-label={`${p.name}: ${t("work.screens")}`} className="flex flex-wrap gap-1.5">
      {p.screens.map((s, i) => (
        <button
          key={s.src}
          type="button"
          aria-pressed={i === screen}
          onClick={() => setScreen(i)}
          className={`min-h-9 rounded-full border px-3 text-xs transition-colors ${
            i === screen ? "border-transparent text-[#06071a]" : "border-line text-muted hover:text-ink"
          }`}
          style={i === screen ? { background: p.color } : undefined}
        >
          {pick(s.label)}
        </button>
      ))}
    </div>
  );
}

/** Full project details in a native <dialog> (focus trap + Esc for free). */
function Details({ p, onClose }) {
  const { t, pick } = usePrefs();
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.showModal();
    const onCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    d.addEventListener("cancel", onCancel);
    return () => d.removeEventListener("cancel", onCancel);
  }, [onClose]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={`d-${p.id}`}
      className="m-auto max-h-[90dvh] w-[min(960px,94vw)] overflow-y-auto rounded-3xl border border-line bg-surface-solid p-0 text-ink backdrop:bg-[#03040f]/60 backdrop:backdrop-blur-sm"
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="relative p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-40" style={{ background: `radial-gradient(60% 100% at 30% 0%, ${p.color}, transparent)` }} aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-6">
          <div>
            <p className="mono text-xs text-muted">
              {pick(p.context)}, {p.year}
            </p>
            <h3 id={`d-${p.id}`} className="display mt-2 text-[clamp(2rem,5vw,3.6rem)]" dir="ltr">
              {p.name}
            </h3>
          </div>
          <button type="button" onClick={onClose} aria-label={t("work.close")} className="panel inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
            <CloseIcon />
          </button>
        </div>
        <p className="relative mt-6 max-w-[65ch] text-lg leading-relaxed">{pick(p.summary)}</p>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h4 className="mono text-xs" style={{ color: textColor(p) }}>{t("work.myPart")}</h4>
            <p className="mt-2 leading-relaxed">{pick(p.myPart)}</p>
            <h4 className="mono mt-6 text-xs" style={{ color: textColor(p) }}>{t("work.detail")}</h4>
            <p className="mt-2 leading-relaxed text-muted">{pick(p.detail)}</p>
          </div>
          <div>
            <h4 className="mono text-xs" style={{ color: textColor(p) }}>{t("work.features")}</h4>
            <ul className="mt-2">
              {pick(p.features).map((f) => (
                <li key={f} className="flex gap-3 border-b border-line py-2.5 text-[0.95rem] leading-snug last:border-b-0">
                  <span className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: p.color }} aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="mt-8 flex flex-wrap gap-1.5" dir="ltr">
          {p.stack.map((s) => (
            <li key={s} className="mono rounded-md border border-line px-2 py-1 text-xs">{s}</li>
          ))}
        </ul>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {p.screens.map((s) => (
            <figure key={s.src} className="m-0 overflow-hidden rounded-xl border border-line">
              <div className="aspect-[16/10]">
                <Shot s={s} alt={pick(s.alt)} />
              </div>
              <figcaption className="px-3 py-2 text-xs text-muted">{pick(s.label)}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">{t("work.shots")}</p>
        <div className="mt-8">
          <Links p={p} />
        </div>
      </div>
    </dialog>
  );
}

/* --------------------------- Desktop: pinned stage -------------------------- */

function Pinned({ openDetails }) {
  const { t, pick, dir } = usePrefs();
  const outer = useRef(null);
  const [index, setIndex] = useState(0);
  const [screens, setScreens] = useState(() => projects.map(() => 0));
  const [progress, setProgress] = useState(0);
  const st = useRef(null);
  const prev = useRef(0);

  useLayoutEffect(() => {
    const n = projects.length;
    st.current = ScrollTrigger.create({
      trigger: outer.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        setProgress(s.progress);
        setIndex(Math.min(n - 1, Math.floor(s.progress * n * 0.999)));
      },
    });
    return () => st.current?.kill();
  }, []);

  // Transition between projects: preview wipes in, text rises in.
  useLayoutEffect(() => {
    if (prev.current === index) return;
    const down = index > prev.current;
    prev.current = index;
    const el = outer.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `[data-p="${index}"] .p-preview`,
        { clipPath: down ? "inset(100% 0% 0% 0% round 16px)" : "inset(0% 0% 100% 0% round 16px)", scale: 1.06 },
        { clipPath: "inset(0% 0% 0% 0% round 16px)", scale: 1, duration: 1, ease: "expo.out" },
      );
      gsap.fromTo(`[data-p="${index}"] [data-anim]`, { y: down ? 40 : -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: "expo.out" });
      gsap.fromTo(`[data-p="${index}"] .p-ghost`, { xPercent: (dir === "rtl" ? -1 : 1) * 10, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.2, ease: "expo.out" });
    }, el);
    return () => ctx.revert();
  }, [index, dir]);

  const goTo = (i) => {
    const s = st.current;
    if (!s) return;
    const n = projects.length;
    const y = s.start + ((i + 0.5) / n) * (s.end - s.start);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  };

  const p = projects[index];
  const local = (progress * projects.length) % 1;

  return (
    <div ref={outer} style={{ height: `${projects.length * 110}vh` }} className="relative">
      {/* Screen readers get every project in order. */}
      <ul className="sr-only">
        {projects.map((x) => (
          <li key={x.id}>
            <h3>{x.name}</h3>
            <p>{pick(x.summary)}</p>
          </li>
        ))}
      </ul>

      <div className="sticky top-0 h-[100svh] overflow-hidden" aria-hidden="false">
        {/* environment: colour, grid floor, ghost name */}
        <div className="absolute inset-0 transition-[background] duration-1000" style={{ background: `radial-gradient(55% 60% at 30% 55%, ${p.color}26, transparent 70%)` }} aria-hidden="true" />
        <div
          className="grid-floor absolute inset-x-0 bottom-0 h-1/2 origin-bottom [mask-image:linear-gradient(to_top,black,transparent)] [transform:perspective(700px)_rotateX(62deg)]"
          aria-hidden="true"
        />

        {projects.map((x, i) => (
          <div
            key={x.id}
            data-p={i}
            inert={i !== index ? true : undefined}
            className={`absolute inset-0 flex items-center ${i === index ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"}`}
          >
            <p
              className="p-ghost display pointer-events-none absolute -bottom-[0.12em] start-0 whitespace-nowrap text-[18vw] leading-none opacity-0"
              style={{ WebkitTextStroke: `1px ${x.color}55`, color: "transparent" }}
              aria-hidden="true"
              dir="ltr"
            >
              {x.name}
            </p>
            <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-12 items-center gap-10 px-8 pt-16">
              <div className="col-span-7">
                <div className="p-preview">
                  <TiltPreview p={x} screen={screens[i]} onOpen={() => openDetails(x)} enabled eager={i === 0} />
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3" data-anim>
                  <ScreenTabs p={x} screen={screens[i]} setScreen={(s) => setScreens((arr) => arr.map((v, k) => (k === i ? s : v)))} />
                  <span className="text-xs text-muted">{t("work.shots")}</span>
                </div>
              </div>

              <div className="col-span-5 col-start-8">
                <p className="mono flex items-center gap-3 text-xs text-muted" data-anim>
                  <span className="h-2 w-2 rotate-45" style={{ background: x.color, boxShadow: `0 0 16px ${x.color}` }} aria-hidden="true" />
                  {pick(x.context)}, {x.year}
                </p>
                <h3 className="display mt-4 text-[clamp(2.6rem,4.6vw,4.8rem)]" data-anim dir="ltr" style={{ textAlign: "start" }}>
                  {x.name}
                </h3>
                <p className="mt-5 text-lg leading-snug" data-anim>
                  {pick(x.summary)}
                </p>
                <div className="mt-5" data-anim>
                  <p className="mono text-xs" style={{ color: textColor(x) }}>{t("work.myPart")}</p>
                  <p className="mt-1.5 line-clamp-4 text-[0.95rem] leading-relaxed text-muted">{pick(x.myPart)}</p>
                </div>
                <ul className="mt-5 flex flex-wrap gap-1.5" dir="ltr" data-anim>
                  {x.stack.slice(0, 6).map((s) => (
                    <li key={s} className="mono rounded-md border border-line px-2 py-0.5 text-[11px] text-muted">{s}</li>
                  ))}
                  {x.stack.length > 6 && <li className="mono px-1 py-0.5 text-[11px] text-muted">+{x.stack.length - 6}</li>}
                </ul>
                <div className="mt-7 flex flex-wrap items-center gap-2.5" data-anim>
                  <Links p={x} />
                  <button type="button" onClick={() => openDetails(x)} className="link-line min-h-11 px-2 text-sm font-semibold">
                    {t("work.details")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* progress rail */}
        <div className="absolute bottom-8 start-8 z-20 flex items-center gap-4">
          <span className="mono text-xs tnum text-muted" aria-live="polite">
            {String(index + 1).padStart(2, "0")} {t("work.of")} {String(projects.length).padStart(2, "0")}
          </span>
          <div className="flex gap-1.5">
            {projects.map((x, i) => (
              <button
                key={x.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={x.name}
                aria-current={i === index ? "true" : undefined}
                className="relative h-1 w-14 overflow-hidden rounded-full bg-line"
              >
                <span
                  className="absolute inset-y-0 start-0 rounded-full"
                  style={{ width: i < index ? "100%" : i === index ? `${Math.max(6, local * 100)}%` : "0%", background: x.color }}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={() => goTo(Math.max(0, index - 1))} disabled={index === 0} aria-label={t("work.prev")} className="panel h-9 w-9 rounded-full text-sm disabled:opacity-40">
              <span aria-hidden="true">↑</span>
            </button>
            <button type="button" onClick={() => goTo(Math.min(projects.length - 1, index + 1))} disabled={index === projects.length - 1} aria-label={t("work.next")} className="panel h-9 w-9 rounded-full text-sm disabled:opacity-40">
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Mobile / reduced motion: stacked --------------------- */

function Stacked({ openDetails, tilt }) {
  const { t, pick } = usePrefs();
  const [screens, setScreens] = useState(() => projects.map(() => 0));
  return (
    <div className="mx-auto grid max-w-[1440px] gap-20 px-5 sm:px-8">
      {projects.map((p, i) => (
        <article key={p.id} aria-labelledby={`s-${p.id}`} className="relative">
          <div className="pointer-events-none absolute -inset-x-10 -top-10 h-72 opacity-60" style={{ background: `radial-gradient(50% 60% at 50% 30%, ${p.color}30, transparent)` }} aria-hidden="true" />
          <p className="mono relative flex items-center gap-3 text-xs text-muted">
            <span className="h-2 w-2 rotate-45" style={{ background: p.color }} aria-hidden="true" />
            {String(i + 1).padStart(2, "0")} — {pick(p.context)}, {p.year}
          </p>
          <h3 id={`s-${p.id}`} className="display relative mt-3 text-[clamp(2.4rem,11vw,4rem)]" dir="ltr" style={{ textAlign: "start" }}>
            {p.name}
          </h3>
          <div className="relative mt-6">
            <TiltPreview p={p} screen={screens[i]} onOpen={() => openDetails(p)} enabled={tilt} eager={i === 0} />
          </div>
          <div className="mt-4">
            <ScreenTabs p={p} screen={screens[i]} setScreen={(s) => setScreens((arr) => arr.map((v, k) => (k === i ? s : v)))} />
          </div>
          <p className="mt-6 text-lg leading-snug">{pick(p.summary)}</p>
          <p className="mono mt-5 text-xs" style={{ color: textColor(p) }}>{t("work.myPart")}</p>
          <p className="mt-1.5 leading-relaxed text-muted">{pick(p.myPart)}</p>
          <ul className="mt-5 flex flex-wrap gap-1.5" dir="ltr">
            {p.stack.map((s) => (
              <li key={s} className="mono rounded-md border border-line px-2 py-0.5 text-[11px] text-muted">{s}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Links p={p} small />
            <button type="button" onClick={() => openDetails(p)} className="link-line min-h-10 px-2 text-sm font-semibold">
              {t("work.details")}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Work() {
  const { t } = usePrefs();
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const [details, setDetails] = useState(null);
  const pinned = !mobile && !reduced;

  return (
    <section id="work" aria-labelledby="work-title" className="relative overflow-x-clip py-24 md:py-32">
      <SectionTitle id="work-title" title={t("work.title")} intro={t("work.intro")} />
      {pinned ? <Pinned openDetails={setDetails} /> : <Stacked openDetails={setDetails} tilt={!mobile && !reduced} />}
      {details && <Details p={details} onClose={() => setDetails(null)} />}
    </section>
  );
}
