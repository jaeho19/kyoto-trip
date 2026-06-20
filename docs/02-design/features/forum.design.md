# forum Design Document

> **Summary**: 국제학술 발전포럼 식순·연사·사토 강연을 `TRIP.forum` 데이터 + 신규 「포럼」 탭으로 구현
>
> **Project**: kyoto-trip (정적 무빌드 PWA) · **Author**: jaeho19 · **Date**: 2026-06-20 · **Status**: Draft
> **Planning Doc**: [forum.plan.md](../01-plan/features/forum.plan.md)

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 포럼(Day1 핵심 행사) 식순·발표 정보를 오프라인 앱에 흡수 |
| **WHO** | 연찬회 참가자 + 포럼 청중 |
| **RISK** | 의례 내용 과다 / 사토 사진 미제공 / 주효은 주제 변경 가능 |
| **SUCCESS** | 포럼 탭에서 식순 + 4개 학술 세션 + 사토 강연 요약·자료 확인 |
| **SCOPE** | 포럼 탭 신설. 축사·폐회사 전문 제외 |

## 1. Overview

### 1.1 Design Goals
- 포럼 콘텐츠를 `TRIP.forum` 데이터로 보관, `renderForum()` 순수 함수로 렌더(기존 패턴).
- 5번째 탭 추가는 `router.js` `TABS` 확장 + `index.html` 탭/패널 추가로 최소 변경.
- 완전 오프라인(이미지 precache). 외부 의존 0.

### 1.2 Design Principles
- 데이터 단일소스(`TRIP.forum`) ⊥ 렌더 분리. 콘텐츠 수정은 data.js에서만.
- 포럼 이미지는 Commons 자동생성(`assets.js`)과 분리 — `TRIP.forum`에서 경로 직접 참조(향후 `fetch_images.py` 재생성에 영향 없음).
- 정직성: 사토 실제 사진 미제공 → 디자인 아바타. 허위 사진 금지.

## 2. Architecture Options

| Criteria | A: Minimal (정보탭에 끼움) | B: Clean (제네릭 라우팅 리팩터) | C: Pragmatic (5번째 탭) |
|----------|:-:|:-:|:-:|
| Approach | 포럼을 정보 탭 섹션으로 | 탭 시스템을 config-driven으로 재설계 후 forum 추가 | TABS 배열 + index.html 탭/패널 추가, renderForum |
| New Files | 0 | 1+ | 0 |
| Modified | 3 | 6+ | 7 |
| Complexity | Low | High | Medium |
| 발견성/UX | 낮음(묻힘) | 높음 | 높음(헤드라인 행사 전면) |
| Effort | Low | High | Medium |
| 컨벤션 부합 | △ | △(과한 리팩터) | ✓ |

**Selected: Option C** — 포럼은 Day1 핵심 행사이자 분량(식순+연사4+강연상세+이미지)이 커서 전용 탭이 적절. 정보 탭에 끼우면 묻히고, 라우터 전면 리팩터는 YAGNI. 기존 `data/render` 분리 패턴 유지.

### 2.1 Component Diagram
```
TRIP.forum (data.js)  ──▶  renderForum() + 헬퍼 (render.js)  ──▶  #panel-forum
router.js TABS += 'forum'  ──▶  탭 전환 (기존 generic 로직)
images/forum-*.webp  ──▶  sw.js precache (오프라인)
```

## 3. Data Model — `TRIP.forum`

```js
forum: {
  title, subtitleEn, datetime: '2026.06.24(수) 15:00',
  venue: '교토첨단과학대학(KUAS) · 우즈마사 캠퍼스',
  host: '서울시립대 도시과학대학 · 교토첨단과학대 공동',
  hero: 'images/forum-hero.webp',
  program: [                       // 식순 (의례 + 학술)
    { seq:'개회', kind:'ceremony', title:'학장 축사', who:'박동주 학장 (UOS)' },
    { seq:'1', kind:'keynote', title:'특강 — Can Humans Understand AI', who:'사토 요시미치 교수 (KUAS)', ref:'sato' },
    { seq:'2', kind:'panel',  title:'토론 — Can Humans Understand AI', who:'장원호 교수 (UOS) 주최', ref:'jang' },
    { seq:'3', kind:'talk',   title:'발표 — 환경 전기화학 시스템', who:'천선정 교수 (UOS)', ref:'cheon' },
    { seq:'4', kind:'talk',   title:'발표 — 사회기반시설 유지관리·잔존수명평가', who:'주효은 교수 (UOS)', ref:'joo' },
    { seq:'폐회', kind:'ceremony', title:'폐회사', who:'박동주 학장 (UOS)' },
  ],
  speakers: [                      // 연사 카드 (배열, 표시 순서 보존)
    { id:'sato', country:'jp', name:'사토 요시미치 (佐藤 嘉倫, Yoshimichi Sato)',
      affil:'KUAS 인문학부 교수 · 학부장(Dean)',
      bio:'사회학자 — 사회계층·불평등, 사회자본(social capital), 사회변동 연구.',
      talkTitle:'Can Humans Understand AI? — Toward an Interpretive Sociology of Human–AI Interaction',
      summary:[ '...핵심 8~10개 bullet...' ],
      material:'images/forum-sato-material.webp',
      materialCaption:'강연 예시 — 우시노코쿠마이리(丑の刻参り): 사회적 맥락 없이는 해석이 어려운 문화적 행위',
      materialCredit:'丑の刻参り, Toriyama Sekien (1776), Public Domain' },
    { id:'jang', country:'kr', name:'장원호 교수', affil:'UOS 도시과학대학', role:'토론 주최',
      topic:'사토 교수 특강 「Can Humans Understand AI」 주제 토론' },
    { id:'cheon', country:'kr', name:'천선정 교수', affil:'UOS 도시과학대학',
      topic:'대기오염 저감과 탄소중립 실현을 위한 환경 전기화학 시스템',
      topicEn:'Environmental Electrochemical Systems for Air Pollution Control and Carbon Neutrality' },
    { id:'joo', country:'kr', name:'주효은 교수', affil:'UOS 도시과학대학',
      topic:'멀티스케일 해석을 통한 사회기반시설 유지관리와 잔존수명평가', note:'주제 변경 예정' },
  ],
}
```

