# Gap Analysis — forum (PDCA Check)

> 2026-06-20 · Design ↔ Implementation 일치도 · 렌더 토큰 검사 + Playwright DOM + 회귀 스모크 + 육안

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 포럼(Day1 핵심 행사) 식순·발표 정보를 오프라인 앱에 흡수 |
| **WHO** | 연찬회 참가자 + 포럼 청중 |
| **RISK** | 의례 내용 과다 / 사토 사진 미제공 / 주효은 주제 변경 가능 |
| **SUCCESS** | 포럼 탭에서 식순 + 4개 학술 세션 + 사토 강연 요약·자료 확인 |
| **SCOPE** | 포럼 탭 신설. 축사·폐회사 전문 제외 |

## Overall Match Rate: **100%** ✅

Runtime 실행됨. `Overall = Structural×0.15 + Functional×0.25 + Contract×0.25 + Runtime×0.35`

| Axis | Score | 근거 |
|------|:----:|------|
| Structural | 100% | `TRIP.forum`(개요·식순 6·연사 4) + `renderForum`+4헬퍼 정의, 5탭 배선(index.html·router.js·main.js) |
| Functional | 100% | Page UI Checklist 9항목 충족, 토큰 19/19 |
| Contract (data↔render) | 100% | 헬퍼가 읽는 필드 전부 데이터에 존재, falsy 가드 완비 |
| Runtime | 100% | verify.cjs PASS(콘솔에러 0) + 포럼 DOM(5탭·식순6·연사4·자료img·hero) + 페이지에러 0 |

= 15 + 25 + 25 + 35 = **100%**

## Plan Success Criteria (7/7 Met)

| # | 기준 | 상태 | 증거 |
|---|------|:----:|------|
| 1 | 탭바 5개 + 포럼 전환 | ✅ | DOM: tabbar 5, `#panel-forum.active`=1 |
| 2 | 포럼 개요(명칭·6/24 15:00·KUAS) | ✅ | 토큰 일치 + hero 렌더 |
| 3 | 식순 6단계, 축사/폐회 전문 미포함 | ✅ | DOM: fp-item 6. data엔 흐름만(전문 없음) |
| 4 | 연사 4카드 + 주제(국·영문) | ✅ | speaker 4, 천선정 topicEn, 주효은 "주제 변경 예정" |
| 5 | 사토 강연 요약+자료+국적/소속 | ✅ | summary 10 bullet, material img 1, 🇯🇵+affil |
| 6 | 사토 사진 미제공→아바타 | ✅ | 이니셜 아바타. 허위 사진 없음 |
| 7 | 오프라인 + 기존 4탭 무영향 | ✅ | forum 이미지 v8 precache. 스모크: day3·cards16·filters11·credits16 유지 |

## Decision Record 준수

- **[Design]** Option C(5번째 탭) → index.html 탭/패널 + router TABS + renderForum 정확 구현 ✅
- **[Plan]** 축사·폐회사 전문 제외 → program은 흐름 표기만, 전문 미포함 ✅
- **[Plan]** Commons 자동생성(assets.js)과 포럼 이미지 분리 → `TRIP.forum`에서 경로 직접 참조 ✅

## 자료 충실도 / 정직성

- 사토 강연 17슬라이드 → 핵심 10개 bullet로 요약(원문 충실). 우시노코쿠마이리 자료 이미지 + PD 출처 표기.
- ⚠️ **venue**: 사용자 메모 "준텐도대학" ↔ PPT "교토첨단과학대(KUAS)" 불일치 → **KUAS로 반영**(자료=출처 우선, 기존 앱 Day1과도 일치).
- ⚠️ 사토 교수 **실제 사진 제공 안 됨** → 아바타 처리(외부 사진 미수집, 저작권 안전 원칙 준수).
- ⚠️ 주효은 발표 주제 "변경 예정" 배지 명시.

## Gap List

| # | Severity | 항목 | 판정 |
|---|:--------:|------|------|
| 1 | Minor | venue 사용자 메모와 불일치 | 자료 기준 KUAS 반영 + 분석에 명시. 사용자 확인 시 1줄 수정 가능 |
| 2 | Minor | 사토 실제 사진 부재 | 자료 미포함. 공식 사진 입수 시 `speakers[0]`에 `photo` 추가로 교체 |

- **Critical 0 · Important 0 · 플레이스홀더/TODO 0**

## XSS/보안
신규 헬퍼 모든 동적 보간 `esc()` 통과(이모지·국기는 리터럴). 외부 네트워크 0.

## 결론
설계-구현 완전 일치(100%). Critical/Important 없음. **커밋·배포 가능.**
