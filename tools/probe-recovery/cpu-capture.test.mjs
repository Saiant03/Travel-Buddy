import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { closeSync, mkdtempSync, openSync, readFileSync, readdirSync, statSync, writeFileSync, chmodSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
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

test('JSON stream parser skips ANSI and CLI noise across split escape and JSON chunks', () => {
  const value = { event: { request: { method: 'POST', url: 'https://test/probe/benchmark' } }, cpuTime: 5, message: 'legitimate { text } with \\"quotes\\"' };
  const stream = `\u001b[?25l${JSON.stringify(value, null, 2)}\n\u001b[32mConnected\u001b[0m\n`;
  for (const size of [1, 7, 200, 4096]) {
    const parser = new JsonStreamParser();
    const parsed = [];
    for (let offset = 0; offset < stream.length; offset += size) parsed.push(...parser.push(stream.slice(offset, offset + size)));
    parsed.push(...parser.finish());
    assert.deepEqual(parsed, [value], `chunk size ${size}`);
    assert.deepEqual(parser.summary(), { parseErrors: 0, parsedObjects: 1 });
  }
});

test('JSON stream parser discards complete quoted status strings before the next event', () => {
  const status = 'CLI status with unmatched [ and { characters plus escaped quote: \\"still text';
  const invocation = { event: { request: { method: 'POST', url: 'https://synthetic.test/probe/benchmark' } }, cpuTime: 5 };
  const stream = `${JSON.stringify(status)}\n${JSON.stringify(invocation)}\n`;
  for (const size of [1, 7]) {
    const parser = new JsonStreamParser();
    const parsed = [];
    for (let offset = 0; offset < stream.length; offset += size) parsed.push(...parser.push(stream.slice(offset, offset + size)));
    parsed.push(...parser.finish());
    assert.deepEqual(parsed, [invocation], `chunk size ${size}`);
    assert.deepEqual(parser.summary(), { parseErrors: 0, parsedObjects: 1 });
  }
});

test('synthetic Wrangler replay captures primer, cold, and warm events despite ANSI and status noise', () => {
  const traces = [];
  const add = (requestId, path) => traces.push(trace({
    log: { probe: 'cpu-workload', requestId, path, workloadHash: 'a'.repeat(64), payloadBytes: 262144 },
  }));
  add('synthetic-primer', 'warm');
  for (let i = 0; i < 100; i += 1) add(`synthetic-cold-${i}`, 'cold');
  for (let i = 0; i < 100; i += 1) add(`synthetic-warm-${i}`, 'warm');
  const stream = traces.map((item, i) => `${i % 2 ? '\u001b[?25l' : '\u001b[32m'}${JSON.stringify(item, null, i % 3 ? 0 : 2)}\n${i % 2 ? '\u001b[0m' : '"HEAD /probe HTTP/1.1 200 OK"\n'}`).join('');
  for (const size of [1, 7, 200, 4096]) {
    const parser = new JsonStreamParser();
    const replay = [];
    for (let offset = 0; offset < stream.length; offset += size) replay.push(...parser.push(stream.slice(offset, offset + size)));
    replay.push(...parser.finish());
    const result = createCaptureAccumulator({ expectedWorkloadHash: 'a'.repeat(64), expectedPayloadBytes: 262144 });
    const captured = replay.map((item) => result.consume(item)).filter(Boolean);
    const summary = result.summary();
    assert.equal(replay.length, 201, `parsed with chunk size ${size}`);
    assert.equal(captured.length, 201, `captured with chunk size ${size}`);
    assert.equal(summary.invalidWorkloadEvents, 0);
    assert.equal(summary.benchmarkEvents, 201);
    assert.deepEqual(summary.measuredEvents, { cold: 100, warm: 100 });
    assert.equal(summary.primerOrderValid, true);
    assert.deepEqual(captured[0].cpuWorkload, { requestId: 'synthetic-primer', path: 'warm', workloadHash: 'a'.repeat(64), payloadBytes: 262144 });
    assert.deepEqual(parser.summary(), { parseErrors: 0, parsedObjects: 201 });
  }
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

test('CLI captures 201 Wrangler child events privately and stops gracefully on SIGINT', async () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'cpu-capture-integration-'));
  const fakeExecutable = path.join(root, 'fake-wrangler');
  const fixture = path.join(root, 'events.jsonl');
  const stdoutPath = path.join(root, 'capture-stdout.txt');
  const stopped = path.join(root, 'stopped');
  const outputRoot = path.join(root, 'captures');
  const cli = fileURLToPath(new URL('./cpu-capture.mjs', import.meta.url));
  const rows = [['primer', 'warm'], ...Array.from({ length: 100 }, (_, i) => [`cold-${i}`, 'cold']), ...Array.from({ length: 100 }, (_, i) => [`warm-${i}`, 'warm'])];
  const events = rows.map(([requestId, samplePath]) => ({
    eventTimestamp: 1793600938145,
    event: { request: { method: 'POST', url: 'https://worker.test/probe/benchmark?token=cpu-private-marker', headers: { authorization: 'Bearer cpu-private-marker' } } },
    scriptVersion: { id: 'build-123' }, cpuTime: 2, wallTime: 7, outcome: 'ok', truncated: false, exceptions: [],
    logs: [{ message: [JSON.stringify({ probe: 'cpu-workload', requestId, path: samplePath, workloadHash: hash, payloadBytes: 262144, ignored: 'cpu-private-marker' })] }],
  }));
  writeFileSync(fixture, `${events.map(JSON.stringify).join('\n')}\n`);
  writeFileSync(fakeExecutable, `#!/bin/sh\ntrap 'printf stopped > ${JSON.stringify(stopped)}; exit 0' INT\nprintf '\\033[32mConnected to fake tail\\033[0m\\n'\ncat ${JSON.stringify(fixture)}\nwhile :; do sleep 1; done\n`);
  chmodSync(fakeExecutable, 0o700);
  writeFileSync(stdoutPath, '');
  const stdoutFd = openSync(stdoutPath, 'w');
  const capture = spawn(process.execPath, [cli, '--wrangler-path', fakeExecutable, '--output-root', outputRoot, '--config-home', path.join(root, 'config'), '--cache-home', path.join(root, 'cache'), '--tmp-dir', path.join(root, 'tmp')], { stdio: ['ignore', stdoutFd, 'ignore'] });
  const timeout = setTimeout(() => capture.kill('SIGTERM'), 10_000);
  const exitCode = await new Promise((resolve, reject) => {
    capture.once('error', reject);
    capture.once('close', (code) => resolve(code));
  });
  clearTimeout(timeout);
  closeSync(stdoutFd);
  assert.equal(exitCode, 0);
  const stdout = readFileSync(stdoutPath, 'utf8');
  assert.ok(stdout.trim(), 'capture CLI should emit its final JSON summary');
  const result = JSON.parse(stdout.trim());
  assert.equal(result.status, 'CAPTURED_201_EVENTS');
  assert.equal(result.benchmarkEvents, 201);
  assert.equal(readFileSync(stopped, 'utf8'), 'stopped');
  const dir = result.outputDirectory;
  assert.equal(statSync(dir).mode & 0o777, 0o700);
  const eventsPath = path.join(dir, 'sanitized-events.jsonl');
  assert.equal(statSync(eventsPath).mode & 0o777, 0o600);
  assert.equal(statSync(path.join(dir, 'summary.json')).mode & 0o777, 0o600);
  const lines = readFileSync(eventsPath, 'utf8').trim().split('\n');
  assert.equal(lines.length, 201);
  const records = lines.map(JSON.parse);
  assert.equal(records[0].primer, true);
  assert.deepEqual(records.reduce((acc, record) => { if (!record.primer) acc[record.cpuWorkload.path] += 1; return acc; }, { cold: 0, warm: 0 }), { cold: 100, warm: 100 });
  const summary = JSON.parse(readFileSync(path.join(dir, 'summary.json'), 'utf8'));
  assert.equal(summary.parsedObjects, 201);
  assert.equal(summary.parseErrors, 0);
  assert.equal(summary.benchmarkEvents, 201);
  assert.deepEqual(summary.measuredEvents, { cold: 100, warm: 100 });
  assert.equal(summary.reviewStatus, 'NOT_EVALUATED');
  const persisted = readFileSync(eventsPath, 'utf8') + readFileSync(path.join(dir, 'summary.json'), 'utf8') + stdout;
  assert.equal(persisted.includes('cpu-private-marker'), false);
  assert.deepEqual(readdirSync(dir).sort(), ['sanitized-events.jsonl', 'summary.json']);
});

