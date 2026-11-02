import { describe, expect, it } from 'vitest';
import { parseResolutionInput, resolvePlaces } from '../../../src/features/place-resolution/contracts';

const place = {
  id: 'one', name: 'Fictional A', location: { lat: 0, lng: 0 },
  sources: [{ url: 'https://source.invalid/a', title: 'Fictional source', checkedAt: '2026-01-01T00:00:00Z' }],
  confidence: 'unconfirmed', matchReasons: [],
};

const invalidInputs = [
  '', ' '.repeat(4), 'x'.repeat(4001), 'http://example.invalid',
  'https://user@example.invalid', 'https://example.com', 'ftp://example.invalid',
  'https://', 'example.invalid/path', 'www.example.com', 'https//example.invalid',
  '//example.com/place', '//example.invalid/place',
  'https:example.invalid/place', 'https:/example.invalid/place',
];

const invalidResponses = [
  { ok: true, places: [{ ...place, sources: [] }] },
  { ok: true, places: [place, place] },
  { ok: true, places: [{ ...place, extra: 1 }] },
  { ok: true, places: [{ ...place, photo: {} }] },
];

describe('place resolution boundary', () => {
  it('reports reusable validation errors with input path', () => {
    expect(parseResolutionInput({ input: '', locale: 'ro' })).toMatchObject({
      ok: false, error: { code: 'VALIDATION_ERROR', issues: [{ path: 'input' }] },
    });
  });

  it('accepts a trimmed name and reserved HTTPS URL', () => {
    expect(parseResolutionInput({ input: '  Example  ', locale: 'ro' }))
      .toMatchObject({ ok: true, data: { input: 'Example' } });
    expect(parseResolutionInput({ input: 'https://example.invalid/path', locale: 'en' }))
      .toMatchObject({ ok: true });
    expect(parseResolutionInput({ input: 'HTTPS://example.invalid/path', locale: 'en' }))
      .toMatchObject({ ok: true });
  });

  it.each(invalidInputs)('rejects invalid input %s before calling provider', async (input) => {
    let calls = 0;
    const result = await resolvePlaces({
      resolve: async () => { calls++; return { ok: true, places: [] }; },
    }, { input, locale: 'ro' });
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION_ERROR' } });
    expect(calls).toBe(0);
  });

  it('returns validated candidates', async () => {
    const result = await resolvePlaces({ resolve: async () => ({ ok: true, places: [place] }) }, {
      input: 'Example', locale: 'ro',
    });
    expect(result).toMatchObject({ ok: true, data: [place] });
  });

  it.each(invalidResponses)('rejects invalid provider results', async (response) => {
    const result = await resolvePlaces({ resolve: async () => response }, { input: 'Example', locale: 'ro' });
    expect(result).toMatchObject({ ok: false, error: { code: 'invalid_response' } });
  });

  it.each(['https:source.invalid/a', 'https:/source.invalid/a'])(
    'rejects a malformed source URL %s',
    async (url) => {
      const response = { ok: true, places: [{ ...place, sources: [{ ...place.sources[0], url }] }] };
      const result = await resolvePlaces({ resolve: async () => response }, { input: 'Example', locale: 'ro' });
      expect(result).toMatchObject({ ok: false, error: { code: 'invalid_response' } });
    },
  );

  it.each(['timeout', 'unavailable', 'quota_exhausted', 'invalid_response'])(
    'preserves typed provider failure %s',
    async (code) => {
      const result = await resolvePlaces({
        resolve: async () => ({ ok: false, error: { code, retryable: false } }),
      }, { input: 'Example', locale: 'ro' });
      expect(result).toEqual({ ok: false, error: { code, retryable: false } });
    },
  );

  it.each([
    { ...place, confidence: 'verified' },
    { ...place, sources: [{ ...place.sources[0], url: 'https://example.com/real' }] },
    { ...place, photo: {
      url: 'https://image.invalid/a', sourceUrl: 'https://image.invalid/a', author: 'Demo',
      license: 'Demo', licenseUrl: 'https://image.invalid/license', attribution: 'Demo',
      checkedAt: '2026-01-01T00:00:00Z', cacheAllowed: false,
    } },
  ])('does not show non-demo or image data', async (candidate) => {
    const result = await resolvePlaces({
      resolve: async () => ({ ok: true, places: [candidate] }),
    }, { input: 'Example', locale: 'ro' });
    expect(result).toMatchObject({ ok: false, error: { code: 'invalid_response' } });
  });

  it('handles exceptions without exposing them or retrying', async () => {
    let calls = 0;
    const result = await resolvePlaces({
      resolve: async () => { calls++; throw new Error('secret'); },
    }, { input: 'Example', locale: 'ro' });
    expect(result).toEqual({ ok: false, error: { code: 'unavailable', retryable: false } });
    expect(calls).toBe(1);
  });
});
