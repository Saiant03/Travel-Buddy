import type { CategoryId } from '../../shared/contracts/preferences';
import type { DemoItem } from './demo-catalog';
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
export function createCustomItem(items: readonly DemoItem[], category: CategoryId, tab: 'ingredients' | 'dishes' | 'drinks', name: string): DemoItem | undefined {
  const label = name.trim();
  if (!label || label.length > 80 || items.some((item) => item.categoryId === category && (category !== 'food' || item.foodTab === tab) && Object.values(item.label).some((value) => normalize(value) === normalize(label)))) return undefined;
  const count = items.filter((item) => item.categoryId === category && item.subcategoryId === 'custom').length;
  return { categoryId: category, subcategoryId: 'custom', itemId: `custom-${count + 1}`, label: { ro: label, en: label, fr: label }, group: { ro: 'Adăugate de tine', en: 'Added by you', fr: 'Ajoutés par vous' }, ...(category === 'food' ? { foodTab: tab } : {}) };
}
