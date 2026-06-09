# 교토 · 히메지 · 고베 여행 PWA

오프라인 동작 · 저작권 안전 자산 기반 간사이 여행 가이드(설치형 PWA).

**라이브:**
- GitHub Pages: https://jaeho19.github.io/kyoto-trip/
- Netlify: https://kyoto-trip.netlify.app

> `main`에 push하면 GitHub Pages와 Netlify(.github/workflows/deploy-netlify.yml)에 **동시 자동배포**됩니다.

## 특징
- 📴 **완전 오프라인**: 서비스워커가 앱 셸·이미지·폰트 캐시. 한 번 로드 후 데이터로밍 없이 사용.
- ⚖️ **저작권 안전**: 장소 사진은 Wikimedia Commons의 **CC/PD** 이미지만 번들, 저작자·라이선스 표기(정보 탭).
- 🧩 **외부 런타임 의존 0**: Leaflet 로컬 번들, 폰트 self-host, 아이콘 인라인 SVG.
- 🗺️ 4탭: 일정 · 장소 · 지도(Leaflet+OSM) · 정보.

## 구조
```
index.html            앱 셸          manifest.webmanifest  PWA
sw.js                 오프라인 SW    css/  js/  vendor/leaflet/
images/  fonts/       번들 자산      docs/  PDCA 문서
scripts/fetch_images.py  Commons 이미지 → WebP + 라이선스
scripts/fetch_fonts.py   Google Fonts → self-host woff2
scripts/verify.cjs       런타임 스모크 테스트(Playwright)
```

## 데이터 편집
모든 여행 데이터는 `js/data.js`의 `TRIP` 객체 한 곳. `meta.dates`, `itinerary[].date`,
식당 좌표(대략값)를 실제 값으로 교체하세요.

## 로컬 실행
```bash
python -m http.server 8731       # http://127.0.0.1:8731
python scripts/fetch_images.py   # 이미지 재생성(선택)
NODE_PATH="$(npm root -g)" node scripts/verify.cjs   # 검증
```

## 라이선스
코드: MIT. 이미지: 각 저작자/CC 라이선스(앱 정보 탭 및 `js/assets.js` 참조).
