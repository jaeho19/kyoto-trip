# info-expand Design Document

> **Summary**: 연찬회 안내문의 실무정보 7항목을 `TRIP.info` 데이터로 구조화하고 정보 탭을 섹션 렌더로 확장 + 항공편 데이터 정정
>
> **Project**: kyoto-trip (정적 PWA, 무빌드)
> **Author**: jaeho19
> **Date**: 2026-06-20
> **Status**: Draft
> **Planning Doc**: [info-expand.plan.md](../01-plan/features/info-expand.plan.md)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 종이 안내문의 핵심 실무정보를 오프라인 PWA로 흡수해 단일 참조점 제공 |
| **WHO** | 연찬회 참가 교수·교직원 53명 (모바일 우선) |
| **RISK** | 데이터 오류 방치(항공편 번호) 시 공항 혼선 / 정보 과다 시 가독성 저하 |
| **SUCCESS** | 정보 탭에서 비상연락처·준비물·유의사항·항공정보 확인 + KE5868 정정 |
| **SCOPE** | 정보 탭 확장 + data.js 정정. 명단/객실/지엽 규정·새 탭 제외 |

---

## 1. Overview

### 1.1 Design Goals
- 안내문 실무정보를 **데이터로** 보관(`TRIP.info`)하고 렌더는 순수 함수로 분리 — 기존 프로젝트 원칙 유지.
- 오프라인 완전 동작(정보 탭은 네트워크 불필요). `tel:` 딥링크만 OS에 위임.
- 기존 4탭 레이아웃·라우터·탭바 **무변경**.

### 1.2 Design Principles
- **Single source of truth**: 모든 콘텐츠는 `js/data.js`의 `TRIP.info`. 렌더 로직에 콘텐츠 하드코딩 금지.
- **Pure render**: `render.js`는 입력 불변·HTML 문자열 반환. 섹션별 작은 헬퍼로 분할(함수 50줄 이하).
- **Progressive disclosure**: 자주 보는 것(비상연락처·항공·준비물)은 펼침, 참고용(수하물 규정)은 `<details>` 접이식.

---

## 2. Architecture Options

### 2.0 Architecture Comparison

| Criteria | A: Minimal | B: Clean(schema) | C: Pragmatic |
|----------|:-:|:-:|:-:|
| **Approach** | `renderInfo()`에 HTML 하드코딩 | `TRIP.info` 배열 + type별 제네릭 디스패처 | `TRIP.info` 명명 객체 + 섹션 전용 헬퍼 |
| **New Files** | 0 | 1 (`js/info.js`) | 0 |
| **Modified Files** | 3 | 4 | 3 |
| **Complexity** | Low | High | Medium |
| **Maintainability** | Low | High | High |
| **Effort** | Low | High | Medium |
| **컨벤션 부합** | ✗ data/render 분리 위반 | △ 과한 추상화 | ✓ 기존 패턴 동일 |

**Selected**: **Option C (Pragmatic)** — 기존 `kyoto-trip.design.md`가 채택한 "TRIP=데이터 단일소스 / render.js=순수함수" 패턴과 동일. 7개 정적 섹션을 1회 표시하는 용도에 B의 제네릭 디스패처는 YAGNI.

### 2.1 Component Diagram

```
js/data.js (TRIP.info)  ──▶  js/render.js (renderInfo + 섹션 헬퍼)  ──▶  #panel-info
        데이터 단일소스              순수 함수(HTML 문자열)            DOM 주입(main.js 기존)
```

### 2.2 Data Flow

