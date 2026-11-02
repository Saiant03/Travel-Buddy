import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GenerationDemoController, type GenerationScenario } from '../../src/domain/generation/demo';
import { GenerationPage } from '../../src/features/generation/GenerationPage';

const pending: Array<(value: unknown) => void> = [];
const controller = new GenerationDemoController({
  execute: () => new Promise((resolve) => pending.push(resolve)),
});

Object.assign(window, {
  resolveGenerationStep(index: number) {
    const resolve = pending[index];
    if (!resolve) throw new Error(`Missing pending step ${index}`);
    resolve({ stage: 'search', candidateIds: ['fictional-place-1'] });
  },
});

function Harness() {
  const [visible, setVisible] = useState(true);
  const [scenario, setScenario] = useState<GenerationScenario>('success');
  return <>
    <button type="button" onClick={() => setVisible(!visible)}>{visible ? 'Leave generation' : 'Return to generation'}</button>
    {visible && <GenerationPage locale="ro" controller={controller} scenario={scenario} setScenario={setScenario} />}
  </>;
}

createRoot(document.getElementById('root')!).render(<Harness />);
