import { useLayoutEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { copyText, usePrefersReducedMotion } from "../lib/hooks";
import { gsap } from "../lib/gsap";
import { profile } from "../data/profile";
import { ExternalIcon, CopyIcon, CheckIcon } from "./Icons";
import SectionTitle from "./SectionTitle";

const TOPICS = ["pfe", "project", "hello"];

/** Buttons that lean toward the pointer. */
function Magnetic({ children, className = "", ...props }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const onMove = (e) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    ref.current.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
  };
  const onLeave = () => ref.current && (ref.current.style.transform = "");
  const Tag = props.href ? "a" : "button";
  return (
    <Tag ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`transition-transform duration-300 ease-out ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export default function Contact() {
  const { t } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const [topic, setTopic] = useState("pfe");
  const [copied, setCopied] = useState(null);
  const box = useRef(null);
  const root = useRef(null);

  const subject = t(`contact.subject.${topic}`);
  const body = t(`contact.body.${topic}`);
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const doCopy = async (what, text) => {
    const ok = await copyText(text);
    setCopied(ok ? what : "fail");
    window.setTimeout(() => setCopied(null), 2200);
  };

  // Typewriter swap of the message when the topic changes.
  useLayoutEffect(() => {
    if (reduced || !box.current) return;
    gsap.fromTo(box.current.querySelectorAll(".msg-line"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "expo.out" });
  }, [topic, reduced, t]);

  // Orbiting envelope glyph entrance.
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(".c-panel", { y: 60, opacity: 0, rotateX: 14, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="contact" ref={root} aria-labelledby="contact-title" className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]" style={{ background: "radial-gradient(60% 60% at 50% 100%, var(--accent-glow), transparent 70%)" }} aria-hidden="true" />
      <SectionTitle id="contact-title" title={t("contact.title")} intro={t("contact.text")} />

      <div className="relative mx-auto grid max-w-[1440px] gap-6 px-5 [perspective:1200px] sm:px-8 lg:grid-cols-12">
        {/* composer */}
        <div className="c-panel panel hud rounded-3xl p-6 sm:p-8 lg:col-span-7">
          <p className="text-sm font-semibold" id="topic-label">
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
                className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-all ${
                  topic === k ? "border-transparent bg-accent text-accent-ink shadow-[0_8px_30px_-8px_var(--accent)]" : "border-line text-muted hover:text-ink"
                }`}
              >
                {t(`contact.t.${k}`)}
              </button>
            ))}
          </div>

          <div ref={box} className="mt-6 overflow-hidden rounded-2xl border border-line bg-bg-2/80">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <p className="text-xs text-muted">{t("contact.preview")}</p>
              <p className="mono truncate text-xs text-muted" dir="ltr">
                → {profile.email}
              </p>
            </div>
            <div className="px-4 py-4 text-[0.95rem] leading-relaxed sm:px-5" dir="auto">
              <p className="msg-line font-semibold">{subject}</p>
              <div className="mt-3 whitespace-pre-line text-muted">
                {body.split("\n").map((l, i) => (
                  <span key={i} className="msg-line block min-h-[1.2em]">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Magnetic href={mailto} className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 text-sm font-bold text-accent-ink shadow-[0_12px_40px_-12px_var(--accent)]">
              {t("contact.open")}
            </Magnetic>
            <button type="button" onClick={() => doCopy("msg", `${subject}\n\n${body}`)} className="panel inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold">
              {copied === "msg" ? <CheckIcon /> : <CopyIcon />}
              {copied === "msg" ? t("contact.copied") : t("contact.copyMsg")}
            </button>
            <span role="status" aria-live="polite" className="text-sm text-muted">
              {copied === "fail" ? t("contact.copyFail") : ""}
            </span>
          </div>
          <p className="mt-5 text-xs text-muted">{t("contact.note")}</p>
        </div>

        {/* direct channels */}
        <div className="c-panel flex flex-col gap-4 lg:col-span-5">
          <div className="panel rounded-3xl p-6 sm:p-8">
            <p className="mono text-xs text-muted">email</p>
            <p className="mt-2 break-all text-[clamp(1.25rem,2.4vw,1.9rem)] font-extrabold" style={{ fontStretch: "110%" }} dir="ltr">
              {profile.email}
            </p>
            <button type="button" onClick={() => doCopy("email", profile.email)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold hover:border-accent hover:text-accent">
              {copied === "email" ? <CheckIcon /> : <CopyIcon />}
              {copied === "email" ? t("contact.copied") : t("contact.copyEmail")}
            </button>
          </div>
          <nav aria-label={t("contact.elsewhere")} className="grid gap-4 sm:grid-cols-2">
            {[
              ["LinkedIn", profile.links.linkedin, "linkedin.com/in/hafid-k"],
              ["GitHub", profile.links.github, "github.com/hfdkr"],
            ].map(([name, href, short]) => (
              <Magnetic
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="panel group flex min-h-28 flex-col justify-between rounded-3xl p-6 hover:border-accent"
              >
                <span className="flex items-center justify-between">
                  <span className="text-xl font-bold" style={{ fontStretch: "115%" }}>{name}</span>
                  <ExternalIcon className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                </span>
                <span className="mono text-xs text-muted" dir="ltr">{short}</span>
                <span className="sr-only">({t("work.newTab")})</span>
              </Magnetic>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
