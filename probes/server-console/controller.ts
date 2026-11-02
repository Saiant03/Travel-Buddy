import { runCpuProbe, type CpuDispatchResult } from '../cpu-runner.js';
import { buildProbeSeedSql } from './seed.js';

export type Slot = 'alpha' | 'beta';
export interface AuthSummary { signedIn: boolean; emailVerified: boolean }
export interface ProbeCheck { name: string; expected: number; actual: number; pass: boolean; cacheControl?: string }

export class ProbeConsoleError extends Error {
  constructor(readonly code: string) { super(code); this.name = 'ProbeConsoleError'; }
}

interface Session { idToken: string; uid: string; verified: boolean }
interface ConsoleOptions { apiKey: string; projectId: string; origin: string; buildHash: string; fetcher?: typeof fetch }
interface Operation { controller: AbortController; generation: number }
const AUTH_HOST = 'https://identitytoolkit.googleapis.com/v1';
const TIMEOUT_MS = 8_000;
const BUILD_HASH_PATTERN = /^[a-f0-9]{40,64}$/;

function failure(code: string): ProbeConsoleError { return new ProbeConsoleError(code); }
function safeText(value: unknown, limit = 256): string | undefined {
  return typeof value === 'string' && value.length > 0 && value.length <= limit ? value : undefined;
}

export class ProbeConsole {
  readonly #apiKey: string;
  readonly #origin: string;
  readonly #buildHash: string;
  readonly #fetcher: typeof fetch;
  readonly #sessions = new Map<Slot, Session>();
  #generation = 0;
  #operation?: Operation;

  constructor(options: ConsoleOptions) {
    let parsed: URL;
    try { parsed = new URL(options.origin); } catch { throw failure('invalid_configuration'); }
    const localHttp = parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
    if ((!['https:', 'http:'].includes(parsed.protocol) || (parsed.protocol !== 'https:' && !localHttp)) ||
        parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/' ||
        !safeText(options.apiKey, 512) || !safeText(options.projectId, 256) || !BUILD_HASH_PATTERN.test(options.buildHash)) {
      throw failure('invalid_configuration');
    }
    this.#apiKey = options.apiKey;
    this.#origin = parsed.origin;
    this.#buildHash = options.buildHash;
    this.#fetcher = options.fetcher ?? fetch.bind(globalThis);
  }

