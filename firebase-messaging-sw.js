// firebase-messaging-sw.js
// Service Worker für Firebase Cloud Messaging (FCM) – Eltern-App Mäusenest
// HINWEIS: Für echte Push-Benachrichtigungen den VAPID Key eintragen (Firebase Console → Project Settings → Cloud Messaging)

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:"AIzaSyDN5bGV96Mu5NLr737Muqm2rvRUhXp2Lnw",
  authDomain:"mausenest-49e4c.firebaseapp.com",
  projectId:"mausenest-49e4c",
  storageBucket:"mausenest-49e4c.firebasestorage.app",
  messagingSenderId:"174479569482",
  appId:"1:174479569482:web:f87f709c97aa030c312cb3"
});

const messaging = firebase.messaging();

// Hintergrund-Nachrichten (wenn App nicht geöffnet ist)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Hintergrund-Nachricht erhalten:', payload);
  const notificationTitle = payload.notification?.title || '🐭 Claudias Mäusenest';
  const notificationOptions = {
    body: payload.notification?.body || 'Neue Nachricht',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: 'mausenest-notification',
    data: payload.data || {}
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Klick auf Benachrichtigung → App öffnen
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes('eltern-app') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./eltern-app.html');
    })
  );
});

// Offline-Cache (Basic PWA)
const CACHE_NAME = 'mausenest-eltern-v1';
const CACHE_URLS = [
  './eltern-app.html',
  './eltern-manifest.json',
  './icon-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS).catch(e => console.warn('Cache fehlt:', e)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
