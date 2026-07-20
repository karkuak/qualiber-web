// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The canonical production URL. Used for sitemap + canonical/OG tags.
export default defineConfig({
  site: 'https://qualiber.ai',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
