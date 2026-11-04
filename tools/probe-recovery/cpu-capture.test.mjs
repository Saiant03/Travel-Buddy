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
    assert.deepEqual(summary.measuredEvents, { cold: 100, warm: 101 });
    assert.equal('primerOrderValid' in summary, false);
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

test('capture never guesses the primer from tail order', () => {
  const capture = createCaptureAccumulator();
  const item = (id, samplePath) => trace({ log: { probe: 'cpu-workload', requestId: id, path: samplePath, workloadHash: hash, payloadBytes: 262144 } });
  capture.consume(item('cold-first', 'cold'));
  assert.equal(capture.consume(item('warm-late', 'warm')).primer, undefined);
  assert.equal(capture.summary().primerOrderValid, undefined);
});

test('capture preserves extra events and counts errors, truncation, and missing CPU metrics', () => {
  const capture = createCaptureAccumulator({ expectedWorkloadHash: hash, expectedPayloadBytes: 262144 });
  const item = (id, path, extra = {}) => trace({ log: { probe: 'cpu-workload', requestId: id, path, workloadHash: hash, payloadBytes: 262144 }, ...extra });
  capture.consume(item('warm-primer', 'warm', { outcome: 'exception', truncated: true, exceptions: [{}], cpuTime: -1 }));
  for (let i = 0; i < 100; i += 1) capture.consume(item(`cold-${i}`, 'cold', i === 0 ? { cpuTime: Number.POSITIVE_INFINITY } : {}));
  for (let i = 0; i < 100; i += 1) capture.consume(item(`warm-${i}`, 'warm'));
  assert.ok(capture.consume(item('extra', 'warm')));
  const summary = capture.summary();
  assert.equal(summary.benchmarkEvents, 202);
  assert.deepEqual(summary.measuredEvents, { cold: 100, warm: 102 });
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
  assert.equal(summary.primerWarmObserved, undefined);
  assert.deepEqual(summary.measuredEvents, { cold: 3, warm: 2 });
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
  const report = path.join(root, 'report.json');
  const cli = fileURLToPath(new URL('./cpu-capture.mjs', import.meta.url));
  const rows = [['primer', 'warm'], ...Array.from({ length: 100 }, (_, i) => [`cold-${i}`, 'cold']), ...Array.from({ length: 100 }, (_, i) => [`warm-${i}`, 'warm'])];
  const events = rows.map(([requestId, samplePath]) => ({
    eventTimestamp: 1793600938145,
    event: { request: { method: 'POST', url: 'https://worker.test/probe/benchmark?token=cpu-private-marker', headers: { authorization: 'Bearer cpu-private-marker' } } },
    scriptVersion: { id: 'build-123' }, cpuTime: 2, wallTime: 7, outcome: 'ok', truncated: false, exceptions: [],
    logs: [{ message: [JSON.stringify({ probe: 'cpu-workload', requestId, path: samplePath, workloadHash: hash, payloadBytes: 262144, ignored: 'cpu-private-marker' })] }],
  }));
  writeFileSync(fixture, `${events.map(JSON.stringify).join('\n')}\n`);
  writeFileSync(report, JSON.stringify({ status: 'sent', primer: { requestId: 'primer' }, records: rows.slice(1).map(([requestId]) => ({ requestId })) }));
  writeFileSync(fakeExecutable, `#!/bin/sh\ntrap 'printf stopped > ${JSON.stringify(stopped)}; exit 0' INT\nprintf '\\033[32mConnected to fake tail\\033[0m\\n'\ncat ${JSON.stringify(fixture)}\nwhile :; do sleep 1; done\n`);
  chmodSync(fakeExecutable, 0o700);
  writeFileSync(stdoutPath, '');
  const stdoutFd = openSync(stdoutPath, 'w');
  const capture = spawn(process.execPath, [cli, '--wrangler-path', fakeExecutable, '--script', 'test-worker', '--report', report, '--output-root', outputRoot, '--config-home', path.join(root, 'config'), '--cache-home', path.join(root, 'cache'), '--tmp-dir', path.join(root, 'tmp')], { stdio: ['ignore', stdoutFd, 'ignore'] });
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
  assert.equal(result.status, 'MATCHED_REPORT_IDS');
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
  assert.equal(records[0].primer, undefined);
  assert.deepEqual(records.reduce((acc, record) => { acc[record.cpuWorkload.path] += 1; return acc; }, { cold: 0, warm: 0 }), { cold: 100, warm: 101 });
  const summary = JSON.parse(readFileSync(path.join(dir, 'summary.json'), 'utf8'));
  assert.equal(summary.parsedObjects, 201);
  assert.equal(summary.parseErrors, 0);
  assert.equal(summary.benchmarkEvents, 201);
  assert.deepEqual(summary.measuredEvents, { cold: 100, warm: 101 });
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
  const report = path.join(root, 'report.json');
  const cli = fileURLToPath(new URL('./cpu-capture.mjs', import.meta.url));
  writeFileSync(fakeExecutable, '#!/bin/sh\nprintf \'{"event":\'\nprintf \'ERROR tail disconnected\\n\' >&2\nexit 1\n');
  chmodSync(fakeExecutable, 0o700);
  const stdoutPath = path.join(root, 'capture-stdout.txt');
  writeFileSync(stdoutPath, '');
  const stdoutFd = openSync(stdoutPath, 'w');
  const capture = spawn(process.execPath, [cli, '--wrangler-path', fakeExecutable, '--script', 'test-worker', '--report', report, '--output-root', outputRoot, '--config-home', path.join(root, 'config'), '--cache-home', path.join(root, 'cache'), '--tmp-dir', path.join(root, 'tmp')], { stdio: ['ignore', stdoutFd, 'ignore'] });
  const timeout = setTimeout(() => capture.kill('SIGTERM'), 10_000);
  const exitCode = await new Promise((resolve, reject) => {
    capture.once('error', reject);
    capture.once('close', (code) => resolve(code));
  });
  clearTimeout(timeout);
  closeSync(stdoutFd);
  assert.equal(exitCode, 2);
  assert.ok(readFileSync(stdoutPath, 'utf8').includes('"status":"PARSE_ERROR"'));
  const dir = readdirSync(outputRoot).map((name) => path.join(outputRoot, name))[0];
  const summary = JSON.parse(readFileSync(path.join(dir, 'summary.json'), 'utf8'));
  assert.equal(summary.status, 'PARSE_ERROR');
  assert.equal(summary.tailError, true);
  assert.equal(summary.parseErrors, 1);
  assert.equal(summary.benchmarkEvents, 0);
  assert.equal(summary.reviewStatus, 'NOT_EVALUATED');
});

