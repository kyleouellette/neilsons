// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Pitch build (default): https://kyleouellette.com/neilsons
// Production build (`npm run build:prod`, or any Cloudflare build): https://neilsonssportinggoods.com
const isProd = process.env.DEPLOY_TARGET === 'prod' || process.env.WORKERS_CI === '1';

// Flip to true at launch. Until then the production site shows the
// under-construction page; the pitch build always shows the full site.
const launched = true;

export default defineConfig({
  site: isProd ? 'https://neilsonssportinggoods.com' : 'https://kyleouellette.com',
  base: isProd ? '/' : '/neilsons',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.UNDER_CONSTRUCTION': JSON.stringify(isProd && !launched),
    },
  },
});
