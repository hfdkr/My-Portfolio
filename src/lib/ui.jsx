import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Which overlay is open: null | "terminal" | "palette"
const UIContext = createContext(null);

export const SECTIONS = ["resume", "about", "work", "skills", "experience", "contact"];

export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function UIProvider({ children }) {
  const [overlay, setOverlay] = useState(null);

  const openTerminal = useCallback(() => setOverlay("terminal"), []);
  const openPalette = useCallback(() => setOverlay("palette"), []);
  const close = useCallback(() => setOverlay(null), []);

  // Global shortcuts: Ctrl/⌘ K → command menu, Ctrl/⌘ ` → terminal.
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOverlay((o) => (o === "palette" ? null : "palette"));
      } else if (mod && (e.key === "`" || e.code === "Backquote")) {
        e.preventDefault();
        setOverlay((o) => (o === "terminal" ? null : "terminal"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock page scroll while an overlay is open.
  useEffect(() => {
    if (!overlay) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [overlay]);

  const value = useMemo(() => ({ overlay, openTerminal, openPalette, close }), [overlay, openTerminal, openPalette, close]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}
