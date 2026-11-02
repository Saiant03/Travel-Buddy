import { importX509, jwtVerify, type JWTPayload } from 'jose';
import type { VerifiedIdentity } from '../src/shared/contracts/auth.js';

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const MAX_CERT_RESPONSE_BYTES = 128 * 1024;
const CERT_FETCH_TIMEOUT_MS = 2_000;
const UNKNOWN_KID_COOLDOWN_MS = 2_000;
const CLOCK_SKEW_SECONDS = 60;

export type AuthFailureCode = 'UNAUTHENTICATED' | 'FORBIDDEN' | 'KEYS_UNAVAILABLE';
export class AuthFailure extends Error {
  constructor(readonly code: AuthFailureCode) { super(code); }
}

export interface FirebaseVerifierOptions {
  projectId: string;
  allowedUids: readonly [string, string];
  fetchCertificates?: typeof fetch;
  certificatesUrl?: string;
  now?: () => number;
}

interface CertificateSet { keys: Record<string, string>; expiresAt: number }
export type KeyCacheState = 'cold' | 'warm';
export type FirebaseVerifier = ((token: string) => Promise<VerifiedIdentity>) & {
  verifyWithKeyCacheState(token: string): Promise<{ identity: VerifiedIdentity; keyCacheState: KeyCacheState }>;
};

function maxAgeMilliseconds(cacheControl: string | null): number {
  const match = cacheControl?.match(/(?:^|,)\s*max-age=(\d+)\s*(?:,|$)/i);
  if (!match) return 0;
  return Math.min(Number(match[1]) * 1000, 3_600_000);
}

