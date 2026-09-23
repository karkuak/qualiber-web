// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The canonical production URL. Used for sitemap + canonical/OG tags.
export default defineConfig({
  site: 'https://qualiber.ai',
  integrations: [sitemap()],
  build: {
    // Never inline CSS or JS into the HTML: keeps the Content-Security-Policy in
    // public/_headers strict (script-src 'self', style-src 'self') with no hashes to maintain.
    inlineStylesheets: 'never',
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
