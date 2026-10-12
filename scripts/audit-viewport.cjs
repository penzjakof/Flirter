/* WebKit layout regression tests. These simulate viewport disagreements, not
 * SpringBoard or iOS's compositor. They cannot prove real Home Screen coverage.
 * Export first, then run with PLAYWRIGHT_MODULE pointing to a Playwright install.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { webkit, devices } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve('Codex/frontend-audit/viewport');
const exportRoot = path.resolve('dist');
const results = [];
const session = {
  ageRestricted: false, birthDate: '1990-01-01', email: 'viewport@example.com', emailVerified: true,
  authMode: 'signup', nickname: 'Test', gender: null, preference: null,
  consent: { aiAcknowledgedAt: 1, termsAcceptedAt: 1, versions: { terms: '2026-10-01', privacy: '2026-10-01', aiDisclosure: '2026-10-01' } },
};
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const name = pathname === '/' ? 'index.html' : pathname.slice(1);
  const file = [name, `${name}.html`].map(name => path.resolve(exportRoot, name))
    .find(file => file.startsWith(`${exportRoot}/`) && fs.existsSync(file) && fs.statSync(file).isFile());
  if (!file) { res.writeHead(404); res.end(); return; }
  const type = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css' }[path.extname(file)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type }); fs.createReadStream(file).pipe(res);
});
async function measure(page) {
  return page.evaluate(() => {
    const rect = node => { const r = node.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height }; };
    const tab = document.querySelector('[data-testid=tab-glass]');
    const ancestors = []; let node = tab?.parentElement;
    while (node) { const s = getComputedStyle(node); ancestors.push({ tag: node.tagName, id: node.id, testID: node.getAttribute('data-testid'), ...rect(node), overflow: s.overflow }); node = node.parentElement; }
    return { innerHeight, visualHeight: visualViewport.height, top: visualViewport.offsetTop, standalone: navigator.standalone,
      html: rect(document.documentElement), body: rect(document.body), root: rect(document.getElementById('root')),
      frame: rect(document.querySelector('[data-testid=app-frame]')), tab: tab ? rect(tab) : null, ancestors,
      heightOverride: document.documentElement.style.getPropertyValue('--app-height') };
  });
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await webkit.launch();
  try {
    for (const size of [{ width: 390, height: 844 }, { width: 393, height: 852 }, { width: 320, height: 568 }, { width: 844, height: 390 }]) {
      const context = await browser.newContext({ ...devices['iPhone 13'], viewport: size });
      await context.addInitScript(({ session }) => {
        localStorage.setItem('flirter.session.v1', JSON.stringify({ version: 0, state: session }));
        Object.defineProperty(navigator, 'standalone', { value: true });
        // Model the discrepancy between physical CSS viewport and iOS APIs.
        const originalHeight = innerHeight;
        window.__testLayoutHeight = originalHeight;
        window.__testVisualHeight = originalHeight;
        window.__testVisualTop = 0;
        Object.defineProperty(window, 'innerHeight', { get: () => window.__testLayoutHeight });
        Object.defineProperties(visualViewport, {
          height: { get: () => window.__testVisualHeight },
          offsetTop: { get: () => window.__testVisualTop },
          pageTop: { get: () => window.__testVisualTop + window.scrollY },
        });
      }, { session });
      const page = await context.newPage();
      const runtimeErrors = []; page.on('pageerror', e => runtimeErrors.push(e.message));
      await page.goto(process.env.VIEWPORT_BASE_URL || `http://127.0.0.1:${server.address().port}/`);
      await page.getByTestId('tab-glass').waitFor();
      // Exercise the real-device diagnostics only locally; automated production
      // runs must not contaminate the phone's nginx measurements.
      if (size.width === 390 && !process.env.VIEWPORT_BASE_URL) {
        await page.evaluate(() => Object.defineProperty(navigator, 'webdriver', { value: false }));
        const request = await page.waitForRequest(req => new URL(req.url()).pathname === '/__viewport-metrics', { timeout: 10000 });
        const params = Object.fromEntries(new URL(request.url()).searchParams);
        assert.equal(params.rootHeight, String(size.height));
        assert.equal(params.frameHeight, String(size.height));
        assert(Math.abs(Number(params.vh) - size.height) < 1);
        assert(!request.url().includes(session.email));
        console.log('Dimension diagnostics emitted successfully');
      }
      const checkFrame = async name => {
        const m = await measure(page);
        for (const key of ['html', 'body', 'root', 'frame']) assert(Math.abs(m[key].height - size.height) < 1, `${key} height at ${name}`);
        assert(m.tab.top >= 0 && m.tab.bottom <= size.height, `tab visible at ${name}`);
        for (const a of m.ancestors.filter(a => ['hidden', 'clip'].includes(a.overflow))) {
          assert(a.bottom >= m.tab.bottom && a.top <= m.tab.top, `${a.id || a.testID || a.tag} clips tab at ${name}`);
        }
        assert.deepEqual(runtimeErrors, []);
        results.push({ name, metrics: m });
      };
      await checkFrame(`${size.width}x${size.height}: initial`);
      await page.evaluate(() => {
        window.__testLayoutHeight -= 60; window.__testVisualHeight -= 60;
        window.dispatchEvent(new Event('resize')); visualViewport.dispatchEvent(new Event('resize'));
      });
      await page.waitForTimeout(100);
      await checkFrame(`${size.width}x${size.height}: shorter iOS APIs`);
      // Keyboard transition must shrink the app even while CSS 100vh stays full.
      await page.evaluate(() => {
        const input = document.createElement('input');
        input.id = 'viewport-test-input';
        document.body.appendChild(input);
        input.focus({ preventScroll: true });
        window.__testVisualHeight = Math.max(150, window.__testLayoutHeight - 250);
        window.__testVisualTop = 8; visualViewport.dispatchEvent(new Event('resize'));
      });
      await page.waitForTimeout(100);
      const keyboard = await measure(page);
      assert(Math.abs(keyboard.root.height - keyboard.visualHeight) < 1, 'keyboard height override ignored');
      assert.equal(keyboard.root.top, 8);
      assert(keyboard.tab.bottom <= keyboard.root.bottom, 'tab below keyboard viewport');
      results.push({ name: `${size.width}x${size.height}: keyboard`, metrics: keyboard });
      await page.evaluate(() => {
        document.getElementById('viewport-test-input')?.remove();
        window.__testVisualHeight = window.__testLayoutHeight;
        window.__testVisualTop = 0; visualViewport.dispatchEvent(new Event('resize'));
      });
      await page.waitForTimeout(750);
      await checkFrame(`${size.width}x${size.height}: keyboard dismissed`);
      assert.equal((await measure(page)).heightOverride, '', 'stale keyboard height');
      if (size.width === 393) {
        await page.waitForFunction(() => [...document.images].filter(img => img.getBoundingClientRect().top < 852).every(img => img.complete));
        await page.screenshot({ path: path.join(output, 'webkit-393x852.png') });
      }
      await context.close();
    }
    console.log(`${results.length} viewport cases passed (synthetic WebKit; not real Home Screen)`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => {
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ testedAt: new Date().toISOString(), limitation: 'WebKit with simulated iOS metrics, not SpringBoard; no claim of physical iPhone coverage.', results }, null, 2));
  server.close();
});
