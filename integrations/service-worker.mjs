// Writes dist/sw.js from src/service-worker.js after each build, precaching
// every page, image and un-hashed public file. The version is a hash of the
// build output, so any change to the site installs a fresh cache.
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Server config files that are never served
const IGNORE = new Set(['.htaccess', '.assetsignore', '_headers', 'sw.js']);
const IMAGE = /\.(avif|webp|jpe?g|png|gif|svg)$/i;

/** @returns {import('astro').AstroIntegration} */
export default function serviceWorker() {
  let base = '/';
  return {
    name: 'service-worker',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const files = (await readdir(outDir, { recursive: true, withFileTypes: true }))
          .filter((entry) => entry.isFile() && !IGNORE.has(entry.name))
          .map((entry) => path.relative(outDir, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'))
          .sort();

        const template = await readFile(new URL('../src/service-worker.js', import.meta.url), 'utf8');
        const hash = createHash('sha256').update(template);
        for (const file of files) hash.update(file).update(await readFile(path.join(outDir, file)));
        const version = hash.digest('hex').slice(0, 12);

        // Every image size is precached so any layout works offline. Other
        // hashed /_astro/ assets (e.g. font subsets for other alphabets) are
        // cached as the page uses them.
        const precache = files
          .filter((file) => !file.startsWith('_astro/') || IMAGE.test(file))
          .map((file) => base + file.replace(/(^|\/)index\.html$/, '$1'));

        const sw = template.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(precache));
        await writeFile(path.join(outDir, 'sw.js'), sw);
        logger.info(`sw.js ${version}: precaching ${precache.length} files`);
      },
    },
  };
}
