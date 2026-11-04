import type { VerifiedIdentity } from '../src/shared/contracts/auth.js';
import type { KeyCacheState, ProbeD1 } from './auth-worker.js';

export const CPU_WORKLOAD_BYTES = 256 * 1024;
export type CpuPath = 'cold' | 'warm';

export interface PreparedWorkload { body: string; payloadBytes: number; workloadHash: string }
export interface CpuSample { path: CpuPath; cpuMs: number; terminated: boolean; index: number; requestId: string }
export interface CpuEvidence {
  source: 'cloudflare-platform' | 'local-wall-clock' | 'synthetic';
  environment: string;
  buildHash: string;
  workloadHash: string;
  payloadBytes: number;
  n: { cold: number; warm: number };
  samples: CpuSample[];
}
export interface CpuPathSummary { n: number; p50Ms: number; p95Ms: number; terminations: number }
export interface CpuEvaluation {
  status: 'pass' | 'fail' | 'simulated' | 'blocked';
  reason?: string;
  cold?: CpuPathSummary;
  warm?: CpuPathSummary;
}

export const CPU_REQUESTS_PER_PATH = 100;
export interface CpuDispatchRecord { requestedPath: CpuPath; keyCacheState: KeyCacheState; index: number; requestId: string }
export interface CpuDispatchResult {
  status: 'sent' | 'blocked';
  reason?: string;
  workloadHash: string;
  payloadBytes: number;
  buildHash: string;
  requested: { cold: number; warm: number };
  isolateColdState: 'not_observed';
  records: CpuDispatchRecord[];
  primer?: CpuDispatchRecord;
}

export interface CpuProbeRunnerOptions {
  endpoint: string;
  expectedEndpoint?: string;
  bearerToken: string;
  buildHash: string;
  fetcher?: typeof fetch;
  signal?: AbortSignal;
  coldConcurrency?: number;
  warmConcurrency?: number;
  requestTimeoutMs?: number;
  totalTimeoutMs?: number;
  onProgress?: (report: CpuDispatchResult) => void;
  captureGuard?: () => boolean;
}

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const BUILD_PATTERN = /^[a-f0-9]{40,64}$/;

export async function buildWorkloadPayload(tripId = 'probe-trip-1'): Promise<PreparedWorkload> {
  const fixed = `{"tripId":${JSON.stringify(tripId)},"padding":"`;
  const suffix = '"}';
  const paddingBytes = CPU_WORKLOAD_BYTES - new TextEncoder().encode(fixed + suffix).byteLength;
  if (paddingBytes < 0) throw new Error('trip id leaves no room for the bounded workload');
  const body = fixed + 'x'.repeat(paddingBytes) + suffix;
  const bytes = new TextEncoder().encode(body);
  if (bytes.byteLength !== CPU_WORKLOAD_BYTES) throw new Error('workload byte count mismatch');
  const digest = await crypto.subtle.digest('SHA-256', bytes.slice().buffer as ArrayBuffer);
  const workloadHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return { body, payloadBytes: bytes.byteLength, workloadHash };
}

