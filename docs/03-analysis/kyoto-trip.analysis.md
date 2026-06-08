# Analysis (Check) — kyoto-trip

> 2026-06-09 · Static gap + runtime (Playwright, system Chrome, 390px)

## Match Rate: 100% (runtime-verified)

런타임 스모크 테스트(`scripts/verify.cjs`) 결과 PASS, 콘솔 에러 0.

```json
{ "itineraryActive": true, "dayCount": 5, "cardCount": 16,
  "heroImages": 8, "designedCards": 8, "markerCount": 16,
  "darkActive": true, "creditCount": 8, "swRegistered": true,
  "consoleErrors": [] }
```

## Success Criteria

| SC | 기준 | 결과 | 증거 |
|---|---|---|---|
| SC-1 | 4탭 + 해시 라우팅 | ✅ | itineraryActive=true, 탭 네비 동작 |
| SC-2 | 모든 places 카드(이미지/폴백) | ✅ | cardCount=16 (8 image + 8 designed) |
| SC-3 | 지도 핀 + 팝업 + 타일 토글 | ✅ | markerCount=16, darkActive=true |
| SC-4 | SW 등록 + 오프라인 | ✅ | swRegistered=true, PRECACHE 셸 |
| SC-5 | 라이선스 표기 | ✅ | creditCount=8 (저작자·CC 링크) |
| SC-6 | self-host 폰트 | ✅ | fonts.css 적용, 404 0건 |
| SC-7 | gh 푸시 + Pages | ⏳ | 배포 단계에서 검증 |

## 발견 & 조치

- **(해결)** 폰트 preload가 비-서브셋 파일명을 가리켜 404 → preload 제거, favicon 추가.
- **(해결)** KIX 이미지가 공항 내 McDonald's 매장 → 제목 필터(REJECT_TITLE) + 검색어 조정으로 실제 공항 이미지(CC BY 2.5)로 교체.
- **(설계상 의도)** KUAS는 Commons 무료 이미지 없음 → 디자인 카드(campus 색+졸업모 아이콘) 폴백.
- **(잔여/사용자)** 일정 날짜·식당 5곳 좌표는 대략값 placeholder — `js/data.js`에서 편집.

## 비고

- 폰트: 한글 전체 커버리지를 위해 Google 서브셋 woff2 전량(487파일/≈6MB) self-host. 브라우저는 unicode-range로 필요한 서브셋만 로드, SW가 cache-first 런타임 캐시.
