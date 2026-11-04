import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';

const hash = 'e72a2f1d6b21af68ca1860b9dc6528005721f236ead66eaf0cbd9ebdfdab62d9';
const buildHash = 'a'.repeat(40);
const make = () => {
  const primer = { requestId: 'primer', requestedPath: 'warm', keyCacheState: 'cold', index: -1 };
  const records = ['cold', 'warm'].flatMap((requestedPath) => Array.from({ length: 100 }, (_, index) => ({ requestId: `${requestedPath}-${index}`, requestedPath, keyCacheState: requestedPath, index })));
  const events = [primer, ...records].map((r) => ({ request: { method: 'POST', path: '/probe/benchmark' }, scriptVersionId: 'version-1', cpuTime: 6, outcome: 'ok', truncated: false, exceptionCount: 0, cpuWorkload: { requestId: r.requestId, path: r.requestedPath, workloadHash: hash, payloadBytes: 262144 } })).reverse();
  return { report: { status: 'sent', primer, records, workloadHash: hash, payloadBytes: 262144, buildHash, requested: { cold: 100, warm: 100 } }, events, summary: { status: 'MATCHED_REPORT_IDS', parseErrors: 0, tailError: false, reconnectObserved: false, telemetryObserved: true, telemetryScriptVersionId: 'version-1', tailInfo: { overload: 0, overloadStop: 0 } }, manifest: { buildHash, scriptVersionId: 'version-1', workloadHash: hash, payloadBytes: 262144 } };
};
test('reordered events join by explicit primer and IDs, and incomplete or damaged sets never yield percentiles', async () => {
  assert.ok(existsSync(new URL('./cpu-correlate.mjs', import.meta.url)), 'strict correlator exists');
  const { correlateCpuCapture } = await import('./cpu-correlate.mjs');
  const good = make();
  const result = correlateCpuCapture(good);
  assert.equal(result.status, 'review_required');
  assert.equal(result.cold.p95Ms, 6);
  for (const mutate of [
    (x) => { delete x.report.primer; },
    (x) => { x.events.pop(); },
    (x) => { x.events.push(x.events[0]); },
    (x) => { x.events.push({ ...x.events[0], cpuWorkload: { ...x.events[0].cpuWorkload, requestId: 'extra' } }); },
    (x) => { x.events[0].scriptVersionId = 'other'; },
    (x) => { x.events[0].cpuTime = null; },
    (x) => { x.events[0].outcome = 'exceededCpu'; },
    (x) => { x.events[0].truncated = true; },
    (x) => { x.events[0].exceptionCount = 1; },
    (x) => { x.summary.parseErrors = 1; },
    (x) => { x.summary.telemetryObserved = false; },
    (x) => { x.summary.telemetryScriptVersionId = 'different'; },
    (x) => { x.summary.tailInfo.overload = 1; },
    (x) => { x.report.records[0].keyCacheState = 'warm'; },
    (x) => { x.report.records[0].index = 100; },
    (x) => { x.manifest.buildHash = 'b'.repeat(40); },
    (x) => { x.manifest.scriptVersionId = x.manifest.buildHash; },
  ]) {
    const damaged = make(); mutate(damaged);
    const blocked = correlateCpuCapture(damaged);
    assert.equal(blocked.status, 'blocked');
    assert.equal(blocked.cold, undefined);
  }
});
