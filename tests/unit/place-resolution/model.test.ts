import { describe, it, expect } from 'vitest';
import { createResolutionDemoState, transition } from '../../../src/features/place-resolution/demo-model';

const place = {
  id: 'a', name: 'Fictional A', location: { lat: 0, lng: 0 },
  sources: [{ url: 'https://source.invalid/a', title: 'Source', checkedAt: '2026-01-01T00:00:00Z' }],
  confidence: 'unconfirmed' as const, matchReasons: [],
};
const ready = {
  ...createResolutionDemoState(), input: 'x', places: [place],
  selected: 'a', confirmed: 'a', request: 1, status: 'success' as const,
};

describe('resolution state', () => {
  it('edit clears selection and confirmation and invalidates pending results', () => {
    expect(transition(ready, { type: 'edit', value: 'new' })).toMatchObject({
      input: 'new', places: [], selected: null, confirmed: null, request: 2, status: 'idle',
    });
  });

  it('new request clears selection and confirmation', () => {
    expect(transition(ready, { type: 'start' })).toMatchObject({
      selected: null, confirmed: null, places: [], request: 2, status: 'loading',
    });
  });

  it('ignores stale responses', () => {
    expect(transition(ready, { type: 'result', request: 0, places: [] })).toEqual(ready);
    expect(transition(ready, { type: 'result', request: 1, places: [] })).toMatchObject({
      places: [], status: 'success',
    });
  });

  it('requires explicit current selection to confirm', () => {
    expect(transition({ ...ready, selected: null, confirmed: null }, { type: 'confirm' }).confirmed).toBeNull();
    expect(transition({ ...ready, confirmed: null }, { type: 'confirm' }).confirmed).toBe('a');
  });

  it('selection alone never confirms', () => {
    expect(transition({ ...ready, selected: null, confirmed: 'a' }, { type: 'select', value: 'a' }))
      .toMatchObject({ selected: 'a', confirmed: null });
  });

  it('scenario changes invalidate results', () => {
    expect(transition(ready, { type: 'scenario', value: 'zero' })).toMatchObject({
      scenario: 'zero', places: [], selected: null, confirmed: null, status: 'idle',
    });
  });
});
