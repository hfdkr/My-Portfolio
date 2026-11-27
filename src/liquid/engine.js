/* ----------------------------------------------------------------------------
   LIQUID CHROME ENGINE — the living page background.

   One canvas, one full-screen triangle, one fragment shader, plain WebGL
   (no three.js: a shader-only effect does not need a scene graph).

   Alive on its own: the flow never stops, the warp breathes, the light orbits,
   and every few seconds a drop falls somewhere on the metal.
   Alive with you: the pointer stirs a vortex, pulls the metal and leaves rings;
   scrolling fast stirs it too; hovering a link or button swells the metal under it.

   Budget: renders at ~half resolution (lowered automatically if frames get slow),
   stops when the tab is hidden, ~20 uniforms per frame and no allocations in the loop.
   Reduced motion → "gentle": a slow drift at 30 fps, no ripples, no vortex.
---------------------------------------------------------------------------- */

import { VERTEX, fragment, RIPPLES } from "./shader.js";
import { ATMOSPHERES } from "./atmospheres.js";
import { sampleLevels } from "../audio/levels.js";

const NUMERIC = ["presence", "warp", "iri", "speed", "focus", "tilt"];
const COLORS = ["bg", "floor", "sky", "box", "key", "hue"];

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const toState = (a) => ({
  ...Object.fromEntries(NUMERIC.map((k) => [k, a[k]])),
  ...Object.fromEntries(COLORS.map((k) => [k, hexToRgb(a[k])])),
});
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const approach = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

function compile(gl, type, source) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`Liquid shader failed to compile: ${log}`);
  }
  return s;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ theme: "dark" | "light", section?: string, mobile?: boolean, reduced?: boolean,
 *           onReady?: () => void, onLost?: () => void }} options
 */
