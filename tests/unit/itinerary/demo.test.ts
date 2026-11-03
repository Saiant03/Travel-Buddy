import { describe, expect, it } from 'vitest';
import { parseItinerary } from '../../../src/shared/contracts/itinerary';
import { loadItineraryDemo } from '../../../src/domain/itinerary/demo';

describe('local itinerary demo', () => {
  it('loads a deterministic three-day fixture in its declared stop order', () => {
    const first = loadItineraryDemo('standard');
    const second = loadItineraryDemo('standard');

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(first.data).toEqual(second.data);
    expect(first.data.days.map((day) => day.dayNumber)).toEqual([1, 2, 3]);
    expect(first.data.days.map((day) => day.stops.map((stop) => stop.id))).toEqual([
      ['synthetic-stop-zinnia', 'synthetic-stop-amber', 'synthetic-stop-cobalt'],
      ['synthetic-stop-maple', 'synthetic-stop-ivory'],
      [],
    ]);
    expect(first.data.days[0]?.stops.map((stop) => stop.place.name)).toEqual([
      'Fictional Zinnia Workshop', 'Fictional Amber Courtyard', 'Fictional Cobalt Reading Room',
    ]);
    expect(first.data.days[0]?.stops.every((stop) => stop.place.confidence === 'unconfirmed')).toBe(true);
    expect(first.data.days[0]?.stops.every((stop) => stop.place.sources.every((source) => new URL(source.url).hostname.endsWith('.invalid')))).toBe(true);
    expect(parseItinerary(first.data).ok).toBe(true);
  });

  it('returns isolated fixture copies so one caller cannot alter another load', () => {
    const first = loadItineraryDemo('standard');
    const second = loadItineraryDemo('standard');
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    first.data.days[0]!.stops[0]!.place.name = 'Changed by caller';
    expect(second.data.days[0]?.stops[0]?.place.name).toBe('Fictional Zinnia Workshop');
  });

  it('reports schema validation failure for the invalid scenario', () => {
    const result = loadItineraryDemo('invalid');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(result.error.issues.length).toBeGreaterThan(0);
  });

  it('marks every fixture identity and name as synthetic', () => {
    const result = loadItineraryDemo('standard');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (const day of result.data.days) {
      for (const stop of day.stops) {
        expect(stop.id.startsWith('synthetic-')).toBe(true);
        expect(stop.place.id.startsWith('synthetic-')).toBe(true);
        expect(stop.place.name.startsWith('Fictional ')).toBe(true);
      }
    }
  });

  it('leaves dates and unsupported travel details absent', () => {
    const result = loadItineraryDemo('standard');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.days[1]?.date).toBeUndefined();
    expect(result.data.days[2]?.stops).toEqual([]);
    for (const day of result.data.days) {
      expect(day.route).toBeUndefined();
      for (const stop of day.stops) {
        expect(stop.fixedTime).toBeUndefined();
        expect(stop.place.address).toBeUndefined();
        expect(stop.place.photo).toBeUndefined();
        expect(stop.place.price).toBeUndefined();
        expect(stop.place.opening).toBeUndefined();
        expect(stop.place.reservation).toBeUndefined();
      }
    }
  });
});
