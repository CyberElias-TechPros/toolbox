/* Cache app assets only. User files and inputs are never read or cached. */
const VERSION = 'toolbox-v0.2.0';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg'];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('toolbox-') && k !== VERSION).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(VERSION);
        try {
          const response = await fetch(request);
          if (response.ok) await cache.put('/index.html', response.clone());
          return response;
        } catch {
          return (
            (await cache.match('/index.html')) ||
            new Response('Offline. Open Toolbox once while connected.', { status: 503 })
          );
        }
      })(),
    );
    return;
  }
  if (!url.pathname.startsWith('/assets/') && !SHELL.includes(url.pathname)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        return new Response('This tool has not been cached yet. Reconnect to load it.', { status: 503 });
      }
    })(),
  );
});
