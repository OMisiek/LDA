const VERSION = 'v1.0.0'; // bump this to force updates
const CACHE_NAME = `lpcache-${VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('lpcache-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    const clientsArr = await self.clients.matchAll({type:'window'});
    clientsArr.forEach(client => client.postMessage({type:'UPDATE_READY'}));
  })());
  self.clients.claim();
});

// Network-first for documents, cache-first for others
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match('./index.html');
        return cached || Response.error();
      }
    })());
  } else {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
      return res;
    })());
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// OPTIONAL: Web Push handlers (requires server with VAPID + subscriptions)
// Uncomment to enable once server-side pieces are ready.
// self.addEventListener('push', (event) => {
//   let data = { title: 'App update', body: 'New version available' };
//   try { data = event.data ? event.data.json() : data; } catch(e) {}
//   event.waitUntil(self.registration.showNotification(data.title, { body: data.body }));
// });
// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();
//   event.waitUntil(self.clients.openWindow('./'));
// });
