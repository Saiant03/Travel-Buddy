import {
  activityAnswerSchema, categoryIds, foodAnswerSchema, profileSchema,
  type CategoryId, type Preference, type PreferenceAnswer, type Profile,
} from '../../shared/contracts/preferences';
import { identifierSchema, textSchema } from '../../shared/contracts/common';

export type DemoItem = Pick<Preference, 'categoryId' | 'subcategoryId' | 'itemId'>;
export type DemoRestriction = 'avoidFoods' | 'allergies' | 'intolerances';

function matches(preference: Preference, item: DemoItem): boolean {
  return preference.categoryId === item.categoryId && preference.subcategoryId === item.subcategoryId && preference.itemId === item.itemId;
}

function validAnswer(categoryId: CategoryId, answer: PreferenceAnswer): void {
  (categoryId === 'food' ? foodAnswerSchema : activityAnswerSchema).parse(answer);
}

function withPreferences(profile: Profile, preferences: Preference[], noSpecialCategory?: CategoryId): Profile {
  const categories = profile.categories.map((category) => {
    const noSpecialPreferences = category.categoryId === noSpecialCategory ? false : category.noSpecialPreferences;
    return {
      categoryId: category.categoryId,
      noSpecialPreferences,
      complete: noSpecialPreferences || preferences.some((preference) => preference.categoryId === category.categoryId),
    };
  });
  return profileSchema.parse({ ...profile, revision: profile.revision + 1, preferences, categories });
}

export function createDemoProfile(): Profile {
  return profileSchema.parse({
    schemaVersion: 1, uid: 'demo_local_profile', revision: 0, locale: 'ro', descriptionLocale: 'ro',
    categories: categoryIds.map((categoryId) => ({ categoryId, complete: false, noSpecialPreferences: false })),
    preferences: [], avoidFoods: [], allergies: [], intolerances: [],
  });
}

export function setDemoAnswer(profile: Profile, item: DemoItem, answer: PreferenceAnswer | undefined): Profile {
  const categoryId = item.categoryId;
  const subcategoryId = identifierSchema.parse(item.subcategoryId);
  const itemId = identifierSchema.parse(item.itemId);
  if (answer !== undefined) validAnswer(item.categoryId, answer);
  const previous = profile.preferences.find((preference) => matches(preference, item));
  if (answer === undefined && !previous) return profile;
  if (answer === previous?.answer && !profile.categories.find((category) => category.categoryId === item.categoryId)?.noSpecialPreferences) return profile;
  const preferences = answer === undefined
    ? profile.preferences.filter((preference) => !matches(preference, item))
    : previous
      ? profile.preferences.map((preference) => matches(preference, item) ? { ...preference, answer } : preference)
      : [...profile.preferences, { categoryId, subcategoryId, itemId, answer }];
  return withPreferences(profile, preferences, answer === undefined ? undefined : item.categoryId);
}

export function setDemoNoSpecial(profile: Profile, categoryId: CategoryId, enabled: boolean): Profile {
  const preferences = enabled ? profile.preferences.filter((preference) => preference.categoryId !== categoryId) : profile.preferences;
  const categories = profile.categories.map((category) => category.categoryId === categoryId
    ? { categoryId, complete: enabled || preferences.some((preference) => preference.categoryId === categoryId), noSpecialPreferences: enabled }
    : category);
  if (preferences.length === profile.preferences.length && categories.every((category, index) => category.complete === profile.categories[index]?.complete && category.noSpecialPreferences === profile.categories[index]?.noSpecialPreferences)) return profile;
  return profileSchema.parse({ ...profile, revision: profile.revision + 1, preferences, categories });
}

export function setDemoNote(profile: Profile, item: DemoItem, note: string | undefined): Profile {
  if (note !== undefined) textSchema.parse(note);
  const previous = profile.preferences.find((preference) => matches(preference, item));
  if (!previous || previous.note === note) return profile;
  const preferences = profile.preferences.map((preference) => matches(preference, item)
    ? { ...preference, note }
    : preference);
  return withPreferences(profile, preferences);
}

export function setDemoQualifier(profile: Profile, item: DemoItem, qualifierId: string, answer: PreferenceAnswer | undefined, note?: string): Profile {
  identifierSchema.parse(qualifierId);
  if (answer !== undefined) validAnswer(item.categoryId, answer);
  if (note !== undefined) textSchema.parse(note);
  const previous = profile.preferences.find((preference) => matches(preference, item));
  if (!previous) return profile;
  const qualifiers = answer === undefined
    ? previous.qualifiers?.filter((qualifier) => qualifier.id !== qualifierId)
    : previous.qualifiers?.some((qualifier) => qualifier.id === qualifierId)
      ? previous.qualifiers.map((qualifier) => qualifier.id === qualifierId ? { ...qualifier, answer, ...(note === undefined ? {} : { note }) } : qualifier)
      : [...(previous.qualifiers ?? []), { id: qualifierId, answer, ...(note === undefined ? {} : { note }) }];
  const preferences = profile.preferences.map((preference) => matches(preference, item)
    ? { ...preference, qualifiers: qualifiers?.length ? qualifiers : undefined }
    : preference);
  return withPreferences(profile, preferences);
}

export function setDemoRestriction(profile: Profile, kind: DemoRestriction, values: string[]): Profile {
  const normalized = values.map((value) => textSchema.min(1).parse(value.trim()));
  return profileSchema.parse({ ...profile, revision: profile.revision + 1, [kind]: normalized });
}

export function completedCategoryCount(profile: Profile): number {
  return profile.categories.filter((category) => category.complete).length;
}

export function isDemoReady(profile: Profile): boolean {
  return completedCategoryCount(profile) === categoryIds.length;
}
