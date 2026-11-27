import { useLayoutEffect, useRef } from "react";
import { usePrefs } from "../lib/preferences";
import { usePrefersReducedMotion } from "../lib/hooks";
import { gsap } from "../lib/gsap";
import { useReveals } from "../lib/motion";
import { profile } from "../data/profile";
import { ArrowUpRight, Star } from "./Primitives";
import InteractiveText, { Marked } from "./InteractiveText";

const PRINCIPLES = [1, 2, 3, 4];

export default function About() {
  const { t, pick, lang } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const root = useRef(null);
  const statement = useRef(null);
  useReveals(root, { reduced, deps: [lang] });

  // The statement lights up word by word as it is read (scrubbed to the scroll position).
  useLayoutEffect(() => {
    if (reduced || !statement.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        statement.current.querySelectorAll(".w"),
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.06,
          scrollTrigger: { trigger: statement.current, start: "top 78%", end: "bottom 42%", scrub: 0.6 },
        },
      );
    }, statement);
    return () => ctx.revert();
  }, [reduced, lang]);

  const words = t("about.statement").split(" ");

  return (
    <section id="about" ref={root} aria-labelledby="about-title" className="relative py-28 md:py-40">
      <div className="gutter mx-auto max-w-[1440px]">
        <div className="grid gap-y-8 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-3">
            <p className="eyebrow" data-reveal>
              {t("about.eyebrow")}
            </p>
            <h2 id="about-title" className="sr-only">
              {t("about.title")}
            </h2>
          </div>
          <p ref={statement} className="display text-[clamp(2rem,4.6vw,4.4rem)] leading-[1.04] md:col-span-9">
            {words.map((w, i) => (
              <span key={i} className="w">
                <Marked text={w} />{" "}
              </span>
            ))}
          </p>
        </div>

        <div className="mt-24 grid gap-y-12 md:mt-36 md:grid-cols-12 md:gap-x-8">
          <div className="space-y-5 text-lg leading-relaxed md:col-span-5 md:col-start-4" data-reveal-group>
            <p>{t("about.p1")}</p>
            <p className="text-muted">{t("about.p2")}</p>
          </div>
          <dl className="self-start border-t border-line md:col-span-4" data-reveal-group>
            {profile.facts.map((f) => (
              <div key={f.label} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-line py-4 text-[0.92rem]">
                <dt className="eyebrow pt-0.5">{t(f.label)}</dt>
                <dd className="text-ink-2">
                  {f.href ? (
                    <a href={f.href} target="_blank" rel="noopener noreferrer" data-cursor="open" className="link-line inline-flex items-baseline gap-1.5">
                      {pick(f.value)}
                      <ArrowUpRight className="translate-y-0.5" />
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

        <div className="mt-28 md:mt-40">
          <h3 className="eyebrow" data-reveal>
            {t("about.principles")}
          </h3>
          <div className="mt-6 h-px bg-line-strong" data-draw aria-hidden="true" />
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
            {PRINCIPLES.map((n) => (
              <li key={n} className="group relative border-b border-line py-8 sm:pe-8 lg:border-b-0 lg:border-e lg:px-6 lg:first:ps-0 lg:last:border-e-0">
                <p className="mono flex items-center gap-2 text-[11px] text-muted">
                  <Star size={11} className="text-accent transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-90" />
                  0{n}
                </p>
                <InteractiveText as="p" text={t(`about.pr${n}.t`)} className="serif mt-5 text-[1.65rem] leading-tight tracking-tight" />
                <p className="mt-3 max-w-[34ch] text-[0.95rem] leading-relaxed text-muted">{t(`about.pr${n}.b`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
