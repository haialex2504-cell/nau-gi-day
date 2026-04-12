// !! Bump this version with every deploy to force clients to update !!
const CACHE_NAME = 'nau-gi-day-v2';

// Only pre-cache truly static assets (icons, manifest)
const STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
];

// --- Install: pre-cache static assets only ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Activate the new SW immediately without waiting for old clients to close
  self.skipWaiting();
});

// --- Activate: delete ALL old caches ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// --- Fetch: Network First strategy ---
// Always try the network first. Only fall back to cache if offline.
// This ensures users always get fresh CSS/HTML after a deploy.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip cross-origin requests (Supabase API, Google Fonts, external images)
  if (url.origin !== self.location.origin) return;

  // Skip Next.js API routes and server actions — never cache these
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/data/')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Only cache successful, same-origin, basic responses
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed → serve from cache (offline support)
        return caches.match(event.request);
      })
  );
});
