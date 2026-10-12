import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Web-only кореневий HTML для статичного рендеру (виконується в Node.js).
 * Тут — PWA-метадані: manifest, iOS Home Screen, theme-color, safe-area.
 * Zoom НЕ блокуємо (WCAG): без maximum-scale / user-scalable=no.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="uk">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="Flirter — симулятор знайомств із вигаданими AI-персонажами. 18+." />
        <meta name="theme-color" content="#FAF8F7" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#121013" media="(prefers-color-scheme: dark)" />
        <meta name="color-scheme" content="light dark" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />

        {/* iOS: запуск з Home Screen як окремий застосунок */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Flirter" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalCss = `
html, body { background-color: #FAF8F7; overscroll-behavior: none; height: 100%; width: 100%; overflow: hidden; }
html { --app-viewport-height: 100vh; }
@supports (height: 100dvh) { html { --app-viewport-height: 100dvh; } }
@media (prefers-color-scheme: dark) {
  html, body { background-color: #121013; }
}
body { -webkit-tap-highlight-color: transparent; -webkit-text-size-adjust: 100%; }
#root {
  position: fixed; top: var(--app-top, 0px); left: 0; right: 0;
  height: var(--app-height, var(--app-viewport-height, 100vh));
  min-height: 0;
  padding-left: env(safe-area-inset-left, 0px); padding-right: env(safe-area-inset-right, 0px);
  box-sizing: border-box;
}
/* In iOS Home Screen mode percentage heights and dynamic viewport units can
   exclude the safe areas. Size every page ancestor to the same legacy viewport,
   rather than extending only #root beyond the clipping html/body rectangles.
   The keyboard override must still be allowed to shrink #root. */
@media (display-mode: standalone) {
  html { --app-viewport-height: 100vh; }
  html, body { height: 100vh; }
}
html[data-app-standalone="true"] { --app-viewport-height: 100vh; }
html[data-app-standalone="true"], html[data-app-standalone="true"] body { height: 100vh; }
input, textarea { font-size: 16px; } /* iOS не зумить при фокусі */
[data-testid="chat-suggestions"] {
  grid-template-rows: 1fr;
  transition: grid-template-rows 200ms ease, opacity 150ms ease;
}
[data-testid="chat-suggestions"] > div { min-height: 0; overflow: hidden; }
html[data-app-keyboard="true"] [data-testid="chat-suggestions"] {
  grid-template-rows: 0fr; opacity: 0; pointer-events: none;
}
[data-testid="chat-composer"] { transition: padding-bottom 200ms ease; }
*:focus-visible { outline: 2px solid #B6245A; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`;

/**
 * Реєстрація service worker лише поза dev-сервером Metro,
 * щоб агресивний кеш не підміняв свіжі бандли під час розробки.
 */
const serviceWorkerBootstrap = `
(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    // Expo appends its entry script after this head bootstrap. Inspect only once HTML is parsed.
    if (document.querySelector('script[src*=".bundle?"]')) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function (error) {
      console.warn('Service worker registration failed', error);
    });
  });
})();
`;
