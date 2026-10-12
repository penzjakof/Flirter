import { useEffect, useState, useSyncExternalStore } from 'react';
import { Keyboard, Platform } from 'react-native';

let keyboardVisible = false;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export function useWebKeyboardVisible() {
  return useSyncExternalStore(subscribe, () => keyboardVisible, () => false);
}

/** Do not retain the home-indicator inset above an already raised keyboard. */
export function useKeyboardVisible() {
  const webVisible = useWebKeyboardVisible();
  const [nativeVisible, setNativeVisible] = useState(() => Platform.OS !== 'web' && Keyboard.isVisible());
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setNativeVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setNativeVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return Platform.OS === 'web' ? webVisible : nativeVisible;
}

/** iOS keyboards shrink the visual viewport, while the layout viewport can remain unchanged. */
export function useWebViewport() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const viewport = window.visualViewport;
    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    const root = document.documentElement;
    const updateStandalone = () => {
      const standalone = Boolean(
        (navigator as Navigator & { standalone?: boolean }).standalone || standaloneMedia.matches,
      );
      root.dataset.appStandalone = String(standalone);
    };
    updateStandalone();
    let frame = 0;
    let settleTimer = 0;
    let baselineWidth = window.innerWidth;
    let unobstructedHeight = window.innerHeight;
    let keyboardTransition = false;
    let followUntil = 0;
    // Independent of #root, which we resize while the keyboard is visible.
    const heightProbe = document.createElement('div');
    heightProbe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:var(--app-viewport-height,100vh);visibility:hidden;pointer-events:none';
    heightProbe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(heightProbe);
    // Map document coordinates into the browser's client-rect coordinates.
    // iOS WebKit uses the visual origin here; Chromium uses the layout origin.
    const originProbe = document.createElement('div');
    originProbe.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none';
    originProbe.setAttribute('aria-hidden', 'true');
    originProbe.setAttribute('data-app-viewport-origin', '');
    document.body.appendChild(originProbe);
    // Temporary diagnostics for the reported Home Screen clipping issue.
    // Only dimensions are sent; no URL, session, input, email or chat data.
    // The same-origin request is captured by nginx's existing access log.
    const reportViewport = () => {
      if (root.dataset.appStandalone !== 'true' || navigator.webdriver) return;
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;inset:0;box-sizing:border-box;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
      document.body.appendChild(probe);
      const fixedHeight = probe.getBoundingClientRect().height;
      const safeArea = getComputedStyle(probe);
      const safeTop = parseFloat(safeArea.paddingTop) || 0;
      const safeBottom = parseFloat(safeArea.paddingBottom) || 0;
      probe.style.height = '100vh';
      const vh = probe.getBoundingClientRect().height;
      probe.style.height = '100dvh';
      const dvh = probe.getBoundingClientRect().height;
      probe.remove();
      const params = new URLSearchParams({
        version: 'keyboard-20261012-6', keyboard: String(keyboardVisible),
        ios: navigator.userAgent.match(/(?:CPU (?:iPhone )?OS|iPhone OS) ([\d_]+)/)?.[1] ?? 'other',
        screen: String(screen.height), inner: String(innerHeight),
        visual: String(viewport?.height ?? innerHeight), offset: String(viewport?.offsetTop ?? 0),
        pageTop: String(viewport?.pageTop ?? window.scrollY), scrollY: String(window.scrollY),
        originTop: String(originProbe.getBoundingClientRect().top),
        appTop: root.style.getPropertyValue('--app-top'),
        fixed: String(fixedHeight), vh: String(vh), dvh: String(dvh),
        safeTop: String(safeTop), safeBottom: String(safeBottom),
      });
      for (const [key, selector] of Object.entries({ html: 'html', body: 'body', root: '#root', frame: '[data-testid=app-frame]', tab: '[data-testid=tab-glass]', header: '[data-testid=chat-header]', messages: '[data-testid=chat-messages]', composer: '[data-testid=chat-composer]', input: '[data-testid=chat-input-surface]', send: '[data-testid=chat-send]' })) {
        const rect = document.querySelector(selector)?.getBoundingClientRect();
        if (rect) {
          params.set(`${key}Height`, String(Math.round(rect.height)));
          params.set(`${key}Top`, String(Math.round(rect.top)));
          params.set(`${key}Bottom`, String(Math.round(rect.bottom)));
        }
      }
      void fetch(`/__viewport-metrics?${params}`, { cache: 'no-store', keepalive: true }).catch(() => undefined);
    };
    // Temporary numeric-only motion trace for the physical iPhone report.
    let motionFrame = 0;
    let motionRows: number[][] = [];
    let motionStarted = 0;
    let motionKind = '';
    let motionSerial = 0;
    const sendMotion = () => {
      const id = `${Date.now()}-${++motionSerial}`;
      for (let offset = 0; offset < motionRows.length; offset += 8) {
        const params = new URLSearchParams({ version: 'motion-20261012-7', id,
          kind: motionKind, part: String(offset / 8), rows: JSON.stringify(motionRows.slice(offset, offset + 8)) });
        void fetch(`/__viewport-motion?${params}`, { cache: 'no-store', keepalive: true }).catch(() => undefined);
      }
      motionRows = [];
    };
    const sampleMotion = () => {
      const header = document.querySelector('[data-testid="chat-header"]');
      const app = document.getElementById('root');
      const input = document.querySelector('[data-testid="chat-input"]');
      const rect = header?.getBoundingClientRect();
      if (header && app && input && rect) {
        const elapsed = Math.round(performance.now() - motionStarted);
        motionRows.push([elapsed, viewport?.height ?? innerHeight, viewport?.offsetTop ?? 0,
          viewport?.pageTop ?? 0, window.scrollY, originProbe.getBoundingClientRect().top,
          app.getBoundingClientRect().top, rect.top, rect.height,
          parseFloat(getComputedStyle(header).paddingTop) || 0,
          header.firstElementChild?.getBoundingClientRect().top ?? 0,
          input.getBoundingClientRect().top, document.activeElement === input ? 1 : 0,
          parseFloat(root.style.getPropertyValue('--app-top')) || 0]);
        if (elapsed < 1600 && motionRows.length < 100) {
          motionFrame = requestAnimationFrame(sampleMotion);
          return;
        }
      }
      motionFrame = 0;
      sendMotion();
    };
    const traceFocus = (event: FocusEvent) => {
      if (navigator.webdriver || root.dataset.appStandalone !== 'true' ||
        !(event.target instanceof HTMLElement) || !event.target.matches('[data-testid="chat-input"]')) return;
      cancelAnimationFrame(motionFrame);
      if (motionRows.length) sendMotion();
      motionKind = event.type;
      motionStarted = performance.now();
      sampleMotion();
    };
    document.addEventListener('focusin', traceFocus);
    document.addEventListener('focusout', traceFocus);
    let reportTimer = window.setTimeout(reportViewport, 5000);
    const update = () => {
      // Correct viewport events synchronously. Deferring this to rAF lets
      // WebKit display its native focus pan with the old header position.
      // Keep pinch zoom available; don't resize the app to the magnified viewport.
      if (viewport && Math.abs(viewport.scale - 1) > 0.01) return;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      if (viewportHeight <= 0) return; // Transient background/rotation values.
      const focused = document.activeElement;
      const isEditing = focused instanceof HTMLElement && !focused.matches('[readonly], [disabled]') &&
        (focused.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea') || focused.isContentEditable);
      const cssHeight = heightProbe.getBoundingClientRect().height;
      if (Math.abs(window.innerWidth - baselineWidth) > 1) {
        baselineWidth = window.innerWidth;
        unobstructedHeight = Math.max(cssHeight, window.innerHeight);
      }
      const touchDevice = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
      if ((!isEditing && !keyboardTransition) || !touchDevice) {
        unobstructedHeight = Math.max(cssHeight, window.innerHeight, viewportHeight);
      } else {
        unobstructedHeight = Math.max(unobstructedHeight, cssHeight, window.innerHeight);
      }
      const keyboardThreshold = Math.max(80, Math.min(120, unobstructedHeight * 0.15));
      // Safari/new Chrome shrink the visual viewport. Other browser modes
      // shrink innerHeight as well, so compare against the unmodified baseline.
      const following = performance.now() < followUntil;
      const heightLoss = unobstructedHeight - viewportHeight;
      const keyboardResize = (isEditing || keyboardTransition) && heightLoss > keyboardThreshold;
      // The threshold classifies a keyboard; it must not be a step in its
      // animation. Follow the first/last pixels as well, until iOS settles.
      keyboardTransition = keyboardResize || (keyboardTransition && following && heightLoss > 1);
      const resizeApp = touchDevice && heightLoss > 1 &&
        (keyboardTransition || (isEditing && following));
      // Outside a keyboard transition CSS owns the page's size. Persisting
      // innerHeight here overrides standalone 100vh with iOS's shorter layout
      // viewport, and can leave the app stuck at a stale keyboard height.
      if (resizeApp) {
        const height = `${viewportHeight}px`;
        if (root.style.getPropertyValue('--app-height') !== height) root.style.setProperty('--app-height', height);
      } else {
        root.style.removeProperty('--app-height');
      }
      if (isEditing || keyboardTransition || following) {
        // offsetTop and getBoundingClientRect do not share an origin on iOS.
        // Convert the visual viewport's document position to client space
        // before comparing it with the fixed app. Adding offsetTop directly
        // put the iOS header near the keyboard and the composer behind it.
        const visibleTop = viewport
          ? viewport.pageTop + originProbe.getBoundingClientRect().top
          : 0;
        const app = document.getElementById('root');
        const oldTop = parseFloat(root.style.getPropertyValue('--app-top')) || 0;
        const fixedOrigin = app ? app.getBoundingClientRect().top - oldTop : 0;
        const top = `${visibleTop - fixedOrigin}px`;
        if (root.style.getPropertyValue('--app-top') !== top) root.style.setProperty('--app-top', top);
      } else {
        root.style.removeProperty('--app-top');
      }
      root.dataset.appKeyboard = String(keyboardTransition);
      const nextKeyboardVisible = keyboardTransition;
      if (nextKeyboardVisible !== keyboardVisible) {
        keyboardVisible = nextKeyboardVisible;
        listeners.forEach((listener) => listener());
        clearTimeout(reportTimer);
        reportTimer = window.setTimeout(reportViewport, 600);
      }
      // WebKit's native focus pan can progress between viewport events.
      // Calibrate before every paint during that short transition so the
      // header stays at its physical position; never animate its correction.
      if (following && !frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
      }
    };
    // Focus can precede the final resize on iOS, and dismissal can finish after
    // blur/navigation. One delayed recheck handles those event orderings.
    const updateAfterTransition = () => {
      followUntil = performance.now() + 650;
      update();
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(update, 400);
    };
    // iOS can pan its native scroll view even when html/body cannot scroll.
    // Focus the composer within the original user gesture, but exclude its
    // text box from Safari's reveal calculation until the next frame.
    // Keep the surface visible and the same textarea mounted/focused.
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let focusFrame = 0;
    let restoreInput: (() => void) | undefined;
    const focusComposer = (event: PointerEvent) => {
      const input = event.target;
      if (!isIOS || !event.isPrimary || event.button !== 0 ||
        !(input instanceof HTMLElement) || !input.matches('[data-testid="chat-input"]') ||
        document.activeElement === input || input.matches('[readonly], [disabled]')) return;
      event.preventDefault();
      restoreInput?.();
      cancelAnimationFrame(focusFrame);
      const opacity = input.style.getPropertyValue('opacity');
      input.style.setProperty('opacity', '0');
      restoreInput = () => {
        if (opacity) input.style.setProperty('opacity', opacity);
        else input.style.removeProperty('opacity');
        restoreInput = undefined;
      };
      input.focus({ preventScroll: true });
      focusFrame = requestAnimationFrame(() => {
        focusFrame = 0;
        restoreInput?.();
      });
    };
    document.addEventListener('pointerdown', focusComposer, { capture: true, passive: false });
    update();
    window.addEventListener('resize', updateAfterTransition);
    window.addEventListener('scroll', updateAfterTransition, { passive: true });
    window.addEventListener('pageshow', updateAfterTransition);
    window.addEventListener('orientationchange', updateAfterTransition);
    document.addEventListener('visibilitychange', updateAfterTransition);
    if (standaloneMedia.addEventListener) standaloneMedia.addEventListener('change', updateStandalone);
    else standaloneMedia.addListener(updateStandalone);
    viewport?.addEventListener('resize', updateAfterTransition);
    viewport?.addEventListener('scroll', updateAfterTransition);
    document.addEventListener('focusin', updateAfterTransition);
    document.addEventListener('focusout', updateAfterTransition);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(motionFrame);
      document.removeEventListener('focusin', traceFocus);
      document.removeEventListener('focusout', traceFocus);
      cancelAnimationFrame(focusFrame);
      restoreInput?.();
      document.removeEventListener('pointerdown', focusComposer, true);
      clearTimeout(reportTimer);
      clearTimeout(settleTimer);
      heightProbe.remove();
      originProbe.remove();
      window.removeEventListener('resize', updateAfterTransition);
      window.removeEventListener('scroll', updateAfterTransition);
      window.removeEventListener('pageshow', updateAfterTransition);
      window.removeEventListener('orientationchange', updateAfterTransition);
      document.removeEventListener('visibilitychange', updateAfterTransition);
      if (standaloneMedia.removeEventListener) standaloneMedia.removeEventListener('change', updateStandalone);
      else standaloneMedia.removeListener(updateStandalone);
      delete root.dataset.appStandalone;
      delete root.dataset.appKeyboard;
      root.style.removeProperty('--app-height');
      root.style.removeProperty('--app-top');
      viewport?.removeEventListener('resize', updateAfterTransition);
      viewport?.removeEventListener('scroll', updateAfterTransition);
      document.removeEventListener('focusin', updateAfterTransition);
      document.removeEventListener('focusout', updateAfterTransition);
      if (keyboardVisible) {
        keyboardVisible = false;
        listeners.forEach((listener) => listener());
      }
    };
  }, []);
}
