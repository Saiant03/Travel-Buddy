import { expect, test, type Page } from '@playwright/test';

async function open(page: Page) {
  await page.goto('/generation');
  await expect(page.getByRole('heading', { name: 'Atelierul generării locale' })).toBeVisible();
}

async function chooseAndStart(page: Page, scenario = 'success') {
  await page.getByLabel('Scenariu demonstrativ').selectOption(scenario);
  await page.getByRole('button', { name: 'Pornește generarea' }).click();
}

async function runSteps(page: Page, count: number) {
  for (let index = 0; index < count; index += 1) {
    await page.getByRole('button', { name: 'Execută următorul pas local' }).click();
  }
}

test('generation is reachable from home through an explicit link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Deschide demonstrația generării' }).click();
  await expect(page.getByRole('heading', { name: 'Atelierul generării locale' })).toBeVisible();
  await expect(page.getByText(/doar în memorie/)).toBeVisible();
});

test('start creates a queued job without running any stage automatically', async ({ page }) => {
  await open(page);
  await expect(page.getByRole('status')).not.toContainText('În coadă');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  await chooseAndStart(page);
  await expect(page.getByRole('status')).toContainText('În coadă');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
});

test('selected scenario survives navigation before starting', async ({ page }) => {
  await open(page);
  await page.getByLabel('Scenariu demonstrativ').selectOption('partial');
  await page.getByRole('link', { name: 'Acasă' }).click();
  await page.getByRole('link', { name: 'Deschide demonstrația generării' }).click();
  await expect(page.getByLabel('Scenariu demonstrativ')).toHaveValue('partial');
});

test('one explicit next-step click completes exactly one local stage', async ({ page }) => {
  await open(page);
  await chooseAndStart(page);
  await expect(page.getByRole('status')).toContainText('În coadă');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  await page.getByRole('button', { name: 'Execută următorul pas local' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
  await expect(page.getByText('Organizare simulată')).toHaveAttribute('data-complete', 'false');
});

test('current simulated stage is announced until the attempt ends', async ({ page }) => {
  await open(page);
  await chooseAndStart(page);
  await expect(page.getByText('Căutare simulată')).toHaveAttribute('aria-current', 'step');
  await runSteps(page, 1);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
  await expect(page.getByText('Organizare simulată')).toHaveAttribute('aria-current', 'step');
  await runSteps(page, 1);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '2');
  await expect(page.getByText('Verificare simulată')).toHaveAttribute('aria-current', 'step');
  await runSteps(page, 1);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '3');
  await expect(page.locator('.generation-stages [aria-current="step"]')).toHaveCount(0);
});

test('fictional source address is visible as inert text', async ({ page }) => {
  await open(page);
  await chooseAndStart(page);
  await runSteps(page, 3);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '3');
  await expect(page.getByText('https://source.example.invalid/demo')).toBeVisible();
  await expect(page.getByRole('link', { name: /source\.example\.invalid/ })).toHaveCount(0);
});

test('complete status says simulation ended and does not claim a confirmed plan', async ({ page }) => {
  await open(page);
  await chooseAndStart(page);
  await runSteps(page, 3);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '3');
  await expect(page.getByRole('status')).toContainText('Simulare încheiată');
  await expect(page.getByText('Planul nu este confirmat.')).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '3');
});

test('complete result explicitly says the plan is not confirmed', async ({ page }) => {
  await open(page);
  await chooseAndStart(page);
  await runSteps(page, 3);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '3');
  await expect(page.getByText('Planul nu este confirmat.')).toBeVisible();
});

for (const scenario of ['success', 'partial'] as const) {
  test(`${scenario} result states that no itinerary was saved or applied`, async ({ page }) => {
    await open(page);
    await chooseAndStart(page, scenario);
    await runSteps(page, 3);
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', '3');
    await expect(page.getByText('Niciun itinerar nu a fost salvat sau aplicat.')).toBeVisible();
  });
}

test('partial output remains distinct and identifies a missing day', async ({ page }) => {
  await open(page);
  await chooseAndStart(page, 'partial');
  await runSteps(page, 3);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '3');
  await expect(page.getByRole('status')).toContainText('incomplet');
  await expect(page.getByText(/Zi fictivă 2/)).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '3');
});

test('partial result identifies the missing fictional day', async ({ page }) => {
  await open(page);
  await chooseAndStart(page, 'partial');
  await runSteps(page, 3);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '3');
  await expect(page.getByText(/Zi fictivă 2/)).toBeVisible();
});

test('invalid verification fails at two of three completed stages', async ({ page }) => {
  await open(page);
  await chooseAndStart(page, 'invalid_result');
  await runSteps(page, 3);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '2');
  await expect(page.getByRole('status')).not.toContainText('următoarea acțiune');
  await expect(page.getByRole('button', { name: 'Execută următorul pas local' })).toBeDisabled();
  await expect(page.getByRole('alert')).toContainText('nu a trecut validarea');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '2');
});

