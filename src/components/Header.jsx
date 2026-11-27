import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePrefs, LANGS } from "../lib/preferences";
import { useUI, scrollToSection, SECTIONS } from "../lib/ui";
import { ScrollTrigger } from "../lib/gsap";
import { emit, toast } from "../lib/events";
import { SunIcon, MoonIcon } from "./Icons";
import { Mark } from "./Primitives";
import InteractiveText from "./InteractiveText";

const LANG_SHORT = { en: "EN", fr: "FR", ar: "AR" };
const LANG_NAMES = { en: "English", fr: "Français", ar: "العربية" };

function useActiveSection() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

function LangSwitch({ className = "" }) {
  const { t, lang, setLang } = usePrefs();
  return (
    <div role="group" aria-label={t("lang.label")} className={`flex items-center ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          aria-label={LANG_NAMES[l]}
          lang={l}
          className={`mono relative min-h-10 min-w-9 px-1.5 text-[11px] tracking-wider transition-colors ${lang === l ? "text-ink" : "text-muted hover:text-ink"}`}
        >
          {LANG_SHORT[l]}
          <span className={`absolute inset-x-2 bottom-2 h-px bg-accent transition-transform duration-500 ${lang === l ? "scale-x-100" : "scale-x-0"}`} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function ThemeToggle() {
  const { t, theme, toggleTheme } = usePrefs();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? t("theme.toLight") : t("theme.toDark")}
      className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden text-ink"
    >
      <span className={`absolute transition-transform duration-700 ease-[var(--ease-out-expo)] ${theme === "dark" ? "translate-y-0 rotate-0" : "-translate-y-8 -rotate-90"}`}>
        <MoonIcon />
      </span>
      <span className={`absolute transition-transform duration-700 ease-[var(--ease-out-expo)] ${theme === "dark" ? "translate-y-8 rotate-90" : "translate-y-0 rotate-0"}`}>
        <SunIcon />
      </span>
    </button>
  );
}

export default function Header() {
  const { t, lang } = usePrefs();
  const { openTerminal, openPalette } = useUI();
  const active = useActiveSection();
  const [menu, setMenu] = useState(false);
  const bar = useRef(null);
  const progress = useRef(null);
  const clicks = useRef([]);

  // Hide on scroll down, show on scroll up, solid background once past the hero top.
  useLayoutEffect(() => {
    const el = bar.current;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        el.dataset.solid = y > 40 ? "true" : "false";
        el.dataset.hidden = self.direction === 1 && y > 600 ? "true" : "false";
        if (progress.current) progress.current.style.transform = `scaleX(${self.progress})`;
      },
    });
    return () => st.kill();
  }, []);

  // Close the mobile menu with Escape; lock scroll while it is open.
  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [menu]);

  const go = (id) => (e) => {
    e.preventDefault();
    setMenu(false);
    scrollToSection(id);
  };

  // Five quick clicks on the mark → mercury mode. (Shh.)
  const onMark = (e) => {
    e.preventDefault();
    const now = performance.now();
    clicks.current = [...clicks.current.filter((c) => now - c < 1600), now];
    if (clicks.current.length >= 5) {
      clicks.current = [];
      emit("wave");
      toast(t("egg.mercury"));
    }
    scrollToSection("top");
  };

  return (
    <>
      <a href="#main" className="fixed start-4 top-3 z-[80] -translate-y-24 bg-ink px-4 py-2 text-sm font-semibold text-bg focus:translate-y-0">
        {t("skip")}
      </a>
      <header
        ref={bar}
        data-solid="false"
        data-hidden="false"
        className="group/bar fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[var(--ease-out-expo)] data-[hidden=true]:-translate-y-full data-[solid=true]:border-b data-[solid=true]:border-line data-[solid=true]:bg-[rgb(var(--scrim)/0.94)]"
      >
        <div className="gutter mx-auto flex h-16 max-w-[1440px] items-center gap-4">
          <a href="#top" onClick={onMark} className="group flex items-center gap-2.5 text-ink" aria-label="Hafid Karkouch — top">
            <Mark size={22} chrome className="transition-transform duration-1000 ease-[var(--ease-out-expo)] group-hover:rotate-[200deg]" />
            <InteractiveText text={lang === "ar" ? "حفيظ كركوش" : "Hafid Karkouch"} variant="nav" className="text-[0.95rem] font-semibold tracking-tight" />
          </a>

          <nav aria-label={t("nav.primary")} className="ms-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {SECTIONS.map((id, i) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={go(id)}
                    aria-current={active === id ? "true" : undefined}
                    className={`group relative inline-flex min-h-10 items-center gap-1.5 px-3 text-sm transition-colors ${active === id ? "text-ink" : "text-muted hover:text-ink"}`}
                  >
                    <span className="mono text-[10px] text-accent">0{i}</span>
                    <InteractiveText text={t(`nav.${id}`)} variant="nav" />
                    <span className={`absolute inset-x-3 bottom-1.5 h-px origin-left bg-ink transition-transform duration-500 ease-[var(--ease-out-expo)] rtl:origin-right ${active === id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ms-auto flex items-center gap-1 lg:ms-4">
            <LangSwitch className="hidden sm:flex" />
            <span className="mx-1 hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
            <ThemeToggle />
            <button type="button" onClick={openTerminal} className="mono hidden min-h-10 items-center gap-2 px-2.5 text-xs text-muted transition-colors hover:text-ink md:inline-flex" aria-label={t("pal.openTerminal")}>
              <span className="text-accent" aria-hidden="true">&gt;_</span>
              {t("nav.terminal")}
            </button>
            <button type="button" onClick={openPalette} aria-label={t("palette.open")} className="mono hidden min-h-8 items-center border border-line px-2 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-ink md:inline-flex">
              ⌘K
            </button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="inline-flex min-h-10 items-center gap-2 px-2 text-sm font-medium lg:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
            >
              {t("nav.menu")}
              <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
                <span className="h-px w-full bg-ink" />
                <span className="h-px w-3/5 bg-ink" />
              </span>
            </button>
          </div>
        </div>
        <div className="h-px origin-left bg-accent/70 rtl:origin-right" ref={progress} style={{ transform: "scaleX(0)" }} aria-hidden="true" />
      </header>

      {/* Mobile menu: full screen, big headline links that rise in one after another. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.menu")}
        hidden={!menu}
        className="fixed inset-0 z-[60] flex flex-col bg-bg lg:hidden"
      >
        {menu && (
          <>
            <div className="gutter flex h-16 items-center justify-between border-b border-line">
              <Mark size={20} className="text-accent" />
              <button type="button" onClick={() => setMenu(false)} className="min-h-10 px-2 text-sm font-medium" autoFocus>
                {t("nav.close")}
              </button>
            </div>
            <nav aria-label={t("nav.primary")} className="gutter flex-1 overflow-y-auto py-8">
              <ol className="space-y-1">
                {SECTIONS.map((id, i) => (
                  <li key={id} className="rise-in" style={{ animationDelay: `${80 + i * 60}ms` }}>
                    <a href={`#${id}`} onClick={go(id)} className="flex items-baseline gap-4 border-b border-line py-4">
                      <span className="mono text-xs text-accent">0{i}</span>
                      <InteractiveText text={t(`nav.${id}`)} className="display text-[clamp(2.4rem,11vw,3.6rem)]" />
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="gutter flex items-center justify-between gap-4 border-t border-line py-4">
              <LangSwitch />
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  openTerminal();
                }}
                className="mono inline-flex min-h-11 items-center gap-2 text-sm"
              >
                <span className="text-accent" aria-hidden="true">&gt;_</span>
                {t("nav.terminal")}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
