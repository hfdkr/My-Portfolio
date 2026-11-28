import { useEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { useMusic } from "../audio/MusicProvider";
import { MOVEMENT_ORDER } from "../audio/score";
import { music } from "../data/music";
import MusicVisualizer from "./MusicVisualizer";

const ROMAN = ["I", "II", "III", "IV", "V"];

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
  </svg>
);
const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" fill="currentColor" />
  </svg>
);
const SpeakerIcon = ({ muted }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" fill="currentColor" fillOpacity="0.15" />
    {muted ? <path d="m16 9.5 5 5M21 9.5l-5 5" /> : <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
  </svg>
);
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const STATUS_DOT = {
  idle: "bg-muted",
  loading: "bg-gold animate-pulse",
  playing: "bg-glaze",
  paused: "bg-gold",
  blocked: "bg-coral",
  error: "bg-coral",
};

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Real progress, written straight to the DOM (no re-render): through the current phrase for the
 * live score, through the file for the MP3 (with its time readout).
 */
function usePhraseProgress(engineRef, fillRef, timeRef, active) {
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const loop = () => {
      const pos = engineRef.current?.getPosition();
      if (fillRef.current && pos) fillRef.current.style.transform = `scaleX(${pos.phrase})`;
      if (timeRef?.current && pos?.duration) timeRef.current.textContent = `${clock(pos.current)} / ${clock(pos.duration)}`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [engineRef, fillRef, timeRef, active]);
}

/** First visit: a discreet invitation, a few seconds in. Never plays by itself; can be dismissed for good. */
function Invitation({ onPlay, onDismiss, t }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 3500);
    return () => window.clearTimeout(id);
  }, []);
  if (!shown) return null;
  return (
    <div className="rise-in hud-corners relative flex items-center gap-1 border border-line-strong bg-bg py-1.5 ps-3 pe-1.5 text-[12px] text-ink-2">
      <button type="button" onClick={onPlay} className="group inline-flex min-h-9 items-center gap-2.5 pe-2 text-ink">
        <span className="music-invite-dot" aria-hidden="true" />
        {t("music.invite")}
        <span className="mono text-[10px] tracking-wider text-muted uppercase">{t("music.inviteHint")}</span>
      </button>
      <button type="button" onClick={onDismiss} aria-label={t("music.dismiss")} className="inline-flex h-8 w-8 items-center justify-center text-muted hover:text-ink">
        ×
      </button>
    </div>
  );
}

