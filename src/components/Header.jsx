import { useEffect, useRef, useState } from "react";
import { usePrefs, LANGS } from "../lib/preferences";
import { useUI, SECTIONS } from "../lib/ui";
import { CloseIcon, MenuIcon, MoonIcon, SunIcon } from "./Icons";

const LANG_LABEL = {
  en: { short: "EN", name: "English" },
  fr: { short: "FR", name: "Français" },
  ar: { short: "ع", name: "العربية" },
};

function Monogram() {
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="hk-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--cyan)" />
          </linearGradient>
        </defs>
        {/* three stacked layers, seen from above — the site's central object */}
        <path d="M20 3 36 11 20 19 4 11Z" fill="none" stroke="url(#hk-g)" strokeWidth="1.6" />
        <path d="M4 18.5 20 26.5 36 18.5" fill="none" stroke="var(--line-strong)" strokeWidth="1.4" />
        <path d="M4 26 20 34 36 26" fill="none" stroke="var(--amber)" strokeWidth="1.4" strokeDasharray="2.5 2.5" />
      </svg>
      <span className="relative -mt-[13px] text-[9px] font-black tracking-tight" style={{ fontStretch: "125%" }}>
        HK
      </span>
    </span>
  );
}

function LanguageSwitch({ className = "" }) {
  const { lang, setLang, t } = usePrefs();
  return (
    <div role="group" aria-label={t("lang.label")} className={`flex items-center rounded-full border border-line p-0.5 ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          aria-label={LANG_LABEL[l].name}
          onClick={() => setLang(l)}
          className={`h-8 min-w-8 rounded-full px-2 text-xs font-bold transition-colors ${
            lang === l ? "bg-ink text-bg" : "text-muted hover:text-ink"
          }`}
        >
          {LANG_LABEL[l].short}
        </button>
      ))}
    </div>
  );
}

export default function Header() {
  const { t, theme, toggleTheme } = usePrefs();
  const { openTerminal, openPalette } = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["top", ...SECTIONS];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id === "top" ? null : e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector("a")?.focus();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      toggleRef.current?.focus();
    };
  }, [open]);

  const dark = theme === "dark";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
      >
        {t("skip")}
      </a>
      <div
        className={`mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 rounded-2xl px-2 ps-3 transition-all duration-500 ${
          scrolled || open ? "panel" : "border border-transparent"
        }`}
      >
        <a href="#top" className="flex items-center gap-2.5" aria-label="Hafid Karkouch">
          <Monogram />
          <span className="hidden text-sm font-bold sm:block" style={{ fontStretch: "118%" }} dir="ltr">
            Hafid Karkouch
          </span>
        </a>

        <nav aria-label={t("nav.primary")} className="hidden lg:block">
          <ul className="flex items-center gap-1 text-sm">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? "true" : undefined}
                  className={`relative block rounded-full px-3.5 py-2 transition-colors ${
                    active === id ? "bg-[var(--accent-glow)] text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {t(`nav.${id}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openTerminal}
            aria-haspopup="dialog"
            className="mono hidden h-9 items-center gap-2 rounded-full border border-line px-3 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent md:inline-flex"
          >
            <span className="text-[color:var(--cyan)]" aria-hidden="true" dir="ltr">&gt;_</span>
            {t("nav.terminal")}
          </button>
          <button
            type="button"
            onClick={openPalette}
            aria-haspopup="dialog"
            aria-label={t("palette.open")}
            className="mono hidden h-9 items-center rounded-full border border-line px-2.5 text-xs text-muted transition-colors hover:text-ink md:inline-flex"
            dir="ltr"
          >
            Ctrl K
          </button>
          <LanguageSwitch className="hidden sm:flex" />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? t("theme.toLight") : t("theme.toDark")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={menuRef} hidden={!open} className="panel mx-auto mt-2 max-w-[1440px] rounded-2xl !bg-surface-solid p-4 lg:hidden">
        <nav aria-label={t("nav.primary")}>
          <ul>
            {SECTIONS.map((id) => (
              <li key={id} className="border-b border-line last:border-b-0">
                <a href={`#${id}`} onClick={() => setOpen(false)} className="display flex min-h-14 items-center text-2xl">
                  {t(`nav.${id}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openTerminal();
            }}
            className="mono inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm"
          >
            <span className="text-[color:var(--cyan)]" aria-hidden="true" dir="ltr">&gt;_</span>
            {t("nav.terminal")}
          </button>
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
}
