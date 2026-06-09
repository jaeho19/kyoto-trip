// Runtime smoke test (Design §8 L2). Uses system Chrome via Playwright.
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:8731/';
const EXPECT_PLACES = 16;   // Object.keys(TRIP.places)

(async () => {
  const errors = [];
  const browser = await chromium.launch({ channel: 'chrome', headless: true,
    args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--use-gl=angle'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
  // ignore console errors emitted by the cross-origin Google Maps iframe
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const url = (m.location() && m.location().url) || '';
    if (!/google|gstatic|googleapis/.test(url)) errors.push('console: ' + m.text());
  });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  const results = {};
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(800);

  // 1. itinerary — day cards + D-day + nav pills
  results.itineraryActive = await page.locator('#panel-itinerary.active').count() === 1;
  results.dayCount = await page.locator('#panel-itinerary .day-card').count();
  results.dayPills = await page.locator('#panel-itinerary .day-pill').count();
  results.dday = await page.locator('#panel-itinerary .hm-pill.dday').count() === 1;

  // 2. places — cards + filters
  await page.goto(BASE + '#places');
  await page.waitForTimeout(400);
  results.cardCount = await page.locator('#panel-places .card').count();
  results.heroImages = await page.locator('#panel-places .hero:not(.designed)').count();
  results.designedCards = await page.locator('#panel-places .hero.designed').count();
  results.filterChips = await page.locator('#panel-places .f-chip').count();
  results.cardMapLinks = await page.locator('#panel-places .card .act-map[data-fly]').count();

  // 3. map — Google Maps embed (driving route) + day chips + stop→place links
  await page.goto(BASE + '#map');
  await page.waitForTimeout(3500);
  results.dayChips = await page.locator('#map-ui .m-chip').count();
  const src = await page.locator('#gmap').getAttribute('src');
  results.mapIsDrivingEmbed = /dirflg=d/.test(src || '') && /output=embed/.test(src || '');
  results.dirButton = await page.locator('.m-dir').count() === 1;
  results.routeStops = await page.locator('#map-ui .m-stop').count();
  results.stopLinksToPlaces = await page.locator('#map-ui .m-stop-link[data-goto-place]').count();

  // 4. info credits
  await page.goto(BASE + '#info');
  await page.waitForTimeout(300);
  results.creditCount = await page.locator('#panel-info .credit').count();

  // 5. service worker
  results.swRegistered = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const reg = await navigator.serviceWorker.getRegistration();
    return !!reg;
  });

  // previews
  await page.goto(BASE + '#itinerary');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'preview-itinerary.png' });
  await page.goto(BASE + '#places'); await page.waitForTimeout(500);
  await page.screenshot({ path: 'preview-places.png' });
  await page.goto(BASE + '#map'); await page.waitForTimeout(4500);
  await page.screenshot({ path: 'preview-map.png' });

  await browser.close();

  results.consoleErrors = errors;
  const pass =
    results.itineraryActive && results.dayCount === 3 && results.dayPills === 3 && results.dday &&
    results.cardCount === EXPECT_PLACES &&
    results.heroImages === 16 && results.designedCards === 0 &&
    results.filterChips === 11 && results.cardMapLinks === EXPECT_PLACES &&
    results.dayChips === 3 && results.mapIsDrivingEmbed && results.dirButton &&
    results.routeStops >= 2 && results.stopLinksToPlaces >= 2 &&
    results.creditCount === 16 && results.swRegistered &&
    errors.length === 0;

  console.log(JSON.stringify(results, null, 2));
  console.log('\n=== ' + (pass ? 'PASS ✅' : 'FAIL ❌') + ' ===');
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('RUNNER ERROR:', e); process.exit(2); });
