const CACHE_NAME = 'paris-trip-v1';
const GITHUB_BASE = '/paris-birthday-trip';
const urlsToCache = [
  GITHUB_BASE + '/',
  GITHUB_BASE + '/index.html',
  GITHUB_BASE + '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Cache addAll error:', err);
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only cache requests within the paris-birthday-trip scope
  if (!url.pathname.startsWith(GITHUB_BASE)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        }).catch(() => {
          // Return cached version or offline page
          return caches.match(GITHUB_BASE + '/index.html');
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
