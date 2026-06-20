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

/* ───────────────────────── forum ───────────────────────── */

const FORUM_KIND = {
  keynote:  { emo: '🎤', label: '특강', cls: 'kn' },
  panel:    { emo: '💬', label: '토론', cls: 'pn' },
  talk:     { emo: '📊', label: '발표', cls: 'tk' },
  ceremony: { emo: '🎓', label: '의례', cls: 'cm' },
};
const FLAG = { jp: '🇯🇵', kr: '🇰🇷' };

function forumProgram(program = []) {
  const rows = program.map(p => {
    const k = FORUM_KIND[p.kind] || FORUM_KIND.talk;
    return `<li class="fp-item ${k.cls}">
      <span class="fp-seq">${esc(p.seq)}</span>
      <div class="fp-main">
        <div class="fp-title">${esc(p.title)}</div>
        ${p.who ? `<div class="fp-who">${esc(p.who)}</div>` : ''}
      </div>
      <span class="fp-kind">${k.emo} ${esc(k.label)}</span>
    </li>`;
  }).join('');
  return `<ol class="forum-program">${rows}</ol>`;
}

function avatar(name = '?') {
  return `<span class="sp-avatar" aria-hidden="true">${esc(String(name).trim().charAt(0))}</span>`;
}

function satoTalk(s) {
  const bullets = (s.summary || []).map(x => `<li>${esc(x)}</li>`).join('');
  const material = s.material ? `<figure class="sp-material">
    <img src="${esc(s.material)}" alt="${esc(s.materialCaption || '강연 자료')}" loading="lazy" />
    ${s.materialCaption ? `<figcaption>${esc(s.materialCaption)}${s.materialCredit ? `<span class="sp-credit">${esc(s.materialCredit)}</span>` : ''}</figcaption>` : ''}
  </figure>` : '';
  return `${s.talkTitle ? `<div class="sp-talktitle">“${esc(s.talkTitle)}”</div>` : ''}
    ${bullets ? `<ul class="sp-summary">${bullets}</ul>` : ''}
    ${material}`;
}

function speakerCard(s) {
  const flag = FLAG[s.country] || '';
  const topic = s.topic ? `<div class="sp-topic">${esc(s.topic)}${s.topicEn ? `<span class="sp-topic-en">${esc(s.topicEn)}</span>` : ''}</div>` : '';
  const role = s.role ? `<span class="sp-tag">${esc(s.role)}</span>` : '';
  const note = s.note ? `<span class="sp-tag warn">${esc(s.note)}</span>` : '';
  const isKeynote = s.id === 'sato';
  return `<article class="speaker${isKeynote ? ' keynote' : ''}">
    <header class="sp-head">
      ${avatar(s.name)}
      <div class="sp-id">
        <div class="sp-name">${flag} ${esc(s.name)}${role}${note}</div>
        ${s.affil ? `<div class="sp-affil">${esc(s.affil)}</div>` : ''}
      </div>
    </header>
    ${s.bio ? `<p class="sp-bio">${esc(s.bio)}</p>` : ''}
    ${s.profileUrl ? `<a class="sp-link" href="${esc(s.profileUrl)}" target="_blank" rel="noopener">${esc(s.profileLabel || '공식 프로필 ↗')}</a>` : ''}
    ${topic}
    ${isKeynote ? satoTalk(s) : ''}
  </article>`;
}

export function renderForum(trip) {
  const f = trip.forum;
  if (!f) return `<h2 class="section-title">포럼</h2><p class="lead">포럼 정보가 없습니다.</p>`;
  const heroStyle = f.hero
    ? ` style="background-image:linear-gradient(180deg, rgba(20,18,15,.15), rgba(20,18,15,.8)), url('${esc(f.hero)}')"`
    : '';
  const hero = `<section class="forum-hero"${heroStyle}>
    <div class="fh-body">
      ${f.host ? `<div class="fh-kicker">${esc(f.host)}</div>` : ''}
      <h2 class="fh-title">${esc(f.title)}</h2>
      ${f.subtitleEn ? `<div class="fh-sub">${esc(f.subtitleEn)}</div>` : ''}
      <div class="fh-meta">
        ${f.datetime ? `<span class="fh-pill">${icon('calendar', 14)} ${esc(f.datetime)}</span>` : ''}
        ${f.venue ? `<span class="fh-pill">${icon('campus', 14)} ${esc(f.venue)}</span>` : ''}
      </div>
    </div>
  </section>`;
  const speakers = (f.speakers || []).map(speakerCard).join('');
  return `${hero}
    <h3 class="forum-h">식순</h3>
    ${forumProgram(f.program)}
    <h3 class="forum-h">연사 · 발표</h3>
    <div class="speakers">${speakers}</div>`;
}

/* ───────────────────────── info ───────────────────────── */

// common section wrapper (emoji glyph is a literal, title is escaped)
function infoSection(emoji, title, body) {
  if (!body) return '';
  return `<section class="info-sec">
    <h3 class="info-h"><span class="info-emo" aria-hidden="true">${emoji}</span>${esc(title)}</h3>
    ${body}
  </section>`;
}

const telHref = (tel = '') => tel.replace(/[^0-9+]/g, '');