test('tail overload signals are counted without retaining their messages', () => {
  const capture = createCaptureAccumulator();
  capture.consume({ event: { type: 'overload', message: 'private text' } });
  capture.consume({ event: { type: 'overload-stop', message: 'private text' } });
  assert.deepEqual(capture.summary().tailInfo, { overload: 1, overloadStop: 1 });
  assert.equal(JSON.stringify(capture.summary()).includes('private text'), false);
});

test('missing truncation and exception metadata remains unknown', () => {
  const capture = createCaptureAccumulator();
  const t = trace({ log: { probe: 'cpu-workload', requestId: 'r', path: 'cold', workloadHash: hash, payloadBytes: 262144 } });
  delete t.truncated;
  delete t.exceptions;
  const record = capture.consume(t);
  assert.equal(record.truncated, null);
  assert.equal(record.exceptionCount, null);
  assert.equal(capture.summary().invalidTraceEvents, 1);
});

test('overload signals are counted even when the message is missing', () => {
  const capture = createCaptureAccumulator();
  capture.consume({ event: { type: 'overload' } });
  capture.consume({ event: { type: 'overload-stop', message: null } });
  assert.deepEqual(capture.summary().tailInfo, { overload: 1, overloadStop: 1 });
});

test('a fatal overload cannot be overwritten by matching IDs while child delays exit', async () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'cpu-capture-overload-'));
  const fake = path.join(root, 'fake'); const fixture = path.join(root, 'events');
  const report = path.join(root, 'report'); const out = path.join(root, 'capture');
  const ids = ['primer', ...Array.from({ length: 200 }, (_, i) => `id-${i}`)];
  const rows = ids.map((requestId) => trace({ log: { probe: 'cpu-workload', requestId, path: 'warm', workloadHash: hash, payloadBytes: 262144 } }));
  rows.push({ event: { type: 'overload', message: 'redacted' } });
  writeFileSync(fixture, rows.map(JSON.stringify).join('\n') + '\n');
  writeFileSync(report, JSON.stringify({ status: 'sent', primer: { requestId: ids[0] }, records: ids.slice(1).map((requestId) => ({ requestId })) }));
  writeFileSync(fake, `#!/bin/sh\ntrap '' INT\ncat ${JSON.stringify(fixture)}\nwhile :; do sleep 1; done\n`); chmodSync(fake, 0o700);
  const child = spawn(process.execPath, [fileURLToPath(new URL('./cpu-capture.mjs', import.meta.url)), '--wrangler-path', fake, '--script', 'test', '--report', report, '--output-dir', out], { stdio: 'ignore' });
  const code = await new Promise((resolve) => child.once('close', resolve));
  assert.equal(code, 2);
  const summary = JSON.parse(readFileSync(path.join(out, 'summary.json'), 'utf8'));
  assert.equal(summary.status, 'TAIL_OVERLOAD');
});

