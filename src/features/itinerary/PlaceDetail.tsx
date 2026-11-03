import { useEffect, useRef } from 'react';
import type { Stop } from '../../shared/contracts/itinerary';
import type { Locale } from '../../app/i18n';
import { itineraryMessages } from './messages';
export function PlaceDetail({ stop, locale, context, onBack }: { stop: Stop; locale: Locale; context: string; onBack: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const m = itineraryMessages[locale];
  useEffect(() => { heading.current?.focus(); }, [stop.id]);
  const descriptions: Record<string, Record<Locale, string>> = {
    'synthetic-stop-zinnia': { ro: 'O cameră fictivă pentru flori de hârtie.', en: 'A fictional room for making paper flowers.', fr: 'Une salle fictive pour créer des fleurs en papier.' },
    'synthetic-stop-cobalt': { ro: 'Un spațiu fictiv și liniștit pentru lectură.', en: 'A made-up quiet reading space.', fr: 'Un espace de lecture calme et fictif.' },
    'synthetic-stop-ivory': { ro: 'O grădină interioară fictivă.', en: 'A fictional indoor garden room.', fr: 'Un jardin intérieur fictif.' },
  };
  return <section className="itinerary-detail"><button className="button button-secondary" onClick={onBack}>{m.back}</button><p>{context}</p><h2 ref={heading} tabIndex={-1}>{stop.place.name}</h2>{stop.place.confidence === 'unconfirmed' && <p>{m.placeUnconfirmed}</p>}<p>{stop.place.description ? descriptions[stop.id]?.[locale] ?? m.description : m.description}</p><ul><li>{m.price}</li><li>{m.opening}</li><li>{m.reservation}</li><li><span>{m.source}</span><ul>{stop.place.sources.map(source => <li key={source.url}>{source.url}</li>)}</ul></li></ul></section>;
}
