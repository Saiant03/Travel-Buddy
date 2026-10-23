import { z } from 'zod';
import {
  identifierSchema, licensedImageSchema, localeSchema, moneySchema, nonNegativeIntegerSchema,
  parseWithSchema, placeRefSchema, positiveIntegerSchema, sha256Schema, sourceRefSchema, textSchema, timeSchema,
  calendarDateSchema, type Result,
} from './common';

export const placeSchema = placeRefSchema.extend({
  description: textSchema.optional(),
  price: moneySchema.optional(),
  opening: textSchema.optional(),
  reservation: textSchema.optional(),
  photo: licensedImageSchema.optional(),
  sources: z.array(sourceRefSchema).min(1),
  confidence: z.enum(['verified', 'unconfirmed']),
  matchReasons: z.array(textSchema),
}).strict();
export type Place = z.infer<typeof placeSchema>;

export const stopSchema = z.object({
  id: identifierSchema,
  place: placeSchema,
  fixedTime: timeSchema.optional(),
  fixedTimeAccepted: z.boolean().optional(),
}).strict().superRefine((stop, context) => {
  if (stop.fixedTime !== undefined && stop.fixedTimeAccepted !== true) context.addIssue({ code: 'custom', path: ['fixedTimeAccepted'], message: 'Fixed time requires explicit acceptance' });
  if (stop.fixedTime === undefined && stop.fixedTimeAccepted !== undefined) context.addIssue({ code: 'custom', path: ['fixedTimeAccepted'], message: 'Acceptance applies only to a fixed time' });
});
export type Stop = z.infer<typeof stopSchema>;

export const dayPlanSchema = z.object({
  dayNumber: positiveIntegerSchema,
  date: calendarDateSchema.optional(),
  baseId: identifierSchema.optional(),
  stops: z.array(stopSchema),
  suggestions: z.array(placeSchema),
  route: z.object({ geometry: z.string().min(1), provider: identifierSchema, confidence: z.enum(['verified', 'unconfirmed']) }).strict().optional(),
}).strict();
export type DayPlan = z.infer<typeof dayPlanSchema>;

function validateDays(days: DayPlan[], addIssue: (issue: { code: 'custom'; path: (string | number)[]; message: string }) => void): void {
  const stopIds = new Set<string>();
  days.forEach((day, index) => {
    if (day.dayNumber !== index + 1) addIssue({ code: 'custom', path: [index, 'dayNumber'], message: 'Day numbers must be consecutive from 1' });
    day.stops.forEach((stop, stopIndex) => {
      if (stopIds.has(stop.id)) addIssue({ code: 'custom', path: [index, 'stops', stopIndex, 'id'], message: 'Stop IDs must be unique across the itinerary' });
      stopIds.add(stop.id);
    });
  });
}

export const itinerarySchema = z.object({
  schemaVersion: z.literal(1),
  tripId: identifierSchema,
  revision: nonNegativeIntegerSchema,
  days: z.array(dayPlanSchema),
  locale: localeSchema,
}).strict().superRefine((itinerary, context) => validateDays(itinerary.days, (issue) => context.addIssue(issue)));
export type Itinerary = z.infer<typeof itinerarySchema>;

export const buddyRequestSchema = z.object({ id: identifierSchema, message: z.string().min(1).max(8_000), locale: localeSchema }).strict();
export type BuddyRequest = z.infer<typeof buddyRequestSchema>;
export const changePatchSchema = z.object({ days: z.array(dayPlanSchema) }).strict().superRefine((patch, context) => validateDays(patch.days, (issue) => context.addIssue(issue)));
export type ChangePatch = z.infer<typeof changePatchSchema>;
export const changeSummarySchema = z.object({ removed: z.array(identifierSchema), preserved: z.array(identifierSchema), added: z.array(identifierSchema) }).strict();
export type ChangeSummary = z.infer<typeof changeSummarySchema>;

export const appliedReceiptSchema = z.object({
  id: identifierSchema,
  tripId: identifierSchema,
  uid: identifierSchema,
  proposalId: identifierSchema,
  idempotencyKey: identifierSchema,
  revision: nonNegativeIntegerSchema,
  applyNonce: identifierSchema,
}).strict();
export type AppliedReceipt = z.infer<typeof appliedReceiptSchema>;

export const proposalSchema = z.object({
  schemaVersion: z.literal(1),
  id: identifierSchema,
  tripId: identifierSchema,
  baseVersion: nonNegativeIntegerSchema,
  request: buddyRequestSchema,
  preferenceFingerprint: sha256Schema,
  immutablePatch: changePatchSchema,
  patchHash: sha256Schema,
  summary: changeSummarySchema,
  appliedReceipt: appliedReceiptSchema.optional(),
}).strict().superRefine((proposal, context) => {
  if (proposal.appliedReceipt) {
    if (proposal.appliedReceipt.tripId !== proposal.tripId) context.addIssue({ code: 'custom', path: ['appliedReceipt', 'tripId'], message: 'Receipt belongs to another trip' });
    if (proposal.appliedReceipt.proposalId !== proposal.id) context.addIssue({ code: 'custom', path: ['appliedReceipt', 'proposalId'], message: 'Receipt belongs to another proposal' });
    if (proposal.appliedReceipt.revision !== proposal.baseVersion + 1) context.addIssue({ code: 'custom', path: ['appliedReceipt', 'revision'], message: 'Receipt revision must follow proposal base version' });
  }
});
export type Proposal = z.infer<typeof proposalSchema>;

export const confirmProposalRequestSchema = z.object({ proposalId: identifierSchema, expectedVersion: nonNegativeIntegerSchema, idempotencyKey: identifierSchema }).strict();
export type ConfirmProposalRequest = z.infer<typeof confirmProposalRequestSchema>;

export function parsePlace(input: unknown): Result<Place> { return parseWithSchema(placeSchema, input); }
export function parseStop(input: unknown): Result<Stop> { return parseWithSchema(stopSchema, input); }
export function parseDayPlan(input: unknown): Result<DayPlan> { return parseWithSchema(dayPlanSchema, input); }
export function parseItinerary(input: unknown): Result<Itinerary> { return parseWithSchema(itinerarySchema, input); }
export function parseProposal(input: unknown): Result<Proposal> { return parseWithSchema(proposalSchema, input); }
export function parseConfirmProposalRequest(input: unknown): Result<ConfirmProposalRequest> { return parseWithSchema(confirmProposalRequestSchema, input); }
