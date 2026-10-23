import { z } from 'zod';
import { licensedImageSchema, parseWithSchema, photoManifestEntrySchema, sha256Schema, utcTimestampSchema, type PhotoManifestEntry, type Result } from './common';

export const providerFailureSchema = z.object({
  code: z.enum(['quota_exhausted', 'timeout', 'unavailable', 'invalid_response']),
  retryable: z.boolean(),
  retryAt: utcTimestampSchema.optional(),
}).strict();
export type ProviderFailure = z.infer<typeof providerFailureSchema>;
export type { PhotoManifestEntry };
export { licensedImageSchema, photoManifestEntrySchema, sha256Schema };
export function parseProviderFailure(input: unknown): Result<ProviderFailure> { return parseWithSchema(providerFailureSchema, input); }
export function parsePhotoManifestEntries(input: unknown): Result<PhotoManifestEntry[]> {
  const schema = z.array(photoManifestEntrySchema).superRefine((entries, context) => {
    const placeIds = new Set<string>();
    const assetIds = new Set<string>();
    entries.forEach((entry, index) => {
      if (placeIds.has(entry.placeId)) context.addIssue({ code: 'custom', path: [index, 'placeId'], message: 'Place IDs must be unique' });
      placeIds.add(entry.placeId);
      if (entry.status === 'included') {
        if (assetIds.has(entry.assetId)) context.addIssue({ code: 'custom', path: [index, 'assetId'], message: 'Asset IDs must be unique' });
        assetIds.add(entry.assetId);
      }
    });
  });
  return parseWithSchema(schema, input);
}