export default function MusicPlayer() {
  const { t, pick } = usePrefs();
  const m = useMusic();
  const { status, volume, muted, movement, expanded, setExpanded, toggle, setVolume, toggleMute, engineRef, resumeHint, play, source, invited, dismissInvite } = m;
  const isFile = source === "file";
  const playing = status === "playing";
  const panel = useRef(null);
  const playBtn = useRef(null);
  const opener = useRef(null);
  const fill = useRef(null);
  const timeRef = useRef(null);
  const current = MOVEMENT_ORDER.indexOf(movement);
  usePhraseProgress(engineRef, fill, timeRef, expanded && playing);
  const title = isFile ? (music.fileTitle ? pick(music.fileTitle) : t("music.portal")) : pick(music.title);
  const about = music.credit && isFile ? pick(music.credit) : isFile ? t("music.fileAbout") : t("music.about");

  // Esc collapses; focus moves into the panel when it opens and back when it closes
  useEffect(() => {
    if (!expanded) return;
    playBtn.current?.focus();
    const onKey = (e) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, setExpanded]);
  const collapse = () => {
    setExpanded(false);
    opener.current?.focus();
  };

  return (
    <div className="fixed end-4 bottom-4 z-[65] flex flex-col items-end gap-3 sm:end-6 sm:bottom-6">
      {/* expanded console */}
      <section
        ref={panel}
        id="music-panel"
        aria-label={t("music.label")}
        hidden={!expanded}
        className="music-panel hud-corners relative w-[min(340px,calc(100vw-2rem))] border border-line-strong bg-bg p-4 text-ink shadow-[0_40px_90px_-40px_rgb(0_0_0/0.8)]"
      >
        <header className="flex items-center justify-between gap-3">
          <p className="mono text-[10px] tracking-[0.18em] text-muted uppercase">{t("music.channel")}</p>
          <p className="mono flex items-center gap-2 text-[10px] tracking-wider text-ink-2 uppercase" role="status" aria-live="polite">
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden="true" />
            {t(`music.status.${status}`)}
          </p>
        </header>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="serif-italic chrome-ink truncate text-[1.7rem] leading-none">{title}</p>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">{about}</p>
          </div>
        </div>

        {expanded && <MusicVisualizer engineRef={engineRef} playing={playing} className="mt-3 h-32 w-full" />}

        {/* the MP3: real position in the track */}
        {isFile && (
          <div className="mt-3">
            <div className="relative h-[3px] overflow-hidden bg-line" aria-hidden="true">
              <span ref={fill} className="absolute inset-0 origin-left bg-accent rtl:origin-right" style={{ transform: "scaleX(0)" }} />
            </div>
            <p ref={timeRef} className="mono mt-2 text-end text-[10px] text-muted tnum" aria-hidden="true">
              0:00
            </p>
          </div>
        )}

        {/* the live score: five movements; the current one fills with the phrase */}
        {!isFile && (
          <div className="mt-3">
            <div className="flex gap-1" aria-hidden="true">
              {MOVEMENT_ORDER.map((name, i) => (
                <span key={name} className="relative h-[3px] flex-1 overflow-hidden bg-line">
                  {i < current && <span className="absolute inset-0 bg-ink-2/40" />}
                  {i === current && <span ref={fill} className="absolute inset-0 origin-left bg-accent rtl:origin-right" style={{ transform: "scaleX(0)" }} />}
                </span>
              ))}
            </div>
            <p className="mono mt-2 flex justify-between text-[10px] text-muted">
              <span>
                {t("music.movement")} {ROMAN[current]}
              </span>
              <span className="text-ink-2">{t(`music.m.${movement}`)}</span>
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            ref={playBtn}
            type="button"
            onClick={toggle}
            aria-label={playing ? t("music.pause") : t("music.play")}
            className="music-play inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? t("music.unmute") : t("music.mute")}
            aria-pressed={muted}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-ink-2 transition-colors hover:text-accent"
          >
            <SpeakerIcon muted={muted || volume === 0} />
          </button>
          <label className="flex min-w-0 flex-1 items-center gap-2">
            <span className="sr-only">{t("music.volume")}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="music-range min-w-0 flex-1"
              style={{ "--fill": `${(muted ? 0 : volume) * 100}%` }}
            />
            <span className="mono w-8 text-end text-[10px] text-muted tnum">{Math.round((muted ? 0 : volume) * 100)}</span>
          </label>
          <button type="button" onClick={collapse} aria-label={t("music.close")} className="inline-flex h-9 w-7 shrink-0 items-center justify-center text-muted transition-colors hover:text-ink">
            <ChevronIcon />
          </button>
        </div>
      </section>

      {/* resume offer: only if the music was on last visit — never plays by itself */}
      {!invited && !resumeHint && !expanded && status === "idle" && <Invitation onPlay={play} onDismiss={dismissInvite} t={t} />}

      {resumeHint && !expanded && status === "idle" && (
        <div className="rise-in flex items-center gap-3 border border-line-strong bg-bg py-2 ps-3 pe-2 text-[12px] text-ink-2">
          {t("music.resume")}
          <button type="button" onClick={play} className="mono min-h-8 border border-line-strong px-2.5 text-[11px] text-ink hover:border-accent hover:text-accent">
            {t("music.resumeYes")}
          </button>
        </div>
      )}

      {/* collapsed: the instrument */}
      <button
        ref={opener}
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls="music-panel"
        aria-label={expanded ? t("music.close") : t("music.open")}
        data-cursor="open"
        className={`music-orb group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--scrim)/0.85)] text-ink ${playing ? "is-playing" : ""}`}
      >
        <span className="music-ring absolute inset-0 rounded-full" aria-hidden="true" />
        <MusicVisualizer engineRef={engineRef} playing={playing} variant="mini" className="relative h-5 w-6" />
        <span className={`absolute end-0.5 top-0.5 h-2 w-2 rounded-full border border-[rgb(var(--scrim))] ${STATUS_DOT[status]}`} aria-hidden="true" />
      </button>
    </div>
  );
}