test('an overload-stop received during shutdown makes the capture fail', async () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'cpu-capture-late-'));
  const fake = path.join(root, 'fake'); const fixture = path.join(root, 'events');
  const report = path.join(root, 'report'); const out = path.join(root, 'capture');
  const ids = ['primer', ...Array.from({ length: 200 }, (_, i) => `id-${i}`)];
  const rows = ids.map((requestId) => trace({ log: { probe: 'cpu-workload', requestId, path: 'warm', workloadHash: hash, payloadBytes: 262144 } }));
  writeFileSync(fixture, rows.map(JSON.stringify).join('\n') + '\n');
  writeFileSync(report, JSON.stringify({ status: 'sent', primer: { requestId: ids[0] }, records: ids.slice(1).map((requestId) => ({ requestId })) }));
  writeFileSync(fake, `#!/bin/sh\ntrap 'printf "{\\"event\\":{\\"type\\":\\"overload-stop\\"}}\\n"; exit 0' INT\ncat ${JSON.stringify(fixture)}\nwhile :; do sleep 1; done\n`); chmodSync(fake, 0o700);
  const child = spawn(process.execPath, [fileURLToPath(new URL('./cpu-capture.mjs', import.meta.url)), '--wrangler-path', fake, '--script', 'test', '--report', report, '--output-dir', out], { stdio: 'ignore' });
  const code = await new Promise((resolve) => child.once('close', resolve));
  assert.equal(code, 2);
  const summary = JSON.parse(readFileSync(path.join(out, 'summary.json'), 'utf8'));
  assert.equal(summary.tailInfo.overloadStop, 1);
});

test('a duplicate event received during shutdown makes the capture fail', async () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'cpu-capture-late-duplicate-'));
  const fake = path.join(root, 'fake'); const fixture = path.join(root, 'events');
  const report = path.join(root, 'report'); const out = path.join(root, 'capture');
  const ids = ['primer', ...Array.from({ length: 200 }, (_, i) => `id-${i}`)];
  const rows = ids.map((requestId) => trace({ log: { probe: 'cpu-workload', requestId, path: 'warm', workloadHash: hash, payloadBytes: 262144 } }));
  writeFileSync(fixture, rows.map(JSON.stringify).join('\n') + '\n');
  writeFileSync(report, JSON.stringify({ status: 'sent', primer: { requestId: ids[0] }, records: ids.slice(1).map((requestId) => ({ requestId })) }));
  writeFileSync(fake, `#!/usr/bin/env node\nconst fs = require('node:fs');\nprocess.on('SIGINT', () => { console.log(${JSON.stringify(JSON.stringify(rows[0]))}); process.exit(0); });\nprocess.stdout.write(fs.readFileSync(${JSON.stringify(fixture)}));\nsetInterval(() => {}, 1000);\n`); chmodSync(fake, 0o700);
  const child = spawn(process.execPath, [fileURLToPath(new URL('./cpu-capture.mjs', import.meta.url)), '--wrangler-path', fake, '--script', 'test', '--report', report, '--output-dir', out], { stdio: 'ignore' });
  const code = await new Promise((resolve) => child.once('close', resolve));
  assert.equal(code, 2);
  const summary = JSON.parse(readFileSync(path.join(out, 'summary.json'), 'utf8'));
  assert.equal(summary.duplicateRequestIds, 1);
});

test('unknown outcome text is redacted and blocks the capture', () => {
  const capture = createCaptureAccumulator();
  const record = capture.consume(trace({ outcome: 'Bearer cpu-private-marker', log: { probe: 'cpu-workload', requestId: 'r', path: 'cold', workloadHash: hash, payloadBytes: 262144 } }));
  assert.equal(record.outcome, 'unrecognized');
  assert.equal(capture.summary().outcomeErrors, 1);
  assert.equal(JSON.stringify({ record, summary: capture.summary() }).includes('cpu-private-marker'), false);
});
