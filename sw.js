// Mäusenest – Service Worker
const CACHE_NAME = 'mausenest-v5';
const ASSETS = [
'./manager-app.html',
'./eltern-app.html',
'./manifest.json',
'./logo.png',
'https://fonts.googleapis.com/css2?family=Chelsea+Market&family=Nunito:wght@400;600;700;800&display=swap'
];

// Install: cache assets — KEIN skipWaiting() hier!
// Neuer SW wartet, bis Nutzer "Neu laden" klickt.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Message: Seite schickt SKIP_WAITING → SW übernimmt sofort
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Fetch: network first, dann Cache als Fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
