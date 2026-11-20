/*
 * Mareona service worker.
 * Hand-written on purpose: the build uses Turbopack, which the common Workbox/Serwist
 * plugins do not support, and the strategies below are small enough to audit.
 *
 * Scope of offline support is an explicit allowlist (daily games + historical archive).
 * Everything else — live scores, auth, Supabase, API routes, Server Actions — always
 * goes to the network so users never see stale or cross-account data.
 */
const VERSION = "v4";
const SHELL_CACHE = `mareona-shell-${VERSION}`;
const STATIC_CACHE = `mareona-static-${VERSION}`;
const IMAGE_CACHE = `mareona-images-${VERSION}`;
const ACTIVE_CACHES = [SHELL_CACHE, STATIC_CACHE, IMAGE_CACHE];

const OFFLINE_URL = "/offline";
const CRITICAL_IMAGES = ["/logo.png"];
const PRECACHE_PATHS = [
  "/offline",
  "/juegos",
  "/juegos/wordle",
  "/juegos/pregunta-del-dia",
  "/juegos/mas-o-menos",
  "/historico",
  "/historico/efemerides",
  "/historico/legado",
  "/historico/rivales",
];
const ARCHIVE_PREFIX = "/historico/";
const IMAGE_PREFIXES = ["/crests/", "/flags/", "/images/", "/stadiums/", "/icons/", "/_next/image"];

const NAVIGATION_TIMEOUT_MS = 3000;
const MAX_STATIC_ENTRIES = 300;
const MAX_IMAGE_ENTRIES = 150;
const STATIC_ASSET_PATTERN =
  /\/_next\/static\/[^"'\s\\)<>]+?\.(?:js|css|woff2?)(?:\?[^"'\s\\)<>]*)?/g;

function isOfflineCapable(pathname) {
  return PRECACHE_PATHS.includes(pathname) || pathname.startsWith(ARCHIVE_PREFIX);
}

/** Cache key ignores query strings so `?source=pwa` or UTM links share one entry. */
function pageKey(url) {
  return new Request(url.origin + url.pathname);
}

function isCacheablePage(response) {
  return response.status === 200 && !response.redirected;
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const overflow = keys.length - maxEntries;
  for (let i = 0; i < overflow; i += 1) {
    await cache.delete(keys[i]);
  }
}

async function precacheStaticAssets(html) {
  const assets = new Set(html.match(STATIC_ASSET_PATTERN) || []);
  const cache = await caches.open(STATIC_CACHE);
  await Promise.allSettled(
    [...assets].map(async (asset) => {
      if (await cache.match(asset)) return;
      const response = await fetch(asset);
      if (response.ok) await cache.put(asset, response);
    })
  );
}

async function precachePage(path) {
  const response = await fetch(path, { cache: "reload" });
  if (!isCacheablePage(response)) throw new Error(`Precache failed for ${path}`);
  const shell = await caches.open(SHELL_CACHE);
  await shell.put(pageKey(new URL(path, self.location.origin)), response.clone());
  // Without the page's JS/CSS the cached HTML would render but never become interactive.
  await precacheStaticAssets(await response.text());
}

async function precacheAll() {
  // Precache critical brand assets so they are guaranteed to exist offline.
  const imageCache = await caches.open(IMAGE_CACHE);
  await Promise.allSettled(
    CRITICAL_IMAGES.map(async (img) => {
      try {
        const response = await fetch(img, { cache: "reload" });
        if (response.ok) await imageCache.put(new Request(img), response);
      } catch {
        // Non-blocking fallback
      }
    })
  );

  // The offline fallback is mandatory: failing here aborts install so it is retried later.
  await precachePage(OFFLINE_URL);
  await Promise.allSettled(PRECACHE_PATHS.filter((p) => p !== OFFLINE_URL).map(precachePage));
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheAll().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n.startsWith("mareona-") && !ACTIVE_CACHES.includes(n)).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

async function offlineFallback() {
  const cache = await caches.open(SHELL_CACHE);
  return (await cache.match(pageKey(new URL(OFFLINE_URL, self.location.origin)))) || Response.error();
}

/**
 * Network-first with a short timeout: on a saturated stadium connection a cached
 * copy beats waiting, while the network request keeps running to refresh the cache.
 */
async function handleNavigation(event) {
  const url = new URL(event.request.url);

  if (!isOfflineCapable(url.pathname)) {
    try {
      return await fetch(event.request);
    } catch {
      return offlineFallback();
    }
  }

  const cache = await caches.open(SHELL_CACHE);
  const key = pageKey(url);
  const cached = await cache.match(key);

  const network = fetch(event.request).then((response) => {
    if (isCacheablePage(response)) cache.put(key, response.clone());
    return response;
  });
  event.waitUntil(network.catch(() => undefined));

  if (!cached) return network.catch(offlineFallback);

  const timeout = new Promise((resolve) => setTimeout(() => resolve(cached), NAVIGATION_TIMEOUT_MS));
  return Promise.race([network, timeout]).catch(() => cached);
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    await trimCache(cacheName, maxEntries);
  }
  return response;
}

async function staleWhileRevalidate(event, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request);
  const refresh = fetch(event.request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(event.request, response.clone());
        await trimCache(cacheName, maxEntries);
      }
      return response;
    })
    .catch(() => hit || Response.error());
  event.waitUntil(refresh);
  return hit || refresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, MAX_STATIC_ENTRIES));
    return;
  }

  if (
    IMAGE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
    CRITICAL_IMAGES.includes(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(event, IMAGE_CACHE, MAX_IMAGE_ENTRIES));
  }
});
