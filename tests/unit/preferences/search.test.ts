import { describe, expect, it } from 'vitest';
import { demoItems } from '../../../src/features/preferences/demo-catalog';
import { filterDemoItems } from '../../../src/features/preferences/search';

describe('notebook search', () => {
  it('finds food across tabs when searching and keeps tabs when search is empty', () => {
    expect(filterDemoItems(demoItems, 'food', 'ingredients', 'espresso', 'ro').map((item) => item.itemId)).toContain('espresso');
    expect(filterDemoItems(demoItems, 'food', 'ingredients', '', 'ro').map((item) => item.itemId)).not.toContain('espresso');
    expect(filterDemoItems(demoItems, 'food', 'ingredients', 'ceapa', 'ro').map((item) => item.itemId)).toContain('onion');
  });
});