```
TRIP.info ─▶ renderInfo(trip) ─▶ [renderEmergency, renderFlights, renderChecklist,
                                   renderHotelContact, renderNotices, renderBaggage,
                                   renderEntry, (기존)credits] ─▶ innerHTML
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `renderInfo()` | `TRIP.info`, `icon()` | 섹션 HTML 생성 |
| 정보 탭 | `main.js`(기존 라우팅) | 패널 주입 — 변경 없음 |

---

## 3. Data Model

### 3.1 `TRIP.info` (신규)

```js
// js/data.js — esc()는 render에서 처리하므로 원문 그대로 저장
info: {
  emergency: {                       // 1. 비상 연락처
    org: '(주)마스터스투어', name: '장현철 사장', tel: '010-3386-3950',
  },
  flights: {                         // 2. 항공·집결
    out: { no: 'KE5868', route: '인천 T2 → 관서', dep: '06/24 09:35', arr: '11:20',
           meet: '07:00 인천 T2 3층 B·C·D 수속 / 09:00 게이트 집결' },
    back: { no: 'LJ236', route: '관서 → 인천 T2', dep: '06/26 16:05', arr: '18:10' },
  },
  checklist: [                       // 3. 준비물 (label + optional note)
    { t: '여권', n: '+ 사본·여권사진 2매(분실 대비)' },
    { t: 'Visit Japan Web QR', n: '출국 72h 전 등록·캡처' },
    { t: '멀티어댑터', n: "일본 110V '돼지코'" },
    { t: '우산', n: '필수' },
    { t: '비즈니스 캐주얼', n: '공식 기관 방문용' },
    { t: '엔화 현금', n: '소액권 — 카드 불가 점포·자판기 대비' },
    { t: '상비약', n: '소화제·지사제·밴드 등' },
  ],
  hotelContact: {                    // 4. 호텔(VJW 입력용) — places와 별도, 영/일문 강조
    name: 'HOTEL MONTERREY KYOTO (ホテルモントレ京都)',
    addr: '〒604-8161 京都府京都市中京区烏丸通三条下ル饅頭屋町604',
    tel: '075-251-7111',
    note: 'Visit Japan Web 입력 시 영문/일문만 사용',
  },
  notices: [                         // 5. 현지 유의사항
    { t: '좌측통행', n: '차량·보행 모두 좌측. 버스 승하차·횡단 시 반대 방향 주의' },
    { t: '전용버스', n: '생수 외 모든 음식물(주류·과자·커피) 섭취 금지' },
    { t: '호텔 욕실', n: '바닥 배수구 없음 — 샤워커튼을 욕조 안쪽으로' },
    { t: '여행자보험', n: '최대 2억 보장. 사고 시 진단서·경찰신고서 확보 후 귀국 청구' },
  ],
  baggage: {                         // 6. 수하물(접이식)
    checked: '위탁 1인 1개 · 최대 20kg · 잠금장치 확인',
    cabinBanned: ['보조배터리', '라이터', '전자담배', '현금·귀중품', '카메라'],  // 기내 휴대
    liquid: '액체류 용기당 100ml 이하 · 총 1L 이하 지퍼백 1개',
  },
  entry: [                           // 7. 출입국
    'Visit Japan Web 72시간 전 등록 후 QR 캡처(미등록 시 기내 종이신고서)',
    '여권 훼손(낙서·풀칠·페이지 절단) 시 입국 거부 가능 — 전날 재확인',
  ],
}
```

### 3.2 정정 (선행 버그 수정)

| 위치 | Before | After |
|------|--------|-------|
| `data.js` `kix.desc` | `KE723편 도착` | `KE5868편 도착` |
| `data.js` itinerary Day1 `kix.note` | `KE723 인천 09:35 출발` | `KE5868 인천 09:35 출발` |
| `data.js` `hotel_kyoto.addr` | `…饅頭屋町604` | `〒604-8161 …饅頭屋町604` |
| `data.js` `hotel_kyoto` | (전화 없음) | `tel: '075-251-7111'` |

> `kix.desc`의 귀국편 `LJ236`(관서 16:05→인천 18:10)은 안내문과 일치 → 변경 없음.

---

## 4. API Specification

**N/A** — 백엔드/엔드포인트 없음(정적 PWA). 외부 호출은 `tel:` 딥링크뿐(OS 위임).

---

## 5. UI/UX Design

### 5.1 Screen Layout (정보 탭)

```
┌──────────────────────────────┐
│  정보                         │  ← section-title (기존)
│  [PWA 오프라인 note-box]      │  ← 기존 유지
│  ─────────────────────────    │
│  🆘 비상 연락처               │  ← tel: 큰 버튼(터치 타깃 ≥44px)
│  ✈️ 항공·집결 (출국/귀국)     │
│  ✅ 준비물 체크리스트          │  ← 항목 + 부가설명
│  🏨 호텔(Visit Japan Web용)   │  ← 주소 영/일문, tel
│  ⚠️ 현지 유의사항             │
│  ▸ 🧳 수하물 규정 (접이식)    │  ← <details>
│  🛂 출입국                    │
│  ─────────────────────────    │
│  이미지 출처/라이선스         │  ← 기존 유지(맨 아래로)
└──────────────────────────────┘
```

### 5.2 User Flow

```
탭바 '정보' 클릭 → #panel-info 표시 → 비상연락처 tel: 탭 → OS 전화앱
                                    → 수하물 ▸ 탭 → 펼침/접힘
