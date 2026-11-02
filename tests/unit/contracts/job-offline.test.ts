import { describe, expect, it } from 'vitest';
import { parseGenerationJob } from '../../../src/shared/contracts/generation';
import { parseOfflineSnapshot } from '../../../src/shared/contracts/offline';
import { validGenerationJob, validOfflineSnapshot } from '../../fixtures/contracts';

describe('generation job lifecycle', () => {
  it('round trips a running job with a claimed attempt and lease', () => {
    expect(parseGenerationJob(validGenerationJob)).toEqual({ ok: true, data: validGenerationJob });
  });

  it('rejects impossible progress, incomplete completion, unknown status, and a half-present lease', () => {
    expect(parseGenerationJob({ ...validGenerationJob, completed: 4 })).toMatchObject({ ok: false });
    expect(parseGenerationJob({ ...validGenerationJob, status: 'complete', completed: 2 })).toMatchObject({ ok: false });
    expect(parseGenerationJob({ ...validGenerationJob, status: 'mystery' })).toMatchObject({ ok: false });
    expect(parseGenerationJob({ ...validGenerationJob, leaseToken: undefined })).toMatchObject({ ok: false });
  });

  it('rejects checkpoint JSON deeper than 32 levels without throwing', () => {
    const tooDeep = Array.from({ length: 33 }).reduce<unknown>((value) => [value], null);
    expect(() => parseGenerationJob({ ...validGenerationJob, checkpoint: tooDeep })).not.toThrow();
    expect(parseGenerationJob({ ...validGenerationJob, checkpoint: tooDeep })).toMatchObject({ ok: false });
  });

  it('requires a completed result version for complete jobs and allows explicit terminal errors', () => {
    expect(parseGenerationJob({ ...validGenerationJob, status: 'complete', completed: 3, resultTripVersion: 8 })).toMatchObject({ ok: true });
    expect(parseGenerationJob({ ...validGenerationJob, status: 'complete', completed: 3 })).toMatchObject({ ok: false });
    expect(parseGenerationJob({ ...validGenerationJob, status: 'failed', errorCode: 'PROVIDER_UNAVAILABLE' })).toMatchObject({ ok: true });
  });
});

describe('offline snapshot boundary validation', () => {
  it('round trips a member-owned snapshot with a complete place photo manifest', () => {
    expect(parseOfflineSnapshot(validOfflineSnapshot)).toEqual({ ok: true, data: validOfflineSnapshot });
  });

  it('rejects missing or foreign owners and a member outside the trip', () => {
    const missing = { ...validOfflineSnapshot };
    Reflect.deleteProperty(missing, 'ownerUid');
    expect(parseOfflineSnapshot(missing)).toMatchObject({ ok: false });
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, ownerUid: 'u-gamma' })).toMatchObject({ ok: false });
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, trip: { ...validOfflineSnapshot.trip, memberUids: ['u-beta', 'u-gamma'] } })).toMatchObject({ ok: false });
  });

  it('rejects foreign, missing, duplicate, or arbitrarily downgraded manifest entries', () => {
    const entries = validOfflineSnapshot.assets;
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, assets: [...entries, { status: 'unavailable', placeId: 'unrelated', reason: 'missing' }] })).toMatchObject({ ok: false });
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, assets: entries.slice(0, 1) })).toMatchObject({ ok: false });
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, assets: [...entries, entries[0]] })).toMatchObject({ ok: false });
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, assets: [{ status: 'unavailable', placeId: 'place-lisbon-museum', reason: 'missing' }, entries[1]] })).toMatchObject({ ok: false });
  });

  it('rejects snapshot and payload trip/revision/locale mismatch', () => {
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, revision: 8 })).toMatchObject({ ok: false });
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, payload: { ...validOfflineSnapshot.payload, tripId: 'trip-2' } })).toMatchObject({ ok: false });
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, payload: { ...validOfflineSnapshot.payload, revision: 8 } })).toMatchObject({ ok: false });
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, locale: 'fr' })).toMatchObject({ ok: false });
  });

  it('checks each itinerary date and base against its trip calendar', () => {
    const wrongDate = { ...validOfflineSnapshot, payload: { ...validOfflineSnapshot.payload, days: [{ ...validOfflineSnapshot.payload.days[0], date: '2027-04-11' }, ...validOfflineSnapshot.payload.days.slice(1)] } };
    const wrongBase = { ...validOfflineSnapshot, payload: { ...validOfflineSnapshot.payload, days: [{ ...validOfflineSnapshot.payload.days[0], baseId: 'unknown-base' }, ...validOfflineSnapshot.payload.days.slice(1)] } };
    expect(parseOfflineSnapshot(wrongDate)).toMatchObject({ ok: false });
    expect(parseOfflineSnapshot(wrongBase)).toMatchObject({ ok: false });
  });

  it('rejects conflicting duplicate representations of one place across itinerary days', () => {
    const secondDay = { ...validOfflineSnapshot.payload.days[1]!, suggestions: [{ ...validOfflineSnapshot.payload.days[0]!.stops[0]!.place, name: 'Different museum name' }] };
    const payload = { ...validOfflineSnapshot.payload, days: [validOfflineSnapshot.payload.days[0]!, secondDay, validOfflineSnapshot.payload.days[2]!] };
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, payload })).toMatchObject({ ok: false });
  });

  it('requires an explicit cache-forbidden state for a photo that cannot be cached', () => {
    const place = { ...validOfflineSnapshot.payload.days[0]!.stops[0]!.place, photo: { ...validOfflineSnapshot.payload.days[0]!.stops[0]!.place.photo!, cacheAllowed: false } };
    const day = { ...validOfflineSnapshot.payload.days[0]!, stops: [{ ...validOfflineSnapshot.payload.days[0]!.stops[0]!, place }] };
    const payload = { ...validOfflineSnapshot.payload, days: [day, ...validOfflineSnapshot.payload.days.slice(1)] };
    const downgraded = { ...validOfflineSnapshot, payload, assets: [{ status: 'unavailable', placeId: 'place-lisbon-museum', reason: 'missing' }, validOfflineSnapshot.assets[1]!] };
    expect(parseOfflineSnapshot(downgraded)).toMatchObject({ ok: false });
    expect(parseOfflineSnapshot({ ...downgraded, assets: [{ status: 'unavailable', placeId: 'place-lisbon-museum', reason: 'cache_forbidden' }, validOfflineSnapshot.assets[1]!] })).toMatchObject({ ok: true });
  });

  it('validates checksum representation without claiming to verify its cryptographic value', () => {
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, checksum: 'not-a-sha256' })).toMatchObject({ ok: false });
    expect(parseOfflineSnapshot({ ...validOfflineSnapshot, checksum: 'c'.repeat(64) })).toMatchObject({ ok: true });
  });
});
