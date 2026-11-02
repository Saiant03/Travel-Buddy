const CACHE_NAME = `travel-buddy-offline-probe-${'__CACHE_VERSION__'}`;
const PRECACHE_SOURCE = '__PRECACHE_URLS_JSON__';
const precacheUrls = JSON.parse(PRECACHE_SOURCE);
const ALLOWED_PUBLIC_PATHS = new Set(precacheUrls.map((path) => new URL(path, self.location.origin).pathname));

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(precacheUrls)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(
    names.filter((name) => name.startsWith('travel-buddy-offline-probe-') && name !== CACHE_NAME)
      .map((name) => caches.delete(name)),
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const isPublicShellRequest = request.method === 'GET'
    && url.origin === self.location.origin
    && url.search === ''
    && !request.headers.has('authorization')
    && ALLOWED_PUBLIC_PATHS.has(url.pathname);
  if (!isPublicShellRequest) return;

  event.respondWith(caches.open(CACHE_NAME).then(async (cache) => {
    const cached = await cache.match(request, { ignoreVary: true }) || (request.mode === 'navigate' ? await cache.match('/', { ignoreVary: true }) : undefined);
    if (cached) return cached;
    const response = await fetch(request);
    const cacheControl = response.headers.get('cache-control')?.toLowerCase() ?? '';
    if (response.ok && response.type === 'basic' && !response.headers.has('set-cookie') && !cacheControl.includes('private') && !cacheControl.includes('no-store')) {
      event.waitUntil(cache.put(request, response.clone()));
    }
    return response;
  }));
});
