import { describe, expect, it } from 'vitest';
import { parseTrip } from '../../../src/shared/contracts/trip';
import { parseDayPlan, parseItinerary, parsePlace, parseProposal, parseConfirmProposalRequest } from '../../../src/shared/contracts/itinerary';
import { validItinerary, validTrip } from '../../fixtures/contracts';

describe('trip wire contract', () => {
  it('round trips a two-member trip with inclusive calendar dates and optional stay', () => {
    expect(parseTrip(validTrip)).toEqual({ ok: true, data: validTrip });
    expect(parseTrip({ ...validTrip, bases: [] })).toMatchObject({ ok: true });
  });

  it('rejects impossible dates, mismatched day count, duplicate members, and overlapping bases', () => {
    expect(parseTrip({ ...validTrip, dates: { start: '2027-02-30', end: '2027-03-02', days: 1 } })).toMatchObject({ ok: false });
    expect(parseTrip({ ...validTrip, dates: { start: '2027-04-10', end: '2027-04-12', days: 2 } })).toMatchObject({ ok: false });
    expect(parseTrip({ ...validTrip, memberUids: ['u-alfa', 'u-alfa'] })).toMatchObject({ ok: false });
    const overlap = [...validTrip.bases, { ...validTrip.bases[0], id: 'base-2', startDay: 3, endDay: 3 }];
    expect(parseTrip({ ...validTrip, bases: overlap })).toMatchObject({ ok: false });
  });

  it('rejects impossible coordinates and non-HTTPS URLs in place data', () => {
    expect(parseTrip({ ...validTrip, destination: { ...validTrip.destination, location: { lat: 91, lng: 0 } } })).toMatchObject({ ok: false });
    expect(parseTrip({ ...validTrip, destination: { ...validTrip.destination, address: 'here', unexpected: true } })).toMatchObject({ ok: false });
  });
});

describe('itinerary and proposal contracts', () => {
  it('accepts a human-readable reservation note that is not a URL', () => {
    expect(parsePlace({ ...validItinerary.days[0]!.stops[0]!.place, reservation: 'Rezervare necesară' })).toMatchObject({ ok: true });
  });

  it('does not apply the user-text length cap to provider route geometry', () => {
    expect(parseDayPlan({ ...validItinerary.days[0]!, route: { geometry: 'x'.repeat(4_001), provider: 'geoapify', confidence: 'verified' } })).toMatchObject({ ok: true });
  });

  it('round trips a complete itinerary whose days are consecutive', () => {
    expect(parseItinerary(validItinerary)).toEqual({ ok: true, data: validItinerary });
  });

  it('rejects duplicate stop IDs, nonconsecutive days, and a fixed time without acceptance', () => {
    const firstDay = validItinerary.days[0]!;
    const firstStop = firstDay.stops[0]!;
    const duplicate = { ...validItinerary, days: [firstDay, { ...validItinerary.days[1]!, stops: [{ ...firstStop }] }, validItinerary.days[2]!] };
    expect(parseItinerary(duplicate)).toMatchObject({ ok: false });
    expect(parseItinerary({ ...validItinerary, days: [{ ...firstDay, dayNumber: 2 }, ...validItinerary.days.slice(1)] })).toMatchObject({ ok: false });
    expect(parseItinerary({ ...validItinerary, days: [{ ...firstDay, stops: [{ ...firstStop, fixedTime: '09:30' }] }, ...validItinerary.days.slice(1)] })).toMatchObject({ ok: false });
  });

  it('accepts server-produced proposal patches but never a client supplied confirmation patch', () => {
    const proposal = {
      schemaVersion: 1, id: 'proposal-1', tripId: 'trip-1', baseVersion: 7,
      request: { id: 'request-1', message: 'Remove the museum', locale: 'ro' },
      preferenceFingerprint: 'a'.repeat(64), immutablePatch: { days: validItinerary.days },
      patchHash: 'c'.repeat(64), summary: { removed: ['stop-1'], preserved: [], added: [] },
    };
    expect(parseProposal(proposal)).toMatchObject({ ok: true });
    expect(parseConfirmProposalRequest({ proposalId: 'proposal-1', expectedVersion: 7, idempotencyKey: 'cmd-1' })).toMatchObject({ ok: true });
    expect(parseConfirmProposalRequest({ proposalId: 'proposal-1', expectedVersion: 7, idempotencyKey: 'cmd-1', patch: { days: [] } })).toMatchObject({ ok: false });
  });
});
