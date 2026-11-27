/* ----------------------------------------------------------------------------
   ZELLIGE FIELD — the hero centrepiece.

   A floor of glazed eight-point stars (khatam), the classic Moroccan zellige
   motif. A warm light follows the pointer; it rises through the cross-shaped
   gaps between the tiles — the code under the surface.

   Engineering choices (performance is part of the design):
   - Plain three.js, no React renderer: one InstancedMesh = one draw call for
     every tile, plus one plane for the grout light.
   - All motion (entrance, hover lift, scroll peel, easter-egg wave) runs in the
     vertex shader from a handful of uniforms. The CPU only updates ~8 numbers
     per frame — no per-tile JavaScript.
   - Renders only while visible and the tab is active; drops its pixel ratio by
     itself if frames get slow; renders on demand with reduced motion.
---------------------------------------------------------------------------- */

import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Fog,
  HemisphereLight,
  InstancedBufferAttribute,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  ShaderMaterial,
  Shape,
  SRGBColorSpace,
  UniformsLib,
  UniformsUtils,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const THEMES = {
  dark: {
    bg: "#0d0c0b",
    grout: "#0a0908",
    groutGlow: "#ff6a2e",
    light: "#ff8a52",
    lightIntensity: 34,
    key: "#ffe9d6",
    keyIntensity: 0.13,
    hemiSky: "#2e2926",
    hemiGround: "#080706",
    hemiIntensity: 0.07,
    env: 0.045,
    exposure: 1,
    // glaze mix: base tiles, then accents placed by the pattern
    base: ["#161412", "#13110f", "#191714", "#100f0d"],
    ember: "#b8461f",
    green: "#1d5b4b",
    bone: "#cfc3ae",
  },
  light: {
    bg: "#f1ece3",
    grout: "#a8987f",
    groutGlow: "#ff7a3a",
    light: "#ffb07a",
    lightIntensity: 16,
    key: "#fff1df",
    keyIntensity: 1.25,
    hemiSky: "#fffaf2",
    hemiGround: "#9c8f7c",
    hemiIntensity: 0.45,
    env: 0.22,
    exposure: 0.92,
    base: ["#e4dac9", "#e9e0d1", "#ddd2c0", "#e6ddcd"],
    ember: "#b5492a",
    green: "#24604f",
    bone: "#2b2520",
  },
};

