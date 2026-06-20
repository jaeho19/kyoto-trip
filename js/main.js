// Entry: wire data -> render -> router -> map, register SW. Design Ref: §11.1.
import { TRIP } from './data.js';
import { renderItinerary, renderForum, renderPlaces, renderInfo } from './render.js';
import { initRouter } from './router.js';
import { initItinerary } from './itinerary.js';
import { initPlacesFilter, gotoPlace } from './places.js';
import { initMap, focusPlace } from './map.js';

// header
document.getElementById('app-title').textContent = TRIP.meta.title;
document.getElementById('app-sub').textContent = TRIP.meta.subtitle;

// render static panels once (pure functions, single injection)
document.getElementById('panel-itinerary').innerHTML = renderItinerary(TRIP);
document.getElementById('panel-forum').innerHTML = renderForum(TRIP);
document.getElementById('panel-places').innerHTML = renderPlaces(TRIP);
document.getElementById('panel-info').innerHTML = renderInfo(TRIP);

// wire per-tab interactions
initItinerary();
initPlacesFilter();

// cross-tab links: timeline/place-card → map focus, map stop → place card
let flyTarget = null;
let placeTarget = null;
document.addEventListener('click', (e) => {
  const fly = e.target.closest('[data-fly]');
  if (fly) flyTarget = fly.dataset.fly;
  const goto = e.target.closest('[data-goto-place]');
  if (goto) placeTarget = goto.dataset.gotoPlace;
});

// router: lazy-init map when the map tab becomes active; resolve cross-tab targets
initRouter((tab) => {
  if (tab === 'map') {
    initMap(TRIP);
    if (flyTarget) { focusPlace(flyTarget); flyTarget = null; }
  } else if (tab === 'places') {
    if (placeTarget) { gotoPlace(placeTarget); placeTarget = null; }
  }
});

// PWA service worker (FR-6)
if ('serviceWorker' in navigator) {
  // Auto-reload once when a new SW takes control. Prevents a stale JS bundle from
  // running under a freshly fetched index.html after a deploy (new SW does
  // skipWaiting + clients.claim → 'controllerchange' → reload to consistent assets).
  let swReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (swReloaded) return;
    swReloaded = true;
    window.location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err =>
      console.warn('SW registration failed:', err));
  });
}
