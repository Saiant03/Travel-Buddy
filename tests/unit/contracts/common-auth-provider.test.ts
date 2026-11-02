import { describe, expect, it } from 'vitest';
import { parseApiResult, parseMoney, parsePhotoManifestEntry, parseSourceRef } from '../../../src/shared/contracts/common';
import { parseVerifiedIdentity, parseTripMember } from '../../../src/shared/contracts/auth';
import { parseProviderFailure } from '../../../src/shared/contracts/provider';

describe('shared values and API result contracts', () => {
  it('accepts the documented success and error envelopes without unknown fields', () => {
    expect(parseApiResult({ ok: true, data: { id: 'trip-1' }, requestId: 'req-1' })).toMatchObject({ ok: true });
    expect(parseApiResult({ ok: false, error: { code: 'FORBIDDEN', messageKey: 'error.forbidden', retryable: false }, requestId: 'req-1' })).toMatchObject({ ok: true });
    expect(parseApiResult({ ok: false, error: { code: 'FORBIDDEN', messageKey: 'error.forbidden', retryable: false, token: 'secret' }, requestId: 'req-1' })).toMatchObject({ ok: false });
  });

  it('rejects invalid money and an uncacheable included image', () => {
    expect(parseMoney({ amount: -1, currency: 'EUR' })).toMatchObject({ ok: false });
    expect(parseMoney({ amount: 2, currency: 'eur' })).toMatchObject({ ok: false });
    expect(parsePhotoManifestEntry({ status: 'included', assetId: 'a', placeId: 'p', image: {
      url: 'https://a.example.test/a.jpg', sourceUrl: 'https://a.example.test/', author: 'A', license: 'L',
      licenseUrl: 'https://a.example.test/license', attribution: 'A', checkedAt: '2026-10-20T12:00:00Z', cacheAllowed: false,
    }, mimeType: 'image/jpeg', byteLength: 500_000, checksum: 'a'.repeat(64) })).toMatchObject({ ok: false });
  });

  it('returns validation failures instead of throwing for JSON-shaped invalid input', () => {
    expect(() => parseMoney(null)).not.toThrow();
    expect(parseMoney(null)).toMatchObject({ ok: false, error: { code: 'VALIDATION_ERROR', issues: expect.any(Array) } });
  });

  it('rejects impossible UTC calendar dates in provenance timestamps', () => {
    expect(parseSourceRef({ url: 'https://museum.example.test/', title: 'Site', checkedAt: '2026-02-30T12:00:00Z' })).toMatchObject({ ok: false });
  });
});

describe('identity and provider contracts', () => {
  it('only accepts a verified identity and complete trip member keys', () => {
    expect(parseVerifiedIdentity({ uid: 'u-alfa', emailVerified: true })).toMatchObject({ ok: true });
    expect(parseVerifiedIdentity({ uid: 'u-alfa', emailVerified: false })).toMatchObject({ ok: false });
    expect(parseTripMember({ tripId: 'trip-1', uid: 'u-alfa' })).toMatchObject({ ok: true });
    expect(parseTripMember({ tripId: 'trip-1' })).toMatchObject({ ok: false });
  });

  it('validates retry timing and provider failure codes', () => {
    expect(parseProviderFailure({ code: 'timeout', retryable: true, retryAt: '2026-10-22T09:00:00Z' })).toMatchObject({ ok: true });
    expect(parseProviderFailure({ code: 'quota_exhausted', retryable: false })).toMatchObject({ ok: true });
    expect(parseProviderFailure({ code: 'bad-key', retryable: false })).toMatchObject({ ok: false });
  });
});