  hasSession(slot: Slot): boolean { return this.#sessions.has(slot); }
  isVerified(slot: Slot): boolean { return this.#sessions.get(slot)?.verified === true; }

  createSeedSql(): string {
    const alpha = this.#requireVerifiedForChecks('alpha');
    const beta = this.#requireVerifiedForChecks('beta');
    if (alpha.uid === beta.uid) throw failure('duplicate_account');
    return buildProbeSeedSql(alpha.uid, beta.uid);
  }

  signOut(): void {
    this.#generation += 1;
    this.#operation?.controller.abort();
    this.#operation = undefined;
    this.#sessions.clear();
  }

  async signIn(slot: Slot, email: string, password: string): Promise<AuthSummary> {
    const operation = this.#begin();
    const generation = this.#generation;
    this.#sessions.delete(slot);
    try {
      if (!safeText(email, 320) || !safeText(password, 4096)) throw failure('sign_in_failed');
      const signed = await this.#authPost('accounts:signInWithPassword', {
        email, password, returnSecureToken: true,
      }, operation);
      this.#assertCurrent(operation);
      const uid = safeText(signed.localId, 128);
      const idToken = safeText(signed.idToken, 16_384);
      if (!uid || !idToken) throw failure('sign_in_failed');
      const lookedUp = await this.#authPost('accounts:lookup', { idToken }, operation);
      this.#assertCurrent(operation);
      const users = lookedUp.users;
      if (!Array.isArray(users) || users.length !== 1 || !users[0] || typeof users[0] !== 'object') throw failure('sign_in_failed');
      const user = users[0] as Record<string, unknown>;
      if (user.localId !== uid || typeof user.emailVerified !== 'boolean') throw failure('sign_in_failed');
      if (generation !== this.#generation || operation.controller.signal.aborted) throw failure('signed_out');
      for (const [otherSlot, session] of this.#sessions) {
        if (otherSlot !== slot && session.uid === uid) throw failure('duplicate_account');
      }
      this.#sessions.set(slot, { idToken, uid, verified: user.emailVerified });
      this.#assertCurrent(operation);
      return { signedIn: true, emailVerified: user.emailVerified };
    } catch (error) {
      if (generation !== this.#generation || operation.controller.signal.aborted) throw failure('signed_out');
      if (error instanceof ProbeConsoleError) throw error;
      throw failure('sign_in_failed');
    } finally { this.#finish(operation); }
  }

  async sendVerification(slot: Slot): Promise<void> {
    const operation = this.#begin();
    try {
      const session = this.#requireSession(slot);
      if (session.verified) throw failure('already_verified');
      await this.#authPost('accounts:sendOobCode', { requestType: 'VERIFY_EMAIL', idToken: session.idToken }, operation);
      this.#assertCurrent(operation);
    } catch (error) {
      if (error instanceof ProbeConsoleError) throw error;
      throw failure('verification_send_failed');
    } finally { this.#finish(operation); }
  }

  async runAccessChecks(): Promise<ProbeCheck[]> {
    const operation = this.#begin();
    try {
      const alpha = this.#requireVerifiedForChecks('alpha');
      const beta = this.#requireVerifiedForChecks('beta');
      if (alpha.uid === beta.uid) throw failure('duplicate_account');
      const checks: ProbeCheck[] = [];
      const run = async (name: string, path: string, expected: number, session?: Session, malformed = false) => {
        const headers: Record<string, string> = session ? { Authorization: `Bearer ${session.idToken}` } : malformed ? { Authorization: 'Bearer malformed' } : {};
        const result = await this.#apiRequest(path, { method: 'GET', headers }, operation);
        const check = this.#check(name, expected, result.response, result.body);
        checks.push(check);
        if ((expected === 401 || expected === 403) && result.response.status >= 200 && result.response.status < 300) return false;
        return true;
      };
      if (!await run('trip rejects missing authentication', '/probe/trip/trip-1', 401)) return this.#returnCurrent(operation, checks);
      if (!await run('trip rejects malformed authentication', '/probe/trip/trip-1', 401, undefined, true)) return this.#returnCurrent(operation, checks);
      if (!await run('profile rejects missing authentication', '/probe/profile/uid-alpha', 401)) return this.#returnCurrent(operation, checks);
      if (!await run('alpha reads own profile', `/probe/profile/${encodeURIComponent(alpha.uid)}`, 200, alpha)) return this.#returnCurrent(operation, checks);
      if (!await run('beta reads own profile', `/probe/profile/${encodeURIComponent(beta.uid)}`, 200, beta)) return this.#returnCurrent(operation, checks);
      if (!await run('alpha cannot read beta profile', `/probe/profile/${encodeURIComponent(beta.uid)}`, 403, alpha)) return this.#returnCurrent(operation, checks);
      if (!await run('beta cannot read alpha profile', `/probe/profile/${encodeURIComponent(alpha.uid)}`, 403, beta)) return this.#returnCurrent(operation, checks);
      if (!await run('alpha reads shared trip', '/probe/trip/trip-1', 200, alpha)) return this.#returnCurrent(operation, checks);
      if (!await run('beta reads shared trip', '/probe/trip/trip-1', 200, beta)) return this.#returnCurrent(operation, checks);
      await run('beta cannot read alpha private trip', '/probe/trip/probe-private-trip', 403, beta);
      return this.#returnCurrent(operation, checks);
    } finally { this.#finish(operation); }
  }

  async runCasChecks(): Promise<ProbeCheck[]> {
    const operation = this.#begin();
    try {
      const alpha = this.#requireVerifiedForChecks('alpha');
      const beta = this.#requireVerifiedForChecks('beta');
      if (alpha.uid === beta.uid) throw failure('duplicate_account');
      const checks: ProbeCheck[] = [];
      const readTrip = async (
        name: string,
        session: Session,
        expectedVersion: number,
        expectedItinerary?: unknown,
      ): Promise<{ body: Record<string, unknown>; ok: boolean }> => {
        const result = await this.#apiRequest('/probe/trip/trip-1', { method: 'GET', headers: { Authorization: `Bearer ${session.idToken}` } }, operation);
        const body = result.body;
        const data = body?.data as Record<string, unknown> | undefined;
        const valid = result.response.status === 200 && result.response.headers.get('Cache-Control') === 'private, no-store' &&
          body?.ok === true && !!data && typeof data === 'object' && data.version === expectedVersion && data.itinerary !== undefined &&
          (expectedItinerary === undefined || JSON.stringify(data.itinerary) === JSON.stringify(expectedItinerary));
        checks.push(this.#check(`${name} response`, 200, result.response, body));
        const cacheControl = result.response.headers.get('Cache-Control') ?? undefined;
        checks.push({
          name: `${name} version`, expected: expectedVersion,
          actual: typeof data?.version === 'number' ? data.version : 0,
          pass: valid && data?.version === expectedVersion && cacheControl === 'private, no-store',
          ...(cacheControl ? { cacheControl } : {}),
        });
        return { body: data ?? {}, ok: valid };
      };
      const beforeA = await readTrip('alpha reads trip version 7', alpha, 7);
      if (!beforeA.ok) return this.#returnCurrent(operation, checks);
      const beforeB = await readTrip('beta reads trip version 7', beta, 7);
      if (!beforeB.ok || JSON.stringify(beforeA.body.itinerary) !== JSON.stringify(beforeB.body.itinerary)) {
        if (beforeB.ok) checks[checks.length - 1]!.pass = false;
        throw failure('fixture_not_v7');
      }
      const proposalIds = ['proposal-a', 'proposal-b'] as const;
      const keys = [crypto.randomUUID(), crypto.randomUUID()];
      const responses = await Promise.all([alpha, beta].map((session, index) => this.#apiRequest('/probe/trip/trip-1/proposals/confirm', {
        method: 'POST', headers: { Authorization: `Bearer ${session.idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: proposalIds[index], expectedVersion: 7, idempotencyKey: keys[index] }),
      }, operation)));
      const winner = responses.findIndex(({ response }) => response.status === 200);
      const successCount = responses.filter(({ response }) => response.status === 200).length;
      const conflictCount = responses.filter(({ response }) => response.status === 409).length;
      const exactlyOneAppliedAndOneConflicted = successCount === 1 && conflictCount === 1;
      const privateResponses = responses.every(({ response }) => response.headers.get('Cache-Control') === 'private, no-store');
      const racePass = exactlyOneAppliedAndOneConflicted && privateResponses;
      for (const [index, { response, body }] of responses.entries()) {
        checks.push(this.#check(index === winner ? 'winning proposal is applied' : 'competing proposal conflicts', index === winner ? 200 : 409, response, body));
      }
      checks.push({
        name: 'CAS race has exactly one applied proposal and one conflict', expected: 1,
        actual: exactlyOneAppliedAndOneConflicted && privateResponses ? 1 : 0,
        pass: exactlyOneAppliedAndOneConflicted && privateResponses,
      });
      if (!racePass || checks.slice(-(responses.length + 1)).some(({ pass }) => !pass)) return this.#returnCurrent(operation, checks);
      const winnerProposal = proposalIds[winner as 0 | 1];
      const winnerReceipt = responses[winner]?.body.data;
      const afterA = await readTrip('alpha reloads trip version 8', alpha, 8, { days: [winnerProposal] });
      if (!afterA.ok) return this.#returnCurrent(operation, checks);
      const afterB = await readTrip('beta reloads trip version 8', beta, 8, { days: [winnerProposal] });
      const sameItinerary = JSON.stringify(afterA.body.itinerary) === JSON.stringify(afterB.body.itinerary);
      if (!afterA.ok || !afterB.ok || !sameItinerary) return this.#returnCurrent(operation, checks);
      const retryResults = await Promise.all([alpha, beta].map((session) => this.#apiRequest('/probe/trip/trip-1/proposals/confirm', {
        method: 'POST', headers: { Authorization: `Bearer ${session.idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: winnerProposal, expectedVersion: 7, idempotencyKey: crypto.randomUUID() }),
      }, operation)));
      const receiptA = (retryResults[0]?.body?.data as Record<string, unknown> | undefined);
      const receiptB = (retryResults[1]?.body?.data as Record<string, unknown> | undefined);
      const receiptPass = retryResults.every(({ response, body }) => response.status === 200 &&
        response.headers.get('Cache-Control') === 'private, no-store' && body.ok === true && !!body.data && typeof body.data === 'object') &&
        JSON.stringify(receiptA) === JSON.stringify(receiptB) && JSON.stringify(receiptA) === JSON.stringify(winnerReceipt) &&
        receiptA?.proposalId === winnerProposal && receiptA.revision === 8;
      checks.push(this.#check('alpha retry returns a receipt', 200, retryResults[0]?.response, retryResults[0]?.body ?? {}));
      checks.push(this.#check('beta retry returns a receipt', 200, retryResults[1]?.response, retryResults[1]?.body ?? {}));
      checks.push({ name: 'both members receive the same winning receipt', expected: 1, actual: receiptPass ? 1 : 0, pass: receiptPass });
      return this.#returnCurrent(operation, checks);
    } finally { this.#finish(operation); }
  }

  async runCpuChecks(): Promise<CpuDispatchResult> {
    const operation = this.#begin();
    try {
      let alpha: Session;
      try { alpha = this.#requireVerified('alpha'); }
      catch (error) {
        if (error instanceof ProbeConsoleError && error.code === 'sign_in_required') throw failure('verified_alpha_required');
        throw error;
      }
      const fetcher: typeof fetch = async (input, init = {}) => {
        const response = await this.#request(input, { ...init, redirect: 'error' }, operation);
        if (response.headers.get('Cache-Control') !== 'private, no-store') throw failure('private_cache_header_missing');
        return response;
      };
      const result = await runCpuProbe({ endpoint: `${this.#origin}/probe/benchmark`, bearerToken: alpha.idToken,
        buildHash: this.#buildHash, fetcher, signal: operation.controller.signal });
      return this.#returnCurrent(operation, result);
    } finally { this.#finish(operation); }
  }

  #begin(): Operation {
    if (this.#operation) throw failure('operation_in_progress');
    const operation = { controller: new AbortController(), generation: this.#generation };
    this.#operation = operation;
    return operation;
  }

  #finish(operation: Operation): void { if (this.#operation === operation) this.#operation = undefined; }
  #assertCurrent(operation: Operation): void {
    if (operation.controller.signal.aborted || operation.generation !== this.#generation || this.#operation !== operation) {
      throw failure('signed_out');
    }
  }
  #returnCurrent<T>(operation: Operation, value: T): T { this.#assertCurrent(operation); return value; }
  #requireSession(slot: Slot): Session { const value = this.#sessions.get(slot); if (!value) throw failure('sign_in_required'); return value; }
  #requireVerified(slot: Slot): Session { const value = this.#requireSession(slot); if (!value.verified) throw failure('verified_sessions_required'); return value; }
  #requireVerifiedForChecks(slot: Slot): Session {
    try { return this.#requireVerified(slot); }
    catch (error) {
      if (error instanceof ProbeConsoleError && ['verified_sessions_required', 'sign_in_required'].includes(error.code)) {
        throw failure('two_verified_sessions_required');
      }
      throw error;
    }
  }

  async #request(input: RequestInfo | URL, init: RequestInit, operation: Operation): Promise<Response> {
    const signal = AbortSignal.any([operation.controller.signal, AbortSignal.timeout(TIMEOUT_MS)]);
    try {
      if (operation.controller.signal.aborted) throw failure('signed_out');
      const response = await this.#fetcher(input, { ...init, cache: 'no-store', credentials: 'omit', redirect: 'error', signal });
      if (operation.controller.signal.aborted) throw failure('signed_out');
      return response;
    } catch {
      if (operation.controller.signal.aborted) throw failure('signed_out');
      if (signal.aborted) throw failure('request_timeout');
      throw failure('request_failed');
    }
  }

  async #authPost(path: string, body: Record<string, unknown>, operation: Operation): Promise<Record<string, unknown>> {
    const response = await this.#request(`${AUTH_HOST}/${path}?key=${encodeURIComponent(this.#apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }, operation);
    let parsed: unknown;
    try { parsed = await response.json(); }
    catch { this.#assertCurrent(operation); throw failure('auth_response_invalid'); }
    this.#assertCurrent(operation);
    if (!response.ok || !parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw failure('auth_request_failed');
    return parsed as Record<string, unknown>;
  }

  async #apiRequest(path: string, init: RequestInit, operation: Operation): Promise<{ response: Response; body: Record<string, unknown> }> {
    const response = await this.#request(`${this.#origin}${path}`, init, operation);
    let body: Record<string, unknown> = {};
    try {
      const parsed: unknown = await response.json();
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) body = parsed as Record<string, unknown>;
    } catch { this.#assertCurrent(operation); /* malformed responses remain failed checks */ }
    this.#assertCurrent(operation);
    return { response, body };
  }

  #check(name: string, expected: number, response: Response | undefined, body: Record<string, unknown>, forcedPass?: boolean): ProbeCheck {
    const actual = response?.status ?? 0;
    const cacheControl = response?.headers.get('Cache-Control') ?? undefined;
    const validEnvelope = actual >= 400
      ? body.ok === false && !!body.error && typeof body.error === 'object'
      : body.ok === true && !!body.data && typeof body.data === 'object';
    const pass = (forcedPass ?? actual === expected) && cacheControl === 'private, no-store' && validEnvelope;
    return { name, expected, actual, pass, ...(cacheControl ? { cacheControl } : {}) };
  }
}
