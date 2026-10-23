import { z } from 'zod';
import {
  calendarDateSchema, identifierSchema, moneySchema, nonNegativeIntegerSchema, parseWithSchema, placeRefSchema,
  positiveIntegerSchema, timeSchema, type Result,
} from './common';

export const baseStaySchema = z.object({
  id: identifierSchema,
  place: placeRefSchema,
  startDay: positiveIntegerSchema,
  endDay: positiveIntegerSchema,
}).strict().refine((base) => base.startDay <= base.endDay, { path: ['endDay'], message: 'End day must be on or after start day' });
export type BaseStay = z.infer<typeof baseStaySchema>;

export const tripSchema = z.object({
  schemaVersion: z.literal(1),
  id: identifierSchema,
  revision: nonNegativeIntegerSchema,
  memberUids: z.tuple([identifierSchema, identifierSchema]),
  destination: placeRefSchema,
  dates: z.object({ start: calendarDateSchema.optional(), end: calendarDateSchema.optional(), days: positiveIntegerSchema }).strict(),
  transport: z.array(z.enum(['walk', 'transit', 'car'])).min(1),
  bases: z.array(baseStaySchema),
  arrivalTime: timeSchema.optional(),
  departureTime: timeSchema.optional(),
  budget: moneySchema.optional(),
}).strict().superRefine((trip, context) => {
  const [firstUid, secondUid] = trip.memberUids;
  if (firstUid === secondUid) context.addIssue({ code: 'custom', path: ['memberUids'], message: 'Trip must have two distinct members' });
  if (new Set(trip.transport).size !== trip.transport.length) context.addIssue({ code: 'custom', path: ['transport'], message: 'Transport choices must be unique' });
  const { start, end, days } = trip.dates;
  if ((start === undefined) !== (end === undefined)) context.addIssue({ code: 'custom', path: ['dates'], message: 'Start and end dates must be supplied together' });
  if (start !== undefined && end !== undefined) {
    const startMs = Date.parse(`${start}T00:00:00Z`);
    const endMs = Date.parse(`${end}T00:00:00Z`);
    const inclusiveDays = Math.floor((endMs - startMs) / 86_400_000) + 1;
    if (inclusiveDays !== days) context.addIssue({ code: 'custom', path: ['dates', 'days'], message: 'Day count must match the inclusive date range' });
  }
  const baseIds = new Set<string>();
  trip.bases.forEach((base, index) => {
    if (baseIds.has(base.id)) context.addIssue({ code: 'custom', path: ['bases', index, 'id'], message: 'Base IDs must be unique' });
    baseIds.add(base.id);
    if (base.endDay > days) context.addIssue({ code: 'custom', path: ['bases', index, 'endDay'], message: 'Base must stay within the trip' });
  });
  const ordered = [...trip.bases].sort((a, b) => a.startDay - b.startDay);
  ordered.forEach((base, index) => {
    const previous = ordered[index - 1];
    if (previous && base.startDay <= previous.endDay) context.addIssue({ code: 'custom', path: ['bases'], message: 'Base day ranges may not overlap' });
  });
});
export type Trip = z.infer<typeof tripSchema>;

export function parseBaseStay(input: unknown): Result<BaseStay> { return parseWithSchema(baseStaySchema, input); }
export function parseTrip(input: unknown): Result<Trip> { return parseWithSchema(tripSchema, input); }
