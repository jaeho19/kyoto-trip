// Leaflet map: pins + light/dark tile toggle. Design Ref: §6, FR-4.
// Leaflet (L) is loaded as a local vendor bundle (no CDN). NFR-1.
import { catMeta, icon } from './icons.js';

const TILES = {
  light: { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; OpenStreetMap &copy; CARTO' },
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; OpenStreetMap &copy; CARTO' },
};

let map = null;
let tileLayer = null;

function makeIcon(cat) {
  const cm = catMeta(cat);
  const html = `<div style="background:${cm.color};width:26px;height:26px;border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.4);
    border:2px solid #fff"><span style="transform:rotate(45deg);color:#fff;display:grid;place-items:center">
    ${icon(cm.icon, 14)}</span></div>`;
  return L.divIcon({ html, className: '', iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -24] });
}

export function initMap(trip) {
  if (map) { map.invalidateSize(); return; }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let mode = prefersDark ? 'dark' : 'light';

  map = L.map('map', { zoomControl: true });
  const setTiles = (m) => {
    if (tileLayer) map.removeLayer(tileLayer);
    tileLayer = L.tileLayer(TILES[m].url, { attribution: TILES[m].attr, maxZoom: 19, subdomains: 'abcd' }).addTo(map);
  };
  setTiles(mode);

  const pts = [];
  Object.values(trip.places).forEach(p => {
    if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
    const cm = catMeta(p.cat);
    L.marker([p.lat, p.lng], { icon: makeIcon(p.cat) })
      .addTo(map)
      .bindPopup(`<div class="pop" style="color:${cm.color}">${icon(cm.icon, 16)}<span style="color:var(--text)">${p.name}</span></div>`);
    pts.push([p.lat, p.lng]);
  });
  if (pts.length) map.fitBounds(pts, { padding: [40, 40] });

  // tile toggle buttons
  document.querySelectorAll('.map-bar button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
    btn.addEventListener('click', () => {
      mode = btn.dataset.mode;
      setTiles(mode);
      document.querySelectorAll('.map-bar button').forEach(b =>
        b.classList.toggle('active', b === btn));
    });
  });
}
