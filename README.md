# Hafid Karkouch — Portfolio (v4, "Liquid chrome")

A cinematic, fast personal site in English, French and Arabic (full RTL), with designed night and day themes.
The signature is a procedural liquid-metal surface that lives behind the whole page and changes mood with each section.

## The liquid

`src/liquid/` — one canvas, one full-screen triangle, one fragment shader. Plain WebGL: no three.js, no textures,
no video. The engine is **5.7 KB gzipped**.

- **Surface** — a height field of domain-warped simplex noise (noise feeding noise), seen in **perspective** as a
  plane receding into haze, with a slower far layer of light ribbons behind it. Normals come from two extra samples.
- **Always alive** — every layer flows at its own, incommensurate speed; the warp slowly "breathes"; the light
  orbits on its own when you stop moving; a drop falls somewhere on the metal every 2–6 s.
- **Pointer** — stirs a **vortex** that turns with your motion, pulls the metal toward the cursor, and leaves
  **ripple rings** along its path (8 alive at once). On touch screens, a tap drops a ring.
- **Micro-interactions** — hovering a button, link, project preview or heading swells the metal under it and leans
  the light toward it (one delegated listener for the whole page).
- **Scroll** — carries the liquid with the page; scrolling fast stirs it. Each section has its own atmosphere
  (`atmospheres.js`: presence, warp, iridescence, speed, position, perspective, five reflected colours) and the
  engine glides between them. Hero: cobalt + ultraviolet. About: emerald + champagne. Work: steel. Skills: violet.
  Experience: champagne. Contact: ultraviolet with a coral horizon. Light theme: pearl chrome.
- **Material** — a mirror reflecting a procedural photo studio, thin-film iridescence on grazing angles, a
  specular light that follows the pointer.

Verified in the browser (engine clock and frame captures): 60 fps and a flow of 0.75 units/s at full motion;
30 fps and 0.08 units/s with reduced motion; the screen changes on its own with no input; a mouse sweep and a
hovered button change the metal locally, measurably more than elsewhere.

**Reduced motion** keeps a "gentle" liquid: about 9× slower, 30 fps, no ripples, no vortex, light barely drifting.

## The soundtrack — "Gravity Well"

An **original generative score**, written for this site and performed live in the browser with the Web Audio API.
It quotes no existing piece (no copyrighted recording or composition is used) and nothing is downloaded.

- **Instruments** (`src/audio/instruments.js`): church organ (additive drawbars, two detuned ranks), piano, detuned
  pads, glassy arpeggio with echo, sub bass, a wooden ticking clock, noise swells — in a generated 5 s cathedral reverb.
- **Score** (`src/audio/score.js`): 66 BPM, three progressions in D (suspended minor → lifted major → home), four
  arpeggio figures and three piano motifs that rotate every phrase, so it develops instead of looping.
- **Five movements** follow the page: *Signal* (hero) → *Drift* (about) → *Gravity* (skills, experience) →
  *Ascent* (work: organ climax, swells) → *Home* (contact: resolves to D major). Changes wait for the next chord or
  phrase — scrolling never jerks the music. A movement also grows fuller the longer the visitor stays in it.
- **Engine** (`src/audio/engine.js`): lookahead scheduler on the audio clock; pause = fade out then suspend the
  context, so play resumes exactly where it was. Loaded only on the first Play (≈3.7 KB gzipped).
- **Player** (`components/MusicPlayer.jsx`): a small instrument in the corner (turning chrome ring, five live bars,
  status dot) that opens into a console — status, title, live spectrum + waveform (`MusicVisualizer.jsx`, fed only by
  the AnalyserNode), the five-movement journey with real phrase progress, play/pause, mute, volume.
- **The page listens**: the liquid reads the same live levels — energy raises its glow, the phrasing pulses the
  metal under the light and drops soft rings, the highs make the star dust twinkle. Silent → no effect.
- **Respectful by default**: no sound before the visitor presses Play (no AudioContext is even created); if the
  browser still blocks audio, a short message says to press Play. Volume, mute and "was on" are remembered — on the
  next visit the player *offers* to resume, it never starts by itself. Also in the command menu and the terminal
  (`music on | off`). Fully translated, RTL-aware, both themes.

