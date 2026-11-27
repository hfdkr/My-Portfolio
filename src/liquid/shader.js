// GLSL for the liquid chrome surface. GLSL ES 1.0 so it runs on WebGL 1 and 2.
//
// The surface is a height field h(p) made of domain-warped fractal noise
// (noise fed through noise fed through noise — Inigo Quilez's technique), which
// gives the slow, folding, organic motion of a liquid. Its normal comes from
// two extra samples; the colour comes from what a mirror with that normal would
// reflect in a procedural "studio" (sky gradient, softboxes, horizon line), plus
// a thin-film iridescence on grazing angles and a specular light that follows
// the pointer. No textures, no video: all of it is maths, computed per pixel.

export const VERTEX = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const fragment = ({ octaves }) => /* glsl */ `
precision highp float;

uniform vec2  uRes;       // drawing-buffer size, px
uniform float uTime;      // flow time (already scaled by the section's speed)
uniform vec2  uMouse;     // pointer, 0..1, y up
uniform float uPush;      // how much the pointer bends the surface (0..1)
uniform float uScroll;    // scroll offset, moves the liquid with the page
uniform float uWarp;      // domain-warp amount: calm 1.2 … wild 3.6
uniform float uIri;       // iridescence amount
uniform float uPresence;  // 0 = page background only, 1 = full liquid
uniform float uFocus;     // where the liquid lives horizontally (-1 left … 1 right)
uniform vec3  uBg;        // page background (the liquid fades into it)
uniform vec3  uFloor;     // reflected floor
uniform vec3  uSky;       // reflected sky
uniform vec3  uBox;       // softboxes / first iridescent hue
uniform vec3  uKey;       // key light / highlights
uniform vec3  uHue;       // second iridescent hue

#define OCTAVES ${octaves}

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

// fractal noise, each octave rotated so no grid direction shows
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < OCTAVES; i++) {
    s += a * snoise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return s;
}

vec2 mouseP;

float field(vec2 p) {
  float t = uTime;
  vec2 q = vec2(fbm(p + vec2(0.0, 0.12 * t)), fbm(p + vec2(5.2, 1.3) - 0.1 * t));
  vec2 r = vec2(fbm(p + uWarp * q + vec2(1.7, 9.2) + 0.15 * t), fbm(p + uWarp * q + vec2(8.3, 2.8) - 0.126 * t));
  float h = fbm(p + uWarp * r);
  // the pointer presses a soft dome into the metal
  vec2 m = p - mouseP;
  h += uPush * 0.55 * exp(-dot(m, m) * 2.6);
  return h;
}

// a photographer's studio, as seen in a mirror
vec3 studio(vec3 r) {
  vec3 c = mix(uFloor, uSky, smoothstep(-0.7, 0.75, r.y));
  c += uBox * 0.9 * smoothstep(0.22, 0.0, abs(r.x - 0.42 + 0.18 * r.y));   // tall softbox, right
  c += uBox * 0.45 * smoothstep(0.16, 0.0, abs(r.x + 0.55 - 0.1 * r.y));   // fill, left
  c += uKey * 1.15 * pow(smoothstep(0.45, 1.0, r.y), 3.0);                  // key light above
  c += uKey * 0.5 * smoothstep(0.06, 0.0, abs(r.y + 0.12));                 // horizon line
  return c;
}

// thin-film colour: cycles through the two signature hues and the key light
vec3 film(float x) {
  x = fract(x);
  vec3 c = mix(uBox, uHue, smoothstep(0.0, 0.4, x));
  c = mix(c, uKey, smoothstep(0.4, 0.7, x));
  return mix(c, uBox, smoothstep(0.7, 1.0, x));
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  float zoom = 1.7;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * zoom + vec2(0.0, uScroll);
  mouseP = (uMouse - 0.5) * vec2(aspect, 1.0) * zoom + vec2(0.0, uScroll);

  float e = 2.0 / uRes.y * zoom;
  float h  = field(p);
  float hx = field(p + vec2(e, 0.0));
  float hy = field(p + vec2(0.0, e));
  vec3 n = normalize(vec3(-(hx - h) / e * 0.22, -(hy - h) / e * 0.22, 1.0));

  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  vec3 col = studio(r);

  float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.2);
  col = mix(col, film(h * 1.4 + fres * 1.6 + uTime * 0.03), uIri * (0.2 + 0.8 * fres));

  // the light follows the pointer
  vec3 L = normalize(vec3((uMouse - 0.5) * vec2(aspect, 1.0) * 1.3, 0.85));
  float spec = pow(max(dot(r, L), 0.0), 70.0);
  col += uKey * spec * 1.1;

  // where the liquid lives on screen: a soft pool, shifted by uFocus, fading into the page
  vec2 c = (uv - vec2(0.5 + uFocus * 0.28, 0.52)) * vec2(aspect, 1.0);
  float pool = smoothstep(1.35, 0.15, length(c));
  col = mix(uBg, col, clamp(uPresence * pool, 0.0, 1.0));

  // dither: no banding in the dark gradients
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;