## 5. UI/UX Design

### 5.1 Layout (포럼 탭)
```
[ 포럼 hero (forum-hero.webp + 제목/일시/장소 오버레이) ]
── 식순 ──
 [개회] 학장 축사 · 박동주
 [1] 특강 Can Humans Understand AI · 사토 (keynote 강조)
 [2] 토론 · 장원호
 [3] 발표 환경 전기화학 · 천선정
 [4] 발표 사회기반시설 · 주효은
 [폐회] 폐회사 · 박동주
── 연사 ──
 [🇯🇵 사토 카드: 아바타·소속·약력 / 강연요약 / 자료이미지+캡션]
 [🇰🇷 장원호] [🇰🇷 천선정(국·영문 주제)] [🇰🇷 주효은(변경예정 배지)]
```

### 5.3 Component List (render.js 헬퍼)
| 헬퍼 | 책임 |
|------|------|
| `renderForum(trip)` | 전체 조립(hero + 식순 + 연사) |
| `forumProgram(program)` | 식순 타임라인(kind별 색/배지) |
| `speakerCard(s)` | 연사 카드(국기·아바타·약력·주제) |
| `satoTalk(s)` | 사토 강연 요약 리스트 + 자료 이미지 |

### 5.4 Page UI Checklist
- [ ] 탭바 5개, 「포럼」 탭(아이콘+라벨), 클릭 시 `#panel-forum` 활성
- [ ] hero: 제목·`2026.06.24(수) 15:00`·`KUAS` 표시
- [ ] 식순 6행(개회·1·2·3·4·폐회), keynote 강조, 의례행은 dim
- [ ] 연사 4카드: 사토(🇯🇵)·장원호·천선정·주효은
- [ ] 천선정 카드 국문+영문 주제 / 주효은 "주제 변경 예정" 배지
- [ ] 사토: 약력 + 강연요약(≥8 bullet) + `forum-sato-material.webp` + 캡션·출처
- [ ] 사토 사진은 아바타(이니셜/아이콘), 실사진 없음
- [ ] 모든 동적 텍스트 `esc()` 통과

## 6. Error Handling
- `TRIP.forum`/필드 누락 시 각 헬퍼 falsy 가드 → 해당 블록 생략.
- 이미지 로드 실패 → `onerror` 없이도 레이아웃 유지(배경/아바타 fallback).

## 7. Security
- [x] 모든 동적 텍스트 `esc()` (XSS). 외부 링크/네트워크 0.
- [x] 번들 이미지 출처·라이선스 표기(사토 자료 PD, hero 행사제공).

## 8. Test Plan
- **L2(verify.cjs 확장 or 별도)**: 포럼 탭 패널 존재, 식순 6행, 연사 4카드, KE/기존 단언 무영향(places 16·credits 16·filters 11).
- **Runtime**: `renderForum(TRIP)` import 후 토큰 검사(사토·장원호·천선정·주효은·KUAS·2026.06.24). 콘솔에러 0.
- **수동**: 5탭 전환 + 오프라인 포럼 탭 + 스크린샷 육안.

## 9. Clean Architecture (경량)
| Layer | This Feature | Location |
|-------|--------------|----------|
| Data | `TRIP.forum` | js/data.js |
| Presentation | `renderForum`+헬퍼, 탭/패널 | js/render.js, index.html |
| Routing | `TABS` 확장 | js/router.js |

## 11. Implementation Guide

### 11.2 Implementation Order
1. [ ] 이미지 WebP 생성 (완료: forum-hero/forum-sato-material)
2. [ ] `TRIP.forum` 데이터 추가
3. [ ] `index.html` 탭바+패널, `router.js` TABS, `main.js` 렌더
4. [ ] `render.js` renderForum + 헬퍼, `icons.js` forum 아이콘
5. [ ] `app.css` 스타일
6. [ ] `sw.js` precache 이미지 + v8
7. [ ] verify.cjs(5탭 반영) + 렌더 검사 + 스크린샷

### 11.3 Session Guide
| Module | Scope | Turns |
|--------|-------|:---:|
| 데이터+탭배선 | data.js·index.html·router.js·main.js | 6-8 |
| 렌더+스타일 | render.js·icons.js·app.css·sw.js | 8-10 |

> 분량상 1세션 일괄 구현 권장.

## Version History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-06-20 | 초안 — Option C(5번째 탭), 포럼 식순·연사·사토 강연 | jaeho19 |
