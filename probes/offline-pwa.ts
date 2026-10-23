import { parseOfflineSnapshot, type OfflineSnapshot } from '../src/shared/contracts/offline';

export type SnapshotIdentity = Pick<OfflineSnapshot, 'ownerUid' | 'tripId' | 'locale' | 'sessionGeneration'>;
export type StoredPhoto = { assetId: string; blob: Blob };
export type LoadedOfflineSnapshot = { snapshot: OfflineSnapshot; assets: StoredPhoto[] };
export type OfflineSnapshotStoreOptions = { databaseName: string; indexedDB?: IDBFactory; crypto?: Crypto };

type SnapshotRecord = { key: string; snapshot: OfflineSnapshot };
type AssetRecord = { snapshotKey: string; assetId: string; checksum: string; blob: Blob };
type PointerRecord = { key: string; snapshotKey: string; identity: SnapshotIdentity; revision: number };

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) throw new Error('Snapshot contains a non-JSON value');
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const object = value as Record<string, unknown>;
  const keys = Object.keys(object).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(',')}}`;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashBlob(blob: Blob, cryptoProvider: Crypto = globalThis.crypto): Promise<string> {
  return bytesToHex(await cryptoProvider.subtle.digest('SHA-256', await blob.arrayBuffer()));
}

export async function hashSnapshot(snapshot: Omit<OfflineSnapshot, 'checksum'> | OfflineSnapshot, cryptoProvider: Crypto = globalThis.crypto): Promise<string> {
  const unsigned = Object.fromEntries(Object.entries(snapshot).filter(([key]) => key !== 'checksum'));
  const encoded = new TextEncoder().encode(canonicalJson(unsigned));
  return bytesToHex(await cryptoProvider.subtle.digest('SHA-256', encoded));
}

function identityKey(identity: SnapshotIdentity): string {
  return JSON.stringify([identity.ownerUid, identity.tripId, identity.locale, identity.sessionGeneration]);
}

function snapshotKey(identity: SnapshotIdentity, revision: number): string {
  return JSON.stringify([identity.ownerUid, identity.tripId, identity.locale, identity.sessionGeneration, revision]);
}

function sameIdentity(left: SnapshotIdentity, right: SnapshotIdentity): boolean {
  return left.ownerUid === right.ownerUid
    && left.tripId === right.tripId
    && left.locale === right.locale
    && left.sessionGeneration === right.sessionGeneration;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function transactionResult(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
    transaction.onabort = () => reject(transaction.error ?? new DOMException('Update interrupted', 'AbortError'));
  });
}

function validateIdentity(snapshot: OfflineSnapshot, identity: SnapshotIdentity): void {
  const snapshotIdentity = {
    ownerUid: snapshot.ownerUid,
    tripId: snapshot.tripId,
    locale: snapshot.locale,
    sessionGeneration: snapshot.sessionGeneration,
  };
  if (!sameIdentity(snapshotIdentity, identity)) throw new Error('Snapshot identity does not match owner, trip, locale and session generation');
}

export class OfflineSnapshotStore {
  private readonly factory: IDBFactory;
  private readonly cryptoProvider: Crypto;
  private databasePromise?: Promise<IDBDatabase>;

  constructor(private readonly options: OfflineSnapshotStoreOptions) {
    this.factory = options.indexedDB ?? globalThis.indexedDB;
    this.cryptoProvider = options.crypto ?? globalThis.crypto;
    if (!this.factory) throw new Error('IndexedDB is unavailable');
    if (!this.cryptoProvider?.subtle) throw new Error('Web Crypto SHA-256 is unavailable');
  }

  async commit(input: OfflineSnapshot, photos: StoredPhoto[], identity: SnapshotIdentity, options: { signal?: AbortSignal } = {}): Promise<void> {
    const parsed = parseOfflineSnapshot(input);
    if (!parsed.ok) throw new Error(`Invalid offline snapshot: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`);
    const snapshot = parsed.data;
    validateIdentity(snapshot, identity);
    if (await hashSnapshot(snapshot, this.cryptoProvider) !== snapshot.checksum) throw new Error('Snapshot checksum does not match its canonical JSON');
    if (options.signal?.aborted) throw new DOMException('Update interrupted before commit', 'AbortError');

    const expected = new Map(snapshot.assets.filter((entry) => entry.status === 'included').map((entry) => [entry.assetId, entry]));
    const actual = new Map<string, Blob>();
    for (const photo of photos) {
      if (actual.has(photo.assetId)) throw new Error(`Duplicate photo blob ${photo.assetId}`);
      actual.set(photo.assetId, photo.blob);
    }
    if (actual.size !== expected.size || [...expected.keys()].some((assetId) => !actual.has(assetId))) {
      throw new Error('Required photo asset blob is missing or unexpected');
    }
    const photoRecords: AssetRecord[] = [];
    for (const [assetId, entry] of expected) {
      const blob = actual.get(assetId);
      if (!blob || blob.size !== entry.byteLength || blob.type !== entry.mimeType || await hashBlob(blob, this.cryptoProvider) !== entry.checksum) {
        throw new Error(`Required photo asset ${assetId} failed integrity validation`);
      }
      photoRecords.push({ snapshotKey: snapshotKey(identity, snapshot.revision), assetId, checksum: entry.checksum, blob });
    }
    if (options.signal?.aborted) throw new DOMException('Update interrupted before commit', 'AbortError');

    const database = await this.database();
    const transaction = database.transaction(['snapshots', 'assets', 'pointers'], 'readwrite');
    const done = transactionResult(transaction);
    const abort = () => {
      try { transaction.abort(); } catch { /* A completed transaction cannot be rolled back. */ }
    };
    options.signal?.addEventListener('abort', abort, { once: true });
    try {
      const key = snapshotKey(identity, snapshot.revision);
      transaction.objectStore('snapshots').put({ key, snapshot } satisfies SnapshotRecord);
      for (const record of photoRecords) transaction.objectStore('assets').put(record);
      if (options.signal?.aborted) abort();
      transaction.objectStore('pointers').put({ key: identityKey(identity), snapshotKey: key, identity, revision: snapshot.revision } satisfies PointerRecord);
      await done;
    } catch (error) {
      try { transaction.abort(); } catch { /* The transaction has already stopped. */ }
      await done.catch(() => undefined);
      throw error;
    } finally {
      options.signal?.removeEventListener('abort', abort);
    }
  }

  async load(identity: SnapshotIdentity): Promise<LoadedOfflineSnapshot | null> {
    const database = await this.database();
    const transaction = database.transaction(['snapshots', 'assets', 'pointers'], 'readonly');
    const transactionDone = transactionResult(transaction);
    const pointerRequest = transaction.objectStore('pointers').get(identityKey(identity));
    const pointer = await requestResult(pointerRequest) as PointerRecord | undefined;
    if (!pointer) {
      await transactionDone;
      return null;
    }
    if (!sameIdentity(pointer.identity, identity)) throw new Error('Active pointer identity mismatch');
    const record = await requestResult(transaction.objectStore('snapshots').get(pointer.snapshotKey)) as SnapshotRecord | undefined;
    await transactionDone;
    if (!record || record.snapshot.revision !== pointer.revision) throw new Error('Active pointer refers to a missing or mismatched snapshot');
    const parsed = parseOfflineSnapshot(record.snapshot);
    if (!parsed.ok) throw new Error('Stored snapshot failed schema integrity validation');
    validateIdentity(parsed.data, identity);
    if (await hashSnapshot(parsed.data, this.cryptoProvider) !== parsed.data.checksum) throw new Error('Stored snapshot checksum integrity failure');

    const manifest = parsed.data.assets.filter((entry) => entry.status === 'included');
    const photoTransaction = database.transaction('assets', 'readonly');
    const photoTransactionDone = transactionResult(photoTransaction);
    const photoRequests = manifest.map((entry) => requestResult(photoTransaction.objectStore('assets').get([pointer.snapshotKey, entry.assetId])) as Promise<AssetRecord | undefined>);
    const storedPhotos = await Promise.all(photoRequests);
    await photoTransactionDone;
    const assets: StoredPhoto[] = [];
    for (const [index, entry] of manifest.entries()) {
      const stored = storedPhotos[index];
      if (!stored || stored.blob.size !== entry.byteLength || stored.blob.type !== entry.mimeType || stored.checksum !== entry.checksum || await hashBlob(stored.blob, this.cryptoProvider) !== entry.checksum) {
        throw new Error(`Stored photo ${entry.assetId} failed integrity validation`);
      }
      assets.push({ assetId: entry.assetId, blob: stored.blob });
    }
    return { snapshot: parsed.data, assets };
  }

  close(): void {
    void this.databasePromise?.then((database) => database.close());
    this.databasePromise = undefined;
  }

  private database(): Promise<IDBDatabase> {
    if (!this.databasePromise) {
      this.databasePromise = new Promise((resolve, reject) => {
        const request = this.factory.open(this.options.databaseName, 1);
        request.onupgradeneeded = () => {
          const database = request.result;
          database.createObjectStore('snapshots', { keyPath: 'key' });
          database.createObjectStore('assets', { keyPath: ['snapshotKey', 'assetId'] });
          database.createObjectStore('pointers', { keyPath: 'key' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Could not open offline snapshot database'));
        request.onblocked = () => reject(new Error('Opening offline snapshot database was blocked'));
      });
    }
    return this.databasePromise;
  }
}