/** Sends bounded requests and collects correlation IDs only; it never measures or fabricates CPU time. */
export async function runCpuProbe(options: CpuProbeRunnerOptions): Promise<CpuDispatchResult> {
  const payload = await buildWorkloadPayload();
  const records: CpuDispatchRecord[] = [];
  let primer: CpuDispatchRecord | undefined;
  const result = (status: CpuDispatchResult['status'], reason?: string): CpuDispatchResult => ({
    status, ...(reason ? { reason } : {}), workloadHash: payload.workloadHash, payloadBytes: payload.payloadBytes,
    buildHash: options.buildHash, requested: { cold: CPU_REQUESTS_PER_PATH, warm: CPU_REQUESTS_PER_PATH },
    isolateColdState: 'not_observed', records: [...records], ...(primer ? { primer } : {}),
  });
  const coldConcurrency = options.coldConcurrency ?? 1;
  const warmConcurrency = options.warmConcurrency ?? 1;
  const requestTimeoutMs = options.requestTimeoutMs ?? 30_000;
  const totalTimeoutMs = options.totalTimeoutMs ?? 600_000;
  let endpointValid = false;
  try { const url = new URL(options.endpoint); endpointValid = url.protocol === 'https:' && url.pathname === '/probe/benchmark' && !url.username && !url.password && !url.search && !url.hash; } catch { /* invalid URL */ }
  if (!endpointValid || (options.expectedEndpoint !== undefined && options.endpoint !== options.expectedEndpoint) || !Number.isSafeInteger(requestTimeoutMs) || requestTimeoutMs < 1 || requestTimeoutMs > 600_000 ||
      !Number.isSafeInteger(totalTimeoutMs) || totalTimeoutMs < 1 || totalTimeoutMs > 600_000 || !options.endpoint || !options.bearerToken || !BUILD_PATTERN.test(options.buildHash) ||
      !Number.isSafeInteger(coldConcurrency) || coldConcurrency < 1 || coldConcurrency > 16 ||
      !Number.isSafeInteger(warmConcurrency) || warmConcurrency < 1 || warmConcurrency > 16) {
    return result('blocked', 'invalid_runner_configuration');
  }
  if (options.signal?.aborted) return result('blocked', 'aborted');
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener('abort', abortFromCaller, { once: true });
  const fetcher = options.fetcher ?? fetch;
  const totalTimer = setTimeout(() => controller.abort(new Error('total_timeout')), totalTimeoutMs);
  let captureFailed = false;
  const checkCapture = () => {
    try { if (!options.captureGuard || options.captureGuard()) return; } catch { /* fail closed */ }
    captureFailed = true; controller.abort(new Error('capture_failed'));
  };
  checkCapture();
  const guardTimer = setInterval(checkCapture, 100);
  const requestIds = new Set<string>();
  let failure: string | undefined;
  const sendOne = async (path: CpuPath, index: number, measured: boolean, expectedState?: KeyCacheState): Promise<void> => {
    checkCapture();
    if (controller.signal.aborted) throw new Error('aborted');
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => { controller.abort(new Error('request_timeout')); reject(new Error('request_timeout')); }, requestTimeoutMs);
    });
    let rejectAbort: (reason: Error) => void = () => {};
    const onAbort = () => rejectAbort(new Error('aborted'));
    const aborted = new Promise<never>((_, reject) => {
      rejectAbort = reject;
      if (controller.signal.aborted) onAbort();
      else controller.signal.addEventListener('abort', onAbort, { once: true });
    });
    try {
    const response = await Promise.race([fetcher(options.endpoint, {
      method: 'POST',
      redirect: 'error',
      headers: {
        Authorization: `Bearer ${options.bearerToken}`,
        'Content-Type': 'application/json',
        'X-Probe-Path': path,
        'X-Probe-Workload-SHA256': payload.workloadHash,
      },
      body: payload.body,
      signal: controller.signal,
    }), timeout, aborted]);
    if (!response.ok) throw new Error(`http_${response.status}`);
    const body = await Promise.race([response.json(), timeout, aborted]) as { ok?: unknown; requestId?: unknown };
    const headerId = response.headers.get('X-Probe-Request-ID');
    const keyCacheState = response.headers.get('X-Probe-Key-Cache');
    if (body?.ok !== true || typeof body.requestId !== 'string' || body.requestId.length === 0 ||
        body.requestId !== headerId || requestIds.has(body.requestId) ||
        response.headers.get('X-Probe-Path') !== path ||
        (keyCacheState !== 'cold' && keyCacheState !== 'warm') ||
        (expectedState && keyCacheState !== expectedState)) throw new Error('invalid_or_duplicate_probe_evidence');
    requestIds.add(body.requestId);
    const record: CpuDispatchRecord = { requestedPath: path, keyCacheState, index, requestId: body.requestId };
    if (measured) records.push(record); else primer = record;
    options.onProgress?.(result('blocked', 'in_progress'));
    } finally { if (timer) clearTimeout(timer); controller.signal.removeEventListener('abort', onAbort); }
  };
  try {
    // Prime the shared verifier before counting warm samples; the prime itself is not evidence.
    try { await sendOne('warm', -1, false); }
    catch (error) {
      failure = error instanceof Error && error.message === 'invalid_or_duplicate_probe_evidence'
        ? error.message
        : controller.signal.aborted ? 'aborted' : error instanceof Error ? `request_failed:${error.message}` : 'request_failed';
      controller.abort(error);
    }
    for (const [path, concurrency] of (failure ? [] : [['cold', coldConcurrency], ['warm', warmConcurrency]] as const)) {
      let nextIndex = 0;
      const send = async () => {
        while (nextIndex < CPU_REQUESTS_PER_PATH && !failure && !controller.signal.aborted) {
          const index = nextIndex++;
          try {
            await sendOne(path, index, true, path);
          } catch (error) {
            failure = error instanceof Error && error.message === 'invalid_or_duplicate_probe_evidence'
              ? error.message
              : controller.signal.aborted ? 'aborted' : error instanceof Error ? `request_failed:${error.message}` : 'request_failed';
            controller.abort(error);
            return;
          }
        }
      };
      await Promise.all(Array.from({ length: Math.min(concurrency, CPU_REQUESTS_PER_PATH) }, send));
      if (failure || controller.signal.aborted) break;
    }
  } finally {
    clearTimeout(totalTimer);
    clearInterval(guardTimer);
    options.signal?.removeEventListener('abort', abortFromCaller);
  }
  if (failure || records.length !== CPU_REQUESTS_PER_PATH * 2 || requestIds.size !== records.length + 1) {
    return result('blocked', captureFailed ? 'capture_failed' : failure ?? 'incomplete_or_duplicate_request_set');
  }
  return result('sent');
}

