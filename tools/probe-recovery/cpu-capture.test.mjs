import assert from 'node:assert/strict';
import test from 'node:test';
import { JsonStreamParser, createCaptureAccumulator } from './cpu-capture.mjs';

const hash = 'e72a2f1d6b21af68ca1860b9dc6528005721f236ead66eaf0cbd9ebdfdab62d9';

function trace({ method = 'POST', url = 'https://worker.test/probe/benchmark?token=private', log = {}, cpuTime = 2, outcome = 'ok', truncated = false, exceptions = [] } = {}) {
  return {
    eventTimestamp: 1793600938145,
    event: { request: { method, url, headers: { authorization: 'Bearer private' } } },
    scriptVersion: { id: 'build-123' },
    cpuTime,
    wallTime: 7,
    outcome,
    truncated,
    exceptions,
    logs: Object.keys(log).length ? [{ message: JSON.stringify(log) }] : [],
  };
}

test('JSON stream parser handles pretty chunks and discards status strings', () => {
  const parser = new JsonStreamParser();
  const parsed = [
    ...parser.push('"Connected to worker with token=private"\n{\n  "one":'),
    ...parser.push(' 1\n}\n{"two":2}'),
    ...parser.finish(),
  ];
  assert.deepEqual(parsed, [{ one: 1 }, { two: 2 }]);
  assert.equal(JSON.stringify(parsed).includes('private'), false);
});

test('capture stores only allowlisted request, trace, and CPU workload fields', () => {
  const capture = createCaptureAccumulator({ expectedWorkloadHash: hash, expectedPayloadBytes: 262144 });
  const record = capture.consume(trace({
    log: { probe: 'cpu-workload', requestId: 'request-1', path: 'cold', workloadHash: hash, payloadBytes: 262144, email: 'private@example.test' },
  }));
  assert.equal(record.request.method, 'POST');
  assert.equal(record.request.path, '/probe/benchmark');
  assert.equal(record.request.query, undefined);
  assert.deepEqual(record.cpuWorkload, { requestId: 'request-1', path: 'cold', workloadHash: hash, payloadBytes: 262144 });
  assert.equal(JSON.stringify(record).includes('private'), false);
  assert.equal(record.cpuTime, 2);
  assert.equal(record.scriptVersionId, 'build-123');
});

test('capture reads Wrangler logs whose message field is an array', () => {
  const capture = createCaptureAccumulator({ expectedWorkloadHash: hash, expectedPayloadBytes: 262144 });
  const t = trace({ log: {} });
  t.logs = [{ message: [JSON.stringify({ probe: 'cpu-workload', requestId: 'request-array', path: 'cold', workloadHash: hash, payloadBytes: 262144 }), 'private@example.test'] }];
  const record = capture.consume(t);
  assert.equal(record.cpuWorkload.requestId, 'request-array');
  assert.equal(JSON.stringify(record).includes('private'), false);
});

test('public config diagnostic records telemetry presence without retaining the event', () => {
  const capture = createCaptureAccumulator({ expectedWorkloadHash: hash, expectedPayloadBytes: 262144 });
  assert.equal(capture.consume(trace({ method: 'GET', url: 'https://worker.test/probe/public-config?private=x' })), null);
  assert.equal(capture.summary().telemetryObserved, true);
  assert.equal(capture.summary().benchmarkEvents, 0);
  const noMetrics = createCaptureAccumulator({ expectedWorkloadHash: hash, expectedPayloadBytes: 262144 });
  noMetrics.consume(trace({ method: 'GET', url: 'https://worker.test/probe/public-config', cpuTime: -1 }));
  assert.equal(noMetrics.summary().telemetryObserved, false);
  const noOutcome = createCaptureAccumulator({ expectedWorkloadHash: hash, expectedPayloadBytes: 262144 });
  const missingOutcome = trace({ method: 'GET', url: 'https://worker.test/probe/public-config' });
  missingOutcome.outcome = null;
  noOutcome.consume(missingOutcome);
  assert.equal(noOutcome.summary().telemetryObserved, false);
});

test('out-of-order warm sample is measured and does not count as the primer', () => {
  const capture = createCaptureAccumulator({ expectedWorkloadHash: hash, expectedPayloadBytes: 262144 });
  const item = (id, path) => trace({ log: { probe: 'cpu-workload', requestId: id, path, workloadHash: hash, payloadBytes: 262144 } });
  capture.consume(item('cold-first', 'cold'));
  const warm = capture.consume(item('warm-late', 'warm'));
  assert.equal(warm.primer, false);
  assert.equal(capture.summary().primerOrderValid, false);
  assert.deepEqual(capture.summary().measuredEvents, { cold: 1, warm: 1 });
});

test('capture caps at 201 events and counts errors, truncation, and missing CPU metrics', () => {
  const capture = createCaptureAccumulator({ expectedWorkloadHash: hash, expectedPayloadBytes: 262144 });
  const item = (id, path, extra = {}) => trace({ log: { probe: 'cpu-workload', requestId: id, path, workloadHash: hash, payloadBytes: 262144 }, ...extra });
  capture.consume(item('warm-primer', 'warm', { outcome: 'exception', truncated: true, exceptions: [{}], cpuTime: -1 }));
  for (let i = 0; i < 100; i += 1) capture.consume(item(`cold-${i}`, 'cold', i === 0 ? { cpuTime: Number.POSITIVE_INFINITY } : {}));
  for (let i = 0; i < 100; i += 1) capture.consume(item(`warm-${i}`, 'warm'));
  assert.equal(capture.consume(item('extra', 'warm')), null);
  const summary = capture.summary();
  assert.equal(summary.benchmarkEvents, 201);
  assert.deepEqual(summary.measuredEvents, { cold: 100, warm: 100 });
  assert.equal(summary.outcomeErrors, 1);
  assert.equal(summary.truncatedEvents, 1);
  assert.equal(summary.exceptionCount, 1);
  assert.equal(summary.missingCpuEvents, 2);
  assert.equal(summary.reviewStatus, 'NOT_EVALUATED');
});

test('summary counts the warm primer, measured samples, duplicates, and invalid values', () => {
  const capture = createCaptureAccumulator({ expectedWorkloadHash: hash, expectedPayloadBytes: 262144 });
  const item = (id, path, overrides = {}) => trace({
    log: { probe: 'cpu-workload', requestId: id, path, workloadHash: hash, payloadBytes: 262144, ...overrides },
  });
  capture.consume(item('primer', 'warm'));
  capture.consume(item('cold-1', 'cold'));
  capture.consume(item('warm-1', 'warm'));
  capture.consume(item('cold-1', 'cold'));
  capture.consume(trace({ log: { probe: 'cpu-workload', requestId: 'bad', path: 'cold', workloadHash: 'wrong', payloadBytes: 1 }, cpuTime: null }));
  const summary = capture.summary();
  assert.equal(summary.primerWarmObserved, true);
  assert.deepEqual(summary.measuredEvents, { cold: 3, warm: 1 });
  assert.equal(summary.duplicateRequestIds, 1);
  assert.equal(summary.invalidWorkloadEvents, 1);
  assert.equal(summary.missingCpuEvents, 1);
  assert.equal(summary.reviewStatus, 'NOT_EVALUATED');
});
