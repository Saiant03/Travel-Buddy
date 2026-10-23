import { z } from 'zod';
import { checkpointSchema, identifierSchema, nonNegativeIntegerSchema, parseWithSchema, positiveIntegerSchema, type Result } from './common';

export const generationJobSchema = z.object({
  schemaVersion: z.literal(1),
  id: identifierSchema,
  tripId: identifierSchema,
  status: z.enum(['queued', 'running', 'partial', 'complete', 'quota_exhausted', 'failed']),
  attemptId: identifierSchema.optional(),
  claimVersion: nonNegativeIntegerSchema,
  leaseToken: identifierSchema.optional(),
  checkpoint: checkpointSchema.optional(),
  stage: z.enum(['search', 'organize', 'verify']),
  completed: nonNegativeIntegerSchema,
  total: positiveIntegerSchema,
  resultTripVersion: nonNegativeIntegerSchema.optional(),
  errorCode: identifierSchema.optional(),
}).strict().superRefine((job, context) => {
  if (job.completed > job.total) context.addIssue({ code: 'custom', path: ['completed'], message: 'Completed work cannot exceed total work' });
  if ((job.attemptId === undefined) !== (job.leaseToken === undefined)) context.addIssue({ code: 'custom', path: ['leaseToken'], message: 'Attempt and lease token are supplied together' });
  if (job.status === 'running' && (job.attemptId === undefined || job.leaseToken === undefined)) context.addIssue({ code: 'custom', path: ['attemptId'], message: 'Running job needs an active claim' });
  if (job.status === 'complete' && (job.completed !== job.total || job.resultTripVersion === undefined)) context.addIssue({ code: 'custom', path: ['resultTripVersion'], message: 'Complete job needs all work and a result trip version' });
});
export type GenerationJob = z.infer<typeof generationJobSchema>;

export function parseGenerationJob(input: unknown): Result<GenerationJob> { return parseWithSchema(generationJobSchema, input); }
