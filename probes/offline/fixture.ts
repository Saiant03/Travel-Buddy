import fixturePhotoUrl from './fixture-photo.jpg?url';
import { hashBlob, hashSnapshot, type StoredPhoto } from '../offline-pwa';
import type { OfflineSnapshot } from '../../src/shared/contracts/offline';

const fixtureOwner = 'fixture-owner';
const fixtureTrip = 'fixture-trip';
const fixtureLocale = 'ro';
const fixtureGeneration = 1;
const fixtureImage = {
  url: 'https://fixture.invalid/synthetic-coast.jpg',
  sourceUrl: 'https://fixture.invalid/synthetic-coast',
  author: 'Generated locally for the offline probe',
  license: 'Synthetic local fixture; no external source',
  licenseUrl: 'https://fixture.invalid/license',
  attribution: 'Synthetic local fixture',
  checkedAt: '2026-10-22T00:00:00Z',
  cacheAllowed: true,
};
const fixturePlace = {
  id: 'fixture-viewpoint',
  name: 'Punct de observație fictiv',
  location: { lat: 0, lng: 0 },
  description: 'Loc imaginar pentru proba locală offline.',
  photo: fixtureImage,
  sources: [{ url: 'https://fixture.invalid/place', title: 'Sursă fictivă de probă', checkedAt: '2026-10-22T00:00:00Z' }],
  confidence: 'unconfirmed' as const,
  matchReasons: ['fixture:offline-probe'],
};

export const fixtureIdentity = {
  ownerUid: fixtureOwner,
  tripId: fixtureTrip,
  locale: fixtureLocale as OfflineSnapshot['locale'],
  sessionGeneration: fixtureGeneration,
};

export async function createFixture(revision = 1): Promise<{ snapshot: OfflineSnapshot; photos: StoredPhoto[] }> {
  const response = await fetch(fixturePhotoUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error('Fotografia sintetică locală nu a putut fi citită.');
  const blob = await response.blob();
  const photoChecksum = await hashBlob(blob);
  const trip = {
    schemaVersion: 1 as const,
    id: fixtureTrip,
    revision,
    memberUids: [fixtureOwner, 'fixture-companion'] as [string, string],
    destination: { id: 'fixture-destination', name: 'Destinație fictivă', location: { lat: 0, lng: 0 } },
    dates: { start: '2027-04-10', end: '2027-04-10', days: 1 },
    transport: ['walk' as const],
    bases: [{ id: 'fixture-base', place: { id: 'fixture-stay', name: 'Bază fictivă', location: { lat: 0, lng: 0 } }, startDay: 1, endDay: 1 }],
  };
  const payload = {
    schemaVersion: 1 as const,
    tripId: fixtureTrip,
    revision,
    locale: fixtureLocale as OfflineSnapshot['locale'],
    days: [{
      dayNumber: 1,
      date: '2027-04-10',
      baseId: 'fixture-base',
      stops: [{ id: 'fixture-stop', place: fixturePlace }],
      suggestions: [],
    }],
  };
  const unsigned: Omit<OfflineSnapshot, 'checksum'> = {
    schemaVersion: 1,
    ownerUid: fixtureOwner,
    tripId: fixtureTrip,
    revision,
    locale: fixtureLocale,
    sessionGeneration: fixtureGeneration,
    savedAt: '2026-10-22T00:00:00Z',
    trip,
    payload,
    assets: [{
      status: 'included',
      assetId: 'fixture-photo',
      placeId: 'fixture-viewpoint',
      image: fixtureImage,
      mimeType: 'image/jpeg',
      byteLength: blob.size,
      checksum: photoChecksum,
    }],
  };
  const snapshot = { ...unsigned, checksum: await hashSnapshot(unsigned) };
  return { snapshot, photos: [{ assetId: 'fixture-photo', blob }] };
}

export const fixturePhoto = fixturePhotoUrl;
