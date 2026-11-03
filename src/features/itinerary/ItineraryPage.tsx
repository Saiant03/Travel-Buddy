import { useEffect, useRef, type Dispatch } from 'react';
import type { Locale } from '../../app/i18n';
import { selectItineraryDemo, type ItineraryDemoAction, type ItineraryDemoState, type DemoScenario } from '../../domain/itinerary/demo';
import { itineraryMessages } from './messages';
import { PlaceDetail } from './PlaceDetail';
import './itinerary.css';
export function ItineraryPage({ locale, state, dispatch }: { locale: Locale; state: ItineraryDemoState; dispatch: Dispatch<ItineraryDemoAction> }) {
  const m = itineraryMessages[locale];
  const { day, stop } = selectItineraryDemo(state);
  const heading = useRef<HTMLHeadingElement>(null);
  const origin = useRef<string | null>(null);
  const controls = useRef<Record<string, HTMLButtonElement | null>>({});
  const restore = useRef(false);
  useEffect(() => { if (restore.current && state.selectedStopId === null) { (origin.current ? controls.current[origin.current] : null)?.focus(); if (!origin.current || !controls.current[origin.current]) heading.current?.focus(); restore.current = false; } }, [state.selectedStopId, state.selectedDayNumber]);
  return <section className="itinerary"><h1 ref={heading} tabIndex={-1}>{m.title}</h1><p className="itinerary-notice">{m.notice}</p>
    <label>{m.scenario} <select value={state.scenario} onChange={e => dispatch({ type: 'load-scenario', scenario: e.target.value as DemoScenario })}><option value="standard">{m.standard}</option><option value="invalid">{m.invalid}</option></select></label>
    {!state.result.ok ? <div role="alert"><p>{m.error}</p><button className="button" onClick={() => dispatch({type:'load-scenario', scenario:'standard'})}>{m.recover}</button></div> : <>
      <nav className="itinerary-days" aria-label={m.day}>{state.result.data.days.map(d => <button className="button button-secondary" key={d.dayNumber} aria-pressed={d.dayNumber === state.selectedDayNumber} onClick={() => dispatch({type:'select-day', dayNumber:d.dayNumber})}>{m.day} {d.dayNumber}</button>)}</nav>
      {!day ? <div role="alert"><p>{m.unknownDay}</p><button className="button button-secondary" onClick={() => { origin.current = null; restore.current = true; dispatch({type: 'select-day', dayNumber: 1}); }}>{m.returnItinerary}</button></div> : <><p>{m.day} {day.dayNumber} · {day.date ?? m.date}</p>
      {state.selectedStopId !== null && !stop ? <div role="alert"><p>{m.unknownStop}</p><button className="button button-secondary" onClick={() => { origin.current = null; restore.current = true; dispatch({type: 'close-details'}); }}>{m.returnDay}</button></div> : stop ? <PlaceDetail locale={locale} stop={stop} context={`${m.day} ${day.dayNumber} / ${m.stop} ${day.stops.findIndex(item => item.id === stop.id) + 1}`} onBack={() => { origin.current = stop.id; restore.current = true; dispatch({type:'close-details'}); }} /> : day.stops.length === 0 ? <p>{m.empty}</p> : <ol className="itinerary-stops">{day.stops.map(s => <li key={s.id}><strong>{s.place.name}</strong><button ref={el => { controls.current[s.id] = el; }} className="button button-secondary" onClick={() => { origin.current = s.id; dispatch({type:'open-stop', stopId:s.id}); }}>{m.details} {s.place.name}</button></li>)}</ol>}</>}
    </>}
  </section>;
}
