import { expect, it } from 'vitest';
import { demoItems } from '../../../src/features/preferences/demo-catalog';
import { createCustomItem } from '../../../src/features/preferences/custom-item';

it('adds a named example once in its current notebook and tab', () => {
  expect(createCustomItem(demoItems, 'food', 'ingredients', '  ')).toBeUndefined();
  expect(createCustomItem(demoItems, 'food', 'ingredients', 'CEAPA')).toBeUndefined();
  expect(createCustomItem(demoItems, 'food', 'ingredients', 'x'.repeat(81))).toBeUndefined();
  const item = createCustomItem(demoItems, 'food', 'dishes', '  Mâncare exemplu  ');
  expect(item?.label.ro).toBe('Mâncare exemplu');
  expect(item?.foodTab).toBe('dishes');
  expect(createCustomItem([...demoItems, item!], 'food', 'dishes', 'mancare exemplu')).toBeUndefined();
});
