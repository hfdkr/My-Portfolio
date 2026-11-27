import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { KEYS, read, write } from "./storage";
import { ui } from "../i18n/ui";

export const LANGS = ["en", "fr", "ar"];
const PrefsContext = createContext(null);

function initialLang() {
  const saved = read(KEYS.lang);
  return LANGS.includes(saved) ? saved : "en"; // English is the default
}

function initialTheme() {
  // index.html already resolved saved theme / OS preference before first paint
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function PreferencesProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  const [theme, setThemeState] = useState(initialTheme);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    document.title = ui[lang]["meta.title"];
    document.querySelector('meta[name="description"]')?.setAttribute("content", ui[lang]["meta.description"]);
  }, [lang, dir]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((m) => m.setAttribute("content", theme === "dark" ? "#090a0e" : "#f1f0eb"));
  }, [theme]);

  const setLang = useCallback((next) => {
    if (!LANGS.includes(next)) return;
    write(KEYS.lang, next);
    setLangState(next);
  }, []);

  const setTheme = useCallback((next) => {
    if (next !== "dark" && next !== "light") return;
    const root = document.documentElement;
    root.classList.add("theme-transition");
    write(KEYS.theme, next);
    setThemeState(next);
    window.setTimeout(() => root.classList.remove("theme-transition"), 700);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(() => {
    const dict = ui[lang];
    const t = (key, vars) => {
      let s = dict[key] ?? ui.en[key] ?? key;
      if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k]);
      return s;
    };
    // Content objects in src/data are written as { en, fr, ar }.
    const pick = (obj) => {
      if (obj == null || typeof obj !== "object" || Array.isArray(obj)) return obj;
      return obj[lang] ?? obj.en;
    };
    return { lang, dir, theme, setLang, setTheme, toggleTheme, t, pick };
  }, [lang, dir, theme, setLang, setTheme, toggleTheme]);

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside <PreferencesProvider>");
  return ctx;
}
