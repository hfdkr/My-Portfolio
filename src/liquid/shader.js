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

export const fragment = ({ octaves, ripples = true, particles = 40 }) => /* glsl */ `
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

// The Sound Portal: a ring of the same liquid metal, risen from the surface.
uniform float uPortal;     // 0 hidden → 1 revealed (grows from nothing on activation)
uniform float uPortalLive; // 0 dormant (music paused) → 1 listening
uniform vec3  uPortalGeo;  // centre x, y (0..1 screen) and radius (plane units)
uniform float uPortalTime; // the portal's own clock: turns faster with the music's energy
uniform vec3  uAudio;      // portal's view of the music: bass, mid, high (0 when silent)

#define OCTAVES ${octaves}
#define BUMP 0.04
#define RIPPLES ${ripples ? RIPPLES : 0}
#define PARTICLES ${particles}

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

vec2 mouseP, attractP, portalP;

// The portal's rim radius at angle a: breathes with the bass, carries a slow wave (mids)
// and a fine shimmer (highs), plus a little noise so it never looks drawn with a compass.
// Noise is sampled on the circle (cos a, sin a) — no seam at ±π.
float portalRadius(float a) {
  float t = uPortalTime;
  float live = uPortalLive;
  float R = uPortalGeo.z * (1.0 + uAudio.x * 0.16 * live);
  R += 0.016 * sin(a * 5.0 + t * 0.9) * (0.35 + uAudio.y * 1.4 * live);
  R += 0.008 * sin(a * 11.0 - t * 1.7) * (0.2 + uAudio.z * 1.8 * live);
  R += 0.014 * snoise(vec2(cos(a), sin(a)) * 1.3 + vec2(t * 0.11, -t * 0.07));
  return R * uPortal;
}

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

  // the Sound Portal rises out of the metal; inside, the surface settles into a calm, deep mirror
  if (uPortal > 0.001) {
    vec2 d = p - portalP;
    float pr = length(d);
    float R = portalRadius(atan(d.y, d.x));
    float w = 0.05 + 0.02 * uAudio.x * uPortalLive;
    float rim = exp(-(pr - R) * (pr - R) / (w * w));
    h += rim * (0.45 + 0.45 * (uAudio.x * 0.6 + uAudio.y * 0.4) * uPortalLive) * uPortal;
    float inside = smoothstep(R, R * 0.62, pr) * uPortal;
    float pulse = sin(pr * 38.0 - uPortalTime * 3.2) * 0.05 * uAudio.x * uPortalLive;
    h = mix(h, h * 0.12 + pulse, inside);
  }

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
  portalP = plane(uPortalGeo.xy);

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

  // ---- the Sound Portal: depth inside, orbiting particles on the rim ----
  float portalMask = 0.0;
  if (uPortal > 0.001) {
    vec2 pd = p - portalP;
    float pr = length(pd);
    float PR = portalRadius(atan(pd.y, pd.x));
    float live = uPortalLive;
    // inside: deep space seen through the metal — a slow swirl in the signature hues
    float inside = smoothstep(PR, PR * 0.7, pr) * uPortal;
    vec2 q = rot(uPortalTime * 0.08 + pr * 4.0) * pd;
    float n = fbm2(q * 4.5 + vec2(uPortalTime * 0.05, 0.0));
    vec3 cobalt = vec3(0.255, 0.412, 1.0), violet = vec3(0.537, 0.341, 0.898), emerald = vec3(0.086, 0.659, 0.537);
    vec3 silver = vec3(0.78, 0.8, 0.86), champagne = vec3(0.847, 0.741, 0.529);
    vec3 nebula = mix(mix(cobalt, violet, 0.5 + 0.5 * n), emerald, smoothstep(0.35, 0.9, n) * (0.25 + uAudio.y * 0.5 * live));
    vec3 deep = uBg * 0.55 + nebula * (0.12 + 0.22 * uAudio.y * live) * smoothstep(-0.2, 0.8, n);
    deep += champagne * pow(max(0.0, 1.0 - pr / (PR + 1e-4)), 7.0) * (0.06 + 0.22 * uAudio.x * live); // a faint core
    col = mix(col, deep + col * 0.3, inside * 0.88);
    // the rim catches extra light on the bass
    float rimLight = exp(-pow((pr - PR) / 0.03, 2.0)) * uPortal;
    col += mix(silver, champagne, 0.5) * rimLight * (0.06 + 0.3 * uAudio.x * live);
    // particles in orbit, each at its own speed and direction; the highs make them sparkle
    if (abs(pr - PR) < 0.17) {
      for (int i = 0; i < PARTICLES; i++) {
        float fi = float(i);
        float seed = fract(sin(fi * 12.9898) * 43758.5453);
        float dir = seed > 0.45 ? 1.0 : -0.6;
        float ang = fi * 6.2831853 / float(PARTICLES) + uPortalTime * (0.18 + seed * 0.3) * dir;
        float rad = portalRadius(ang) + (seed - 0.5) * 0.09 + 0.02 * sin(uPortalTime * (1.1 + seed) + fi);
        vec2 pp = portalP + vec2(cos(ang), sin(ang)) * rad;
        float size = 0.003 + 0.0035 * uAudio.z * live + 0.0015 * seed;
        float dd = length(p - pp);
        float b = exp(-dd * dd / (size * size));
        float k = mod(fi, 5.0);
        vec3 pc = k < 1.0 ? cobalt : k < 2.0 ? violet : k < 3.0 ? emerald : k < 4.0 ? silver : champagne;
        float sparkle = 0.55 + 0.45 * sin(uPortalTime * (3.0 + seed * 4.0) + fi * 2.3);
        col += pc * b * (0.35 + 0.65 * sparkle * (0.4 + uAudio.z * live)) * uPortal;
      }
    }
    // around the portal the liquid is fully present, whatever the section — the portal is a window
    portalMask = smoothstep(PR + 0.22, PR - 0.05, pr) * uPortal;
  }

  // where the pool lives on screen, fading into the far layer
  vec2 c = (uv - vec2(0.5 + uFocus * 0.28, 0.5)) * vec2(aspect, 1.0);
  float pool = smoothstep(1.4, 0.12, length(c));
  col = mix(far, col, clamp((uPresence + uEnergy * 0.14) * pool + portalMask, 0.0, 1.0));
  col *= 1.0 + uEnergy * 0.1; // the light breathes with the music

  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;
