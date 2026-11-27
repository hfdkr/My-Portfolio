import { useLayoutEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { copyText, usePrefersReducedMotion, useFinePointer, useLocalTime, LOCALES } from "../lib/hooks";
import { gsap } from "../lib/gsap";
import { useReveals, useMagnetic } from "../lib/motion";
import { profile } from "../data/profile";
import { CopyIcon, CheckIcon } from "./Icons";
import { LiveDot, ArrowUpRight } from "./Primitives";
import InteractiveText from "./InteractiveText";

const TOPICS = ["pfe", "project", "hello"];

export default function Contact() {
  const { t, lang } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const time = useLocalTime(profile.timeZone, LOCALES[lang]);
  const [topic, setTopic] = useState("pfe");
  const [copied, setCopied] = useState(null);
  const root = useRef(null);
  const box = useRef(null);
  const email = useRef(null);
  useReveals(root, { reduced, deps: [lang] });
  useMagnetic(email, { enabled: fine && !reduced, strength: 0.08 });

  const subject = t(`contact.subject.${topic}`);
  const body = t(`contact.body.${topic}`);
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const doCopy = async (what, text) => {
    const ok = await copyText(text);
    setCopied(ok ? what : "fail");
    window.setTimeout(() => setCopied(null), 2200);
  };

  // The draft rewrites itself line by line when the topic changes.
  useLayoutEffect(() => {
    if (reduced || !box.current) return;
    const tween = gsap.fromTo(box.current.querySelectorAll(".msg-line"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.04 });
    return () => tween.kill();
  }, [topic, reduced, lang]);

  return (
    <section id="contact" ref={root} aria-labelledby="contact-title" className="relative overflow-hidden border-t border-line pt-28 pb-20 md:pt-40">
      {/* reading scrim on the text side; the liquid keeps the far side for its finale */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--scrim)/0.85),rgb(var(--scrim)/0.55)_55%,rgb(var(--scrim)/0.1))] rtl:bg-[linear-gradient(to_left,rgb(var(--scrim)/0.85),rgb(var(--scrim)/0.55)_55%,rgb(var(--scrim)/0.1))]" aria-hidden="true" />
      <div className="gutter relative mx-auto max-w-[1440px]">
        <div className="grid gap-y-6 md:grid-cols-12 md:gap-x-8">
          <p className="eyebrow md:col-span-3" data-reveal>
            {t("contact.eyebrow")}
          </p>
          <div className="md:col-span-9">
            <InteractiveText as="h2" key={lang} id="contact-title" text={t("contact.title")} className="display text-[clamp(4rem,14vw,13rem)]" data-split />
            <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-ink-2" data-reveal>
              {t("contact.text")}
            </p>

            {/* the main channel */}
            <div className="mt-14 border-y border-line py-8" data-reveal>
              <a ref={email} href={`mailto:${profile.email}`} data-cursor="write" className="group inline-block max-w-full" dir="ltr">
                <span className="headline link-line block text-[clamp(1.6rem,5.2vw,4.6rem)] leading-[1.1] tracking-tight">
                  <InteractiveText text={profile.email} variant="title" breakable />
                </span>
              </a>
              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                <button type="button" onClick={() => doCopy("email", profile.email)} data-cursor="copy" className="btn btn-sm">
                  {copied === "email" ? <CheckIcon /> : <CopyIcon />}
                  {copied === "email" ? t("contact.copied") : t("contact.copyEmail")}
                </button>
                <p className="flex items-center gap-2.5 text-sm text-ink-2">
                  <LiveDot />
                  {t("status.text")}
                </p>
                <p className="mono tnum text-[11px] text-muted">{t("contact.local", { time })}</p>
              </div>
            </div>

            <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-8">
              {/* composer */}
              <div className="lg:col-span-7" data-reveal>
                <p className="eyebrow">{t("contact.compose")}</p>
                <p className="mt-5 text-sm font-medium" id="topic-label">
                  {t("contact.topic")}
                </p>
                <div role="radiogroup" aria-labelledby="topic-label" className="mt-3 flex flex-wrap gap-2">
                  {TOPICS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={topic === k}
                      onClick={() => setTopic(k)}
                      className={`min-h-10 border px-4 text-sm transition-colors ${topic === k ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-2 hover:border-ink"}`}
                    >
                      {t(`contact.t.${k}`)}
                    </button>
                  ))}
                </div>

                <div ref={box} className="mt-5 border border-line bg-surface">
                  <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
                    <p className="eyebrow">{t("contact.preview")}</p>
                    <p className="mono truncate text-[11px] text-muted" dir="ltr">
                      → {profile.email}
                    </p>
                  </div>
                  <div className="px-4 py-4 text-[0.95rem] leading-relaxed sm:px-5" dir="auto">
                    <p className="msg-line font-medium">{subject}</p>
                    <div className="mt-3 text-muted">
                      {body.split("\n").map((l, i) => (
                        <span key={i} className="msg-line block min-h-[1.2em]">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <a href={mailto} data-cursor="write" className="btn btn-solid">
                    <InteractiveText text={t("contact.open")} variant="cta" />
                  </a>
                  <button type="button" onClick={() => doCopy("msg", `${subject}\n\n${body}`)} data-cursor="copy" className="btn">
                    {copied === "msg" ? <CheckIcon /> : <CopyIcon />}
                    {copied === "msg" ? t("contact.copied") : t("contact.copyMsg")}
                  </button>
                  <span role="status" aria-live="polite" className="text-sm text-muted">
                    {copied === "fail" ? t("contact.copyFail") : ""}
                  </span>
                </div>
                <p className="mt-4 text-xs text-muted">{t("contact.note")}</p>
              </div>

              {/* elsewhere */}
              <nav aria-label={t("contact.elsewhere")} className="lg:col-span-4 lg:col-start-9" data-reveal>
                <p className="eyebrow">{t("contact.elsewhere")}</p>
                <ul className="mt-5 border-t border-line">
                  {[
                    ["LinkedIn", profile.links.linkedin, "linkedin.com/in/hafid-k"],
                    ["GitHub", profile.links.github, "github.com/hfdkr"],
                  ].map(([name, href, short]) => (
                    <li key={name}>
                      <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="open" className="group flex items-center justify-between gap-4 border-b border-line py-5">
                        <span>
                          <InteractiveText text={name} className="headline block text-[1.8rem] leading-none tracking-tight" />
                          <span className="mono mt-2 block text-[11px] text-muted" dir="ltr">
                            {short}
                          </span>
                        </span>
                        <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                        <span className="sr-only">({t("work.newTab")})</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
