import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefs, LANGS } from "../lib/preferences";
import { useUI, scrollToSection, SECTIONS } from "../lib/ui";
import { copyText } from "../lib/hooks";
import { profile } from "../data/profile";
import { useMusic } from "../audio/MusicProvider";

const LANG_NAMES = { en: "English", fr: "Français", ar: "العربية" };

export default function CommandPalette() {
  const { t, lang, setLang, toggleTheme, theme } = usePrefs();
  const { overlay, close, openTerminal } = useUI();
  const { toggle: toggleMusic } = useMusic();
  const open = overlay === "palette";
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [flash, setFlash] = useState("");
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const returnFocus = useRef(null);

  const items = useMemo(() => {
    const nav = SECTIONS.map((id) => ({
      id: `nav-${id}`,
      group: t("pal.navigate"),
      label: t(`nav.${id}`),
      keywords: `${id} section`,
      icon: "§",
      run: () => {
        close();
        scrollToSection(id);
      },
    }));
    const actions = [
      { id: "terminal", group: t("pal.actions"), label: t("pal.openTerminal"), keywords: "terminal shell cli console", icon: ">_", run: openTerminal, hint: "Ctrl `" },
      {
        id: "theme",
        group: t("pal.actions"),
        label: `${t("pal.toggleTheme")} (${theme === "dark" ? "light" : "dark"})`,
        keywords: "theme dark light mode",
        icon: "◐",
        run: () => toggleTheme(),
        keep: true,
      },
      ...LANGS.filter((l) => l !== lang).map((l) => ({
        id: `lang-${l}`,
        group: t("pal.actions"),
        label: `${t("lang.label")}: ${LANG_NAMES[l]}`,
        keywords: `language langue lang ${l} ${LANG_NAMES[l]}`,
        icon: l.toUpperCase(),
        run: () => setLang(l),
        keep: true,
      })),
      { id: "music", group: t("pal.actions"), label: t("pal.music"), keywords: "music sound soundtrack audio musique son", icon: "♪", run: () => toggleMusic(), keep: true },
      {
        id: "copy",
        group: t("pal.actions"),
        label: t("pal.copyEmail"),
        keywords: "email mail copy contact",
        icon: "@",
        run: async () => setFlash((await copyText(profile.email)) ? t("contact.copied") : t("contact.copyFail")),
        keep: true,
      },
    ];
    const links = [
      { id: "github", group: t("pal.links"), label: "GitHub", keywords: "github code repos", icon: "↗", href: profile.links.github },
      { id: "linkedin", group: t("pal.links"), label: "LinkedIn", keywords: "linkedin cv", icon: "↗", href: profile.links.linkedin },
    ];
    return [...nav, ...actions, ...links];
  }, [t, lang, theme, close, openTerminal, toggleTheme, setLang, toggleMusic]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => `${i.label} ${i.keywords}`.toLowerCase().includes(s));
  }, [q, items]);

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    setQ("");
    setFlash("");
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      window.clearTimeout(id);
      if (returnFocus.current && document.contains(returnFocus.current)) returnFocus.current.focus?.();
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const exec = (item) => {
    if (!item) return;
    if (item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      close();
      return;
    }
    item.run();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      exec(filtered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      e.preventDefault(); // focus stays in the search field
    }
  };

  if (!open) return null;

  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <div className="fade-in absolute inset-0 bg-[#05060a]/55" onClick={close} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={t("palette.open")} className="rise-in relative w-full max-w-xl overflow-hidden border border-line-strong bg-surface shadow-[0_50px_100px_-40px_rgb(0_0_0/0.6)]">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span className="mono text-xs text-accent" aria-hidden="true">⌘K</span>
          <input
            ref={inputRef}
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls="pal-list"
            aria-activedescendant={filtered[active] ? `pal-${filtered[active].id}` : undefined}
            aria-autocomplete="list"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("pal.placeholder")}
            className="min-h-14 flex-1 border-0 bg-transparent text-base text-ink outline-none placeholder:text-muted focus-visible:outline-none"
            style={{ outline: "none" }}
          />
        </div>
        <ul id="pal-list" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">{t("pal.empty")}</li>}
          {filtered.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={item.id} role="presentation">
                {header && <p className="eyebrow px-3 pt-3 pb-1">{header}</p>}
                <div
                  id={`pal-${item.id}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => exec(item)}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 px-3 text-[0.95rem] ${
                    i === active ? "bg-accent-soft text-ink" : "text-ink-2"
                  }`}
                >
                  <span className="mono inline-flex h-7 w-7 shrink-0 items-center justify-center border border-line text-xs text-accent" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.hint && <kbd className="mono text-xs text-muted">{item.hint}</kbd>}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="flex justify-between gap-4 border-t border-line px-4 py-2 text-xs text-muted" aria-live="polite">
          <span>{flash || t("pal.hint")}</span>
        </p>
      </div>
    </div>
  );
}
