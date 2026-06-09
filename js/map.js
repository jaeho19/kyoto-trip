// Google Maps map tab — keyless embed (driving route per day) + official
// directions deep-links (travelmode=driving). No API key, no billing required.
// Design Ref: §6 (v3: Google Maps + car routes).
import { icon, catMeta } from './icons.js';
import { DAY_COLORS, dayColor, dayMembership, dayRouteCoords } from './trip-utils.js';

let TRIP = null;
let activeDay = 1;
let pendingFocus = null;

const esc = (s = '') => String(s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ll = (p) => `${p.lat},${p.lng}`;

// keyless embedded map: driving directions for a day (origin → to: → to: → dest)
function dayEmbedURL(day) {
  const coords = dayRouteCoords(TRIP, day);
  if (coords.length < 2) {
    const c = coords[0];
    return c ? `https://maps.google.com/maps?q=${ll(c)}&z=14&output=embed` : '';
  }
  const saddr = ll(coords[0]);
  const daddr = coords.slice(1).map(ll).join('+to:');
  return `https://maps.google.com/maps?saddr=${saddr}&daddr=${daddr}&dirflg=d&output=embed`;
}

function placeEmbedURL(p) {
  return `https://maps.google.com/maps?q=${ll(p)}&z=16&output=embed`;
}

// official directions deep-link — opens Google Maps app, driving mode, full waypoints
function dayDirLink(day) {
  const coords = dayRouteCoords(TRIP, day);
  if (coords.length < 2) return null;
  const origin = ll(coords[0]);
  const destination = ll(coords[coords.length - 1]);
  const mids = coords.slice(1, -1).map(ll).join('|');
  const wp = mids ? `&waypoints=${encodeURIComponent(mids)}` : '';
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${wp}&travelmode=driving`;
}

function render() {
  const ui = document.getElementById('map-ui');
  if (!ui) return;
  const day = TRIP.itinerary.find(x => x.day === activeDay);
  const coords = dayRouteCoords(TRIP, activeDay);
  const dir = dayDirLink(activeDay);
  const dc = dayColor(activeDay);

  const chips = TRIP.itinerary.map(d =>
    `<button class="m-chip${d.day === activeDay ? ' active' : ''}" type="button" data-day="${d.day}" style="--dc:${dayColor(d.day)}">Day ${d.day}</button>`).join('');

  const stops = coords.map((c, i) => {
    const cm = catMeta(c.cat);
    return `<li class="m-stop">
      <span class="m-seq" style="--dc:${dc}">${i + 1}</span>
      <a class="m-stop-link" href="#places" data-goto-place="${esc(c.key)}" title="장소 탭에서 상세 보기">
        <span class="m-stop-ic" style="--cat:${cm.color}">${icon(cm.icon, 12)}</span>
        <span class="m-stop-name">${esc(c.name)}</span>
        ${c.time ? `<span class="m-stop-time">${esc(c.time)}</span>` : ''}
        <span class="m-stop-arrow" aria-hidden="true">›</span>
      </a>
    </li>`;
  }).join('');

  ui.innerHTML = `
    <div class="m-bar">${chips}</div>
    <div class="m-day-head" style="--dc:${dc}">
      <div class="m-day-t"><b>Day ${activeDay}</b> · ${esc(day.label)}</div>
      <div class="m-sub">${esc(day.date)} · 차량(전용버스) 이동 동선</div>
    </div>
    <div class="map-frame">
      <iframe id="gmap" title="구글 지도 — Day ${activeDay} 차량 동선" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen src="${dayEmbedURL(activeDay)}"></iframe>
    </div>
    ${dir ? `<a class="m-dir" href="${dir}" target="_blank" rel="noopener">${icon('transport', 17)}<span>구글 지도 앱에서 차량 길찾기 열기</span><span class="m-dir-arr">↗</span></a>` : ''}
    <ol class="m-stops">${stops}</ol>`;

  ui.querySelectorAll('.m-chip').forEach(btn =>
    btn.addEventListener('click', () => { activeDay = Number(btn.dataset.day); render(); }));
}

export function initMap(trip) {
  TRIP = trip;
  render();
  if (pendingFocus) { focusPlace(pendingFocus); pendingFocus = null; }
}

// from a timeline item: switch to the place's day route, then center the embed on it
export function focusPlace(key) {
  if (!TRIP) { pendingFocus = key; return; }
  const p = TRIP.places[key];
  if (!p || typeof p.lat !== 'number') return;
  const mem = dayMembership(TRIP)[key];
  if (mem && mem.size) activeDay = [...mem].sort((a, b) => a - b)[0];
  render();
  const frame = document.getElementById('gmap');
  if (frame) frame.src = placeEmbedURL(p);
  const sub = document.querySelector('.m-day-head .m-sub');
  if (sub) sub.textContent = `📍 ${p.name}`;
}
