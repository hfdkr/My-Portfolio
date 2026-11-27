import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { useUI, scrollToSection } from "../lib/ui";
import { usePrefersReducedMotion, LOCALES } from "../lib/hooks";
import { run, complete } from "../lib/commands";
import { emit, toast } from "../lib/events";

const PROMPT_USER = "hafid@portfolio";
// The terminal is always dark, whatever the site theme, so its colours are fixed.
const COLORS = {
  accent: "text-[#ff9a6b] underline decoration-[#ff9a6b]/40 underline-offset-2 hover:decoration-[#ff9a6b]",
  title: "font-semibold text-[#f6f0e6]",
  dim: "text-[#9c9286]",
  ok: "text-[#5fd6b5]",
  warn: "text-[#f0b860]",
  err: "text-[#ff7a7a]",
};

function Line({ parts }) {
  return (
    <div dir="auto" className="min-h-[1.5em] whitespace-pre-wrap break-words">
      {parts.map((p, i) =>
        p.href ? (
          <a key={i} href={p.href} target={p.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" className={COLORS.accent}>
            {p.t}
          </a>
        ) : (
          <span key={i} className={p.c ? COLORS[p.c] : undefined}>
            {p.t}
          </span>
        ),
      )}
    </div>
  );
}

export default function Terminal() {
  const prefs = usePrefs();
  const { t, lang } = prefs;
  const { overlay, close } = useUI();
  const open = overlay === "terminal";
  const reduced = usePrefersReducedMotion();

  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [hIndex, setHIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const queue = useRef([]);
  const timer = useRef(0);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const returnFocus = useRef(null);
  const started = useRef(false);
  const pendingLang = useRef(false);

  // Animated output: lines are revealed one by one (instant with reduced motion).
  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    const step = () => {
      const next = queue.current.shift();
      if (!next) {
        setBusy(false);
        return;
      }
      setLines((l) => [...l, next]);
      timer.current = window.setTimeout(step, 16);
    };
    setBusy(true);
    step();
  }, []);

  const print = useCallback(
    (newLines) => {
      if (!newLines.length) return;
      if (reduced) {
        setLines((l) => [...l, ...newLines]);
        return;
      }
      queue.current.push(...newLines);
      if (!busy) flush();
    },
    [reduced, busy, flush],
  );

  // Welcome message the first time it opens.
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    if (!started.current) {
      started.current = true;
      print([[{ t: t("term.welcome") }], [{ t: t("term.hint"), c: "dim" }], [{ t: "" }]]);
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(id);
      if (returnFocus.current && document.contains(returnFocus.current)) returnFocus.current.focus?.();
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Confirm a language change in the new language.
  useEffect(() => {
    if (pendingLang.current) {
      pendingLang.current = false;
      print([[{ t: t("term.lang.done"), c: "ok" }]]);
    }
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const submit = (value) => {
    const echo = [{ t: `${PROMPT_USER}:~$ `, c: "ok" }, { t: value }];
    setLines((l) => [...l, echo]);
    if (value.trim()) {
      setHistory((h) => (h[h.length - 1] === value ? h : [...h, value]));
    }
    setHIndex(-1);
    const res = run(value, {
      ...prefs,
      locale: LOCALES[lang],
    });
    if (res.clear) {
      queue.current = [];
      setLines([]);
      return;
    }
    if (res.close) {
      close();
      return;
    }
    if (res.after === "lang") pendingLang.current = true;
    print(res.lines);
    if (res.wave) {
      window.setTimeout(() => {
        close();
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        emit("wave");
        toast(t("egg.maalem"));
      }, reduced ? 0 : 500);
    }
    if (res.goto) {
      window.setTimeout(() => {
        close();
        scrollToSection(res.goto);
      }, reduced ? 0 : 450);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const i = hIndex === -1 ? history.length - 1 : Math.max(0, hIndex - 1);
      setHIndex(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIndex === -1) return;
      const i = hIndex + 1;
      if (i >= history.length) {
        setHIndex(-1);
        setInput("");
      } else {
        setHIndex(i);
        setInput(history[i]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const { value, options } = complete(input);
      if (options.length > 1) {
        setLines((l) => [...l, [{ t: `${PROMPT_USER}:~$ `, c: "ok" }, { t: input }], [{ t: options.join("   "), c: "dim" }]]);
      }
      setInput(value);
    } else if ((e.ctrlKey || e.metaKey) && (e.key === "l" || e.key === "L")) {
      e.preventDefault();
      queue.current = [];
      setLines([]);
    } else if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C") && !window.getSelection()?.toString()) {
      e.preventDefault();
      setLines((l) => [...l, [{ t: `${PROMPT_USER}:~$ `, c: "ok" }, { t: input + "^C", c: "dim" }]]);
      setInput("");
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  // Keep focus inside the dialog.
  const onDialogKey = (e) => {
    if (e.key !== "Tab" || e.target === inputRef.current) return;
    const focusables = e.currentTarget.querySelectorAll("a[href], button, input");
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" onKeyDown={onDialogKey}>
      <div className="fade-in absolute inset-0 bg-[#080706]/60" onClick={close} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="term-title"
        dir="ltr"
        className="rise-in relative flex h-[min(88dvh,560px)] w-full max-w-3xl flex-col overflow-hidden border border-[#f2ece2]/12 bg-[#11100e] text-[#ece5da] shadow-[0_50px_120px_-30px_rgba(0,0,0,.9)]"
        onClick={() => inputRef.current?.focus()}
      >
        {/* title bar */}
        <div className="flex items-center gap-3 border-b border-[#f2ece2]/10 bg-[#f2ece2]/[0.03] px-4 py-2.5">
          <span className="mono text-xs text-[#ff7a45]" aria-hidden="true">&gt;_</span>
          <p id="term-title" className="mono flex-1 truncate text-center text-xs text-[#9c9286]">
            {PROMPT_USER} — {t("term.title")} — zsh
          </p>
          <button
            type="button"
            onClick={close}
            aria-label={t("term.close")}
            className="mono min-h-8 px-2 text-xs text-[#9c9286] hover:bg-[#f2ece2]/10 hover:text-[#f6f0e6]"
          >
            esc
          </button>
        </div>

        {/* output */}
        <div ref={scrollRef} className="mono flex-1 overflow-y-auto px-4 py-3 text-[13px] leading-[1.55] sm:px-5 sm:text-sm" aria-live="polite">
          {lines.map((parts, i) => (
            <Line key={i} parts={parts} />
          ))}
          {/* prompt */}
          <label className="flex items-baseline gap-0" htmlFor="term-input">
            <span className="shrink-0 text-[#5fd6b5]">{PROMPT_USER}:~$&nbsp;</span>
            <span className="sr-only">{t("term.input")}</span>
            <input
              id="term-input"
              ref={inputRef}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              className="mono min-w-0 flex-1 border-0 bg-transparent p-0 text-[#f6f0e6] caret-[#ff7a45] outline-none focus:outline-none focus-visible:outline-none"
              style={{ outline: "none" }}
            />
          </label>
        </div>

        {/* quick commands for touch users */}
        <div className="mono flex gap-2 overflow-x-auto border-t border-[#f2ece2]/10 px-3 py-2 text-xs">
          {["help", "whoami", "projects", "lab", "skills", "experience", "contact", "clear"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                submit(c);
                inputRef.current?.focus();
              }}
              className="min-h-8 shrink-0 border border-[#f2ece2]/12 px-2.5 text-[#d4ccbf] hover:border-[#ff7a45] hover:text-[#f6f0e6]"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
