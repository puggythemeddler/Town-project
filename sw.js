const CACHE = "computer-store-v1";
const SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/site.js",
  "/products.js",
  "/manifest.webmanifest",
  "/icon.svg",
  "/admin/",
  "/admin/index.html",
  "/admin/admin.css",
  "/admin/admin.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() =>
          caches.match(request).then((cached) => cached || new Response(JSON.stringify({ error: "Offline" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok && url.origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
