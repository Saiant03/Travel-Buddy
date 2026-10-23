const CACHE_VERSION = '__CACHE_VERSION__';
const CACHE_NAME = `travel-buddy-shell-${CACHE_VERSION}`;
const PRECACHE_URLS = JSON.parse('__PRECACHE_URLS_JSON__') as string[];
const ALLOWED_PUBLIC_PATHS = new Set(PRECACHE_URLS);
type ExtendableEventLike = Event & { waitUntil(promise: Promise<unknown>): void };
type FetchEventLike = ExtendableEventLike & {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
};
type ServiceWorkerScope = typeof globalThis & {
  skipWaiting(): Promise<void>;
  clients: { claim(): Promise<void> };
};

const serviceWorker = globalThis as ServiceWorkerScope;

serviceWorker.addEventListener('install', (rawEvent) => {
  const event = rawEvent as ExtendableEventLike;
  event.waitUntil(Promise.all([
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
    serviceWorker.skipWaiting(),
  ]));
});

serviceWorker.addEventListener('activate', (rawEvent) => {
  const event = rawEvent as ExtendableEventLike;
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('travel-buddy-shell-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ))
      .then(() => serviceWorker.clients.claim()),
  );
});

serviceWorker.addEventListener('fetch', (rawEvent) => {
  const event = rawEvent as FetchEventLike;
  const request = event.request;
  const url = new URL(request.url);
  const hasNoAuthorization = !request.headers.has('authorization');
  const isPublicShellRequest = request.method === 'GET'
    && url.origin === serviceWorker.location.origin
    && url.search === ''
    && hasNoAuthorization
    && ALLOWED_PUBLIC_PATHS.has(url.pathname);

  if (!isPublicShellRequest) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => cache.match(request, { ignoreVary: true })).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        const cacheControl = response.headers.get('cache-control')?.toLowerCase() ?? '';
        const isPublicResponse = response.ok
          && response.type === 'basic'
          && !response.headers.has('set-cookie')
          && !cacheControl.includes('private')
          && !cacheControl.includes('no-store');

        if (isPublicResponse) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
        }
        return response;
      });
    }),
  );
});
