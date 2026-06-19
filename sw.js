// Service worker — offline cache. Design Ref: §7.
// v6: bump cache version to force-propagate the Day 1 time fix (KUAS 15:00, 금각사 16:30–17:30).
// v5: static assets now use stale-while-revalidate (serve cache, refresh in the
// background) so future deploys auto-propagate within one revisit — no more silent
// staleness. Carries the hero retitle + bus badge + single map button changes.
// v4: bump cache version so existing installs pick up the places-filter + day-pill fixes.
// v3: map tab now uses Google Maps (network-only, cross-origin); app shell + assets
// (itinerary / places / info) remain fully offline.
const VERSION = 'v6';
const SHELL = `shell-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;

const PRECACHE = [
  './', './index.html', './manifest.webmanifest',
  './css/tokens.css', './css/app.css',
  './js/main.js', './js/data.js', './js/assets.js', './js/render.js',
  './js/icons.js', './js/router.js', './js/map.js',
  './js/trip-utils.js', './js/places.js', './js/itinerary.js',
  './fonts/fonts.css', './images/uos-logo.png', './images/uos-logo-white.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![SHELL, RUNTIME].includes(k)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // cross-origin (Google Maps embed, etc.) -> let the browser handle it (network only)
  if (url.origin !== location.origin) return;

  // navigation -> network-first, fallback to cached shell
  if (request.mode === 'navigate') {
    e.respondWith(fetch(request).catch(() => caches.match('./index.html')));
    return;
  }

  // static assets -> stale-while-revalidate:
  // serve cache instantly (offline-first), refresh in the background so the
  // NEXT load picks up new deploys without needing a cache-version bump.
  const fresh = fetch(request).then(async (res) => {
    if (res.ok) {
      // write back to whichever cache already holds it (SHELL if precached, else RUNTIME)
      const inShell = await caches.open(SHELL).then(c => c.match(request));
      const cache = await caches.open(inShell ? SHELL : RUNTIME);
      cache.put(request, res.clone());
    }
    return res;
  }).catch(() => null);
  e.waitUntil(fresh);   // keep the SW alive until the background refresh + cache write finishes
  e.respondWith((async () => (await caches.match(request)) || (await fresh) || Response.error())());
});