async function readBounded(response: Response): Promise<string> {
  const declaredLength = Number(response.headers.get('Content-Length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CERT_RESPONSE_BYTES) throw new Error('certificate response too large');
  const reader = response.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    size += next.value.byteLength;
    if (size > MAX_CERT_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error('certificate response too large');
    }
    chunks.push(next.value);
  }
  const combined = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder('utf-8', { fatal: true }).decode(combined);
}

export function createFirebaseVerifier(options: FirebaseVerifierOptions): FirebaseVerifier {
  const projectId = options.projectId;
  if (!projectId || options.allowedUids.length !== 2 || !options.allowedUids[0] || !options.allowedUids[1] ||
      options.allowedUids[0] === options.allowedUids[1] || options.allowedUids.some((uid) => uid.length > 128)) {
    throw new Error('Firebase probe configuration must contain a project and exactly two distinct UIDs');
  }
  const allowed = new Set(options.allowedUids);
  const certFetch = options.fetchCertificates ?? fetch;
  const url = options.certificatesUrl ?? GOOGLE_CERTS_URL;
  const now = options.now ?? Date.now;
  let certSet: CertificateSet | undefined;
  let fetchInFlight: Promise<CertificateSet> | undefined;
  let unknownRefreshInFlight: Promise<CertificateSet | undefined> | undefined;
  let lastUnknownRefreshAt = Number.NEGATIVE_INFINITY;

  async function fetchCerts(): Promise<CertificateSet> {
    if (fetchInFlight) return fetchInFlight;
    fetchInFlight = (async () => {
      let response: Response;
      try {
        response = await certFetch(url, { signal: AbortSignal.timeout(CERT_FETCH_TIMEOUT_MS) });
      } catch {
        throw new AuthFailure('KEYS_UNAVAILABLE');
      }
      if (!response.ok) throw new AuthFailure('KEYS_UNAVAILABLE');
      let keys: unknown;
      try { keys = JSON.parse(await readBounded(response)); } catch { throw new AuthFailure('KEYS_UNAVAILABLE'); }
      if (!keys || typeof keys !== 'object' || Array.isArray(keys) || Object.keys(keys).length === 0) {
        throw new AuthFailure('KEYS_UNAVAILABLE');
      }
      const validEntries = Object.entries(keys).filter(([kid, cert]) =>
        kid.length > 0 && kid.length <= 256 && typeof cert === 'string' && cert.startsWith('-----BEGIN CERTIFICATE-----'),
      );
      if (validEntries.length === 0) throw new AuthFailure('KEYS_UNAVAILABLE');
      const cleanKeys = Object.fromEntries(validEntries);
      const expiresAt = now() + maxAgeMilliseconds(response.headers.get('Cache-Control'));
      certSet = { keys: cleanKeys, expiresAt };
      return certSet;
    })();
    try { return await fetchInFlight; }
    finally { fetchInFlight = undefined; }
  }

  async function currentCerts(): Promise<CertificateSet> {
    if (certSet && certSet.expiresAt > now()) return certSet;
    return fetchCerts();
  }

  async function refreshUnknownKid(): Promise<CertificateSet | undefined> {
    if (unknownRefreshInFlight) return unknownRefreshInFlight;
    if (now() - lastUnknownRefreshAt < UNKNOWN_KID_COOLDOWN_MS) return undefined;
    lastUnknownRefreshAt = now();
    unknownRefreshInFlight = fetchCerts().catch(() => undefined);
    try { return await unknownRefreshInFlight; }
    finally { unknownRefreshInFlight = undefined; }
  }

  const verifyWithKeyCacheState = async (token: string): Promise<{ identity: VerifiedIdentity; keyCacheState: KeyCacheState }> => {
    const keyCacheState: KeyCacheState = certSet && certSet.expiresAt > now() ? 'warm' : 'cold';
    if (typeof token !== 'string' || token.length === 0 || token.length > 16_384) throw new AuthFailure('UNAUTHENTICATED');
    const parts = token.split('.');
    if (parts.length !== 3) throw new AuthFailure('UNAUTHENTICATED');
    let protectedHeader: unknown;
    try { protectedHeader = JSON.parse(atob(parts[0]!.replace(/-/g, '+').replace(/_/g, '/'))); }
    catch { throw new AuthFailure('UNAUTHENTICATED'); }
    if (!protectedHeader || typeof protectedHeader !== 'object' ||
        (protectedHeader as { alg?: unknown }).alg !== 'RS256' ||
        typeof (protectedHeader as { kid?: unknown }).kid !== 'string') throw new AuthFailure('UNAUTHENTICATED');
    const kid = (protectedHeader as { kid: string }).kid;
    let certs = await currentCerts();
    if (!certs.keys[kid]) {
      const refreshed = await refreshUnknownKid();
      if (refreshed) certs = refreshed;
    }
    const cert = certs.keys[kid];
    if (!cert) throw new AuthFailure('UNAUTHENTICATED');

    let payload: JWTPayload;
    try {
      const publicKey = await importX509(cert, 'RS256');
      ({ payload } = await jwtVerify(token, publicKey, {
        algorithms: ['RS256'],
        audience: projectId,
        issuer: `https://securetoken.google.com/${projectId}`,
        currentDate: new Date(now()),
        clockTolerance: 0,
        requiredClaims: ['aud', 'iss', 'exp', 'iat', 'sub'],
      }));
    } catch {
      throw new AuthFailure('UNAUTHENTICATED');
    }
    const currentSeconds = Math.floor(now() / 1000);
    if (payload.aud !== projectId || typeof payload.iat !== 'number' || !Number.isSafeInteger(payload.iat) || payload.iat < 0 || payload.iat > currentSeconds + CLOCK_SKEW_SECONDS ||
        typeof payload.auth_time !== 'number' || !Number.isSafeInteger(payload.auth_time) || payload.auth_time < 0 || payload.auth_time > currentSeconds + CLOCK_SKEW_SECONDS ||
        typeof payload.sub !== 'string' || payload.sub.length === 0 || payload.sub.length > 128 ||
        payload.email_verified !== true) throw new AuthFailure('UNAUTHENTICATED');
    if (!allowed.has(payload.sub)) throw new AuthFailure('FORBIDDEN');
    return { identity: { uid: payload.sub, emailVerified: true }, keyCacheState };
  };
  const verify = async (token: string): Promise<VerifiedIdentity> => (await verifyWithKeyCacheState(token)).identity;
  return Object.assign(verify, { verifyWithKeyCacheState });
}

export interface ProbeD1 {
  prepare(sql: string): ProbeD1Statement;
}
export interface ProbeD1Statement {
  bind(...values: unknown[]): ProbeD1Statement;
  first<T = Record<string, unknown>>(columnName?: string): Promise<T | null>;
  run(): Promise<{ meta: { changes: number } }>;
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>;
}

export interface AuthWorkerDependencies {
  verifyIdentity: (token: string) => Promise<VerifiedIdentity>;
  db: ProbeD1;
}

function apiError(code: string, status: number): Response {
  const body = { ok: false, error: { code, messageKey: `api.${code.toLowerCase()}`, retryable: code === 'KEYS_UNAVAILABLE' }, requestId: crypto.randomUUID() };
  return Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

function privateJson(value: unknown): Response {
  return Response.json({ ok: true, data: value, requestId: crypto.randomUUID() }, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

export function createAuthWorker(dependencies: AuthWorkerDependencies): { fetch(request: Request): Promise<Response> } {
  return {
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      if (request.method !== 'GET') return apiError('VALIDATION_ERROR', 400);
      const match = url.pathname.match(/^\/probe\/(profile|trip)\/([^/]+)$/);
      if (!match) return apiError('VALIDATION_ERROR', 400);
      const authorization = request.headers.get('Authorization');
      const tokenMatch = authorization?.match(/^Bearer ([^\s]+)$/);
      if (!tokenMatch) return apiError('UNAUTHENTICATED', 401);
      let identity: VerifiedIdentity;
      try { identity = await dependencies.verifyIdentity(tokenMatch[1]!); }
      catch (error) {
        const code = error instanceof AuthFailure ? error.code : 'UNAUTHENTICATED';
        return apiError(code, code === 'FORBIDDEN' ? 403 : code === 'KEYS_UNAVAILABLE' ? 503 : 401);
      }
      const [, resource, id] = match;
      if (resource === 'profile') {
        if (id !== identity.uid) return apiError('FORBIDDEN', 403);
        const row = await dependencies.db.prepare('SELECT profile_json FROM profiles WHERE uid = ?').bind(id).first<{ profile_json: string }>();
        if (!row) return apiError('FORBIDDEN', 403);
        try { return privateJson(JSON.parse(row.profile_json)); }
        catch { return apiError('INTERNAL_ERROR', 500); }
      }
      const member = await dependencies.db.prepare('SELECT 1 AS member FROM trip_members WHERE trip_id = ? AND uid = ?').bind(id, identity.uid).first();
      if (!member) return apiError('FORBIDDEN', 403);
      const trip = await dependencies.db.prepare('SELECT id, version, itinerary_json FROM trips WHERE id = ?').bind(id).first<{ id: string; version: number; itinerary_json: string }>();
      if (!trip) return apiError('FORBIDDEN', 403);
      try { return privateJson({ id: trip.id, version: trip.version, itinerary: JSON.parse(trip.itinerary_json) }); }
      catch { return apiError('INTERNAL_ERROR', 500); }
    },
  };
}
