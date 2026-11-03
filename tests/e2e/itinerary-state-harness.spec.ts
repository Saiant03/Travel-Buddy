import { test, expect } from '@playwright/test';
test('unknown selections are safe and can return to a day', async ({ page }) => {
  await page.goto('/tests/fixtures/itinerary-harness.html');
  await page.getByRole('button', { name: 'Inject unknown day' }).click();
  await expect(page.getByText('Ziua selectată nu este disponibilă.')).toBeVisible();
  await page.getByRole('button', { name: 'Ziua 1' }).click();
  await page.getByRole('button', { name: 'Inject unknown stop' }).click();
  await expect(page.getByText('Oprirea selectată nu este disponibilă.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fictional Zinnia Workshop' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ziua 1' }).click();
  await expect(page.getByText('Fictional Zinnia Workshop', { exact: true })).toBeVisible();
});
test('unknown day offers explicit return to itinerary', async ({ page }) => {
  await page.goto('/tests/fixtures/itinerary-harness.html');
  await page.getByRole('button', { name: 'Inject unknown day' }).click();
  await expect(page.getByRole('button', { name: 'Revino la itinerar' })).toBeVisible();
  await page.getByRole('button', { name: 'Revino la itinerar' }).click();
  await expect(page.getByText('Fictional Zinnia Workshop', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Itinerar demonstrativ' })).toBeFocused();
});
test('unknown stop offers explicit return to the day list', async ({ page }) => {
  await page.goto('/tests/fixtures/itinerary-harness.html');
  await page.getByRole('button', { name: 'Ziua 2' }).click();
  await page.getByRole('button', { name: 'Inject unknown stop' }).click();
  await expect(page.getByRole('button', { name: 'Revino la lista zilei' })).toBeVisible();
  await page.getByRole('button', { name: 'Revino la lista zilei' }).click();
  await expect(page.getByText('Fictional Maple Lantern Studio', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Itinerar demonstrativ' })).toBeFocused();
});