function summarize(values: CpuSample[]): CpuPathSummary {
  const sorted = values.map((sample) => sample.cpuMs).sort((a, b) => a - b);
  const percentile = (p: number) => sorted[Math.ceil(p * sorted.length) - 1]!;
  return {
    n: sorted.length,
    p50Ms: percentile(0.5),
    p95Ms: percentile(0.95),
    terminations: values.filter((sample) => sample.terminated).length,
  };
}

function invalidEvidence(evidence: CpuEvidence, expectedWorkloadHash: string): boolean {
  if (!evidence || !['cloudflare-platform', 'local-wall-clock', 'synthetic'].includes(evidence.source) ||
      !['cloudflare-workers-free', 'node-local', 'synthetic-fixture'].includes(evidence.environment) ||
      (evidence.source === 'cloudflare-platform' && evidence.environment !== 'cloudflare-workers-free') ||
      (evidence.source === 'local-wall-clock' && evidence.environment !== 'node-local') ||
      (evidence.source === 'synthetic' && evidence.environment !== 'synthetic-fixture') ||
      !BUILD_PATTERN.test(evidence.buildHash) ||
      !HASH_PATTERN.test(evidence.workloadHash) || !HASH_PATTERN.test(expectedWorkloadHash) || evidence.workloadHash !== expectedWorkloadHash || evidence.payloadBytes !== CPU_WORKLOAD_BYTES ||
      !evidence.n || !Number.isSafeInteger(evidence.n.cold) || !Number.isSafeInteger(evidence.n.warm) || evidence.n.cold < 100 || evidence.n.warm < 100 ||
      !Array.isArray(evidence.samples)) return true;
  let cold = 0;
  let warm = 0;
  const indexes = { cold: new Set<number>(), warm: new Set<number>() };
  const requestIds = new Set<string>();
  for (const sample of evidence.samples) {
    if (!sample || !['cold', 'warm'].includes(sample.path) || typeof sample.cpuMs !== 'number' ||
        !Number.isFinite(sample.cpuMs) || sample.cpuMs < 0 || typeof sample.terminated !== 'boolean' ||
        !Number.isSafeInteger(sample.index) || sample.index < 0 || typeof sample.requestId !== 'string' ||
        sample.requestId.length === 0 || sample.requestId.length > 128 || requestIds.has(sample.requestId)) return true;
    requestIds.add(sample.requestId);
    const path = sample.path as CpuPath;
    if (indexes[path].has(sample.index)) return true;
    indexes[path].add(sample.index);
    if (path === 'cold') cold += 1;
    else warm += 1;
  }
  if (cold !== evidence.n.cold || warm !== evidence.n.warm) return true;
  return Object.entries(indexes).some(([path, pathIndexes]) => {
    const expectedCount = evidence.n[path as CpuPath];
    return pathIndexes.size !== expectedCount || [...pathIndexes].some((index) => index >= expectedCount);
  });
}

export function evaluateCpuEvidence(
  evidence: CpuEvidence,
  expectedWorkloadHash: string,
  provenance: 'unreviewed' | 'platform-export-reviewed' = 'unreviewed',
): CpuEvaluation {
  if (invalidEvidence(evidence, expectedWorkloadHash)) {
    return { status: 'blocked', reason: 'invalid_or_incomplete_evidence' };
  }
  if (evidence.source !== 'cloudflare-platform') {
    return { status: 'simulated', reason: 'local_cpu_is_not_workers_platform_cpu' };
  }
  if (provenance !== 'platform-export-reviewed') {
    return { status: 'blocked', reason: 'platform_provenance_not_independently_reviewed' };
  }
  const cold = summarize(evidence.samples.filter((sample) => sample.path === 'cold'));
  const warm = summarize(evidence.samples.filter((sample) => sample.path === 'warm'));
  const status = cold.p95Ms <= 7 && warm.p95Ms <= 7 && cold.terminations === 0 && warm.terminations === 0
    ? 'pass'
    : 'fail';
  return { status, cold, warm };
}

