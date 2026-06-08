// TRIP — single source of truth. Design Ref: §4 data model.
// Coordinates are real landmark positions (WGS84). Dates/reservations are
// EDITABLE placeholders — adjust meta.dates and itinerary[].date freely.
import { IMAGES, CREDITS } from './assets.js';

const PLACES = {
  // --- transport ---
  kix: { name: '간사이 국제공항 (KIX)', cat: 'transport', lat: 34.4348, lng: 135.2440,
    area: '오사카만', desc: '여행의 시작·끝. 교토행 하루카(특급)·리무진버스 환승.', img: true },

  // --- hotels ---
  hotel_kyoto: { name: '호텔 몬트레 교토', cat: 'hotel', lat: 35.0048, lng: 135.7595,
    area: '교토 가라스마', desc: '가라스마 오이케 인근. 지하철 접근 좋음.', addr: '京都市中京区' },
  hotel_kobe: { name: '호텔 몬트레 고베', cat: 'hotel', lat: 34.6955, lng: 135.1935,
    area: '고베 산노미야', desc: '기타노·산노미야 인근. 차이나타운·항구 도보권.', addr: '神戸市中央区' },

  // --- temples / shrines ---
  kinkakuji: { name: '금각사 (金閣寺)', cat: 'temple', lat: 35.0394, lng: 135.7292,
    area: '교토 북부', desc: '금박 누각이 연못에 비치는 로쿠온지. 오전 방문 추천.', img: true, hours: '09:00–17:00' },
  ginkakuji: { name: '은각사 (銀閣寺)', cat: 'temple', lat: 35.0270, lng: 135.7982,
    area: '교토 동부', desc: '히가시야마 자코지. 철학의 길과 연결.', img: true, hours: '08:30–17:00' },
  kiyomizu: { name: '청수사 (清水寺)', cat: 'temple', lat: 34.9949, lng: 135.7850,
    area: '히가시야마', desc: '본당 무대(키요미즈의 무대)와 오토와 폭포.', img: true, hours: '06:00–18:00' },
  nonomiya: { name: '노노미야 진자 (野宮神社)', cat: 'temple', lat: 35.0181, lng: 135.6739,
    area: '아라시야마', desc: '검은 도리이(쿠로키 도리이)와 인연·학업의 신사.', img: true },

  // --- sights ---
  bamboo: { name: '아라시야마 대나무숲', cat: 'sight', lat: 35.0170, lng: 135.6716,
    area: '아라시야마', desc: '치쿠린 산책로. 이른 아침이 한적.', img: true },
  togetsukyo: { name: '도게츠교 (渡月橋)', cat: 'sight', lat: 35.0132, lng: 135.6779,
    area: '아라시야마', desc: '가쓰라강 위 상징적인 다리. 강변 풍경.', img: true },
  himeji: { name: '히메지성 (姫路城)', cat: 'sight', lat: 34.8394, lng: 134.6939,
    area: '히메지', desc: '백로성(白鷺城), 일본 최초 세계유산 천수각.', img: true, hours: '09:00–16:00' },

  // --- campus ---
  kuas: { name: '교토첨단과학대학 (KUAS)', cat: 'campus', lat: 35.0089, lng: 135.5544,
    area: '가메오카', desc: '京都先端科学大学 가메오카 캠퍼스. 교토 시내에서 JR 산인선.', img: true },

  // --- food (Commons에 적합 이미지 드묾 → 디자인 카드 폴백) ---
  gochisomura: { name: '고치소우무라', cat: 'food', lat: 34.9858, lng: 135.7588,
    area: '교토역 인근', desc: '간사이식 이자카야. 위치는 대략값 — 예약 시 확정.' },
  yakinikuking: { name: '야키니쿠킹', cat: 'food', lat: 35.0050, lng: 135.6100,
    area: '교토 외곽', desc: '야키니쿠 패밀리 체인. 위치는 대략값.' },
  arashiyama_resto: { name: '레스토랑 아라시야마', cat: 'food', lat: 35.0150, lng: 135.6780,
    area: '아라시야마', desc: '아라시야마 관광 중 점심. 위치는 대략값.' },
  kagonoya: { name: '가고노야', cat: 'food', lat: 34.9920, lng: 135.7600,
    area: '교토 시내', desc: '일식 정식 체인. 위치는 대략값.' },
  takadanobaba: { name: '다카다노바바', cat: 'food', lat: 34.6940, lng: 135.1950,
    area: '고베 산노미야', desc: '저녁 식사. 위치는 대략값 — 예약 시 확정.' },
};

// attach bundled images only for keys actually downloaded
const places = Object.fromEntries(
  Object.entries(PLACES).map(([k, p]) => {
    const file = IMAGES[k];
    const { img, ...rest } = p;
    return [k, file ? { ...rest, img: `images/${file}` } : rest];
  })
);

export const TRIP = {
  meta: {
    title: '교토 · 히메지 · 고베',
    subtitle: '간사이 5일 여행',
    dates: '날짜 미정 — 편집하세요',
    party: '개인/소그룹',
    lang: 'ko',
  },
  places,
  // 편집 가능한 일정 스켈레톤. date 문자열을 실제 날짜로 교체하세요.
  itinerary: [
    { day: 1, date: 'Day 1', label: '도착 · 교토 입성', items: [
      { time: '오후', placeKey: 'kix', note: '간사이공항 도착 → 하루카 특급' },
      { time: '저녁', placeKey: 'hotel_kyoto', note: '체크인' },
      { time: '저녁', placeKey: 'gochisomura', note: '첫 저녁' },
    ]},
    { day: 2, date: 'Day 2', label: '교토 사찰', items: [
      { time: '09:00', placeKey: 'kinkakuji', note: '개장 직후' },
      { time: '11:00', placeKey: 'ginkakuji', note: '철학의 길' },
      { time: '14:00', placeKey: 'kiyomizu', note: '히가시야마' },
      { time: '저녁', placeKey: 'kagonoya' },
    ]},
    { day: 3, date: 'Day 3', label: '아라시야마 · 캠퍼스', items: [
      { time: '오전', placeKey: 'bamboo', note: '이른 아침 한적' },
      { time: '오전', placeKey: 'nonomiya', note: '검은 도리이' },
      { time: '오전', placeKey: 'togetsukyo' },
      { time: '점심', placeKey: 'arashiyama_resto' },
      { time: '오후', placeKey: 'kuas', note: 'JR 산인선 가메오카' },
      { time: '저녁', placeKey: 'yakinikuking' },
    ]},
    { day: 4, date: 'Day 4', label: '히메지 → 고베', items: [
      { time: '오전', placeKey: 'himeji', note: '신칸센/특급으로 히메지' },
      { time: '오후', placeKey: 'hotel_kobe', note: '고베 체크인' },
      { time: '저녁', placeKey: 'takadanobaba' },
    ]},
    { day: 5, date: 'Day 5', label: '출국', items: [
      { time: '오전', placeKey: 'hotel_kobe', note: '체크아웃' },
      { time: '오후', placeKey: 'kix', note: '리무진버스 → 출국' },
    ]},
  ],
  credits: CREDITS,
};
