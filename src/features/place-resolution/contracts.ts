import { z } from 'zod';
import {
  localeSchema,
  parseWithSchema,
  type Locale,
  type ValidationError,
} from '../../shared/contracts/common';
import { placeSchema, type Place } from '../../shared/contracts/itinerary';
import { providerFailureSchema, type ProviderFailure } from '../../shared/contracts/provider';

export type ResolutionInput = { input: string; locale: Locale };
export type PlaceResolutionProvider = { resolve(input: ResolutionInput): Promise<unknown> };
export type ResolutionResult =
  | { ok: true; data: Place[] }
  | { ok: false; error: ProviderFailure | ValidationError };

function isDemoUrl(value: string): boolean {
  if (!/^https:\/\/[^/?#\\]+(?:[/?#]|$)/i.test(value) || value.includes('\\')) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && url.hostname.endsWith('.invalid');
  } catch {
    return false;
  }
}

function looksLikeUrl(value: string): boolean {
  return value.startsWith('//')
    || /^[a-z][a-z\d+.-]*:/i.test(value)
    || value.includes('://')
    || /^www\./i.test(value)
    || /^(?:https?\/\/|[^\s/]+\.[a-z]{2,}(?:[/:?#]|$))/i.test(value);
}

const inputSchema = z.object({
  input: z.string().trim().min(1).max(4000),
  locale: localeSchema,
}).strict().refine(({ input }) => !looksLikeUrl(input) || isDemoUrl(input), {
  path: ['input'],
  message: 'Invalid demo input',
});

const providerResultSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), places: z.array(placeSchema) }).strict(),
  z.object({ ok: z.literal(false), error: providerFailureSchema }).strict(),
]);

export function parseResolutionInput(input: unknown) {
  return parseWithSchema(inputSchema, input);
}

export async function resolvePlaces(provider: PlaceResolutionProvider, input: unknown): Promise<ResolutionResult> {
  const parsed = parseResolutionInput(input);
  if (!parsed.ok) return parsed;

  try {
    const result = providerResultSchema.safeParse(await provider.resolve(parsed.data));
    if (!result.success) return { ok: false, error: { code: 'invalid_response', retryable: false } };
    if (!result.data.ok) return result.data;

    const places = result.data.places;
    const invalidPlace = places.some((place) =>
      place.confidence !== 'unconfirmed'
      || place.photo !== undefined
      || place.sources.some((source) => !isDemoUrl(source.url))
    );
    const duplicateId = new Set(places.map((place) => place.id)).size !== places.length;
    if (invalidPlace || duplicateId) {
      return { ok: false, error: { code: 'invalid_response', retryable: false } };
    }

    return { ok: true, data: places };
  } catch {
    return { ok: false, error: { code: 'unavailable', retryable: false } };
  }
}
