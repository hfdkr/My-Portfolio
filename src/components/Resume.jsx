import { useEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { usePrefersReducedMotion, useIsMobile } from "../lib/hooks";
import { useReveals } from "../lib/motion";
import { resume, cvFile } from "../data/resume";
import { CloseIcon } from "./Icons";
import { SectionHead, LiveDot, ArrowUpRight, Mark } from "./Primitives";
import InteractiveText from "./InteractiveText";
import { on } from "../lib/events";

const BASE = import.meta.env.BASE_URL; // keeps every file path correct under any hosting base path
export const cvUrl = `${BASE}${cvFile.pdf}`;

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" />
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);

/** The two CV buttons, reused in the hero, the CV section and the contact section. */
export function CvActions({ onView, small = false, className = "" }) {
  const { t } = usePrefs();
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a href={cvUrl} download={cvFile.downloadName} data-cursor="open" className={`btn btn-solid ${small ? "btn-sm" : ""}`}>
        <DownloadIcon />
        <InteractiveText text={t("resume.download")} variant="cta" />
      </a>
      {onView && (
        <button type="button" onClick={onView} className={`btn ${small ? "btn-sm" : ""}`}>
          <EyeIcon />
          {t("resume.view")}
        </button>
      )}
    </div>
  );
}

/** Original CV in a dialog: the real PDF where the browser can show one, otherwise page 1 rendered from it, with zoom. */
export function CvPreview({ open, onClose }) {
  const { t, pick } = usePrefs();
  const mobile = useIsMobile();
  const ref = useRef(null);
  const [zoom, setZoom] = useState(100);
  const inlinePdf = typeof navigator !== "undefined" && navigator.pdfViewerEnabled === true && !mobile;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setZoom(100);
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    const onKey = (e) => {
      if (inlinePdf) return;
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(250, z + 25));
      if (e.key === "-") setZoom((z) => Math.max(50, z - 25));
    };
    d.addEventListener("cancel", onCancel);
    d.addEventListener("keydown", onKey);
    return () => {
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("keydown", onKey);
    };
  }, [onClose, inlinePdf]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="cv-preview-title"
      className="m-auto h-[min(92dvh,1100px)] max-h-none w-[min(980px,96vw)] max-w-none overflow-hidden border border-line-strong bg-bg p-0 text-ink"
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="flex h-full flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <h2 id="cv-preview-title" className="headline truncate text-lg">
                {t("resume.preview")}
              </h2>
              <p className="mono text-[11px] text-muted">
                {cvFile.downloadName} · {cvFile.size} · {t("resume.inLanguage", { lang: pick(cvFile.language) })}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {!inlinePdf && (
                <div className="me-2 flex items-center border border-line" role="group" aria-label={t("resume.zoom")}>
                  <button type="button" onClick={() => setZoom((z) => Math.max(50, z - 25))} aria-label={t("resume.zoomOut")} className="h-9 w-9 text-ink-2 hover:text-accent">
                    −
                  </button>
                  <button type="button" onClick={() => setZoom(100)} aria-label={t("resume.fit")} className="mono h-9 min-w-14 border-x border-line px-2 text-[11px] text-ink-2 hover:text-accent">
                    {zoom}%
                  </button>
                  <button type="button" onClick={() => setZoom((z) => Math.min(250, z + 25))} aria-label={t("resume.zoomIn")} className="h-9 w-9 text-ink-2 hover:text-accent">
                    +
                  </button>
                </div>
              )}
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 px-2 text-sm text-ink-2 hover:text-accent">
                <span className="hidden sm:inline">{t("resume.newTab")}</span>
                <ArrowUpRight />
                <span className="sr-only sm:hidden">{t("resume.newTab")}</span>
              </a>
              <a href={cvUrl} download={cvFile.downloadName} aria-label={t("resume.download")} className="inline-flex h-9 w-9 items-center justify-center text-ink-2 hover:text-accent">
                <DownloadIcon />
              </a>
              <button type="button" onClick={onClose} aria-label={t("resume.close")} className="inline-flex h-9 w-9 items-center justify-center text-ink hover:text-accent" autoFocus>
                <CloseIcon />
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-auto bg-bg-2">
            {inlinePdf ? (
              <iframe src={`${cvUrl}#view=FitH`} title={t("resume.previewAlt")} className="h-full w-full border-0 bg-white" />
            ) : (
              <div className="p-3 sm:p-6">
                <img
                  src={`${BASE}${cvFile.previewSmall}`}
                  srcSet={`${BASE}${cvFile.previewSmall} 760w, ${BASE}${cvFile.preview} ${cvFile.previewWidth}w`}
                  sizes={`${Math.round((zoom / 100) * 900)}px`}
                  width={cvFile.previewWidth}
                  height={cvFile.previewHeight}
                  alt={t("resume.previewAlt")}
                  className="mx-auto h-auto max-w-none bg-white shadow-[0_20px_60px_-30px_rgb(0_0_0/0.5)]"
                  style={{ width: `${zoom}%` }}
                />
                <p className="mono mt-3 text-center text-[11px] text-muted">{t("resume.previewNote")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

function Block({ title, children, className = "" }) {
  return (
    <div className={`border-t border-line pt-6 ${className}`} data-reveal>
      <h3 className="eyebrow flex items-center gap-2">
        <Mark size={11} className="text-accent" />
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

const Bullets = ({ items }) => (
  <ul className="mt-3 space-y-1.5 text-[0.95rem] leading-relaxed text-ink-2">
    {items.map((p) => (
      <li key={p} className="flex gap-2.5">
        <span className="mt-[0.6em] h-1 w-1 shrink-0 bg-accent" aria-hidden="true" />
        {p}
      </li>
    ))}
  </ul>
);

export default function Resume() {
  const { t, pick, lang } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const root = useRef(null);
  const [preview, setPreview] = useState(false);
  useReveals(root, { reduced, deps: [lang] });
  useEffect(() => on("cv:view", () => setPreview(true)), []);
  const c = resume.contact;
  const job = resume.experience[0];

  const brief = [
    ["resume.brief.studyValue", "resume.brief.study"],
    ["resume.brief.expValue", "resume.brief.exp"],
    ["resume.brief.projValue", "resume.brief.proj"],
    ["resume.brief.nextValue", "resume.brief.next"],
  ];

  return (
    <section id="resume" ref={root} aria-labelledby="resume-title" className="relative border-t border-line py-28 md:py-36">
      <SectionHead id="resume-title" eyebrow={t("resume.eyebrow")} title={t("resume.title")} intro={t("resume.intro")} />

      <div className="gutter mx-auto mt-14 grid max-w-[1440px] gap-y-12 lg:grid-cols-12 lg:gap-x-10">
        {/* identity card */}
        <aside className="lg:col-span-4">
          <div className="hud-corners relative border border-line-strong bg-[rgb(var(--scrim)/0.85)] p-6 lg:sticky lg:top-24" data-reveal>
            <p className="display text-[2.1rem] leading-none tracking-tight">{lang === "ar" ? "حفيظ كركوش" : "Hafid Karkouch"}</p>
            <p className="mt-3 font-medium text-accent">{pick(resume.title)}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-ink-2">
              <LiveDot />
              {pick(resume.seeking)}
            </p>
            <p className="mt-5 text-[0.92rem] leading-relaxed text-muted">{pick(resume.profile)}</p>
            <dl className="mt-6 border-t border-line text-[0.88rem]">
              {[
                ["resume.location", pick(c.location), null],
                ["resume.email", c.email, `mailto:${c.email}`],
                ["resume.phone", c.phone, c.phoneHref],
                ["GitHub", "github.com/hfdkr", c.github],
                ["LinkedIn", "linkedin.com/in/hafid-k", c.linkedin],
              ].map(([k, v, href]) => (
                <div key={k} className="grid grid-cols-[6rem_1fr] gap-3 border-b border-line py-2.5">
                  <dt className="eyebrow pt-0.5">{k.startsWith("resume.") ? t(k) : k}</dt>
                  <dd className="min-w-0 break-words text-ink-2" dir={href && !href.startsWith("mailto") ? "ltr" : undefined}>
                    {href ? (
                      <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="link-line">
                        {v}
                      </a>
                    ) : (
                      v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <CvActions onView={() => setPreview(true)} small className="mt-6" />
            <p className="mono mt-3 text-[10px] text-muted">
              PDF · {cvFile.size} · {t("resume.inLanguage", { lang: pick(cvFile.language) })}
            </p>
          </div>
        </aside>

        <div className="space-y-12 lg:col-span-8">
          {/* the recruiter's 10-second read — every item comes from the CV */}
          <ul className="grid grid-cols-2 border-s border-t border-line md:grid-cols-4" data-reveal-group>
            {brief.map(([value, label]) => (
              <li key={label} className="border-e border-b border-line p-4">
                <p className="headline text-[1.35rem] leading-tight text-ink">{t(value)}</p>
                <p className="mt-1 text-[0.8rem] leading-snug text-muted">{t(label)}</p>
              </li>
            ))}
          </ul>

          <Block title={t("resume.experience")}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <InteractiveText as="h4" text={pick(job.role)} className="headline text-[1.35rem] leading-tight" />
              <p className="mono text-[11px] text-ink-2">{pick(job.period)}</p>
            </div>
            <p className="mt-1 text-ink-2">{job.company}</p>
            <p className="mt-1 text-[0.85rem] text-muted">
              {pick(job.place)} · {t("resume.project")} {job.project} ·{" "}
              {job.links.map(([label, href], i) => (
                <span key={href} dir="ltr">
                  {i > 0 && " · "}
                  <a href={href} target="_blank" rel="noopener noreferrer" className="link-line text-accent">
                    {label}
                  </a>
                </span>
              ))}
            </p>
            <Bullets items={pick(job.points)} />
          </Block>

          <Block title={t("resume.projects")}>
            <div className="space-y-8">
              {resume.projects.map((p) => (
                <article key={p.name}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h4 className="headline text-[1.2rem]">
                      <InteractiveText text={p.name} /> <span className="text-[0.95rem] font-normal text-muted">— {pick(p.kind)}</span>
                    </h4>
                    <a href={p.repo[1]} target="_blank" rel="noopener noreferrer" className="mono link-line inline-flex items-center gap-1 text-[11px] text-accent" dir="ltr">
                      {p.repo[0]} <ArrowUpRight />
                    </a>
                  </div>
                  {p.summary && <p className="mt-2 text-[0.95rem] text-ink-2">{pick(p.summary)}</p>}
                  {p.summary && <p className="mt-2 text-[0.85rem] font-medium">{t("resume.contrib")}</p>}
                  <Bullets items={pick(p.points)} />
                  <ul className="mt-3 flex flex-wrap gap-1.5" dir="ltr" aria-label={t("resume.stack")}>
                    {p.stack.map((s) => (
                      <li key={s} className="chip">
                        {s}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Block>

          <Block title={t("resume.skills")}>
            <dl className="divide-y divide-line">
              {resume.skills.map((s) => (
                <div key={pick(s.label)} className="grid gap-1 py-3 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <dt className="font-medium">{pick(s.label)}</dt>
                  <dd className="text-ink-2">
                    {pick(s.items)}
                    {s.note && <span className="text-muted"> ({pick(s.note)})</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </Block>

          <div className="grid gap-12 md:grid-cols-2">
            <Block title={t("resume.education")}>
              <ul className="space-y-5">
                {resume.education.map((e) => (
                  <li key={e.years}>
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-medium leading-snug">{pick(e.title)}</p>
                      <p className="mono shrink-0 text-[11px] text-ink-2">{e.years}</p>
                    </div>
                    <p className="mt-1 text-[0.85rem] text-muted">
                      <span className="text-ink-2">{pick(e.school)}</span> · {pick(e.detail)}
                    </p>
                  </li>
                ))}
                <li>
                  <p className="font-medium leading-snug">{pick(resume.certification.title)}</p>
                  <a href={resume.certification.link[1]} target="_blank" rel="noopener noreferrer" className="mono link-line mt-1 inline-flex items-center gap-1 text-[11px] text-accent" dir="ltr">
                    {resume.certification.link[0]} <ArrowUpRight />
                  </a>
                </li>
              </ul>
            </Block>

            <Block title={t("resume.languages")}>
              <ul className="space-y-3">
                {resume.languages.map((l) => (
                  <li key={l.name.en} className="flex items-center justify-between gap-4">
                    <span>{pick(l.name)}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-[0.8rem] text-muted">{t(`resume.lv${l.level}`)}</span>
                      <span className="flex gap-1" aria-hidden="true">
                        {[1, 2, 3, 4].map((n) => (
                          <span key={n} className={`h-1.5 w-4 ${n <= l.level ? "bg-accent" : "bg-line-strong"}`} />
                        ))}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Block>
          </div>
        </div>
      </div>

      <CvPreview open={preview} onClose={() => setPreview(false)} />
    </section>
  );
}
