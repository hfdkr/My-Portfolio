import { useLayoutEffect, useRef } from "react";
import { usePrefs } from "../lib/preferences";
import { usePrefersReducedMotion } from "../lib/hooks";
import { gsap } from "../lib/gsap";
import { useReveals } from "../lib/motion";
import { journey, focus } from "../data/journey";
import { experience } from "../data/experience";
import { SectionHead, Star, LiveDot, ArrowUpRight } from "./Primitives";
import { FrameGlyph } from "./Icons";
import InteractiveText from "./InteractiveText";

const KIND_LABEL = {
  education: "journey.education",
  project: "journey.project",
  experience: "journey.experience",
  learning: "journey.learning",
  next: "journey.next",
};

function Internship({ job }) {
  const { t, pick } = usePrefs();
  return (
    <div className="mt-5 border border-line bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line px-5 py-4 sm:px-7">
        <p className="font-medium">{job.company}</p>
        <p className="mono text-[11px] text-muted">
          {pick(job.place)} · {pick(job.period)}
        </p>
      </div>
      <div className="px-5 py-6 sm:px-7">
        <p className="serif text-[1.5rem] leading-tight tracking-tight">{pick(job.role)}</p>
        <p className="mt-4 leading-relaxed text-ink-2">{pick(job.summary)}</p>
        <div className="mt-7 grid gap-8 md:grid-cols-2">
          <div>
            <p className="eyebrow">{t("journey.interfaces")}</p>
            <ul className="mt-3 border-t border-line text-[0.92rem]">
              {job.interfaces.map((it) => (
                <li key={it.en} className="flex items-center gap-2.5 border-b border-line py-2 text-ink-2">
                  <FrameGlyph className="shrink-0 text-accent" />
                  {pick(it)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">{t("journey.learned")}</p>
            <ul className="mt-3 space-y-2 text-[0.92rem] text-ink-2">
              {pick(job.learned).map((l) => (
                <li key={l}>— {l}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-7 border-t border-dashed border-line-strong pt-5 text-[0.92rem] leading-relaxed text-muted">
          <span className="eyebrow me-2 text-ink-2">{t("journey.after")}</span>
          {pick(job.after)}
        </p>
        <a href={job.link} target="_blank" rel="noopener noreferrer" data-cursor="open" className="link-line mt-5 inline-flex items-center gap-1.5 py-1 text-sm font-medium">
          github.com/hfdkr/Projet-M3AK <ArrowUpRight />
          <span className="sr-only">({t("work.newTab")})</span>
        </a>
      </div>
    </div>
  );
}

export default function Journey() {
  const { t, pick, lang } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const root = useRef(null);
  const list = useRef(null);
  const fill = useRef(null);
  useReveals(root, { reduced, deps: [lang] });

  // The line fills with the scroll; each node lights up as the fill reaches it.
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(fill.current, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list.current, start: "top 60%", end: "bottom 60%", scrub: true } });
      list.current.querySelectorAll("[data-node]").forEach((node) => {
        gsap.fromTo(node, { scale: 0.4, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)", scrollTrigger: { trigger: node, start: "top 60%", toggleActions: "play none none reverse" } });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced, lang]);

  return (
    <section id="experience" ref={root} aria-labelledby="journey-title" className="relative border-t border-line py-28 md:py-40">
      <SectionHead id="journey-title" eyebrow={t("journey.eyebrow")} title={t("journey.title")} intro={t("journey.intro")} />

      <div className="gutter mx-auto mt-20 max-w-[1440px]">
        <div ref={list} className="relative">
          {/* the rail */}
          <span className="absolute top-2 bottom-2 start-[5px] w-px bg-line md:start-[calc(25%+1px)]" aria-hidden="true">
            <span ref={fill} className="absolute inset-0 origin-top bg-accent" style={reduced ? undefined : { transform: "scaleY(0)" }} />
          </span>
          <ol className="md:grid md:grid-cols-12 md:gap-x-8">

          {journey.map((j, i) => {
            const job = j.kind === "experience" ? experience[j.experience] : null;
            const isNext = j.kind === "next";
            return (
              <li key={i} className="relative grid pb-14 ps-8 last:pb-0 md:col-span-12 md:grid-cols-12 md:gap-x-8 md:ps-0">
                <p className="mono text-[11px] text-muted md:col-span-3 md:pe-10 md:pt-1 md:text-end" data-reveal>
                  {pick(j.date)}
                </p>
                <span
                  data-node
                  className={`absolute top-1.5 start-0 flex h-[11px] w-[11px] items-center justify-center md:start-[calc(25%-4px)] ${isNext ? "border border-dashed border-accent bg-bg" : "bg-accent"}`}
                  style={{ transform: "rotate(45deg)" }}
                  aria-hidden="true"
                />
                <div className="md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-5" data-reveal>
                  <p className="eyebrow flex items-center gap-2">
                    {j.current && <LiveDot />}
                    {t(KIND_LABEL[j.kind])}
                  </p>
                  <InteractiveText as="h3" text={pick(j.title)} className={`serif mt-2 text-[clamp(1.5rem,2.6vw,2.2rem)] leading-tight tracking-tight ${isNext ? "text-muted" : ""}`} />
                  {j.text && <p className="mt-3 max-w-[62ch] leading-relaxed text-ink-2">{pick(j.text)}</p>}
                  {job && <Internship job={job} />}
                  {j.showFocus && (
                    <div className="mt-5 border border-dashed border-line-strong p-5 lg:hidden">
                      <p className="eyebrow flex items-center gap-2">
                        <Star size={11} className="text-accent" /> {t("journey.focus")}
                      </p>
                      <ul className="mt-3 grid gap-1.5 text-[0.95rem] text-ink-2 sm:grid-cols-2">
                        {focus.map((f) => (
                          <li key={f.en}>— {pick(f)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          </ol>
        </div>
      </div>
    </section>
  );
}
