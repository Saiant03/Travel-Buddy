import type { Locale } from '../../shared/contracts/common';
import { useSyncExternalStore } from 'react';
import type { GenerationDemoController, GenerationScenario } from '../../domain/generation/demo';
import { Button, Card } from '../../ui/components';
import { generationMessages } from './messages';
import { generationStore } from './generation-store';
import './generation.css';

type Props = { locale: Locale; controller: GenerationDemoController; scenario: GenerationScenario; setScenario: (scenario: GenerationScenario) => void };

export function GenerationPageShell({ locale, controller, scenario, setScenario }: Props) {
  const messages = generationMessages[locale];
  const scenarios = Object.entries(messages.scenarios);
  const store = generationStore(controller);
  const { state, busy } = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const active = state.job?.status === 'queued' || state.job?.status === 'running';
  const errorKey = state.error && ('retryable' in state.error ? state.error.code : 'VALIDATION_ERROR');
  const canRetry = state.job?.status === 'partial' || (state.job?.status === 'failed' && !!state.error && 'retryable' in state.error && state.error.retryable);
  return (
    <section className="generation-page">
      <div className="generation-heading">
        <div><h1>{messages.title}</h1><p className="lead">{messages.intro}</p><p>{messages.memory}</p></div>
        <div className="generation-passport" aria-hidden="true"><span>Travel Buddy</span><strong>✳</strong><span>Bon voyage</span></div>
      </div>
      <Card className="generation-controls">
        <label htmlFor="generation-scenario">{messages.scenario}</label>
        <select id="generation-scenario" value={scenario} onChange={(event) => setScenario(event.target.value as GenerationScenario)}>{scenarios.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <Button disabled={active} onClick={() => store.start(scenario, locale)}>{messages.start}</Button>
        <Button className="button-secondary" disabled={!active || busy} onClick={() => store.nextStep()}>{messages.next}</Button>
        {canRetry && <Button className="button-secondary" onClick={() => store.retry()}>{messages.retry}</Button>}
        {state.job && <Button className="button-secondary" onClick={() => store.restart(scenario, locale)}>{messages.newAttempt}</Button>}
      </Card>
      <Card className="generation-progress">
        <div className="generation-progress-heading"><h2>{messages.progress}</h2><span>{state.job?.completed ?? 0} / 3</span></div>
        <progress aria-label={messages.progress} max={3} value={state.job?.completed ?? 0} />
        <ol className="generation-stages">{messages.stages.map((label, index) => <li key={label} data-complete={index < (state.job?.completed ?? 0)} aria-current={active && index === state.job?.completed ? 'step' : undefined}>{label}</li>)}</ol>
        <p className="generation-status" role="status" aria-live="polite">{state.job ? messages.statuses[state.job.status] : messages.waiting}</p>
        {busy && <p>{messages.busy}</p>}
        {errorKey && <p role="alert">{messages.errors[errorKey]}</p>}
        {errorKey && <p>{messages.recovery[errorKey === 'VALIDATION_ERROR' ? 'invalid' : errorKey === 'quota_exhausted' ? 'quota' : 'retryable']}</p>}
      </Card>
      {state.result && <Card className="generation-result">
        <h2>{messages.resultTitle}</h2>
        <p>{messages.fictional}</p>
        <p>{messages.completeNotice}</p>
        <p>{messages.notSaved}</p>
        {state.result.days.map((day) => <article key={day.id}>
          <h3>{messages.day} {day.dayNumber}</h3>
          {day.placeIds.map((id) => <p key={id}>{messages.place} {id.endsWith('-1') ? 1 : 2}</p>)}
        </article>)}
        {state.result.missingSections.length > 0 && <p>{messages.missing}: {state.result.missingSections.map((id) => `${messages.day} ${id.endsWith('-1') ? 1 : 2}`).join(', ')}</p>}
        {state.result.sources.map((source) => <p key={source.id}>{messages.source}: <span>{source.ref.url}</span></p>)}
      </Card>}
    </section>
  );
}
