import { test, expect, type Page } from '@playwright/test';

async function open(page: Page) {
  await page.goto('/place-resolution');
  await expect(page.getByRole('heading', { name: 'Identifică un loc fictiv' })).toBeVisible();
}

async function identify(page: Page, scenario = 'one') {
  await page.getByLabel('Nume sau link fictiv').fill('Exemplu');
  await page.getByLabel('Scenariu demonstrativ').selectOption(scenario);
  await page.getByRole('button', { name: 'Identifică' }).click();
}

test('zero results', async ({ page }) => {
  await open(page);
  await identify(page, 'zero');
  await expect(page.getByText(/Nicio potrivire fictivă/)).toContainText('Modifică');
  await page.getByLabel('Nume sau link fictiv').fill('Alt exemplu');
  await page.getByLabel('Scenariu demonstrativ').selectOption('one');
  await page.getByRole('button', { name: 'Identifică' }).click();
  await expect(page.getByRole('radio')).toHaveCount(1);
});

test('one result requires selection and confirmation; edit invalidates', async ({ page }) => {
  await open(page);
  await identify(page);
  await expect(page.getByRole('button', { name: 'Confirmă alegerea' })).toBeDisabled();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Confirmă alegerea' }).click();
  await expect(page.getByText('Alegere confirmată local')).toBeVisible();
  await page.getByLabel('Nume sau link fictiv').fill('Alt exemplu');
  await expect(page.getByText('Alegere confirmată local')).toBeHidden();
});

test('multiple results require explicit choice', async ({ page }) => {
  await open(page);
  await identify(page, 'multiple');
  await expect(page.getByRole('radio')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Confirmă alegerea' })).toBeDisabled();
});

for (const [scenario, reason] of [
  ['invalid_response', 'răspuns invalid'],
  ['unavailable', 'indisponibilitate'],
  ['timeout', 'timp expirat'],
  ['quota_exhausted', 'cotă epuizată'],
] as const) {
  test(`simulated ${scenario}`, async ({ page }) => {
    await open(page);
    await identify(page, scenario);
    await expect(page.getByRole('alert')).toContainText(reason);
    await page.getByLabel('Scenariu demonstrativ').selectOption('one');
    await page.getByRole('button', { name: 'Identifică' }).click();
    await expect(page.getByRole('radio')).toHaveCount(1);
  });
}

test('preserves state across navigation and language, reload resets', async ({ page }) => {
  await open(page);
  await identify(page);
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Confirmă alegerea' }).click();
  await page.getByRole('link', { name: 'Acasă' }).click();
  await page.goBack();
  await expect(page.getByText('Alegere confirmată local')).toBeVisible();
  await page.getByLabel('Limba').selectOption('en');
  await expect(page.getByText('Locally confirmed choice')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Nume sau link fictiv')).toHaveValue('');
});

test('invalid input can be corrected', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Identifică' }).click();
  await expect(page.getByRole('alert')).toContainText('nume');
  await expect(page.getByLabel('Nume sau link fictiv')).toBeFocused();
  await expect(page.getByLabel('Nume sau link fictiv')).toHaveAttribute('aria-describedby', /place-error/);
  await page.getByLabel('Nume sau link fictiv').fill('Exemplu');
  await page.getByRole('button', { name: 'Identifică' }).click();
  await expect(page.getByRole('radio')).toHaveCount(1);
});

test('unconfirmed selection survives navigation and French translation', async ({ page }) => {
  await open(page);
  await identify(page);
  await page.getByRole('radio').first().check();
  await page.getByRole('link', { name: 'Acasă' }).click();
  await page.goBack();
  await expect(page.getByRole('radio').first()).toBeChecked();
  await page.getByLabel('Limba').selectOption('fr');
  await expect(page.getByRole('heading', { name: 'Identifier un lieu fictif' })).toBeVisible();
  await expect(page.getByRole('radio').first()).toBeChecked();
});

test('keyboard can select and confirm', async ({ page }) => {
  await open(page);
  await identify(page);
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Confirmă alegerea' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Alegere confirmată local')).toBeVisible();
});

test('narrow view keeps fictional sources inert and makes no external requests', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const external: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4173/')) external.push(request.url());
  });
  await open(page);
  await page.getByLabel('Nume sau link fictiv').fill('https://example.invalid/place');
  await page.getByRole('button', { name: 'Identifică' }).click();
  await expect(page.getByText(/Sursă fictivă, inertă/)).toBeVisible();
  await expect(page.locator('a[href*=".invalid"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(external).toEqual([]);
});
