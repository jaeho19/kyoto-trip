// Pure render functions (input-immutable, return HTML strings).
// Design Ref: §5 render design. v3: day-color theming, filters, day cards.
import { icon, catMeta } from './icons.js';
import { DAY_COLORS, dayColor, dayMembership, dDayInfo } from './trip-utils.js';

const esc = (s = '') => String(s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ───────────────────────── places ───────────────────────── */

// hero block: real image -> background-image; else designed card (cat color + pattern)
function cardHero(place, days) {
  const cm = catMeta(place.cat);
  const badge = `<span class="cat-badge" style="--cat:${cm.color}">${icon(cm.icon, 13)}${esc(cm.label)}</span>`;
  const repTag = place.imgRep ? `<span class="rep-tag" title="실제 장소가 아닌 분위기 대표 이미지입니다">대표 이미지</span>` : '';
  const dayTags = days.length
    ? `<span class="hero-days">${days.map(d => `<span class="day-mini" style="--dc:${dayColor(d)}">Day ${d}</span>`).join('')}</span>`
    : '';
  if (place.img) {
    return `<div class="hero" style="background-image:url('${esc(place.img)}')">${badge}${repTag}${dayTags}</div>`;
  }
  return `<div class="hero designed" style="--cat:${cm.color};background-color:${cm.color}">
    ${badge}${dayTags}<span class="glyph">${icon(cm.icon, 56)}</span></div>`;
}

function placeCard(place, days, key) {
  const meta = [
    place.area ? `📍 ${esc(place.area)}` : '',
    place.hours ? `🕘 ${esc(place.hours)}` : '',
    place.url ? `<a href="${esc(place.url)}" target="_blank" rel="noopener">공식 사이트 ↗</a>` : '',
  ].filter(Boolean).map(m => `<span>${m}</span>`).join('');
  const actions = (typeof place.lat === 'number')
    ? `<div class="card-actions">
        <a class="act act-map" href="#map" data-fly="${esc(key)}">${icon('map', 14)} 지도에서 보기</a>
      </div>`
    : '';
  return `<article class="card" data-key="${esc(key)}" data-cat="${esc(place.cat)}" data-days="${days.join(' ')}">
    ${cardHero(place, days)}
    <div class="body">
      <h3>${esc(place.name)}</h3>
      ${place.desc ? `<p class="desc">${esc(place.desc)}</p>` : ''}
      ${place.addr ? `<p class="addr">🗺️ ${esc(place.addr)}</p>` : ''}
      <div class="meta">${meta}</div>
      ${actions}
    </div>
  </article>`;
}

export function renderPlaces(trip) {
  const membership = dayMembership(trip);
  const order = ['campus', 'sight', 'temple', 'food', 'hotel', 'transport'];
  const present = order.filter(c => Object.values(trip.places).some(p => p.cat === c));

  const dayChips = trip.itinerary.map(d =>
    `<button class="f-chip day" type="button" data-filter="day" data-val="${d.day}" style="--dc:${dayColor(d.day)}">Day ${d.day}</button>`).join('');
  const catChips = present.map(c => {
    const cm = catMeta(c);
    return `<button class="f-chip" type="button" data-filter="cat" data-val="${c}" style="--cat:${cm.color}">${icon(cm.icon, 13)}${esc(cm.label)}</button>`;
  }).join('');

  const cards = Object.entries(trip.places)
    .map(([k, p]) => placeCard(p, [...(membership[k] || [])].sort((a, b) => a - b), k))
    .join('');

  return `<h2 class="section-title">장소</h2>
    <p class="lead">${Object.keys(trip.places).length}곳 · 분류와 일정으로 골라 보세요.</p>
    <div class="filters">
      <div class="f-row">
        <span class="f-label">일정</span>
        <button class="f-chip all active" type="button" data-filter="day" data-val="all">전체</button>
        ${dayChips}
      </div>
      <div class="f-row">
        <span class="f-label">분류</span>
        <button class="f-chip all active" type="button" data-filter="cat" data-val="all">전체</button>
        ${catChips}
      </div>
    </div>
    <div class="filter-count" id="filter-count"></div>
    <div class="cards">${cards}</div>
    <p class="empty-state" id="places-empty" hidden>선택한 조건에 맞는 장소가 없어요.</p>`;
}

/* ───────────────────────── itinerary ───────────────────────── */

export function renderItinerary(trip) {
  const dd = dDayInfo(trip.meta.startDate, trip.meta.endDate);

  const pills = trip.itinerary.map(d =>
    `<button class="day-pill" type="button" data-day-jump="${d.day}" style="--dc:${dayColor(d.day)}">
       <span class="dp-no">Day ${d.day}</span><span class="dp-date">${esc(d.date.split(' ')[0])}</span>
     </button>`).join('');

  const days = trip.itinerary.map(day => {
    const dc = dayColor(day.day);
    const items = day.items.map(it => {
      const p = trip.places[it.placeKey];
      if (!p) return '';
      const cm = catMeta(p.cat);
      return `<li class="t-item">
        <div class="t-time">${it.time ? esc(it.time) : ''}</div>
        <span class="t-dot" style="--cat:${cm.color}">${icon(cm.icon, 11)}</span>
        <div class="t-main">
          <a class="t-name" href="#map" data-fly="${esc(it.placeKey)}">
            <span class="t-place">${esc(p.name)}</span>
            <span class="t-cat" style="--cat:${cm.color}">${esc(cm.label)}</span>
            <span class="fly-hint">${icon('map', 12)} 지도</span>
          </a>
          ${it.note ? `<div class="t-note">${esc(it.note)}</div>` : ''}
        </div>
      </li>`;
    }).join('');
    return `<section class="day-card" id="day-${day.day}" style="--dc:${dc}">
      <header class="day-card-head">
        <div class="day-no"><span class="d-lbl">DAY</span><span class="d-num">${String(day.day).padStart(2, '0')}</span></div>
        <div class="day-info">
          <div class="day-title">${esc(day.label)}</div>
          <div class="day-sub">${esc(day.date)} · 일정 ${day.items.length}개</div>
        </div>
      </header>
      <ol class="timeline">${items}</ol>
    </section>`;
  }).join('');

  return `<section class="trip-hero">
      <div class="hero-kicker">${esc(trip.meta.party)}</div>
      <h2 class="hero-title">${esc(trip.meta.title)}</h2>
      <p class="hero-sub">${esc(trip.meta.subtitle)}</p>
      <div class="hero-meta">
        <span class="hm-pill">${icon('calendar', 14)} ${esc(trip.meta.dates)}</span>
        ${trip.meta.transport ? `<span class="hm-pill">${icon('transport', 14)} ${esc(trip.meta.transport)}</span>` : ''}
        <span class="hm-pill dday ${dd.state}">${esc(dd.label)}</span>
      </div>
    </section>
    <nav class="day-nav" aria-label="일자 바로가기">${pills}</nav>
    ${days}`;
}

/* ───────────────────────── info ───────────────────────── */

export function renderInfo(trip) {
  const credits = (trip.credits || []).map(c => `<li class="credit">
    <div class="t">${esc(c.title)}</div>
    <div class="l">© ${esc(c.author)} · <a href="${esc(c.licenseUrl)}" target="_blank" rel="noopener">${esc(c.license)}</a>
      · <a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener">Wikimedia Commons</a></div>
  </li>`).join('');
  return `<h2 class="section-title">정보</h2>
    <p class="lead">일정·장소·정보는 오프라인 동작 · 저작권 안전 자산.</p>
    <div class="note-box">
      이 앱은 설치형 PWA입니다. 한 번 로드하면 비행기·지하철 등 <b>오프라인</b>에서도
      일정·장소·정보를 볼 수 있습니다. <b>지도 탭</b>은 구글 지도를 사용하므로 네트워크 연결이 필요합니다.
    </div>
    <h3 style="font-family:var(--font-serif);margin:var(--sp-6) 0 var(--sp-2)">이미지 출처 / 라이선스</h3>
    <p class="lead" style="margin-bottom:var(--sp-2)">장소 사진은 Wikimedia Commons의 CC/PD 이미지입니다. CC BY/BY-SA는 저작자 표기가 필요합니다.</p>
    <ul class="credits">${credits || '<li class="credit"><div class="l">번들된 이미지 출처가 여기에 표기됩니다.</div></li>'}</ul>`;
}
