import type { Dispatch, SetStateAction } from 'react';
import { t, type Locale } from '../../app/i18n';
import type { Profile } from '../../shared/contracts/preferences';
import { setDemoRestriction } from './demo-model';

type Props = { locale: Locale; profile: Profile; setProfile: Dispatch<SetStateAction<Profile>> };
export function RestrictionPanel({ locale, profile, setProfile }: Props) {
  return <section className="restriction-panel">
    <h3>{t(locale, 'restrictions')}</h3>
    <p>{t(locale, 'restrictionHelp')}</p>
    {([['avoidFoods', 'avoidFoods', 'avoidExample', 'peanuts'], ['allergies', 'allergies', 'allergyExample', 'peanuts'], ['intolerances', 'intolerances', 'intoleranceExample', 'lactose']] as const).map(([kind, heading, label, value]) => <fieldset key={kind}>
      <legend>{t(locale, heading)}</legend>
      <label><input type="checkbox" checked={profile[kind].includes(value)} onChange={(event) => {
        const checked = event.target.checked;
        setProfile((current) => setDemoRestriction(current, kind, checked ? [...current[kind], value] : current[kind].filter((entry) => entry !== value)));
      }} />{t(locale, label)}</label>
    </fieldset>)}
  </section>;
}
