# Design — 교토·고베 여행 PWA (kyoto-trip)

> PDCA Design 문서 · 2026-06-09 · feature: `kyoto-trip`

## Context Anchor

| 키 | 값 |
|---|---|
| WHY | 해외 오프라인에서 일정/지도/식당을 저작권 걱정 없이 |
| WHO | 여행 당사자(모바일 우선) |
| RISK | 식당/호텔 이미지 부재→디자인 카드 / OSM 타일 온라인 의존 / 실제 일정은 사용자 편집 |
| SUCCESS | 오프라인 동작·설치 가능·라이선스 표기·gh-pages 배포 |
| SCOPE | 정적 PWA·자산 번들·SW·배포 (백엔드/인증 제외) |

## 1. 개요

정적 단일 페이지 PWA. 빌드 스텝 없이 브라우저가 직접 실행. 데이터(`TRIP`)와 렌더(순수 함수)를 분리.

## 2. 아키텍처 옵션 비교

| 옵션 | 설명 | 복잡도 | 유지보수 | 노력 | 리스크 |
|---|---|---|---|---|---|
| A. 단일 index.html 인라인 전부 | HTML/CSS/JS 한 파일 | 낮음 | 낮음(800줄↑ 비대) | 최소 | 가독성·캐시 무효화 |
| B. 빌드 도구(Vite/번들러) | 모듈·트리셰이킹 | 높음 | 높음 | 큼 | 오버엔지니어링, 빌드 의존 |
| **C. 무빌드 분할(채택)** | `index.html` + `js/`(data/render/map/sw-reg) + `css/`, ES 모듈 | 중 | 높음 | 중 | 거의 없음 |

**선정: Option C — Pragmatic Balance.** 빌드 의존 없이(NFR-1) 파일을 역할별로 분할(NFR-3). `<script type="module">`로 ES 모듈 로드, 정적 호스팅(gh-pages)에 그대로 배포.

## 3. 파일 구조

```
kyoto-trip/
├─ index.html            # 앱 셸, 탭 컨테이너, 부트스트랩
├─ manifest.webmanifest  # PWA 매니페스트
├─ sw.js                 # 서비스워커(프리캐시 + 런타임 타일 캐시)
├─ css/
│  ├─ tokens.css         # 디자인 토큰(색/타이포/스페이싱), 라이트·다크
│  └─ app.css            # 레이아웃/탭/카드/지도
├─ js/
│  ├─ data.js            # TRIP 객체(places/itinerary/credits) — 단일 소스
│  ├─ icons.js           # 인라인 SVG 아이콘(Lucide 풍) + CAT 매핑
│  ├─ render.js          # 순수 렌더 함수(일정/장소/정보 탭)
│  ├─ map.js             # Leaflet 초기화·핀·타일 토글
│  ├─ router.js          # 해시 라우팅 + 탭 전환
│  └─ main.js            # 엔트리: 라우터/렌더/SW 등록
├─ vendor/leaflet/       # Leaflet js+css+images 로컬 번들(CDN 금지)
├─ images/{key}.webp     # Commons CC/PD 번들
└─ fonts/*.woff2         # Gowun Batang / Gothic A1 self-host
```

## 4. 데이터 모델 (`TRIP`)

```js
export const TRIP = {
  meta: { title, subtitle, dates, party, lang:'ko' },
  places: {
    [key]: { name, cat, lat, lng, area, desc, img?, hours?, addr? }
  },
  itinerary: [ { day, date, label, items:[ { time?, placeKey, note? } ] } ],
  credits: [ { key, title, author, license, licenseUrl, sourceUrl } ]
}
```
- `cat` ∈ CAT 키. `img` 없으면 디자인 카드. `credits`는 정보 탭 라이선스 표기 소스.

## 5. 렌더 설계 (순수 함수)

- `renderItinerary(TRIP) → HTMLString` : 일자 그룹 → 타임라인 아이템(placeKey로 place 조회).
- `renderPlaces(TRIP) → HTMLString` : 카드 그리드. `cardHero(place)`가 img/디자인 분기.
- `renderInfo(TRIP) → HTMLString` : 개요 + credits 리스트(저작자·CC 링크).
- 모든 함수는 입력 불변, DOM 직접 변형 없이 문자열 반환 후 컨테이너에 1회 주입.

## 6. 지도 설계

- Leaflet 로컬 번들. `L.map('map')`, OSM 타일 레이어 2종(light=CARTO Positron, dark=CARTO DarkMatter — OSM 기반 무료, 어트리뷰션 표기).
- `TRIP.places` 순회하며 `lat/lng` 있는 항목에 마커 + 팝업(name+cat 아이콘).
- 타일 토글 버튼(라이트/다크). 타일은 SW 런타임 캐시(stale-while-revalidate).

## 7. PWA / 오프라인

- `manifest.webmanifest`: name, short_name, icons(192/512), display=standalone, theme/bg color, start_url='./'.
- `sw.js`:
  - **install**: 앱 셸(html/css/js/vendor/fonts/images/manifest) 프리캐시(`PRECACHE`).
  - **fetch**: 앱 셸=cache-first / 지도 타일=stale-while-revalidate(런타임 캐시, 상한 LRU 100) / 그 외=network-first→cache.
  - **activate**: 옛 캐시 정리.

## 8. Test Plan (Check 단계)

- **L1(정적/구조)**: 파일 존재, manifest 유효, 모든 places 키가 credits 또는 디자인 폴백 처리, 좌표 존재.
- **L2(런타임)**: `python -m http.server`로 서빙 → headless로 ① 탭 4개 전환 ② places 카드 수 == Object.keys(places) ③ 지도 마커 수 == 좌표 보유 place 수 ④ SW 등록 성공 ⑤ 콘솔 에러 0.
- **Red-Green**: SW 미등록 상태와 등록 상태 비교로 오프라인 캐시 검증.

## 9. 보안/저작권

- 시크릿 없음(정적). 외부 입력 없음.
- 라이선스: 각 번들 이미지의 저작자·CC 링크를 `credits`에 기록 → 정보 탭 표기(CC BY/BY-SA 저작자 표기 필수 충족).

## 10. 배포

- GitHub repo `jaeho19/kyoto-trip`(public) → `main` 푸시 → GitHub Pages(`main` 루트). `start_url`/asset 경로는 상대경로(`./`)로 Pages 서브패스 대응.

## 11. Implementation Guide

### 11.1 구현 순서
1. `css/tokens.css`, `css/app.css` → 2. `js/data.js`(TRIP) → 3. `js/icons.js` → 4. `js/render.js` → 5. `js/router.js` → 6. `js/map.js` → 7. `index.html`(셸+부트) → 8. Leaflet 로컬 번들 → 9. 이미지 다운로드/변환 스크립트 → 10. 폰트 self-host → 11. `manifest`+`sw.js` → 12. 로컬 서빙 검증.

### 11.2 Module Map
| 모듈 | 책임 | SC |
|---|---|---|
| data | TRIP 단일 소스 | SC-2,5 |
| render | 일정/장소/정보 렌더 | SC-1,2,5 |
| map | Leaflet 핀 | SC-3 |
| router | 탭/해시 | SC-1 |
| sw+manifest | 오프라인/설치 | SC-4 |
| assets(images/fonts/vendor) | 번들 | SC-5,6 |

### 11.3 Session Guide
단일 세션 일괄 구현(앱 규모 중간). scope 분할 불요.
