// GLSL for the living liquid chrome. GLSL ES 1.0 so it runs on WebGL 1 and 2.
//
// Surface: a height field of domain-warped simplex noise (noise feeding noise),
// seen in perspective as a plane that recedes into haze. The flow never repeats
// visibly: every layer moves at its own, incommensurate speed, and the warp
// itself "breathes".
// Pointer: twists space into a vortex around the cursor, pulls the metal toward
// it, and leaves rings that travel outward (up to 8 alive at once).
// Hover: an attractor under the hovered element swells the metal.
// Colour: what a mirror with that normal reflects in a procedural photo studio,
// thin-film iridescence on grazing angles, a specular light that follows the
// pointer, and a slow far layer of light behind the pool for depth.

export const VERTEX = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const RIPPLES = 8;

export const fragment = ({ octaves, ripples = true }) => /* glsl */ `
precision highp float;

uniform vec2  uRes;        // drawing-buffer size, px
uniform float uTime;       // flow time (already scaled by the section's speed)
uniform float uBreath;     // slow breathing of the warp, -1..1
uniform vec2  uMouse;      // pointer, 0..1, y up
uniform float uPush;       // how much the pointer bends the metal (0..1)
uniform float uSwirl;      // vortex strength around the pointer (signed: follows motion)
uniform vec3  uAttract;    // hovered element: x, y (0..1), strength
uniform vec4  uRip[${RIPPLES}];  // ripples: x, y (0..1), age (s), amplitude
uniform float uScroll;     // scroll offset, moves the liquid with the page
uniform float uWarp;       // domain-warp amount: calm 0.4 … wild 1.2
uniform float uIri;        // iridescence amount
uniform float uPresence;   // 0 = page background only, 1 = full liquid
uniform float uFocus;      // where the pool lives horizontally (-1 left … 1 right)
uniform float uTilt;       // perspective: 0 flat … 1.2 deep horizon
uniform float uEnergy;     // soundtrack: overall level (0 when silent)
uniform float uBass;       // soundtrack: low end
uniform float uHigh;       // soundtrack: high end
uniform vec3  uBg, uFloor, uSky, uBox, uKey, uHue;

#define OCTAVES ${octaves}
#define BUMP 0.04
#define RIPPLES ${ripples ? RIPPLES : 0}

// --- 2D simplex noise (Ashima Arts / Stefan Gustavson, MIT) ---------------
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);
float fbm2(vec2 p) { return 0.6 * snoise(p) + 0.3 * snoise(ROT * p * 2.02); }
float fbm(vec2 p) {
  float s = 0.0, a = 0.55;
  for (int i = 0; i < OCTAVES; i++) { s += a * snoise(p); p = ROT * p * 2.02; a *= 0.36; }
  return s;
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

float aspect;

// screen (0..1) → point on the metal plane, in perspective: the top of the
// screen is farther away, so the same features look smaller there.
vec2 plane(vec2 uv) {
  vec2 c = (uv - 0.5) * vec2(aspect, 1.0);
  float w = 1.0 + uTilt * (c.y + 0.5) * 0.95;
  return vec2(c.x * w, (c.y + 0.5) * w * (1.0 + uTilt * 0.3) - 0.5) * 0.56 + vec2(0.0, uScroll);
}

vec2 mouseP, attractP;

float field(vec2 p) {
  // vortex + pull around the pointer: the metal is stirred, not just dented
  vec2 m = p - mouseP;
  float dm = dot(m, m);
  float fall = exp(-dm * 2.2);
  p = mouseP + rot(uSwirl * fall) * m - m * (0.22 * uPush * fall);

  float t = uTime;
  float warp = uWarp * (1.0 + 0.18 * uBreath);
  vec2 q = vec2(fbm2(p + vec2(0.0, 0.10 * t)), fbm2(p + vec2(5.2, 1.3) - 0.083 * t));
  vec2 r = vec2(fbm2(p + warp * q + vec2(1.7, 9.2) + 0.127 * t), fbm2(p + warp * q + vec2(8.3, 2.8) - 0.0961 * t));
  float h = fbm(p + warp * r + vec2(0.031 * t, -0.017 * t));

  h += (uPush * 0.5 + uBass * 0.35) * exp(-dm * 3.2);    // the dome under the cursor (the bass deepens it)
  vec2 a = p - attractP;
  h += uAttract.z * 0.55 * exp(-dot(a, a) * 3.0);        // hovered element: the metal swells

  #if RIPPLES > 0
  for (int i = 0; i < RIPPLES; i++) {                    // rings travelling away from the cursor's path
    vec4 rp = uRip[i];
    if (rp.w <= 0.0) continue;
    float d = length(p - plane(rp.xy)) - rp.z * 0.55;
    h += rp.w * sin(d * 34.0) * exp(-d * d * 60.0) * exp(-rp.z * 1.4);
  }
  #endif
  return h;
}

vec3 studio(vec3 r) {
  vec3 c = mix(uFloor, uSky, smoothstep(-0.7, 0.75, r.y));
  c += uBox * 0.9 * smoothstep(0.22, 0.0, abs(r.x - 0.42 + 0.18 * r.y));
  c += uBox * 0.45 * smoothstep(0.16, 0.0, abs(r.x + 0.55 - 0.1 * r.y));
  c += uKey * 1.15 * pow(smoothstep(0.45, 1.0, r.y), 3.0);
  c += uKey * 0.3 * smoothstep(0.14, 0.0, abs(r.y + 0.12));
  return c;
}

vec3 film(float x) {
  x = fract(x);
  vec3 c = mix(uBox, uHue, smoothstep(0.0, 0.4, x));
  c = mix(c, uKey, smoothstep(0.4, 0.7, x));
  return mix(c, uBox, smoothstep(0.7, 1.0, x));
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  aspect = uRes.x / uRes.y;
  vec2 p = plane(uv);
  mouseP = plane(uMouse);
  attractP = plane(uAttract.xy);

  float e = 1.5 / uRes.y * 0.56 * (1.0 + uTilt * uv.y * 0.95);
  float h  = field(p);
  float hx = field(p + vec2(e, 0.0));
  float hy = field(p + vec2(0.0, e));
  vec3 n = normalize(vec3(-(hx - h) / e * BUMP, -(hy - h) / e * BUMP, 1.0));

  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  vec3 col = studio(r);
  float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.2);
  col = mix(col, film(h * 1.4 + fres * 1.6 + uTime * 0.05), uIri * (0.2 + 0.8 * fres));

  // the light follows the pointer, and leans toward a hovered element
  vec2 lp = mix(uMouse, uAttract.xy, uAttract.z * 0.6);
  vec3 L = normalize(vec3((lp - 0.5) * vec2(aspect, 1.0) * 1.3, 0.85));
  float spec = pow(max(dot(r, L), 0.0), 70.0);
  col += uKey * spec * (1.1 + uAttract.z * 0.8);

  // depth: haze toward the horizon (top of the screen)
  float haze = smoothstep(0.3, 1.0, uv.y) * uTilt * 0.7;
  col = mix(col, mix(uBg, uSky, 0.55), clamp(haze, 0.0, 0.82));

  // far layer: slow ribbons of light behind the pool — keeps the edges alive
  vec2 fp = (uv - 0.5) * vec2(aspect, 1.0) * 0.8;
  float ribbon = fbm2(fp * 1.3 + vec2(uTime * 0.021, -uTime * 0.013) + fbm2(fp * 0.7 - uTime * 0.011));
  vec3 far = uBg + (mix(uBox, uHue, 0.5 + 0.5 * ribbon) - uBg) * smoothstep(0.15, 0.85, ribbon) * (0.16 + uEnergy * 0.12);

  // star dust: sparse specks drifting slowly through the far layer; the music's highs make them twinkle
  vec2 sp = gl_FragCoord.xy / uRes.y * 46.0 + vec2(uTime * 0.35, uTime * 0.12);
  vec2 cell = floor(sp);
  float rnd = hash(cell);
  vec2 pos = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5;
  float speck = step(0.972, rnd) * smoothstep(0.22, 0.0, length(fract(sp) - 0.5 - pos * 0.5));
  float twinkle = 0.55 + 0.45 * sin(uTime * 3.0 + rnd * 60.0);
  far += uKey * speck * twinkle * (0.12 + uHigh * 0.9 + uEnergy * 0.25);

  // where the pool lives on screen, fading into the far layer
  vec2 c = (uv - vec2(0.5 + uFocus * 0.28, 0.5)) * vec2(aspect, 1.0);
  float pool = smoothstep(1.4, 0.12, length(c));
  col = mix(far, col, clamp((uPresence + uEnergy * 0.14) * pool, 0.0, 1.0));
  col *= 1.0 + uEnergy * 0.1; // the light breathes with the music

  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;
