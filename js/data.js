// TRIP — single source of truth. Design Ref: §4 data model.
// Built from 서울시립대 도시과학대학 연찬회 세부일정 (2026.06.24~26, 교토첨단과학대 방문).
// Coordinates refined by scripts/geocode.py; descriptions enriched via deep research.
import { IMAGES, CREDITS } from './assets.js';

// Coordinates: deep-research + OSM Nominatim verified (docs/_research_readable.md).
const PLACES = {
  // --- transport ---
  kix: { name: '간사이 국제공항 (KIX)', cat: 'transport', lat: 34.4348, lng: 135.2440,
    area: '오사카만', desc: '여행의 관문. 1일차 KE723편 도착(인천 09:35 → 관서 11:20), 3일차 LJ236편 귀국(관서 16:05 → 인천 18:10). 일본 전자입국 VISIT JAPAN 72시간 전 등록.' },

  // --- hotels ---
  hotel_kyoto: { name: '호텔 몬트레 교토', cat: 'hotel', lat: 35.00797, lng: 135.75956,
    area: '교토 카라스마산조', desc: '4성급. 교토 중심부 카라스마산조(烏丸三条). 지하철 카라스마선·도자이선 카라스마오이케역 6번 출구에서 남쪽 도보 2분. 대욕장 12:00–23:00(입장 마감 22:00).',
    addr: '京都市中京区烏丸通三条下る饅頭屋町604', url: 'https://www.hotelmonterey.co.jp/kyoto/' },
  hotel_kobe: { name: '호텔 몬트레 고베', cat: 'hotel', lat: 34.69369, lng: 135.18995,
    area: '고베 산노미야', desc: 'JR 고베선 산노미야(三ノ宮)역 서출구에서 도보 6분. 남녀 대욕장 이용 가능, 주변 편의시설 다양.',
    addr: '神戸市中央区', url: 'https://www.hotelmonterey.co.jp/kobe/' },

  // --- campus (★ 핵심 방문지) ---
  kuas: { name: '교토첨단과학대학 (KUAS)', cat: 'campus', lat: 35.01094, lng: 135.71858,
    area: '교토 우즈마사', desc: '京都先端科学大学 우즈마사(太秦) 캠퍼스. 본 연찬회의 핵심 방문지. 우경구 야마노우치 고탄다초.',
    addr: '京都府京都市右京区山ノ内五反田町18 (〒615-8577, 주차장 없음)', url: 'https://www.kuas.ac.jp/' },

  // --- temples / shrines ---
  kinkakuji: { name: '금각사 (金閣寺)', cat: 'temple', lat: 35.03901, lng: 135.72895,
    area: '교토 북부', desc: '금박 누각이 연못(쿄코치)에 비치는 로쿠온지. 무로마치 시대 아시카가 요시미츠가 별장으로 지었고, 현 건물은 1955년 재건. 오전 햇빛에 금박이 가장 빛난다.', hours: '09:00–17:00' },
  ginkakuji: { name: '은각사 (銀閣寺)', cat: 'temple', lat: 35.0270, lng: 135.7982,
    area: '교토 동부', desc: '히가시야마 문화의 정수 지쇼지. 은모래 정원(긴샤단)과 향월대, 이끼 정원이 단아하다. 철학의 길과 연결.', hours: '08:30–17:00' },
  kiyomizu: { name: '청수사 (清水寺)', cat: 'temple', lat: 34.99483, lng: 135.78500,
    area: '히가시야마', desc: '못 하나 없이 지은 본당 무대(키요미즈의 무대)에서 교토 시가지를 굽어본다. 오토와 폭포의 세 줄기는 학업·연애·장수를 상징. 진입로 산넨자카·니넨자카 골목 산책.', hours: '06:00–18:00' },
  nonomiya: { name: '노노미야 진자 (野宮神社)', cat: 'temple', lat: 35.0181, lng: 135.6739,
    area: '아라시야마', desc: '껍질을 벗기지 않은 검은 도리이(쿠로키 도리이)로 유명. 옛 사이구(재궁) 정화의 터로, 인연·학업 성취를 비는 신사.' },

  // --- sights ---
  bamboo: { name: '아라시야마 대나무숲 (치쿠린)', cat: 'sight', lat: 35.01684, lng: 135.67156,
    area: '아라시야마', desc: '하늘을 가리는 대나무 산책로(치쿠린노코미치). 바람에 스치는 댓잎 소리가 일본 음풍경 100선에 선정. 이른 아침이 가장 한적하다.' },
  togetsukyo: { name: '도게츠교 (渡月橋)', cat: 'sight', lat: 35.0132, lng: 135.6779,
    area: '아라시야마', desc: '가쓰라강(오이강)을 가로지르는 아라시야마의 상징적 다리. 달이 건너는 듯하다 하여 붙은 이름으로, 사계절 산세 전망이 일품.' },
  himeji: { name: '히메지성 (姫路城)', cat: 'sight', lat: 34.8394, lng: 134.6939,
    area: '효고 히메지', desc: '백로가 날개를 편 듯한 백로성(白鷺城). 1601~1609년 이케다 데루마사가 현 천수각을 완성한 에도 초기 히라야마성으로, 일본 최초 세계문화유산이자 국보. 천수각까지 언덕·계단이 많아 가벼운 등산 수준 — 편한 복장 권장.', hours: '09:00–16:00' },

  // --- food (체인·지점 확정, 좌표는 지점 기준) ---
  gochisomura: { name: '고치소우무라 다카이시점', cat: 'food', lat: 34.52074, lng: 135.44243,
    area: '오사카 다카이시', desc: '1일차 중식(일정식, 예약완료). 오사카 다카이시시 — KIX에서 교토로 가는 길목.', addr: '大阪府高石市' },
  yakinikuking: { name: '야키니쿠킹 교토 카츠라점', cat: 'food', lat: 34.96934, lng: 135.71858,
    area: '교토 카츠라', desc: '1일차 석식. 야키니쿠 + 주류뷔페 포함. 西京区 牛ヶ瀬(카츠라가와역 인근) 단일 지점.', addr: '京都市西京区牛ヶ瀬山柿町3 (〒615-8044)' },
  arashiyama_resto: { name: '레스토랑 아라시야마', cat: 'food', lat: 35.01439, lng: 135.67746,
    area: '아라시야마', desc: "2일차 중식. 교토 가정식 오반자이 뷔페 '京のごちそうビュッフェ'(성인 약 2,200엔, 50분제). 아라시야마·도게츠교가 보이는 좌석에서 와식·양식·스위츠 제공." },
  kagonoya: { name: '가고노야 고베 스미요시점', cat: 'food', lat: 34.71877, lng: 135.26363,
    area: '고베 스미요시', desc: '2일차 석식. 일식 정식 체인 가고노야. 호텔까지 차량 약 20분.', addr: 'かごの屋 神戸住吉店' },
  takadanobaba: { name: '다카다노바바 (高田の馬場)', cat: 'food', lat: 34.83808, lng: 134.69404,
    area: '효고 히메지', desc: "3일차 중식. 히메지성 오테몬(大手門) 앞 정식(御膳) 전문점. 히메지 명물 오뎅 포함, 御膳 메뉴(아게하초·미츠히메·간베에)는 히메지성 역사에서 유래. 예약 권장.", addr: '兵庫県姫路市本町68 (〒670-0012)' },
};

