import type { Place } from '../../shared/contracts/itinerary';
import type { ProviderFailure } from '../../shared/contracts/provider';

export type Scenario = 'zero' | 'one' | 'multiple' | ProviderFailure['code'];
export type DemoState = {
  input: string;
  scenario: Scenario;
  places: Place[];
  selected: string | null;
  confirmed: string | null;
  request: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: ProviderFailure['code'] | 'VALIDATION_ERROR' | null;
};
export type DemoAction =
  | { type: 'edit'; value: string }
  | { type: 'scenario'; value: Scenario }
  | { type: 'start' }
  | { type: 'result'; request: number; places: Place[] }
  | { type: 'failure'; request: number; error: NonNullable<DemoState['error']> }
  | { type: 'select'; value: string }
  | { type: 'confirm' };

export function createResolutionDemoState(): DemoState {
  return {
    input: '', scenario: 'one', places: [], selected: null, confirmed: null,
    request: 0, status: 'idle', error: null,
  };
}

export function transition(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'edit':
      return {
        ...state, input: action.value, places: [], selected: null, confirmed: null,
        request: state.request + 1, status: 'idle', error: null,
      };
    case 'scenario':
      return {
        ...state, scenario: action.value, places: [], selected: null, confirmed: null,
        request: state.request + 1, status: 'idle', error: null,
      };
    case 'start':
      return {
        ...state, places: [], selected: null, confirmed: null,
        request: state.request + 1, status: 'loading', error: null,
      };
    case 'result':
      return action.request !== state.request
        ? state
        : { ...state, places: action.places, status: 'success' };
    case 'failure':
      return action.request !== state.request
        ? state
        : { ...state, status: 'error', error: action.error };
    case 'select':
      return {
        ...state,
        selected: state.places.some((place) => place.id === action.value) ? action.value : null,
        confirmed: null,
      };
    case 'confirm':
      return {
        ...state,
        confirmed: state.places.some((place) => place.id === state.selected) ? state.selected : null,
      };
  }
}