export function createLiquid(canvas, { theme = "dark", section = "top", mobile = false, reduced = false, onReady, onLost }) {
  const attrs = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false };
  const gl = canvas.getContext("webgl2", attrs) || canvas.getContext("webgl", attrs);
  if (!gl) throw new Error("WebGL unavailable");

  const gentle = reduced; // reduced motion: slow drift, no ripples, no vortex
  const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  let frag = fragment({ octaves: mobile ? 2 : 3, ripples: !gentle });
  if (!hp || hp.precision === 0) frag = frag.replace("precision highp float;", "precision mediump float;");

  const program = gl.createProgram();
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "link failed");
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  for (const name of ["uEnergy", "uBass", "uHigh", "uRes", "uTime", "uBreath", "uMouse", "uPush", "uSwirl", "uAttract", "uRip", "uScroll", "uWarp", "uIri", "uPresence", "uFocus", "uTilt", "uBg", "uFloor", "uSky", "uBox", "uKey", "uHue"]) {
    U[name] = gl.getUniformLocation(program, name);
  }

  // ------------------------------------------------------------ state
  let themeName = theme;
  let sectionName = ATMOSPHERES[theme][section] ? section : "top";
  const current = toState(ATMOSPHERES[themeName][sectionName]);
  let target = toState(ATMOSPHERES[themeName][sectionName]);

  const pointer = { x: 0.66, y: 0.55, tx: 0.66, ty: 0.55, push: 0, tpush: 0, swirl: 0, tswirl: 0, last: -1e9, rx: 0.66, ry: 0.55, rt: 0 };
  const attract = { x: 0.5, y: 0.5, s: 0, ts: 0, tx: 0.5, ty: 0.5 };
  const ripples = new Float32Array(RIPPLES * 4); // x, y, age, amplitude — a ring buffer
  let rippleIndex = 0;
  let nextDrop = 2.5; // seconds until the next autonomous drop
  let scroll = 0;
  let scrollTarget = 0;
  let scrollEnergy = 0;
  let lastScrollY = window.scrollY;
  let flow = 11.3; // start mid-flow, not at the noise origin
  let clock = 0;
  let boost = 0; // easter egg: mercury mode
  const music = { energy: 0, bass: 0, high: 0, pulse: 0, lastDrop: 0 }; // smoothed soundtrack levels

  // loop state (declared before anything can request a frame)
  let raf = 0;
  let running = false;
  let last = performance.now();
  let ready = false;
  let divisor = gentle ? 2 : 1; // draw 1 frame in `divisor`: 1 = 60 fps, 2 = 30, 4 = 15
  let tick = 0;
  const times = [];

  // ------------------------------------------------------------ resolution
  let scale = mobile ? 0.42 : Math.min(window.devicePixelRatio || 1, 1.5) * 0.55;
  const minScale = mobile ? 0.28 : 0.32;
  function resize() {
    const w = Math.max(1, Math.round(canvas.clientWidth * scale));
    const h = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      // resizing clears the buffer: redraw now, or the next composite shows an empty (black) frame
      if (ready) draw();
    }
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  function drop(x, y, amp) {
    if (gentle) return;
    const i = rippleIndex * 4;
    ripples[i] = x;
    ripples[i + 1] = y;
    ripples[i + 2] = 0;
    ripples[i + 3] = amp;
    rippleIndex = (rippleIndex + 1) % RIPPLES;
  }

  // ------------------------------------------------------------ input
  const onPointer = (e) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const nx = e.clientX / window.innerWidth;
    const ny = 1 - e.clientY / window.innerHeight;
    const dx = nx - pointer.tx;
    const dy = ny - pointer.ty;
    const speed = Math.hypot(dx, dy);
    pointer.tx = nx;
    pointer.ty = ny;
    pointer.tpush = clamp(0.4 + speed * 22, 0.4, 1);
    // the vortex turns with the motion: one direction spins one way, the other the other
    pointer.tswirl = clamp(pointer.tswirl + (dx - dy) * 9, -1.4, 1.4);
    pointer.last = performance.now();
    // rings along the path, spaced so a sweep leaves a wake, not a smear
    if (Math.hypot(nx - pointer.rx, ny - pointer.ry) > 0.045 && clock - pointer.rt > 0.07) {
      drop(nx, ny, clamp(0.02 + speed * 1.4, 0.02, 0.07));
      pointer.rx = nx;
      pointer.ry = ny;
      pointer.rt = clock;
    }
  };
  // touch screens: a tap drops a ring where the finger lands
  const onTap = (e) => {
    if (e.pointerType === "touch") drop(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight, 0.07);
  };
  const onScroll = () => {
    const y = window.scrollY;
    scrollTarget = (y / window.innerHeight) * 0.32;
    scrollEnergy = clamp(scrollEnergy + Math.abs(y - lastScrollY) / window.innerHeight, 0, 1.5);
    lastScrollY = y;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pointerdown", onTap, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  scrollEnergy = 0;

  // ------------------------------------------------------------ frame
  function glide(dt) {
    const k = 1 - Math.exp(-dt * 2.2);
    for (const key of NUMERIC) current[key] += (target[key] - current[key]) * k;
    for (const key of COLORS) {
      const c = current[key];
      const t = target[key];
      for (let i = 0; i < 3; i++) c[i] += (t[i] - c[i]) * k;
    }
  }

  function simulate(dt, now) {
    clock += dt;
    const energy = Math.min(1, scrollEnergy);
    flow += dt * (gentle ? 0.08 : 0.75) * (current.speed + boost * 1.6 + (gentle ? 0 : energy * 0.9));
    scrollEnergy = approach(scrollEnergy, 0, 2.2, dt);
    boost = Math.max(0, boost - dt * 0.22);

    // idle (or touch): the light wanders on its own, on incommensurate orbits
    const idle = now - pointer.last > 2500;
    if (idle) {
      const c = gentle ? clock * 0.25 : clock; // reduced motion: the light barely drifts
      pointer.tx = 0.62 + Math.sin(c * 0.23) * 0.2 + Math.sin(c * 0.071) * 0.08;
      pointer.ty = 0.52 + Math.cos(c * 0.17) * 0.16 + Math.sin(c * 0.053) * 0.06;
      pointer.tpush = 0.35;
      pointer.tswirl = Math.sin(clock * 0.09) * 0.45;
    }
    pointer.x = approach(pointer.x, pointer.tx, idle ? 1.1 : 6, dt);
    pointer.y = approach(pointer.y, pointer.ty, idle ? 1.1 : 6, dt);
    pointer.push = approach(pointer.push, pointer.tpush + energy * 0.3, 3, dt);
    pointer.tpush = approach(pointer.tpush, 0.4, 1.2, dt);
    pointer.swirl = approach(pointer.swirl, gentle ? 0 : pointer.tswirl, 2.5, dt);
    pointer.tswirl = approach(pointer.tswirl, 0, 0.8, dt);

    attract.x = approach(attract.x, attract.tx, 7, dt);
    attract.y = approach(attract.y, attract.ty, 7, dt);
    attract.s = approach(attract.s, attract.ts, 4, dt);

    // autonomous drops, at irregular intervals, near the wandering light
    nextDrop -= dt;
    if (nextDrop <= 0) {
      nextDrop = 2.2 + Math.random() * 3.4;
      if (idle) drop(clamp(pointer.x + (Math.random() - 0.5) * 0.3, 0.05, 0.95), clamp(pointer.y + (Math.random() - 0.5) * 0.3, 0.05, 0.95), 0.035 + Math.random() * 0.025);
    }
    for (let i = 0; i < RIPPLES; i++) {
      const j = i * 4;
      if (ripples[j + 3] <= 0) continue;
      ripples[j + 2] += dt;
      if (ripples[j + 2] > 2.6) ripples[j + 3] = 0;
    }

    // the soundtrack, when it plays: smoothed so the metal breathes rather than flickers
    const lv = sampleLevels();
    const on = lv.active && !gentle;
    // energy = the steady glow; pulse = the phrasing (swells and entries) on top of it
    music.energy = approach(music.energy, on ? lv.energy * 0.6 + lv.pulse * 0.4 : 0, 3, dt);
    music.bass = approach(music.bass, on ? lv.bass * 0.35 + lv.pulse * 0.65 : 0, 6, dt);
    music.high = approach(music.high, on ? lv.high : 0, 5, dt);
    // a musical entry (a jump above the recent average) drops a soft ring under the light
    if (on && lv.pulse > 0.5 && music.pulse <= 0.5 && clock - music.lastDrop > 1.4) {
      drop(pointer.x, pointer.y, 0.03);
      music.lastDrop = clock;
    }
    music.pulse = on ? lv.pulse : 0;

    scroll = approach(scroll, scrollTarget, 6, dt);
    glide(dt);
  }

  function draw() {
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, flow);
    gl.uniform1f(U.uBreath, Math.sin(flow * 0.11) * Math.cos(flow * 0.047));
    gl.uniform2f(U.uMouse, pointer.x, pointer.y);
    gl.uniform1f(U.uPush, pointer.push);
    gl.uniform1f(U.uSwirl, pointer.swirl);
    gl.uniform3f(U.uAttract, attract.x, attract.y, attract.s);
    gl.uniform4fv(U.uRip, ripples);
    gl.uniform1f(U.uScroll, scroll);
    gl.uniform1f(U.uWarp, current.warp + boost * 0.4);
    gl.uniform1f(U.uIri, Math.min(1, current.iri + boost * 0.5));
    gl.uniform1f(U.uPresence, Math.min(1, current.presence + boost * 0.4));
    gl.uniform1f(U.uFocus, current.focus);
    gl.uniform1f(U.uTilt, current.tilt);
    gl.uniform1f(U.uEnergy, music.energy);
    gl.uniform1f(U.uBass, music.bass);
    gl.uniform1f(U.uHigh, music.high);
    gl.uniform3fv(U.uBg, current.bg);
    gl.uniform3fv(U.uFloor, current.floor);
    gl.uniform3fv(U.uSky, current.sky);
    gl.uniform3fv(U.uBox, current.box);
    gl.uniform3fv(U.uKey, current.key);
    gl.uniform3fv(U.uHue, current.hue);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Quality ladder for slow GPUs: first fewer pixels, then fewer frames.
  // The liquid always keeps moving, but never at the expense of scrolling and input.
  function adapt(ms) {
    if (divisor >= 4) return;
    times.push(ms);
    if (times.length < 45) return;
    times.sort((a, b) => a - b);
    const median = times[22];
    times.length = 0;
    if (median <= 22 * divisor) return; // on budget
    if (scale > minScale) {
      scale = Math.max(minScale, scale * 0.82);
      resize();
    } else {
      divisor *= 2;
    }
  }

  function frame(now) {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(frame);
    // gentle mode (and slow GPUs) draw one frame in `divisor`
    if (++tick % divisor !== 0) return;
    const dt = Math.min(0.15, (now - last) / 1000);
    last = now;
    simulate(dt, now);
    draw();
    if (!ready) {
      ready = true;
      onReady?.();
    } else if (!gentle) adapt(dt * 1000);
  }

  function start() {
    if (running || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  }
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);

  const lost = (e) => {
    e.preventDefault();
    stop();
    onLost?.();
  };
  canvas.addEventListener("webglcontextlost", lost);

  resize();
  start();

  return {
    setSection(name) {
      if (!ATMOSPHERES[themeName][name] || name === sectionName) return;
      sectionName = name;
      target = toState(ATMOSPHERES[themeName][name]);
    },
    setTheme(name) {
      if (!ATMOSPHERES[name]) return;
      themeName = name;
      target = toState(ATMOSPHERES[name][sectionName]);
      current.bg = [...target.bg]; // the page colour follows the CSS theme switch at once
    },
    /** A hovered element: the metal swells under it and the light leans toward it. */
    attract(x, y, strength) {
      attract.tx = x;
      attract.ty = y;
      attract.ts = strength;
      if (strength > 0 && attract.s < 0.05) {
        attract.x = x;
        attract.y = y;
      }
    },
    /** Easter egg: everything turns iridescent and flows faster for a few seconds. */
    mercury() {
      boost = 1;
      for (let i = 0; i < 4; i++) drop(0.2 + Math.random() * 0.6, 0.2 + Math.random() * 0.6, 0.08);
    },
    dispose() {
      stop();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onTap);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", lost);
      // Free GPU objects but keep the context: the same <canvas> gets a new engine when
      // settings change (reduced motion, mobile), and a lost context can't be reused.
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
