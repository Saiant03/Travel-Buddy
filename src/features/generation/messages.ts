import type { Locale } from '../../shared/contracts/common';
import type { GenerationJob } from '../../shared/contracts/generation';
import type { GenerationScenario } from '../../domain/generation/demo';

export type GenerationMessages = {
  title: string;
  open: string;
  intro: string;
  memory: string;
  scenario: string;
  start: string;
  next: string;
  retry: string;
  newAttempt: string;
  status: string;
  progress: string;
  stages: [string, string, string];
  waiting: string;
  busy: string;
  statuses: Record<GenerationJob['status'], string>;
  scenarios: Record<GenerationScenario, string>;
  completeNotice: string;
  notSaved: string;
  recovery: Record<'invalid' | 'retryable' | 'quota', string>;
  resultTitle: string;
  fictional: string;
  day: string;
  place: string;
  source: string;
  missing: string;
  errors: Record<'VALIDATION_ERROR' | 'timeout' | 'unavailable' | 'invalid_response' | 'quota_exhausted', string>;
};

export const generationMessages: Record<Locale, GenerationMessages> = {
  ro: {
    title: 'Atelierul generării locale',
    open: 'Deschide demonstrația generării',
    intro: 'Urmărește fiecare etapă și pornește-o doar când ești gata.',
    memory: 'Demonstrație locală. Starea rămâne doar în memorie și se resetează la reîncărcare.',
    scenario: 'Scenariu demonstrativ', start: 'Pornește generarea', next: 'Execută următorul pas local', retry: 'Reîncearcă manual', newAttempt: 'Pornește o încercare nouă',
    status: 'Stare', progress: 'Etape executate',
    stages: ['Căutare simulată', 'Organizare simulată', 'Verificare simulată'],
    waiting: 'Alege un scenariu și pornește generarea când dorești.',
    busy: 'Pasul local este în curs.',
    statuses: {
      queued: 'În coadă locală. Nicio etapă nu a fost executată încă.',
      running: 'Etapa locală așteaptă următoarea acțiune.',
      complete: 'Simulare încheiată, 3/3 etape locale.',
      partial: 'Simulare încheiată cu rezultat incomplet.',
      quota_exhausted: 'Cota simulată este epuizată. Nu se face retry automat.',
      failed: 'Etapa nu a putut fi încheiată în această simulare.',
    },
    scenarios: { success: 'Succes complet', partial: 'Rezultat parțial', invalid_result: 'Rezultat invalid', unavailable: 'Serviciu indisponibil', timeout: 'Timeout simulat', quota_exhausted: 'Cotă epuizată' },
    completeNotice: 'Planul nu este confirmat.',
    notSaved: 'Niciun itinerar nu a fost salvat sau aplicat.',
    recovery: { invalid: 'Alege alt scenariu și pornește o încercare nouă.', retryable: 'Reîncercarea repetă același scenariu simulat. Pentru alt rezultat, alege alt scenariu și pornește o încercare nouă.', quota: 'Cota este doar simulată, fără moment de reset cunoscut. Poți alege alt scenariu și porni o încercare nouă.' },
    resultTitle: 'Itinerar fictiv',
    fictional: 'Date fictive, neconfirmate. Nu reprezintă locuri sau surse verificate.',
    day: 'Zi fictivă', place: 'Loc fictiv', source: 'Sursă fictivă neconfirmată', missing: 'Părți lipsă',
    errors: { VALIDATION_ERROR: 'Rezultatul nu a trecut validarea.', timeout: 'Etapa a expirat în simulare.', unavailable: 'Serviciul simulat nu este disponibil.', invalid_response: 'Răspunsul simulat nu este valid.', quota_exhausted: 'Cota simulată s-a epuizat.' },
  },
  en: {
    title: 'Local generation workshop',
    open: 'Open generation demo',
    intro: 'Follow each stage and start it only when you are ready.',
    memory: 'Local demonstration. State stays in memory and resets on reload.',
    scenario: 'Demo scenario', start: 'Start generation', next: 'Run next local step', retry: 'Retry manually', newAttempt: 'Start a new attempt',
    status: 'Status', progress: 'Steps completed',
    stages: ['Simulated search', 'Simulated organization', 'Simulated verification'],
    waiting: 'Choose a scenario and start generation when ready.',
    busy: 'The local step is in progress.',
    statuses: {
      queued: 'Queued locally. No stage has run yet.',
      running: 'The local stage is waiting for your next action.',
      complete: 'Simulation finished, 3/3 local steps.',
      partial: 'Simulation finished with an incomplete result.',
      quota_exhausted: 'Simulated quota is exhausted. No automatic retry.',
      failed: 'The stage could not finish in this simulation.',
    },
    scenarios: { success: 'Complete success', partial: 'Partial result', invalid_result: 'Invalid result', unavailable: 'Unavailable service', timeout: 'Simulated timeout', quota_exhausted: 'Quota exhausted' },
    completeNotice: 'The plan is not confirmed.',
    notSaved: 'No itinerary has been saved or applied.',
    recovery: { invalid: 'Choose another scenario and start a new attempt.', retryable: 'Retrying repeats the same simulated scenario. For a different result, choose another scenario and start a new attempt.', quota: 'The quota is simulated, with no known reset time. You can choose another scenario and start a new attempt.' },
    resultTitle: 'Fictional itinerary',
    fictional: 'Fictional, unconfirmed data. These are not verified places or sources.',
    day: 'Fictional day', place: 'Fictional place', source: 'Unconfirmed fictional source', missing: 'Missing parts',
    errors: { VALIDATION_ERROR: 'The result did not pass validation.', timeout: 'The simulated stage timed out.', unavailable: 'The simulated service is unavailable.', invalid_response: 'The simulated response is invalid.', quota_exhausted: 'The simulated quota is exhausted.' },
  },
  fr: {
    title: 'Atelier de génération locale',
    open: 'Ouvrir la démonstration de génération',
    intro: 'Suivez chaque étape et lancez-la quand vous le souhaitez.',
    memory: 'Démonstration locale. Les données restent en mémoire et sont réinitialisées au rechargement.',
    scenario: 'Scénario de démonstration', start: 'Lancer la génération', next: 'Exécuter la prochaine étape locale', retry: 'Réessayer manuellement', newAttempt: 'Lancer une nouvelle tentative',
    status: 'État', progress: 'Étapes exécutées',
    stages: ['Recherche simulée', 'Organisation simulée', 'Vérification simulée'],
    waiting: 'Choisissez un scénario et lancez la génération quand vous le souhaitez.',
    busy: 'L’étape locale est en cours.',
    statuses: {
      queued: 'En attente locale. Aucune étape exécutée.',
      running: 'L’étape locale attend votre prochaine action.',
      complete: 'Simulation terminée, 3/3 étapes locales.',
      partial: 'Simulation terminée avec un résultat incomplet.',
      quota_exhausted: 'Le quota simulé est épuisé. Aucun nouvel essai automatique.',
      failed: 'L’étape n’a pas pu se terminer dans cette simulation.',
    },
    scenarios: { success: 'Succès complet', partial: 'Résultat partiel', invalid_result: 'Résultat invalide', unavailable: 'Service indisponible', timeout: 'Délai simulé dépassé', quota_exhausted: 'Quota épuisé' },
    completeNotice: 'Le plan n’est pas confirmé.',
    notSaved: 'Aucun itinéraire n’a été enregistré ou appliqué.',
    recovery: { invalid: 'Choisissez un autre scénario et lancez une nouvelle tentative.', retryable: 'Réessayer répète le même scénario simulé. Pour un autre résultat, choisissez un autre scénario et lancez une nouvelle tentative.', quota: 'Le quota est simulé, sans date de réinitialisation connue. Vous pouvez choisir un autre scénario et lancer une nouvelle tentative.' },
    resultTitle: 'Itinéraire fictif',
    fictional: 'Données fictives et non confirmées. Aucun lieu ni source vérifié.',
    day: 'Jour fictif', place: 'Lieu fictif', source: 'Source fictive non confirmée', missing: 'Éléments manquants',
    errors: { VALIDATION_ERROR: 'Le résultat n’a pas passé la validation.', timeout: 'Le délai simulé est dépassé.', unavailable: 'Le service simulé est indisponible.', invalid_response: 'La réponse simulée est invalide.', quota_exhausted: 'Le quota simulé est épuisé.' },
  },
};
