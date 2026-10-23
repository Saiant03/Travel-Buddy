import { describe, expect, it } from 'vitest';
import { buildWorkloadPayload, createBenchmarkWorker, evaluateCpuEvidence, runCpuProbe, type CpuEvidence } from '../../probes/cpu-runner.js';
import { createSqliteD1 } from './helpers/sqlite-d1.js';
import { createFirebaseFixture } from './helpers/probe-fixtures.js';
import { createFirebaseVerifier } from '../../probes/auth-worker.js';

const samples = (path: 'cold' | 'warm', cpuMs = 6): CpuEvidence['samples'] =>
  Array.from({ length: 100 }, (_, index) => ({ path, cpuMs, terminated: false, index, requestId: `${path}-${index}` }));

async function evidence(overrides: Partial<CpuEvidence> = {}): Promise<CpuEvidence> {
  const payload = await buildWorkloadPayload();
  return {
    source: 'cloudflare-platform',
    environment: 'cloudflare-workers-free',
    buildHash: 'a'.repeat(40),
    workloadHash: payload.workloadHash,
    payloadBytes: payload.payloadBytes,
    n: { cold: 100, warm: 100 },
    samples: [...samples('cold'), ...samples('warm')],
    ...overrides,
  };
}

describe('Cloudflare CPU gate evaluator', () => {
  it('prepares the canonical bounded 256 KiB workload and stable hash', async () => {
    const first = await buildWorkloadPayload();
    expect(first.payloadBytes).toBe(256 * 1024);
    expect((await buildWorkloadPayload()).workloadHash).toBe(first.workloadHash);
  });

  it('marks local execution simulated even when its wall-clock numbers look fast', async () => {
    const payload = await buildWorkloadPayload();
    const report = evaluateCpuEvidence({
      source: 'local-wall-clock', environment: 'node-local', buildHash: 'a'.repeat(40),
      workloadHash: payload.workloadHash, payloadBytes: payload.payloadBytes, n: { cold: 100, warm: 100 },
      samples: [...samples('cold', 1), ...samples('warm', 1)],
    }, payload.workloadHash);
    expect(report.status).toBe('simulated');
  });

  it('requires independent provenance review before evaluating platform-labelled evidence', async () => {
    const workload = await buildWorkloadPayload();
    expect(evaluateCpuEvidence(await evidence(), workload.workloadHash)).toMatchObject({
      status: 'blocked', reason: 'platform_provenance_not_independently_reviewed',
    });
    const report = evaluateCpuEvidence(await evidence(), workload.workloadHash, 'platform-export-reviewed');
    expect(report).toMatchObject({ status: 'pass', cold: { p95Ms: 6 }, warm: { p95Ms: 6 } });
  });

  it.each([
    ['NaN CPU', { samples: [...samples('cold'), ...samples('warm')].map((sample, i) => i === 0 ? { ...sample, cpuMs: Number.NaN } : sample) }],
    ['negative CPU', { samples: [...samples('cold'), ...samples('warm')].map((sample, i) => i === 0 ? { ...sample, cpuMs: -1 } : sample) }],
    ['missing workload hash', { workloadHash: '' }],
    ['unknown environment', { environment: '' }],
    ['only 99 cold samples', { n: { cold: 99, warm: 100 }, samples: [...samples('cold').slice(1), ...samples('warm')] }],
  ])('blocks evidence with %s', async (_label, overrides) => {
    expect(evaluateCpuEvidence(await evidence(overrides), (await buildWorkloadPayload()).workloadHash).status).toBe('blocked');
  });

  it('blocks repeated sample indexes or request IDs within a path', async () => {
    const payload = await buildWorkloadPayload();
    const duplicateIndex = [...samples('cold'), ...samples('warm')].map((sample, i) =>
      i === 1 ? { ...sample, index: 0 } : sample);
    const duplicateRequest = [...samples('cold'), ...samples('warm')].map((sample, i) =>
      i === 1 ? { ...sample, requestId: 'cold-0' } : sample);
    expect(evaluateCpuEvidence(await evidence({ samples: duplicateIndex }), payload.workloadHash).status).toBe('blocked');
    expect(evaluateCpuEvidence(await evidence({ samples: duplicateRequest }), payload.workloadHash).status).toBe('blocked');
  });

  it('fails the platform gate for CPU over 7 ms or any platform termination', async () => {
    const workload = await buildWorkloadPayload();
    const highP95 = evaluateCpuEvidence(await evidence({ samples: [...samples('cold', 8), ...samples('warm', 6)] }), workload.workloadHash, 'platform-export-reviewed');
    expect(highP95.status).toBe('fail');
    const terminated = evaluateCpuEvidence(await evidence({
      samples: [...samples('cold').map((sample, index) => index === 0 ? { ...sample, terminated: true } : sample), ...samples('warm')],
    }), workload.workloadHash, 'platform-export-reviewed');
    expect(terminated.status).toBe('fail');
  });

  it('executes RSA auth, strict 256 KiB JSON parsing, membership, and a real SQLite D1 query per request', async () => {
    const certFixture = createFirebaseFixture();
    try {
      const db = createSqliteD1();
      db.exec(`INSERT INTO users (uid, enabled) VALUES ('uid-alpha', 1);
        INSERT INTO trips (id, version, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES ('probe-trip-1', 7, '{}', 'fp', 'nonce');
        INSERT INTO trip_members (trip_id, uid) VALUES ('probe-trip-1', 'uid-alpha');`);
      const token = await certFixture.token();
      const worker = createBenchmarkWorker({
        verifyIdentity: createFirebaseVerifier({
          projectId: 'probe-project', allowedUids: ['uid-alpha', 'uid-beta'],
          fetchCertificates: async () => new Response(JSON.stringify({ [certFixture.kid]: certFixture.publicCertificate }), {
            headers: { 'Cache-Control': 'public, max-age=3600' },
          }),
        }),
        db,
      });
      const payload = await buildWorkloadPayload();
      const response = await worker.fetch(new Request('https://probe.test/probe/benchmark', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Probe-Workload-SHA256': payload.workloadHash,
          'X-Probe-Path': 'cold',
        },
        body: payload.body,
      }));
      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('private, no-store');
      expect(await response.json()).toMatchObject({ ok: true, data: { version: 7 } });
      const oversizedBody = payload.body + ' ';
      const tooLarge = await worker.fetch(new Request('https://probe.test/probe/benchmark', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'X-Probe-Workload-SHA256': payload.workloadHash, 'X-Probe-Path': 'cold' },
        body: oversizedBody,
      }));
      expect(tooLarge.status).toBe(413);
    } finally {
      certFixture.cleanup();
    }
  });
});

