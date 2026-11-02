import { expect, test } from '@playwright/test';

test('shows an explicit unavailable message when the Firebase configuration is missing', async ({ page }) => {
  await page.route('**/probe/public-config', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ configured: false }) }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Probă tehnică pentru server' })).toBeVisible();
  await expect(page.getByText(/configurarea reală nu este completă/i)).toBeVisible();
  await expect(page.getByLabel('Parolă Alpha')).toBeDisabled();
});


test('keeps forms disabled when public config contains extra private fields', async ({ page }) => {
  await page.route('**/probe/public-config', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ firebaseProjectId: 'travel-buddy-test', firebaseWebApiKey: 'AIza-public-test', allowedUid: 'private-uid' }),
  }));
  await page.goto('/');
  await expect(page.getByText(/configurarea reală nu este completă/i)).toBeVisible();
  await expect(page.getByLabel('Parolă Alpha')).toBeDisabled();
});

test('signs in with Chromium native fetch and intercepted Firebase responses', async ({ page }) => {
  await page.route('**/probe/public-config', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ firebaseProjectId: 'travel-buddy-test', firebaseWebApiKey: 'AIza-public-test' }),
  }));
  await page.route('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ localId: 'synthetic-alpha-uid', idToken: 'synthetic-alpha-token', refreshToken: 'ignored', expiresIn: '3600' }),
  }));
  await page.route('https://identitytoolkit.googleapis.com/v1/accounts:lookup?**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ users: [{ localId: 'synthetic-alpha-uid', email: 'alpha@example.test', emailVerified: true }] }),
  }));

  await page.goto('/');
  await expect(page.getByText(/configurarea Firebase este disponibilă/i)).toBeVisible();
  await page.getByLabel('Email Alpha').fill('alpha@example.test');
  await page.getByLabel('Parolă Alpha').fill('synthetic-password');
  await page.getByRole('button', { name: 'Autentifică Alpha' }).click();

  await expect(page.locator('.slot-form[data-slot="alpha"] .session')).toHaveText('Autentificat · email confirmat');
});

test('fails closed when the public config request stalls', async ({ page }) => {
  let releaseStall: (() => void) | undefined;
  await page.addInitScript(() => {
    const originalTimeout = AbortSignal.timeout.bind(AbortSignal);
    Object.defineProperty(AbortSignal, 'timeout', {
      configurable: true,
      value: (milliseconds: number) => originalTimeout(Math.min(milliseconds, 30)),
    });
  });
  await page.route('**/probe/public-config', async (route) => {
    await new Promise<void>((resolve) => { releaseStall = resolve; });
    await route.abort().catch(() => undefined);
  });
  await page.goto('/');
  try {
    await expect(page.getByText(/configurarea reală nu este completă/i)).toBeVisible({ timeout: 1_000 });
    await expect(page.getByLabel('Parolă Alpha')).toBeDisabled();
  } finally {
    releaseStall?.();
  }
});

test('clears the password before a pending sign-in request can finish', async ({ page }) => {
  let releasePending: (() => void) | undefined;
  let releaseSignIn: (() => Promise<void>) | undefined;
  let signalRequestStarted: (() => void) | undefined;
  const requestStarted = new Promise<void>((resolve) => { signalRequestStarted = resolve; });
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, location.href);
      if (url.hostname === 'identitytoolkit.googleapis.com') return originalFetch('/probe-auth-mock', init);
      return originalFetch(input, init);
    };
  });
  await page.route('**/*', async (route) => {
    if (route.request().url().includes('/probe/public-config')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ firebaseProjectId: 'travel-buddy-test', firebaseWebApiKey: 'AIza-public-test' }) });
    } else if (route.request().url().includes('/probe-auth-mock')) {
      signalRequestStarted?.();
      releaseSignIn = () => route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'INVALID_LOGIN_CREDENTIALS' } }),
      });
      await new Promise<void>((resolve) => { releasePending = resolve; });
    } else { await route.continue(); }
  });
  await page.goto('/');
  await expect(page.getByText(/configurarea Firebase este disponibilă/i)).toBeVisible();
  await page.getByLabel('Email Alpha').fill('alpha@example.test');
  await page.getByLabel('Parolă Alpha').fill('never-render-this-password');
  await page.getByRole('button', { name: 'Autentifică Alpha' }).click();
  await requestStarted;
  await expect(page.getByLabel('Parolă Alpha')).toHaveValue('');
  expect(await page.locator('body').innerText()).not.toContain('never-render-this-password');
  await page.getByRole('button', { name: 'Deconectează și șterge rezultatele' }).click();
  await expect(page.getByLabel('Email Alpha')).toHaveValue('');
  await expect(page.locator('#results')).toBeEmpty();
  if (!releaseSignIn) throw new Error('sign-in request did not start');
  releasePending?.();
  await releaseSignIn().catch(() => undefined);
  await expect(page.locator('#results')).toBeEmpty();
  await expect(page.getByText('Neautentificat').first()).toBeVisible();
});

test('keeps the controls usable on a narrow phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/probe/public-config', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ configured: false }) }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Probă tehnică pentru server' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Deconectează și șterge rezultatele' })).toBeVisible();
});
