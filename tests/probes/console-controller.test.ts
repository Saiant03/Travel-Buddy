import { describe, expect, it } from 'vitest';
import { createAuthWorker } from '../../probes/auth-worker.js';
import { createCasWorker, type BatchD1 } from '../../probes/cas-worker.js';
import { createBenchmarkWorker } from '../../probes/cpu-runner.js';
import { ProbeConsole } from '../../probes/server-console/controller.js';
import { buildProbeSeedSql } from '../../probes/server-console/seed.js';
import { createSqliteD1 } from './helpers/sqlite-d1.js';

const ORIGIN = 'https://probe.example.workers.dev';
const API_KEY = 'public-test-api-key';
const PROJECT_ID = 'probe-test-project';
const BUILD_HASH = 'a'.repeat(40);

function makeHarness(options: {
  alphaVerified?: boolean; betaVerified?: boolean; shareUid?: boolean; allowBetaPrivateTrip?: boolean;
  malformedAlphaProfile?: boolean; allowUnauthenticatedTripStatus?: number; allowBetaCrossProfile?: boolean;
  wrongWinnerItinerary?: boolean; alterRetryReceipt?: boolean; malformedWinnerReceipt?: boolean;
  forceConfirmStatus?: 200 | 409;
  deferPrivateTripBody?: boolean;
  alphaProfileCacheControl?: string | null;
  tripCacheControl?: string | null;
} = {}) {
  const db = createSqliteD1();
  db.exec(buildProbeSeedSql('uid-alpha', 'uid-beta'));
  const uidByEmail: Record<string, string> = {
    'alpha@example.test': 'uid-alpha',
    'beta@example.test': options.shareUid ? 'uid-alpha' : 'uid-beta',
  };
  const verifiedByUid: Record<string, boolean> = {
    'uid-alpha': options.alphaVerified ?? true,
    'uid-beta': options.betaVerified ?? true,
  };
  const tokenByUid: Record<string, string> = { 'uid-alpha': 'synthetic-token-alpha', 'uid-beta': 'synthetic-token-beta' };
  const requests: Array<{ url: string; init: RequestInit }> = [];
  let confirmationCount = 0;
  let resolveDeferredApiBody: ((value: unknown) => void) | undefined;
  const verifyIdentity = async (token: string) => {
    const uid = Object.entries(tokenByUid).find(([, value]) => value === token)?.[0];
    if (!uid) throw new Error('invalid synthetic bearer');
    return { uid, emailVerified: true as const };
  };
  const authWorker = createAuthWorker({ verifyIdentity, db });
  let previousBatch = Promise.resolve();
  const serialDb: BatchD1 = {
    prepare: db.prepare.bind(db),
    batch: (statements) => {
      const current = previousBatch.then(() => db.batch(statements as never));
      previousBatch = current.then(() => undefined, () => undefined);
      return current;
    },
  };
  const casWorker = createCasWorker({ verifyIdentity, db: serialDb as unknown as BatchD1 });
  const benchmarkWorker = createBenchmarkWorker({
    verifyIdentity,
    verifyIdentityWithKeyCacheState: async (token) => ({
      identity: await verifyIdentity(token),
      keyCacheState: 'warm',
    }),
    db,
  });

  const fetcher: typeof fetch = async (input, init = {}) => {
    const url = input instanceof Request ? input.url : String(input);
    const requestInit = { ...init };
    requests.push({ url, init: requestInit });
    const parsed = new URL(url);
    if (parsed.origin === 'https://identitytoolkit.googleapis.com') {
      const body = JSON.parse(String(requestInit.body ?? '{}')) as Record<string, string>;
      if (parsed.pathname.endsWith('/accounts:signInWithPassword')) {
        const uid = uidByEmail[body.email ?? ''];
        if (!uid || body.password !== 'synthetic-password') return Response.json({ error: { message: 'INVALID_LOGIN_CREDENTIALS' } }, { status: 400 });
        return Response.json({ localId: uid, idToken: tokenByUid[uid], refreshToken: 'ignored-refresh-token', expiresIn: '3600' });
      }
      if (parsed.pathname.endsWith('/accounts:lookup')) {
        const uid = Object.entries(tokenByUid).find(([, token]) => token === body.idToken)?.[0];
        return uid ? Response.json({ users: [{ localId: uid, email: `${uid}@example.test`, emailVerified: verifiedByUid[uid] }] }) : Response.json({ error: { message: 'INVALID_ID_TOKEN' } }, { status: 400 });
      }
      if (parsed.pathname.endsWith('/accounts:sendOobCode')) return Response.json({ email: 'synthetic@example.test' });
      return Response.json({ error: { message: 'UNEXPECTED_AUTH_ROUTE' } }, { status: 404 });
    }

    const request = new Request(url, requestInit);
    if (parsed.origin !== ORIGIN) return new Response('unexpected external target', { status: 500 });
    if (options.allowBetaPrivateTrip && parsed.pathname === '/probe/trip/probe-private-trip' &&
        request.headers.get('Authorization') === `Bearer ${tokenByUid['uid-beta']}`) {
      return Response.json({ ok: true, data: { id: 'probe-private-trip' } }, { headers: { 'Cache-Control': 'private, no-store' } });
    }
    if (options.malformedAlphaProfile && parsed.pathname === '/probe/profile/uid-alpha' &&
        request.headers.get('Authorization') === `Bearer ${tokenByUid['uid-alpha']}`) {
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
    }
    if (options.allowUnauthenticatedTripStatus && parsed.pathname === '/probe/trip/trip-1' && !request.headers.has('Authorization')) {
      return new Response(null, { status: options.allowUnauthenticatedTripStatus, headers: { 'Cache-Control': 'private, no-store' } });
    }
    if (options.allowBetaCrossProfile && parsed.pathname === '/probe/profile/uid-alpha' &&
        request.headers.get('Authorization') === `Bearer ${tokenByUid['uid-beta']}`) {
      return Response.json({ ok: true, data: { name: 'Alpha' } }, { headers: { 'Cache-Control': 'private, no-store' } });
    }
    if (options.deferPrivateTripBody && parsed.pathname === '/probe/trip/probe-private-trip' &&
        request.headers.get('Authorization') === `Bearer ${tokenByUid['uid-beta']}`) {
      const delayed = Response.json({ ok: false, error: { code: 'FORBIDDEN' } }, {
        status: 403, headers: { 'Cache-Control': 'private, no-store' },
      });
      delayed.json = () => new Promise((resolve) => { resolveDeferredApiBody = resolve; });
      return delayed;
    }
    if (options.alphaProfileCacheControl !== undefined && parsed.pathname === '/probe/profile/uid-alpha' &&
        request.headers.get('Authorization') === `Bearer ${tokenByUid['uid-alpha']}`) {
      const headers = new Headers({ 'Cache-Control': options.alphaProfileCacheControl ?? '', 'Content-Type': 'application/json' });
      if (options.alphaProfileCacheControl === null) headers.delete('Cache-Control');
      return new Response(JSON.stringify({ ok: true, data: { name: 'Alpha' } }), { headers });
    }
    if (parsed.pathname === '/probe/benchmark') return benchmarkWorker.fetch(request);
    if (parsed.pathname.endsWith('/proposals/confirm')) {
      confirmationCount += 1;
      if (options.forceConfirmStatus) {
        const payload = JSON.parse(String(requestInit.body ?? '{}')) as { proposalId: string };
        if (options.forceConfirmStatus === 409) {
          return Response.json({ ok: false, error: { code: 'VERSION_CONFLICT' }, requestId: `forced-${confirmationCount}` }, {
            status: 409, headers: { 'Cache-Control': 'private, no-store' },
          });
        }
        return Response.json({ ok: true, data: { id: `forced-${confirmationCount}`, proposalId: payload.proposalId, revision: 8 }, requestId: `forced-${confirmationCount}` }, {
          status: 200, headers: { 'Cache-Control': 'private, no-store' },
        });
      }
      const response = await casWorker.fetch(request);
      if (options.alterRetryReceipt && confirmationCount > 2 && response.status === 200) {
        const body = await response.json() as { ok: boolean; data: Record<string, unknown>; requestId: string };
        return Response.json({ ...body, data: { ...body.data, id: 'different-retry-receipt' } }, {
          status: response.status, headers: response.headers,
        });
      }
      if (options.malformedWinnerReceipt && confirmationCount <= 2 && response.status === 200) {
        const body = await response.json() as { ok: boolean; data: Record<string, unknown>; requestId: string };
        return Response.json({ ok: body.ok, requestId: body.requestId }, { status: response.status, headers: response.headers });
      }
      return response;
    }
    if (options.tripCacheControl !== undefined && parsed.pathname === '/probe/trip/trip-1' && request.method === 'GET') {
      const response = await authWorker.fetch(request);
      const body = await response.clone().json() as Record<string, unknown>;
      const headers = new Headers(response.headers);
      if (options.tripCacheControl === null) headers.delete('Cache-Control');
      else headers.set('Cache-Control', options.tripCacheControl);
      return new Response(JSON.stringify(body), { status: response.status, headers });
    }
    if (options.wrongWinnerItinerary && parsed.pathname === '/probe/trip/trip-1') {
      const response = await authWorker.fetch(request);
      const body = await response.clone().json() as { ok: boolean; data: Record<string, unknown>; requestId: string };
      if (body.data?.version === 8) {
        return Response.json({ ...body, data: { ...body.data, itinerary: { days: ['wrong winner patch'] } } }, {
          status: response.status, headers: response.headers,
        });
      }
      return response;
    }
    return authWorker.fetch(request);
  };

  return {
    db,
    requests,
    apiBodyPending: () => resolveDeferredApiBody !== undefined,
    resolveApiBody: (value: unknown) => resolveDeferredApiBody?.(value),
    console: new ProbeConsole({ apiKey: API_KEY, projectId: PROJECT_ID, origin: ORIGIN, buildHash: BUILD_HASH, fetcher }),
  };
}

