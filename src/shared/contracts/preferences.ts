import { z } from 'zod';
import { identifierSchema, localeSchema, nonNegativeIntegerSchema, parseWithSchema, textSchema, type Result } from './common';

export const categoryIds = ['food', 'culture', 'nature', 'relaxation', 'shopping'] as const;
export const categoryIdSchema = z.enum(categoryIds);
export type CategoryId = z.infer<typeof categoryIdSchema>;
export const foodAnswerSchema = z.enum(['strong_like', 'eat', 'try', 'avoid']);
export const activityAnswerSchema = z.enum(['strong_like', 'try', 'no_interest', 'hard_no']);
export const preferenceAnswerSchema = z.union([foodAnswerSchema, activityAnswerSchema]);
export type FoodAnswer = z.infer<typeof foodAnswerSchema>;
export type ActivityAnswer = z.infer<typeof activityAnswerSchema>;
export type PreferenceAnswer = z.infer<typeof preferenceAnswerSchema>;
export const qualifierSchema = z.object({ id: identifierSchema, answer: preferenceAnswerSchema, note: textSchema.optional() }).strict();
export type Qualifier = z.infer<typeof qualifierSchema>;
export const preferenceSchema = z.object({
  categoryId: categoryIdSchema,
  subcategoryId: identifierSchema,
  itemId: identifierSchema,
  answer: preferenceAnswerSchema,
  note: textSchema.optional(),
  qualifiers: z.array(qualifierSchema).optional(),
}).strict().superRefine((preference, context) => {
  const vocabulary = preference.categoryId === 'food' ? foodAnswerSchema : activityAnswerSchema;
  if (!vocabulary.safeParse(preference.answer).success) context.addIssue({ code: 'custom', path: ['answer'], message: 'Answer is not valid for this category' });
  const qualifierIds = new Set<string>();
  preference.qualifiers?.forEach((qualifier, index) => {
    if (qualifierIds.has(qualifier.id)) context.addIssue({ code: 'custom', path: ['qualifiers', index, 'id'], message: 'Qualifier IDs must be unique' });
    qualifierIds.add(qualifier.id);
    if (!vocabulary.safeParse(qualifier.answer).success) context.addIssue({ code: 'custom', path: ['qualifiers', index, 'answer'], message: 'Qualifier answer is not valid for this category' });
  });
});
export type Preference = z.infer<typeof preferenceSchema>;

export const categoryCompletionSchema = z.object({
  categoryId: categoryIdSchema,
  complete: z.boolean(),
  noSpecialPreferences: z.boolean(),
}).strict().superRefine((completion, context) => {
  if (completion.noSpecialPreferences && !completion.complete) context.addIssue({ code: 'custom', path: ['complete'], message: 'No special preferences implies complete' });
});
export type CategoryCompletion = z.infer<typeof categoryCompletionSchema>;

export const profileSchema = z.object({
  schemaVersion: z.literal(1),
  uid: identifierSchema,
  revision: nonNegativeIntegerSchema,
  locale: localeSchema,
  descriptionLocale: localeSchema,
  categories: z.array(categoryCompletionSchema),
  preferences: z.array(preferenceSchema),
  avoidFoods: z.array(textSchema.min(1)),
  allergies: z.array(textSchema.min(1)),
  intolerances: z.array(textSchema.min(1)),
}).strict().superRefine((profile, context) => {
  const completions = new Map<CategoryId, CategoryCompletion>();
  profile.categories.forEach((completion, index) => {
    if (completions.has(completion.categoryId)) context.addIssue({ code: 'custom', path: ['categories', index, 'categoryId'], message: 'Category must occur exactly once' });
    completions.set(completion.categoryId, completion);
  });
  for (const categoryId of categoryIds) {
    const completion = completions.get(categoryId);
    if (!completion) context.addIssue({ code: 'custom', path: ['categories'], message: `Missing category ${categoryId}` });
  }
  const seenItems = new Set<string>();
  const selections = new Set<CategoryId>();
  profile.preferences.forEach((preference, index) => {
    const itemKey = `${preference.categoryId}\u0000${preference.subcategoryId}\u0000${preference.itemId}`;
    if (seenItems.has(itemKey)) context.addIssue({ code: 'custom', path: ['preferences', index], message: 'Preference item must occur once' });
    seenItems.add(itemKey);
    selections.add(preference.categoryId);
  });
  for (const completion of profile.categories) {
    if (completion.noSpecialPreferences && selections.has(completion.categoryId)) context.addIssue({ code: 'custom', path: ['categories'], message: 'No-special-preferences cannot coexist with selections' });
    if (completion.complete && !completion.noSpecialPreferences && !selections.has(completion.categoryId)) context.addIssue({ code: 'custom', path: ['categories'], message: 'Completed category needs a selection or explicit no-special-preferences' });
  }
});
export type Profile = z.infer<typeof profileSchema>;

export function parsePreference(input: unknown): Result<Preference> { return parseWithSchema(preferenceSchema, input); }
export function parseProfile(input: unknown): Result<Profile> { return parseWithSchema(profileSchema, input); }
