import type { Locale } from '../../shared/contracts/common';
import type { GenerationDemoController, GenerationDemoState, GenerationScenario } from '../../domain/generation/demo';

type Snapshot = { state: GenerationDemoState; busy: boolean };

class GenerationStore {
  private snapshot: Snapshot;
  private listeners = new Set<() => void>();

  constructor(private controller: GenerationDemoController) {
    this.snapshot = { state: controller.state, busy: false };
  }

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private publish(busy: boolean) {
    this.snapshot = { state: this.controller.state, busy };
    this.listeners.forEach((listener) => listener());
  }

  start(scenario: GenerationScenario, locale: Locale) {
    if (this.controller.start(scenario, locale)) this.publish(false);
  }

  restart(scenario: GenerationScenario, locale: Locale) {
    if (this.controller.restart(scenario, locale)) this.publish(false);
  }

  retry() {
    if (this.controller.retry()) this.publish(false);
  }

  nextStep() {
    const job = this.snapshot.state.job;
    if (this.snapshot.busy || !job || (job.status !== 'queued' && job.status !== 'running')) return;
    const jobId = job.id;
    const step = this.controller.nextStep();
    this.publish(true);
    void step.finally(() => {
      if (this.controller.state.job?.id === jobId) this.publish(false);
    });
  }
}

const stores = new WeakMap<GenerationDemoController, GenerationStore>();
export function generationStore(controller: GenerationDemoController): GenerationStore {
  let store = stores.get(controller);
  if (!store) {
    store = new GenerationStore(controller);
    stores.set(controller, store);
  }
  return store;
}
