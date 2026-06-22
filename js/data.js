// TRIP — single source of truth. Design Ref: §4 data model.
// Built from 서울시립대 도시과학대학 연찬회 세부일정 (2026.06.24~26, 교토첨단과학대 방문).
// Coordinates refined by scripts/geocode.py; descriptions enriched via deep research.
import { IMAGES, REPRESENTATIVE, CREDITS } from './assets.js';
const REP = new Set(REPRESENTATIVE);

// Coordinates: deep-research + OSM Nominatim verified (docs/_research_readable.md).
const PLACES = {
  // --- transport ---
  kix: { name: '간사이 국제공항 (KIX)', cat: 'transport', lat: 34.4348, lng: 135.2440,
    area: '오사카만', desc: '여행의 관문. 1일차 KE5868편 도착(인천 09:35 → 관서 11:20), 3일차 LJ236편 귀국(관서 16:05 → 인천 18:10). 일본 전자입국 VISIT JAPAN 72시간 전 등록.' },

  // --- hotels ---
  hotel_kyoto: { name: '호텔 몬트레 교토', cat: 'hotel', lat: 35.00797, lng: 135.75956,
    area: '교토 카라스마산조', desc: '4성급. 교토 중심부 카라스마산조(烏丸三条). 지하철 카라스마선·도자이선 카라스마오이케역 6번 출구에서 남쪽 도보 2분. 대욕장 12:00–23:00(입장 마감 22:00).',
    addr: '〒604-8161 京都市中京区烏丸通三条下る饅頭屋町604', tel: '075-251-7111', url: 'https://www.hotelmonterey.co.jp/kyoto/' },
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
    if (!file) return [k, p];
    return [k, { ...p, img: `images/${file}`, imgRep: REP.has(k) }];
  })
);