```

### 5.3 Component List (render.js 내 헬퍼)

| 헬퍼 | 책임 | 입력 |
|------|------|------|
| `infoSection(title, icon, body)` | 공통 섹션 래퍼 | 제목·아이콘·본문 HTML |
| `renderEmergency(e)` | tel: 버튼 카드 | `info.emergency` |
| `renderFlights(f)` | 출국/귀국 2블록 | `info.flights` |
| `renderChecklist(list)` | 체크 아이콘 목록 | `info.checklist` |
| `renderHotelContact(h)` | 영/일문 주소·tel | `info.hotelContact` |
| `renderNotices(list)` | 경고 목록 | `info.notices` |
| `renderBaggage(b)` | `<details>` 접이식 | `info.baggage` |
| `renderEntry(list)` | 번호 목록 | `info.entry` |

### 5.4 Page UI Checklist (정보 탭)

> Gap Detector가 각 항목 존재를 검증. 모든 텍스트는 `esc()` 처리.

- [ ] 기존: PWA 오프라인 note-box 유지
- [ ] 비상연락처: `<a href="tel:01033863950">` 버튼 — "(주)마스터스투어 장현철 사장" + 번호 표시
- [ ] 항공: 출국 **KE5868** 09:35 / 집결 "07:00 인천 T2 3층 B·C·D" / 귀국 LJ236 18:10 (2블록)
- [ ] 준비물: 7개 항목 모두 표시(여권·VJW QR·멀티어댑터·우산·비즈니스캐주얼·엔화현금·상비약), 각 부가설명
- [ ] 호텔: 영문명 + 일문 주소(`〒604-8161…`) + `tel:0752517111` + "영/일문만" 안내
- [ ] 유의사항: 4개(좌측통행·버스음식물·욕실샤워커튼·여행자보험2억)
- [ ] 수하물: `<details>` 접이식 — 위탁 20kg / 기내휴대 금지품목 5개 / 액체류 100ml·1L
- [ ] 출입국: 2개(VJW 72h·QR / 여권 훼손 주의)
- [ ] 이미지 출처/라이선스: 기존 credits 유지(섹션 최하단)

### 5.5 접근성/스타일
- tel 버튼·`<details><summary>` 터치 타깃 최소 44×44px.
- 섹션 아이콘은 기존 `icons.js` 인라인 SVG 재사용(신규 아이콘 필요 시 1–2개 추가).
- 색/간격은 `tokens.css` 토큰 사용(하드코딩 색 금지).

---

## 6. Error Handling

| 상황 | 처리 |
|------|------|
| `TRIP.info` 일부 필드 누락 | 각 헬퍼에서 falsy 가드 → 해당 섹션 빈 문자열 반환(렌더 생략) |
| `tel` 미지원 환경(데스크톱) | `<a href="tel:">` 그대로 — 번호 텍스트 노출되어 식별 가능 |
| 모든 텍스트 | `esc()` 통과(기존 render.js 유틸) — XSS 방지 |

---

## 7. Security Considerations

- [x] 출력 이스케이프: 기존 `esc()`로 모든 동적 텍스트 처리(데이터는 신뢰 소스지만 일관 적용)
- [x] 시크릿 없음 — 정적 콘텐츠. 전화번호는 공개 안내문 정보
- [x] 외부 링크 없음(`tel:` 제외). 신규 네트워크 의존 0 → 오프라인 보장
- [ ] N/A: 인증·DB·rate limit(백엔드 없음)

---

## 8. Test Plan

> 정적 PWA — 기존 `scripts/verify.cjs`(Playwright 스모크) 확장 + 수동 체크.

### 8.1 Test Scope

| Type | Target | Tool | Phase |
|------|--------|------|-------|
| L2: UI 렌더 | 정보 탭 §5.4 체크리스트 요소 존재 | Playwright (`verify.cjs`) | Do |
| L3: E2E | 탭 이동 → 정보 표시 → tel 링크 href 검증 | Playwright | Do |
| 수동 | 오프라인(네트워크 차단) 정보 탭 / 항공편 KE5868 표기 | 브라우저 DevTools | Check |

### 8.2 L2 시나리오

| # | Page | Action | Expected |
|---|------|--------|----------|
| 1 | 정보 | 탭 로드 | §5.4 8개 섹션 모두 DOM 존재 |
| 2 | 정보 | 비상연락처 확인 | `a[href="tel:01033863950"]` 존재 |
| 3 | 정보 | 수하물 `<details>` | summary 클릭 시 본문 표시 |
| 4 | 일정 | Day1 항공 노트 | 텍스트에 `KE5868` 포함, `KE723` 미존재 |

### 8.3 L3 시나리오

| # | Scenario | Steps | Success |
|---|----------|-------|---------|
| 1 | 정보 열람 | 앱 로드 → '정보' 탭 → 8섹션 스크롤 | 에러 0, 모든 섹션 렌더 |
| 2 | 오프라인 | SW 캐시 후 오프라인 → 정보 탭 | 전체 정상(네트워크 요청 0) |

### 8.4 회귀 검증 (KE5868 정정)
- Red-Green: `KE723` 검색 → 0건 / `KE5868` 검색 → 일정·정보 양쪽 존재.

---

## 9. Clean Architecture

**경량 적용** — 정적 무빌드 PWA. 레이어를 파일 역할로 매핑:

| Layer | This Feature | Location |
|-------|--------------|----------|
| Domain/Data | `TRIP.info` (콘텐츠 단일소스) | `js/data.js` |
| Presentation | `renderInfo` + 섹션 헬퍼(순수함수) | `js/render.js` |
| Infrastructure | 없음(`tel:`는 OS 위임) | — |

**규칙**: render는 data를 읽기만, data는 render를 모름(단방향). 콘텐츠 ⊥ 표현 분리 유지.

---

## 10. Coding Convention Reference

| Item | Convention |
|------|-----------|
| 함수 명명 | `renderXxx()` camelCase (기존 `renderInfo`/`renderPlaces`와 일치) |
| 데이터 키 | camelCase (`hotelContact`, `cabinBanned`) |
| 불변성 | 렌더 함수 입력 불변, HTML 문자열 반환(부수효과 없음) |
| 이스케이프 | 모든 동적 텍스트 `esc()` 통과 |
| 색/간격 | `tokens.css` CSS 변수만(하드코딩 금지) |
| 파일 크기 | `render.js` 헬퍼는 각 ≤50줄, 파일 ≤400줄 유지 |

---

## 11. Implementation Guide

### 11.1 변경 파일

```
js/data.js     # ① 항공편 KE723→KE5868 정정 ② 호텔 tel/우편번호 ③ TRIP.info 신규
js/render.js   # renderInfo 확장 + 섹션 헬퍼 8개
js/icons.js    # (필요 시) 아이콘 1-2개 추가
css/app.css    # info 섹션·체크리스트·tel버튼·<details> 스타일(소량)
sw.js          # 캐시 버전 v4→v5
```

### 11.2 Implementation Order

1. [ ] **(선행)** `data.js` 버그 정정 — KE5868·호텔 연락처 (§3.2) → `KE723` 0건 확인
2. [ ] `data.js`에 `TRIP.info` 추가 (§3.1)
3. [ ] `render.js` 섹션 헬퍼 + `renderInfo` 확장 (§5.3)
4. [ ] `app.css` 스타일 추가
5. [ ] `sw.js` 캐시 v5 bump
6. [ ] `verify.cjs` L2/L3 검증 → 오프라인 수동 확인

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | Est. Turns |
|--------|-----------|-------------|:---:|
| 데이터 정정 + TRIP.info | `module-data` | §3.2 정정 + §3.1 데이터 추가 | 3-5 |
| 정보 탭 렌더 + 스타일 | `module-render` | §5.3 헬퍼 + CSS + SW bump | 5-8 |

#### Recommended Session Plan

| Session | Phase | Scope | Turns |
|---------|-------|-------|:---:|
| Session 1 | Plan + Design | 전체 | (완료) |
| Session 2 | Do | 전체 (`module-data` → `module-render`) | 15-20 |
| Session 3 | Check + Report | 전체 | 10-15 |

> 분량이 작아 Do는 1세션 일괄 권장. `/pdca do info-expand`로 시작.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-06-20 | 초안 — Option C 채택, 안내문 7항목 + KE5868 정정 | jaeho19 |
