import { describe, expect, it } from 'vitest';
import { resolveRoute } from '../../../src/app/router';

describe('local generation route', () => {
  it('opens the generation screen at its own route', () => {
    expect(resolveRoute('/generation')).toBe('generation');
  });
});
