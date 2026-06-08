# Plan — 교토·고베 여행 PWA (kyoto-trip)

> PDCA Plan 문서 · 생성일 2026-06-09 · feature: `kyoto-trip`

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | 교토·히메지·고베 여행 일정을 한 화면에서, **오프라인(현지 데이터로밍 없이)** 으로 보고 길찾기·식당·숙소를 확인할 도구가 없다. 외부 의존(구글 사진 핫링크, 임의 웹 이미지)은 저작권·오프라인 양쪽에서 부적합하다. |
| **Solution** | 단일 `index.html` 기반 **설치형 PWA**. 모든 자산(이미지=Wikimedia Commons CC/PD, 폰트=self-host woff2, 아이콘=인라인 SVG, 지도=Leaflet+OSM)을 번들하고 서비스워커로 오프라인 캐싱. 데이터는 편집 가능한 `TRIP` 객체 단일 소스. |
| **Function/UX Effect** | 탭(일정·장소·지도·정보) 네비게이션, 장소 카드(히어로 이미지/디자인 카드), 카테고리 색·라인 아이콘, 인터랙티브 지도 핀, 이미지 출처/라이선스 표기. 설치 후 비행기/지하철 등 오프라인에서 동작. |
| **Core Value** | **저작권 안전 + 완전 오프라인 + 경량(외부 런타임 의존 0)**. 한 번 로드하면 데이터로밍 없이 전 일정 열람. |

## Context Anchor

| 키 | 값 |
|---|---|
| **WHY** | 해외(일본) 여행 중 오프라인에서 일정/지도/식당을 저작권 걱정 없이 보기 위해 |
| **WHO** | 여행 당사자(개인/소그룹), 모바일 우선 사용자 |
| **RISK** | ① 일부 식당/호텔은 Commons에 적합 CC 이미지 없음 → 디자인 카드로 폴백 ② 지도 타일은 온라인 의존(OSM) → 오프라인 시 캐시된 타일만 ③ 실제 일정 데이터(날짜·예약)는 사용자가 채워야 함 |
| **SUCCESS** | 오프라인에서 index 로드·탭 전환·장소 카드·지도 동작, Lighthouse PWA 설치가능, 모든 번들 이미지 라이선스 표기, gh-pages 배포 |
| **SCOPE** | (포함) 정적 PWA·자산 번들·SW·배포 / (제외) 백엔드, 사용자 계정, 실시간 교통, 예약 연동 |

## 1. 배경 / 문제 정의

ASSETS.md(사용자 제공)는 **기존 앱을 전제한 자산 보강 계획**이었으나 앱이 존재하지 않아 **신규 구축**으로 전환. ASSETS.md의 자산 정책(저작권 안전·오프라인·출처표기)을 핵심 제약으로 채택한다.

## 2. 요구사항 (Requirements)

### 기능 요구 (FR)
- **FR-1** 탭 네비게이션: `일정 / 장소 / 지도 / 정보` 4탭, 해시 라우팅, 새로고침 시 탭 유지.
- **FR-2** 일정(Itinerary): 일자별 타임라인, 각 항목이 장소 카드로 연결.
- **FR-3** 장소 카드: `TRIP.places[key]` 기반. `img` 있으면 히어로 background-image, 없으면 카테고리색+패턴 디자인 카드. 카테고리 아이콘(인라인 SVG).
- **FR-4** 지도: Leaflet + OSM, 장소 핀, 핀 클릭 시 팝업(이름·카테고리). 다크/라이트 타일 토글.
- **FR-5** 정보 탭: 여행 개요 + **이미지 출처/라이선스 표기**(저작자·CC 링크).
- **FR-6** PWA: manifest + 서비스워커, 오프라인 캐시(앱 셸 + 이미지 + 폰트), 설치 가능.
- **FR-7** 이미지: Wikimedia Commons CC/PD에서 받아 `images/{key}.webp` 번들, JPG 폴백 선택.
- **FR-8** 폰트: Gowun Batang / Gothic A1 woff2 self-host, `font-display:swap`.

### 비기능 요구 (NFR)
- **NFR-1** 외부 런타임 의존 0 (CDN JS/CSS 금지, Leaflet은 로컬 번들).
- **NFR-2** 모바일 우선 반응형(≤390px 기준), 라이트/다크 자동.
- **NFR-3** 단일 파일 우선 + 분할(`js/`, `css/`)로 가독성, 함수 50줄/파일 800줄 가이드.
- **NFR-4** 불변 데이터 패턴(`TRIP`은 읽기 전용 소스, 렌더는 순수 함수).

## 3. 범위 (Scope)

| 포함 | 제외 |
|---|---|
| 정적 PWA, 자산 번들, SW, gh-pages 배포 | 백엔드/DB, 인증, 결제, 실시간 교통, 예약 API |

## 4. 장소·카테고리 데이터 (확정 키)

장소 키(ASSETS.md 일치): `kuas, kinkakuji, kiyomizu, ginkakuji, bamboo, togetsukyo, nonomiya, himeji, kix, hotel_kyoto, hotel_kobe` + 식당 `gochisomura, yakinikuking, arashiyama_resto, kagonoya, takadanobaba`.

카테고리(`CAT`): `sight`(명소), `temple`(사찰/신사), `food`(식당), `hotel`(숙소), `transport`(교통), `campus`(학교).

## 5. Success Criteria (검증 기준)

- **SC-1** 4탭 네비게이션 동작 + 해시 라우팅 — *Functional*
- **SC-2** 모든 `places` 카드 렌더(이미지 또는 디자인 폴백) — *Functional*
- **SC-3** 지도에 좌표 핀 표시 + 팝업 — *Functional*
- **SC-4** 서비스워커 등록 + 오프라인 재로드 동작 — *Runtime*
- **SC-5** 번들 이미지 라이선스가 정보 탭에 표기 — *Content*
- **SC-6** self-host 폰트 적용(@font-face) — *Structural*
- **SC-7** GitHub 저장소 푸시 + Pages 배포 URL 응답 — *Deploy*

## 6. 리스크 & 대응

| 리스크 | 대응 |
|---|---|
| 식당/호텔 Commons 이미지 부재 | 디자인 카드 폴백(카테고리색+SVG 패턴) |
| WebP 변환 도구 | Pillow로 변환(확인됨), 실패 시 최적화 JPG |
| OSM 타일 오프라인 | 방문했던 타일만 SW 캐시(런타임 캐시), 미방문 영역은 placeholder |
| 일정 실제 데이터 부재 | 실제 랜드마크 좌표·설명으로 채우고 날짜/예약은 `TRIP.meta`·항목 필드로 사용자 편집 가능하게 |

## 7. 마일스톤

1. Design 문서(아키텍처 Option 선정) → 2. 앱 셸·데이터·렌더 → 3. 자산(이미지/폰트) 번들 → 4. SW/manifest → 5. Check(gap+런타임) → 6. commit → 7. gh-pages 배포.
