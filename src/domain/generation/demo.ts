import { z } from 'zod';
import {
  localeSchema,
  parseWithSchema,
  sourceRefSchema,
  type Locale,
  type SourceRef,
  type ValidationError,
} from '../../shared/contracts/common';
import { generationJobSchema, type GenerationJob } from '../../shared/contracts/generation';
import { placeSchema, type Place } from '../../shared/contracts/itinerary';
import { providerFailureSchema, type ProviderFailure } from '../../shared/contracts/provider';

export const generationScenarios = ['success', 'partial', 'invalid_result', 'unavailable', 'timeout', 'quota_exhausted'] as const;
export type GenerationScenario = typeof generationScenarios[number];
export const generationStages = ['search', 'organize', 'verify'] as const;
export type GenerationStage = typeof generationStages[number];
export const generationScenarioSchema = z.enum(generationScenarios);

export function deriveGenerationCompleteness(days: Array<{ dayNumber: 1 | 2; placeCount: number }>): 'complete' | 'partial' {
  const filled = new Set(days.filter(({ placeCount }) => placeCount > 0).map(({ dayNumber }) => dayNumber));
  return filled.has(1) && filled.has(2) ? 'complete' : 'partial';
}

const placeFixtureData = {
  'fictional-place-1': {
    coordinates: { lat: 38.72, lng: -9.14 },
    names: ['Loc fictiv 1', 'Fictional place 1', 'Lieu fictif 1'],
    reasons: ['Date create pentru demonstrație', 'Data created for this demo', 'Données créées pour cette démonstration'],
  },
  'fictional-place-2': {
    coordinates: { lat: 38.73, lng: -9.13 },
    names: ['Loc fictiv 2', 'Fictional place 2', 'Lieu fictif 2'],
    reasons: ['Date create pentru demonstrație', 'Data created for this demo', 'Données créées pour cette démonstration'],
  },
} as const;
const fictionalPlaceId = z.enum(['fictional-place-1', 'fictional-place-2']);
const resultSourceSchema = z.object({
  id: z.literal('fictional-source-demo'),
  ref: sourceRefSchema,
  verified: z.literal(false),
}).strict().refine(({ ref }) => {
  try { return new URL(ref.url).hostname.endsWith('.invalid'); } catch { return false; }
}, { path: ['ref', 'url'], message: 'Fixture sources must use the reserved .invalid domain' })
  .refine(({ ref }) => ref.url === 'https://source.example.invalid/demo', { path: ['ref', 'url'], message: 'Only the fixed demo source is allowed' })
  .refine(({ ref }) => ['Sursă fictivă', 'Fictional source', 'Source fictive'].includes(ref.title), { path: ['ref', 'title'], message: 'Demo source labels must be fixed and localized' })
  .refine(({ ref }) => ref.checkedAt === '2026-11-02T00:00:00Z', { path: ['ref', 'checkedAt'], message: 'Demo source timestamp must remain fixed' });
const resultDaySchema = z.object({
  id: z.enum(['fictional-day-1', 'fictional-day-2']),
  dayNumber: z.union([z.literal(1), z.literal(2)]),
  label: z.enum(['Zi fictivă 1', 'Zi fictivă 2', 'Fictional day 1', 'Fictional day 2', 'Jour fictif 1', 'Jour fictif 2']),
  placeIds: z.array(z.enum(['fictional-place-1', 'fictional-place-2'])),
}).strict();