**Using a licensed recording instead**: put the file in `public/audio/`, set `file` and `credit` in
`src/data/music.js`. If the file is missing or fails, the live score takes over automatically.

## Identity

- **Colour hierarchy** — obsidian dominates; cobalt and ultraviolet are the identity; emerald for live states and
  small surprises; champagne gold for luxury details; coral almost never; pearl for type; steel for secondary text.
  Raw colours (`--cobalt`…) are for graphics, `--accent*` tokens are their WCAG-AA text versions per theme.
- **Type** — Bricolage Grotesque (display, optical size + weight), Fraunces italic in *chrome ink* (a gradient fixed
  to the viewport, so it shimmers while scrolling), Geist, Geist Mono; Noto Kufi / Noto Sans Arabic.
- **Mark** — a ring of liquid metal holding one reflected droplet.

## Interactive typography

`src/components/InteractiveText.jsx` — letters react one at a time.

```jsx
<InteractiveText as="h2" text="Three projects, *told honestly*." data-split />
<Marked text="I {design} interfaces, {build} them…" />   // only {marked} words react
```

- Hover is pure CSS (`:hover`, `:has()` for the two neighbours): no JavaScript, no React re-render per letter.
- Each letter takes a hue from the palette by position (cobalt · ultraviolet · emerald · champagne), lifts, grows and
  tilts ±4°; neighbours follow at a third. Fast in, slow out.
- Hero name: a pointer field (`useLetterField`) — closeness to the cursor drives lift, colour and Bricolage weight.
- Arabic is never split into letters (that breaks letter joining): each Arabic word reacts as one unit.
- Screen readers get the text once, selection/copy stays clean, keyboard focus sends a wave through link letters,
  touch gets a tap response, reduced motion keeps colour only.

## Sections

Hero · CV (recruiter view + original PDF: download, preview) · About (+ development philosophy) · Selected work (three chapters: problem → what I did → what it taught me,
full-screen case studies) · From the lab (course REST APIs with their real routes) · Toolbox (solid = in practice,
outlined = learning) · Experience & education · Contact.

## Other features

- **Terminal** (`Ctrl + \``) — parser, history, Tab completion: `help about whoami skills projects lab experience
  education contact github social date clear lang theme goto open exit`. A few commands are not listed.
- **Command menu** (`Ctrl K` / `⌘K`), **context cursor** ("View", "Open", "Copy", "Write").
- **Secrets** — the Konami code, five quick clicks on the logo, the browser console.

## Performance (production build, measured)

| Scenario | LCP | CLS | Long tasks while scrolling |
|---|---|---|---|
| Desktop, no WebGL (still image) | 0.36 s | 0.000 | 0 |
| Desktop, WebGL rendered on the CPU (worst case) | 0.65 s | 0.000 | 3* |
| Mobile, 4× CPU throttle | 1.48 s | 0.000 | 0 |

\* only when the shader runs in software (first seconds, before the quality ladder steps down); on a real GPU the shader does not run on the main thread.

- The liquid loads **after the page is idle**; a static still with the same composition shows first, and stays when
  WebGL is missing, on low-memory devices or with Data Saver. A shader failure falls back to it silently.
- It renders at ~half resolution (invisible on a smooth surface). On a slow GPU it climbs down a quality ladder by
  itself — fewer pixels first, then 30 fps, then 15 fps — so scrolling and input stay responsive. It stops when the
  tab is hidden. Resizing redraws immediately (no black flash).
- Mobile: two noise octaves instead of three, 0.4× resolution, a wandering light instead of the pointer.
- Memory: 240 language/theme switches → JS heap plateaus, DOM node count constant, still one canvas.
- Self-hosted fonts; the three Latin files the hero needs are preloaded; Arabic fonts load only when Arabic shows.

## Stack

