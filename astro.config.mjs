// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Pitch build (default): https://kyleouellette.com/neilsons
// Production build (`npm run build:prod`): https://neilsonssportinggoods.com
const isProd = process.env.DEPLOY_TARGET === 'prod';

export default defineConfig({
  site: isProd ? 'https://neilsonssportinggoods.com' : 'https://kyleouellette.com',
  base: isProd ? '/' : '/neilsons',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
