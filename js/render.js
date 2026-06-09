// Pure render functions (input-immutable, return HTML strings).
// Design Ref: §5 render design.
import { icon, catMeta } from './icons.js';

const esc = (s = '') => String(s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// hero block: real image -> background-image; else designed card (cat color + pattern)
function cardHero(place) {
  const cm = catMeta(place.cat);
  const badge = `<span class="cat-badge" style="--cat:${cm.color}">${icon(cm.icon, 13)}${esc(cm.label)}</span>`;
  if (place.img) {
    return `<div class="hero" style="background-image:url('${esc(place.img)}')">${badge}</div>`;
  }
  return `<div class="hero designed" style="--cat:${cm.color};background-color:${cm.color}">
    ${badge}<span class="glyph">${icon(cm.icon, 56)}</span></div>`;
}

function placeCard(place) {
  const meta = [
    place.area ? `📍 ${esc(place.area)}` : '',
    place.hours ? `🕘 ${esc(place.hours)}` : '',
    place.url ? `<a href="${esc(place.url)}" target="_blank" rel="noopener">공식 사이트 ↗</a>` : '',
  ].filter(Boolean).map(m => `<span>${m}</span>`).join('');
  return `<article class="card">
    ${cardHero(place)}
    <div class="body">
      <h3>${esc(place.name)}</h3>
      ${place.desc ? `<p class="desc">${esc(place.desc)}</p>` : ''}
      ${place.addr ? `<p class="addr">🗺️ ${esc(place.addr)}</p>` : ''}
      <div class="meta">${meta}</div>
    </div>
  </article>`;
}

export function renderPlaces(trip) {
  const cards = Object.values(trip.places).map(placeCard).join('');
  return `<h2 class="section-title">장소</h2>
    <p class="lead">${Object.keys(trip.places).length}곳 · 사진 없는 식당은 카테고리 디자인 카드로 표시됩니다.</p>
    <div class="cards">${cards}</div>`;
}

export function renderItinerary(trip) {
  const days = trip.itinerary.map(day => {
    const items = day.items.map(it => {
      const p = trip.places[it.placeKey];
      if (!p) return '';
      const cm = catMeta(p.cat);
      return `<li class="t-item">
        <span class="dot" style="--cat:${cm.color}"></span>
        ${it.time ? `<div class="time">${esc(it.time)}</div>` : ''}
        <div class="t-name"><a href="#places">${icon(cm.icon, 16)}${esc(p.name)}</a></div>
        ${it.note ? `<div class="t-note">${esc(it.note)}</div>` : ''}
      </li>`;
    }).join('');
    return `<section class="day">
      <div class="day-head">
        <span class="day-num">${day.day}</span>
        <div class="day-meta"><div class="label">${esc(day.label)}</div><div class="date">${esc(day.date)}</div></div>
      </div>
      <ul class="timeline">${items}</ul>
    </section>`;
  }).join('');
  return `<h2 class="section-title">${esc(trip.meta.title)}</h2>
    <p class="lead">${esc(trip.meta.subtitle)} · ${esc(trip.meta.dates)}</p>
    ${days}`;
}

export function renderInfo(trip) {
  const credits = (trip.credits || []).map(c => `<li class="credit">
    <div class="t">${esc(c.title)}</div>
    <div class="l">© ${esc(c.author)} · <a href="${esc(c.licenseUrl)}" target="_blank" rel="noopener">${esc(c.license)}</a>
      · <a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener">Wikimedia Commons</a></div>
  </li>`).join('');
  return `<h2 class="section-title">정보</h2>
    <p class="lead">오프라인 동작 · 외부 런타임 의존 0 · 저작권 안전 자산.</p>
    <div class="note-box">
      이 앱은 설치형 PWA입니다. 한 번 로드하면 비행기·지하철 등 <b>오프라인</b>에서도
      일정·장소·지도를 볼 수 있습니다. 지도 타일은 방문했던 영역만 캐시됩니다.
    </div>
    <h3 style="font-family:var(--font-serif);margin:var(--sp-6) 0 var(--sp-2)">이미지 출처 / 라이선스</h3>
    <p class="lead" style="margin-bottom:var(--sp-2)">장소 사진은 Wikimedia Commons의 CC/PD 이미지입니다. CC BY/BY-SA는 저작자 표기가 필요합니다.</p>
    <ul class="credits">${credits || '<li class="credit"><div class="l">번들된 이미지 출처가 여기에 표기됩니다.</div></li>'}</ul>`;
}
