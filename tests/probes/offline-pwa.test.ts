import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { validOfflineSnapshot } from '../fixtures/contracts';
import { parseOfflineSnapshot } from '../../src/shared/contracts/offline';
import { OfflineSnapshotStore, hashBlob, hashSnapshot, type SnapshotIdentity } from '../../probes/offline-pwa';
import type { OfflineSnapshot } from '../../src/shared/contracts/offline';
import type { PhotoManifestEntry } from '../../src/shared/contracts/common';

const jpegBytes = Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]);
const identity: SnapshotIdentity = {
  ownerUid: 'u-alfa',
  tripId: 'trip-1',
  locale: 'ro',
  sessionGeneration: 4,
};
const databaseNames: string[] = [];
const stores: OfflineSnapshotStore[] = [];

function photoBlob(bytes: Uint8Array = jpegBytes): Blob {
  return new Blob([new Uint8Array(bytes).buffer as ArrayBuffer], { type: 'image/jpeg' });
}

async function makeSnapshot(revision = 7) {
  const parsedFixture = parseOfflineSnapshot(validOfflineSnapshot);
  if (!parsedFixture.ok) throw new Error('Offline probe fixture must satisfy the wire contract');
  const base = parsedFixture.data;
  const blob = photoBlob();
  const sourcePhoto = base.assets.find((entry) => entry.status === 'included');
  if (!sourcePhoto) throw new Error('Offline probe fixture must include a photo');
  const photo: Extract<PhotoManifestEntry, { status: 'included' }> = {
    ...sourcePhoto,
    byteLength: blob.size,
    checksum: await hashBlob(blob),
  };
  const trip: OfflineSnapshot['trip'] = { ...base.trip, revision };
  const payload: OfflineSnapshot['payload'] = { ...base.payload, revision };
  const unavailableAssets = base.assets.filter((entry) => entry.status === 'unavailable');
  const assets: PhotoManifestEntry[] = [
    photo,
    ...unavailableAssets,
  ];
  const unsigned: Omit<OfflineSnapshot, 'checksum'> = {
    schemaVersion: 1,
    ownerUid: base.ownerUid,
    tripId: base.tripId,
    revision,
    locale: 'ro',
    sessionGeneration: base.sessionGeneration,
    savedAt: base.savedAt,
    trip,
    payload,
    assets,
  };
  const snapshot: OfflineSnapshot = { ...unsigned, checksum: await hashSnapshot(unsigned) };
  return { snapshot, blobs: [{ assetId: photo.assetId, blob }] };
}

function store() {
  const databaseName = `offline-pwa-${crypto.randomUUID()}`;
  databaseNames.push(databaseName);
  const offlineStore = new OfflineSnapshotStore({ databaseName });
  stores.push(offlineStore);
  return { offlineStore, databaseName };
}

async function overwriteFirstSnapshot(databaseName: string, edit: (snapshot: Record<string, unknown>) => void) {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction('snapshots', 'readwrite');
    const snapshots = transaction.objectStore('snapshots');
    const read = snapshots.getAll();
    read.onsuccess = () => {
      const record = read.result[0] as { snapshot: Record<string, unknown> } | undefined;
      if (!record) {
        transaction.abort();
        reject(new Error('Expected a saved snapshot to corrupt'));
        return;
      }
      edit(record.snapshot);
      snapshots.put(record);
    };
    read.onerror = () => reject(read.error);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error('Corruption transaction aborted'));
  });
  database.close();
}

afterEach(async () => {
  stores.splice(0).forEach((offlineStore) => offlineStore.close());
  await Promise.all(databaseNames.splice(0).map((databaseName) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error(`Database deletion blocked: ${databaseName}`));
  })));
});

