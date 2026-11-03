import type { Itinerary } from '../../shared/contracts/itinerary';
import type { Result } from '../../shared/contracts/common';
import { parseItinerary } from '../../shared/contracts/itinerary';

export type DemoScenario = 'standard' | 'invalid';
export type ItineraryDemoState = {
  scenario: DemoScenario;
  result: Result<Itinerary>;
  selectedDayNumber: number | null;
  selectedStopId: string | null;
};
export type ItineraryDemoAction =
  | { type: 'load-scenario'; scenario: DemoScenario }
  | { type: 'select-day'; dayNumber: number }
  | { type: 'open-stop'; stopId: string }
  | { type: 'close-details' };
function makePlace(id: string, name: string, description?: string) {
  return {
    id,
    name,
    location: { lat: 40.71, lng: -74.0 },
    ...(description === undefined ? {} : { description }),
    sources: [{ url: `https://sources.invalid/${id}`, title: 'Synthetic demo reference', checkedAt: '2026-11-03T00:00:00Z' }],
    confidence: 'unconfirmed' as const,
    matchReasons: ['Synthetic local demonstration data'],
  };
}

function createStandardFixture(): Itinerary {
  return {
    schemaVersion: 1,
    tripId: 'synthetic-demo-trip',
    revision: 0,
    locale: 'ro',
    days: [
      { dayNumber: 1, stops: [
        { id: 'synthetic-stop-zinnia', place: makePlace('synthetic-place-zinnia', 'Fictional Zinnia Workshop', 'A fictional room for making paper flowers.') },
        { id: 'synthetic-stop-amber', place: makePlace('synthetic-place-amber', 'Fictional Amber Courtyard') },
        { id: 'synthetic-stop-cobalt', place: makePlace('synthetic-place-cobalt', 'Fictional Cobalt Reading Room', 'A made-up quiet reading space.') },
      ], suggestions: [] },
      { dayNumber: 2, stops: [
        { id: 'synthetic-stop-maple', place: makePlace('synthetic-place-maple', 'Fictional Maple Lantern Studio') },
        { id: 'synthetic-stop-ivory', place: makePlace('synthetic-place-ivory', 'Fictional Ivory Garden Room', 'A fictional indoor garden room.') },
      ], suggestions: [] },
      { dayNumber: 3, stops: [], suggestions: [] },
    ],
  };
}

export function loadItineraryDemo(scenario: DemoScenario): Result<Itinerary> {
  const candidate = createStandardFixture();
  if (scenario === 'invalid') candidate.days[0]!.dayNumber = 9;
  return parseItinerary(candidate);
}
export function createInitialItineraryDemoState(scenario: DemoScenario = 'standard'): ItineraryDemoState {
  return { scenario, result: loadItineraryDemo(scenario), selectedDayNumber: 1, selectedStopId: null };
}
export function itineraryDemoReducer(state: ItineraryDemoState, action: ItineraryDemoAction): ItineraryDemoState {
  switch (action.type) {
    case 'load-scenario':
      return { scenario: action.scenario, result: loadItineraryDemo(action.scenario), selectedDayNumber: 1, selectedStopId: null };
    case 'select-day':
      return { ...state, selectedDayNumber: action.dayNumber, selectedStopId: null };
    case 'open-stop':
      return { ...state, selectedStopId: action.stopId };
    case 'close-details':
      return { ...state, selectedStopId: null };
  }
}

export function selectItineraryDemo(state: ItineraryDemoState) {
  if (!state.result.ok) return { day: null, stop: null };
  const day = state.result.data.days.find((candidate) => candidate.dayNumber === state.selectedDayNumber) ?? null;
  if (!day || state.selectedStopId === null) return { day, stop: null };
  const stop = day.stops.find((candidate) => candidate.id === state.selectedStopId) ?? null;
  return { day, stop };
}
