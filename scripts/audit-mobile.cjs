/* Browser integration audit. Run against Expo web or the exported static site.
 * PLAYWRIGHT_MODULE=/absolute/path/to/playwright AUDIT_BASE_URL=http://localhost:8082 node scripts/audit-mobile.cjs
 * Playwright is a test-tool prerequisite; it is not an application dependency.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.AUDIT_BASE_URL || 'http://localhost:8082';
const output = path.resolve('Codex/frontend-audit');
fs.mkdirSync(path.join(output, 'screenshots'), { recursive: true });
const results = [];
const session = {
  ageRestricted: false, birthDate: '1990-01-01', email: 'audit@example.com',
  emailVerified: true, authMode: 'signup', nickname: 'Аудит', gender: 'male', preference: 'everyone',
  consent: { aiAcknowledgedAt: 1, termsAcceptedAt: 1, versions: { terms: '2026-10-01', privacy: '2026-10-01', aiDisclosure: '2026-10-01' } },
};
async function seed(context, state = session, language = 'uk') {
  await context.addInitScript(({ state, language }) => {
    if (localStorage.getItem('__audit_seeded')) return;
    localStorage.setItem('__audit_seeded', '1');
    localStorage.setItem('flirter.language.v1', JSON.stringify({ state: { mode: language, resolvedLanguage: language, isRTL: language === 'ar' }, version: 0 }));
    if (state) localStorage.setItem('flirter.session.v1', JSON.stringify({ state, version: 0 }));
  }, { state, language });
}
async function audit(name, work) {
  try { await work(); results.push({ name, status: 'passed' }); console.log('PASS', name); }
  catch (error) { results.push({ name, status: 'failed', error: error.message }); console.error('FAIL', name, error.message); }
}
async function visibleInViewport(page, locator) {
  await locator.waitFor({ state: 'visible' });
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  assert(box && box.x >= -1 && box.y >= -1 && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height + 1,
    `Element outside viewport: ${JSON.stringify(box)} in ${JSON.stringify(viewport)}`);
}
async function swipe(page, engine, from, to, duration = 350) {
  if (engine === 'chromium') {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] });
    for (let step = 1; step <= 12; step++) {
      await page.waitForTimeout(duration / 12);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * step / 12, y: from.y + (to.y - from.y) * step / 12 }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  } else {
    // WebKit automation does not expose touch-move. Deliver DOM touch events to test the responder path.
    await page.evaluate(({ from }) => { window.__auditTouchTarget = document.elementFromPoint(from.x, from.y); }, { from });
    for (let step = 0; step <= 13; step++) {
      await page.waitForTimeout(duration / 12);
      await page.evaluate(({ from, to, step }) => {
        const target = window.__auditTouchTarget;
        const part = Math.min(step, 12) / 12;
        const x = from.x + (to.x - from.x) * part, y = from.y + (to.y - from.y) * part;
        const touch = { identifier: 1, target, clientX: x, clientY: y, pageX: x, pageY: y, screenX: x, screenY: y };
        const event = new Event(step === 0 ? 'touchstart' : step === 13 ? 'touchend' : 'touchmove', { bubbles: true, cancelable: true });
        Object.defineProperties(event, { touches: { value: step === 13 ? [] : [touch] }, changedTouches: { value: [touch] }, targetTouches: { value: step === 13 ? [] : [touch] } });
        target.dispatchEvent(event);
      }, { from, to, step });
    }
  }
  await page.waitForTimeout(300);
}
async function screenshot(page, name) {
  await page.waitForFunction(() => [...document.images].filter(img => { const r = img.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }).every(img => img.complete && img.naturalWidth > 0 && Number(getComputedStyle(img).opacity) >= 0.99));
  await page.screenshot({ path: path.join(output, 'screenshots', `${name}.png`) });
}
(async () => {
  for (const [engine, browserType, launch] of [['chromium', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]) {
    const browser = await browserType.launch({ headless: true, ...launch });
    const errors = [];
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'uk-UA' });
    await seed(context);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(base, { timeout: 60000 });
    await page.getByTestId('filter-open').waitFor();
    await audit(`${engine}: discover photos and frame`, async () => {
      await screenshot(page, `${engine}-discover`);
      const image = page.getByTestId('grid-card-sofia').locator('img');
      assert(await image.evaluate(img => img.complete && img.naturalWidth >= 100 && Number(getComputedStyle(img).opacity) >= 0.99));
      const action = await page.getByTestId('grid-action-sofia').boundingBox();
      assert(action.width >= 44 && action.height >= 44);
      await visibleInViewport(page, page.getByTestId('tab-index'));
      assert.equal(await page.locator('body').evaluate(body => body.scrollWidth <= innerWidth), true);
    });
    await audit(`${engine}: fixed scrim, independent entrance, Escape and focus restore`, async () => {
      await page.getByTestId('filter-open').focus();
      await page.getByTestId('filter-open').click();
      await page.getByTestId('bottom-sheet').waitFor();
      await page.waitForTimeout(40);
      const scrim = await page.getByTestId('sheet-scrim').boundingBox();
      assert.equal(scrim.y, 0);
      await page.waitForTimeout(340);
      await visibleInViewport(page, page.getByTestId('sheet-apply'));
      await screenshot(page, `${engine}-filter`);
      await page.keyboard.press('Escape');
      await page.getByTestId('bottom-sheet').waitFor({ state: 'hidden' });
      await page.waitForTimeout(100);
      assert(await page.getByTestId('filter-open').evaluate(element => document.activeElement === element));
    });
    await audit(`${engine}: short drag rebounds; full swipe closes`, async () => {
      await page.getByTestId('filter-open').click(); await page.waitForTimeout(360);
      let handle = await page.getByTestId('sheet-drag-handle').boundingBox();
      await swipe(page, engine, { x: 180, y: handle.y + 22 }, { x: 180, y: handle.y + 48 }, 500);
      assert(await page.getByTestId('bottom-sheet').isVisible());
      handle = await page.getByTestId('sheet-drag-handle').boundingBox();
      await swipe(page, engine, { x: 180, y: handle.y + 22 }, { x: 180, y: handle.y + 175 }, 350);
      await page.getByTestId('bottom-sheet').waitFor({ state: 'hidden' });
    });
    await audit(`${engine}: Back closes modal on the same screen`, async () => {
      await page.getByTestId('filter-open').click(); await page.waitForTimeout(360);
      const url = page.url(); await page.goBack();
      await page.getByTestId('bottom-sheet').waitFor({ state: 'hidden' });
      assert.equal(page.url(), url); assert(await page.getByTestId('filter-open').isVisible());
    });
    await audit(`${engine}: filter drafts, apply, reset and reopening`, async () => {
      await page.getByTestId('filter-open').click(); await page.waitForTimeout(360);
      await page.getByTestId('sheet-gender-men').click();
      await page.getByTestId('sheet-backdrop').click({ position: { x: 2, y: 2 } });
      await page.getByTestId('bottom-sheet').waitFor({ state: 'hidden' });
      assert(await page.getByTestId('grid-card-sofia').isVisible());
      await page.getByTestId('filter-open').click(); await page.waitForTimeout(360);
      assert.equal(await page.getByTestId('sheet-gender-everyone').getAttribute('aria-checked'), 'true');
      await page.getByTestId('sheet-gender-men').click(); await page.getByTestId('sheet-apply').click();
      await page.getByTestId('bottom-sheet').waitFor({ state: 'hidden' });
      assert.equal(await page.getByTestId('grid-card-sofia').count(), 0);
      await page.getByTestId('filter-open').click(); await page.waitForTimeout(360);
      await page.getByTestId('sheet-reset').click(); await page.getByTestId('sheet-apply').click();
      await page.getByTestId('bottom-sheet').waitFor({ state: 'hidden' });
      assert(await page.getByTestId('grid-card-sofia').isVisible());
    });
    await audit(`${engine}: chat, multiline draft, single send and no unavailable media actions`, async () => {
      await page.getByTestId('grid-action-sofia').click(); await page.getByTestId('chat-input').waitFor(); await page.waitForTimeout(300);
      assert.equal(await page.getByTestId('chat-attach').count(), 0); assert.equal(await page.getByTestId('chat-voice').count(), 0);
      assert.equal(await page.getByTestId('chat-send').getAttribute('aria-disabled'), 'true');
      await page.getByTestId('chat-input').fill('Привіт!\nДругий рядок');
      const inputHeight = await page.getByTestId('chat-input').evaluate(input => input.clientHeight);
      assert(inputHeight >= 44 && inputHeight <= 100, `Multiline height ${inputHeight}`);
      await page.getByTestId('chat-send').click();
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('flirter.chats.v1')).state.conversations.sofia.messages.length >= 5);
      const energy = await page.evaluate(() => JSON.parse(localStorage.getItem('flirter.energy.v1')).state.renewable);
      assert.equal(energy, 19); assert.equal(await page.getByTestId('chat-input').inputValue(), '');
      await screenshot(page, `${engine}-chat`);
    });
    await audit(`${engine}: portrait, landscape, small phone, tablet and desktop resizing`, async () => {
      for (const size of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }, { width: 390, height: 844 }]) {
        await page.setViewportSize(size); await page.waitForTimeout(300);
        await visibleInViewport(page, page.getByTestId('chat-input')); await visibleInViewport(page, page.getByTestId('chat-send'));
        const frame = await page.getByTestId('app-frame').boundingBox();
        assert(frame.width <= 480.5); assert(frame.height <= size.height + 1);
      }
    });
    await audit(`${engine}: edge swipe returns from chat`, async () => {
      await swipe(page, engine, { x: 20, y: 260 }, { x: 240, y: 268 });
      await page.getByTestId('filter-open').waitFor(); assert(!page.url().includes('/chat/'));
    });
    await audit(`${engine}: keyboard visual viewport shrink, pan, restore and pinch zoom`, async () => {
      await page.getByTestId('grid-action-sofia').click(); await page.getByTestId('chat-input').waitFor(); await page.waitForTimeout(300);
      await page.getByTestId('chat-input').focus();
      await page.evaluate(() => {
        window.__auditViewport = { height: 520, offsetTop: 0, scale: 1 };
        for (const key of ['height', 'offsetTop', 'scale']) Object.defineProperty(visualViewport, key, { configurable: true, get: () => window.__auditViewport[key] });
        visualViewport.dispatchEvent(new Event('resize'));
      });
      await page.waitForTimeout(200);
      assert((await page.getByTestId('chat-send').boundingBox()).y < 520);
      await page.evaluate(() => { window.__auditViewport.offsetTop = 45; visualViewport.dispatchEvent(new Event('scroll')); });
      await page.waitForTimeout(120); assert.equal(Math.round((await page.locator('#root').boundingBox()).y), 45);
      await page.evaluate(() => { window.__auditViewport.scale = 2; window.__auditViewport.height = 260; visualViewport.dispatchEvent(new Event('resize')); });
      await page.waitForTimeout(120); assert.equal(Math.round((await page.locator('#root').boundingBox()).height), 520);
      await page.evaluate(() => { window.__auditViewport = { height: 844, offsetTop: 0, scale: 1 }; visualViewport.dispatchEvent(new Event('resize')); });
      await page.waitForTimeout(120); assert.equal(Math.round((await page.locator('#root').boundingBox()).height), 844);
      await page.reload(); await page.getByTestId('chat-input').waitFor();
    });
    await audit(`${engine}: reduced motion updates while open; small energy modal preserves draft`, async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.evaluate(() => localStorage.setItem('flirter.energy.v1', JSON.stringify({ state: { renewable: 0, purchased: 0, regenAnchorAt: Date.now() }, version: 0 })));
      await page.reload(); await page.getByTestId('chat-input').waitFor();
      await page.setViewportSize({ width: 320, height: 568 });
      await page.waitForTimeout(300);
      await page.getByTestId('chat-input').fill('Чернетка не зникає'); await page.getByTestId('chat-send').click();
      await page.getByTestId('bottom-sheet').waitFor(); await page.waitForTimeout(120);
      await visibleInViewport(page, page.getByTestId('bottom-sheet'));
      await screenshot(page, `${engine}-energy-empty-small`);
      await page.keyboard.press('Escape'); await page.getByTestId('bottom-sheet').waitFor({ state: 'hidden' });
      assert.equal(await page.getByTestId('chat-input').inputValue(), 'Чернетка не зникає');
      await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: 'no-preference' });
    });
    await audit(`${engine}: conversation list, request dismissal and draft after reload`, async () => {
      await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('flirter.chats.v1'));
        data.state.conversations.kira = { characterId: 'kira', origin: 'request', matchedAt: Date.now(), unreadCount: 1,
          messages: [{ id: 'audit-request', author: 'character', kind: 'text', text: 'Привіт!', createdAt: Date.now(), status: 'sent' }] };
        localStorage.setItem('flirter.chats.v1', JSON.stringify(data));
      });
      await page.goto(`${base}/chats`);
      const dismissBox = await page.getByTestId('request-dismiss-kira').boundingBox();
      assert(dismissBox.width >= 44 && dismissBox.height >= 44);
      await page.getByTestId('request-dismiss-kira').click();
      assert.equal(await page.getByTestId('request-dismiss-kira').count(), 0);
      assert(!await page.evaluate(() => JSON.parse(localStorage.getItem('flirter.chats.v1')).state.conversations.kira));
      await page.getByTestId('chat-row-sofia').click(); await page.getByTestId('chat-input').waitFor();
      assert.equal(await page.getByTestId('chat-input').inputValue(), 'Чернетка не зникає');
      await page.reload(); await page.getByTestId('chat-input').waitFor();
      assert.equal(await page.getByTestId('chat-input').inputValue(), 'Чернетка не зникає');
    });
    await page.goto(`${base}/energy`); await page.getByTestId('energy-back').waitFor();
    await audit(`${engine}: unavailable payments, subscription and responsive energy layout`, async () => {
      for (const size of [{ width: 320, height: 568 }, { width: 390, height: 844 }]) {
        await page.setViewportSize(size); await page.waitForTimeout(200);
        const pack = page.getByTestId('energy-package-small'); await pack.scrollIntoViewIfNeeded();
        assert.equal(await pack.getAttribute('aria-disabled'), 'true');
        assert.equal(await page.getByTestId('bottom-sheet').count(), 0);
        await visibleInViewport(page, pack);
      }
      await page.getByTestId('energy-back').scrollIntoViewIfNeeded(); await screenshot(page, `${engine}-energy`);
    });
    await page.goto(`${base}/profile`); await page.getByTestId('settings-language').waitFor();
    await audit(`${engine}: install instructions scroll and close at 320px`, async () => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.getByTestId('settings-install').click(); await page.waitForTimeout(360);
      const dismiss = page.getByRole('button', { name: 'Не зараз', exact: true });
      await dismiss.scrollIntoViewIfNeeded(); await visibleInViewport(page, dismiss);
      await dismiss.click(); await page.getByTestId('bottom-sheet').waitFor({ state: 'hidden' });
      await page.setViewportSize({ width: 390, height: 844 });
    });
    await audit(`${engine}: dark theme, native language selection and RTL geometry`, async () => {
      await page.getByTestId('settings-theme-dark').click();
      assert.equal(await page.locator('meta[name="theme-color"]').first().getAttribute('content'), '#121013');
      await page.getByTestId('settings-language').click(); await page.waitForTimeout(360);
      await page.getByTestId('language-option-ar').click(); await page.getByTestId('bottom-sheet').waitFor({ state: 'hidden' });
      assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
      await visibleInViewport(page, page.getByTestId('settings-language'));
      await page.getByTestId('settings-language').click(); await page.waitForTimeout(360);
      await screenshot(page, `${engine}-language-rtl-dark`);
      await page.getByTestId('language-option-uk').click(); await page.getByTestId('bottom-sheet').waitFor({ state: 'hidden' });
      await page.getByTestId('settings-theme-light').click();
    });
    await audit(`${engine}: standalone install state updates live`, async () => {
      assert(await page.getByTestId('settings-install').isVisible());
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'standalone', { configurable: true, value: true });
        window.dispatchEvent(new Event('appinstalled'));
      });
      await page.waitForTimeout(120); assert.equal(await page.getByTestId('settings-install').count(), 0);
    });
    await audit(`${engine}: logout removes local chats and identity`, async () => {
      await page.getByTestId('settings-logout').click(); await page.waitForTimeout(360);
      await page.getByTestId('logout-confirm').click(); await page.getByTestId('welcome-start').waitFor();
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('flirter.chats.v1')).state.conversations), {});
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('flirter.session.v1')).state.email), null);
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('flirter.drafts.v1')).state.drafts), {});
    });
    await audit(`${engine}: browser runtime errors and no dev service worker`, async () => {
      assert.deepEqual(errors, []);
      if (await page.locator('script[src*=".bundle?"]').count()) {
        assert.equal(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), 0);
      }
    });
    await context.close();

    const onboarding = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, locale: 'uk-UA' });
    await seed(onboarding, null); const p = await onboarding.newPage();
    await audit(`${engine}: real onboarding at 320px and restart persistence`, async () => {
      await p.goto(base); await p.getByTestId('welcome-start').click(); await p.getByTestId('age-day').fill('31'); await p.getByTestId('age-month').fill('02'); await p.getByTestId('age-year').fill('1990');
      await p.getByTestId('age-submit').click(); assert(p.url().endsWith('/age'));
      await p.getByTestId('age-day').fill('01'); await p.getByTestId('age-month').fill('01'); await p.getByTestId('age-submit').click();
      await p.getByTestId('signin-email').fill('audit@example.com'); await p.getByTestId('signin-submit').click();
      await p.getByTestId('verify-code').fill('123456'); await p.getByTestId('verify-submit').click();
      await p.getByTestId('profile-nickname').fill('Аудит'); await p.getByTestId('profile-submit').click();
      await p.getByTestId('consent-ai').click({position:{x:12,y:12}}); await p.getByTestId('consent-terms').click({position:{x:12,y:12}}); await p.getByTestId('disclosure-submit').click();
      await p.getByTestId('filter-open').waitFor(); await p.reload(); await p.getByTestId('filter-open').waitFor();
      await screenshot(p, `${engine}-onboarded-small`);
    });
    await onboarding.close(); await browser.close();
  }
  fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify({ base, checkedAt: new Date().toISOString(), results }, null, 2) + '\n');
  if (results.some(result => result.status === 'failed')) process.exitCode = 1;
})().catch(error => { console.error(error); fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify({ base, results, aborted: error.message }, null, 2)); process.exitCode = 1; });
