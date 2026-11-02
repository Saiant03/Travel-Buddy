import type { Dispatch } from 'react';
import { Button, Card, Field } from '../../ui/components';
import type { Locale } from '../../shared/contracts/common';
import { resolvePlaces } from './contracts';
import { demoProvider } from './demo-provider';
import type { DemoAction, DemoState, Scenario } from './demo-model';
import { placeMessages } from './messages';
import './place-resolution.css';

type Props = { locale: Locale; state: DemoState; dispatch: Dispatch<DemoAction> };
const scenarios: Scenario[] = [
  'zero', 'one', 'multiple', 'invalid_response', 'unavailable', 'timeout', 'quota_exhausted',
];

export function PlaceResolution({ locale, state, dispatch }: Props) {
  const messages = placeMessages[locale];

  async function identify() {
    const request = state.request + 1;
    dispatch({ type: 'start' });
    const result = await resolvePlaces(demoProvider(state.scenario), { input: state.input, locale });
    if (result.ok) {
      dispatch({ type: 'result', request, places: result.data });
    } else {
      dispatch({ type: 'failure', request, error: result.error.code });
      if (result.error.code === 'VALIDATION_ERROR') document.getElementById('place-input')?.focus();
    }
  }

  const confirmed = state.places.find((place) => place.id === state.confirmed);
  const validationError = state.error === 'VALIDATION_ERROR';

  return (
    <section className="resolution">
      <div className="page-heading">
        <h1>{messages.title}</h1>
        <p className="lead">{messages.intro}</p>
        <p>{messages.memory}</p>
      </div>
      <Card className="resolution-ticket">
        <form onSubmit={(event) => { event.preventDefault(); void identify(); }}>
          <p id="place-hint">{messages.hint}</p>
          <Field
            label={messages.input}
            id="place-input"
            name="place-input"
            autoComplete="off"
            value={state.input}
            aria-describedby={validationError ? 'place-hint place-error' : 'place-hint'}
            aria-invalid={validationError}
            onChange={(event) => dispatch({ type: 'edit', value: event.target.value })}
          />
          <label htmlFor="place-scenario">{messages.scenario}</label>
          <select
            id="place-scenario"
            name="place-scenario"
            value={state.scenario}
            onChange={(event) => dispatch({ type: 'scenario', value: event.target.value as Scenario })}
          >
            {scenarios.map((value) => <option key={value} value={value}>{messages[value]}</option>)}
          </select>
          <Button type="submit" disabled={state.status === 'loading'}>{messages.identify}</Button>
        </form>
        <div aria-live="polite">
          {state.status === 'loading' && <p>{messages.loading}</p>}
          {state.status === 'error' && (
            <p role="alert" id="place-error">
              {validationError
                ? messages.validation
                : `${messages.simulation}: ${messages.errors[state.error as keyof typeof messages.errors]}. ${messages.retry}`}
            </p>
          )}
          {state.status === 'success' && state.places.length === 0 && <p>{messages.empty}</p>}
          {state.places.length > 0 && (
            <>
              <fieldset>
                <legend>{messages.choose}</legend>
                {state.places.map((place) => (
                  <label className="resolution-choice" key={place.id}>
                    <input
                      type="radio"
                      name="place"
                      checked={state.selected === place.id}
                      onChange={() => dispatch({ type: 'select', value: place.id })}
                    />
                    <span>
                      <strong>{place.name}</strong><br />
                      {messages.coordinates}: {place.location.lat}, {place.location.lng}<br />
                      {messages.source}: {place.sources.map((source) => source.url).join(', ')}
                    </span>
                  </label>
                ))}
              </fieldset>
              <Button disabled={!state.selected} onClick={() => dispatch({ type: 'confirm' })}>
                {messages.confirm}
              </Button>
            </>
          )}
          {confirmed && (
            <p className="resolution-confirmed">
              <strong>{messages.confirmed}</strong>: {confirmed.name}<br />
              {messages.coordinates}: {confirmed.location.lat}, {confirmed.location.lng}<br />
              {messages.source}: {confirmed.sources.map((source) => source.url).join(', ')}
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
