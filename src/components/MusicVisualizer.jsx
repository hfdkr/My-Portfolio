import { useEffect, useRef } from "react";
import { usePrefs } from "../lib/preferences";
import { usePrefersReducedMotion } from "../lib/hooks";

/*
  Real-time visualizer, driven only by the AnalyserNode (no fake motion):
  - "full": mirrored spectrum bars — the lowest bins in the centre, tallest and
    coloured cobalt → ultraviolet; the highs on the edges as small light flecks —
    a soft bass glow, and the waveform as a thin champagne trace.
  - "mini": five bars for the collapsed button (low → high bands).
  When the music stops, values ease down to an idle line and the loop stops.
  Reduced motion: same data, 30 fps, no glow.
*/

const COLORS = {
  dark: { low: "#7f9aff", mid: "#b08cf5", high: "#3fd0ae", trace: "rgba(216,189,135,0.75)", base: "rgba(241,240,235,0.18)", glow: "65,105,255" },
  light: { low: "#2d4fe0", mid: "#6a3ccf", high: "#0d7d65", trace: "rgba(133,102,42,0.8)", base: "rgba(11,12,17,0.2)", glow: "45,79,224" },
};

export default function MusicVisualizer({ engineRef, playing, variant = "full", className = "" }) {
  const { theme } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const canvas = useRef(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const g = el.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const colors = COLORS[theme] || COLORS.dark;
    const BARS = variant === "mini" ? 5 : 28;
    const heights = new Float32Array(BARS);
    let raf = 0;
    let lastDraw = 0;

    const size = () => {
      const r = el.getBoundingClientRect();
      el.width = Math.max(1, Math.round(r.width * dpr));
      el.height = Math.max(1, Math.round(r.height * dpr));
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    // spectrum bin → bar, on a logarithmic scale (music lives in the low bins)
    const binFor = (i, n, bins) => Math.min(bins - 1, Math.floor(Math.pow(bins * 0.42, (i + 1) / n)));

    function draw(now) {
      raf = 0;
      if (reduced && now - lastDraw < 32) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      const engine = engineRef.current;
      const analyser = engine?.analyser;
      const W = el.width;
      const H = el.height;
      g.clearRect(0, 0, W, H);

      let live = false;
      if (analyser && playing) {
        analyser.getByteFrequencyData(engine.freq);
        live = true;
      }
      const bins = engine?.freq?.length || 512;
      let moving = false;
      for (let i = 0; i < BARS; i++) {
        const target = live ? engine.freq[binFor(i, BARS, bins)] / 255 : 0;
        // fast attack, slow release: reads as music, not jitter
        heights[i] += (target - heights[i]) * (target > heights[i] ? 0.55 : 0.12);
        if (heights[i] > 0.004) moving = true;
      }

      if (variant === "mini") {
        const gap = W / (BARS * 2 + 1);
        for (let i = 0; i < BARS; i++) {
          const h = Math.max(dpr * 1.5, heights[i] * H * 0.95);
          g.fillStyle = i < 2 ? colors.low : i < 4 ? colors.mid : colors.high;
          const x = gap * (1 + i * 2);
          g.fillRect(x, (H - h) / 2, gap, h);
        }
      } else {
        const mid = W / 2;
        const bw = mid / BARS;
        const bass = (heights[0] + heights[1] + heights[2]) / 3;
        if (!reduced && bass > 0.05) {
          const grd = g.createRadialGradient(mid, H / 2, 0, mid, H / 2, H * 1.4);
          grd.addColorStop(0, `rgba(${colors.glow},${0.32 * bass})`);
          grd.addColorStop(1, `rgba(${colors.glow},0)`);
          g.fillStyle = grd;
          g.fillRect(0, 0, W, H);
        }
        // baseline
        g.fillStyle = colors.base;
        g.fillRect(0, H / 2 - dpr * 0.5, W, dpr);
        for (let i = 0; i < BARS; i++) {
          const h = heights[i] * H * 0.92;
          if (h < dpr) continue;
          const t = i / BARS;
          g.fillStyle = t < 0.3 ? colors.low : t < 0.65 ? colors.mid : colors.high;
          g.globalAlpha = t < 0.65 ? 0.95 : 0.6 + heights[i] * 0.4;
          const w = Math.max(dpr, bw * (t < 0.65 ? 0.55 : 0.3));
          // mirrored around the centre: lows in the middle, highs at the edges
          g.fillRect(mid + i * bw + (bw - w) / 2, (H - h) / 2, w, h);
          g.fillRect(mid - (i + 1) * bw + (bw - w) / 2, (H - h) / 2, w, h);
        }
        g.globalAlpha = 1;
        // waveform trace
        if (live && engine.wave) {
          analyser.getByteTimeDomainData(engine.wave);
          g.strokeStyle = colors.trace;
          g.lineWidth = dpr;
          g.beginPath();
          const n = engine.wave.length;
          const stepX = W / (n / 4);
          for (let k = 0, x = 0; k < n; k += 4, x += stepX) {
            const y = (engine.wave[k] / 255) * H;
            if (k === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
          }
          g.stroke();
        }
      }
      // keep animating while there is sound or something still settling
      if (live || moving) raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [engineRef, playing, variant, theme, reduced]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
