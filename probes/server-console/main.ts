import { ProbeConsole } from './controller.js';
import './style.css';

declare const __PROBE_SOURCE_HASH__: string;

type Slot = 'alpha' | 'beta';
type PublicConfig = { firebaseProjectId: string; firebaseWebApiKey: string };

function parsePublicConfig(value: unknown): PublicConfig | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const entries = Object.entries(value);
  if (entries.length !== 2) return undefined;
  const config = value as Record<string, unknown>;
  const projectId = config.firebaseProjectId;
  const apiKey = config.firebaseWebApiKey;
  if (typeof projectId !== 'string' || !/^[a-z0-9](?:[a-z0-9-]{4,28})[a-z0-9]$/.test(projectId)) return undefined;
  if (typeof apiKey !== 'string' || apiKey.length === 0 || apiKey.length > 512 || apiKey !== apiKey.trim() ||
      ['replace-me', 'placeholder', 'synthetic'].some((marker) => apiKey.toLowerCase().includes(marker))) return undefined;
  if (!Object.hasOwn(config, 'firebaseProjectId') || !Object.hasOwn(config, 'firebaseWebApiKey')) return undefined;
  return { firebaseProjectId: projectId, firebaseWebApiKey: apiKey };
}

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('console_mount_missing');

app.innerHTML = `
  <div class="page">
    <p class="brand">Travel Buddy · verificare tehnică</p>
    <h1>Probă tehnică pentru server</h1>
    <p>Acest panou separat verifică accesul la date private, confirmarea unei propuneri și răspunsul serverului la o sarcină controlată. Folosește numai baza D1 dedicată acestei probe.</p>
    <p class="notice" id="config-status" role="status">Se verifică dacă această probă este configurată…</p>
    <section class="card"><h2>Conturile aprobate</h2>
      <div class="slots">
        ${slotForm('alpha', 'Alpha')}
        ${slotForm('beta', 'Beta')}
      </div>
    </section>
    <section class="card"><h2>Verificări</h2>
      <p class="muted">Confirmă fiecare adresă din emailul primit, apoi autentifică din nou contul. Verificările accesului, CAS și SQL se activează după confirmarea ambelor conturi; CPU se activează după confirmarea contului Alpha.</p>
      <div class="actions">
        <button id="access" disabled>Verifică accesul privat</button>
        <button id="cas" disabled>Verifică confirmarea propunerii</button>
        <button id="cpu" disabled>Verifică sarcina serverului</button>
        <button id="sql" class="secondary" disabled>Descarcă SQL pentru o bază D1 nouă</button>
        <button id="logout" class="danger">Deconectează și șterge rezultatele</button>
      </div>
    </section>
    <section class="card"><h2>Rezultatul verificărilor</h2><div id="results" class="checks" aria-live="polite"></div></section>
    <p class="muted">Această probă separată nu salvează date în browser: nu folosește stocarea locală, baza browserului sau service worker. Raportul descărcat conține numai rezultate de verificare și identificatori de cereri.</p>
  </div>`;

function slotForm(slot: Slot, name: string): string {
  return `<form class="slot-form" data-slot="${slot}">
    <h2>Cont ${name}</h2>
    <label>Email ${name}<input name="email" type="email" autocomplete="username" required disabled /></label>
    <label>Parolă ${name}<input name="password" type="password" autocomplete="current-password" required disabled /></label>
    <div class="actions"><button type="submit" disabled>Autentifică ${name}</button><button type="button" class="secondary verify" disabled>Trimite emailul de confirmare</button></div>
    <p class="muted session" aria-live="polite">Neautentificat</p>
  </form>`;
}

const configStatus = document.querySelector<HTMLElement>('#config-status')!;
const resultPanel = document.querySelector<HTMLElement>('#results')!;
const logoutButton = document.querySelector<HTMLButtonElement>('#logout')!;
let probe: ProbeConsole | undefined;
let ready = false;
let busy = false;
let epoch = 0;

