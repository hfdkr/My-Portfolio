import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePrefs } from "../lib/preferences";
import { useIsMobile } from "../lib/hooks";
import { KEYS, read, write } from "../lib/storage";
import { ScrollTrigger } from "../lib/gsap";
import { toast, emit } from "../lib/events";
import { SECTION_ORDER } from "../liquid/atmospheres";
import { SECTION_TO_MOVEMENT } from "./score";
import { setLevelSampler } from "./levels";
import { music } from "../data/music";

/*
  The soundtrack's state, shared by the player, the command menu and the terminal.
  The engine (and its AudioContext) is created on the first Play — never before a
  user gesture, so the site never makes a sound on its own.
  Saved per visitor: volume, mute, and whether the music was on (to offer a resume).
*/

const MusicContext = createContext(null);

function loadPrefs() {
  try {
    const p = JSON.parse(read(KEYS.music) || "{}");
    return {
      volume: typeof p.volume === "number" ? Math.min(1, Math.max(0, p.volume)) : 0.7,
      muted: p.muted === true,
      on: p.on === true,
      invited: p.invited === true,
    };
  } catch {
    return { volume: 0.7, muted: false, on: false, invited: false };
  }
}

export function MusicProvider({ children }) {
  const { t } = usePrefs();
  const mobile = useIsMobile();
  const saved = useRef(loadPrefs()).current;
  const [status, setStatus] = useState("idle"); // idle | loading | playing | paused | blocked | error
  const [volume, setVolumeState] = useState(saved.volume);
  const [muted, setMuted] = useState(saved.muted);
  const [movement, setMovement] = useState("intro");
  const [expanded, setExpanded] = useState(false);
  const [resumeHint, setResumeHint] = useState(saved.on);
  const [source, setSource] = useState(null); // "file" (the MP3) | "score" (fallback) | null before the first play
  const [invited, setInvited] = useState(saved.invited);
  const engineRef = useRef(null);
  const pendingMovement = useRef("intro"); // the section's movement, known before the first play
  const tRef = useRef(t);
  tRef.current = t;
  const prefsRef = useRef({ volume: saved.volume, muted: saved.muted });
  prefsRef.current = { volume, muted };

  // The engine module (score, instruments, scheduler) loads on the first Play only.
  // The AudioContext itself is created synchronously inside the click: Safari only
  // lets sound start from a context created and resumed during the gesture.
  const contextRef = useRef(null);
  const loading = useRef(null);
  const engine = useCallback(async () => {
    if (engineRef.current) return engineRef.current;
    if (!loading.current) {
      loading.current = import("./engine").then(({ AudioEngine }) => {
        const e = new AudioEngine({
          context: contextRef.current,
          file: music.file,
          lite: mobile,
          onStatus: (st) => {
            setStatus(st);
            if (st === "blocked") toast(tRef.current("music.blocked"));
            if (st === "error") toast(tRef.current("music.error"));
          },
          onMovement: setMovement,
          onSource: setSource,
        });
        e.setVolume(prefsRef.current.volume);
        e.setMuted(prefsRef.current.muted);
        setLevelSampler((out) => {
          e.getLevels(out);
          out.active = e.status === "playing";
        });
        engineRef.current = e;
        return e;
      });
    }
    return loading.current;
  }, [mobile]);

  const unlock = () => {
    // inside the user gesture: create + resume now, before any await
    if (contextRef.current) return contextRef.current.resume().catch(() => {});
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      contextRef.current = new AC({ latencyHint: "playback" });
      contextRef.current.resume().catch(() => {});
    } catch {
      contextRef.current = null;
    }
  };

  // persist preferences
  const persist = useCallback((patch) => {
    const next = { ...loadPrefs(), ...patch };
    write(KEYS.music, JSON.stringify(next));
  }, []);

  const play = useCallback(async () => {
    setResumeHint(false);
    unlock();
    if (!contextRef.current) {
      setStatus("error");
      toast(tRef.current("music.error"));
      return;
    }
    if (!engineRef.current) setStatus("loading");
    let e;
    try {
      e = await engine();
    } catch {
      setStatus("error");
      toast(tRef.current("music.error"));
      return;
    }
    e.setMovement(pendingMovement.current);
    const st = await e.play();
    if (st === "playing") {
      persist({ on: true, invited: true });
      setInvited(true);
      emit("portal", true); // the Sound Portal opens — and stays, dormant, when paused
    }
  }, [engine, persist]); // eslint-disable-line react-hooks/exhaustive-deps

  const pause = useCallback(() => {
    engineRef.current?.pause();
    persist({ on: false });
  }, [persist]);

  const toggle = useCallback(() => {
    if (engineRef.current?.status === "playing") pause();
    else play();
  }, [play, pause]);

  const setVolume = useCallback(
    (v) => {
      setVolumeState(v);
      engineRef.current?.setVolume(v);
      if (v > 0 && muted) {
        setMuted(false);
        engineRef.current?.setMuted(false);
      }
      persist({ volume: v, muted: v > 0 ? false : muted });
    },
    [muted, persist],
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      engineRef.current?.setMuted(!m);
      persist({ muted: !m });
      return !m;
    });
  }, [persist]);

  // The page tells the music where the visitor is; the engine decides when to move (next chord/phrase).
  useEffect(() => {
    const triggers = SECTION_ORDER.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (!self.isActive) return;
          pendingMovement.current = SECTION_TO_MOVEMENT[id];
          engineRef.current?.setMovement(SECTION_TO_MOVEMENT[id]);
        },
      });
    }).filter(Boolean);
    return () => triggers.forEach((tr) => tr.kill());
  }, []);

  // full cleanup when the app unmounts
  useEffect(
    () => () => {
      engineRef.current?.dispose();
      engineRef.current = null;
      setLevelSampler(null);
    },
    [],
  );

  const dismissInvite = useCallback(() => {
    setInvited(true);
    persist({ invited: true });
  }, [persist]);

  const value = useMemo(
    () => ({ status, volume, muted, movement, expanded, resumeHint, source, invited, dismissInvite, setExpanded, play, pause, toggle, setVolume, toggleMute, engineRef }),
    [status, volume, muted, movement, expanded, resumeHint, source, invited, dismissInvite, play, pause, toggle, setVolume, toggleMute],
  );
  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside <MusicProvider>");
  return ctx;
}
