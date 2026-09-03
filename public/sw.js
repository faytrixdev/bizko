/* Bizko Service Worker
 * Strategy:
 *  - Precache the minimal app shell (home + manifest) at install.
 *  - Network-first for navigations: always serve fresh SSR pages so auth
 *    sessions, cookies and server-rendered data stay intact. Falls back to the
 *    cached page only when offline.
 *  - Stale-while-revalidate for same-origin static assets (hashed _next files).
 *  - Never intercept cross-origin requests or /api/* calls so authentication,
 *    cookies and API responses remain untouched.
 */
const CACHE_VERSION = "bizko-v2";
const APP_SHELL = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET and cross-origin requests (Supabase, R2, analytics, fonts...).
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Never intercept API routes -> keeps auth / sessions / cookies intact.
  if (url.pathname.startsWith("/api/")) return;

  // Navigation: network-first with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
