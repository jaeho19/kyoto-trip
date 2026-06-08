// Entry: wire data -> render -> router -> map, register SW. Design Ref: §11.1.
import { TRIP } from './data.js';
import { renderItinerary, renderPlaces, renderInfo } from './render.js';
import { initRouter } from './router.js';
import { initMap } from './map.js';

// header
document.getElementById('app-title').textContent = TRIP.meta.title;
document.getElementById('app-sub').textContent = TRIP.meta.subtitle;

// render static panels once (pure functions, single injection)
document.getElementById('panel-itinerary').innerHTML = renderItinerary(TRIP);
document.getElementById('panel-places').innerHTML = renderPlaces(TRIP);
document.getElementById('panel-info').innerHTML = renderInfo(TRIP);

// router: lazy-init map when the map tab becomes active
initRouter((tab) => {
  if (tab === 'map') initMap(TRIP);
});

// PWA service worker (FR-6)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err =>
      console.warn('SW registration failed:', err));
  });
}
