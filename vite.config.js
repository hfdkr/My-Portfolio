import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Public URL of the deployed site (no trailing slash). Used by index.html for the
// canonical link, Open Graph image and structured data. Update it after your first
// Vercel deploy, or set SITE_URL in Vercel → Settings → Environment Variables.
const SITE_URL = (process.env.SITE_URL || "https://hafid-karkouch.vercel.app").replace(/\/$/, "");

export default defineConfig({
  base: "./",
  // The 3D vendor chunk (three + R3F + drei) is large by nature and lazy-loaded.
  build: { chunkSizeWarningLimit: 1100 },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "site-url",
      transformIndexHtml: (html) => html.replaceAll("%SITE_URL%", SITE_URL),
    },
  ],
});
