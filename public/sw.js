// public/sw.js
// Compliance Service Worker to meet PWA installation requirements on mobile and desktop

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Let browser fetch resources over the network directly
  event.respondWith(fetch(event.request));
});