async function signInBoth(probe: ProbeConsole): Promise<void> {
  await probe.signIn('alpha', 'alpha@example.test', 'synthetic-password');
  await probe.signIn('beta', 'beta@example.test', 'synthetic-password');
}

describe('browser server-probe controller', () => {
  it('keeps tokens internal and uses bounded, non-persistent Firebase auth requests', async () => {
    const harness = makeHarness();
    const summary = await harness.console.signIn('alpha', 'alpha@example.test', 'synthetic-password');

    expect(summary).toEqual({ signedIn: true, emailVerified: true });
    expect(harness.console.hasSession('alpha')).toBe(true);
    expect(harness.console.isVerified('alpha')).toBe(true);
    expect(summary).not.toHaveProperty('idToken');
    expect(summary).not.toHaveProperty('refreshToken');
    expect(harness.requests.map(({ url }) => new URL(url).pathname)).toEqual([
      '/v1/accounts:signInWithPassword', '/v1/accounts:lookup',
    ]);
    expect(harness.requests.every(({ init }) => init.cache === 'no-store' && init.credentials === 'omit' && init.redirect === 'error')).toBe(true);
    expect(harness.requests.every(({ init }) => init.signal instanceof AbortSignal)).toBe(true);
  });

  it('requires an explicit verification-email action and rejects the same Firebase UID in both slots', async () => {
    const pending = makeHarness({ alphaVerified: false });
    const summary = await pending.console.signIn('alpha', 'alpha@example.test', 'synthetic-password');
    expect(summary.emailVerified).toBe(false);
    expect(pending.requests.some(({ url }) => url.includes('sendOobCode'))).toBe(false);
    await pending.console.sendVerification('alpha');
    expect(pending.requests.at(-1)?.url).toContain('/v1/accounts:sendOobCode');
    expect(JSON.parse(String(pending.requests.at(-1)?.init.body))).toMatchObject({ requestType: 'VERIFY_EMAIL' });
    await expect(pending.console.runAccessChecks()).rejects.toMatchObject({ code: 'two_verified_sessions_required' });

    const duplicate = makeHarness({ shareUid: true });
    await duplicate.console.signIn('alpha', 'alpha@example.test', 'synthetic-password');
    await expect(duplicate.console.signIn('beta', 'beta@example.test', 'synthetic-password')).rejects.toMatchObject({
      code: 'duplicate_account',
    });
    expect(duplicate.console.hasSession('beta')).toBe(false);
  });

  it('aborts and invalidates a sign-in that finishes after sign-out', async () => {
    let resolveSignIn: ((response: Response) => void) | undefined;
    let seenSignal: AbortSignal | undefined;
    let calls = 0;
    const probe = new ProbeConsole({ apiKey: API_KEY, projectId: PROJECT_ID, origin: ORIGIN, buildHash: BUILD_HASH,
      fetcher: async (input, init = {}) => {
        calls += 1;
        seenSignal = init.signal as AbortSignal;
        if (String(input).includes('signInWithPassword')) {
          return await new Promise<Response>((resolve) => { resolveSignIn = resolve; });
        }
        return Response.json({ users: [{ localId: 'uid-alpha', emailVerified: true }] });
      },
    });
    const pending = probe.signIn('alpha', 'alpha@example.test', 'synthetic-password');
    await Promise.resolve();
    probe.signOut();
    expect(seenSignal?.aborted).toBe(true);
    resolveSignIn?.(Response.json({ localId: 'uid-alpha', idToken: 'late-token', refreshToken: 'ignored' }));

    await expect(pending).rejects.toMatchObject({ code: 'signed_out' });
    expect(probe.hasSession('alpha')).toBe(false);
    expect(calls).toBe(1);
  });

  it('does not complete verification sending when sign-out happens during response parsing', async () => {
    let resolveBody: ((value: unknown) => void) | undefined;
    const probe = new ProbeConsole({ apiKey: API_KEY, projectId: PROJECT_ID, origin: ORIGIN, buildHash: BUILD_HASH,
      fetcher: async (input) => {
        const url = new URL(String(input));
        if (url.pathname.endsWith('/accounts:signInWithPassword')) return Response.json({ localId: 'uid-alpha', idToken: 'synthetic-token-alpha' });
        if (url.pathname.endsWith('/accounts:lookup')) return Response.json({ users: [{ localId: 'uid-alpha', emailVerified: false }] });
        const delayed = Response.json({ email: 'alpha@example.test' });
        delayed.json = () => new Promise((resolve) => { resolveBody = resolve; });
        return delayed;
      },
    });
    await probe.signIn('alpha', 'alpha@example.test', 'synthetic-password');
    const pending = probe.sendVerification('alpha');
    while (!resolveBody) await new Promise<void>((resolve) => setTimeout(resolve, 0));
    probe.signOut();
    resolveBody({ email: 'alpha@example.test' });

    await expect(pending).rejects.toMatchObject({ code: 'signed_out' });
  });

  it('checks private reads through the real probe Worker against the seeded SQLite fixture', async () => {
    const harness = makeHarness();
    await signInBoth(harness.console);
    const checks = await harness.console.runAccessChecks();

    expect(checks).toHaveLength(10);
    expect(checks.every((check) => check.pass)).toBe(true);
    expect(checks.some((check) => check.expected === 401 && check.actual === 401)).toBe(true);
    expect(checks.some((check) => check.expected === 403 && check.actual === 403)).toBe(true);
    expect(checks.every((check) => check.cacheControl === 'private, no-store')).toBe(true);
    expect(checks.some((check) => /uid|email|token/i.test(check.name))).toBe(false);
  });

  it('does not return access checks when sign-out occurs while the final response body is pending', async () => {
    const harness = makeHarness({ deferPrivateTripBody: true });
    await signInBoth(harness.console);
    const pending = harness.console.runAccessChecks();
    while (!harness.apiBodyPending()) await new Promise<void>((resolve) => setTimeout(resolve, 0));
    harness.console.signOut();
    harness.resolveApiBody({ ok: false, error: { code: 'FORBIDDEN' } });

    await expect(pending).rejects.toMatchObject({ code: 'signed_out' });
  });

  it('stops access probing if a non-member unexpectedly receives a private trip', async () => {
    const harness = makeHarness({ allowBetaPrivateTrip: true });
    await signInBoth(harness.console);
    const checks = await harness.console.runAccessChecks();
    const unexpected = checks.at(-1);
    expect(unexpected).toMatchObject({ expected: 403, actual: 200, pass: false });
    expect(checks).toHaveLength(10);
  });

  it('rejects beta reading alpha profile and stops before shared-trip probes', async () => {
    const harness = makeHarness({ allowBetaCrossProfile: true });
    await signInBoth(harness.console);
    const checks = await harness.console.runAccessChecks();

    expect(checks.at(-1)).toMatchObject({ name: 'beta cannot read alpha profile', expected: 403, actual: 200, pass: false });
    expect(checks).toHaveLength(7);
  });

  it('stops access probing when an expected denial returns any 2xx status', async () => {
    const harness = makeHarness({ allowUnauthenticatedTripStatus: 204 });
    await signInBoth(harness.console);
    const checks = await harness.console.runAccessChecks();

    expect(checks).toHaveLength(1);
    expect(checks[0]).toMatchObject({ expected: 401, actual: 204, pass: false });
    expect(harness.requests.filter(({ url }) => url.startsWith(ORIGIN))).toHaveLength(1);
  });

  it('fails a 200 private-read response that omits its data payload', async () => {
    const harness = makeHarness({ malformedAlphaProfile: true });
    await signInBoth(harness.console);
    const checks = await harness.console.runAccessChecks();

    expect(checks.find(({ name }) => name === 'alpha reads own profile')).toMatchObject({
      expected: 200, actual: 200, pass: false, cacheControl: 'private, no-store',
    });
  });

  it.each([
    ['missing cache header', null],
    ['public cache header', 'public, max-age=60'],
  ] as const)('fails a valid profile response with a %s', async (_label, cacheControl) => {
    const harness = makeHarness({ alphaProfileCacheControl: cacheControl });
    await signInBoth(harness.console);
    const checks = await harness.console.runAccessChecks();

    expect(checks.find(({ name }) => name === 'alpha reads own profile')).toMatchObject({
      expected: 200, actual: 200, pass: false,
    });
  });

  it('races immutable proposals and proves idempotent receipts across both member sessions', async () => {
    const harness = makeHarness();
    await signInBoth(harness.console);
    const checks = await harness.console.runCasChecks();

    expect(checks.length).toBeGreaterThanOrEqual(8);
    expect(checks.every((check) => check.pass)).toBe(true);
    expect(checks.find(({ name }) => name === 'alpha reads trip version 7 version')).toMatchObject({ expected: 7, actual: 7, pass: true });
    expect(await harness.db.prepare("SELECT version, itinerary_json FROM trips WHERE id='trip-1'").first()).toMatchObject({ version: 8 });
    expect(await harness.db.prepare("SELECT COUNT(*) AS count FROM idempotency_records WHERE trip_id='trip-1'").first()).toMatchObject({ count: 1 });
  });

  it('fails the CAS race aggregate when both proposals conflict and stops before reload', async () => {
    const harness = makeHarness({ forceConfirmStatus: 409 });
    await signInBoth(harness.console);
    const checks = await harness.console.runCasChecks();

    expect(checks.find(({ name }) => name === 'CAS race has exactly one applied proposal and one conflict')).toMatchObject({
      expected: 1, actual: 0, pass: false,
    });
    expect(checks.every((check) => check.pass)).toBe(false);
    expect(harness.requests.filter(({ url }) => url.includes('/proposals/confirm'))).toHaveLength(2);
    expect(harness.requests.filter(({ url }) => url.endsWith('/probe/trip/trip-1'))).toHaveLength(2);
  });

  it('fails the CAS race aggregate when both proposals report success and stops before reload', async () => {
    const harness = makeHarness({ forceConfirmStatus: 200 });
    await signInBoth(harness.console);
    const checks = await harness.console.runCasChecks();

    expect(checks.find(({ name }) => name === 'CAS race has exactly one applied proposal and one conflict')).toMatchObject({
      expected: 1, actual: 0, pass: false,
    });
    expect(checks.every((check) => check.pass)).toBe(false);
    expect(harness.requests.filter(({ url }) => url.includes('/proposals/confirm'))).toHaveLength(2);
    expect(harness.requests.filter(({ url }) => url.endsWith('/probe/trip/trip-1'))).toHaveLength(2);
  });

  it.each([
    ['missing cache header', null],
    ['public cache header', 'public, max-age=60'],
  ] as const)('stops CAS before confirmation when a trip read has a %s', async (_label, cacheControl) => {
    const harness = makeHarness({ tripCacheControl: cacheControl });
    await signInBoth(harness.console);
    const checks = await harness.console.runCasChecks();

    expect(checks.every((check) => check.pass)).toBe(false);
    expect(harness.requests.filter(({ url }) => url.includes('/proposals/confirm'))).toHaveLength(0);
  });

  it('stops CAS before retries when both reloads disagree with the winning immutable patch', async () => {
    const harness = makeHarness({ wrongWinnerItinerary: true });
    await signInBoth(harness.console);
    const checks = await harness.console.runCasChecks();

    expect(checks.every((check) => check.pass)).toBe(false);
    expect(harness.requests.filter(({ url }) => url.endsWith('/proposals/confirm'))).toHaveLength(2);
  });

  it('rejects matching retries when their receipt differs from the winning receipt', async () => {
    const harness = makeHarness({ alterRetryReceipt: true });
    await signInBoth(harness.console);
    const checks = await harness.console.runCasChecks();

    expect(checks.find(({ name }) => name === 'both members receive the same winning receipt')?.pass).toBe(false);
  });

  it('stops CAS after a malformed winning response without reading or retrying it', async () => {
    const harness = makeHarness({ malformedWinnerReceipt: true });
    await signInBoth(harness.console);
    const checks = await harness.console.runCasChecks();

    expect(checks.some((check) => !check.pass)).toBe(true);
    expect(harness.requests.filter(({ url }) => url.includes('/proposals/confirm'))).toHaveLength(2);
  });

  it('does not start CPU dispatch without a verified alpha session and bounds its first failed request', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const probe = new ProbeConsole({ apiKey: API_KEY, projectId: PROJECT_ID, origin: ORIGIN, buildHash: BUILD_HASH,
      fetcher: async (input, init = {}) => {
        const url = String(input);
        calls.push({ url, init });
        const parsed = new URL(url);
        if (parsed.origin === 'https://identitytoolkit.googleapis.com') {
          JSON.parse(String(init.body ?? '{}')) as Record<string, string>;
          if (parsed.pathname.endsWith('/accounts:signInWithPassword')) return Response.json({ localId: 'uid-alpha', idToken: 'synthetic-token-alpha' });
          if (parsed.pathname.endsWith('/accounts:lookup')) return Response.json({ users: [{ localId: 'uid-alpha', emailVerified: true }] });
        }
        return new Response('{}', { status: 503 });
      },
    });
    await expect(probe.runCpuChecks()).rejects.toMatchObject({ code: 'verified_alpha_required' });
    await probe.signIn('alpha', 'alpha@example.test', 'synthetic-password');
    const result = await probe.runCpuChecks();
    expect(result.status).toBe('blocked');
    expect(calls.filter(({ url }) => url.includes('/probe/benchmark'))).toHaveLength(1);
    expect(calls.at(-1)?.url).toBe(`${ORIGIN}/probe/benchmark`);
    expect(calls.at(-1)?.init.cache).toBe('no-store');
    expect(calls.at(-1)?.init.credentials).toBe('omit');
    expect(result).not.toHaveProperty('cpuMs');
  });

  it.each([
    ['missing cache header', undefined],
    ['public cache header', 'public, max-age=60'],
  ] as const)('blocks CPU dispatch when the primer response has a %s', async (_label, cacheControl) => {
    let calls = 0;
    const probe = new ProbeConsole({ apiKey: API_KEY, projectId: PROJECT_ID, origin: ORIGIN, buildHash: BUILD_HASH,
      fetcher: async (input) => {
        const url = new URL(String(input));
        if (url.origin === 'https://identitytoolkit.googleapis.com') {
          if (url.pathname.endsWith('/accounts:signInWithPassword')) return Response.json({ localId: 'uid-alpha', idToken: 'synthetic-token-alpha' });
          if (url.pathname.endsWith('/accounts:lookup')) return Response.json({ users: [{ localId: 'uid-alpha', emailVerified: true }] });
        }
        calls += 1;
        const requestId = `cpu-${calls}`;
        const headers = new Headers({ 'X-Probe-Path': 'warm', 'X-Probe-Key-Cache': 'warm', 'X-Probe-Request-ID': requestId });
        if (cacheControl !== undefined) headers.set('Cache-Control', cacheControl);
        return Response.json({ ok: true, requestId }, { headers });
      },
    });
    await probe.signIn('alpha', 'alpha@example.test', 'synthetic-password');
    const result = await probe.runCpuChecks();

    expect(result.status).toBe('blocked');
    expect(calls).toBe(1);
    expect(result.records).toHaveLength(0);
  });
});
