import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.TASK8A_URL;
if (!baseURL) throw new Error('Set TASK8A_URL to the coordinator-provided preview URL before running.');
const out = path.resolve('.local/task-8a/browser-artifacts');
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium' });
const report = { startedAt: new Date().toISOString(), baseURL, serviceWorkers: 'block (main matrix)', methodology: 'CSS viewport emulation and CSS zoom; not native device zoom', cases: [], failures: [], pageErrors: [], externalAttempts: [], storageFindings: [] };

function check(condition, message, details = {}) {
  if (!condition) report.failures.push({ message, ...details });
}
async function makePage({ width = 1440, height = 900, reducedMotion = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reducedMotion ? 'reduce' : 'no-preference', serviceWorkers: 'block' });
  await context.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) { window.__task8aStorageWrites ??= []; window.__task8aStorageWrites.push({ op: 'setItem', key }); return original.call(this, key, value); };
    const originalRemove = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (key) { window.__task8aStorageWrites ??= []; window.__task8aStorageWrites.push({ op: 'removeItem', key }); return originalRemove.call(this, key); };
    const originalClear = Storage.prototype.clear;
    Storage.prototype.clear = function () { window.__task8aStorageWrites ??= []; window.__task8aStorageWrites.push({ op: 'clear' }); return originalClear.call(this); };
    const originalOpen = indexedDB.open.bind(indexedDB);
    indexedDB.open = function (...args) { window.__task8aIDBOpens ??= 0; window.__task8aIDBOpens++; return originalOpen(...args); };
    const originalTransaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (stores, mode, ...args) {
      if (mode === 'readwrite' || mode === 'versionchange') { window.__task8aIDBWrites ??= 0; window.__task8aIDBWrites++; }
      return originalTransaction.call(this, stores, mode, ...args);
    };
  });
  const page = await context.newPage();
  await page.route('**/*', async route => {
    if (new URL(route.request().url()).origin !== new URL(baseURL).origin) {
      report.externalAttempts.push({ url: route.request().url(), resourceType: route.request().resourceType() });
      await route.abort('blockedbyclient');
    } else await route.continue();
  });
  page.on('pageerror', error => report.pageErrors.push({ message: error.message, url: page.url() }));
  page.on('console', message => { if (message.type() === 'error') report.cases.push({ kind: 'console-error', text: message.text(), url: page.url() }); });
  return { context, page };
}
async function inspect(page, label) {
  return page.evaluate(label => {
    const root = document.documentElement;
    const active = document.activeElement;
    const rect = active?.getBoundingClientRect();
    const visibleFocus = !!active && active !== document.body && !!rect && rect.width > 0 && rect.height > 0 && getComputedStyle(active).visibility !== 'hidden';
    return {
      label, title: document.title, lang: root.lang,
      viewportWidth: innerWidth, clientWidth: root.clientWidth, scrollWidth: root.scrollWidth,
      horizontalOverflow: root.scrollWidth > root.clientWidth,
      h1: [...document.querySelectorAll('h1')].map(x => x.innerText), h2: [...document.querySelectorAll('h2')].map(x => x.innerText),
      activeTag: active?.tagName, activeText: active?.textContent?.trim().slice(0, 100), visibleFocus,
      focusVisible: !!active?.matches(':focus-visible'), focusOutline: active ? (() => { const s = getComputedStyle(active); return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor, boxShadow: s.boxShadow }; })() : null,
      unlabeled: [...document.querySelectorAll('button, a, input, select, textarea')].filter(el => !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !(el.labels?.length) && !el.innerText?.trim()).map(el => el.outerHTML.slice(0, 160)),
      sourceTexts: [...document.querySelectorAll('li')].map(el => el.innerText).filter(x => x.includes('sources.invalid')),
      sourceAnchors: [...document.querySelectorAll('a[href*="sources.invalid"]')].length,
      images: document.images.length, maps: document.querySelectorAll('iframe, [role="application"], [data-map]').length,
      interactive: [...document.querySelectorAll('button, a, input, select, textarea')].map(el => ({ tag: el.tagName, name: el.getAttribute('aria-label') || el.innerText || el.value || '', box: (() => { const r = el.getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height) }; })() })),
    };
  }, label);
}
async function ready(page) {
  await page.goto(new URL('/itinerary-demo', baseURL).href, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible', timeout: 8000 });
}
async function language(page, locale) { await page.locator('#locale').selectOption(locale); }
async function storeSnapshot(page, label) {
  const data = await page.evaluate(async () => ({
    localStorage: localStorage.length, sessionStorage: sessionStorage.length,
    indexedDB: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).length : 'unavailable',
    localKeys: Object.keys(localStorage), sessionKeys: Object.keys(sessionStorage), storageWrites: window.__task8aStorageWrites || [], idbOpenCalls: window.__task8aIDBOpens || 0, idbWriteTransactions: window.__task8aIDBWrites || 0,
  }));
  report.storageFindings.push({ label, ...data });
  check(data.storageWrites.length === 0, `observed Web Storage write ${label}`, { writes: data.storageWrites });
  check(data.localStorage === 0 && data.sessionStorage === 0 && data.indexedDB === 0 && data.idbOpenCalls === 0 && data.idbWriteTransactions === 0, `browser storage remains unused ${label}`, { localStorage: data.localStorage, sessionStorage: data.sessionStorage, indexedDB: data.indexedDB, idbOpenCalls: data.idbOpenCalls, idbWriteTransactions: data.idbWriteTransactions });
}
async function runCase(locale, width, view, reducedMotion = false) {
  const { context, page } = await makePage({ width, reducedMotion });
  try {
    await ready(page); await language(page, locale);
    check(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches) === reducedMotion, `reduced-motion emulation ${locale}/${width}/${view}`);
    if (view === 'day2') await page.getByRole('button', { name: new RegExp(`${locale === 'ro' ? 'Ziua' : locale === 'fr' ? 'Jour' : 'Day'} 2`) }).click();
    if (view === 'detail') {
      const name = locale === 'ro' ? 'Fictional Zinnia Workshop' : 'Fictional Zinnia Workshop';
      await page.getByRole('button', { name: new RegExp(name) }).click();
    }
    if (view === 'empty') await page.getByRole('button', { name: new RegExp(`${locale === 'ro' ? 'Ziua' : locale === 'fr' ? 'Jour' : 'Day'} 3`) }).click();
    if (view === 'invalid' || view === 'recovery') {
      await page.getByLabel(locale === 'ro' ? 'Scenariu' : locale === 'fr' ? 'Scénario' : 'Scenario').selectOption('invalid');
      if (view === 'recovery') await page.getByRole('button', { name: locale === 'ro' ? 'Revino la scenariul standard' : locale === 'fr' ? 'Revenir au scénario standard' : 'Return to standard scenario' }).click();
    }
    const info = await inspect(page, `${locale}-${width}-${view}${reducedMotion ? '-reduced' : ''}`);
    report.cases.push({ kind: 'matrix', ...info });
    check(!info.horizontalOverflow, `horizontal overflow ${info.label}`, { scrollWidth: info.scrollWidth, clientWidth: info.clientWidth });
    check(info.unlabeled.length === 0, `unlabeled controls ${info.label}`, { controls: info.unlabeled });
    const text = await page.locator('.itinerary').innerText();
    const labels = locale === 'ro' ? { day: 'Ziua', stop: 'Oprirea', noDate: 'Dată neprecizată', noPrice: 'Preț neprecizat', noHours: 'Program neprecizat', noReservation: 'Rezervare neprecizată' }
      : locale === 'fr' ? { day: 'Jour', stop: 'Arrêt', noDate: 'Date non précisée', noPrice: 'Prix non précisé', noHours: 'Horaires non précisés', noReservation: 'Réservation non précisée' }
      : { day: 'Day', stop: 'Stop', noDate: 'Date unspecified', noPrice: 'Price unspecified', noHours: 'Opening hours unspecified', noReservation: 'Reservation unspecified' };
    if (view === 'list') check(['Fictional Zinnia Workshop', 'Fictional Amber Courtyard', 'Fictional Cobalt Reading Room'].every((name, i, names) => text.indexOf(name) >= 0 && (i === 0 || text.indexOf(names[i - 1]) < text.indexOf(name))), `day 1 ordered fixture ${info.label}`);
    if (view === 'day2') check(text.includes('Fictional Maple Lantern Studio') && text.includes('Fictional Ivory Garden Room') && text.indexOf('Fictional Maple Lantern Studio') < text.indexOf('Fictional Ivory Garden Room') && text.includes(labels.noDate), `day 2 ordered/missing date ${info.label}`);
    if (view === 'detail') check(text.includes(`${labels.day} 1 / ${labels.stop} 1`) && [labels.noDate, labels.noPrice, labels.noHours, labels.noReservation].every(value => text.includes(value)), `detail context/missing fields ${info.label}`);
    if (view === 'empty') check(text.includes(locale === 'ro' ? 'Nu există opriri' : locale === 'fr' ? 'Aucun arrêt' : 'There are no stops'), `empty day copy ${info.label}`);
    if (view === 'invalid') check(!!await page.getByRole('alert').count(), `invalid scenario alert ${info.label}`);
    if (view === 'recovery') check(text.includes(locale === 'ro' ? 'Fictional Zinnia Workshop' : 'Fictional Zinnia Workshop'), `invalid scenario recovery ${info.label}`);
    if (view === 'detail') {
      check(info.sourceTexts.length > 0, `expected visible inert sources.invalid text ${info.label}`);
      check(info.sourceAnchors === 0, `sources.invalid must remain inert text ${info.label}`);
      check(info.images === 0 && info.maps === 0, `unexpected media/map in detail ${info.label}`, { images: info.images, maps: info.maps });
    }
    await storeSnapshot(page, info.label);
    if (['1440', '390'].includes(String(width)) && ['list', 'detail', 'invalid'].includes(view)) {
      await page.screenshot({ path: path.join(out, `${info.label}.png`), fullPage: true });
    }
  } catch (error) {
    report.failures.push({ message: `${locale}/${width}/${view}: ${error.message}` });
  } finally { await context.close(); }
}

