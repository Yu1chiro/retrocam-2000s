/* Retro Cam service worker. Naikkan VERSION setiap deploy agar cache diperbarui. */
const VERSION = 'retro-cam-v-7';
const PRECACHE = [
  '/', '/camera',
  '/css/base.css', '/css/fonts.css',
  '/fonts/vt323-latin-400-normal.woff2',
  '/fonts/caveat-latin-600-normal.woff2',
  '/fonts/special-elite-latin-400-normal.woff2',
  '/js/pwa.js', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png', '/icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('message', e => {
  const t = e.data && e.data.type;
  if (t === 'SKIP_WAITING') self.skipWaiting();
  if (t === 'GET_VERSION' && e.ports[0]) e.ports[0].postMessage(VERSION);
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(cs => cs.forEach(c => c.postMessage({ type: 'SW_UPDATED', version: VERSION })))
  );
});

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return;

  // Halaman: network-first (3 dtk), jatuh ke cache saat offline
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const res = await Promise.race([fetch(req), timeout(3000)]);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch (_) {
        const path = url.pathname.replace(/\/+$/, '') || '/';
        return (await cache.match(path, { ignoreSearch: true })) ||
               (await cache.match(req, { ignoreSearch: true })) ||
               (await cache.match('/'));
      }
    })());
    return;
  }

  // Aset: stale-while-revalidate
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req);
    const net = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    return cached || (await net) || Response.error();
  })());
});