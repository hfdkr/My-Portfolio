import { usePrefs } from "../lib/preferences";
import { lab } from "../data/lab";
import { ArrowUpRight } from "./Primitives";
import InteractiveText from "./InteractiveText";

const METHOD_COLOR = {
  GET: "text-glaze",
  POST: "text-accent",
  PATCH: "text-ink-2",
  DELETE: "text-[#b42318] dark:text-[#ff8b80]",
};

function Specimen({ api, index }) {
  const { t, pick } = usePrefs();
  return (
    <article className="flex flex-col border border-line bg-surface" aria-labelledby={`lab-${api.id}`}>
      <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <p className="mono text-[11px] text-muted">
          LAB/{String(index + 1).padStart(2, "0")} · {pick(api.kind)}
        </p>
        <p className="mono text-[11px] text-muted">{api.year}</p>
      </header>
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <InteractiveText as="h4" id={`lab-${api.id}`} text={pick(api.name)} className="serif text-[1.9rem] leading-tight tracking-tight" />
        <p className="mt-2 text-muted">{pick(api.summary)}</p>

        <p className="eyebrow mt-7">{t("lab.routes")}</p>
        <table className="mono mt-2 w-full text-[12px]" dir="ltr">
          <tbody>
            {api.routes.map(([method, path, codes]) => (
              <tr key={method + path} className="border-b border-line last:border-b-0">
                <td className={`w-16 py-2 font-medium ${METHOD_COLOR[method] || ""}`}>{method}</td>
                <td className="py-2 text-ink">{path}</td>
                <td className="py-2 text-end text-muted">{codes}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="mt-6 space-y-2 text-[0.92rem] leading-snug text-ink-2">
          {pick(api.notes).map((n) => (
            <li key={n} className="flex gap-2.5">
              <span className="mt-[0.55em] h-1 w-1 shrink-0 bg-accent" aria-hidden="true" />
              {n}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8">
          <ul className="flex flex-wrap gap-1.5" dir="ltr">
            {api.stack.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
          <a href={api.repo} target="_blank" rel="noopener noreferrer" data-cursor="open" className="link-line inline-flex items-center gap-1.5 py-1 text-sm font-medium">
            {t("lab.code")} <ArrowUpRight />
            <span className="sr-only">({t("work.newTab")})</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Lab() {
  const { t, lang } = usePrefs();
  return (
    <section id="lab" className="gutter mx-auto max-w-[1440px] pt-32 md:pt-44" aria-labelledby="lab-title">
      <div className="grid gap-y-5 md:grid-cols-12 md:gap-x-8">
        <p className="eyebrow md:col-span-3" data-reveal>
          {t("lab.eyebrow")}
        </p>
        <div className="md:col-span-9">
          <InteractiveText as="h3" key={lang} id="lab-title" text={t("lab.title")} className="display text-[clamp(2.2rem,5vw,4.4rem)]" data-split />
          <p className="mt-5 max-w-[60ch] text-muted" data-reveal>
            {t("lab.intro")}
          </p>
        </div>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2" data-reveal-group>
        {lab.map((api, i) => (
          <Specimen key={api.id} api={api} index={i} />
        ))}
      </div>
    </section>
  );
}
