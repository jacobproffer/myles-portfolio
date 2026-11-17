// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import netlify from "@astrojs/netlify";

/*
  Every page is static HTML except /preview and /api/draft-mode/*, which Netlify renders on request
  so the Studio's Preview tab can show unpublished drafts. See README → "Content preview".
*/

// https://astro.build/config
export default defineConfig({
  site: "https://www.example.com",
  adapter: netlify(),
  integrations: [sitemap()],
  env: {
    schema: {
      // Viewer token from sanity.io/manage, used only by the on-request preview routes.
      SANITY_API_READ_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
      // Where the Studio lives, so click-to-edit overlays can link back to it.
      SANITY_STUDIO_URL: envField.string({ context: "server", access: "public", default: "http://localhost:3333" }),
    },
  },
  // Image optimization configuration
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
  },
  // Security and performance optimizations
  security: {
    checkOrigin: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
