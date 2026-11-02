import { useState, type Dispatch, type SetStateAction } from 'react';
import { t, type Locale, type MessageKey } from '../../app/i18n';
import type { CategoryId, Profile } from '../../shared/contracts/preferences';
import { demoCategories, demoItems, type DemoItem } from './demo-catalog';
import { completedCategoryCount, isDemoReady, setDemoNoSpecial } from './demo-model';
import { Button, Field } from '../../ui/components';
import { createCustomItem } from './custom-item';
import { filterDemoItems } from './search';
import { PreferenceItem } from './PreferenceItem';
import { RestrictionPanel } from './RestrictionPanel';
import './preferences.css';

type Props = { locale: Locale; profile: Profile; setProfile: Dispatch<SetStateAction<Profile>>; customItems: DemoItem[]; setCustomItems: Dispatch<SetStateAction<DemoItem[]>> };
type FoodTab = 'ingredients' | 'dishes' | 'drinks';


export function Preferences({ locale, profile, setProfile, customItems, setCustomItems }: Props) {
  const [category, setCategory] = useState<CategoryId>('food');
  const [foodTab, setFoodTab] = useState<FoodTab>('ingredients');
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [invalidName, setInvalidName] = useState(false);
  const text = (key: MessageKey, args?: Record<string, string | number>) => t(locale, key, args);
  const selectedCategory = demoCategories.find((entry) => entry.id === category)!;
  const completion = profile.categories.find((entry) => entry.categoryId === category);
  const filtered = filterDemoItems([...demoItems, ...customItems], category, foodTab, search, locale);
  const groups = [...new Set(filtered.map((item) => item.group[locale]))];
  const update = (fn: (current: Profile) => Profile) => setProfile(fn);
  return <div className="preferences-page">
    <div className="page-heading"><p className="eyebrow">Travel Buddy / {text('demoBadge')}</p><h1>{text('preferences')}</h1><p className="lead">{text('preferencesIntro')}</p></div>
    <div className="preference-progress" aria-live="polite"><strong>{text('progress', { count: completedCategoryCount(profile) })}</strong>{isDemoReady(profile) && <span>{text('ready')}</span>}</div>
    <div className="notebook-picker" role="group" aria-label={text('chooseNotebook')}>{demoCategories.map((entry, index) => <button type="button" key={entry.id} aria-label={entry.label[locale]} aria-describedby={`status-${entry.id}`} aria-pressed={entry.id === category} onClick={() => { setCategory(entry.id); setSearch(''); }}><span aria-hidden="true">0{index + 1}</span>{entry.label[locale]}<span className="notebook-status" id={`status-${entry.id}`}>{profile.categories.find((item) => item.categoryId === entry.id)?.complete ? text('completed') : text('incomplete')}</span></button>)}</div>
    <section className="notebook" aria-labelledby="notebook-title"><div className="notebook-heading"><div><p className="eyebrow">Travel Buddy / {selectedCategory.label[locale]}</p><h2 id="notebook-title">{selectedCategory.title[locale]}</h2></div><span className="notebook-stamp" aria-hidden="true">✳</span></div>
      <Field id="preference-search" name="preference-search" autoComplete="off" label={text('search')} type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
      <p className="preference-help">{text('unknownHelp')}</p>
      <p className="preference-help">{text(category === 'food' ? 'inventoryHelp' : 'activityHelp')}</p>
      {category === 'food' && <div className="food-tabs" role="group" aria-label={selectedCategory.label[locale]}>{(['ingredients', 'dishes', 'drinks'] as const).map((tab) => <button type="button" key={tab} aria-pressed={foodTab === tab} onClick={() => setFoodTab(tab)}>{text(tab)}</button>)}</div>}
      <div className="no-special"><label><input type="checkbox" checked={completion?.noSpecialPreferences ?? false} onChange={(event) => { const checked = event.target.checked; update((current) => setDemoNoSpecial(current, category, checked)); }} />{text('noSpecial')}</label><p>{text('noSpecialHelp')}</p></div>
      <form className="custom-item-form" onSubmit={(event) => {
        event.preventDefault();
        const item = createCustomItem([...demoItems, ...customItems], category, foodTab, newName);
        if (!item) { setInvalidName(true); return; }
        setCustomItems((current) => [...current, item]);
        setNewName(''); setInvalidName(false); setSearch('');
      }}>
        <h3>{text('addExample')}</h3>
        <p>{text('customLanguage')}</p>
        <Field id="custom-example" name="custom-example" autoComplete="off" label={text('exampleName')} value={newName} maxLength={80} onChange={(event) => { setNewName(event.target.value); setInvalidName(false); }} aria-invalid={invalidName} aria-describedby={invalidName ? 'custom-error' : undefined} />
        {invalidName && <p id="custom-error" role="alert">{text('invalidExample')}</p>}
        <Button type="submit">{text('add')}</Button>
      </form>
      {groups.length === 0 && <p role="status">{text('noResults')}</p>}
      {groups.map((group) => <section className="preference-group" key={group}><h3>{group}</h3>{filtered.filter((item) => item.group[locale] === group).map((item) => <PreferenceItem key={`${item.categoryId}-${item.subcategoryId}-${item.itemId}`} item={item} locale={locale} profile={profile} setProfile={setProfile} />)}</section>)}
      {category === 'food' && <RestrictionPanel locale={locale} profile={profile} setProfile={setProfile} />}
    </section>
  </div>;
}
