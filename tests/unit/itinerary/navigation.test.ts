import { describe, expect, it } from 'vitest';
import {
  createInitialItineraryDemoState,
  itineraryDemoReducer,
  selectItineraryDemo,
} from '../../../src/domain/itinerary/demo';

describe('local itinerary selection state', () => {
  it('selects day two and exposes its stops in fixture order', () => {
    const state = itineraryDemoReducer(createInitialItineraryDemoState(), { type: 'select-day', dayNumber: 2 });
    expect(state.selectedDayNumber).toBe(2);
    expect(selectItineraryDemo(state).day?.stops.map((stop) => stop.id)).toEqual(['synthetic-stop-maple', 'synthetic-stop-ivory']);
  });

  it('opens a stop only when it belongs to the selected day', () => {
    const state = itineraryDemoReducer(createInitialItineraryDemoState(), { type: 'open-stop', stopId: 'synthetic-stop-amber' });
    expect(selectItineraryDemo(state).stop?.id).toBe('synthetic-stop-amber');
    const wrongDay = itineraryDemoReducer(state, { type: 'select-day', dayNumber: 2 });
    const invalidStop = itineraryDemoReducer(wrongDay, { type: 'open-stop', stopId: 'synthetic-stop-amber' });
    expect(invalidStop.selectedStopId).toBe('synthetic-stop-amber');
    expect(selectItineraryDemo(invalidStop)).toEqual({ day: expect.objectContaining({ dayNumber: 2 }), stop: null });
  });

  it('closes details while preserving the selected day', () => {
    const dayTwo = itineraryDemoReducer(createInitialItineraryDemoState(), { type: 'select-day', dayNumber: 2 });
    const opened = itineraryDemoReducer(dayTwo, { type: 'open-stop', stopId: 'synthetic-stop-maple' });
    const closed = itineraryDemoReducer(opened, { type: 'close-details' });
    expect(closed.selectedDayNumber).toBe(2);
    expect(closed.selectedStopId).toBeNull();
    expect(selectItineraryDemo(closed).day?.dayNumber).toBe(2);
  });

  it('closes details when changing the selected day', () => {
    const opened = itineraryDemoReducer(createInitialItineraryDemoState(), { type: 'open-stop', stopId: 'synthetic-stop-amber' });
    const selected = itineraryDemoReducer(opened, { type: 'select-day', dayNumber: 2 });
    expect(selected.selectedDayNumber).toBe(2);
    expect(selected.selectedStopId).toBeNull();
  });

  it('shows no day or stop for unknown day selections', () => {
    const invalid = itineraryDemoReducer(createInitialItineraryDemoState(), { type: 'select-day', dayNumber: 99 });
    expect(invalid.selectedDayNumber).toBe(99);
    expect(selectItineraryDemo(invalid)).toEqual({ day: null, stop: null });
  });

  it('shows no day or stop when the invalid scenario fails schema parsing', () => {
    const invalid = itineraryDemoReducer(createInitialItineraryDemoState(), { type: 'load-scenario', scenario: 'invalid' });
    expect(invalid.scenario).toBe('invalid');
    expect(invalid.result.ok).toBe(false);
    expect(selectItineraryDemo(invalid)).toEqual({ day: null, stop: null });
  });

  it('does not mutate the prior state during navigation', () => {
    const before = createInitialItineraryDemoState();
    const selected = itineraryDemoReducer(before, { type: 'select-day', dayNumber: 2 });
    expect(before.selectedDayNumber).toBe(1);
    expect(selected).not.toBe(before);
  });
});