test('a partial trailing JSON event is counted as a parse error and never evaluates a capture', () => {
  const parser = new JsonStreamParser();
  assert.deepEqual(parser.push('{"complete":true}\n{"partial":'), [{ complete: true }]);
  assert.deepEqual(parser.finish(), []);
  assert.deepEqual(parser.summary(), { parseErrors: 1, parsedObjects: 1 });
});

test('tail failure and partial child output remain incomplete and unevaluated', async () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'cpu-capture-failure-'));
  const fakeExecutable = path.join(root, 'fake-wrangler');
  const outputRoot = path.join(root, 'captures');
  const cli = fileURLToPath(new URL('./cpu-capture.mjs', import.meta.url));
  writeFileSync(fakeExecutable, '#!/bin/sh\nprintf \'{"event":\'\nprintf \'ERROR tail disconnected\\n\' >&2\nexit 1\n');
  chmodSync(fakeExecutable, 0o700);
  const stdoutPath = path.join(root, 'capture-stdout.txt');
  writeFileSync(stdoutPath, '');
  const stdoutFd = openSync(stdoutPath, 'w');
  const capture = spawn(process.execPath, [cli, '--wrangler-path', fakeExecutable, '--output-root', outputRoot, '--config-home', path.join(root, 'config'), '--cache-home', path.join(root, 'cache'), '--tmp-dir', path.join(root, 'tmp')], { stdio: ['ignore', stdoutFd, 'ignore'] });
  const timeout = setTimeout(() => capture.kill('SIGTERM'), 10_000);
  const exitCode = await new Promise((resolve, reject) => {
    capture.once('error', reject);
    capture.once('close', (code) => resolve(code));
  });
  clearTimeout(timeout);
  closeSync(stdoutFd);
  assert.equal(exitCode, 0);
  assert.ok(readFileSync(stdoutPath, 'utf8').includes('"status":"TAIL_ERROR"'));
  const dir = readdirSync(outputRoot).map((name) => path.join(outputRoot, name))[0];
  const summary = JSON.parse(readFileSync(path.join(dir, 'summary.json'), 'utf8'));
  assert.equal(summary.status, 'TAIL_ERROR');
  assert.equal(summary.tailError, true);
  assert.equal(summary.parseErrors, 1);
  assert.equal(summary.benchmarkEvents, 0);
  assert.equal(summary.reviewStatus, 'NOT_EVALUATED');
});
