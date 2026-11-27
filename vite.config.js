import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/*
  One build for every static host.

  base "./" makes every asset URL relative (fonts, chunks, images, the CV, the
  favicon), so the same dist/ works at a domain root (Vercel, Netlify, Cloudflare
  Pages, a custom domain) and under a sub-path (GitHub Pages: /<repo>/).

  The public site URL is only needed for the canonical link, Open Graph tags and
  structured data. It is read at build time, in this order — no host is hardcoded:
    SITE_URL (set it yourself, any host)            e.g. https://hafidkarkouch.dev
    VERCEL_PROJECT_PRODUCTION_URL (set by Vercel)   e.g. my-site.vercel.app
    URL (set by Netlify)
    CF_PAGES_URL (set by Cloudflare Pages)
  (The GitHub Pages workflow passes SITE_URL itself.)
  If none is available, those tags are left out instead of pointing somewhere wrong.
*/
const env = process.env;
const fromHost = env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : env.URL || env.CF_PAGES_URL || "";
const SITE_URL = (env.SITE_URL || fromHost).trim().replace(/\/+$/, "");

function siteUrl() {
  return {
    name: "site-url",
    transformIndexHtml(html) {
      if (SITE_URL) return html.replaceAll("%SITE_URL%", SITE_URL);
      // unknown URL: drop the tags that need an absolute address
      return html
        .replace(/^\s*<link rel="canonical"[^>]*%SITE_URL%[^>]*>\n/m, "")
        .replace(/^\s*<meta property="og:(url|image)"[^>]*%SITE_URL%[^>]*>\n/gm, "")
        .replace(/^\s*<meta property="og:image:(width|height)"[^>]*>\n/gm, "")
        .replace(/^\s*"url": "%SITE_URL%\/",\n/m, "");
    },
    buildStart() {
      if (!SITE_URL && this.meta.watchMode === false) {
        this.warn("SITE_URL is not set: canonical and Open Graph URL tags are omitted. Set SITE_URL to your public URL (see README → Deploy).");
      }
    },
  };
}

// Preload the three Latin font files the hero needs, so the name renders in its real face sooner.
function preloadHeroFonts() {
  return {
    name: "preload-hero-fonts",
    apply: "build",
    transformIndexHtml(html, ctx) {
      const wanted = /(bricolage-grotesque-latin-opsz-normal|fraunces-latin-wght-italic|geist-latin-wght-normal)-[\w-]+\.woff2$/;
      const links = Object.keys(ctx.bundle || {})
        .filter((f) => wanted.test(f))
        .map((f) => `<link rel="preload" href="./${f}" as="font" type="font/woff2" crossorigin />`)
        .join("\n    ");
      return html.replace("</title>", `</title>\n    ${links}`);
    },
  };
}

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    target: "es2020", // every browser with WebGL + Web Audio that the site supports
    sourcemap: false,
    // The main chunk is React + GSAP + the whole site in three languages (~175 KB gzipped);
    // WebGL, audio and overlays are already split out and lazy-loaded.
    chunkSizeWarningLimit: 600,
  },
  plugins: [react(), tailwindcss(), siteUrl(), preloadHeroFonts()],
});
