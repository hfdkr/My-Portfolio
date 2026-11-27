import { useEffect, useState, useSyncExternalStore } from "react";

/** Current time in a given IANA time zone, refreshed every 20 s. */
export function useLocalTime(timeZone, locale) {
  const format = () => {
    try {
      return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date());
    } catch {
      return "";
    }
  };
  const [time, setTime] = useState(format);
  useEffect(() => {
    setTime(format());
    const id = window.setInterval(() => setTime(format()), 20000);
    return () => window.clearInterval(id);
  }, [timeZone, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  return time;
}

/** Reactive matchMedia. */
export function useMedia(query) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const usePrefersReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
/** Phones and small tablets get the dedicated mobile experience. */
export const useIsMobile = () => useMedia("(max-width: 767px), (pointer: coarse) and (max-width: 1024px)");
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");

let webglCache = null;
/** True when the browser can create a WebGL context. Cached after the first check. */
export function hasWebGL() {
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement("canvas");
    webglCache = !!(window.WebGL2RenderingContext && c.getContext("webgl2")) || !!c.getContext("webgl");
  } catch {
    webglCache = false;
  }
  return webglCache;
}

/** True while the element is near or inside the viewport (used to pause 3D rendering). */
export function useNearViewport(ref, margin = "200px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return near;
}

export const LOCALES = { en: "en-GB", fr: "fr-FR", ar: "ar-MA" };

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
