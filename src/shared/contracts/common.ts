import { z } from 'zod';

export type Locale = 'ro' | 'en' | 'fr';
export type ValidationIssue = { path: string; message: string };
export type ValidationError = { code: 'VALIDATION_ERROR'; issues: ValidationIssue[] };
export type Result<T, E = ValidationError> = { ok: true; data: T } | { ok: false; error: E };

export const localeSchema = z.enum(['ro', 'en', 'fr']);
export const identifierSchema = z.string().min(1).max(128).refine((value) => value.trim().length > 0);
export const textSchema = z.string().max(4_000);
export const messageSchema = z.string().max(8_000);
export const nonNegativeIntegerSchema = z.number().int().safe().nonnegative();
export const positiveIntegerSchema = z.number().int().safe().positive();
export const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

export const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 0));
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
});

export const timeSchema = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
export const utcTimestampSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?Z$/)
  .refine((value) => calendarDateSchema.safeParse(value.slice(0, 10)).success && Number.isFinite(Date.parse(value)));
export const httpsUrlSchema = z.string().url().refine((value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.username === '' && parsed.password === '';
  } catch {
    return false;
  }
});

export const latLngSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
}).strict();
export type LatLng = z.infer<typeof latLngSchema>;

export const moneySchema = z.object({
  amount: z.number().finite().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
}).strict();
export type Money = z.infer<typeof moneySchema>;

export const placeRefSchema = z.object({
  id: identifierSchema,
  name: textSchema.min(1),
  location: latLngSchema,
  address: textSchema.optional(),
}).strict();
export type PlaceRef = z.infer<typeof placeRefSchema>;

export const sourceRefSchema = z.object({
  url: httpsUrlSchema,
  title: textSchema.min(1),
  checkedAt: utcTimestampSchema,
}).strict();
export type SourceRef = z.infer<typeof sourceRefSchema>;

export const licensedImageSchema = z.object({
  url: httpsUrlSchema,
  sourceUrl: httpsUrlSchema,
  author: textSchema.min(1),
  license: textSchema.min(1),
  licenseUrl: httpsUrlSchema,
  attribution: textSchema.min(1),
  checkedAt: utcTimestampSchema,
  cacheAllowed: z.boolean(),
}).strict();
export type LicensedImage = z.infer<typeof licensedImageSchema>;

export const photoManifestEntrySchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('included'),
    assetId: identifierSchema,
    placeId: identifierSchema,
    image: licensedImageSchema.refine((image) => image.cacheAllowed),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    byteLength: z.number().int().safe().min(1).max(2 * 1024 * 1024),
    checksum: sha256Schema,
  }).strict(),
  z.object({ status: z.literal('unavailable'), placeId: identifierSchema, reason: z.enum(['missing', 'license', 'cache_forbidden']) }).strict(),
]);
export type PhotoManifestEntry = z.infer<typeof photoManifestEntrySchema>;

export type SnapshotAsset = { assetId: string; blob: Blob };

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() => z.union([
  z.null(), z.boolean(), z.number().finite(), z.string(),
  z.array(jsonValueSchema),
  z.record(z.string(), jsonValueSchema),
]));
function jsonDepth(value: JsonValue, depth = 0): boolean {
  if (depth > 32) return false;
  if (Array.isArray(value)) return value.every((item) => jsonDepth(item, depth + 1));
  if (value !== null && typeof value === 'object') return Object.values(value).every((item) => jsonDepth(item, depth + 1));
  return true;
}
export const checkpointSchema = jsonValueSchema.refine((value) => jsonDepth(value));

export type ApiErrorCode = 'VALIDATION_ERROR' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'VERSION_CONFLICT' | 'PREFERENCES_CHANGED' | 'IDEMPOTENCY_CONFLICT' | 'PAYLOAD_TOO_LARGE' | 'QUOTA_EXHAUSTED' | 'PROVIDER_UNAVAILABLE' | 'KEYS_UNAVAILABLE' | 'INTERNAL_ERROR';
export type ApiResult<T> =
  | { ok: true; data: T; requestId: string }
  | { ok: false; error: { code: ApiErrorCode; messageKey: string; retryable: boolean }; requestId: string };
const apiErrorCodeSchema = z.enum(['VALIDATION_ERROR', 'UNAUTHENTICATED', 'FORBIDDEN', 'VERSION_CONFLICT', 'PREFERENCES_CHANGED', 'IDEMPOTENCY_CONFLICT', 'PAYLOAD_TOO_LARGE', 'QUOTA_EXHAUSTED', 'PROVIDER_UNAVAILABLE', 'KEYS_UNAVAILABLE', 'INTERNAL_ERROR']);
const apiResultSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), data: jsonValueSchema, requestId: identifierSchema }).strict(),
  z.object({ ok: z.literal(false), error: z.object({ code: apiErrorCodeSchema, messageKey: identifierSchema, retryable: z.boolean() }).strict(), requestId: identifierSchema }).strict(),
]);

export function parseWithSchema<T>(schema: z.ZodType<T>, input: unknown): Result<T> {
  try {
    const parsed = schema.safeParse(input);
    if (parsed.success) return { ok: true, data: parsed.data };
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.length === 0 ? '$' : issue.path.map(String).join('.'), message: issue.message })),
      },
    };
  } catch (cause) {
    return {
      ok: false,
      error: { code: 'VALIDATION_ERROR', issues: [{ path: '$', message: cause instanceof Error ? cause.message : 'Invalid input' }] },
    };
  }
}

export function parseApiResult(input: unknown): Result<ApiResult<JsonValue>> {
  return parseWithSchema(apiResultSchema, input);
}
export function parseLocale(input: unknown): Result<Locale> { return parseWithSchema(localeSchema, input); }
export function parseLatLng(input: unknown): Result<LatLng> { return parseWithSchema(latLngSchema, input); }
export function parseMoney(input: unknown): Result<Money> { return parseWithSchema(moneySchema, input); }
export function parsePlaceRef(input: unknown): Result<PlaceRef> { return parseWithSchema(placeRefSchema, input); }
export function parseSourceRef(input: unknown): Result<SourceRef> { return parseWithSchema(sourceRefSchema, input); }
export function parseLicensedImage(input: unknown): Result<LicensedImage> { return parseWithSchema(licensedImageSchema, input); }
export function parsePhotoManifestEntry(input: unknown): Result<PhotoManifestEntry> { return parseWithSchema(photoManifestEntrySchema, input); }
