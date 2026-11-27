import { useLayoutEffect, useRef } from "react";
import { usePrefs } from "../lib/preferences";
import { usePrefersReducedMotion, useIsMobile } from "../lib/hooks";
import { gsap } from "../lib/gsap";
import { journey, focus } from "../data/journey";
import { experience } from "../data/experience";
import SectionTitle from "./SectionTitle";

const KIND = {
  education: { color: "var(--cyan)", key: "journey.education" },
  project: { color: "var(--pink)", key: "journey.project" },
  experience: { color: "var(--accent)", key: "journey.experience" },
  learning: { color: "var(--amber)", key: "journey.learning" },
  next: { color: "var(--ink)", key: "journey.next" },
};

function ExperienceCard({ job }) {
  const { t, pick } = usePrefs();
  return (
    <div className="mt-4">
      <p className="text-lg font-semibold">{pick(job.role)}</p>
      <p className="text-muted">
        {job.company}, {pick(job.place)}
      </p>
      <p className="mt-4 leading-relaxed">{pick(job.summary)}</p>
      <p className="mono mt-6 text-xs text-accent">{t("journey.interfaces")}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {job.interfaces.map((it, i) => (
          <li key={i} className="rounded-lg border border-line bg-[var(--accent-glow)] px-2.5 py-1 text-xs">
            {pick(it)}
          </li>
        ))}
      </ul>
      <p className="mono mt-6 text-xs text-accent">{t("journey.learned")}</p>
      <ul className="mt-2 space-y-1.5">
        {pick(job.learned).map((l) => (
          <li key={l} className="flex gap-2.5 text-[0.95rem] leading-snug">
            <span className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" aria-hidden="true" />
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Journey() {
  const { t, pick, dir } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();
  const list = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".j-fill",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: list.current, start: "top 60%", end: "bottom 60%", scrub: reduced ? false : 0.6 } },
      );
      gsap.utils.toArray(".j-item").forEach((el, i) => {
        const side = mobile ? 1 : i % 2 === 0 ? -1 : 1;
        const sign = dir === "rtl" ? -1 : 1;
        gsap.fromTo(
          el.querySelector(".j-card"),
          reduced ? { opacity: 1 } : { opacity: 0, x: 70 * side * sign, rotateY: 12 * side * sign, filter: "blur(6px)" },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              toggleActions: "play none none reverse",
              onEnter: () => el.classList.add("on"),
              onLeaveBack: () => el.classList.remove("on"),
            },
          },
        );
      });
    }, list);
    return () => ctx.revert();
  }, [reduced, mobile, dir]);

  return (
    <section id="experience" aria-labelledby="journey-title" className="relative overflow-x-clip py-24 md:py-32">
      <SectionTitle id="journey-title" title={t("journey.title")} intro={t("journey.intro")} />

      <ol ref={list} className="relative mx-auto max-w-[1200px] px-5 sm:px-8">
        {/* spine */}
        <span className="absolute top-0 bottom-0 start-[29px] w-px bg-line sm:start-[37px] md:start-1/2" aria-hidden="true">
          <span className="j-fill absolute inset-0 origin-top bg-gradient-to-b from-[var(--cyan)] via-accent to-amber shadow-[0_0_12px_var(--accent)]" />
        </span>

        {journey.map((j, i) => {
          const k = KIND[j.kind];
          const startSide = i % 2 === 0;
          const job = j.experience != null ? experience[j.experience] : null;
          return (
            <li key={i} className={`j-item group relative grid pb-14 md:grid-cols-2 md:gap-16 md:pb-20 [perspective:1000px]`}>
              {/* node */}
              <span
                className="absolute top-6 start-[10px] z-10 flex h-10 w-10 items-center justify-center sm:start-[18px] md:start-1/2 md:-translate-x-1/2 rtl:md:translate-x-1/2"
                aria-hidden="true"
              >
                {j.current && <span className="pulse-ring absolute inset-1 rounded-full" style={{ background: k.color }} />}
                <span
                  className={`relative h-4 w-4 rounded-full border-2 transition-all duration-500 group-[.on]:scale-110 ${j.kind === "next" ? "border-dashed" : ""}`}
                  style={{ borderColor: k.color, background: j.kind === "next" ? "var(--bg)" : "var(--bg)", boxShadow: `0 0 0 6px var(--bg)` }}
                >
                  <span className="absolute inset-[3px] scale-0 rounded-full transition-transform duration-500 group-[.on]:scale-100" style={{ background: j.kind === "next" ? "transparent" : k.color }} />
                </span>
              </span>

              <div className={`ps-14 sm:ps-20 md:ps-0 ${startSide ? "md:col-start-1 md:pe-4 md:text-end" : "md:col-start-2 md:ps-4"}`}>
                <article className={`j-card panel hud rounded-2xl p-6 text-start md:p-7 ${job ? "md:-me-0" : ""}`}>
                  <p className="mono flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="rounded-full px-2 py-0.5 font-semibold" style={{ color: k.color, boxShadow: `inset 0 0 0 1px ${k.color}` }}>
                      {t(k.key)}
                    </span>
                    <span className="text-muted tnum">{pick(j.date)}</span>
                  </p>
                  <h3 className="mt-3 text-xl font-bold leading-snug sm:text-2xl" style={{ fontStretch: "112%" }}>
                    {pick(j.title)}
                  </h3>
                  {j.text && <p className="mt-2 leading-relaxed text-muted">{pick(j.text)}</p>}
                  {job && <ExperienceCard job={job} />}
                  {j.showFocus && (
                    <>
                      <p className="mono mt-5 text-xs text-amber">{t("journey.focus")}</p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {focus.map((f) => (
                          <li key={pick(f)} className="rounded-lg border border-amber/40 px-2.5 py-1 text-xs">
                            {pick(f)}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </article>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
