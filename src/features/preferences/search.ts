import type { Locale } from '../../app/i18n';
import type { CategoryId } from '../../shared/contracts/preferences';
import type { DemoItem } from './demo-catalog';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
export function filterDemoItems(items: readonly DemoItem[], category: CategoryId, foodTab: 'ingredients' | 'dishes' | 'drinks', search: string, locale: Locale) {
  return items.filter((item) => item.categoryId === category && (category !== 'food' || search.trim() !== '' || item.foodTab === foodTab) && normalize(`${item.label[locale]} ${item.group[locale]}`).includes(normalize(search.trim())));
}
