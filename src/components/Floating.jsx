import { useState } from "react";
import { usePrefs } from "../lib/preferences";
import { useUI } from "../lib/ui";

/** Status widget (bottom start) + floating terminal button (bottom end). */
export default function Floating() {
  const { t } = usePrefs();
  const { openTerminal, overlay } = useUI();
  const [openNote, setOpenNote] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex items-end justify-between gap-3 p-3 sm:p-5">
        {/* Status — manual, not a live feed */}
        <div className="pointer-events-auto relative">
          <button
            type="button"
            onClick={() => setOpenNote((o) => !o)}
            aria-expanded={openNote}
            aria-describedby="status-note"
            className="panel flex min-h-11 items-center gap-2.5 rounded-full px-4 text-[13px] font-medium text-ink"
          >
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="pulse-ring absolute inset-0 rounded-full bg-amber" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-amber" />
            </span>
            <span className="sr-only">{t("status.label")}: </span>
            <span className="max-w-[56vw] truncate sm:max-w-none">{t("status.text")}</span>
          </button>
          <p
            id="status-note"
            role="note"
            className={`panel absolute bottom-full mb-2 w-max max-w-[80vw] rounded-lg px-3 py-2 text-xs text-muted transition-all duration-300 start-0 ${
              openNote ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
            }`}
          >
            {t("status.note")}
          </p>
        </div>

        {/* Floating terminal */}
        <button
          type="button"
          onClick={openTerminal}
          aria-label={t("pal.openTerminal")}
          aria-haspopup="dialog"
          className={`pointer-events-auto group relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0c22] text-[#52e0ff] shadow-[0_18px_40px_-14px_rgba(10,12,34,.9),0_0_0_1px_rgba(139,125,255,.25)] transition-transform duration-300 hover:-translate-y-0.5 ${
            overlay === "terminal" ? "opacity-0" : ""
          }`}
        >
          <span className="mono text-sm font-bold" aria-hidden="true" dir="ltr">
            &gt;_
          </span>
          <span className="absolute -top-1 -end-1 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