export interface BenchmarkWorkerDependencies {
  verifyIdentity: (token: string) => Promise<VerifiedIdentity>;
  verifyIdentityWithKeyCacheState?: (token: string) => Promise<{ identity: VerifiedIdentity; keyCacheState: KeyCacheState }>;
  db: ProbeD1;
}

async function readLimitedBody(request: Request): Promise<Uint8Array | null> {
  const contentLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(contentLength) && contentLength > CPU_WORKLOAD_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    size += next.value.byteLength;
    if (size > CPU_WORKLOAD_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(next.value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

function cpuApiError(code: string, status: number): Response {
  return Response.json({ ok: false, error: { code, messageKey: `api.${code.toLowerCase()}`, retryable: false }, requestId: crypto.randomUUID() }, {
    status, headers: { 'Cache-Control': 'private, no-store' },
  });
}

/** Local/remote probe endpoint: does the complete bounded work, but never reports CPU measurements. */
export function createBenchmarkWorker(dependencies: BenchmarkWorkerDependencies): { fetch(request: Request): Promise<Response> } {
  return {
    async fetch(request: Request): Promise<Response> {
      const privateHeaders = { 'Cache-Control': 'private, no-store' };
      if (request.method !== 'POST' || new URL(request.url).pathname !== '/probe/benchmark') return cpuApiError('VALIDATION_ERROR', 400);
      const bearer = request.headers.get('Authorization')?.match(/^Bearer ([^\s]+)$/)?.[1];
      if (!bearer) return cpuApiError('UNAUTHENTICATED', 401);
      let identity: VerifiedIdentity;
      let keyCacheState: KeyCacheState | 'unknown' = 'unknown';
      try {
        if (dependencies.verifyIdentityWithKeyCacheState) {
          const verified = await dependencies.verifyIdentityWithKeyCacheState(bearer);
          identity = verified.identity;
          keyCacheState = verified.keyCacheState;
        } else {
          identity = await dependencies.verifyIdentity(bearer);
        }
      }
      catch { return cpuApiError('UNAUTHENTICATED', 401); }
      const bytes = await readLimitedBody(request);
      if (!bytes) return cpuApiError('PAYLOAD_TOO_LARGE', 413);
      const advertisedHash = request.headers.get('X-Probe-Workload-SHA256');
      const actualHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes.slice().buffer as ArrayBuffer)),
        (byte) => byte.toString(16).padStart(2, '0')).join('');
      if (advertisedHash !== actualHash) return cpuApiError('VALIDATION_ERROR', 400);
      let parsed: unknown;
      try { parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
      catch { return cpuApiError('VALIDATION_ERROR', 400); }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
          Object.keys(parsed).length !== 2 || typeof (parsed as { tripId?: unknown }).tripId !== 'string' ||
          typeof (parsed as { padding?: unknown }).padding !== 'string') return cpuApiError('VALIDATION_ERROR', 400);
      const tripId = (parsed as { tripId: string }).tripId;
      const member = await dependencies.db.prepare('SELECT 1 AS member FROM trip_members WHERE trip_id = ? AND uid = ?')
        .bind(tripId, identity.uid).first();
      if (!member) return cpuApiError('FORBIDDEN', 403);
      // This D1 read is part of each measured invocation, after real JWT verification and JSON parsing.
      const row = await dependencies.db.prepare('SELECT version FROM trips WHERE id = ?').bind(tripId).first<{ version: number }>();
      if (!row) return cpuApiError('FORBIDDEN', 403);
      const path = request.headers.get('X-Probe-Path');
      if (path !== 'cold' && path !== 'warm') return cpuApiError('VALIDATION_ERROR', 400);
      const requestId = crypto.randomUUID();
      console.log(JSON.stringify({ probe: 'cpu-workload', requestId, path, workloadHash: actualHash, payloadBytes: bytes.byteLength }));
      return Response.json({ ok: true, data: { version: row.version }, requestId }, {
        headers: { ...privateHeaders, 'X-Probe-Path': path, 'X-Probe-Key-Cache': keyCacheState, 'X-Probe-Request-ID': requestId },
      });
    },
  };
}
