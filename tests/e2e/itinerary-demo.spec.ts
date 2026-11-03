import { test, expect } from '@playwright/test';
test('shows ordered day and explicit demonstration context', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await expect(page.getByRole('heading', { name: 'Itinerar demonstrativ' })).toBeVisible();
  await expect(page.getByText('Fictional Zinnia Workshop', { exact: true })).toBeVisible();
  await expect(page.getByText('Fictional Amber Courtyard', { exact: true })).toBeVisible();
  await expect(page.getByText('Fictional Cobalt Reading Room', { exact: true })).toBeVisible();
  await expect(page.getByText(/fictiv.*neconfirmat/i)).toBeVisible();
});
test('selects days and shows empty day', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await page.getByRole('button', { name: 'Ziua 2' }).click();
  await expect(page.getByText('Fictional Maple Lantern Studio', { exact: true })).toBeVisible();
  await expect(page.getByText('Dată neprecizată')).toBeVisible();
  await page.getByRole('button', { name: 'Ziua 3' }).click();
  await expect(page.getByText('Nu există opriri în această zi.')).toBeVisible();
});
test('opens and closes detail with focus restored', async ({ page }) => {
  await page.goto('/itinerary-demo');
  const origin = page.getByRole('button', { name: 'Detalii Fictional Zinnia Workshop' });
  await origin.click();
  const heading = page.getByRole('heading', { name: 'Fictional Zinnia Workshop' });
  await expect(heading).toBeFocused();
  await expect(page.getByText('Preț neprecizat')).toBeVisible();
  await page.getByRole('button', { name: 'Înapoi la opriri' }).click();
  await expect(origin).toBeFocused();
});
test('invalid scenario reports error and can recover', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await page.getByLabel('Scenariu').selectOption('invalid');
  await expect(page.getByText('Exemplul conține date invalide și nu poate fi afișat.')).toBeVisible();
  await page.getByRole('button', { name: 'Revino la scenariul standard' }).click();
  await expect(page.getByText('Fictional Zinnia Workshop', { exact: true })).toBeVisible();
});
test('home entry and local navigation retain selection and language', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Deschide itinerarul demonstrativ' }).click();
  await page.getByRole('button', { name: 'Ziua 2' }).click();
  await page.getByRole('button', { name: 'Detalii Fictional Maple Lantern Studio' }).click();
  await page.getByLabel('Limba').selectOption('en');
  await expect(page.getByRole('heading', { name: 'Fictional Maple Lantern Studio' })).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.getByRole('link', { name: 'Open itinerary demonstration' }).click();
  await expect(page.getByRole('heading', { name: 'Fictional Maple Lantern Studio' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Itinerar demonstrativ' })).toBeVisible();
  await expect(page.getByText('Fictional Zinnia Workshop', { exact: true })).toBeVisible();
});
test('localizes the document title', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await expect(page).toHaveTitle('Itinerar demonstrativ — Travel Buddy');
});
test('detail shows day and stop position', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await page.getByRole('button', { name: 'Detalii Fictional Amber Courtyard' }).click();
  await expect(page.getByText('Ziua 1 / Oprirea 2')).toBeVisible();
});
test('restores stop focus after leaving and returning', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await page.getByRole('button', { name: 'Detalii Fictional Zinnia Workshop' }).click();
  await page.getByRole('link', { name: 'Acasă', exact: true }).click();
  await page.getByRole('link', { name: 'Deschide itinerarul demonstrativ' }).click();
  await page.getByRole('button', { name: 'Înapoi la opriri' }).click();
  await expect(page.getByRole('button', { name: 'Detalii Fictional Zinnia Workshop' })).toBeFocused();
});
test('preserves fixture order in the list', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await expect(page.locator('.itinerary-stops li strong')).toHaveText(['Fictional Zinnia Workshop', 'Fictional Amber Courtyard', 'Fictional Cobalt Reading Room']);
});
test('changing day closes detail', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await page.getByRole('button', { name: 'Detalii Fictional Zinnia Workshop' }).click();
  await page.getByRole('button', { name: 'Ziua 2' }).click();
  await expect(page.getByText('Fictional Maple Lantern Studio', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fictional Zinnia Workshop' })).toHaveCount(0);
});
test('missing fields and unconfirmed sources are explicit', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await page.getByRole('button', { name: 'Ziua 2' }).click();
  await page.getByRole('button', { name: 'Detalii Fictional Maple Lantern Studio' }).click();
  for (const value of ['Descriere neprecizată', 'Preț neprecizat', 'Program neprecizat', 'Rezervare neprecizată', 'Surse fictive, neconfirmate']) await expect(page.getByText(value, { exact: true })).toBeVisible();
});
test('scenario and French locale survive local navigation', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await page.getByLabel('Scenariu').selectOption('invalid');
  await page.getByLabel('Limba').selectOption('fr');
  await expect(page).toHaveTitle('Itinéraire de démonstration — Travel Buddy');
  await page.getByRole('link', { name: 'Accueil', exact: true }).click();
  await page.getByRole('link', { name: 'Ouvrir l’itinéraire de démonstration' }).click();
  await expect(page.getByText('L’exemple contient des données invalides et ne peut pas être affiché.')).toBeVisible();
  await expect(page.getByLabel('Scénario')).toHaveValue('invalid');
});
test('shows the fixture source as inert text', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await page.getByRole('button', { name: 'Ziua 2' }).click();
  await page.getByRole('button', { name: 'Detalii Fictional Maple Lantern Studio' }).click();
  await expect(page.getByText('https://sources.invalid/synthetic-place-maple', { exact: true })).toBeVisible();
  await expect(page.locator('a[href*=".invalid"]')).toHaveCount(0);
});
test('detail identifies the place as fictional and unconfirmed', async ({ page }) => {
  await page.goto('/itinerary-demo');
  await page.getByRole('button', { name: 'Detalii Fictional Zinnia Workshop' }).click();
  await expect(page.locator('.itinerary-detail').getByText('Loc fictiv, neconfirmat', { exact: true })).toBeVisible();
});
for (const [locale, detail, back] of [
  ['ro', 'Detalii Fictional Zinnia Workshop', 'Înapoi la opriri'],
  ['en', 'Details Fictional Zinnia Workshop', 'Back to stops'],
  ['fr', 'Détails Fictional Zinnia Workshop', 'Retour aux arrêts'],
] as const) {
  for (const [name, width, zoom] of [['mobile', 320, 1], ['zoom', 640, 2]] as const) {
    test(`detail fits ${locale} at ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/itinerary-demo');
      if (zoom !== 1) await page.evaluate(value => { document.body.style.zoom = String(value); }, zoom);
      if (locale !== 'ro') await page.locator('#locale').selectOption(locale);
      await page.getByRole('button', { name: detail }).click();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      await expect(page.getByText('https://sources.invalid/synthetic-place-zinnia', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: back }).click();
      await expect(page.getByRole('button', { name: detail })).toBeVisible();
    });
  }
}