function forms(): HTMLFormElement[] { return [...document.querySelectorAll<HTMLFormElement>('.slot-form')]; }
function refreshControls(): void {
  const active = ready && !busy && Boolean(probe);
  for (const form of forms()) {
    const slot = form.dataset.slot as Slot;
    form.querySelectorAll<HTMLInputElement>('input').forEach((input) => input.disabled = !active);
    const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    submit.disabled = !active;
    const verify = form.querySelector<HTMLButtonElement>('.verify')!;
    verify.disabled = !active || !probe?.hasSession(slot) || probe.isVerified(slot);
  }
  const bothVerified = active && probe!.isVerified('alpha') && probe!.isVerified('beta');
  document.getElementById('access')!.toggleAttribute('disabled', !bothVerified);
  document.getElementById('cas')!.toggleAttribute('disabled', !bothVerified);
  document.getElementById('sql')!.toggleAttribute('disabled', !bothVerified);
  document.getElementById('cpu')!.toggleAttribute('disabled', !active || !probe!.isVerified('alpha'));
}
function clearPasswords(): void { forms().forEach((form) => { const input = form.elements.namedItem('password'); if (input instanceof HTMLInputElement) input.value = ''; }); }
function safeMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';
  const messages: Record<string, string> = {
    invalid_credentials: 'Datele de autentificare nu au fost acceptate.',
    sign_in_failed: 'Datele de autentificare nu au fost acceptate.',
    sign_in_required: 'Autentifică acest cont pentru a continua.',
    already_verified: 'Adresa de email este deja confirmată.',
    verification_send_failed: 'Emailul de confirmare nu a putut fi trimis.',
    duplicate_account: 'Cele două conturi trebuie să fie conturi diferite.',
    signed_out: 'Operația a fost anulată prin deconectare.',
    two_verified_sessions_required: 'Autentifică și confirmă prin email ambele conturi.',
    verified_alpha_required: 'Contul Alpha trebuie confirmat înainte de această verificare.',
  };
  return messages[code] ?? 'Operația nu a putut fi încheiată. Verifică setările probei și încearcă din nou.';
}
function drawResult(title: string, value: unknown): void {
  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify({ title, result: value }, null, 2);
  resultPanel.replaceChildren(pre);
}
function downloadReport(value: unknown): void {
  const blob = new Blob([JSON.stringify({ buildHash: __PROBE_SOURCE_HASH__, checks: value }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'travel-buddy-probe-report.json';
  link.click();
  URL.revokeObjectURL(link.href);
}
async function runAction(action: () => Promise<unknown>, report = false): Promise<void> {
  if (!probe || busy) return;
  busy = true;
  const currentEpoch = epoch;
  refreshControls();
  resultPanel.textContent = 'Verificarea rulează…';
  try {
    const value = await action();
    if (currentEpoch !== epoch) return;
    drawResult('Verificare încheiată', value);
    if (report) downloadReport(value);
  } catch (error) {
    if (currentEpoch === epoch) drawResult('Verificarea s-a oprit', { message: safeMessage(error) });
  } finally {
    if (currentEpoch === epoch) { busy = false; refreshControls(); }
  }
}

for (const form of forms()) {
  const slot = form.dataset.slot as Slot;
  const session = form.querySelector<HTMLElement>('.session')!;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!probe || busy) return;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const formEpoch = epoch;
    clearPasswords();
    void runAction(async () => {
      const summary = await probe!.signIn(slot, email, password);
      if (formEpoch !== epoch) return summary;
      session.textContent = summary.signedIn ? summary.emailVerified ? 'Autentificat · email confirmat' : 'Autentificat · email neconfirmat' : 'Neautentificat';
      return summary;
    });
  });
  form.querySelector<HTMLButtonElement>('.verify')!.addEventListener('click', () => {
    void runAction(async () => { await probe!.sendVerification(slot); return { message: 'Emailul de confirmare a fost solicitat.' }; });
  });
}

logoutButton.addEventListener('click', () => {
  epoch += 1;
  probe?.signOut();
  busy = false;
  clearPasswords();
  resultPanel.replaceChildren();
  forms().forEach((form) => {
    const session = form.querySelector<HTMLElement>('.session'); if (session) session.textContent = 'Neautentificat';
    const email = form.elements.namedItem('email'); if (email instanceof HTMLInputElement) email.value = '';
  });
  refreshControls();
});

document.querySelector('#access')!.addEventListener('click', () => void runAction(() => probe!.runAccessChecks(), true));
document.querySelector('#cas')!.addEventListener('click', () => void runAction(() => probe!.runCasChecks(), true));
document.querySelector('#cpu')!.addEventListener('click', () => void runAction(() => probe!.runCpuChecks(), true));
document.querySelector('#sql')!.addEventListener('click', () => {
  if (!probe || busy) return;
  try {
    const sql = probe.createSeedSql();
    const blob = new Blob([sql], { type: 'text/sql' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'travel-buddy-probe-seed.sql'; link.click(); URL.revokeObjectURL(link.href);
    drawResult('Fișier SQL pregătit', { message: 'Aplică o singură dată, numai în baza D1 nouă dedicată probei.' });
  } catch (error) { drawResult('Descărcarea SQL nu a pornit', { message: safeMessage(error) }); }
});

fetch('/probe/public-config', {
  cache: 'no-store',
  credentials: 'omit',
  redirect: 'error',
  signal: AbortSignal.timeout(8_000),
}).then(async (response) => {
  if (!response.ok) throw new Error('public_configuration_unavailable');
  const config = parsePublicConfig(await response.json());
  if (!config) throw new Error('public_configuration_invalid');
  probe = new ProbeConsole({ apiKey: config.firebaseWebApiKey, projectId: config.firebaseProjectId, origin: location.origin, buildHash: __PROBE_SOURCE_HASH__ });
  ready = true;
  configStatus.textContent = 'Configurarea Firebase este disponibilă. Autentificarea pornește numai după ce apeși butonul pentru cont.';
  configStatus.dataset.kind = 'success';
  refreshControls();
}).catch(() => {
  configStatus.textContent = 'Configurarea reală nu este completă. Formularele rămân dezactivate până când proiectul Firebase și setările probei sunt configurate.';
  configStatus.dataset.kind = 'error';
});
