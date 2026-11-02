import { describe, expect, it } from 'vitest';
import { categoryIds, parseProfile } from '../../../src/shared/contracts/preferences';
import { demoItems } from '../../../src/features/preferences/demo-catalog';
import {
  completedCategoryCount,
  createDemoProfile,
  isDemoReady,
  setDemoAnswer,
  setDemoNoSpecial,
  setDemoNote,
  setDemoQualifier,
  setDemoRestriction,
} from '../../../src/features/preferences/demo-model';

const onion = { categoryId: 'food', subcategoryId: 'vegetables', itemId: 'onion' } as const;
const pizza = { categoryId: 'food', subcategoryId: 'dishes', itemId: 'pizza' } as const;
const hike = { categoryId: 'nature', subcategoryId: 'walks', itemId: 'hike' } as const;

describe('local demo preferences', () => {
  it('starts with five unknown categories and no personal restrictions', () => {
    const profile = createDemoProfile();
    expect(profile.uid).toMatch(/^demo_/);
    expect(profile.locale).toBe('ro');
    expect(profile.categories.map((category) => category.categoryId)).toEqual([...categoryIds]);
    expect(profile.categories.every((category) => !category.complete && !category.noSpecialPreferences)).toBe(true);
    expect(profile.preferences).toEqual([]);
    expect([profile.avoidFoods, profile.allergies, profile.intolerances]).toEqual([[], [], []]);
    expect(parseProfile(profile).ok).toBe(true);
  });

  it('replaces an item answer without duplicating the item', () => {
    const first = setDemoAnswer(createDemoProfile(), onion, 'eat');
    const second = setDemoAnswer(first, onion, 'avoid');
    expect(second.preferences).toEqual([{ ...onion, answer: 'avoid' }]);
    expect(first.preferences).toEqual([{ ...onion, answer: 'eat' }]);
    expect(completedCategoryCount(second)).toBe(1);
  });

  it('accepts a displayed catalog item without storing its presentation fields', () => {
    const catalogItem = demoItems[0]!;
    const profile = setDemoAnswer(createDemoProfile(), catalogItem, 'eat');
    expect(profile.preferences).toEqual([{ categoryId: 'food', subcategoryId: 'vegetables', itemId: 'onion', answer: 'eat' }]);
    expect(parseProfile(profile).ok).toBe(true);
  });

  it('distinguishes an unanswered activity from no interest and an explicit refusal', () => {
    const blank = createDemoProfile();
    const uninterested = setDemoAnswer(blank, hike, 'no_interest');
    const refused = setDemoAnswer(uninterested, hike, 'hard_no');
    expect(blank.preferences).toEqual([]);
    expect(uninterested.preferences[0]?.answer).toBe('no_interest');
    expect(refused.preferences[0]?.answer).toBe('hard_no');
  });

  it('returns a category to unknown after clearing its final answer', () => {
    const answered = setDemoAnswer(createDemoProfile(), onion, 'eat');
    const cleared = setDemoAnswer(answered, onion, undefined);
    expect(cleared.preferences).toEqual([]);
    expect(cleared.categories.find((category) => category.categoryId === 'food')).toEqual({ categoryId: 'food', complete: false, noSpecialPreferences: false });
    expect(completedCategoryCount(cleared)).toBe(0);
  });

  it('makes no-special exclusive with selections in either order', () => {
    const selected = setDemoAnswer(createDemoProfile(), onion, 'eat');
    const noSpecial = setDemoNoSpecial(selected, 'food', true);
    expect(noSpecial.preferences).toEqual([]);
    expect(noSpecial.categories[0]).toEqual({ categoryId: 'food', complete: true, noSpecialPreferences: true });
    const selectedAgain = setDemoAnswer(noSpecial, pizza, 'try');
    expect(selectedAgain.preferences).toEqual([{ ...pizza, answer: 'try' }]);
    expect(selectedAgain.categories[0]).toEqual({ categoryId: 'food', complete: true, noSpecialPreferences: false });
    expect(setDemoNoSpecial(noSpecial, 'food', false).categories[0]).toEqual({ categoryId: 'food', complete: false, noSpecialPreferences: false });
  });

  it('requires all five categories to have a selection or explicit no-special choice', () => {
    let profile = createDemoProfile();
    for (const categoryId of categoryIds.slice(0, 4)) profile = setDemoNoSpecial(profile, categoryId, true);
    expect(completedCategoryCount(profile)).toBe(4);
    expect(isDemoReady(profile)).toBe(false);
    profile = setDemoAnswer(profile, { categoryId: 'shopping', subcategoryId: 'places', itemId: 'market' }, 'try');
    expect(completedCategoryCount(profile)).toBe(5);
    expect(isDemoReady(profile)).toBe(true);
  });

  it('keeps ingredient, dish, and subtype answers independent', () => {
    const withOnion = setDemoAnswer(createDemoProfile(), onion, 'avoid');
    const withPizza = setDemoAnswer(withOnion, pizza, 'eat');
    const subtype = { categoryId: 'shopping', subcategoryId: 'products', itemId: 'books' } as const;
    const final = setDemoAnswer(withPizza, subtype, 'try');
    expect(final.preferences).toEqual([{ ...onion, answer: 'avoid' }, { ...pizza, answer: 'eat' }, { ...subtype, answer: 'try' }]);
  });

  it('adds food notes and preparation qualifiers only to the answered item', () => {
    const blank = createDemoProfile();
    expect(setDemoNote(blank, onion, 'Only cooked').preferences).toEqual([]);
    expect(setDemoQualifier(blank, onion, 'raw', 'avoid').preferences).toEqual([]);
    const answered = setDemoAnswer(blank, onion, 'eat');
    const noted = setDemoNote(answered, onion, 'Only cooked');
    const qualified = setDemoQualifier(noted, onion, 'raw', 'avoid');
    expect(qualified.preferences).toEqual([{ ...onion, answer: 'eat', note: 'Only cooked', qualifiers: [{ id: 'raw', answer: 'avoid' }] }]);
    expect(setDemoQualifier(qualified, onion, 'raw', undefined).preferences[0]?.qualifiers).toBeUndefined();
    expect(parseProfile(qualified).ok).toBe(true);
  });

  it('preserves a qualifier note when only its answer changes', () => {
    const answered = setDemoAnswer(createDemoProfile(), onion, 'eat');
    const qualified = setDemoQualifier(answered, onion, 'raw', 'avoid', 'Only when cooked');
    const changed = setDemoQualifier(qualified, onion, 'raw', 'try');
    expect(changed.preferences[0]?.qualifiers).toEqual([{ id: 'raw', answer: 'try', note: 'Only when cooked' }]);
  });

  it('keeps restrictions separate from tastes and from each other', () => {
    const tasted = setDemoAnswer(createDemoProfile(), onion, 'avoid');
    expect([tasted.avoidFoods, tasted.allergies, tasted.intolerances]).toEqual([[], [], []]);
    const allergy = setDemoRestriction(tasted, 'allergies', ['peanuts']);
    const intolerance = setDemoRestriction(allergy, 'intolerances', ['lactose']);
    const avoided = setDemoRestriction(intolerance, 'avoidFoods', ['mushrooms']);
    expect([avoided.avoidFoods, avoided.allergies, avoided.intolerances]).toEqual([['mushrooms'], ['peanuts'], ['lactose']]);
    expect(avoided.preferences).toEqual([{ ...onion, answer: 'avoid' }]);
    expect(parseProfile(avoided).ok).toBe(true);
  });

  it('keeps the contract valid through every local editing action', () => {
    const initial = createDemoProfile();
    const answered = setDemoAnswer(initial, onion, 'eat');
    const noted = setDemoNote(answered, onion, 'Cooked');
    const qualified = setDemoQualifier(noted, onion, 'raw', 'avoid');
    const unqualified = setDemoQualifier(qualified, onion, 'raw', undefined);
    const restricted = setDemoRestriction(unqualified, 'allergies', ['peanuts']);
    const noSpecial = setDemoNoSpecial(restricted, 'food', true);
    const selectedAgain = setDemoAnswer(noSpecial, pizza, 'try');
    const cleared = setDemoAnswer(selectedAgain, pizza, undefined);
    const unknown = setDemoNoSpecial(noSpecial, 'food', false);
    for (const state of [initial, answered, noted, qualified, unqualified, restricted, noSpecial, selectedAgain, cleared, unknown]) {
      expect(parseProfile(state).ok).toBe(true);
    }
  });
});
