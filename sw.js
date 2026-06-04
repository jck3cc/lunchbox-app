// sw.js — minimal offline cache. Caches the app shell so it loads with no
// internet (planes, cruises). Bump CACHE when you change any cached file.
const CACHE = 'lunchbox-v16';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data.js',
  './manifest.webmanifest',
  './art/hero.png',
  './art/logo.png',
  './art/empty-week.png',
  './art/empty-shop.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Images: cache-first (they rarely change). App shell (html/js/css/json):
// NETWORK-FIRST so a refresh always gets the latest code; fall back to cache offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const path = new URL(e.request.url).pathname;
  const isImage = /\.(png|jpg|jpeg|webp|gif|ico|svg)$/i.test(path);

  // only cache genuinely-good responses (not 404/500, not opaque cross-origin)
  const cacheable = (r) => r && r.ok && r.type !== 'opaque';

  if (isImage) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
        if (cacheable(r)) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return r;
      }))
    );
    return;
  }

  e.respondWith(
    fetch(e.request).then(r => {
      if (cacheable(r)) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
