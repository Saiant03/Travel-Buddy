import { useReducer } from 'react';
import { createRoot } from 'react-dom/client';
import { createInitialItineraryDemoState, itineraryDemoReducer } from '../../src/domain/itinerary/demo';
import { ItineraryPage } from '../../src/features/itinerary/ItineraryPage';
function Harness() {
  const [state, dispatch] = useReducer(itineraryDemoReducer, undefined, createInitialItineraryDemoState);
  return <><button onClick={() => dispatch({type: 'select-day', dayNumber: 99})}>Inject unknown day</button><button onClick={() => dispatch({type: 'open-stop', stopId: 'unknown'})}>Inject unknown stop</button><ItineraryPage locale="ro" state={state} dispatch={dispatch} /></>;
}
createRoot(document.getElementById('root')!).render(<Harness />);