/** Eight-point star: outer tips at radius R, inner corners where the two squares cross. */
function starShape(R) {
  const shape = new Shape();
  const inner = R * (Math.SQRT1_2 / Math.cos(Math.PI / 8));
  for (let k = 0; k < 16; k++) {
    const a = (k * Math.PI) / 8;
    const r = k % 2 === 0 ? R : inner;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (k === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function tileGeometry(R, mobile) {
  const g = new ExtrudeGeometry(starShape(R), {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.03,
    bevelSegments: mobile ? 1 : 2,
    curveSegments: 1,
  });
  g.rotateX(-Math.PI / 2); // extrude upwards (+Y), star lies flat on XZ
  g.computeVertexNormals();
  return g;
}

/** Pattern rule → which glaze a tile gets. A designed rosette, not random noise. */
function glazeFor(i, j) {
  const diamond = Math.abs(i) + Math.abs(j);
  if (i === 0 && j === 0) return "bone";
  // sparse lattice of rosettes: an ember star with four green neighbours
  const u = ((i - j) % 8 + 8) % 8;
  const v = ((i + j) % 8 + 8) % 8;
  if (u === 0 && v === 0) return "ember";
  if ((u === 1 && v === 1) || (u === 7 && v === 7)) return "green";
  return "base";
}

const VERT_PARS = /* glsl */ `
uniform float uTime;
uniform vec3 uPointer;
uniform float uHover;
uniform float uIntro;
uniform float uScroll;
uniform float uWave;
attribute float aSeed;
varying float vGlow;
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
`;

const VERT_MOTION = /* glsl */ `
vec3 iPos = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
vec2 toTile = iPos.xz - uPointer.xz;
float dist = length(toTile);
float hover = smoothstep(2.8, 0.0, dist) * uHover;
vec2 away = dist > 0.001 ? toTile / dist : vec2(0.0);

// Entrance: tiles are laid from the centre outwards, like an artisan setting them.
float delay = length(iPos.xz) * 0.055 + aSeed * 0.35;
float intro = clamp((uIntro - delay) / 0.7, 0.0, 1.0);
float ie = 1.0 - pow(1.0 - intro, 4.0);

// Leaving the hero: the nearest rows lift off first.
float nz = clamp((iPos.z + 9.0) / 18.0, 0.0, 1.0);
float peel = clamp(uScroll * 1.7 - (1.0 - nz) * 0.7 - aSeed * 0.12, 0.0, 1.0);
peel = peel * peel;

// Easter egg: a flip wave that spirals out from the centre.
float w = clamp(uWave * 16.0 - length(iPos.xz) * 0.75 - aSeed * 0.4, 0.0, 1.0);
float we = w * w * (3.0 - 2.0 * w);

float ax = (1.0 - ie) * (aSeed - 0.5) * 2.4 + peel * 2.6 + we * 6.28318 - away.y * hover * 0.32;
float az = (1.0 - ie) * (aSeed - 0.5) * 1.6 + away.x * hover * 0.32;
mat3 tileRot = rotZ(az) * rotX(ax);

float breathe = sin(iPos.x * 0.35 + uTime * 0.55) * cos(iPos.z * 0.3 + uTime * 0.42) * 0.045;
float lift = hover * 0.38 + (1.0 - ie) * (2.6 + aSeed * 2.2) + peel * (1.6 + aSeed * 1.8) + sin(we * 3.14159) * 0.9 + breathe;
float grow = mix(0.35, 1.0, ie);
vGlow = hover;
`;

const GROUT_VERT = /* glsl */ `
varying vec3 vWorld;
#include <fog_pars_vertex>
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const GROUT_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uGlow;
uniform vec3 uPointer;
uniform float uHover;
uniform float uTime;
uniform float uIntro;
varying vec3 vWorld;
#include <fog_pars_fragment>
void main() {
  float d = distance(vWorld.xz, uPointer.xz);
  float pool = exp(-d * d * 0.3) * (0.3 + 0.7 * uHover);
  float drift = 0.5 + 0.5 * sin(vWorld.x * 0.22 + uTime * 0.25) * sin(vWorld.z * 0.27 - uTime * 0.2);
  float lit = clamp(uIntro, 0.0, 1.0);
  vec3 col = uColor + uGlow * (pool * pool * 1.6 + drift * 0.035) * lit;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`;

/**
 * Create the scene on a canvas.
 * @returns {{ setTheme, setScroll, wave, dispose, tiles: number }}
 */
export function createZellige(canvas, { theme = "dark", mobile = false, reduced = false, onFirstFrame, onContextLost } = {}) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: window.devicePixelRatio < 2,
    alpha: false,
    powerPreference: "high-performance",
    stencil: false,
  });
  const maxDpr = mobile ? 1.5 : 1.75;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new Scene();
  const FOV = mobile ? 40 : 30;
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 80);
  const camBase = new Vector3(0, mobile ? 12 : 12.5, mobile ? 8 : 10.5);
  const camTarget = new Vector3(0, 0, mobile ? 0.2 : -1.2);
  camera.position.copy(camBase);
  camera.lookAt(camTarget);

  // Environment for the glaze reflections — generated once, never re-rendered.
  const pmrem = new PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  pmrem.dispose();

  // ------------------------------------------------------------ tiles
  const spacing = 1;
  const R = spacing * 0.5 * 0.955;
  const cols = mobile ? 15 : 37;
  const rows = mobile ? 19 : 27;
  const count = cols * rows;
  const geometry = tileGeometry(R, mobile);

  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new Vector3(0, 0, 0) },
    uHover: { value: 0 },
    uIntro: { value: reduced ? 4 : 0 },
    uScroll: { value: 0 },
    uWave: { value: 0 },
  };

  const MaterialClass = mobile ? MeshStandardMaterial : MeshPhysicalMaterial;
  const material = new MaterialClass({
    roughness: 0.24,
    metalness: 0,
    ...(mobile ? {} : { clearcoat: 1, clearcoatRoughness: 0.14 }),
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERT_PARS}`)
      .replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>\n${VERT_MOTION}\nobjectNormal = tileRot * objectNormal;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\ntransformed = tileRot * (transformed * grow) + vec3(0.0, lift, 0.0);`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying float vGlow;`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vGlow * 0.18;`);
  };

  const mesh = new InstancedMesh(geometry, material, count);
  mesh.frustumCulled = false; // vertices move in the shader; the CPU bounds would be wrong
  const seeds = new Float32Array(count);
  const glazes = [];
  const dummy = new Object3D();
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = c - (cols - 1) / 2;
      const j = r - (rows - 1) / 2;
      dummy.position.set(i * spacing, 0, j * spacing);
      dummy.updateMatrix();
      mesh.setMatrixAt(k, dummy.matrix);
      // deterministic "hand-made" variation
      seeds[k] = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
      glazes.push(glazeFor(i, j));
      k++;
    }
  }
  geometry.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);

  // ------------------------------------------------------------ grout light
  const groutUniforms = UniformsUtils.merge([
    UniformsLib.fog,
    {
      uColor: { value: new Color() },
      uGlow: { value: new Color() },
    },
  ]);
  groutUniforms.uPointer = uniforms.uPointer;
  groutUniforms.uHover = uniforms.uHover;
  groutUniforms.uTime = uniforms.uTime;
  groutUniforms.uIntro = uniforms.uIntro;
  const groutMaterial = new ShaderMaterial({ uniforms: groutUniforms, vertexShader: GROUT_VERT, fragmentShader: GROUT_FRAG, fog: true });
  const grout = new Mesh(new PlaneGeometry(cols * spacing + 30, rows * spacing + 30), groutMaterial);
  grout.rotation.x = -Math.PI / 2;
  grout.position.y = -0.02;
  scene.add(grout);

  // ------------------------------------------------------------ lights
  const hemi = new HemisphereLight();
  const key = new DirectionalLight();
  key.position.set(-5, 9, 3);
  const lamp = new PointLight("#ffffff", 1, 8, 2);
  lamp.position.set(0, 1.4, 0);
  scene.add(hemi, key, lamp);

  // ------------------------------------------------------------ theme
  const tmp = new Color();
  function setTheme(name) {
    const t = THEMES[name] || THEMES.dark;
    scene.background = new Color(t.bg);
    const far = name === "light" ? 1.25 : 1; // daylight carries further than the night
    scene.fog = new Fog(t.bg, (mobile ? 11 : 13) * far, (mobile ? 24 : 27) * far);
    groutUniforms.fogColor.value.set(t.bg);
    groutUniforms.fogNear.value = scene.fog.near;
    groutUniforms.fogFar.value = scene.fog.far;
    groutUniforms.uColor.value.set(t.grout);
    groutUniforms.uGlow.value.set(t.groutGlow);
    hemi.color.set(t.hemiSky);
    hemi.groundColor.set(t.hemiGround);
    hemi.intensity = t.hemiIntensity;
    key.color.set(t.key);
    key.intensity = t.keyIntensity;
    lamp.color.set(t.light);
    lamp.intensity = t.lightIntensity;
    material.envMapIntensity = t.env;
    renderer.toneMappingExposure = t.exposure;
    for (let n = 0; n < count; n++) {
      const g = glazes[n];
      if (g === "base") tmp.set(t.base[Math.floor(seeds[n] * t.base.length)]);
      else tmp.set(t[g]);
      mesh.setColorAt(n, tmp);
    }
    mesh.instanceColor.needsUpdate = true;
    requestRender();
  }

  // ------------------------------------------------------------ size
  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the field filling narrow screens
    camera.fov = FOV * (camera.aspect < 1 ? 1.12 : 1);
    camera.updateProjectionMatrix();
    requestRender();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ------------------------------------------------------------ pointer
  const ray = new Raycaster();
  const ndc = new Vector2();
  const hit = new Vector3();
  const target = new Vector3(0, 0, 0);
  let hoverTarget = 0;
  let lastMove = -1e9;

  function onPointerMove(e) {
    if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const r = canvas.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) {
      hoverTarget = 0;
      return;
    }
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    // intersect with y = 0 analytically
    const o = ray.ray.origin;
    const d = ray.ray.direction;
    if (Math.abs(d.y) < 1e-4) return;
    const tHit = -o.y / d.y;
    if (tHit < 0) return;
    hit.copy(d).multiplyScalar(tHit).add(o);
    target.set(hit.x, 0, hit.z);
    hoverTarget = 1;
    lastMove = performance.now();
    requestRender();
  }
  function onPointerLeave() {
    hoverTarget = 0;
    requestRender();
  }
  if (!mobile) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
  }

  // ------------------------------------------------------------ loop
  let running = false;
  let visible = true;
  let raf = 0;
  let last = performance.now();
  let elapsed = 0;
  let first = true;
  let needsRender = true;
  let introDone = reduced;
  let introStart = -1;
  let compiled = false;
  let disposed = false;
  let scrollTarget = 0;
  let waveStart = -1;
  const frameTimes = [];
  let qualitySteps = 0;

  function requestRender() {
    needsRender = true;
    if (compiled && reduced && !raf && visible) raf = requestAnimationFrame(tick);
  }

  function adaptQuality(dt) {
    if (qualitySteps >= 2 || !introDone) return;
    frameTimes.push(dt);
    if (frameTimes.length < 90) return;
    frameTimes.sort((a, b) => a - b);
    const median = frameTimes[45];
    frameTimes.length = 0;
    if (median > 21 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.5);
      renderer.setPixelRatio(dpr);
      resize();
      qualitySteps++;
    } else if (median <= 21) {
      qualitySteps = 2; // good enough — stop measuring
    }
  }

  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (!reduced) {
      elapsed += dt;
      uniforms.uTime.value = elapsed;
      if (!introDone) {
        // wall-clock, so a slow device never gets a stretched entrance
        if (introStart < 0) introStart = now;
        uniforms.uIntro.value = ((now - introStart) / 1000) * 1.15;
        if (uniforms.uIntro.value > 3.2) introDone = true;
      }
    }

    // pointer: mouse on desktop, a slow wandering light on touch screens
    if (mobile) {
      const t = reduced ? 0 : elapsed;
      target.set(Math.sin(t * 0.21) * 3.2, 0, Math.cos(t * 0.15) * 3.6 - 0.5);
      hoverTarget = 0.85;
    } else if (now - lastMove > 4000 && !reduced) {
      // idle: drift the light slowly so the scene never looks frozen
      target.x = MathUtils.damp(target.x, Math.sin(elapsed * 0.2) * 5, 0.6, dt);
      target.z = MathUtils.damp(target.z, Math.cos(elapsed * 0.16) * 2.5 - 1, 0.6, dt);
    }
    const p = uniforms.uPointer.value;
    const k1 = reduced ? 1 : 1 - Math.exp(-6 * dt);
    p.lerp(target, k1);
    uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * (reduced ? 1 : 1 - Math.exp(-4 * dt));
    uniforms.uScroll.value += (scrollTarget - uniforms.uScroll.value) * (reduced ? 1 : 1 - Math.exp(-8 * dt));

    if (waveStart >= 0) {
      const w = (now - waveStart) / 2600;
      uniforms.uWave.value = Math.min(1.6, w);
      if (w > 1.6) {
        waveStart = -1;
        uniforms.uWave.value = 0;
      }
    }

    lamp.position.set(p.x, 1.35 + (1 - uniforms.uHover.value) * 0.6, p.z + 0.4);

    // gentle camera parallax toward the light, plus a tilt as the hero scrolls away
    const s = uniforms.uScroll.value;
    camera.position.set(camBase.x + p.x * 0.05, camBase.y - s * 1.2, camBase.z + p.z * 0.03 - s * 0.8);
    camera.lookAt(camTarget.x + p.x * 0.04, camTarget.y, camTarget.z - s * 1.5);

    renderer.render(scene, camera);
    needsRender = false;
    if (first) {
      first = false;
      onFirstFrame?.();
    } else if (!reduced) adaptQuality(dt * 1000);

    if (running && !reduced) raf = requestAnimationFrame(tick);
    else if (reduced && (waveStart >= 0 || needsRender)) raf = requestAnimationFrame(tick);
  }

  function start() {
    if (!compiled || running || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      if (reduced) requestRender();
      else start();
    } else stop();
  });
  io.observe(canvas);
  const onVisibility = () => (document.hidden ? stop() : reduced ? requestRender() : start());
  document.addEventListener("visibilitychange", onVisibility);

  const onLost = (e) => {
    e.preventDefault();
    stop();
    onContextLost?.();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  setTheme(theme);
  resize();
  // Compile the shaders without blocking the main thread where the driver allows it
  // (KHR_parallel_shader_compile), then start drawing.
  const begin = () => {
    if (disposed) return;
    compiled = true;
    if (reduced) requestRender();
    else start();
  };
  if (renderer.extensions.has("KHR_parallel_shader_compile")) renderer.compileAsync(scene, camera).then(begin, begin);
  else begin();

  return {
    tiles: count,
    setTheme,
    setScroll(v) {
      scrollTarget = v;
      if (reduced) requestRender();
    },
    wave() {
      waveStart = performance.now();
      if (reduced) {
        // no motion: a single quiet glow instead of the flip wave
        waveStart = -1;
        uniforms.uHover.value = 1;
        requestRender();
        return;
      }
      start();
    },
    dispose() {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      geometry.dispose();
      material.dispose();
      grout.geometry.dispose();
      groutMaterial.dispose();
      envTexture.dispose();
      renderer.dispose();
    },
  };
}
