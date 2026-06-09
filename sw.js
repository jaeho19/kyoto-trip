// Service worker — offline cache. Design Ref: §7.
// v4: bump cache version so existing installs pick up the places-filter + day-pill fixes
// (cache-first serves css/js, so a version bump is required to ship app.css / itinerary.js changes).
// v3: map tab now uses Google Maps (network-only, cross-origin); app shell + assets
// (itinerary / places / info) remain fully offline.
const VERSION = 'v4';
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

  // static assets -> cache-first, populate runtime cache
  e.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const res = await fetch(request);
      if (res.ok) {
        const cache = await caches.open(RUNTIME);
        cache.put(request, res.clone());
      }
      return res;
    } catch (err) {
      return cached || Response.error();
    }
  })());
});
