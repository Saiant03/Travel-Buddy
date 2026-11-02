import { expect, test } from '@playwright/test';

test('carnetele păstrează alegeri locale și separă restricțiile', async ({ page }) => {
  await page.goto('/preferences');
  await expect(page.getByRole('heading', { name: 'Preferințele mele' })).toBeVisible();
  await expect(page.getByText('0 / 5 carnete parcurse')).toBeVisible();
  await page.getByLabel('Caută în carnet').fill('ceapa');
  const onion = page.getByRole('group', { name: 'Ceapă', exact: true });
  await expect(onion).toBeVisible();
  await onion.getByLabel('Îmi place mult', { exact: true }).first().check();
  await expect(page.getByText('1 / 5 carnete parcurse')).toBeVisible();
  await onion.getByLabel('Mănânc', { exact: true }).first().check();
  await expect(onion.getByLabel('Îmi place mult', { exact: true }).first()).not.toBeChecked();
  await onion.getByText('Detalii și precizări').click();
  const raw = onion.getByRole('group', { name: 'Crud' });
  await raw.getByLabel('Nu mănânc', { exact: true }).check();
  await expect(onion.getByLabel('Mănânc', { exact: true }).first()).toBeChecked();
  await page.getByRole('checkbox', { name: 'Nu am preferințe speciale aici' }).check();
  await expect(onion.getByLabel('Mănânc', { exact: true }).first()).not.toBeChecked();
  await onion.getByLabel('Îmi place mult', { exact: true }).first().check();
  await expect(page.getByRole('checkbox', { name: 'Nu am preferințe speciale aici' })).not.toBeChecked();
  await onion.getByRole('button', { name: 'Șterge răspunsul' }).click();
  await expect(page.getByText('0 / 5 carnete parcurse')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Nu am preferințe speciale aici' }).check();
  await page.getByRole('checkbox', { name: 'Nu am preferințe speciale aici' }).uncheck();
  await expect(page.getByText('0 / 5 carnete parcurse')).toBeVisible();
  await page.getByLabel('Caută în carnet').fill('nimic123');
  await expect(page.getByText('Nu am găsit rezultate.')).toBeVisible();
  await page.getByLabel('Caută în carnet').fill('');
  await page.getByLabel('Exemplu de aliment de evitat: arahide').check();
  await expect(page.getByLabel('Exemplu de alergie: arahide')).not.toBeChecked();
  await page.getByLabel('Exemplu de alergie: arahide').check();
  await expect(page.getByLabel('Exemplu de intoleranță: lactoză')).not.toBeChecked();
  await page.getByRole('button', { name: 'Cultură', exact: true }).click();
  await page.getByLabel('Caută în carnet').fill('ruine');
  await page.getByRole('group', { name: 'Ruine antice' }).getByLabel('Aș încerca', { exact: true }).check();
  await page.getByRole('link', { name: 'Acasă' }).click();
  await page.getByRole('link', { name: 'Preferințele mele' }).click();
  await expect(page.getByText('1 / 5 carnete parcurse')).toBeVisible();
  await page.getByLabel('Limba').selectOption('en');
  await expect(page.getByRole('heading', { name: 'My preferences' })).toBeVisible();
  await expect(page.getByText('1 / 5 notebooks explored')).toBeVisible();
  await page.getByLabel('Language').selectOption('fr');
  await expect(page.getByRole('heading', { name: 'Mes préférences' })).toBeVisible();
  await page.reload();
  await expect(page.getByText('0 / 5 carnete parcurse')).toBeVisible();
});

test('căutarea alimentară găsește rezultate în toate filele', async ({ page }) => {
  await page.goto('/preferences');
  await page.getByLabel('Caută în carnet').fill('espresso');
  await expect(page.getByRole('group', { name: 'Espresso' })).toBeVisible();
});

test('exemplul adăugat rămâne local la navigare și dispare la reîncărcare', async ({ page }) => {
  await page.goto('/preferences');
  await page.getByLabel('Denumirea exemplului').fill('Exemplu nou');
  await page.getByRole('button', { name: 'Adaugă', exact: true }).click();
  const item = page.getByRole('group', { name: 'Exemplu nou' });
  await item.getByLabel('Mănânc', { exact: true }).first().check();
  await page.getByRole('link', { name: 'Acasă' }).click();
  await page.getByRole('link', { name: 'Preferințele mele' }).click();
  await expect(item.getByLabel('Mănânc', { exact: true }).first()).toBeChecked();
  await page.reload();
  await expect(item).toHaveCount(0);
});

test('tastatură și vizualizare îngustă cu mișcare redusă', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/preferences');
  await page.getByRole('button', { name: 'Cultură', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Carnetul exploratorului' })).toBeVisible();
  await page.getByLabel('Caută în carnet').fill('stiinta');
  await expect(page.getByRole('group', { name: 'Muzee de știință' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  // CSS zoom approximates a 200% view; 640px / 2 reaches the supported 320px minimum.
  await page.setViewportSize({ width: 640, height: 844 });
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('băuturile au note fără opțiuni de preparare nepotrivite', async ({ page }) => {
  await page.goto('/preferences');
  await page.getByRole('button', { name: 'Băuturi', exact: true }).click();
  const espresso = page.getByRole('group', { name: 'Espresso', exact: true });
  await espresso.getByLabel('Mănânc', { exact: true }).first().check();
  await espresso.getByText('Detalii și precizări').click();
  await expect(espresso.getByRole('group', { name: 'Crud', exact: true })).toHaveCount(0);
  await expect(espresso.getByLabel('Notă opțională')).toBeVisible();
});

test('ștergerea cu tastatura readuce focusul la primul răspuns', async ({ page }) => {
  await page.goto('/preferences');
  const onion = page.getByRole('group', { name: 'Ceapă', exact: true });
  await onion.getByLabel('Mănânc', { exact: true }).first().check();
  const clear = onion.getByRole('button', { name: 'Șterge răspunsul' });
  await clear.focus();
  await page.keyboard.press('Enter');
  await expect(onion.getByLabel('Îmi place mult', { exact: true }).first()).toBeFocused();
  for (const label of ['Îmi place mult', 'Mănânc', 'Aș încerca', 'Nu mănânc']) {
    await expect(onion.getByLabel(label, { exact: true }).first()).not.toBeChecked();
  }
});

test('ștergerea unei precizări păstrează focusul în grupul ei', async ({ page }) => {
  await page.goto('/preferences');
  const onion = page.getByRole('group', { name: 'Ceapă', exact: true });
  await onion.getByLabel('Mănânc', { exact: true }).first().check();
  await onion.getByText('Detalii și precizări').click();
  const raw = onion.getByRole('group', { name: 'Crud', exact: true });
  await raw.getByLabel('Nu mănânc', { exact: true }).check();
  await raw.getByRole('button', { name: 'Șterge', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(raw.getByLabel('Îmi place mult', { exact: true })).toBeFocused();
  for (const label of ['Îmi place mult', 'Mănânc', 'Aș încerca', 'Nu mănânc']) {
    await expect(raw.getByLabel(label, { exact: true })).not.toBeChecked();
  }
});
