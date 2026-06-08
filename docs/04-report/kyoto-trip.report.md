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

## 잔여 / 사용자 작업

1. `js/data.js`의 `meta.dates`·`itinerary[].date`를 실제 날짜로 교체.
2. 식당 5곳(고치소우무라·야키니쿠킹·레스토랑아라시야마·가고노야·다카다노바바) 좌표는 대략값 → 예약 확정 시 정확 좌표 입력.
3. (선택) 호텔 몬트레 공식 외관 이미지를 허가받아 추가하면 디자인 카드 대체 가능.

## 재현 방법
`scripts/fetch_images.py`(이미지)·`scripts/fetch_fonts.py`(폰트)·`scripts/verify.cjs`(검증) 모두 멱등. README 참조.
