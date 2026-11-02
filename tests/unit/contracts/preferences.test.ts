import { describe, expect, it } from 'vitest';
import { parsePreference, parseProfile } from '../../../src/shared/contracts/preferences';
import { validProfile } from '../../fixtures/contracts';

describe('preference wire contracts', () => {
  it('round trips a profile with exactly five completed category records', () => {
    expect(parseProfile(validProfile)).toEqual({ ok: true, data: validProfile });
  });

  it('rejects a profile revision below zero and an unsupported locale', () => {
    expect(parseProfile({ ...validProfile, revision: -1 })).toMatchObject({ ok: false, error: { code: 'VALIDATION_ERROR' } });
    expect(parseProfile({ ...validProfile, locale: 'de' })).toMatchObject({ ok: false, error: { code: 'VALIDATION_ERROR' } });
  });

  it('rejects duplicate category records and unknown properties', () => {
    const duplicate = [...validProfile.categories, validProfile.categories[0]];
    expect(parseProfile({ ...validProfile, categories: duplicate })).toMatchObject({ ok: false });
    expect(parseProfile({ ...validProfile, privateToken: 'secret' })).toMatchObject({ ok: false });
  });

  it('rejects activity answers in food and food answers in activities', () => {
    expect(parsePreference({ categoryId: 'food', subcategoryId: 'x', itemId: 'y', answer: 'hard_no' })).toMatchObject({ ok: false });
    expect(parsePreference({ categoryId: 'culture', subcategoryId: 'x', itemId: 'y', answer: 'avoid' })).toMatchObject({ ok: false });
  });

  it('keeps health restrictions distinct and validates qualifier answers', () => {
    expect(parseProfile({ ...validProfile, intolerances: ['lactose'], allergies: ['peanuts'] })).toMatchObject({ ok: true });
    expect(parsePreference({ categoryId: 'food', subcategoryId: 'x', itemId: 'y', answer: 'try', qualifiers: [{ id: 'seasonal', answer: 'hard_no' }] })).toMatchObject({ ok: false });
  });
});
