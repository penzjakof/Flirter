/* Runs the real hook with a minimal event/viewport environment. This validates
 * state transitions, not browser layout, native KAV, or a physical OS keyboard.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(process.env.HOOK_SOURCE || 'src/hooks/use-web-viewport.ts', 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function environment({ visual = true, touch = true, standalone = true } = {}) {
  const events = new EventTarget();
  const viewport = visual ? Object.assign(new EventTarget(), { height: 844, offsetTop: 0, scale: 1 }) : null;
  const css = new Map();
  const callbacks = new Map();
  const timers = new Map();
  let serial = 0;
  let time = 0;
  let effect;
  const state = { cssHeight: 844, fixedOrigin: 0, documentOrigin: 0, visualPageTop: null };
  const root = { dataset: {}, style: { setProperty: (k, v) => css.set(k, v), getPropertyValue: k => css.get(k) || '', removeProperty: k => css.delete(k) } };
  const app = { getBoundingClientRect: () => ({ top: state.fixedOrigin + (parseFloat(css.get('--app-top')) || 0), height: parseFloat(css.get('--app-height')) || state.cssHeight }) };
  class Element {
    constructor() { this.isContentEditable = false; }
    matches(selector) { return !selector.includes('[readonly]'); }
  }
  const document = Object.assign(new EventTarget(), {
    documentElement: root, activeElement: null,
    body: { appendChild() {} }, getElementById: () => app,
    createElement: () => {
      const element = { style: {}, setAttribute() {}, remove() {}, getBoundingClientRect: () => ({
        height: state.cssHeight,
        top: element.style.cssText.includes('position:absolute') ? state.documentOrigin : state.fixedOrigin,
      }) };
      return element;
    },
  });
  const media = Object.assign(new EventTarget(), { matches: standalone });
  const window = Object.assign(events, { innerHeight: 844, innerWidth: 390, scrollY: 0, visualViewport: viewport,
    matchMedia: query => query.includes('standalone') ? media : { matches: touch },
    setTimeout: (fn, ms) => { const id = ++serial; timers.set(id, { fn, ms }); return id; },
  });
  if (viewport) Object.defineProperty(viewport, 'pageTop', { get: () => state.visualPageTop ?? (window.scrollY + viewport.offsetTop) });
  const exports = {};
  const context = vm.createContext({ exports, window, document, navigator: { standalone, webdriver: true, maxTouchPoints: touch ? 5 : 0 }, HTMLElement: Element,
    performance: { now: () => time },
    requestAnimationFrame: fn => { const id = ++serial; callbacks.set(id, fn); return id; },
    cancelAnimationFrame: id => callbacks.delete(id), clearTimeout: id => timers.delete(id),
    require: name => name === 'react' ? { useEffect: fn => { effect = fn; }, useSyncExternalStore: () => {}, useState: () => {} } : { Platform: { OS: 'web' }, Keyboard: {} },
  });
  vm.runInContext(code, context);
  exports.useWebViewport();
  const cleanup = effect();
  const flush = () => { time += 16; const work = [...callbacks.values()]; callbacks.clear(); work.forEach(fn => fn()); };
  flush();
  const trigger = (target = viewport || window, name = 'resize') => { target.dispatchEvent(new Event(name)); flush(); };
  return { state, window, document, viewport, css, app, cleanup, trigger, focus: () => { document.activeElement = new Element(); trigger(document, 'focusin'); },
    blur: () => { document.activeElement = null; trigger(document, 'focusout'); },
    settle: () => { time += 700; for (const [id, timer] of timers) if (timer.ms === 400) { timers.delete(id); timer.fn(); } flush(); },
    dispatch: (target, name) => target.dispatchEvent(new Event(name)), advance: () => flush() };
}
const results = [];
function run(name, work, config) {
  const env = environment(config);
  try { work(env); results.push({ name, status: 'passed' }); }
  finally { env.cleanup(); assert.equal(env.css.has('--app-height'), false); assert.equal(env.css.has('--app-top'), false); }
}
run('both viewport APIs shrink', e => {
  e.focus(); e.window.innerHeight = 500; e.viewport.height = 500; e.trigger();
  assert.equal(e.css.get('--app-height'), '500px');
});
run('visual viewport only shrinks and pans', e => {
  e.focus(); e.viewport.height = 480; e.viewport.offsetTop = 64; e.trigger();
  assert.equal(e.css.get('--app-height'), '480px'); assert.equal(e.app.getBoundingClientRect().top, 64);
});
run('fixed elements already displaced by browser', e => {
  e.focus(); e.viewport.height = 480; e.viewport.offsetTop = 64; e.state.fixedOrigin = 64; e.trigger();
  assert.equal(e.app.getBoundingClientRect().top, 64);
  e.state.fixedOrigin = 32; e.trigger(e.viewport, 'scroll'); assert.equal(e.app.getBoundingClientRect().top, 64);
});
run('iOS 18.7 Home Screen uses visual client coordinates (reported device geometry)', e => {
  e.focus(); e.state.cssHeight = 874;
  e.window.innerHeight = 471; e.viewport.height = 471; e.viewport.offsetTop = 341;
  e.window.scrollY = 403; e.state.visualPageTop = 403; e.state.documentOrigin = -403; e.state.fixedOrigin = -341;
  e.trigger();
  assert.equal(e.css.get('--app-height'), '471px');
  assert.equal(e.app.getBoundingClientRect().top, 0, 'header must start at visible top, not offsetTop=341');
  for (const fixedOrigin of [-403, 0, -341]) {
    e.state.fixedOrigin = fixedOrigin; e.trigger(e.viewport, 'scroll');
    assert.equal(e.app.getBoundingClientRect().top, 0, 'browser fixed-position movement must not add visual offset');
  }
});
run('layout client coordinates with document scroll preserve visual offset', e => {
  e.focus(); e.viewport.height = 471; e.viewport.offsetTop = 341;
  e.window.scrollY = 62; e.state.documentOrigin = -62;
  e.trigger(); assert.equal(e.app.getBoundingClientRect().top, 341);
  e.window.scrollY = 80; e.state.documentOrigin = -80;
  e.trigger(e.window, 'scroll'); assert.equal(e.app.getBoundingClientRect().top, 341);
});
run('blur before dismissal and restore Home Screen CSS height', e => {
  e.focus(); e.viewport.height = 480; e.trigger(); e.blur(); e.settle();
  assert.equal(e.css.get('--app-height'), '480px');
  e.viewport.height = 784; e.window.innerHeight = 784; e.trigger();
  e.settle();
  assert.equal(e.css.has('--app-height'), false); assert.equal(e.app.getBoundingClientRect().height, 844);
});
run('idle 60px difference is not a keyboard', e => {
  e.viewport.height = 784; e.window.innerHeight = 784; e.trigger(); assert.equal(e.css.has('--app-height'), false);
});
run('hardware keyboard focus does not resize', e => { e.focus(); assert.equal(e.css.has('--app-height'), false); });
run('pinch zoom does not resize the application', e => {
  e.focus(); e.viewport.height = 480; e.trigger(); e.viewport.scale = 1.5; e.viewport.height = 300; e.trigger();
  assert.equal(e.css.get('--app-height'), '480px');
});
run('orientation invalidates previous baseline', e => {
  e.focus(); e.viewport.height = 480; e.trigger();
  e.window.innerWidth = 844; e.window.innerHeight = 390; e.state.cssHeight = 390; e.viewport.height = 180; e.trigger();
  assert.equal(e.css.get('--app-height'), '180px'); e.viewport.height = 390; e.trigger(); assert.equal(e.css.has('--app-height'), false);
});
run('transient zero viewport does not collapse application', e => {
  e.focus(); e.viewport.height = 480; e.trigger(); e.viewport.height = 0; e.trigger(); assert.equal(e.css.get('--app-height'), '480px');
});
run('browser without VisualViewport uses resize fallback', e => {
  e.focus(); e.window.innerHeight = 500; e.trigger(); assert.equal(e.css.get('--app-height'), '500px');
  e.blur(); e.window.innerHeight = 844; e.trigger(); assert.equal(e.css.has('--app-height'), false);
}, { visual: false });
run('dynamic viewport units also shrink in resizes-content mode', e => {
  e.focus(); e.state.cssHeight = 500; e.window.innerHeight = 500; e.viewport.height = 500; e.trigger();
  assert.equal(e.css.get('--app-height'), '500px');
}, { standalone: false });
run('desktop window resize with focused input is not a soft keyboard', e => {
  e.focus(); e.state.cssHeight = 500; e.window.innerHeight = 500; e.viewport.height = 500; e.trigger(); assert.equal(e.css.has('--app-height'), false);
}, { touch: false, standalone: false });
run('keyboard height follows first and last animation pixels without threshold jumps', e => {
  e.focus();
  for (const height of [828, 800, 752, 700, 600, 500]) {
    e.viewport.height = height; e.trigger();
    assert.equal(e.app.getBoundingClientRect().height, height);
  }
  e.blur();
  for (const height of [550, 650, 750, 800, 828, 844]) {
    e.viewport.height = height; e.trigger();
    assert.equal(e.app.getBoundingClientRect().height, height);
  }
  e.settle(); assert.equal(e.css.has('--app-height'), false);
});
run('header tracks native focus pan between viewport events', e => {
  e.focus(); e.viewport.height = 500; e.trigger();
  e.state.fixedOrigin = -50;
  e.advance(); assert.equal(e.app.getBoundingClientRect().top, 0);
  e.state.fixedOrigin = -90;
  e.advance(); assert.equal(e.app.getBoundingClientRect().top, 0);
});
run('native viewport pan is corrected in the event, before the next animation frame', e => {
  e.focus(); e.viewport.height = 471; e.trigger();
  e.state.fixedOrigin = -120;
  e.dispatch(e.viewport, 'scroll');
  assert.equal(e.app.getBoundingClientRect().top, 0, 'viewport events must not leave the header displaced until a later frame');
  e.viewport.height = 450;
  e.dispatch(e.viewport, 'resize');
  assert.equal(e.app.getBoundingClientRect().height, 450, 'composer geometry must update in the same event');
});
const output = path.resolve(process.env.RESULTS_DIR || 'Codex/frontend-audit/keyboard');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'controller.json'), JSON.stringify({ limitation: 'Hook state transitions with simulated DOM metrics; no browser/native layout verification.', results }, null, 2));
console.log(`${results.length} controller scenarios passed`);
