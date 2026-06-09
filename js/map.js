// MapLibre GL map — 3D buildings, day routes, photo popups, day filter.
// Design Ref: §6 (v2 interactive). maplibre-gl (window.maplibregl) is a local vendor bundle.
import { catMeta, icon } from './icons.js';

const STYLES = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
};
const DAY_COLORS = { 1: '#b5462f', 2: '#2f7d6b', 3: '#5a6cae' };

let map = null;
let TRIP = null;
let mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
let activeDay = 0;                 // 0 = all days
const markerObjs = [];             // { marker, el, placeKey, days:Set }
let pendingFly = null;

const esc = (s = '') => String(s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// place -> Set of day numbers it appears in
function dayMembership(trip) {
  const m = {};
  trip.itinerary.forEach(d => d.items.forEach(it => {
    (m[it.placeKey] ||= new Set()).add(d.day);
  }));
  return m;
}

function markerElement(cat, dayBadge) {
  const cm = catMeta(cat);
  const el = document.createElement('div');
  el.className = 'mk';
  el.innerHTML =
    `<div class="mk-pin" style="background:${cm.color}">${icon(cm.icon, 14)}</div>` +
    (dayBadge ? `<span class="mk-day">${dayBadge}</span>` : '');
  return el;
}

function popupHTML(p) {
  const cm = catMeta(p.cat);
  const hero = p.img
    ? `<div class="pop-img" style="background-image:url('${esc(p.img)}')">${p.imgRep ? '<span class="pop-rep">대표</span>' : ''}</div>`
    : '';
  return `<div class="pop2">${hero}<div class="pop-body">
    <div class="pop-cat" style="color:${cm.color}">${icon(cm.icon, 14)} ${esc(cm.label)}</div>
    <div class="pop-name">${esc(p.name)}</div>
    ${p.area ? `<div class="pop-area">📍 ${esc(p.area)}</div>` : ''}
    ${p.url ? `<a class="pop-link" href="${esc(p.url)}" target="_blank" rel="noopener">공식 사이트 ↗</a>` : ''}
  </div></div>`;
}

function routesGeoJSON(trip) {
  const features = trip.itinerary.map(day => {
    const coords = [];
    day.items.forEach(it => {
      const p = trip.places[it.placeKey];
      if (!p) return;
      const last = coords[coords.length - 1];
      if (!last || last[0] !== p.lng || last[1] !== p.lat) coords.push([p.lng, p.lat]);
    });
    return { type: 'Feature', properties: { day: day.day, color: DAY_COLORS[day.day] || '#888' },
      geometry: { type: 'LineString', coordinates: coords } };
  }).filter(f => f.geometry.coordinates.length > 1);
  return { type: 'FeatureCollection', features };
}

function add3DBuildings() {
  const sources = map.getStyle().sources;
  const vid = Object.keys(sources).find(id => sources[id].type === 'vector');
  if (!vid) return;
  try {
    map.addLayer({
      id: '3d-buildings', source: vid, 'source-layer': 'building',
      type: 'fill-extrusion', minzoom: 13,
      paint: {
        'fill-extrusion-color': mode === 'dark' ? '#33302a' : '#dcd4c6',
        'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 15,
          ['coalesce', ['get', 'render_height'], ['get', 'height'], 10]],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
        'fill-extrusion-opacity': 0.55,
      },
    });
  } catch (e) { /* source lacks building layer — skip gracefully */ }
}

function addRoutesAndMarkers() {
  // routes
  if (!map.getSource('routes')) {
    map.addSource('routes', { type: 'geojson', data: routesGeoJSON(TRIP) });
    map.addLayer({
      id: 'route-lines', type: 'line', source: 'routes',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': ['get', 'color'], 'line-width': 4, 'line-opacity': 0.85,
        'line-dasharray': [1, 0.6] },
    });
  }
  // markers
  const membership = dayMembership(TRIP);
  Object.entries(TRIP.places).forEach(([key, p]) => {
    if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
    const days = membership[key] || new Set();
    const el = markerElement(p.cat, [...days].sort().join('·'));
    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([p.lng, p.lat])
      .setPopup(new maplibregl.Popup({ offset: 26, closeButton: false, maxWidth: '260px' }).setHTML(popupHTML(p)))
      .addTo(map);
    markerObjs.push({ marker, el, placeKey: key, days });
  });
}

function applyDayFilter() {
  if (map.getLayer('route-lines')) {
    map.setFilter('route-lines', activeDay ? ['==', ['get', 'day'], activeDay] : null);
  }
  markerObjs.forEach(m => {
    const on = !activeDay || m.days.has(activeDay);
    m.el.style.opacity = on ? '1' : '0.25';
    m.el.style.filter = on ? 'none' : 'grayscale(1)';
    m.el.style.zIndex = on ? '2' : '1';
  });
  fitTo(activeDay);
}

function fitTo(day) {
  const pts = markerObjs
    .filter(m => !day || m.days.has(day))
    .map(m => m.marker.getLngLat());
  if (!pts.length) return;
  const b = new maplibregl.LngLatBounds();
  pts.forEach(ll => b.extend(ll));
  map.fitBounds(b, { padding: 56, pitch: 50, duration: 900, maxZoom: 14 });
}

function setStyle(next) {
  mode = next;
  map.setStyle(STYLES[mode]);
  map.once('styledata', () => { add3DBuildings(); rebuildLayers(); applyDayFilter(); });
}

// after a setStyle, sources/layers added by us are wiped — re-add
function rebuildLayers() {
  if (!map.getSource('routes')) {
    map.addSource('routes', { type: 'geojson', data: routesGeoJSON(TRIP) });
    map.addLayer({
      id: 'route-lines', type: 'line', source: 'routes',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': ['get', 'color'], 'line-width': 4, 'line-opacity': 0.85, 'line-dasharray': [1, 0.6] },
    });
  }
}

export function flyToPlace(key) {
  const m = markerObjs.find(o => o.placeKey === key);
  if (!m) { pendingFly = key; return; }
  const ll = m.marker.getLngLat();
  map.flyTo({ center: ll, zoom: 16, pitch: 55, bearing: -17, duration: 1200, essential: true });
  m.marker.togglePopup();
}

export function initMap(trip) {
  if (map) { map.resize(); if (pendingFly) { flyToPlace(pendingFly); pendingFly = null; } return; }
  TRIP = trip;
  map = new maplibregl.Map({
    container: 'map',
    style: STYLES[mode],
    center: [135.72, 35.01],
    zoom: 9.2, pitch: 45, bearing: -15,
    attributionControl: { compact: true },
    cooperativeGestures: false,
  });
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
  map.addControl(new maplibregl.FullscreenControl(), 'top-right');

  map.on('load', () => {
    add3DBuildings();
    addRoutesAndMarkers();
    applyDayFilter();
    if (pendingFly) { flyToPlace(pendingFly); pendingFly = null; }
  });

  // day filter chips
  document.querySelectorAll('.map-bar [data-day]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeDay = Number(btn.dataset.day);
      document.querySelectorAll('.map-bar [data-day]').forEach(b =>
        b.classList.toggle('active', b === btn));
      applyDayFilter();
    });
  });
  // light/dark toggle
  document.querySelectorAll('.map-bar [data-mode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
    btn.addEventListener('click', () => {
      if (btn.dataset.mode === mode) return;
      setStyle(btn.dataset.mode);
      document.querySelectorAll('.map-bar [data-mode]').forEach(b =>
        b.classList.toggle('active', b.dataset.mode === mode));
    });
  });
}