describe('bounded CPU probe dispatcher', () => {
  it('sends 100 requests marked per path and returns unique request IDs without CPU claims', async () => {
    let sequence = 0;
    let coldInFlight = 0;
    let maxColdInFlight = 0;
    let warmCacheValid = false;
    const dispatched = await runCpuProbe({
      endpoint: 'https://approved-probe.invalid/probe/benchmark',
      bearerToken: 'synthetic-test-token',
      buildHash: 'b'.repeat(40),
      coldConcurrency: 4,
      fetcher: async (_input, init) => {
        const headers = new Headers(init?.headers);
        const path = headers.get('X-Probe-Path')! as 'cold' | 'warm';
        const keyCacheState = path === 'cold' ? 'cold' : warmCacheValid ? 'warm' : 'cold';
        if (path === 'warm') warmCacheValid = true;
        if (path === 'cold') {
          coldInFlight += 1;
          maxColdInFlight = Math.max(maxColdInFlight, coldInFlight);
        }
        const id = `request-${sequence++}`;
        await Promise.resolve();
        if (path === 'cold') coldInFlight -= 1;
        return Response.json({ ok: true, requestId: id }, {
          headers: { 'X-Probe-Request-ID': id, 'X-Probe-Path': path, 'X-Probe-Key-Cache': keyCacheState },
        });
      },
    });
    expect(dispatched.status).toBe('sent');
    expect(dispatched.requested).toEqual({ cold: 100, warm: 100 });
    expect(dispatched.records).toHaveLength(200);
    expect(new Set(dispatched.records.map((record) => record.requestId)).size).toBe(200);
    expect(dispatched.records.filter((record) => record.requestedPath === 'cold')).toHaveLength(100);
    expect(dispatched.records.filter((record) => record.requestedPath === 'warm')).toHaveLength(100);
    expect(dispatched.records.every((record) => record.keyCacheState === record.requestedPath)).toBe(true);
    expect(dispatched.isolateColdState).toBe('not_observed');
    expect(maxColdInFlight).toBeLessThanOrEqual(4);
    expect(dispatched.records[0]).not.toHaveProperty('cpuMs');
  });

  it('stops dispatch after an HTTP failure and rejects duplicate response IDs', async () => {
    let calls = 0;
    const failed = await runCpuProbe({
      endpoint: 'https://approved-probe.invalid/probe/benchmark', bearerToken: 'test', buildHash: 'c'.repeat(40),
      coldConcurrency: 1, fetcher: async () => {
        calls += 1;
        return calls === 1 ? new Response('{}', { status: 503 }) : Response.json({ ok: true, requestId: 'dup' }, {
          headers: { 'X-Probe-Request-ID': 'dup', 'X-Probe-Path': 'cold' },
        });
      },
    });
    expect(failed).toMatchObject({ status: 'blocked', reason: 'request_failed:http_503' });
    expect(calls).toBe(1);

    const duplicate = await runCpuProbe({
      endpoint: 'https://approved-probe.invalid/probe/benchmark', bearerToken: 'test', buildHash: 'c'.repeat(40),
      coldConcurrency: 1, fetcher: async (_input, init) => {
        const path = new Headers(init?.headers).get('X-Probe-Path')!;
        return Response.json({ ok: true, requestId: 'same-id' }, {
          headers: { 'X-Probe-Request-ID': 'same-id', 'X-Probe-Path': path, 'X-Probe-Key-Cache': path },
        });
      },
    });
    expect(duplicate).toMatchObject({ status: 'blocked', reason: 'invalid_or_duplicate_probe_evidence' });
  });
});
