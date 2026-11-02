import { OfflineSnapshotStore } from '../offline-pwa';
import { createFixture, fixtureIdentity } from './fixture';
import './style.css';

const store = new OfflineSnapshotStore({ databaseName: 'travel-buddy-p12a-fixture-v1' });
const snapshotState = document.querySelector<HTMLElement>('#snapshot-state')!;
const photoState = document.querySelector<HTMLElement>('#photo-state')!;
const connectionState = document.querySelector<HTMLElement>('#connection')!;
const shellState = document.querySelector<HTMLElement>('#shell-state')!;
const photoElement = document.querySelector<HTMLImageElement>('#fixture-photo')!;
const buttons = [...document.querySelectorAll<HTMLButtonElement>('button')];
let photoObjectUrl: string | undefined;

function setButtonsDisabled(disabled: boolean): void {
  buttons.forEach((button) => { button.disabled = disabled; });
}

function showPhoto(blob: Blob | undefined): void {
  if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
  photoObjectUrl = undefined;
  if (!blob) {
    photoElement.removeAttribute('src');
    photoState.textContent = 'Fotografie salvată: indisponibilă în copia locală.';
    return;
  }
  photoObjectUrl = URL.createObjectURL(blob);
  photoElement.src = photoObjectUrl;
  photoState.textContent = `Fotografie salvată: ${blob.size} octeți citiți din IndexedDB.`;
}

async function reloadSnapshot(): Promise<number | null> {
  snapshotState.textContent = 'Copie locală: se citește IndexedDB…';
  try {
    const loaded = await store.load(fixtureIdentity);
    if (!loaded) {
      snapshotState.textContent = 'Copie locală: nu există încă o salvare.';
      showPhoto(undefined);
      return null;
    }
    snapshotState.textContent = `Copie locală verificată: revizia ${loaded.snapshot.revision}, salvată ${loaded.snapshot.savedAt}.`;
    showPhoto(loaded.assets[0]?.blob);
    return loaded.snapshot.revision;
  } catch (error) {
    snapshotState.textContent = `Copie locală respinsă: ${error instanceof Error ? error.message : 'eroare de integritate'}`;
    showPhoto(undefined);
    return null;
  }
}

async function saveFixture(): Promise<void> {
  setButtonsDisabled(true);
  snapshotState.textContent = 'Salvare locală în curs…';
  try {
    const fixture = await createFixture(1);
    await store.commit(fixture.snapshot, fixture.photos, fixtureIdentity);
    await reloadSnapshot();
    snapshotState.textContent = 'Fixture salvată local și verificată: revizia 1.';
  } catch (error) {
    snapshotState.textContent = `Salvarea a eșuat: ${error instanceof Error ? error.message : 'eroare necunoscută'}`;
  } finally {
    setButtonsDisabled(false);
  }
}

async function interruptUpdate(): Promise<void> {
  setButtonsDisabled(true);
  try {
    const current = await store.load(fixtureIdentity);
    if (!current) {
      snapshotState.textContent = 'Nu există o copie veche. Salvează fixture-ul înainte de proba update-ului.';
      return;
    }
    const next = await createFixture(current.snapshot.revision + 1);
    await store.commit(next.snapshot, [], fixtureIdentity);
    snapshotState.textContent = 'Eroare de probă: update-ul a fost acceptat fără fotografia obligatorie.';
  } catch (error) {
    const activeRevision = await reloadSnapshot();
    const reason = error instanceof Error ? error.message : 'eroare';
    snapshotState.textContent = activeRevision === null
      ? `Update întrerupt (${reason}); copia anterioară nu mai este disponibilă.`
      : `Update întrerupt (${reason}); revizia ${activeRevision} rămâne activă.`;
  } finally {
    setButtonsDisabled(false);
  }
}

document.querySelector('#save')!.addEventListener('click', () => { void saveFixture(); });
document.querySelector('#reload')!.addEventListener('click', () => { void reloadSnapshot(); });
document.querySelector('#interrupt')!.addEventListener('click', () => { void interruptUpdate(); });

function updateConnection(): void {
  connectionState.textContent = `Conexiune raportată de browser: ${navigator.onLine ? 'online' : 'offline'}.`;
}
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();
void reloadSnapshot();

if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(async () => {
      const registration = await navigator.serviceWorker.ready;
      shellState.textContent = `Shell public: service worker ${registration.active ? 'activ' : 'în așteptare'}; datele fixture rămân separat în IndexedDB.`;
    })
    .catch((error: unknown) => {
      shellState.textContent = `Shell public: service worker indisponibil (${error instanceof Error ? error.message : 'eroare'}).`;
    });
} else {
  shellState.textContent = 'Shell public: browserul nu oferă service worker.';
}
