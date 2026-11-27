# Hafid Karkouch — Portfolio (v2, immersive 3D)

An interactive digital workspace: a real-time 3D scene, a working terminal, a command menu,
a 3D skills universe and a scroll-driven timeline — in English, French and Arabic (full RTL),
with designed dark and light themes.

## The concept: the full-stack core

The central 3D object is a stack of three layers. Each one is made of a different material
because each one is at a different stage of my learning — the object tells the honest story:

| Layer | Material | Meaning |
|---|---|---|
| Interface | iridescent glass with glowing UI blocks inside | front-end: what I practise every day |
| Logic | brushed metal with live cyan circuits | back-end: taking shape in team projects |
| Data | amber wireframe, voxels being laid in on a loop | databases: being built this year |

A cyan beam carries data packets through the layers. Scrolling into **About** pulls the stack
apart and highlights each layer as its story appears. The object, the camera and a light follow
the pointer.

Colours: Majorelle violet (identity), cyan (data flowing), amber (things still being built).

## Features

- **3D hero + About** — React Three Fiber scene, sticky behind the text, choreographed with GSAP ScrollTrigger.
- **Terminal** — real command parser, animated output, history (↑ ↓), Tab completion, Ctrl L, Esc.
  Commands: `help about whoami skills projects experience education contact github social date clear`
  + `lang en|fr|ar`, `theme dark|light`, `goto <section>`, `open <project>`, `exit`.
  Command names are English everywhere; their output follows the site language.
  Open it with the **Terminal** button, the floating **>_** button, **Ctrl + `** or from the command menu.
- **Command menu** — **Ctrl K** (⌘K on Mac): search sections and actions (terminal, theme, language, copy email, links).
- **Project showcase** — pinned, scroll-driven transitions between projects (wipe + text rise), 3D tilt previews,
  screen switcher, full-details dialog. Each project has its own colour (from its real UI).
- **Skills universe** — 3D constellation: core → five groups → technologies, dashed links between tools
  that work together, pulses from the core. Hover/click or use the list. Solid node = in practice, amber ring = learning.
- **Timeline** — the line fills as you scroll, nodes light up, cards swing in from their side.
- **Contact** — pick a topic, the message is prepared, open it in your own mail app or copy it. No fake form.
- **Status widget** — "Open to PFE internship — April 2027", clearly marked as set by hand.
- **Context cursor** — grows on links, "View" on projects, "Drag" on 3D. Mouse/trackpad only.

## Performance and fallbacks

- Three.js code is **lazy-loaded** (separate chunks); the page is readable before it arrives.
- A scene **stops rendering** when it is off screen (`frameloop="never"`).
- **Adaptive quality**: `PerformanceMonitor` drops pixel ratio and the glass transmission pass on slow GPUs.
- **Mobile** gets its own version: object placed above the name, 320 particles instead of 1 400,
  no transmission/shadows, no floating shapes, the skills universe becomes an interactive list,
  projects are stacked cards instead of a pinned stage.
- **No WebGL** → a flat SVG drawing of the same stack, with all content intact.
- **prefers-reduced-motion** → scenes render on demand (no idle animation), no pinned stage, no entrance animation.
- Lighting, materials, fog and environment are different for dark and light themes.

## Stack

React 19 · Vite 8 · Tailwind CSS 4 · three · @react-three/fiber 9 · @react-three/drei 10 · GSAP 3 (ScrollTrigger)
· self-hosted fonts (Archivo variable, JetBrains Mono, Noto Sans Arabic, Noto Kufi Arabic).

Not used on purpose: Framer Motion (GSAP already covers it), Lenis (native scroll stays accessible and fast),
TypeScript (kept in JavaScript, like my other projects, to stay easy for me to maintain).

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

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
├── data/                 ← everything you update (all text in en / fr / ar)
│   ├── profile.js        name, email, links, facts, status
│   ├── projects.js       projects (id = terminal name, color = project identity)
│   ├── experience.js     internship
│   ├── skills.js         groups + technologies (status, description, where, links)
│   └── journey.js        timeline + current focus
├── i18n/ui.js            interface text (incl. terminal and command menu)
├── lib/
│   ├── commands.js       terminal engine (parser, completion, outputs)
│   ├── preferences.jsx   language + theme (saved, sets <html lang dir>)
│   ├── ui.jsx            terminal / command menu state + shortcuts
│   ├── store.js          pointer + scroll values shared with the 3D scenes
│   ├── gsap.js, hooks.js, storage.js
├── three/
│   ├── StackScene.jsx    hero object, lights, particles, camera rig
│   └── SkillsScene.jsx   skills universe
└── components/           Header, Universe (hero + about), Work, Skills, Journey, Contact,
                          Terminal, CommandPalette, Cursor, Floating, StackFallback, …
```

## Updating content

- **Add a project**: screenshots in `public/projects/<name>-1600.webp` and `-800.webp` (16:10), then copy an
  object in `src/data/projects.js`. Its `id` automatically becomes `open <id>` in the terminal.
- **A skill moves from learning to practice**: change `status` in `src/data/skills.js` and add the project to `where`.
  The 3D node changes from an amber ring to a solid node by itself.
- **Status widget**: `status` in `src/data/profile.js` and the `status.*` strings in `src/i18n/ui.js`.
- **New terminal command**: add it to `COMMANDS` and a `case` in `src/lib/commands.js`, plus `term.help.<name>` in the three languages.

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. vercel.com → Add New… → Project → import the repo. Vite is detected (build `npm run build`, output `dist`). Deploy.
3. Put your final URL in `SITE_URL` (`vite.config.js`) or as a `SITE_URL` environment variable on Vercel, then redeploy
   (used for the canonical link, Open Graph image and structured data).

## Checked before delivery

- Production build without errors; no runtime errors in the browser console.
- EN / FR / AR on desktop (1440) and mobile (390), Arabic fully mirrored (navigation, timeline, terminal icons, rulers of the layout).
- Dark and light themes, including 3D lighting.
- Terminal: commands, history, Tab completion, `lang`, `goto`, Esc; command menu: search, arrows, Enter.
- WebGL disabled → flat fallback; reduced motion → static scenes, stacked projects.
- axe-core: no WCAG A/AA violations in the tested combinations (contrast fixed for both themes).
- No horizontal scrolling on mobile.
