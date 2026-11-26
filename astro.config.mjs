// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import serviceWorker from './integrations/service-worker.mjs';

// Pitch build (default): https://kyleouellette.com/neilsons
// Production build (`npm run build:prod`, or any Cloudflare build): https://neilsonssportinggoods.com
const isProd = process.env.DEPLOY_TARGET === 'prod' || process.env.WORKERS_CI === '1';

// Flip to true at launch. Until then the production site shows the
// under-construction page; the pitch build always shows the full site.
const launched = false;

// Cloudflare builds of any branch other than main (e.g. `staging`) are
// preview deploys, so they show the full site even before launch.
const isPreviewBranch = !!process.env.WORKERS_CI_BRANCH && process.env.WORKERS_CI_BRANCH !== 'main';

export default defineConfig({
  site: isProd ? 'https://neilsonssportinggoods.com' : 'https://kyleouellette.com',
  base: isProd ? '/' : '/neilsons',
  trailingSlash: 'ignore',
  // Inline the CSS so it isn't a render-blocking request
  build: { inlineStylesheets: 'always' },
  // Generates dist/sw.js so the site works offline
  integrations: [serviceWorker()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.UNDER_CONSTRUCTION': JSON.stringify(isProd && !launched && !isPreviewBranch),
    },
  },
});
