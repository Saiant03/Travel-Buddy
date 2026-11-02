import { it, expect } from 'vitest';
import { demoProvider } from '../../../src/features/place-resolution/demo-provider';
import { resolvePlaces } from '../../../src/features/place-resolution/contracts';

const input = { input: 'example', locale: 'ro' };

it.each([['zero', 0], ['one', 1], ['multiple', 2]] as const)(
  'produces %s synthetic candidates',
  async (scenario, count) => {
    const result = await resolvePlaces(demoProvider(scenario), input);
    expect(result.ok && result.data.length).toBe(count);
    if (result.ok) {
      for (const place of result.data) {
        expect(place.confidence).toBe('unconfirmed');
        expect(place.photo).toBeUndefined();
        expect(place.sources[0]?.url).toContain('.invalid');
      }
    }
  },
);

it.each(['invalid_response', 'unavailable', 'timeout', 'quota_exhausted'])(
  'simulates %s',
  async (scenario) => {
    expect(await resolvePlaces(demoProvider(scenario), input))
      .toMatchObject({ ok: false, error: { code: scenario } });
  },
);
