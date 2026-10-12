/* Production PWA integration audit. Export first: npx expo export --platform web.
 * PLAYWRIGHT_MODULE=/absolute/path/to/playwright node scripts/audit-pwa.cjs
 * The local server deliberately has no SPA fallback: exported deep links must exist.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve('dist');
const output = path.resolve('Codex/frontend-audit');
const results = [];
let networkDisabled = false;
const session = {
  ageRestricted: false, birthDate: '1990-01-01', email: 'audit@example.com', emailVerified: true,
  authMode: 'signup', nickname: 'Аудит', gender: 'male', preference: 'everyone',
  consent: { aiAcknowledgedAt: 1, termsAcceptedAt: 1, versions: { terms: '2026-10-01', privacy: '2026-10-01', aiDisclosure: '2026-10-01' } },
};
const server = http.createServer((request, response) => {
  if (networkDisabled) { request.socket.destroy(); return; }
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const candidates = [pathname === '/' ? 'index.html' : pathname.slice(1), `${pathname.slice(1)}.html`, `${pathname.slice(1)}/index.html`];
  const file = candidates.map(name => path.resolve(root, name)).find(name => name.startsWith(`${root}/`) && fs.existsSync(name) && fs.statSync(name).isFile());
  if (!file) { response.writeHead(404); response.end('Not found'); return; }
  const type = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.ico': 'image/x-icon' }[path.extname(file)] || 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': type }); fs.createReadStream(file).pipe(response);
});
async function audit(name, work) {
  try { await work(); results.push({ name, status: 'passed' }); console.log('PASS', name); }
  catch (error) { results.push({ name, status: 'failed', error: error.message }); console.error('FAIL', name, error.message); }
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const [engine, browserType, launch] of [['chromium', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]) {
    const browser = await browserType.launch({ headless: true, ...launch });
    try {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'uk-UA' });
      await context.addInitScript(({ session }) => {
        if (!localStorage.getItem('__audit_seeded')) {
          localStorage.setItem('__audit_seeded', '1');
          localStorage.setItem('flirter.session.v1', JSON.stringify({ state: session, version: 0 }));
          localStorage.setItem('flirter.language.v1', JSON.stringify({ state: { mode: 'uk', resolvedLanguage: 'uk', isRTL: false }, version: 0 }));
        }
        Object.defineProperty(navigator, 'standalone', { configurable: true, value: true });
      }, { session });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await audit(`${engine}: exported catalogue/chat/legal deep links without fallback`, async () => {
        for (const url of ['/character/sofia', '/chat/sofia', '/legal/terms', '/legal/privacy', '/legal/ai']) {
          const response = await page.goto(`${base}${url}`);
          assert.equal(response.status(), 200, url);
          if (url.startsWith('/character/')) {
            for (const size of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 390, height: 844 }]) {
              await page.setViewportSize(size); await page.waitForTimeout(250);
              const cta = await page.getByTestId('profile-start-chat').boundingBox();
              assert(cta.y >= 0 && cta.y + cta.height <= size.height + 1);
            }
            await page.waitForFunction(() => [...document.images].some(img => img.naturalWidth >= 100 && Number(getComputedStyle(img).opacity) >= 0.99));
            await page.screenshot({ path: path.join(output, 'screenshots', `${engine}-character.png`) });
            await page.getByTestId('profile-start-chat').click();
            await page.getByTestId('chat-input').waitFor();
          }
          if (url.startsWith('/chat/')) await page.getByTestId('chat-input').waitFor();
        }
      });
      await page.goto(`${base}/`); await page.getByTestId('filter-open').waitFor();
      await audit(`${engine}: standalone frame, manifest, zoom and install visibility`, async () => {
        const manifest = await (await context.request.get(`${base}/manifest.json`)).json();
        assert.equal(manifest.display, 'standalone'); assert.equal(manifest.start_url, '/');
        const viewport = await page.locator('meta[name=viewport]').getAttribute('content');
        assert(viewport.includes('viewport-fit=cover')); assert(!/maximum-scale|user-scalable=no/.test(viewport));
        const frame = await page.getByTestId('app-frame').boundingBox(); assert.equal(Math.round(frame.height), 844);
        await page.getByTestId('tab-profile').click(); await page.getByTestId('settings-language').waitFor();
        assert.equal(await page.getByTestId('settings-install').count(), 0);
      });
      await audit(`${engine}: high contrast switches glass to opaque material live`, async () => {
        await page.emulateMedia({ contrast: 'more' });
        await page.waitForFunction(() => {
          const style = getComputedStyle(document.querySelector('[data-testid=tab-glass]'));
          return style.backdropFilter === 'none' && style.backgroundColor === 'rgb(255, 255, 255)';
        });
        await page.emulateMedia({ contrast: 'no-preference' });
      });
      await audit(`${engine}: service worker activated with hashed entry precached`, async () => {
        await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15000 });
        const keys = await page.evaluate(async () => { const cache = await caches.open('flirter-shell-v2'); return (await cache.keys()).map(request => new URL(request.url).pathname); });
        assert(keys.includes('/')); assert(keys.some(key => /^\/_expo\/static\/js\/web\/entry-[a-f0-9]+\.js$/.test(key)));
        assert(!keys.some(key => key.startsWith('/api/') || key.startsWith('/chat/')));
      });
      await audit(`${engine}: offline cold page launch and persisted draft`, async () => {
        await page.goto(`${base}/chat/sofia`); await page.getByTestId('chat-input').waitFor();
        await page.getByTestId('chat-input').fill('Чернетка після перезапуску PWA');
        // WebKit's automation offline switch can reject a new page before dispatching to its SW.
        // Drop server connections instead; Chromium additionally exercises the browser's offline switch.
        if (engine === 'chromium') await context.setOffline(true);
        networkDisabled = true;
        const cold = await context.newPage();
        try {
          await cold.goto(`${base}/chat/sofia`); await cold.getByTestId('chat-input').waitFor();
          assert.equal(await cold.getByTestId('chat-input').inputValue(), 'Чернетка після перезапуску PWA');
          await cold.goto(base); await cold.getByTestId('filter-open').waitFor();
          await cold.waitForFunction(() => [...document.images].filter(img => { const r = img.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }).every(img => img.complete && img.naturalWidth > 0 && Number(getComputedStyle(img).opacity) >= 0.99));
          assert(await cold.getByTestId('grid-card-sofia').locator('img').evaluate(img => img.naturalWidth >= 100));
          await cold.screenshot({ path: path.join(output, 'screenshots', `${engine}-pwa-offline.png`) });
        } finally { networkDisabled = false; await context.setOffline(false); await cold.close(); }
      });
      await audit(`${engine}: activation preserves unrelated caches and excludes API`, async () => {
        await page.evaluate(async () => {
          await caches.open('other-app-cache'); await caches.open('flirter-shell-old');
          const registration = await navigator.serviceWorker.getRegistration();
          await registration.unregister();
          navigator.serviceWorker.register(`/sw.js?audit=${Date.now()}`);
        });
        await page.waitForFunction(async () => !(await caches.keys()).includes('flirter-shell-old'));
        assert(await page.evaluate(async () => (await caches.keys()).includes('other-app-cache')));
        await page.evaluate(() => fetch('/api/private-audit').catch(() => undefined));
        assert.equal(await page.evaluate(async () => { const cache = await caches.open('flirter-shell-v2'); return Boolean(await cache.match('/api/private-audit')); }), false);
      });
      await audit(`${engine}: no uncaught production runtime errors`, async () => assert.deepEqual(errors, []));
      await context.close();
    } finally { await browser.close(); }
  }
})().catch(error => { console.error(error); results.push({ name: 'audit aborted', status: 'failed', error: error.message }); }).finally(() => {
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'pwa-results.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + '\n');
  server.close(); if (results.some(result => result.status === 'failed')) process.exitCode = 1;
});
