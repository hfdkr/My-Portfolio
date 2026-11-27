import { useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { usePrefersReducedMotion, useFinePointer } from "../lib/hooks";
import { useReveals } from "../lib/motion";
import { skills, skillGroups } from "../data/skills";
import { focus } from "../data/journey";
import { SectionHead, Star } from "./Primitives";
import InteractiveText from "./InteractiveText";

function Detail({ skill, className = "" }) {
  const { t, pick } = usePrefs();
  if (!skill) return null;
  const learning = skill.status === "learning";
  return (
    <div key={skill.id} className={`fade-in border border-line bg-surface p-6 ${className}`} aria-live="polite">
      <p className="mono flex items-center gap-2 text-[11px] text-muted">
        <span className={`inline-block h-2 w-2 ${learning ? "border border-accent" : "bg-ink"}`} aria-hidden="true" />
        {learning ? t("skills.learning") : t("skills.practice")}
      </p>
      <p className="serif mt-4 text-[2rem] leading-none tracking-tight">{pick(skill.name)}</p>
      <p className="mt-4 leading-relaxed text-ink-2">{pick(skill.desc)}</p>
      <p className="eyebrow mt-6">{t("skills.where")}</p>
      {skill.where.length ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {skill.where.map((w) => (
            <li key={pick(w)} className="chip">
              {pick(w)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">{t("skills.none")}</p>
      )}
    </div>
  );
}

export default function Skills() {
  const { t, pick, lang } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const root = useRef(null);
  const [selected, setSelected] = useState("tailwind");
  useReveals(root, { reduced, deps: [lang] });

  const current = skills.find((s) => s.id === selected);

  return (
    <section id="skills" ref={root} aria-labelledby="skills-title" className="relative border-t border-line py-28 md:py-40">
      <SectionHead id="skills-title" eyebrow={t("skills.eyebrow")} title={t("skills.title")} intro={t("skills.intro")}>
        <p className="mono mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-muted" data-reveal>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-ink" aria-hidden="true" /> {t("skills.practice")}
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 border border-accent" aria-hidden="true" /> {t("skills.learning")}
          </span>
        </p>
      </SectionHead>

      <div className="gutter mx-auto mt-16 grid max-w-[1440px] gap-y-10 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-8">
          {skillGroups.map((g) => {
            const items = skills.filter((s) => s.group === g.id);
            return (
              <div key={g.id} className="grid gap-y-3 border-t border-line py-6 md:grid-cols-[12rem_1fr] md:gap-x-6" data-reveal>
                <h3 className="eyebrow flex items-baseline justify-between gap-2 pt-2 md:block">
                  <span className="text-ink-2">{pick(g.title)}</span>
                  <span className="mono block text-[10px] md:mt-1">{t("skills.count", { n: items.length })}</span>
                </h3>
                <div>
                  <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                    {items.map((s) => {
                      const on = s.id === selected;
                      const learning = s.status === "learning";
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            aria-pressed={on}
                            onClick={() => setSelected(s.id)}
                            onPointerEnter={fine ? () => setSelected(s.id) : undefined}
                            className="group relative py-1 text-start"
                          >
                            <InteractiveText
                              text={pick(s.name)}
                              variant="skill"
                              color={on ? "var(--ink)" : undefined}
                              className={`serif text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.15] tracking-tight transition-colors duration-300 ${
                                learning ? (on ? "text-accent [-webkit-text-stroke:0]" : "outline-text") : on ? "text-accent" : "text-ink"
                              }`}
                            />
                            {learning && <sup className="mono ms-1 align-super text-[9px] text-accent">{t("skills.learning")}</sup>}
                            <span className={`absolute inset-x-0 bottom-0 h-px origin-left bg-accent transition-transform duration-500 rtl:origin-right ${on ? "scale-x-100" : "scale-x-0"}`} aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {/* On small screens the detail opens right under its group. */}
                  {current?.group === g.id && <Detail skill={current} className="mt-5 lg:hidden" />}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24 space-y-6">
            <Detail skill={current} />
            <div className="border border-dashed border-line-strong p-6">
              <p className="eyebrow flex items-center gap-2">
                <Star size={11} className="text-accent" /> {t("journey.focus")}
              </p>
              <ul className="mt-4 space-y-2 text-[0.95rem] text-ink-2">
                {focus.map((f) => (
                  <li key={f.en}>— {pick(f)}</li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