for (const locale of ['ro', 'en', 'fr']) {
  for (const width of [1440, 768, 390, 320]) {
    for (const view of ['list', 'day2', 'detail', 'empty', 'invalid', 'recovery']) {
      await runCase(locale, width, view, false);
      await runCase(locale, width, view, true);
    }
  }
  for (const width of [1280, 640]) for (const view of ['list', 'detail', 'empty']) {
    const { context, page } = await makePage({ width });
    try {
      await ready(page); await language(page, locale); await page.addStyleTag({ content: 'html { zoom: 2 !important; }' });
      if (view === 'detail') await page.getByRole('button', { name: /Fictional Zinnia Workshop/ }).click();
      if (view === 'empty') await page.getByRole('button', { name: new RegExp(`${locale === 'ro' ? 'Ziua' : locale === 'fr' ? 'Jour' : 'Day'} 3`) }).click();
      const info = await inspect(page, `${locale}-${width}-zoom200-${view}`);
      report.cases.push({ kind: 'zoom', ...info, cssZoom: '200%' });
      check(!info.horizontalOverflow, `CSS zoom 200% horizontal overflow ${info.label}`, { scrollWidth: info.scrollWidth, clientWidth: info.clientWidth });
    } catch (error) { report.failures.push({ message: `CSS zoom ${locale}/${width}/${view}: ${error.message}` }); }
    finally { await context.close(); }
  }
}

