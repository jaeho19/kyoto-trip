// Shared trip helpers — pure, input-immutable. Used by render / places / map.
// Single source for per-day colors + membership + ordered driving route + D-day.

export const DAY_COLORS = { 1: '#b5462f', 2: '#2f7d6b', 3: '#5a6cae' };

export function dayColor(day) {
  return DAY_COLORS[day] || 'var(--accent)';
}

// placeKey -> Set(day numbers it appears in)
export function dayMembership(trip) {
  const m = {};
  trip.itinerary.forEach(d => d.items.forEach(it => {
    (m[it.placeKey] ||= new Set()).add(d.day);
  }));
  return m;
}

// sorted day numbers for one place key
export function placeDays(trip, key) {
  const m = dayMembership(trip)[key];
  return m ? [...m].sort((a, b) => a - b) : [];
}

// ordered, consecutive-deduped stops with coords for one day (driving route order)
export function dayRouteCoords(trip, day) {
  const d = trip.itinerary.find(x => x.day === day);
  if (!d) return [];
  const out = [];
  d.items.forEach(it => {
    const p = trip.places[it.placeKey];
    if (!p || typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
    const last = out[out.length - 1];
    if (last && last.lat === p.lat && last.lng === p.lng) return;
    out.push({ key: it.placeKey, name: p.name, cat: p.cat, lat: p.lat, lng: p.lng, time: it.time });
  });
  return out;
}

// runtime D-day from device clock (no mental date math). state: before|during|after
export function dDayInfo(startISO, endISO, now = new Date()) {
  const toMid = (y, m, d) => new Date(y, m, d).getTime();
  const [sy, sm, sd] = startISO.split('-').map(Number);
  const [ey, em, ed] = endISO.split('-').map(Number);
  const start = toMid(sy, sm - 1, sd);
  const end = toMid(ey, em - 1, ed);
  const today = toMid(now.getFullYear(), now.getMonth(), now.getDate());
  const DAY = 86400000;
  if (today < start) return { label: `D-${Math.round((start - today) / DAY)}`, state: 'before' };
  if (today <= end) return { label: `여행 중 · Day ${Math.round((today - start) / DAY) + 1}`, state: 'during' };
  return { label: '여행 완료', state: 'after' };
}