React 19 · Vite 8 · Tailwind CSS 4 · WebGL + GLSL · Web Audio API · GSAP 3 (ScrollTrigger, SplitText) · Fontsource.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build
```

## Structure

```
src/
├── App.jsx
├── liquid/          shader.js (GLSL) · engine.js (WebGL loop) · atmospheres.js (per section, per theme)
├── audio/           score.js · instruments.js · engine.js (Web Audio) · levels.js · MusicProvider.jsx (useMusic)
├── data/            all content in en / fr / ar — resume.js mirrors the CV (public/cv/) exactly
├── i18n/ui.js       interface text; *italic* in titles, {interactive} words in paragraphs
├── lib/             motion.js (reveals, magnetic, letter field) · commands.js (terminal) · preferences.jsx
│                    ui.jsx · events.js · easter.js · hooks.js · gsap.js · storage.js
└── components/      LiquidBackground, Header, Hero, About, Work, Lab, Skills, Journey, Contact, Footer,
                     InteractiveText, MusicPlayer, MusicVisualizer, Terminal, CommandPalette, Cursor, Toast, …
```

## Updating content

- **Project**: screenshots in `public/projects/<name>-1600.webp` and `-800.webp` (16:10), then copy an object in
  `src/data/projects.js`. Its `id` becomes `open <id>` in the terminal.
- **Skill moves from learning to practice**: change `status` in `src/data/skills.js` and add evidence to `where`.
- **A section's mood**: edit its entry in `src/liquid/atmospheres.js`.

## Deploy

One codebase, any static host. Visitors only open the public URL — nothing to run.

| | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | 22 (from `.nvmrc`; 20.19+ works) |
| Environment variables | none required · optional `SITE_URL` (see below) |

**How it stays portable** — `base: "./"` makes every asset path relative, so the same `dist/` works at a domain
root and under a sub-path (GitHub Pages: `/<repo>/`). The site is a single page with `#section` anchors, so no SPA
rewrite rules are needed. `public/404.html` is served by every host for unknown paths: friendly URLs such as
`/work`, `/cv` or `/contact` jump to the right section, anything else shows a small "page not found" with a link home.

**`SITE_URL`** (optional, not a secret) — the public address, used only for the canonical link, Open Graph tags and
structured data. Vercel, Netlify and Cloudflare Pages provide one automatically; set `SITE_URL` to use your own
domain (e.g. `https://hafidkarkouch.dev`). Without any URL, those tags are left out — the site itself works the same.
See `.env.example`.

### Vercel
1. vercel.com → **Add New… → Project** → import the GitHub repository.
2. Settings are read from `vercel.json` (Vite, `npm run build`, `dist`). Deploy.
3. Every push to `main` deploys to production; pull requests get preview URLs.

### Netlify
1. app.netlify.com → **Add new site → Import an existing project** → GitHub → the repository.
2. Settings are read from `netlify.toml` (`npm run build`, `dist`; Node from `.nvmrc`). Deploy.
3. Every push to `main` deploys; pull requests get deploy previews.

### Cloudflare Pages
1. dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git** → the repository.
2. Framework preset **Vite** (or: build command `npm run build`, output directory `dist`). Node comes from `.nvmrc`.
3. Every push to `main` deploys; other branches get preview URLs. Cache headers come from `public/_headers`.

### GitHub Pages
1. Repository → **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables** → new variable `DEPLOY_GITHUB_PAGES` = `true`.
3. Push to `main` (or run the workflow by hand): `.github/workflows/deploy-github-pages.yml` builds and publishes.
   It passes the Pages URL as `SITE_URL`, so the `/<repo>/` sub-path is handled. The workflow stays off until the
   variable is set, so it never fails for people deploying elsewhere.

### Any other static host
Run `npm ci && npm run build` and upload the contents of `dist/`. Serve `404.html` for unknown paths if the host
allows it.

### Checked before delivery
Production build served two ways — at a domain root (`npm run preview`) and under `/hafid-portfolio/` with
GitHub Pages behaviour (404 page, trailing-slash redirect): no failed request, no console error; WebGL liquid, all
fonts and images, CV download (original bytes) and preview, lazy soundtrack chunk with live audio, language + theme
kept after a refresh, mobile layout, friendly URLs landing on their section.
