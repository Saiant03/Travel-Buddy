import { useRef, type Dispatch, type SetStateAction } from 'react';
import { t, type Locale, type MessageKey } from '../../app/i18n';
import type { PreferenceAnswer, Profile } from '../../shared/contracts/preferences';
import { Button } from '../../ui/components';
import type { DemoItem } from './demo-catalog';
import { setDemoAnswer, setDemoNote, setDemoQualifier } from './demo-model';

const foodAnswers: [PreferenceAnswer, MessageKey][] = [['strong_like', 'strongLike'], ['eat', 'eat'], ['try', 'tryAnswer'], ['avoid', 'avoid']];
const activityAnswers: [PreferenceAnswer, MessageKey][] = [['strong_like', 'strongLike'], ['try', 'tryAnswer'], ['no_interest', 'noInterest'], ['hard_no', 'hardNo']];
const preparations: [string, MessageKey][] = [['raw', 'raw'], ['cooked', 'cooked'], ['grilled', 'grilled'], ['baked', 'baked']];
type Props = { item: DemoItem; locale: Locale; profile: Profile; setProfile: Dispatch<SetStateAction<Profile>> };

export function PreferenceItem({ item, locale, profile, setProfile }: Props) {
  const firstAnswer = useRef<HTMLInputElement>(null);
  const firstPreparationAnswers = useRef<Record<string, HTMLInputElement | null>>({});
  const text = (key: MessageKey) => t(locale, key);
  const selection = profile.preferences.find((entry) => entry.categoryId === item.categoryId && entry.subcategoryId === item.subcategoryId && entry.itemId === item.itemId);
  const name = `${item.categoryId}-${item.subcategoryId}-${item.itemId}`;
  const answers = item.categoryId === 'food' ? foodAnswers : activityAnswers;
  const hasPreparation = item.categoryId === 'food' && item.subcategoryId === 'vegetables' && ['onion', 'tomato'].includes(item.itemId);
  return <fieldset className="preference-item">
    <legend>{item.label[locale]}</legend>
    <p className="item-status">{text(selection ? 'selected' : 'unknown')}</p>
    <div className="answer-options">{answers.map(([answer, label], index) => <label className="answer" key={answer}><input ref={index === 0 ? firstAnswer : undefined} type="radio" name={name} checked={selection?.answer === answer} onChange={() => setProfile((current) => setDemoAnswer(current, item, answer))} />{text(label)}</label>)}</div>
    {selection && <>
      <Button className="button-secondary clear-button" onClick={() => { setProfile((current) => setDemoAnswer(current, item, undefined)); firstAnswer.current?.focus(); }}>{text('clearAnswer')}</Button>
      <details className="preference-details"><summary>{text('details')}</summary>
        {hasPreparation && <div className="preparations"><p>{text('preparation')}</p>{preparations.map(([id, label]) => {
          const qualifier = selection.qualifiers?.find((entry) => entry.id === id);
          return <fieldset key={id} className="preparation"><legend>{text(label)}</legend><div className="answer-options">{foodAnswers.map(([answer, answerLabel], index) => <label className="answer" key={answer}><input ref={index === 0 ? (element) => { firstPreparationAnswers.current[id] = element; } : undefined} type="radio" name={`${name}-${id}`} checked={qualifier?.answer === answer} onChange={() => setProfile((current) => setDemoQualifier(current, item, id, answer))} />{text(answerLabel)}</label>)}{qualifier && <Button className="button-secondary clear-button" onClick={() => { setProfile((current) => setDemoQualifier(current, item, id, undefined)); firstPreparationAnswers.current[id]?.focus(); }}>{text('clear')}</Button>}</div></fieldset>;
        })}</div>}
        <label className="note-label">{text('optionalNote')}<textarea autoComplete="off" name={`${name}-note`} value={selection.note ?? ''} maxLength={500} onChange={(event) => { const value = event.target.value; setProfile((current) => setDemoNote(current, item, value || undefined)); }} /></label>
      </details>
    </>}
  </fieldset>;
}