// attach bundled images only for keys actually downloaded
const places = Object.fromEntries(
  Object.entries(PLACES).map(([k, p]) => {
    const file = IMAGES[k];
    return [k, file ? { ...p, img: `images/${file}` } : p];
  })
);

export const TRIP = {
  meta: {
    title: '교토 · 히메지 · 고베',
    subtitle: '서울시립대 도시과학대학 · 교토첨단과학대(KUAS) 방문',
    dates: '2026.06.24(수) ~ 06.26(금) · 2박 3일',
    party: '서울시립대학교 도시과학대학',
    lang: 'ko',
  },
  places,
  itinerary: [
    { day: 1, date: '6/24 (수)', label: '인천 → 관서 · 교토첨단과학대 · 금각사', items: [
      { time: '11:20', placeKey: 'kix', note: 'KE723 인천 09:35 출발 → 관서공항 도착, 전용버스(45인승) 탑승' },
      { time: '12:30', placeKey: 'gochisomura', note: '중식 (일정식, 예약완료)' },
      { time: '14:00', placeKey: 'kuas', note: '★ 방문지 — 교토첨단과학대학 우즈마사 캠퍼스' },
      { time: '15:00', placeKey: 'kinkakuji', note: '15:00–16:30 관람' },
      { time: '18:00', placeKey: 'yakinikuking', note: '석식 (야키니쿠 + 주류뷔페)' },
      { time: '저녁', placeKey: 'hotel_kyoto', note: '체크인 · 대욕장' },
    ]},
    { day: 2, date: '6/25 (목)', label: '교토 사찰 · 아라시야마 → 고베', items: [
      { time: '09:00', placeKey: 'kiyomizu', note: '09:00–11:00 · 산넨자카·니넨자카' },
      { time: '11:30', placeKey: 'ginkakuji', note: '11:30–12:00' },
      { time: '13:00', placeKey: 'arashiyama_resto', note: '중식 (오반자이 뷔페)' },
      { time: '14:00', placeKey: 'togetsukyo', note: '14:00–16:00 아라시야마' },
      { time: '14:00', placeKey: 'bamboo', note: '치쿠린 산책' },
      { time: '14:00', placeKey: 'nonomiya', note: '검은 도리이' },
      { time: '18:00', placeKey: 'kagonoya', note: '석식 (고베 이동 후)' },
      { time: '저녁', placeKey: 'hotel_kobe', note: '투숙 · 대욕장' },
    ]},
    { day: 3, date: '6/26 (금)', label: '히메지성 → 관서 → 인천', items: [
      { time: '10:00', placeKey: 'himeji', note: '체크아웃 후 히메지 이동(약 1h30m) · 10:00–11:00 관람' },
      { time: '11:00', placeKey: 'takadanobaba', note: '중식 (히메지 정식·명물 오뎅)' },
      { time: '16:05', placeKey: 'kix', note: 'LJ236 관서 16:05 출발 → 인천 18:10 도착' },
    ]},
  ],
  credits: CREDITS,
};
