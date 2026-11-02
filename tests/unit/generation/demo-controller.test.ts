import { describe, expect, it } from 'vitest';
import {
  createDemoExecutor,
  GenerationDemoController,
  type GenerationDemoExecutor,
  type GenerationScenario,
  type GenerationStage,
} from '../../../src/domain/generation/demo';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

async function finish(scenario: GenerationScenario, executor = createDemoExecutor()) {
  const controller = new GenerationDemoController(executor);
  controller.start(scenario);
  for (let count = 0; count < 4 && (controller.state.job?.status === 'queued' || controller.state.job?.status === 'running'); count += 1) {
    await controller.nextStep();
  }
  return controller.state;
}

describe('local generation controller', () => {
  it('counts a stage only after its injected executor finishes', async () => {
    const pending = deferred<unknown>();
    const controller = new GenerationDemoController({ execute: () => pending.promise });
    controller.start('success');
    const running = controller.nextStep();

    expect(controller.state.job?.status).toBe('running');
    expect(controller.state.job?.completed).toBe(0);
    pending.resolve({ stage: 'search', candidateIds: ['fictional-place-1'] });
    await running;

    expect(controller.state.job?.completed).toBe(1);
    expect(controller.state.job?.stage).toBe('organize');
  });

  it('does not replace a running job when a new start is attempted', async () => {
    const pending = deferred<unknown>();
    const controller = new GenerationDemoController({ execute: () => pending.promise });
    controller.start('success');
    const running = controller.nextStep();
    const activeJob = controller.state.job;

    expect(controller.start('partial')).toBe(false);
    expect(controller.state.job).toBe(activeJob);
    pending.resolve({ stage: 'search', candidateIds: ['fictional-place-1'] });
    await running;
    expect(controller.state.job?.completed).toBe(1);
  });

  it.each([
    ['success', 'complete', 3],
    ['partial', 'partial', 3],
    ['invalid_result', 'failed', 2],
    ['unavailable', 'failed', 0],
    ['timeout', 'failed', 0],
    ['quota_exhausted', 'quota_exhausted', 0],
  ] as const)('handles %s as %s and counts only executed stages', async (scenario, status, completed) => {
    const state = await finish(scenario);
    expect(state.job?.status).toBe(status);
    expect(state.job?.completed).toBe(completed);
  });

  it('rejects an invalid final result and never exposes it as a completed trip', async () => {
    const state = await finish('invalid_result');
    expect(state.job?.status).toBe('failed');
    expect(state.job?.errorCode).toBe('VALIDATION_ERROR');
    expect(state.result).toBeNull();
  });

  it('allows retry only by an explicit call after a retryable failure', async () => {
    const controller = new GenerationDemoController(createDemoExecutor());
    controller.start('unavailable');
    await controller.nextStep();
    expect(controller.state.job?.status).toBe('failed');
    expect(controller.retry()).toBe(true);
    expect(controller.state.job?.status).toBe('queued');
    expect(controller.state.job?.completed).toBe(0);
  });

  it('does not call the executor as part of a manual retry', async () => {
    let calls = 0;
    const controller = new GenerationDemoController({ execute: async () => { calls += 1; throw { code: 'unavailable', retryable: true }; } });
    controller.start('unavailable');
    await controller.nextStep();
    expect(calls).toBe(1);
    expect(controller.retry()).toBe(true);
    expect(calls).toBe(1);
    expect(controller.state.job?.status).toBe('queued');
  });

  it('permits an explicit retry of a partial result', async () => {
    const controller = new GenerationDemoController(createDemoExecutor());
    controller.start('partial');
    await controller.nextStep(); await controller.nextStep(); await controller.nextStep();
    expect(controller.state.job?.status).toBe('partial');
    expect(controller.retry()).toBe(true);
    expect(controller.state.job?.status).toBe('queued');
    expect(controller.state.result).toBeNull();
  });

  it('keeps fixture result fields fictional and visibly unconfirmed', async () => {
    const state = await finish('success');
    const result = state.result!;
    expect(state.job?.status).toBe('complete');
    expect(result.fictitious).toBe(true);
    expect(result.confirmed).toBe(false);
    expect(result.sources[0]).toMatchObject({ ref: { url: 'https://source.example.invalid/demo' }, verified: false });
    expect(result.places[0]).toMatchObject({ id: 'fictional-place-1', confidence: 'unconfirmed', location: { lat: 38.72, lng: -9.14 } });
  });

  it('passes each manually requested stage and scenario to the injected executor', async () => {
    const calls: Array<[GenerationStage, GenerationScenario]> = [];
    const executor: GenerationDemoExecutor = { execute: async (stage, scenario) => { calls.push([stage, scenario]); return stage === 'search' ? { stage, candidateIds: ['fictional-place-1'] } : { stage, dayNumbers: [1, 2] }; } };
    const controller = new GenerationDemoController(executor);
    controller.start('success');
    await controller.nextStep();
    await controller.nextStep();
    expect(calls).toEqual([['search', 'success'], ['organize', 'success']]);
    expect(controller.state.job?.completed).toBe(2);
  });

  it('keeps timeout as a retryable ProviderFailure and maps only the job code canonically', async () => {
    const state = await finish('timeout');
    expect(state.error).toEqual({ code: 'timeout', retryable: true });
    expect(state.job?.errorCode).toBe('PROVIDER_UNAVAILABLE');
  });

  it('localizes fixture names and source titles for the selected locale', async () => {
    const controller = new GenerationDemoController(createDemoExecutor());
    controller.start('success', 'fr');
    await controller.nextStep(); await controller.nextStep(); await controller.nextStep();
    expect(controller.state.result?.places[0]?.name).toBe('Lieu fictif 1');
    expect(controller.state.result?.sources[0]?.ref.title).toBe('Source fictive');
  });
});