// Separate keyboard/focus, route round-trip, locale, reload and PWA cache observation.
for (const locale of ['ro', 'en', 'fr']) {
  const { context, page } = await makePage();
  try {
    await ready(page); await language(page, locale);
    await page.getByRole('button', { name: /Fictional Zinnia Workshop/ }).focus();
    await page.keyboard.press('Enter');
    const detail = await inspect(page, `${locale}-keyboard-detail`); report.cases.push({ kind: 'keyboard', ...detail });
    check(detail.visibleFocus && detail.focusVisible && (detail.focusOutline.width !== '0px' || detail.focusOutline.boxShadow !== 'none') && detail.h2.length === 1, `keyboard detail focus/heading ${locale}`, detail);
    await page.getByRole('button', { name: locale === 'ro' ? 'Înapoi la opriri' : locale === 'fr' ? 'Retour aux arrêts' : 'Back to stops' }).click();
    const restored = await inspect(page, `${locale}-return-focus`); report.cases.push({ kind: 'focus-restore', ...restored });
    check(restored.visibleFocus && /Zinnia/i.test(restored.activeText || ''), `origin focus restore ${locale}`, restored);
    await page.getByRole('button', { name: new RegExp(`${locale === 'ro' ? 'Ziua' : locale === 'fr' ? 'Jour' : 'Day'} 2`) }).click();
    await page.getByRole('button', { name: /Fictional Maple Lantern Studio/ }).click();
    const nextLocale = locale === 'ro' ? 'en' : locale === 'en' ? 'fr' : 'ro';
    await language(page, nextLocale);
    let roundTrip = await inspect(page, `${locale}-day2-detail-language-${nextLocale}`);
    report.cases.push({ kind: 'route-state-before', ...roundTrip });
    check(roundTrip.h2.includes('Fictional Maple Lantern Studio') && (await page.locator('.itinerary-detail').innerText()).includes(`${nextLocale === 'ro' ? 'Ziua' : nextLocale === 'fr' ? 'Jour' : 'Day'} 2`), `day2 detail/context preserved after language change ${locale}`);
    await page.getByRole('link', { name: 'Travel Buddy' }).click();
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible', timeout: 8000 });
    await page.goBack(); await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible', timeout: 8000 });
    roundTrip = await inspect(page, `${locale}-day2-detail-route-back`);
    report.cases.push({ kind: 'route-state-after', ...roundTrip });
    check(roundTrip.h2.includes('Fictional Maple Lantern Studio') && roundTrip.lang === nextLocale && (await page.locator('.itinerary-detail').innerText()).includes(`${nextLocale === 'ro' ? 'Ziua' : nextLocale === 'fr' ? 'Jour' : 'Day'} 2`), `day2 detail/context/locale preserved after home/back ${locale}`);
    check(await page.locator('.itinerary select').inputValue() === 'standard', `scenario standard after route round-trip ${locale}`);
    await page.reload({ waitUntil: 'domcontentloaded' }); await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' });
    const reset = await inspect(page, `${locale}-reload-reset`); report.cases.push({ kind: 'reload', ...reset });
    check(reset.lang === 'ro' && reset.h2.length === 0, `reload defaults ${locale}`, reset);
    await storeSnapshot(page, `${locale}-reload-reset`);
  } catch (error) { report.failures.push({ message: `keyboard/nav/reload ${locale}: ${error.message}` }); }
  finally { await context.close(); }
}

// Service-worker observation is separate: production shell registration is inherited app behavior.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
  const page = await context.newPage();
  try {
    await page.goto(new URL('/itinerary-demo', baseURL).href, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible', timeout: 8000 });
    report.cases.push({ kind: 'service-worker-observation', registrations: await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map(r => r.scope)) });
  } catch (error) { report.failures.push({ message: `service worker observation: ${error.message}` }); }
  finally { await context.close(); }
}

report.finishedAt = new Date().toISOString();
report.counts = { cases: report.cases.filter(x => ['matrix', 'zoom', 'keyboard', 'focus-restore', 'reload', 'service-worker-observation'].includes(x.kind)).length, failures: report.failures.length, pageErrors: report.pageErrors.length, externalAttempts: report.externalAttempts.length };
await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.counts));
if (report.failures.length || report.pageErrors.length || report.externalAttempts.length) process.exitCode = 1;
await browser.close();