for (const [scenario, errorText] of [
  ['unavailable', 'Serviciul simulat nu este disponibil'],
  ['timeout', 'Etapa a expirat în simulare'],
  ['quota_exhausted', 'Cota simulată s-a epuizat'],
] as const) {
  test(`${scenario} stays a distinct simulated failure`, async ({ page }) => {
    await open(page);
    await chooseAndStart(page, scenario);
    await page.getByRole('button', { name: 'Execută următorul pas local' }).click();
    await expect(page.getByRole('status')).not.toContainText('În coadă');
    await expect(page.getByRole('status')).not.toContainText('următoarea acțiune');
    await expect(page.getByRole('button', { name: 'Execută următorul pas local' })).toBeDisabled();
    await expect(page.getByRole('alert')).toContainText(errorText);
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  });
}

test('retry is a separate manual action and queues without executing', async ({ page }) => {
  await open(page);
  await chooseAndStart(page, 'unavailable');
  await page.getByRole('button', { name: 'Execută următorul pas local' }).click();
  await expect(page.getByRole('alert')).toContainText('Serviciul simulat nu este disponibil');
  await page.getByRole('button', { name: 'Reîncearcă manual' }).click();
  await expect(page.getByRole('status')).toContainText('În coadă');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
});

test('quota exhaustion does not offer retry', async ({ page }) => {
  await open(page);
  await chooseAndStart(page, 'quota_exhausted');
  await page.getByRole('button', { name: 'Execută următorul pas local' }).click();
  await expect(page.getByRole('alert')).toContainText('Cota simulată s-a epuizat');
  await expect(page.getByRole('button', { name: 'Reîncearcă manual' })).toHaveCount(0);
});

for (const [scenario, message, steps] of [
  ['invalid_result', 'nu a trecut validarea', 3],
  ['unavailable', 'Serviciul simulat nu este disponibil', 1],
  ['timeout', 'Etapa a expirat în simulare', 1],
  ['quota_exhausted', 'Cota simulată s-a epuizat', 1],
] as const) {
  test(`${scenario} can recover by explicitly starting a success scenario`, async ({ page }) => {
    await open(page);
    await chooseAndStart(page, scenario);
    await runSteps(page, steps);
    await expect(page.getByRole('alert')).toContainText(message);
    await page.getByLabel('Scenariu demonstrativ').selectOption('success');
    await page.getByRole('button', { name: 'Pornește o încercare nouă' }).click();
    await expect(page.getByRole('status')).toContainText('În coadă');
    await runSteps(page, 3);
    await expect(page.getByRole('status')).toContainText('Simulare încheiată');
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', '3');
  });
}

test('explicit new attempt clears the prior result', async ({ page }) => {
  await open(page);
  await chooseAndStart(page);
  await runSteps(page, 3);
  await expect(page.getByRole('heading', { name: 'Itinerar fictiv' })).toBeVisible();
  await page.getByRole('button', { name: 'Pornește o încercare nouă' }).click();
  await expect(page.getByRole('heading', { name: 'Itinerar fictiv' })).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('În coadă');
});

test('job progress survives in-app navigation', async ({ page }) => {
  await open(page);
  await chooseAndStart(page);
  await page.getByRole('button', { name: 'Execută următorul pas local' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
  await page.getByRole('link', { name: 'Acasă' }).click();
  await page.getByRole('link', { name: 'Deschide demonstrația generării' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
});

test('language change preserves generation progress', async ({ page }) => {
  await open(page);
  await chooseAndStart(page);
  await page.getByRole('button', { name: 'Execută următorul pas local' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
  await page.getByLabel('Limba').selectOption('en');
  await expect(page.getByRole('heading', { name: 'Local generation workshop' })).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Steps completed' })).toHaveAttribute('value', '1');
});

test('reload resets job and language to Romanian', async ({ page }) => {
  await open(page);
  await chooseAndStart(page);
  await page.getByRole('button', { name: 'Execută următorul pas local' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
  await page.getByLabel('Limba').selectOption('en');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Atelierul generării locale' })).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Etape executate' })).toHaveAttribute('value', '0');
  await expect(page.getByLabel('Limba')).toHaveValue('ro');
});

test('fixture labels follow the selected language without rerunning a stage', async ({ page }) => {
  await open(page);
  await chooseAndStart(page);
  await runSteps(page, 3);
  await expect(page.getByText('Loc fictiv 1')).toBeVisible();
  await page.getByLabel('Limba').selectOption('en');
  await expect(page.getByText('Fictional place 1')).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Steps completed' })).toHaveAttribute('value', '3');
});