export const TRIP = {
  meta: {
    title: '도시과학대학 연찬회',
    subtitle: '교토 · 히메지 · 고베 · 교토첨단과학대(KUAS) 방문',
    dates: '2026.06.24(수) ~ 06.26(금) · 2박 3일',
    startDate: '2026-06-24',
    endDate: '2026-06-26',
    party: '서울시립대학교',
    transport: '전용버스 이동',
    lang: 'ko',
  },
  places,
  itinerary: [
    { day: 1, date: '6/24 (수)', label: '인천 → 관서 · 교토첨단과학대 · 금각사', items: [
      { time: '11:20', placeKey: 'kix', note: 'KE5868 인천 09:35 출발 → 관서공항 도착, 전용버스(45인승) 탑승' },
      { time: '12:30', placeKey: 'gochisomura', note: '중식 (일정식, 예약완료)' },
      { time: '15:00', placeKey: 'kuas', note: '★ 방문지 — 교토첨단과학대학 우즈마사 캠퍼스' },
      { time: '16:30', placeKey: 'kinkakuji', note: '16:30–17:30 관람' },
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
  // 실무 정보 — 「2026 도시과학대학 국제학술 발전포럼 안내문」에서 선별. 정보 탭에 섹션 렌더.
  info: {
    emergency: {
      org: '(주)마스터스투어', name: '장현철 사장', tel: '010-3386-3950',
    },
    flights: {
      out: { no: 'KE5868', route: '인천 T2 → 관서(KIX)', dep: '06/24(수) 09:35', arr: '11:20',
             meet: '07:00 인천 T2 3층 B·C·D 수속 / 09:00 게이트 최종집결' },
      back: { no: 'LJ236', route: '관서(KIX) → 인천 T2', dep: '06/26(금) 16:05', arr: '18:10' },
    },
    checklist: [
      { t: '여권', n: '+ 사본·여권사진 2매(분실 대비). 훼손 시 입국 거부 가능' },
      { t: 'Visit Japan Web QR', n: '출국 72시간 전 등록 후 캡처' },
      { t: '멀티 어댑터', n: "일본 110V — 흔히 '돼지코'" },
      { t: '우산', n: '필수 (장마철)' },
      { t: '비즈니스 캐주얼', n: '공식 기관(KUAS) 방문용 단정한 복장' },
      { t: '엔화 현금', n: '소액권 — 카드 불가 점포·자판기 대비' },
      { t: '상비약', n: '소화제·지사제·밴드 등 (개인 복용약은 별도)' },
    ],
    hotelContact: {
      name: 'HOTEL MONTERREY KYOTO (ホテルモントレ京都)',
      addr: '〒604-8161 京都府京都市中京区烏丸通三条下ル饅頭屋町604',
      tel: '075-251-7111',
      note: 'Visit Japan Web 입력 시 영문 또는 일문만 사용',
    },
    notices: [
      { t: '좌측통행', n: '차량·보행 모두 좌측. 버스 승하차·횡단 시 차량이 반대편에서 옵니다' },
      { t: '전용버스', n: '생수 외 모든 음식물(주류·과자·커피 등) 섭취 금지' },
      { t: '호텔 욕실', n: '바닥 배수구 없는 구조 — 샤워 시 커튼을 욕조 안쪽으로' },
      { t: '여행자보험', n: '전원 최대 2억 보장. 사고 시 진단서·경찰신고서 확보 후 귀국 청구' },
    ],
    baggage: {
      checked: '1인 1개 · 최대 20kg · 잠금장치 확인',
      cabinBanned: ['보조배터리', '라이터', '전자담배', '현금·귀중품', '카메라'],
      liquid: '용기당 100ml 이하 · 총 1L 이하 지퍼백 1개',
    },
    entry: [
      'Visit Japan Web에 입국심사·세관 정보를 출국 72시간 전까지 등록하고 QR을 캡처(미등록 시 기내 종이신고서 작성).',
      '여권 훼손(낙서·풀칠·페이지 절단)이 있으면 입국이 거부될 수 있으니 출발 전날 재확인.',
    ],
  },
  // 국제학술 발전포럼 — Day1(6/24 15:00 KUAS) 핵심 행사. 식순 PPT + 사토 교수 강연 PPT 기반.
  forum: {
    title: '2026 도시과학대학 국제학술 발전포럼',
    subtitleEn: 'KUAS·UOS Joint Seminar on Urban Culture and Urban Sciences',
    datetime: '2026.06.24(수) 15:00',
    venue: '교토첨단과학대학(KUAS) · 우즈마사 캠퍼스',
    host: '서울시립대 도시과학대학 · 교토첨단과학대 공동주최',
    hero: 'images/forum-hero.webp',
    // 식순 — 축사·폐회사 전문은 제외, 흐름만. kind: ceremony|keynote|panel|talk
    program: [
      { seq: '개회', kind: 'ceremony', title: '학장 축사', who: '박동주 학장 (UOS)' },
      { seq: '1', kind: 'keynote', title: '특강 — Can Humans Understand AI', who: '사토 요시미치 교수 (KUAS)', ref: 'sato' },
      { seq: '2', kind: 'panel', title: '토론 — Can Humans Understand AI', who: '장원호 교수 (UOS) 주최', ref: 'jang' },
      { seq: '3', kind: 'talk', title: '발표 — Environmental Electrochemical Systems for Air Pollution Control and Carbon Neutrality', who: '천선정 교수 (UOS)', ref: 'cheon' },
      { seq: '4', kind: 'talk', title: '발표 — Multi-scale analysis for structural performance evaluation', who: '주효은 교수 (UOS)', ref: 'joo' },
      { seq: '폐회', kind: 'ceremony', title: '폐회사', who: '박동주 학장 (UOS)' },
    ],
    speakers: [
      {
        id: 'sato', country: 'jp',
        name: '사토 요시미치 (佐藤 嘉倫, Yoshimichi Sato)',
        affil: 'KUAS 인문학부 교수 · 학부장(Dean)',
        photo: 'images/forum-sato.webp',
        bio: '일본의 저명한 사회학자. 전공은 사회자본(social capital) 이론으로, 인간관계(사회적 연결)가 긍정·부정 양면의 효과를 가진다는 점에 주목하며, 그 연장에서 사회적 고립·외로움(social isolation)의 발생 메커니즘을 핵심 주제로 연구한다. 일본 과학기술진흥기구(JST) RISTEX ‘SOLVE for SDGs — 사회적 고립·고독 예방과 다양한 사회적 네트워크 형성’ 프로그램 어드바이저. 사회계층·불평등, 사회변동 연구의 권위자.',
        profileUrl: 'https://www.jst.go.jp/ristex/koritsu/en/advisers/10.html',
        profileLabel: '공식 프로필 (JST RISTEX) ↗',
        talkTitle: 'Can Humans Understand AI? — Toward an Interpretive Sociology of Human–AI Interaction',
        summary: [
          'ChatGPT 이후 생성형 AI가 사회적 상호작용의 새로운 ‘행위자’로 등장 → “인간은 AI를 이해할 수 있는가?”라는 사회학적 질문 제기.',
          '기존 사회학은 신체를 가진 인간 행위자 간 상호작용을 전제 → 비인간 행위자 AI의 등장으로 이론의 재구성 필요.',
          '분석틀은 막스 베버의 이해사회학(interpretive sociology) — 인간이 AI의 ‘의도와 의미’를 어떻게 이해하는가.',
          '‘이해’란 상대의 내적 인과모형(동기→의도→행위)을 파악해 설명이 “납득된다”고 느끼는 것. 경험적 진위보다 납득의 느낌이 핵심.',
          '인간–AI 이해 과정: 프롬프트 → 출력 → 의도 추론 → 입력·출력을 잇는 내적 인과모형 구성 → 출력이 ‘납득됨’.',
          '단, 인간과 AI는 같은 사회적 맥락을 공유하지 않아 추론이 어려울 수 있음(예: ChatGPT의 서구 중심 답변, 우시노코쿠마이리 같은 문화적 행위).',
          'AI는 능동이 아닌 반응적 존재이며 내적 인과모형을 직접 검증할 수 없음 — 그러나 이는 타인을 이해하는 어려움과 본질적으로 다른가?',
          '지속적 상호작용과 심리적 투사(projection)를 통해, 타인에게 하듯 AI에도 ‘내적 인과모형이 있다’고 느끼게 될 수 있음.',
          '결론: AI를 이해한다는 것은 그 내적 인과모형을 파악했다고 ‘느끼는’ 것 — 주관적 확신에 기반한 심리적 구성물. 현재는 인간이 AI보다 투사가 쉬워 이해가 더 쉬움.',
          '향후 과제: 지속적 상호작용의 실증 연구, 투사·신뢰 형성의 사회심리 분석, “인간은 AI를 신뢰할 수 있는가?”, 이해사회학의 AI로의 확장.',
        ],
        material: 'images/forum-sato-material.webp',
        materialCaption: '강연 예시 — 우시노코쿠마이리(丑の刻参り): 사회적·문화적 맥락 없이는 해석이 어려운 행위의 사례',
        materialCredit: '丑の刻参り · Toriyama Sekien (1776) · Public Domain',
      },
      {
        id: 'jang', country: 'kr', name: '장원호 교수', affil: '서울시립대 도시사회학과 교수',
        photo: 'images/forum-jang.webp',
        bio: '도시사회학·정치사회학 전공. 한국사회학회 회장(2021) 역임. 공감(empathy)·사회적 신뢰·글로컬 문화·도시 씬(urban scene)을 연구해, 사토 교수의 사회자본·AI 강연과 맞닿은 사회학적 관점에서 토론을 이끈다.',
        profileUrl: 'https://www.uos.ac.kr/prof/37', profileLabel: '교수 프로필 (UOS) ↗',
        role: '토론 주최',
        topic: '사토 교수 특강 「Can Humans Understand AI」를 주제로 한 토론 진행',
      },
      {
        id: 'cheon', country: 'kr', name: '천선정 교수', affil: '서울시립대 환경공학부 조교수',
        photo: 'images/forum-cheon.webp',
        bio: '전기화학 촉매 설계와 반응 메커니즘 규명·반응공학적 해석을 기반으로 대기오염물질의 선택적 저감·자원화를 연구하고, 가스확산전극 기반 시스템으로 오염물질을 연료·고부가가치 화학물질로 전환하는 기술을 개발. KAIST 환경공학 박사, 예일대 박사후연구원.',
        profileUrl: 'https://enveng.uos.ac.kr/sub02/sub01_1_1?pi_id=25', profileLabel: '교수 프로필 (UOS 환경공학부) ↗',
        topic: 'Environmental Electrochemical Systems for Air Pollution Control and Carbon Neutrality',
      },
      {
        id: 'joo', country: 'kr', name: '주효은 교수', affil: 'UOS 도시과학대학',
        photo: 'images/forum-joo.webp',
        profileUrl: 'https://www.researchgate.net/profile/Hyo-Eun-Joo-2', profileLabel: 'ResearchGate ↗',
        topic: 'Multi-scale analysis for structural performance evaluation',
      },
    ],
  },
  credits: CREDITS,
};
