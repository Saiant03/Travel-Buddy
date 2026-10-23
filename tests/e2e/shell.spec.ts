import { expect, test } from '@playwright/test';

test('first visit precaches only the public shell for an offline launch', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const origin = 'http://127.0.0.1:4173';

  try {
    await page.goto(origin);
    await expect(page.getByRole('heading', { name: 'Travel Buddy' })).toBeVisible();
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await page.evaluate(async () => {
      await fetch('/api/private');
      await fetch('/private/data');
      await fetch('/?private=1');
      await fetch('/manifest.webmanifest?private=1');
      await fetch('/manifest.webmanifest', {
        headers: { Authorization: 'Bearer synthetic-test-token' },
      });
    });

    const cacheContents = await page.evaluate(async () => {
      const names = await caches.keys();
      const shellCaches = names.filter((name) => name.startsWith('travel-buddy-shell-'));
      const entries = await Promise.all(shellCaches.map(async (name) => {
        const cache = await caches.open(name);
        return (await cache.keys()).map((request) => new URL(request.url));
      }));
      return {
        names: shellCaches,
        urls: entries.flat().map((url) => ({ path: url.pathname, query: url.search })),
      };
    });

    expect(cacheContents.names).toHaveLength(1);
    expect(cacheContents.names[0]).toMatch(/^travel-buddy-shell-[a-f0-9]{12}$/);
    expect(cacheContents.urls).toEqual(expect.arrayContaining([
      { path: '/', query: '' },
      { path: '/index.html', query: '' },
      { path: '/manifest.webmanifest', query: '' },
      { path: '/icons/icon.svg', query: '' },
      { path: '/icons/icon-192.png', query: '' },
      { path: '/icons/icon-512.png', query: '' },
      { path: '/icons/apple-touch-icon.png', query: '' },
    ]));
    expect(cacheContents.urls.some(({ path, query }) => path.startsWith('/api/') || path.startsWith('/private/') || query !== '')).toBe(false);

    await context.setOffline(true);
    const offlinePage = await context.newPage();
    await offlinePage.goto(origin);
    await expect(offlinePage.getByRole('heading', { name: 'Travel Buddy' })).toBeVisible();
    await expect(offlinePage.getByText('Shell tehnic local. Funcționalitățile aplicației nu sunt încă disponibile.')).toBeVisible();
    expect(cacheContents.urls.some(({ path }) => path.startsWith('/assets/app-'))).toBe(true);
  } finally {
    await context.close();
  }
});
