// Offline support. This is a template: integrations/service-worker.mjs fills in
// the placeholders at build time and writes the result to dist/sw.js.
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const CACHE = `neilsons-${VERSION}`;
const SCOPE = self.registration.scope;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

// Drop caches from older builds
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// The page sends the assets it already loaded (fonts, the image size this
// device picked, ...) so they're available offline without a second visit.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'cache-urls') return;
  const urls = event.data.urls.filter((url) => url.startsWith(SCOPE));
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        urls.map(async (url) => {
          if (!(await cache.match(url))) await cache.add(url).catch(() => {});
        }),
      ),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(SCOPE)) return;

  // Files in /_astro/ have content hashes in their names, so they never change
  const hashed = new URL(request.url).pathname.includes('/_astro/');
  event.respondWith(hashed ? cacheFirst(request) : networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
  return response;
}

// Pages and other un-hashed files: stay fresh online, fall back to the cache offline
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
    return response;
  } catch (err) {
    const cached =
      (await caches.match(request, { ignoreSearch: true })) ||
      (request.mode === 'navigate' && (await caches.match(SCOPE)));
    if (cached) return cached;
    throw err;
  }
}
