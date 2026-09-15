/* Besedomat Service Worker — offline podpora
   Strategija: cache-first za app shell, network fallback + dinamično dodajanje v predpomnilnik.
   OBVEZNO: povečaj številko (besedomat-vX) ob vsaki spremembi index.html,
   sicer uporabniki ostanejo na stari (cached) verziji! */ 

const CACHE_NAME = "besedomat-v12";

const ASSETS = [
  "./",
  "./index.html",
  "./qrcode.min.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
  ,"./fonts/PigpenCipher.otf"
  ,"./fonts/wizpen.ttf"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; /* zunanje povezave (npr. support gumbi) ne gredo v cache */

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;

      return fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
