# Completion Report — 교토·히메지·고베 여행 PWA

> PDCA 완료 보고 · 2026-06-09 · feature `kyoto-trip`

## Executive Summary

| 관점 | 계획 | 실제 결과(Value Delivered) |
|---|---|---|
| **Problem** | 오프라인·저작권 안전 여행 가이드 부재 | 설치형 PWA로 해결, 라이브 배포 |
| **Solution** | 무빌드 ES모듈 PWA + 번들 자산 + SW | 16장소·5일 일정·지도·정보 4탭 동작 |
| **Function/UX** | 일정/장소/지도/정보, 라이선스 표기 | 카드 16(이미지 8+디자인 8)·마커 16·크레딧 8 |
| **Core Value** | 저작권 안전 + 완전 오프라인 + 외부 의존 0 | Commons CC/PD 8종·Leaflet 로컬·폰트 self-host·SW 캐시 |

**라이브:** https://jaeho19.github.io/kyoto-trip/ · **저장소:** https://github.com/jaeho19/kyoto-trip

## Success Criteria 최종

| SC | 결과 | 증거 |
|---|---|---|
| SC-1 4탭+해시 | ✅ | 런타임 PASS |
| SC-2 장소 카드 | ✅ | cardCount=16 (8+8) |
| SC-3 지도 핀 | ✅ | markerCount=16, 타일 토글 |
| SC-4 SW 오프라인 | ✅ | swRegistered=true |
| SC-5 라이선스 표기 | ✅ | creditCount=8 |
| SC-6 self-host 폰트 | ✅ | 404 0건 |
| SC-7 배포 | ✅ | **라이브 URL 런타임 PASS, 콘솔에러 0** |

**달성률 7/7 (100%)**

## Key Decisions & Outcomes

| 결정 | 근거 | 결과 |
|---|---|---|
| Option C (무빌드 분할) | 빌드 의존 0 + 가독성 | gh-pages 무가공 배포 성공 |
| 이미지=Commons CC/PD only | 저작권 안전(ASSETS.md) | 8종 확보, 저작자 표기 |
| 식당/KUAS 디자인 카드 폴백 | 적합 무료 이미지 부재 | 8개 디자인 카드, 일관 UX |
| 폰트 전량 self-host | 한글 전체 커버 + 오프라인 | 487 woff2, unicode-range 로드 |
| 배포=GitHub Pages | gh 인증됨, 완전 자동화 | 1커밋 푸시 → Pages 빌드 |

## v2 보강 (2026-06-09) — 실제 일정 + deep research

- **실제 일정 반영**: `Downloads/도시과학대학연찬회 세부일정.xlsx`에서 추출 →
  **2026.06.24(수)~06.26(금) 2박3일**, 서울시립대 도시과학대학 ↔ 교토첨단과학대(KUAS) 방문.
  일자별 실제 시각·항공편(KE723/LJ236)·식사 장소 반영(`scripts/read_schedule.py`).
- **핵심 교정**: KUAS는 가메오카가 아니라 **우즈마사(太秦) 캠퍼스**(右京区山ノ内五反田町18, 〒615-8577).
- **deep research(107 에이전트, 검증 통과 11건)** + OSM Nominatim 지오코딩으로:
  - 모든 장소 좌표를 소수점 5자리로 정밀화(청수사 34.99483/135.78500, 대나무숲 35.01684/135.67156,
    KUAS 35.01094/135.71858, 호텔/식당 지점 좌표 확정).
  - 식당 지점·주소 확정: 야키니쿠킹 카츠라점(西京区牛ヶ瀬山柿町3), 다카다노바바=히메지성 오테몬 앞 御膳점(本町68),
    레스토랑 아라시야마=오반자이 뷔페(京のごちそうビュッフェ).
  - 설명문 보강(히메지성 세계유산·편한 복장, 청수사 오토와 폭포 의미 등).
  - **이미지 가용성 검증**: 식당·호텔·KUAS는 Commons에 저작권 안전 이미지 없음 확인 →
    디자인 카드 폴백이 정답(허위 이미지 미사용). 명소 8종 이미지는 라이선스 안전 재확인.
  - 출처: `docs/_research_readable.md`.
- **카드 UX**: 주소·공식 사이트 링크 노출 추가(`render.js`).
- **재검증**: 로컬 + 라이브 Playwright PASS, dayCount=3, 콘솔에러 0.

## 잔여 / 사용자 작업

1. 고치소우무라 다카이시점 정확 지번은 미확정(시 중심 좌표 사용) — 예약 확정 시 갱신 가능.
2. (선택) 호텔 몬트레·식당 공식 이미지를 허가받아 추가하면 디자인 카드 대체 가능.

## 재현 방법
`scripts/read_schedule.py`(일정)·`scripts/geocode*.py`(좌표)·`scripts/fetch_images.py`(이미지)·
`scripts/fetch_fonts.py`(폰트)·`scripts/verify.cjs`(검증) 모두 멱등. README 참조.
