import { describe, expect, it } from 'vitest';
import {
  createDemoExecutor,
  deriveGenerationCompleteness,
  GenerationDemoController,
  generationDemoResultSchema,
  type GenerationDemoExecutor,
} from '../../../src/domain/generation/demo';
import type { Locale } from '../../../src/shared/contracts/common';
import type { GenerationScenario } from '../../../src/domain/generation/demo';

const sourceRef = { title: 'Sursă fictivă', url: 'https://source.example.invalid/demo', checkedAt: '2026-11-02T00:00:00Z' };
function place(id = 'fictional-place-1', source = sourceRef) {
  return { id, name: id.endsWith('-2') ? 'Loc fictiv 2' : 'Loc fictiv 1', location: id.endsWith('-2') ? { lat: 38.73, lng: -9.13 } : { lat: 38.72, lng: -9.14 }, sources: [source], confidence: 'unconfirmed', matchReasons: ['Date create pentru demonstrație'] };
}
function source() { return { id: 'fictional-source-demo', ref: sourceRef, verified: false }; }
function day(dayNumber: 1 | 2, ids: string[]) { return { id: `fictional-day-${dayNumber}`, dayNumber, label: `Zi fictivă ${dayNumber}`, placeIds: ids }; }
function validResult(days = [day(1, ['fictional-place-1']), day(2, ['fictional-place-2'])], places = [place('fictional-place-1'), place('fictional-place-2')]) {
  return { fictitious: true, confirmed: false, days, places, sources: [source()] };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

describe('generation boundaries and attempt fencing', () => {
  it('derives partial when a fixture declares complete but omits the second expected day', () => {
    expect(deriveGenerationCompleteness([{ dayNumber: 1, placeCount: 1 }])).toBe('partial');
  });

  it('returns partial and names the missing day from fixture contents, not a provider completeness claim', () => {
    const onePlace = place();
    const parsed = generationDemoResultSchema.safeParse(validResult([day(1, [onePlace.id])], [onePlace]));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.completeness).toBe('partial');
      expect(parsed.data.missingSections).toEqual(['fictional-day-2']);
    }
  });

  it('rejects duplicate place IDs across days', () => {
    const duplicate = validResult([day(1, ['fictional-place-1']), day(2, ['fictional-place-1'])], [place()]);
    expect(generationDemoResultSchema.safeParse(duplicate).success).toBe(false);
  });

  it('rejects a day place whose source is absent from the result source list', () => {
    expect(generationDemoResultSchema.safeParse(validResult()).success).toBe(true);
    const missingSource = validResult([day(1, ['fictional-place-1']), day(2, ['fictional-place-2'])], [
      place('fictional-place-1', { ...sourceRef, url: 'https://unlisted.example.invalid/source' }),
      place('fictional-place-2'),
    ]);
    expect(generationDemoResultSchema.safeParse(missingSource).success).toBe(false);
  });

  it('rejects a day label that is not one of the fixed localized fixture labels', () => {
    const clean = validResult();
    const withTouristClaim = { ...clean, days: [{ ...clean.days[0]!, label: 'A day exploring hidden historic landmarks' }, clean.days[1]!] };
    expect(generationDemoResultSchema.safeParse(withTouristClaim).success).toBe(false);
  });

  it('rejects an extra modified source attached to a place even when a valid source is also present', () => {
    const clean = validResult();
    const extraSource = { ...sourceRef, title: 'Verified opening details' };
    const withExtraSource = { ...clean, places: [{ ...clean.places[0]!, sources: [sourceRef, extraSource] }, clean.places[1]!] };
    expect(generationDemoResultSchema.safeParse(withExtraSource).success).toBe(false);
  });

  it.each([
    ['address', 'Some street'],
    ['description', 'A tourist detail'],
    ['price', { amount: 12, currency: 'EUR' }],
    ['opening', '09:00–17:00'],
    ['reservation', 'Book ahead'],
  ] as const)('rejects Place.%s in the demo payload', (key, value) => {
    const clean = validResult();
    const pollutedPlace = { ...clean.places[0]!, [key]: value };
    const polluted = { ...clean, places: [pollutedPlace, clean.places[1]!] };
    expect(generationDemoResultSchema.safeParse(polluted).success).toBe(false);
  });

  it('rejects a fictional place ID without a recognized fixture label', () => {
    const clean = validResult();
    const unknownPlace = { ...clean.places[0]!, id: 'fictional-place-999' };
    const result = { ...clean, places: [unknownPlace, clean.places[1]!], days: [day(1, [unknownPlace.id]), day(2, ['fictional-place-2'])] };
    expect(generationDemoResultSchema.safeParse(result).success).toBe(false);
  });

  it('does not accept a real source URL in an otherwise valid fixture', () => {
    const clean = validResult();
    const realSource = { ...source(), ref: { ...sourceRef, url: 'https://example.com/place' } };
    expect(generationDemoResultSchema.safeParse({ ...clean, sources: [realSource] }).success).toBe(false);
  });

  it('does not accept a photo in a demo place', () => {
    const clean = validResult();
    const photo = { url: 'https://image.example.invalid/a.jpg', sourceUrl: 'https://source.example.invalid/photo', author: 'Fictional author', license: 'Fictional license', licenseUrl: 'https://license.example.invalid/', attribution: 'Fictional attribution', checkedAt: '2026-11-02T00:00:00Z', cacheAllowed: true };
    const withPhoto = { ...clean, places: [{ ...clean.places[0]!, photo }, clean.places[1]!] };
    expect(generationDemoResultSchema.safeParse(withPhoto).success).toBe(false);
  });

  it('does not accept a verified place in an unconfirmed demo result', () => {
    const clean = validResult();
    const verified = { ...clean, places: [{ ...clean.places[0]!, confidence: 'verified' }, clean.places[1]!] };
    expect(generationDemoResultSchema.safeParse(verified).success).toBe(false);
  });

  it('does not count a malformed search response as executed work', async () => {
    const controller = new GenerationDemoController({ execute: async () => ({ stage: 'organize', candidateIds: [] }) });
    controller.start('success');
    await controller.nextStep();
    expect(controller.state.job?.status).toBe('failed');
    expect(controller.state.job?.completed).toBe(0);
    expect(controller.state.job?.errorCode).toBe('VALIDATION_ERROR');
  });

  it('does not count a malformed organize response as executed work', async () => {
    let calls = 0;
    const controller = new GenerationDemoController({ execute: async () => ++calls === 1 ? { stage: 'search', candidateIds: ['fictional-place-1'] } : { stage: 'organize', dayNumbers: 'one' } });
    controller.start('success');
    await controller.nextStep();
    await controller.nextStep();
    expect(controller.state.job?.status).toBe('failed');
    expect(controller.state.job?.completed).toBe(1);
    expect(controller.state.job?.stage).toBe('organize');
  });

  it('clears the previous result when an explicit new attempt starts', async () => {
    const controller = new GenerationDemoController(createDemoExecutor());
    controller.start('success');
    await controller.nextStep(); await controller.nextStep(); await controller.nextStep();
    expect(controller.state.result).not.toBeNull();
    expect(controller.restart('partial')).toBe(true);
    expect(controller.state.result).toBeNull();
  });

  it('lets a new attempt finish while an older deferred response is pending, then ignores the old response', async () => {
    const oldResponse = deferred<unknown>();
    let calls = 0;
    const executor: GenerationDemoExecutor = { execute: async (stage) => ++calls === 1 ? oldResponse.promise : (stage === 'search' ? { stage, candidateIds: ['fictional-place-1'] } : { stage, dayNumbers: [1, 2] }) };
    const controller = new GenerationDemoController(executor);
    controller.start('success');
    const oldStep = controller.nextStep();
    const oldJobId = controller.state.job?.id;

    expect(controller.restart('partial')).toBe(true);
    const currentJobId = controller.state.job?.id;
    expect(currentJobId).not.toBe(oldJobId);
    await controller.nextStep();
    expect(controller.state.job?.completed).toBe(1);

    oldResponse.resolve({ stage: 'search', candidateIds: ['fictional-place-old'] });
    await oldStep;
    expect(controller.state.job?.id).toBe(currentJobId);
    expect(controller.state.job?.completed).toBe(1);
    await controller.nextStep();
    expect(controller.state.job?.completed).toBe(2);
  });

  it('ignores rejection from an older attempt without failing the current attempt', async () => {
    const oldResponse = deferred<unknown>();
    let calls = 0;
    const executor: GenerationDemoExecutor = { execute: async (stage) => ++calls === 1 ? oldResponse.promise : (stage === 'search' ? { stage, candidateIds: ['fictional-place-1'] } : { stage, dayNumbers: [1, 2] }) };
    const controller = new GenerationDemoController(executor);
    controller.start('success');
    const oldStep = controller.nextStep();
    controller.restart('partial');
    await controller.nextStep();
    oldResponse.reject(new Error('late provider failure'));
    await oldStep;
    expect(controller.state.job?.status).toBe('running');
    expect(controller.state.job?.completed).toBe(1);
  });

  it('does not retry an invalid provider response', async () => {
    const controller = new GenerationDemoController({ execute: async () => { throw { code: 'invalid_response', retryable: false }; } });
    controller.start('success');
    await controller.nextStep();
    expect(controller.state.job?.status).toBe('failed');
    expect(controller.retry()).toBe(false);
  });

  it('does not retry an exhausted quota', async () => {
    const controller = new GenerationDemoController(createDemoExecutor());
    controller.start('quota_exhausted');
    await controller.nextStep();
    expect(controller.state.job?.status).toBe('quota_exhausted');
    expect(controller.retry()).toBe(false);
  });

  it('rejects an unknown runtime scenario before creating or running a job', async () => {
    let calls = 0;
    const controller = new GenerationDemoController({ execute: async () => { calls += 1; return {}; } });
    expect(controller.start('surprise' as GenerationScenario)).toBe(false);
    expect(controller.state.job).toBeNull();
    expect(calls).toBe(0);
  });

  it('rejects an unknown runtime locale before mutating the current job', () => {
    const controller = new GenerationDemoController(createDemoExecutor());
    expect(controller.start('success', 'de' as Locale)).toBe(false);
    expect(controller.state.job).toBeNull();
  });

  it('preserves a pending valid attempt when an invalid restart is requested', async () => {
    let resolve!: (value: unknown) => void;
    let calls = 0;
    const pending = new Promise<unknown>((done) => { resolve = done; });
    const controller = new GenerationDemoController({ execute: async () => { calls += 1; return pending; } });
    controller.start('success');
    const step = controller.nextStep();
    const activeJob = controller.state.job;
    expect(controller.restart('surprise' as GenerationScenario)).toBe(false);
    expect(controller.state.job).toBe(activeJob);
    expect(calls).toBe(1);
    resolve({ stage: 'search', candidateIds: ['fictional-place-1'] });
    await step;
  });

  it('preserves a pending valid attempt when restart receives an unknown locale', async () => {
    let resolve!: (value: unknown) => void;
    const pending = new Promise<unknown>((done) => { resolve = done; });
    const controller = new GenerationDemoController({ execute: async () => pending });
    controller.start('success', 'en');
    const step = controller.nextStep();
    const activeJob = controller.state.job;
    expect(controller.restart('partial', 'de' as Locale)).toBe(false);
    expect(controller.state.job).toBe(activeJob);
    resolve({ stage: 'search', candidateIds: ['fictional-place-1'] });
    await step;
  });

  it('does not execute any stage automatically after start', () => {
    let calls = 0;
    const controller = new GenerationDemoController({ execute: async () => { calls += 1; return {}; } });
    controller.start('success');
    expect(calls).toBe(0);
    expect(controller.state.job?.status).toBe('queued');
    expect(controller.state.job?.completed).toBe(0);
  });

  it('ignores a duplicate next-step click while one executor response is pending', async () => {
    let resolve!: (value: unknown) => void;
    let calls = 0;
    const pending = new Promise<unknown>((done) => { resolve = done; });
    const controller = new GenerationDemoController({ execute: async () => { calls += 1; return pending; } });
    controller.start('success');
    const first = controller.nextStep();
    const duplicate = controller.nextStep();
    expect(calls).toBe(1);
    resolve({ stage: 'search', candidateIds: ['fictional-place-1'] });
    await Promise.all([first, duplicate]);
    expect(controller.state.job?.completed).toBe(1);
  });
});
