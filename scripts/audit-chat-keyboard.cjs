/* Synthetic browser geometry checks, not OS keyboards or real Home Screen.
 * EXPORT_ROOT may point to the previous export to reproduce the regression.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(process.env.EXPORT_ROOT || 'dist');
const output = path.resolve(process.env.RESULTS_DIR || 'Codex/frontend-audit/keyboard');
fs.mkdirSync(output, { recursive: true });
const results = [];
async function serveExport(route) {
  const url = new URL(route.request().url());
  const name = decodeURIComponent(url.pathname).slice(1) || 'index.html';
  const file = [name, `${name}.html`].map(n => path.resolve(root, n))
    .find(f => f.startsWith(`${root}/`) && fs.existsSync(f) && fs.statSync(f).isFile());
  if (!file) { await route.fulfill({ status: 404, body: '' }); return; }
  const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' }[path.extname(file)] || 'application/octet-stream';
  await route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(file) });
}
const session = {
  ageRestricted: false, birthDate: '1990-01-01', email: 'keyboard@example.com', emailVerified: true,
  authMode: 'signup', nickname: 'Test', gender: null, preference: null,
  consent: { aiAcknowledgedAt: 1, termsAcceptedAt: 1, versions: { terms: '2026-10-01', privacy: '2026-10-01', aiDisclosure: '2026-10-01' } },
};
async function metrics(page) {
  return page.evaluate(() => {
    const rect = node => { const r = node.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height }; };
    const input = document.querySelector('[data-testid=chat-input]');
    const surface = document.querySelector('[data-testid=chat-input-surface]') || input.parentElement;
    return { root: rect(document.getElementById('root')), input: rect(input), surface: rect(surface), send: rect(document.querySelector('[data-testid=chat-send]')),
      header: rect(document.querySelector('[data-testid=chat-header]')),
      messages: rect(document.querySelector('[data-testid=chat-messages]')),
      viewport: { height: window.__visualHeight, top: window.__visualTop + window.__documentScroll - window.__clientPan },
      override: document.documentElement.style.getPropertyValue('--app-height'),
      topOverride: document.documentElement.style.getPropertyValue('--app-top'),
      composerPadding: getComputedStyle(input.closest('[data-testid=chat-composer]') || surface.parentElement).paddingBottom };
  });
}
async function setViewport(page, values) {
  await page.evaluate(values => {
    for (const [key, value] of Object.entries(values)) window[`__${key}`] = value;
    if (window.__useVisualClients) {
      window.__clientPan = window.__visualTop + window.__documentScroll;
      document.getElementById('root').style.transform = `translateY(${-window.__clientPan}px)`;
    }
    window.dispatchEvent(new Event('resize'));
    window.visualViewport?.dispatchEvent(new Event('resize'));
  }, values);
  await page.waitForTimeout(150);
}
async function checkKeyboard(page, name) {
  // CSS changes follow requestAnimationFrame; wait for the observable result
  // rather than assuming a fixed sleep is enough in a background browser.
  await page.waitForFunction(() => {
    const root = document.getElementById('root').getBoundingClientRect();
    const visibleTop = window.__visualTop + window.__documentScroll - window.__clientPan;
    return Math.abs(root.height - window.__visualHeight) < 1 && Math.abs(root.top - visibleTop) < 1;
  }, null, { timeout: 2000 });
  const m = await metrics(page);
  const bottom = m.viewport.top + m.viewport.height;
  for (const key of ['input', 'surface', 'send']) {
    assert(m[key].top >= m.viewport.top - 1 && m[key].bottom <= bottom + 1, `${name}: ${key} covered; ${JSON.stringify(m)}`);
  }
  assert(Math.abs(m.root.height - m.viewport.height) < 1, `${name}: root height`);
  assert(Math.abs(m.root.top - m.viewport.top) < 1, `${name}: double visual offset`);
  assert(m.header.top >= m.viewport.top - 1 && m.header.bottom < bottom, `${name}: header outside visible area`);
  assert(m.messages.height > 0, `${name}: message list collapsed`);
  if (m.surface.top - m.header.bottom > 60) {
    const visibleMessages = await page.getByTestId('chat-message').evaluateAll((nodes, bounds) => nodes.filter(node => {
      const r = node.getBoundingClientRect(); return r.bottom > bounds.top && r.top < bounds.bottom;
    }).length, { top: m.header.bottom, bottom: m.surface.top });
    assert(visibleMessages > 0, `${name}: no messages visible between header and composer`);
  }
  results.push({ name, metrics: m });
}
async function gesture(page, kind) {
  // WebKit automation has no OS touch-move API. These DOM events exercise the
  // shared gesture handlers and do not claim a physical gesture simulation.
  await page.evaluate(kind => {
    const target = kind === 'editor' ? document.querySelector('[data-testid=chat-input]') : document.querySelector('[data-testid=chat-messages]');
    const rect = target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + Math.min(100, rect.height / 2);
    for (const step of [0, 1, 2]) {
      const touch = { identifier: 1, target, pageX: x + (kind === 'horizontal' && step ? 40 : 0), pageY: y + (kind !== 'horizontal' && step ? 40 : 0), clientX: x, clientY: y, screenX: x, screenY: y };
      const touches = step === 2 ? [] : kind === 'pinch' ? [touch, { ...touch, identifier: 2, pageX: x + 30 }] : [touch];
      const event = new Event(step === 0 ? 'touchstart' : step === 1 ? 'touchmove' : 'touchend', { bubbles: true, cancelable: true });
      Object.defineProperties(event, { touches: { value: touches }, changedTouches: { value: [touch] }, targetTouches: { value: touches } });
      target.dispatchEvent(event);
    }
  }, kind);
  await page.waitForTimeout(100);
}
(async () => {
  for (const engine of process.env.BROWSER_ENGINES?.split(',') || (process.env.ONLY_WEBKIT ? ['webkit'] : ['webkit', 'chromium'])) {
    const browser = await (engine === 'webkit' ? webkit.launch() : chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' }));
    try {
      for (const size of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 412, height: 915 }, { width: 844, height: 390 }, { width: 402, height: 874, visualClients: true }].filter(size => !process.env.MOTION_ONLY || size.visualClients)) {
        const context = await browser.newContext({ viewport: size, isMobile: true, hasTouch: true, ...(size.visualClients ? { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1" } : {}) });
        context.setDefaultTimeout(15000);
        await context.route('**/*', serveExport);
        await context.addInitScript(({ session, noVisualViewport, visualClients }) => {
          localStorage.setItem('flirter.session.v1', JSON.stringify({ state: session, version: 0 }));
          localStorage.setItem('flirter.chats.v1', JSON.stringify({ state: { conversations: {
            maks: { characterId: 'maks', origin: 'chat', matchedAt: 1, unreadCount: 0,
              messages: Array.from({ length: 30 }, (_, index) => ({
                id: `history-${index}`, author: index % 2 === 0 ? 'user' : 'character', kind: 'text',
                text: 'Повідомлення в довгій історії. Перевірка фокусу поля після автоматичного прокручування.', createdAt: index + 1, status: 'sent',
              })),
            },
          } }, version: 0 }));
          Object.defineProperty(navigator, 'standalone', { value: true });
          window.__layoutHeight = innerHeight; window.__visualHeight = innerHeight;
          window.__visualTop = 0; window.__scale = 1;
          window.__documentScroll = 0; window.__clientPan = 0; window.__useVisualClients = visualClients;
          // Model iOS's document-to-client conversion separately from fixed
          // element movement. Previous tests assumed client top === offsetTop.
          const originalRect = Element.prototype.getBoundingClientRect;
          Element.prototype.getBoundingClientRect = function () {
            const r = originalRect.call(this);
            return this.hasAttribute('data-app-viewport-origin')
              ? new DOMRect(r.x, r.y - window.__clientPan - (visualClients ? 0 : window.__documentScroll), r.width, r.height)
              : r;
          };
          Object.defineProperty(window, 'innerHeight', { get: () => window.__layoutHeight });
          if (noVisualViewport) Object.defineProperty(window, 'visualViewport', { value: null });
          else Object.defineProperties(visualViewport, {
            height: { get: () => window.__visualHeight }, offsetTop: { get: () => window.__visualTop }, scale: { get: () => window.__scale },
            pageTop: { get: () => window.__visualTop + window.__documentScroll },
          });
        }, { session, noVisualViewport: size.width === 412, visualClients: Boolean(size.visualClients) });
        const page = await context.newPage();
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        const name = `${engine} ${size.width}x${size.height}${size.visualClients ? ' iOS visual client coordinates' : ''}`;
        await page.goto('http://keyboard.test/chat/maks');
        await page.getByTestId('chat-input').waitFor();
        await page.waitForTimeout(300); // Let the initial history scroll finish before the tap.
        // Browser toolbar/safe-area discrepancies must not shrink an idle PWA.
        await setViewport(page, { layoutHeight: size.height - 60, visualHeight: size.height - 60 });
        assert.equal((await metrics(page)).override, '', 'idle viewport override');
        if (size.visualClients) {
          await page.getByTestId('chat-input').evaluate(input => {
            const focus = input.focus.bind(input);
            input.focus = options => {
              window.__focusReveal = { opacity: input.style.opacity, preventScroll: options?.preventScroll };
              focus(options);
            };
          });
          await page.getByTestId('chat-input').tap();
          await page.waitForTimeout(80);
          const focused = await page.getByTestId('chat-input').evaluate(input => ({
            ...window.__focusReveal, active: document.activeElement === input, restored: input.style.opacity === '',
          }));
          assert.deepEqual(focused, { opacity: '0', preventScroll: true, active: true, restored: true });
          results.push({ name: `${name}: iOS tap focuses without reveal and restores editor`, focused });
        } else await page.getByTestId('chat-input').focus();
        if (size.visualClients) {
          // A sequence of keyboard animation frames. Track the actual header
          // and the last bubble, not just final shell geometry. This remains a
          // synthetic model; it cannot measure iOS compositor frame timing.
          await setViewport(page, { layoutHeight: size.height, visualHeight: size.height });
          const motion = await page.evaluate(async fullHeight => {
            const samples = [];
            for (const height of [850, 820, 780, 730, 680, 630, 580, 530, 471, 530, 580, 630, 680, 730, 780, 820, 850, fullHeight]) {
              window.__layoutHeight = height; window.__visualHeight = height;
              window.__visualTop = (fullHeight - height) * 341 / 403;
              window.__documentScroll = (fullHeight - height) * 62 / 403;
              window.__clientPan = window.__visualTop + window.__documentScroll;
              document.getElementById('root').style.transform = `translateY(${-window.__clientPan}px)`;
              window.visualViewport.dispatchEvent(new Event('resize'));
              const eventHeaderTop = document.querySelector('[data-testid=chat-header]').getBoundingClientRect().top;
              await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
              // ResizeObserver aligns after rAF callbacks, before paint. Read
              // in the following task instead of sampling before that layout.
              await new Promise(resolve => setTimeout(resolve, 0));
              const list = document.querySelector('[data-testid=chat-messages]');
              const bubbles = document.querySelectorAll('[data-testid=chat-message]');
              const last = bubbles[bubbles.length - 1];
              samples.push({ height, eventHeaderTop, rootHeight: document.getElementById('root').getBoundingClientRect().height,
                headerTop: document.querySelector('[data-testid=chat-header]').getBoundingClientRect().top,
                bottomDistance: list.scrollHeight - list.clientHeight - list.scrollTop,
                lastMessageBottom: last?.getBoundingClientRect().bottom,
                overlayTop: document.querySelector('[data-testid=chat-overlay]').getBoundingClientRect().top,
                composerTop: document.querySelector('[data-testid=chat-composer]').getBoundingClientRect().top,
              });
            }
            return samples;
          }, size.height);
          const anchorGap = motion[0].overlayTop - motion[0].lastMessageBottom;
          assert(anchorGap >= 0 && anchorGap <= 32, `${name}: initial message overlaps overlay or has excessive gap`);
          for (const sample of motion) {
            assert(Math.abs(sample.eventHeaderTop) < 1, `${name}: header displaced immediately after viewport event: ${JSON.stringify(sample)}`);
            assert(Math.abs(sample.headerTop) < 1, `${name}: header moved during keyboard animation: ${JSON.stringify(sample)}`);
            assert(Math.abs(sample.rootHeight - sample.height) < 1, `${name}: threshold jump during keyboard animation: ${JSON.stringify(sample)}`);
            assert(sample.bottomDistance < 2, `${name}: last message anchor lost: ${JSON.stringify(sample)}`);
            assert(Math.abs(sample.overlayTop - sample.lastMessageBottom - anchorGap) < 1, `${name}: history/overlay drift: ${JSON.stringify(sample)}`);
          }
          results.push({ name: `${name}: continuous keyboard frames and bottom anchor`, samples: motion });
          const reading = await page.evaluate(async fullHeight => {
            const list = document.querySelector('[data-testid=chat-messages]');
            list.scrollTop = Math.max(0, list.scrollTop - 900);
            await new Promise(resolve => setTimeout(resolve, 80));
            const anchor = list.scrollTop;
            const samples = [];
            for (const height of [850, 780, 680, 580, 471, 580, 680, 780, 850, fullHeight]) {
              window.__layoutHeight = height; window.__visualHeight = height;
              window.__visualTop = (fullHeight - height) * 341 / 403;
              window.__documentScroll = (fullHeight - height) * 62 / 403;
              window.__clientPan = window.__visualTop + window.__documentScroll;
              document.getElementById('root').style.transform = `translateY(${-window.__clientPan}px)`;
              visualViewport.dispatchEvent(new Event('resize'));
              await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
              await new Promise(resolve => setTimeout(resolve, 0));
              samples.push({ height, scrollTop: list.scrollTop, anchor });
            }
            list.scrollTop = list.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 80));
            return samples;
          }, size.height);
          for (const sample of reading) assert(Math.abs(sample.scrollTop - sample.anchor) < 1, `${name}: reading position lost: ${JSON.stringify(sample)}`);
          results.push({ name: `${name}: older history stays in place during keyboard frames`, samples: reading });
        }
        const keyboardHeight = size.visualClients ? 403 : Math.min(350, size.height * 0.45);
        const available = size.height - keyboardHeight;
        // Both APIs can resize together: the previous innerHeight-vv check misses this.
        await setViewport(page, { layoutHeight: available, visualHeight: available, visualTop: size.visualClients ? 341 : 0, documentScroll: size.visualClients ? 62 : 0 });
        await page.waitForTimeout(500);
        assert(await page.getByTestId('chat-input').evaluate(node => document.activeElement === node), `${name}: input blurred while keyboard opened`);
        await page.evaluate(() => {
          const list = [...document.querySelectorAll('div')].find(node => getComputedStyle(node).overflowY === 'auto' && node.scrollHeight > node.clientHeight);
          if (!list) throw new Error('Scrollable history missing');
          // Same scroll event path as scrollToEnd/onContentSizeChange. It must
          // not be interpreted as a user dragging to dismiss the keyboard.
          const before = list.scrollTop;
          list.scrollTop = Math.max(0, before - 80);
          if (list.scrollTop >= before) throw new Error('History cannot scroll while keyboard is open');
          list.dispatchEvent(new Event('scroll', { bubbles: true }));
        });
        await page.waitForTimeout(250);
        assert(await page.getByTestId('chat-input').evaluate(node => document.activeElement === node), `${name}: programmatic list scroll dismissed keyboard`);
        results.push({ name: `${name}: focus retained after programmatic scroll` });
        await checkKeyboard(page, `${name}: both viewports shrink`);
        await page.getByTestId('chat-input').fill('Перший рядок\nДругий рядок\nТретій рядок\nЧетвертий рядок');
        await page.waitForTimeout(250);
        assert(await page.getByTestId('chat-input').evaluate(node => document.activeElement === node), `${name}: input blurred after composer resized`);
        await checkKeyboard(page, `${name}: multiline`);
        if (size.width !== 412) {
          await setViewport(page, { layoutHeight: size.height, visualHeight: available - 44, visualTop: 38 });
          await checkKeyboard(page, `${name}: accessory bar and pan`);
          // Simulate a browser that already displaces fixed content. This is a
          // DOM geometry model, not a reproduction of WebKit's native compositor.
          await page.evaluate(() => { document.getElementById('root').style.transform = `translateY(${35 - window.__clientPan}px)`; visualViewport.dispatchEvent(new Event('scroll')); });
          await page.waitForFunction(() => Math.abs(document.getElementById('root').getBoundingClientRect().top - (window.__visualTop + window.__documentScroll - window.__clientPan)) < 1, null, { timeout: 2000 });
          await checkKeyboard(page, `${name}: fixed origin already shifted`);
          await page.evaluate(() => { document.getElementById('root').style.transform = `translateY(${-window.__clientPan}px)`; visualViewport.dispatchEvent(new Event('scroll')); });
          await page.waitForTimeout(150);
          const previous = await metrics(page);
          await setViewport(page, { scale: 1.5, visualHeight: 180 });
          assert.equal((await metrics(page)).override, previous.override, 'pinch should not resize shell');
          await setViewport(page, { scale: 1, visualHeight: available });
          results.push({ name: `${name}: pinch preserved` });
        }
        await page.getByTestId('chat-input').evaluate(node => node.blur());
        await page.waitForTimeout(450);
        await checkKeyboard(page, `${name}: blur precedes keyboard dismissal`);
        await setViewport(page, { layoutHeight: size.height - 60, visualHeight: size.height - 60, visualTop: 0, documentScroll: 0 });
        await page.waitForTimeout(750); // CSS takes ownership once the dismissal/pan settles.
        assert.equal((await metrics(page)).override, '', 'stale keyboard override');
        assert(Math.abs((await metrics(page)).root.height - size.height) < 1, 'PWA height lost');
        assert((await page.getByTestId('chat-input').inputValue()).includes('Четвертий'), 'draft lost');
        results.push({ name: `${name}: dismissed and draft retained` });
        assert.deepEqual(errors, []);
        if (engine === 'webkit' && (size.width === 390 || size.visualClients)) {
          await page.getByTestId('chat-input').focus();
          await setViewport(page, { layoutHeight: size.height, visualHeight: available, visualTop: 0 });
          await page.screenshot({ path: path.join(output, size.visualClients ? 'chat-keyboard-ios-client-model.png' : 'chat-keyboard-webkit.png') });
        }
        await page.getByTestId('chat-input').focus();
        await setViewport(page, { layoutHeight: size.width === 412 ? available : size.height, visualHeight: available, visualTop: 0 });
        for (const kind of ['horizontal', 'pinch', 'editor']) {
          await gesture(page, kind);
          assert(await page.getByTestId('chat-input').evaluate(node => document.activeElement === node), `${name}: ${kind} gesture blurred editor`);
          results.push({ name: `${name}: ${kind} gesture retains focus` });
        }
        await gesture(page, 'vertical');
        assert(await page.getByTestId('chat-input').evaluate(node => document.activeElement !== node), `${name}: vertical user drag should dismiss`);
        results.push({ name: `${name}: vertical drag dismisses keyboard` });
        await context.close();
      }
    } finally { await browser.close(); }
  }
  console.log(`${results.length} chat keyboard cases passed (synthetic browser geometry)`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
  fs.writeFileSync(path.join(output, 'chat-keyboard.json'), JSON.stringify({ limitation: 'Synthetic geometry, not real iOS/Android OS keyboards or Home Screen.', results }, null, 2));
});
