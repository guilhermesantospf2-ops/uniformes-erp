const CACHE_NAME = 'bravvi-erp-desktop-v8.7.2';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/demo.html',
  '/style.css?v=8.7.2',
  '/app.js?v=8.7.2',
  '/cloud-sync.js?v=8.7.2',
  '/nesting-engine.js?v=8.7.2',
  '/market-benchmark.js?v=8.7.2',
  '/mock-data.js?v=8.7.2',
  '/pwa-install.js?v=8.7.2',
  '/pix-engine.js?v=8.7.2',
  '/pix-qrcode.min.js',
  '/infinitepay-engine.js?v=8.7.2',
  '/manifest.json',
  '/favicon.ico',
  '/assets/favicon.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/bravvi-icon.png',
  '/assets/bravvi-logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[PWA ServiceWorker v8.7.0] Cache inicial parcial:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA ServiceWorker] Deletando cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network-First agressiva: Sempre tenta a rede para evitar HTML desatualizado no app instalado
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não intercepta chamadas externas (Supabase, Firebase, Google Fonts, CDNs, Focus NFe)
  if (url.origin !== self.location.origin || event.request.method !== 'GET') {
    return;
  }

  // Requisições de navegação (HTML principal do app): prioridade total de rede com fallback
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
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
            return cachedResponse || caches.match('/index.html') || new Response('Modo Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Demais arquivos (scripts, estilos, imagens)
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
          return new Response('Recurso Indisponível Offline', { status: 503 });
        });
      })
  );
});
