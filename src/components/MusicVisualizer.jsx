import { useEffect, useRef } from "react";
import { usePrefs } from "../lib/preferences";
import { usePrefersReducedMotion } from "../lib/hooks";

/*
  A miniature Sound Portal, drawn from the AnalyserNode only — no equalizer bars, no fake motion.
  The ring's outline is the spectrum wrapped around a circle: three contours for the bass,
  mid and high bands (cobalt, violet, emerald), mirrored so the shape stays balanced; a
  waveform halo traces the live signal; a few particles orbit at a speed set by the energy.
  Paused: the contours relax into a circle that breathes slowly (still with reduced motion).
  "mini": just the ring, for the collapsed button.
*/

const PALETTE = {
  dark: { bass: "127,154,255", mid: "176,140,245", high: "63,208,174", silver: "200,204,214", champagne: "216,189,135" },
  light: { bass: "45,79,224", mid: "106,60,207", high: "13,125,101", silver: "92,96,108", champagne: "133,102,42" },
};
const POINTS = 96; // points around the ring
const BANDS = [
  [1, 12, "bass", 1],
  [12, 60, "mid", 0.8],
  [60, 200, "high", 0.6],
];

export default function MusicVisualizer({ engineRef, playing, variant = "full", className = "" }) {
  const { theme } = usePrefs();
  const reduced = usePrefersReducedMotion();
  const canvas = useRef(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const g = el.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pal = PALETTE[theme] || PALETTE.dark;
    const mini = variant === "mini";
    // per band, per point: the current (smoothed) radius offset
    const shape = BANDS.map(() => new Float32Array(POINTS / 2 + 1));
    let energy = 0;
    let orbit = 0;
    let raf = 0;
    let last = performance.now();

    const size = () => {
      const r = el.getBoundingClientRect();
      el.width = Math.max(1, Math.round(r.width * dpr));
      el.height = Math.max(1, Math.round(r.height * dpr));
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    function contour(cx, cy, r0, amp, values) {
      g.beginPath();
      for (let i = 0; i <= POINTS; i++) {
        const a = (i / POINTS) * Math.PI * 2 - Math.PI / 2;
        // mirror: the right half reads the band low → high, the left half mirrors it
        const k = i <= POINTS / 2 ? i : POINTS - i;
        const r = r0 + values[k] * amp;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
    }

    function draw(now) {
      raf = 0;
      const dt = Math.min(0.1, (now - last) / 1000);
      if (reduced && now - last < 32) {
        raf = requestAnimationFrame(draw);
        return;
      }
      last = now;
      const engine = engineRef.current;
      const analyser = engine?.analyser;
      const live = !!(analyser && playing);
      if (live) analyser.getByteFrequencyData(engine.freq);
      const f = engine?.freq;

      let moving = false;
      let sum = 0;
      BANDS.forEach(([a, b], bi) => {
        const arr = shape[bi];
        const n = arr.length;
        for (let k = 0; k < n; k++) {
          const bin = Math.floor(a + ((b - a) * k) / (n - 1));
          const target = live ? f[bin] / 255 : 0;
          arr[k] += (target - arr[k]) * (target > arr[k] ? 0.45 : 0.08);
          if (arr[k] > 0.003) moving = true;
          sum += arr[k];
        }
      });
      energy += ((live ? sum / (shape.length * shape[0].length) : 0) - energy) * 0.1;
      orbit += dt * (0.15 + energy * 2.4);

      const W = el.width;
      const H = el.height;
      g.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const base = Math.min(W, H) * (mini ? 0.26 : 0.27);
      // idle breathing (not with reduced motion): the portal is asleep, not dead
      const breath = reduced ? 0 : Math.sin(now / 1400) * base * 0.03 * (1 - Math.min(1, energy * 3));
      const r0 = base + breath;
      const amp = base * (mini ? 0.9 : 0.75);

      if (!mini && energy > 0.02 && !reduced) {
        const grd = g.createRadialGradient(cx, cy, 0, cx, cy, base * 1.9);
        grd.addColorStop(0, `rgba(${pal.bass},${0.22 * energy})`);
        grd.addColorStop(1, `rgba(${pal.bass},0)`);
        g.fillStyle = grd;
        g.fillRect(0, 0, W, H);
      }

      // the three contours, back to front: high (finest, palest) → bass (strongest)
      for (let bi = BANDS.length - 1; bi >= 0; bi--) {
        const [, , name, weight] = BANDS[bi];
        contour(cx, cy, r0 * (1 - bi * 0.04), amp * weight, shape[bi]);
        g.strokeStyle = `rgba(${pal[name]},${mini ? 0.95 : 0.5 + 0.4 * weight})`;
        g.lineWidth = dpr * (mini ? 1.4 : bi === 0 ? 1.6 : 1);
        g.stroke();
      }

      if (!mini) {
        // waveform halo: the live signal wrapped around the ring
        if (live && engine.wave) {
          analyser.getByteTimeDomainData(engine.wave);
          const wv = engine.wave;
          g.beginPath();
          for (let i = 0; i <= POINTS; i++) {
            const a = (i / POINTS) * Math.PI * 2 - Math.PI / 2;
            const s = (wv[Math.floor((i / POINTS) * (wv.length - 1))] - 128) / 128;
            const r = r0 * 1.32 + s * base * 0.35;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (i === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
          }
          g.strokeStyle = `rgba(${pal.champagne},0.45)`;
          g.lineWidth = dpr * 0.8;
          g.stroke();
        }
        // orbiting particles — their speed is the music's energy
        for (let i = 0; i < 7; i++) {
          const a = orbit * (i % 2 ? 1 : -0.7) + (i * Math.PI * 2) / 7;
          const r = r0 * (1.5 + 0.12 * Math.sin(orbit * 1.3 + i));
          g.fillStyle = `rgba(${i % 3 === 0 ? pal.high : i % 3 === 1 ? pal.silver : pal.mid},${0.35 + energy * 1.5})`;
          g.beginPath();
          g.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, dpr * (1 + energy * 2), 0, Math.PI * 2);
          g.fill();
        }
      }

      // keep animating while there is sound, while settling, or to breathe (idle, motion allowed)
      if (live || moving || (!reduced && !mini)) raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [engineRef, playing, variant, theme, reduced]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
