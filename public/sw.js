// Offline support: app shell (cache-first), TMDB API + images (stale-while-revalidate).
const SHELL = "shell-v2", DATA = "data-v2";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(["/", "/index.html"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
async function swr(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const net = fetch(req).then((r) => { if (r && (r.ok || r.type === "opaque")) cache.put(req, r.clone()); return r; }).catch(() => hit);
  return hit || net;
}
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("/index.html")));
  } else if (url.hostname.endsWith("themoviedb.org") || url.hostname === "image.tmdb.org") {
    e.respondWith(swr(req, DATA));
  } else if (url.origin === location.origin) {
    e.respondWith(swr(req, SHELL));
  }
});