function renderEmergency(e) {
  if (!e || !e.tel) return '';
  const body = `<a class="info-call" href="tel:${esc(telHref(e.tel))}">
    <span class="call-ic">${icon('phone', 20)}</span>
    <span class="call-txt"><b>${esc([e.org, e.name].filter(Boolean).join(' '))}</b><span class="call-no">${esc(e.tel)}</span></span>
  </a>`;
  return infoSection('🆘', '비상 연락처', body);
}

function renderFlights(f) {
  if (!f) return '';
  const block = (lbl, fl) => fl ? `<div class="fl-block">
    <div class="fl-no"><span class="fl-tag">${esc(lbl)}</span>${esc(fl.no)}</div>
    ${fl.route ? `<div class="fl-route">${esc(fl.route)}</div>` : ''}
    <div class="fl-time">${esc(fl.dep || '')}${fl.arr ? ` → ${esc(fl.arr)} 도착` : ''}</div>
    ${fl.meet ? `<div class="fl-meet">집결 · ${esc(fl.meet)}</div>` : ''}
  </div>` : '';
  return infoSection('✈️', '항공 · 집결', `<div class="fl-grid">${block('출국', f.out)}${block('귀국', f.back)}</div>`);
}

function renderChecklist(list) {
  if (!list || !list.length) return '';
  const items = list.map(it => `<li class="ck-item">
    <span class="ck-box" aria-hidden="true">${icon('check', 13)}</span>
    <span class="ck-txt"><b>${esc(it.t)}</b>${it.n ? `<span class="ck-note">${esc(it.n)}</span>` : ''}</span>
  </li>`).join('');
  return infoSection('✅', '준비물 체크리스트', `<ul class="checklist">${items}</ul>`);
}

function renderHotelContact(h) {
  if (!h) return '';
  const body = `<div class="hc-card">
    <div class="hc-name">${esc(h.name)}</div>
    ${h.addr ? `<div class="hc-addr">🗺️ ${esc(h.addr)}</div>` : ''}
    ${h.tel ? `<a class="hc-tel" href="tel:${esc(telHref(h.tel))}">${icon('phone', 14)} ${esc(h.tel)}</a>` : ''}
    ${h.note ? `<div class="hc-note">※ ${esc(h.note)}</div>` : ''}
  </div>`;
  return infoSection('🏨', '호텔 (Visit Japan Web 입력용)', body);
}

function renderNotices(list) {
  if (!list || !list.length) return '';
  const items = list.map(it => `<li class="nt-item">
    <b class="nt-t">${esc(it.t)}</b><span class="nt-n">${esc(it.n)}</span>
  </li>`).join('');
  return infoSection('⚠️', '현지 유의사항', `<ul class="notices">${items}</ul>`);
}

function renderBaggage(b) {
  if (!b) return '';
  const banned = (b.cabinBanned || []).map(x => `<span class="bg-chip">${esc(x)}</span>`).join('');
  return `<details class="info-sec bg-details">
    <summary class="info-h bg-sum"><span class="info-emo" aria-hidden="true">🧳</span>수하물 규정<span class="bg-caret" aria-hidden="true">▾</span></summary>
    <div class="bg-body">
      ${b.checked ? `<p class="bg-row"><b>위탁 수하물</b> ${esc(b.checked)}</p>` : ''}
      ${banned ? `<p class="bg-row"><b>기내 휴대(위탁 불가)</b></p><div class="bg-chips">${banned}</div>` : ''}
      ${b.liquid ? `<p class="bg-row"><b>기내 액체류</b> ${esc(b.liquid)}</p>` : ''}
    </div>
  </details>`;
}

function renderEntry(list) {
  if (!list || !list.length) return '';
  const items = list.map(x => `<li>${esc(x)}</li>`).join('');
  return infoSection('🛂', '출입국', `<ol class="entry-list">${items}</ol>`);
}

export function renderInfo(trip) {
  const info = trip.info || {};
  const credits = (trip.credits || []).map(c => `<li class="credit">
    <div class="t">${esc(c.title)}</div>
    <div class="l">© ${esc(c.author)} · <a href="${esc(c.licenseUrl)}" target="_blank" rel="noopener">${esc(c.license)}</a>
      · <a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener">Wikimedia Commons</a></div>
  </li>`).join('');
  return `<h2 class="section-title">정보</h2>
    <p class="lead">출발 전 확인 · 현지 실무 정보 · 오프라인 동작.</p>
    <div class="note-box">
      이 앱은 설치형 PWA입니다. 한 번 로드하면 비행기·지하철 등 <b>오프라인</b>에서도
      일정·장소·정보를 볼 수 있습니다. <b>지도 탭</b>은 구글 지도를 사용하므로 네트워크 연결이 필요합니다.
    </div>
    ${renderEmergency(info.emergency)}
    ${renderFlights(info.flights)}
    ${renderChecklist(info.checklist)}
    ${renderHotelContact(info.hotelContact)}
    ${renderNotices(info.notices)}
    ${renderBaggage(info.baggage)}
    ${renderEntry(info.entry)}
    <h3 style="font-family:var(--font-serif);margin:var(--sp-6) 0 var(--sp-2)">이미지 출처 / 라이선스</h3>
    <p class="lead" style="margin-bottom:var(--sp-2)">장소 사진은 Wikimedia Commons의 CC/PD 이미지입니다. CC BY/BY-SA는 저작자 표기가 필요합니다.</p>
    <ul class="credits">${credits || '<li class="credit"><div class="l">번들된 이미지 출처가 여기에 표기됩니다.</div></li>'}</ul>`;
}
