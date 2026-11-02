import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, expect, chromium, type BrowserContext, type Page } from '@playwright/test';

async function openPersistentProfile(profileDir: string, offline = false): Promise<BrowserContext> {
  return chromium.launchPersistentContext(profileDir, {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    headless: true,
    serviceWorkers: 'allow',
    offline,
    args: ['--no-sandbox'],
  });
}

async function controlledPage(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  page.on('pageerror', (error) => { console.error(`PAGE_ERROR: ${error.message}`); });
  page.on('console', (message) => { if (message.type() === 'error') console.error(`BROWSER_CONSOLE: ${message.text()}`); });
  page.on('requestfailed', (request) => { console.error(`REQUEST_FAILED: ${request.url()} ${request.failure()?.errorText}`); });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Proba locală P12-A' })).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await expect(page.locator('#shell-state')).toContainText('service worker activ');
  return page;
}

test('manual save survives a full Chromium cold launch offline with its photo, and interrupted update keeps old revision', async ({ browserName }, testInfo) => {
  expect(browserName).toBe('chromium');
  const profileDir = await mkdtemp(join(tmpdir(), 'travel-buddy-offline-'));
  let context: BrowserContext | undefined;
  try {
    context = await openPersistentProfile(profileDir);
    let page = await controlledPage(context);

    await page.getByRole('button', { name: 'Salvează fixture-ul' }).click();
    await expect(page.locator('#snapshot-state')).toContainText('Fixture salvată local și verificată: revizia 1.');
    await expect(page.locator('#photo-state')).toContainText('octeți citiți din IndexedDB');
    await expect.poll(() => page.locator('#fixture-photo').evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(480);

    await context.close();
    context = undefined;
    context = await openPersistentProfile(profileDir, true);
    page = await controlledPage(context);
    await expect(page.locator('#snapshot-state')).toContainText('revizia 1');
    await expect(page.locator('#photo-state')).toContainText('octeți citiți din IndexedDB');
    await expect.poll(() => page.locator('#fixture-photo').evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(480);
    await expect(page.locator('#connection')).toContainText('offline');

    await page.getByRole('button', { name: 'Simulează update întrerupt' }).click();
    await expect(page.locator('#snapshot-state')).toContainText('revizia 1 rămâne activă');
    await expect(page.locator('#snapshot-state')).toContainText('revizia 1');
    await expect(page.locator('#photo-state')).toContainText('octeți citiți din IndexedDB');
    await testInfo.attach('offline-probe-result', {
      body: 'Persistent Chromium profile cold-launched with offline emulation: fixture revision 1 and local JPEG were available; incomplete revision 2 did not replace the active pointer.',
      contentType: 'text/plain',
    });
  } finally {
    await context?.close();
    await rm(profileDir, { recursive: true, force: true });
  }
});
