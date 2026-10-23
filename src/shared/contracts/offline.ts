import { z } from 'zod';
import {
  identifierSchema, localeSchema, nonNegativeIntegerSchema, parseWithSchema, photoManifestEntrySchema,
  sha256Schema, utcTimestampSchema, type PhotoManifestEntry, type Result,
} from './common';
import { itinerarySchema, type Place } from './itinerary';
import { tripSchema } from './trip';

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function addDays(dateText: string, dayOffset: number): string {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date.toISOString().slice(0, 10);
}

function placesInDays(days: Array<{ stops: Array<{ place: Place }>; suggestions: Place[] }>, reportConflict: (placeId: string) => void): Map<string, Place> {
  const places = new Map<string, Place>();
  for (const day of days) {
    for (const place of [...day.stops.map((stop) => stop.place), ...day.suggestions]) {
      const prior = places.get(place.id);
      if (!prior) places.set(place.id, place);
      else if (canonicalJson(prior) !== canonicalJson(place)) reportConflict(place.id);
    }
  }
  return places;
}

export const offlineSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  ownerUid: identifierSchema,
  tripId: identifierSchema,
  revision: nonNegativeIntegerSchema,
  locale: localeSchema,
  sessionGeneration: nonNegativeIntegerSchema,
  savedAt: utcTimestampSchema,
  trip: tripSchema,
  payload: itinerarySchema,
  assets: z.array(photoManifestEntrySchema),
  checksum: sha256Schema,
}).strict().superRefine((snapshot, context) => {
  if (snapshot.tripId !== snapshot.trip.id || snapshot.tripId !== snapshot.payload.tripId) context.addIssue({ code: 'custom', path: ['tripId'], message: 'Snapshot components must refer to the same trip' });
  if (snapshot.revision !== snapshot.trip.revision || snapshot.revision !== snapshot.payload.revision) context.addIssue({ code: 'custom', path: ['revision'], message: 'Snapshot components must have the same revision' });
  if (snapshot.locale !== snapshot.payload.locale) context.addIssue({ code: 'custom', path: ['locale'], message: 'Snapshot locale must match the itinerary locale' });
  if (!snapshot.trip.memberUids.includes(snapshot.ownerUid)) context.addIssue({ code: 'custom', path: ['ownerUid'], message: 'Snapshot owner must be a trip member' });

  const expectedDays = snapshot.trip.dates.days;
  if (snapshot.payload.days.length !== expectedDays) context.addIssue({ code: 'custom', path: ['payload', 'days'], message: 'Snapshot needs one itinerary day per trip day' });
  const baseForDay = (dayNumber: number) => snapshot.trip.bases.find((base) => base.startDay <= dayNumber && dayNumber <= base.endDay)?.id;
  snapshot.payload.days.forEach((day, index) => {
    const expectedDate = snapshot.trip.dates.start ? addDays(snapshot.trip.dates.start, index) : undefined;
    if (day.date !== expectedDate) context.addIssue({ code: 'custom', path: ['payload', 'days', index, 'date'], message: 'Day date must match the trip calendar' });
    const expectedBase = baseForDay(day.dayNumber);
    if (day.baseId !== expectedBase) context.addIssue({ code: 'custom', path: ['payload', 'days', index, 'baseId'], message: 'Day base must cover this day' });
  });

  const places = placesInDays(snapshot.payload.days, (placeId) => {
    context.addIssue({ code: 'custom', path: ['payload', 'days'], message: `Place ${placeId} has conflicting representations` });
  });
  const entriesByPlace = new Map<string, PhotoManifestEntry>();
  const assetIds = new Set<string>();
  snapshot.assets.forEach((entry, index) => {
    if (entriesByPlace.has(entry.placeId)) context.addIssue({ code: 'custom', path: ['assets', index, 'placeId'], message: 'Manifest has duplicate place entries' });
    entriesByPlace.set(entry.placeId, entry);
    if (entry.status === 'included') {
      if (assetIds.has(entry.assetId)) context.addIssue({ code: 'custom', path: ['assets', index, 'assetId'], message: 'Manifest asset IDs must be unique' });
      assetIds.add(entry.assetId);
    }
    if (!places.has(entry.placeId)) context.addIssue({ code: 'custom', path: ['assets', index, 'placeId'], message: 'Manifest contains a foreign place' });
  });
  for (const [placeId, place] of places) {
    const entry = entriesByPlace.get(placeId);
    if (!entry) {
      context.addIssue({ code: 'custom', path: ['assets'], message: `Manifest is missing place ${placeId}` });
      continue;
    }
    if (!place.photo) {
      if (entry.status !== 'unavailable' || !['missing', 'license'].includes(entry.reason)) context.addIssue({ code: 'custom', path: ['assets'], message: `Place ${placeId} without a photo must be marked missing or license-excluded` });
    } else if (place.photo.cacheAllowed) {
      if (entry.status !== 'included' || canonicalJson(entry.image) !== canonicalJson(place.photo)) context.addIssue({ code: 'custom', path: ['assets'], message: `Eligible photo for ${placeId} must be included exactly` });
    } else if (entry.status !== 'unavailable' || entry.reason !== 'cache_forbidden') {
      context.addIssue({ code: 'custom', path: ['assets'], message: `Uncacheable photo for ${placeId} must be marked cache_forbidden` });
    }
  }
});
export type OfflineSnapshot = z.infer<typeof offlineSnapshotSchema>;

export function parseOfflineSnapshot(input: unknown): Result<OfflineSnapshot> { return parseWithSchema(offlineSnapshotSchema, input); }
