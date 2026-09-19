// オフライン用：一度開いたらファイルを端末に保存しておく
const CACHE = "arrow-cube-v2";
const CDN = "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(FILES);
    try { const r = await fetch(CDN, {mode: "cors"}); if (r.ok) await c.put(CDN, r); } catch (err) {}
  }));
  self.skipWaiting();
});
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
// ネットがあれば最新を取り、なければ保存したものを使う
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request, {ignoreSearch: true, ignoreVary: true}).then(r => r || caches.match(e.request.url)).then(r => r || caches.match("./index.html"))));
});
