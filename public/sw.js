// WORLD ALFOHOD SCOUT — minimal app-shell service worker.
const CACHE = "alfohod-v1";
const APP_SHELL = ["/" "/manifest.webmanifest" "/favicon.svg"];

self.addEventListener("install" (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate" (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch" (event) => {
  const req = event.request;
  // Bypass non-GET API locale JSON loads and cross-origin
  if (
    req.method !== "GET" ||
    new URL(req.url).origin !== self.location.origin ||
    req.url.includes("/api/") ||
    req.url.includes("/locales/")
  ) {
    return;
  }
  // Stale-while-revalidate for app shell + assets
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});