const generationDemoResultInputSchema = z.object({
  fictitious: z.literal(true),
  confirmed: z.literal(false),
  days: z.array(resultDaySchema).min(1).max(2),
  places: z.array(placeSchema).min(1),
  sources: z.array(resultSourceSchema).min(1),
}).strict().superRefine((result, context) => {
  const dayNumbers = new Set<number>();
  const dayIds = new Set<string>();
  const placedIds: string[] = [];
  result.days.forEach((day, dayIndex) => {
    if (dayNumbers.has(day.dayNumber)) context.addIssue({ code: 'custom', path: ['days', dayIndex, 'dayNumber'], message: 'Each expected day may appear once' });
    if (dayIds.has(day.id) || day.id !== `fictional-day-${day.dayNumber}`) context.addIssue({ code: 'custom', path: ['days', dayIndex, 'id'], message: 'Day identity must match its day number' });
    dayNumbers.add(day.dayNumber);
    dayIds.add(day.id);
    if (new Set(day.placeIds).size !== day.placeIds.length) context.addIssue({ code: 'custom', path: ['days', dayIndex, 'placeIds'], message: 'A place may appear once per day' });
    placedIds.push(...day.placeIds);
  });

  const placesById = new Map<string, Place>();
  result.places.forEach((place, index) => {
    if (placesById.has(place.id)) context.addIssue({ code: 'custom', path: ['places', index, 'id'], message: 'Place IDs must be unique' });
    placesById.set(place.id, place);
    if (place.confidence !== 'unconfirmed' || place.photo !== undefined) context.addIssue({ code: 'custom', path: ['places', index], message: 'Demo places must remain unconfirmed and image-free' });
    if (place.address !== undefined || place.description !== undefined || place.price !== undefined || place.opening !== undefined || place.reservation !== undefined) {
      context.addIssue({ code: 'custom', path: ['places', index], message: 'Demo places cannot carry unverified tourist details' });
    }
    const fixed = placeFixtureData[place.id as keyof typeof placeFixtureData];
    const nameIsFixture = (fixed?.names as readonly string[] | undefined)?.includes(place.name) ?? false;
    const reasonIsFixture = (fixed?.reasons as readonly string[] | undefined)?.includes(place.matchReasons[0] ?? '') ?? false;
    if (!fixed || !nameIsFixture || place.location.lat !== fixed.coordinates.lat || place.location.lng !== fixed.coordinates.lng || place.matchReasons.length !== 1 || !reasonIsFixture) {
      context.addIssue({ code: 'custom', path: ['places', index], message: 'Place must match a fixed localized fictional fixture' });
    }
    if (place.sources.length !== 1) context.addIssue({ code: 'custom', path: ['places', index, 'sources'], message: 'Demo places must have exactly one fixed source reference' });
  });
  const sourceIds = new Set<string>();
  const sourceUrls = new Set<string>();
  result.sources.forEach((source, index) => {
    if (sourceIds.has(source.id) || sourceUrls.has(source.ref.url)) context.addIssue({ code: 'custom', path: ['sources', index], message: 'Source IDs and URLs must be unique' });
    sourceIds.add(source.id);
    sourceUrls.add(source.ref.url);
  });
  for (const [dayIndex, placeId] of placedIds.entries()) {
    const place = placesById.get(placeId);
    if (!place) {
      context.addIssue({ code: 'custom', path: ['days', dayIndex, 'placeIds'], message: 'Every day place must refer to a result place' });
      continue;
    }
    if (place.sources.length !== 1 || !result.sources.some((listed) => listed.ref.url === place.sources[0]?.url && listed.ref.title === place.sources[0]?.title && listed.ref.checkedAt === place.sources[0]?.checkedAt)) {
      context.addIssue({ code: 'custom', path: ['days', dayIndex, 'placeIds'], message: 'Every day place needs a listed source reference' });
    }
  }
  if (placedIds.length !== result.places.length || new Set(placedIds).size !== placedIds.length) {
    context.addIssue({ code: 'custom', path: ['days'], message: 'Each result place must belong to exactly one day' });
  }
  result.places.forEach((place, index) => {
    if (!placedIds.includes(place.id)) context.addIssue({ code: 'custom', path: ['places', index, 'id'], message: 'Every result place must belong to a day' });
    for (const source of place.sources) {
      if (!sourceUrls.has(source.url)) context.addIssue({ code: 'custom', path: ['places', index, 'sources'], message: 'Place source references must be listed in the result' });
      if (!new URL(source.url).hostname.endsWith('.invalid')) context.addIssue({ code: 'custom', path: ['places', index, 'sources'], message: 'Place source references must be fictional' });
    }
  });
});

