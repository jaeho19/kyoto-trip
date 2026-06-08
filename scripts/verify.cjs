// Runtime smoke test (Design §8 L2). Uses system Chrome via Playwright.
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:8731/';
const EXPECT_PLACES = 16;   // Object.keys(TRIP.places)
const EXPECT_MARKERS = 16;  // all places have lat/lng

(async () => {
  const errors = [];
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  const results = {};
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(800);

  // 1. itinerary default panel
  results.itineraryActive = await page.locator('#panel-itinerary.active').count() === 1;
  results.dayCount = await page.locator('#panel-itinerary .day').count();

  // 2. places cards
  await page.goto(BASE + '#places');
  await page.waitForTimeout(400);
  results.cardCount = await page.locator('#panel-places .card').count();
  results.heroImages = await page.locator('#panel-places .hero:not(.designed)').count();
  results.designedCards = await page.locator('#panel-places .hero.designed').count();

  // 3. map markers
  await page.goto(BASE + '#map');
  await page.waitForTimeout(1500);
  results.markerCount = await page.locator('.leaflet-marker-icon').count();
  // tile toggle
  await page.locator('.map-bar button[data-mode="dark"]').click();
  await page.waitForTimeout(300);
  results.darkActive = await page.locator('.map-bar button[data-mode="dark"].active').count() === 1;

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

  await page.goto(BASE + '#itinerary');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'preview-itinerary.png' });
  await page.goto(BASE + '#places'); await page.waitForTimeout(500);
  await page.screenshot({ path: 'preview-places.png' });
  await page.goto(BASE + '#map'); await page.waitForTimeout(1500);
  await page.screenshot({ path: 'preview-map.png' });

  await browser.close();

  results.consoleErrors = errors;
  const pass =
    results.itineraryActive && results.dayCount === 5 &&
    results.cardCount === EXPECT_PLACES &&
    results.heroImages === 8 && results.designedCards === EXPECT_PLACES - 8 &&
    results.markerCount === EXPECT_MARKERS && results.darkActive &&
    results.creditCount === 8 && results.swRegistered &&
    errors.length === 0;

  console.log(JSON.stringify(results, null, 2));
  console.log('\n=== ' + (pass ? 'PASS ✅' : 'FAIL ❌') + ' ===');
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('RUNNER ERROR:', e); process.exit(2); });
