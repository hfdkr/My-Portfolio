import { Suspense, lazy, useMemo, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { useIsMobile, useNearViewport, usePrefersReducedMotion, hasWebGL } from "../lib/hooks";
import { skillGroups as rawGroups, skills } from "../data/skills";
import SectionTitle from "./SectionTitle";

const SkillsScene = lazy(() => import("../three/SkillsScene"));

function Marker({ status, color }) {
  return status === "practice" ? (
    <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_10px_currentColor]" style={{ background: color, color }} aria-hidden="true" />
  ) : (
    <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border-2 border-amber" aria-hidden="true" />
  );
}

function Detail({ skill, skillGroups }) {
  const { t, pick } = usePrefs();
  if (!skill) {
    return <p className="text-sm text-muted">{t("skills.pick")}</p>;
  }
  const g = skillGroups.find((x) => x.id === skill.group);
  const where = skill.where.map((w) => pick(w)).join(", ");
  return (
    <div key={skill.id} className="skill-in">
      <p className="mono text-xs" style={{ color: g.color }}>
        {pick(g.title)}
      </p>
      <h3 className="display mt-2 text-[clamp(1.6rem,2.6vw,2.2rem)]" dir="auto">
        {pick(skill.name)}
      </h3>
      <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs font-semibold">
        <Marker status={skill.status} color={g.color} />
        {skill.status === "practice" ? t("skills.practice") : t("skills.learning")}
      </p>
      <p className="mt-4 leading-relaxed">{pick(skill.desc)}</p>
      <p className="mt-4 text-sm">
        <span className="text-muted">{t("skills.where")}: </span>
        {where || <span className="text-muted">{t("skills.none")}</span>}
      </p>
    </div>
  );
}

export default function Skills() {
  const { t, pick, theme } = usePrefs();
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const webgl = hasWebGL();
  const stageRef = useRef(null);
  const near = useNearViewport(stageRef, "150px");
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [filter, setFilter] = useState(null);
  const show3D = webgl && !mobile;
  // Neon group colours on dark; deeper versions on the light theme (contrast).
  const skillGroups = useMemo(() => rawGroups.map((g) => ({ ...g, color: theme === "dark" ? g.color : g.colorLight })), [theme]);

  const activeId = hovered || selected;
  const active = skills.find((s) => s.id === activeId);
  const visible = filter ? skills.filter((s) => s.group === filter) : skills;

  const chip = (id, label, color) => (
    <button
      key={id ?? "all"}
      type="button"
      aria-pressed={filter === id}
      onClick={() => setFilter(id)}
      className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors ${
        filter === id ? "border-transparent bg-ink text-bg" : "border-line text-muted hover:text-ink"
      }`}
    >
      {color && <span className="me-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: color }} aria-hidden="true" />}
      {label}
    </button>
  );

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative overflow-x-clip py-24 md:py-32">
      <SectionTitle id="skills-title" title={t("skills.title")} intro={t("skills.intro")} />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 sm:px-8 lg:grid-cols-12">
        {show3D && (
          <div ref={stageRef} className="panel hud relative h-[72vh] min-h-[520px] overflow-hidden rounded-3xl lg:col-span-8" data-cursor="drag">
            <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--accent-glow), transparent 70%)" }} aria-hidden="true" />
            <Suspense fallback={null}>
              <SkillsScene
                groups={skillGroups}
                skills={skills}
                activeId={activeId}
                filter={filter}
                onHover={setHovered}
                onSelect={setSelected}
                pick={pick}
                theme={theme}
                active={near}
                reduced={reduced}
                label={t("skills.intro")}
              />
            </Suspense>
            <p className="mono pointer-events-none absolute bottom-4 start-5 flex gap-5 text-xs text-muted">
              <span className="inline-flex items-center gap-2">
                <Marker status="practice" color="var(--accent)" /> {t("skills.practice")}
              </span>
              <span className="inline-flex items-center gap-2">
                <Marker status="learning" /> {t("skills.learning")}
              </span>
            </p>
          </div>
        )}

        <aside className={`flex flex-col gap-5 ${show3D ? "lg:col-span-4" : "lg:col-span-12"}`}>
          <div className="panel rounded-3xl p-6" aria-live="polite">
            <Detail skill={active} skillGroups={skillGroups} />
          </div>

          <div className="panel rounded-3xl p-5">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("skills.list")}>
              {chip(null, t("skills.list"))}
              {skillGroups.map((g) => chip(g.id, pick(g.title), g.color))}
            </div>
            <ul className={`mt-4 grid gap-1 ${show3D ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
              {visible.map((s) => {
                const g = skillGroups.find((x) => x.id === s.group);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      aria-pressed={selected === s.id}
                      onClick={() => setSelected(selected === s.id ? null : s.id)}
                      onMouseEnter={() => setHovered(s.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(s.id)}
                      onBlur={() => setHovered(null)}
                      className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-start text-sm transition-colors ${
                        activeId === s.id ? "bg-[var(--accent-glow)]" : "hover:bg-[var(--accent-glow)]"
                      }`}
                    >
                      <Marker status={s.status} color={g.color} />
                      <span className="flex-1 font-medium">{pick(s.name)}</span>
                      <span className={`text-xs ${activeId === s.id ? "text-ink" : "text-muted"}`}>{s.status === "practice" ? t("skills.practice") : t("skills.learning")}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
