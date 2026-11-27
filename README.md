# Hafid Karkouch — Portfolio (v3, "Zellige")

A cinematic, fast personal site in English, French and Arabic (full RTL), with designed night and day themes.

## The concept: built tile by tile

Zellige craftsmen in Morocco cut every tile by hand and set it piece by piece; the mosaic only works when
every piece is precise. That is how I want to build software — and it is the visual identity of the site.

- **Hero** — a floor of glazed eight-point stars (khatam). A warm light follows the pointer; tiles lift and tilt
  away from it, and the light rises through the cross-shaped gaps: the code under the surface.
  Scrolling away peels the nearest rows off. Night = basalt glaze and ember light; day = tadelakt plaster.
- **Palette** — warm only: basalt / bone white / ember (an Agadir sunset) at night, plaster / ink / terracotta by day,
  plus one glaze green for "live" states. Each project keeps its own colour, taken from its real UI.
- **Type** — Fraunces (display serif, optical size + weight axes), Geist (text), Geist Mono (labels),
  Noto Kufi Arabic / Noto Sans Arabic for Arabic.

## Sections

Hero · About (scroll-lit manifesto, facts, "How I work") · Selected work (three chapters: problem → what I did →
what it taught me, framed previews, full-screen case studies) · From the lab (course REST APIs with their real routes)
· Toolbox (solid = in practice, outlined = learning) · Journey (education, internship, what's next) · Contact.

## Interactive typography

`src/components/InteractiveText.jsx` — letters react one at a time.

```jsx
<InteractiveText as="h2" variant="title" text="Three projects, *told honestly*." data-split />
<Marked text="I {design} interfaces, {build} them…" />   // only {marked} words react
```

- Hover is **pure CSS** (`:hover`, `:has()` for the two neighbours) → no JavaScript and no React re-render per letter.
- Each letter has two layers: `.it-c` (GSAP entrance) and `.it-g` (CSS hover), so they never fight over `transform`.
- Variants: `hero` (pointer field: lift, colour and Fraunces weight follow the distance to the cursor — `useLetterField`),
  `title`, `nav`, `skill`, `word`, `cta`, `footer` (the faded signature lights up letter by letter).
- Props: `color`, `duration`, `lift`, `scale`, `stagger`, `breakable`, `as`, `variant`.
- Arabic is never split into letters (it would break letter joining): each Arabic word reacts as one unit.
- Screen readers get the plain text once (visual letters are `aria-hidden`); selection/copy gives clean text;
  focused links/buttons send a wave through their letters; touch gets a tap response; reduced motion keeps colour only.

## Other features

- **Terminal** (`Ctrl + \``) — real parser, history, Tab completion: `help about whoami skills projects lab experience
  education contact github social date clear lang theme goto open exit`. Some commands are not listed.
- **Command menu** (`Ctrl K` / `⌘K`) — sections, theme, language, copy email, links.
- **Context cursor** — "View", "Open", "Copy", "Write" on the right targets (mouse only).
- **Secrets** — try the Konami code, five quick clicks on the star logo, or the browser console.

## Performance (measured on the production build)

| Scenario | LCP | CLS | Long tasks while scrolling |
|---|---|---|---|
| Desktop, no WebGL (fallback) | 0.42 s | 0.000 | 0 |
| Desktop, CPU-rendered WebGL (worst case) | 0.78 s | 0.001 | 1 |
| Mobile, 4× CPU throttle | 1.95 s | 0.000 | 1 (52 ms) |

How:
- **One WebGL canvas**, plain three.js (no React renderer): every tile is a single `InstancedMesh` = one draw call.
  All motion runs in the vertex shader from a few uniforms — the CPU updates ~8 numbers per frame.
- The 3D chunk is **lazy-loaded after the page is idle**; the name is the LCP. A flat SVG of the same motif shows first,
  and stays as the experience without WebGL, on low-memory devices or with Data Saver.
- Renders only while visible and the tab is active; drops its pixel ratio by itself if frames get slow;
  renders on demand with `prefers-reduced-motion`; shaders compile in parallel where the driver allows.
- No `backdrop-filter` over the canvas, no React state in scroll handlers, animation loops that stop when idle.
- Self-hosted fonts, the three Latin files the hero needs are preloaded; Arabic fonts load only when Arabic shows.

## Stack

React 19 · Vite 8 · Tailwind CSS 4 · three.js · GSAP 3 (ScrollTrigger, SplitText) · Fontsource.

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
├── data/            ← all content, in en / fr / ar (only describe what can be checked in the repos)
│   ├── profile.js   projects.js   lab.js   experience.js   skills.js   journey.js
├── i18n/ui.js       interface text; *italic* in titles, {interactive} words in paragraphs
├── three/zellige.js the hero scene
├── lib/             motion.js (reveals, magnetic, letter field) · commands.js (terminal) · preferences.jsx
│                    ui.jsx · events.js · easter.js · hooks.js · gsap.js · storage.js
└── components/      Header, Hero, About, Work, Lab, Skills, Journey, Contact, Footer,
                     InteractiveText, Terminal, CommandPalette, Cursor, Toast, Primitives, Icons
```

## Updating content

- **Project**: screenshots in `public/projects/<name>-1600.webp` and `-800.webp` (16:10), then copy an object in
  `src/data/projects.js` (role, challenge, approach, learned, features… in three languages). Its `id` becomes `open <id>`.
- **Skill moves from learning to practice**: change `status` in `src/data/skills.js` and add evidence to `where`.
- **Status line**: `status.*` strings in `src/i18n/ui.js`.

## Deploy on Vercel

Import the repository (Vite is detected: build `npm run build`, output `dist`), then set your final URL in
`SITE_URL` (`vite.config.js`) or as a `SITE_URL` environment variable (canonical link, Open Graph, structured data).