export const generationDemoResultSchema = generationDemoResultInputSchema.transform((result) => {
  const completeness = deriveGenerationCompleteness(result.days.map((day) => ({
    dayNumber: day.dayNumber,
    placeCount: day.placeIds.length,
  })));
  const representedDays = new Set(result.days.filter((day) => day.placeIds.length > 0).map((day) => day.dayNumber));
  const missingSections = ([1, 2] as const).filter((dayNumber) => !representedDays.has(dayNumber)).map((dayNumber) => `fictional-day-${dayNumber}`);
  return { ...result, completeness, missingSections };
});
export type GenerationDemoResult = z.output<typeof generationDemoResultSchema>;

const searchOutputSchema = z.object({ stage: z.literal('search'), candidateIds: z.array(fictionalPlaceId).min(1) }).strict().superRefine(({ candidateIds }, context) => {
  if (new Set(candidateIds).size !== candidateIds.length) context.addIssue({ code: 'custom', path: ['candidateIds'], message: 'Search IDs must be unique' });
});
const organizeOutputSchema = z.object({ stage: z.literal('organize'), dayNumbers: z.array(z.union([z.literal(1), z.literal(2)])).min(1) }).strict().superRefine(({ dayNumbers }, context) => {
  if (new Set(dayNumbers).size !== dayNumbers.length) context.addIssue({ code: 'custom', path: ['dayNumbers'], message: 'Organized days must be unique' });
});

export type GenerationDemoError = ProviderFailure | ValidationError;
export type GenerationDemoState = {
  job: GenerationJob | null;
  result: GenerationDemoResult | null;
  scenario: GenerationScenario | null;
  error: GenerationDemoError | null;
};
export type GenerationDemoExecutor = {
  execute: (stage: GenerationStage, scenario: GenerationScenario, locale: Locale) => Promise<unknown>;
};

function localized(locale: Locale, values: Record<Locale, string>): string { return values[locale]; }

function sourceFixture(locale: Locale) {
  const ref: SourceRef = {
    title: localized(locale, { ro: 'Sursă fictivă', en: 'Fictional source', fr: 'Source fictive' }),
    url: 'https://source.example.invalid/demo',
    checkedAt: '2026-11-02T00:00:00Z',
  };
  return { id: 'fictional-source-demo', ref, verified: false as const };
}

function fixture(locale: Locale, partial: boolean) {
  const source = sourceFixture(locale);
  const first: Place = {
    id: 'fictional-place-1',
    name: localized(locale, { ro: 'Loc fictiv 1', en: 'Fictional place 1', fr: 'Lieu fictif 1' }),
    location: { lat: 38.72, lng: -9.14 },
    sources: [source.ref],
    confidence: 'unconfirmed',
    matchReasons: [localized(locale, { ro: 'Date create pentru demonstrație', en: 'Data created for this demo', fr: 'Données créées pour cette démonstration' })],
  };
  const second: Place = {
    id: 'fictional-place-2',
    name: localized(locale, { ro: 'Loc fictiv 2', en: 'Fictional place 2', fr: 'Lieu fictif 2' }),
    location: { lat: 38.73, lng: -9.13 },
    sources: [source.ref],
    confidence: 'unconfirmed',
    matchReasons: [localized(locale, { ro: 'Date create pentru demonstrație', en: 'Data created for this demo', fr: 'Données créées pour cette démonstration' })],
  };
  const days = [
    { id: 'fictional-day-1', dayNumber: 1, label: localized(locale, { ro: 'Zi fictivă 1', en: 'Fictional day 1', fr: 'Jour fictif 1' }), placeIds: [first.id] },
    ...(!partial ? [{ id: 'fictional-day-2', dayNumber: 2, label: localized(locale, { ro: 'Zi fictivă 2', en: 'Fictional day 2', fr: 'Jour fictif 2' }), placeIds: [second.id] }] : []),
  ];
  return { fictitious: true, confirmed: false, days, places: partial ? [first] : [first, second], sources: [source] };
}

