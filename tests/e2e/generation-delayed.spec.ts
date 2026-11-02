import { expect, test, type Page } from '@playwright/test';

async function beginPending(page: Page) {
  await page.goto('/tests/fixtures/generation-harness.html');
  await page.getByRole('button', { name: 'Pornește generarea' }).click();
  await expect(page.getByRole('status')).toContainText('În coadă');
  await page.getByRole('button', { name: 'Execută următorul pas local' }).click();
  await expect(page.getByRole('button', { name: 'Execută următorul pas local' })).toBeDisabled();
}

async function resolveStep(page: Page, index: number) {
  await page.evaluate((step) => (window as unknown as { resolveGenerationStep: (index: number) => void }).resolveGenerationStep(step), index);
}

test('restart allows the new attempt to run while the old step is pending', async ({ page }) => {
  await beginPending(page);
  await page.getByRole('button', { name: 'Pornește o încercare nouă' }).click();
  await expect(page.getByRole('status')).toContainText('În coadă');
  await expect(page.getByRole('button', { name: 'Execută următorul pas local' })).toBeEnabled();
});

test('a pending step updates the page after leaving and returning', async ({ page }) => {
  await beginPending(page);
  await page.getByRole('button', { name: 'Leave generation' }).click();
  await page.getByRole('button', { name: 'Return to generation' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  await resolveStep(page, 0);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
});

test('old completion does not unlock a newer pending step', async ({ page }) => {
  await beginPending(page);
  await page.getByRole('button', { name: 'Pornește o încercare nouă' }).click();
  const next = page.getByRole('button', { name: 'Execută următorul pas local' });
  await expect(next).toBeEnabled();
  await next.click();
  await expect(next).toBeDisabled();
  await resolveStep(page, 0);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  await expect(next).toBeDisabled();
  await resolveStep(page, 1);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
  await expect(next).toBeEnabled();
});