describe('offline snapshot persistence', () => {
  it('hashes canonical JSON with sorted object keys and excludes only the snapshot checksum', async () => {
    const fixture = { z: 'last', checksum: 'ignored', a: 'first' };

    expect(await hashSnapshot(fixture as never)).toBe('af3bf072ea841a14c20d546622a7edd6ecb1b6a59c12f49cef627eac17416041');
    expect(await hashBlob(photoBlob())).toBe('32461d5bd1773012acef0ba15636752949bd7c2ce50f9172159d9f56cf0dd9af');
  });

  it('commits a valid snapshot and reloads it through the active pointer', async () => {
    const { offlineStore } = store();
    const fixture = await makeSnapshot();

    await offlineStore.commit(fixture.snapshot, fixture.blobs, identity);
    const loaded = await offlineStore.load(identity);

    expect(loaded?.snapshot.revision).toBe(7);
    expect(loaded?.snapshot.ownerUid).toBe('u-alfa');
    expect(loaded?.assets).toHaveLength(1);
  });

  it('returns the original photo bytes from IndexedDB after a cold store instance reload', async () => {
    const databaseName = `offline-photo-${crypto.randomUUID()}`;
    databaseNames.push(databaseName);
    const fixture = await makeSnapshot();
    const firstStore = new OfflineSnapshotStore({ databaseName });
    const secondStore = new OfflineSnapshotStore({ databaseName });
    stores.push(firstStore, secondStore);
    await firstStore.commit(fixture.snapshot, fixture.blobs, identity);

    const loaded = await secondStore.load(identity);

    expect(loaded?.assets[0]?.blob.size).toBe(4);
    expect([...new Uint8Array(await loaded!.assets[0]!.blob.arrayBuffer())]).toEqual([0xff, 0xd8, 0xff, 0xd9]);
  });

  it('keeps the prior active revision when an update transaction is interrupted', async () => {
    const { offlineStore } = store();
    const first = await makeSnapshot(7);
    const next = await makeSnapshot(8);
    await offlineStore.commit(first.snapshot, first.blobs, identity);
    const controller = new AbortController();

    const interrupted = offlineStore.commit(next.snapshot, next.blobs, identity, { signal: controller.signal });
    controller.abort();
    await expect(interrupted).rejects.toThrow(/abort|interrupt/i);

    expect((await offlineStore.load(identity))?.snapshot.revision).toBe(7);
  });

  it('rejects an included photo that failed to save and leaves the old pointer active', async () => {
    const { offlineStore } = store();
    const first = await makeSnapshot(7);
    const next = await makeSnapshot(8);
    await offlineStore.commit(first.snapshot, first.blobs, identity);

    await expect(offlineStore.commit(next.snapshot, [], identity)).rejects.toThrow(/photo|asset|blob/i);

    expect((await offlineStore.load(identity))?.snapshot.revision).toBe(7);
  });

  it('does not report a checksum-corrupted snapshot as loaded', async () => {
    const { offlineStore, databaseName } = store();
    const fixture = await makeSnapshot();
    await offlineStore.commit(fixture.snapshot, fixture.blobs, identity);
    await overwriteFirstSnapshot(databaseName, (snapshot) => { snapshot.checksum = '0'.repeat(64); });

    await expect(offlineStore.load(identity)).rejects.toThrow(/checksum|integrity/i);
  });

  it('rejects a commit whose owner, trip, locale, or generation differs from its identity', async () => {
    const { offlineStore } = store();
    const fixture = await makeSnapshot();

    await expect(offlineStore.commit({ ...fixture.snapshot, ownerUid: 'u-beta' }, fixture.blobs, identity)).rejects.toThrow(/identity|owner/i);
    await expect(offlineStore.commit(fixture.snapshot, fixture.blobs, { ...identity, tripId: 'trip-other' })).rejects.toThrow(/identity|trip/i);
    await expect(offlineStore.commit(fixture.snapshot, fixture.blobs, { ...identity, locale: 'fr' })).rejects.toThrow(/identity|locale/i);
    await expect(offlineStore.commit(fixture.snapshot, fixture.blobs, { ...identity, sessionGeneration: 5 })).rejects.toThrow(/identity|generation|session/i);
  });
});