export function createDemoExecutor(): GenerationDemoExecutor {
  return {
    async execute(stage, scenario, locale) {
      if (stage === 'search' && ['unavailable', 'timeout', 'quota_exhausted'].includes(scenario)) {
        const code = scenario as ProviderFailure['code'];
        throw providerFailureSchema.parse({ code, retryable: code === 'timeout' || code === 'unavailable' });
      }
      if (stage === 'search') return { stage, candidateIds: scenario === 'partial' ? ['fictional-place-1'] : ['fictional-place-1', 'fictional-place-2'] };
      if (stage === 'organize') return { stage, dayNumbers: [1, 2] };
      if (scenario === 'invalid_result') return { fictitious: true, confirmed: true, days: [], places: [], sources: [] };
      return fixture(locale, scenario === 'partial');
    },
  };
}

function makeJob(sequence: number): GenerationJob {
  return generationJobSchema.parse({
    schemaVersion: 1,
    id: `generation-demo-${sequence}`,
    tripId: `trip-demo-${sequence}`,
    status: 'queued',
    claimVersion: sequence - 1,
    stage: 'search',
    completed: 0,
    total: generationStages.length,
  });
}

function toProviderFailure(input: unknown): ProviderFailure {
  const parsed = providerFailureSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  return { code: 'unavailable', retryable: false };
}

export class GenerationDemoController {
  state: GenerationDemoState = { job: null, result: null, scenario: null, error: null };
  private scenario: GenerationScenario | null = null;
  private locale: Locale = 'ro';
  private sequence = 0;
  private busy = false;
  private candidateIds: string[] = [];
  private organizedDays: Array<1 | 2> = [];

  constructor(private readonly executor: GenerationDemoExecutor) {}

  start(scenario: GenerationScenario, locale: Locale = 'ro'): boolean {
    const parsedScenario = generationScenarioSchema.safeParse(scenario);
    const parsedLocale = localeSchema.safeParse(locale);
    if (!parsedScenario.success || !parsedLocale.success) return false;
    const status = this.state.job?.status;
    if (status === 'queued' || status === 'running') return false;
    return this.beginAttempt(parsedScenario.data, parsedLocale.data);
  }

  restart(scenario: GenerationScenario, locale: Locale = this.locale): boolean {
    const parsedScenario = generationScenarioSchema.safeParse(scenario);
    const parsedLocale = localeSchema.safeParse(locale);
    if (!parsedScenario.success || !parsedLocale.success) return false;
    return this.beginAttempt(parsedScenario.data, parsedLocale.data);
  }

  private beginAttempt(scenario: GenerationScenario, locale: Locale): boolean {
    this.sequence += 1;
    this.busy = false;
    this.scenario = scenario;
    this.locale = locale;
    this.candidateIds = [];
    this.organizedDays = [];
    this.state = { job: makeJob(this.sequence), result: null, scenario, error: null };
    return true;
  }

