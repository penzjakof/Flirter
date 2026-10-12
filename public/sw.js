/*
 * Flirter service worker.
 * Політика (06-pwa-session-requirements.md §3):
 *  - кешуємо лише публічний shell і статичні хешовані ассети;
 *  - приватні API (/api/*), чати, медіа, токени — НІКОЛИ не кешуються;
 *  - навігація: network-first, офлайн → кешований shell.
 */
const CACHE_PREFIX = 'flirter-shell-';
const CACHE_VERSION = `${CACHE_PREFIX}v2`;
const SHELL_URLS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(SHELL_URLS);
    // The first page loads before the worker controls it. Precache its hashed JS/CSS too,
    // otherwise the cached HTML alone cannot start the app on its first offline launch.
    const shell = await cache.match('/');
    const html = await shell.text();
    const assets = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
      .map((match) => new URL(match[1], self.location.origin))
      .filter((url) => url.origin === self.location.origin && isStaticAsset(url));
    await cache.addAll([...new Set(assets.map((url) => url.href))]);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (url.pathname.startsWith('/_expo/static/') || url.pathname.startsWith('/assets/')) &&
    /[.-][a-f0-9]{8,}\./i.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match('/'))),
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy)));
            }
            return response;
          }),
      ),
    );
    return;
  }

  if (SHELL_URLS.includes(url.pathname)) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
  }
});
