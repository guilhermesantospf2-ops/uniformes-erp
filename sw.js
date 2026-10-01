const CACHE_NAME = 'bravvi-erp-desktop-v8.5.2';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/style.css?v=8.5.0',
  '/app.js',
  '/cloud-sync.js',
  '/nesting-engine.js',
  '/market-benchmark.js',
  '/mock-data.js',
  '/manifest.json',
  '/favicon.ico',
  '/assets/favicon.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/bravvi-icon.png',
  '/assets/bravvi-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[PWA ServiceWorker] Cache inicial parcial:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network-First para manter os dados sempre sincronizados na nuvem
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não intercepta chamadas externas (Supabase, Firebase, Google Fonts CDNs)
  if (url.origin !== self.location.origin || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Modo Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