  async nextStep(): Promise<void> {
    const job = this.state.job;
    const scenario = this.scenario;
    if (!job || !scenario || this.busy || (job.status !== 'queued' && job.status !== 'running')) return;
    const sequence = this.sequence;
    const stage = generationStages[job.completed];
    if (!stage) return;

    this.busy = true;
    const attemptId = `attempt-demo-${sequence}`;
    const leaseToken = `lease-demo-${sequence}`;
    this.state = {
      ...this.state,
      job: generationJobSchema.parse({ ...job, status: 'running', attemptId, leaseToken }),
    };

    try {
      const raw = await this.executor.execute(stage, scenario, this.locale);
      if (sequence !== this.sequence || this.state.job?.id !== job.id) return;
      if (stage === 'verify') {
        const parsed = parseWithSchema(generationDemoResultSchema, raw);
        if (!parsed.ok) {
          this.finishValidationFailure(job, parsed.error, job.completed);
          return;
        }
        const result = parsed.data;
        const resultPlaceIds = result.places.map((place) => place.id);
        const resultDayNumbers = result.days.map((day) => day.dayNumber);
        if (resultPlaceIds.some((id) => !this.candidateIds.includes(id)) || resultDayNumbers.some((day) => !this.organizedDays.includes(day))) {
          this.finishValidationFailure(job, { code: 'VALIDATION_ERROR', issues: [{ path: '$', message: 'Verification must stay within earlier local results' }] }, job.completed);
          return;
        }
        const completed = job.completed + 1;
        const status = result.completeness;
        const terminalJob = this.withoutLease(job, {
          status,
          completed,
          stage: 'verify',
          ...(status === 'complete' ? { resultTripVersion: 1 } : {}),
        });
        this.state = { ...this.state, job: generationJobSchema.parse(terminalJob), result, error: null };
        return;
      }

      if (stage === 'search') {
        const parsedStage = parseWithSchema(searchOutputSchema, raw);
        if (!parsedStage.ok) {
          this.finishValidationFailure(job, parsedStage.error, job.completed);
          return;
        }
        this.candidateIds = parsedStage.data.candidateIds;
      } else {
        const parsedStage = parseWithSchema(organizeOutputSchema, raw);
        if (!parsedStage.ok) {
          this.finishValidationFailure(job, parsedStage.error, job.completed);
          return;
        }
        this.organizedDays = parsedStage.data.dayNumbers;
      }
      const completed = job.completed + 1;
      this.state = {
        ...this.state,
        job: generationJobSchema.parse({
          ...job,
          status: 'running',
          attemptId,
          leaseToken,
          completed,
          stage: generationStages[completed] ?? stage,
          checkpoint: { completedStages: generationStages.slice(0, completed) },
        }),
      };
    } catch (error) {
      if (sequence !== this.sequence || this.state.job?.id !== job.id) return;
      const failure = toProviderFailure(error);
      const status = failure.code === 'quota_exhausted' ? 'quota_exhausted' : 'failed';
      const errorCode = failure.code === 'quota_exhausted' ? 'QUOTA_EXHAUSTED' : 'PROVIDER_UNAVAILABLE';
      this.state = {
        ...this.state,
        job: generationJobSchema.parse(this.withoutLease(job, { status, completed: job.completed, errorCode })),
        error: failure,
      };
    } finally {
      if (sequence === this.sequence) this.busy = false;
    }
  }

  retry(): boolean {
    const job = this.state.job;
    if (!job || job.status === 'queued' || job.status === 'running') return false;
    const mayRetryPartial = job.status === 'partial';
    const mayRetryFailure = job.status === 'failed' && this.state.error !== null && 'retryable' in this.state.error && this.state.error.retryable;
    return (mayRetryPartial || mayRetryFailure) && this.scenario !== null
      ? this.beginAttempt(this.scenario, this.locale)
      : false;
  }

  private withoutLease(job: GenerationJob, update: Partial<GenerationJob>): GenerationJob {
    const base = { ...job };
    delete base.attemptId;
    delete base.leaseToken;
    return { ...base, ...update } as GenerationJob;
  }

  private finishValidationFailure(job: GenerationJob, error: ValidationError, completed: number) {
    const failed = this.withoutLease(job, { status: 'failed', completed, errorCode: 'VALIDATION_ERROR' });
    this.state = { ...this.state, job: generationJobSchema.parse(failed), error };
  }
}
