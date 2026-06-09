// Service worker — offline cache. Design Ref: §7.
// App shell precache + runtime cache for same-origin assets + tile SWR.
const VERSION = 'v2';
const SHELL = `shell-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;
const TILES = `tiles-${VERSION}`;
const TILE_MAX = 120; // LRU cap for map tiles

const PRECACHE = [
  './', './index.html', './manifest.webmanifest',
  './css/tokens.css', './css/app.css',
  './js/main.js', './js/data.js', './js/assets.js', './js/render.js',
  './js/icons.js', './js/router.js', './js/map.js',
  './vendor/maplibre/maplibre-gl.js', './vendor/maplibre/maplibre-gl.css',
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
      keys.filter(k => ![SHELL, RUNTIME, TILES].includes(k)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > max) await cache.delete(keys[0]);
}

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // map assets (CARTO vector tiles/style/sprite/glyphs, OSM) -> stale-while-revalidate
  if (/cartocdn\.com|openmaptiles\.org|tile\.openstreetmap\.org/.test(url.host)) {
    e.respondWith((async () => {
      const cache = await caches.open(TILES);
      const cached = await cache.match(request);
      const network = fetch(request).then(res => {
        if (res.ok) { cache.put(request, res.clone()); trimCache(TILES, TILE_MAX); }
        return res;
      }).catch(() => cached);
      return cached || network;
    })());
    return;
  }

  // same-origin
  if (url.origin === location.origin) {
    // navigation -> network-first, fallback to cached shell
    if (request.mode === 'navigate') {
      e.respondWith(
        fetch(request).catch(() => caches.match('./index.html'))
      );
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
  }
});
