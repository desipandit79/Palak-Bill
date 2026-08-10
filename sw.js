const CACHE_NAME = "palak-infra-bill-v1";
const FILES_TO_CACHE = [
  "./bill-software.html",
  "./manifest.json",
  "./logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE).catch(() => {
        // If logo.png doesn't exist yet, don't fail the whole install
        return Promise.all(
          FILES_TO_CACHE.map((url) =>
            cache.add(url).catch(() => null)
          )
        );
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          // If offline and not cached, at least try to serve the main page
          return caches.match("./bill-software.html");
        })
      );
    })
  );
});