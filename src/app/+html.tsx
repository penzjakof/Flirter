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
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
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
html, body { background-color: #EFEAED; overscroll-behavior: none; }
@media (prefers-color-scheme: dark) {
  html, body { background-color: #0B090C; }
}
body { -webkit-tap-highlight-color: transparent; -webkit-text-size-adjust: 100%; }
#root { height: 100dvh; }
input, textarea { font-size: 16px; } /* iOS не зумить при фокусі */
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
  var isMetroDev = location.port === '8081';
  if (isMetroDev) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function (error) {
      console.warn('Service worker registration failed', error);
    });
  });
})();
`;
