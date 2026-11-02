#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { chmodSync, closeSync, fsyncSync, mkdirSync, openSync, renameSync, writeFileSync, writeSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

export const EXPECTED_WORKLOAD_HASH = 'e72a2f1d6b21af68ca1860b9dc6528005721f236ead66eaf0cbd9ebdfdab62d9';
export const EXPECTED_PAYLOAD_BYTES = 262144;
export const MAX_BENCHMARK_EVENTS = 201;
export const MAX_CAPTURE_MS = 10 * 60 * 1000;

function scanJsonValue(text, start) {
  const first = text[start];
  if (first === '"') {
    let escaped = false;
    for (let i = start + 1; i < text.length; i += 1) {
      if (escaped) escaped = false;
      else if (text[i] === '\\') escaped = true;
      else if (text[i] === '"') return i + 1;
    }
    return -1;
  }
  if (first !== '{' && first !== '[') {
    const end = text.indexOf('\n', start);
    return end === -1 ? -1 : end;
  }
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') quoted = false;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === '{' || c === '[') depth += 1;
    else if (c === '}' || c === ']') {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

export class JsonStreamParser {
  #buffer = '';
  #parseErrors = 0;
  #parsedObjects = 0;

  push(chunk) {
    this.#buffer += chunk;
    const values = [];
    let offset = 0;
    while (offset < this.#buffer.length) {
      const c = this.#buffer[offset];
      if (c === '\u001b') {
        const ansi = this.#buffer.slice(offset + 1).match(/^\[[0-?]*[ -/]*[@-~]/);
        if (ansi) { offset += ansi[0].length + 1; continue; }
        break;
      }
      if (c === '"') {
        const end = scanJsonValue(this.#buffer, offset);
        if (end < 0) break;
        // Top-level JSON strings are Wrangler status messages; consume whole.
        offset = end;
        continue;
      }
      if (c === '{' || c === '[') {
        const end = scanJsonValue(this.#buffer, offset);
        if (end < 0) break;
        try {
          const value = JSON.parse(this.#buffer.slice(offset, end));
          if (value && typeof value === 'object') {
            values.push(value);
            this.#parsedObjects += 1;
          }
        } catch {
          this.#parseErrors += 1;
          const lineEnd = this.#buffer.indexOf('\n', offset);
          offset = lineEnd < 0 ? this.#buffer.length : lineEnd + 1;
          continue;
        }
        offset = end;
        continue;
      }
      offset += 1;
    }
    this.#buffer = this.#buffer.slice(offset);
    return values;
  }

  summary() {
    return { parseErrors: this.#parseErrors, parsedObjects: this.#parsedObjects };
  }

  finish() {
    const remaining = this.#buffer;
    this.#buffer = '';
    const trimmed = remaining.trimStart();
    if ((trimmed[0] === '{' || trimmed[0] === '[') && scanJsonValue(trimmed, 0) < 0) {
      this.#parseErrors += 1;
      return [];
    }
    return this.push(remaining);
  }
}

function readCpuWorkload(logs) {
  for (const log of Array.isArray(logs) ? logs : []) {
    const messages = Array.isArray(log?.message) ? log.message : [log?.message];
    for (let message of messages) {
      if (typeof message === 'string') {
        try { message = JSON.parse(message); } catch { continue; }
      }
      if (message?.probe === 'cpu-workload') return message;
    }
  }
  return null;
}

function safeRequestId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value) ? value : null;
}

function safeHash(value) {
  return typeof value === 'string' && /^[a-f\d]{64}$/i.test(value) ? value.toLowerCase() : null;
}

export function createCaptureAccumulator({ expectedWorkloadHash = EXPECTED_WORKLOAD_HASH, expectedPayloadBytes = EXPECTED_PAYLOAD_BYTES } = {}) {
  const state = {
    telemetryObserved: false,
    benchmarkEvents: 0,
    measuredEvents: { cold: 0, warm: 0 },
    warmPrimerObserved: false,
    warmPrimerOrderValid: false,
    missingCpuEvents: 0,
    duplicateRequestIds: 0,
    invalidWorkloadEvents: 0,
    truncatedEvents: 0,
    exceptionEvents: 0,
    exceptionCount: 0,
    outcomeErrors: 0,
    outcomes: {},
    seenRequestIds: new Set(),
  };

  return {
    consume(trace) {
      const req = trace?.event?.request;
      if (!req || typeof req.method !== 'string' || typeof req.url !== 'string') return null;
      let pathname;
      try { pathname = new URL(req.url).pathname; } catch { return null; }
      const method = req.method.toUpperCase();
      if (method === 'GET' && pathname === '/probe/public-config') {
        if (typeof trace.cpuTime === 'number' && Number.isFinite(trace.cpuTime) && trace.cpuTime >= 0 && typeof trace.outcome === 'string') {
          state.telemetryObserved = true;
        }
        return null;
      }
      if (method !== 'POST' || pathname !== '/probe/benchmark' || state.benchmarkEvents >= MAX_BENCHMARK_EVENTS) return null;

      state.benchmarkEvents += 1;
      const workload = readCpuWorkload(trace.logs);
      const requestId = safeRequestId(workload?.requestId);
      const workloadHash = safeHash(workload?.workloadHash);
      const payloadBytes = Number.isSafeInteger(workload?.payloadBytes) ? workload.payloadBytes : null;
      const samplePath = workload?.path === 'cold' || workload?.path === 'warm' ? workload.path : null;
      if (!requestId || !workloadHash || payloadBytes === null || !samplePath || workloadHash !== expectedWorkloadHash || payloadBytes !== expectedPayloadBytes) state.invalidWorkloadEvents += 1;
      if (requestId && state.seenRequestIds.has(requestId)) state.duplicateRequestIds += 1;
      else if (requestId) state.seenRequestIds.add(requestId);

      let primer = false;
      if (samplePath === 'cold') state.measuredEvents.cold += 1;
      if (samplePath === 'warm') {
        if (!state.warmPrimerObserved) {
          state.warmPrimerObserved = true;
          state.warmPrimerOrderValid = state.measuredEvents.cold === 0;
          primer = state.warmPrimerOrderValid;
        }
        if (!primer) state.measuredEvents.warm += 1;
      }
      if (typeof trace.cpuTime !== 'number' || !Number.isFinite(trace.cpuTime) || trace.cpuTime < 0) state.missingCpuEvents += 1;
      const outcome = typeof trace.outcome === 'string' ? trace.outcome : 'missing';
      state.outcomes[outcome] = (state.outcomes[outcome] ?? 0) + 1;
      if (outcome !== 'ok') state.outcomeErrors += 1;
      if (trace.truncated === true) state.truncatedEvents += 1;
      const exceptionCount = Array.isArray(trace.exceptions) ? trace.exceptions.length : 0;
      state.exceptionCount += exceptionCount;
      if (exceptionCount) state.exceptionEvents += 1;

      const record = {
        eventTimestamp: typeof trace.eventTimestamp === 'number' ? trace.eventTimestamp : null,
        scriptVersionId: safeRequestId(trace.scriptVersion?.id),
        cpuTime: typeof trace.cpuTime === 'number' && Number.isFinite(trace.cpuTime) ? trace.cpuTime : null,
        wallTime: typeof trace.wallTime === 'number' && Number.isFinite(trace.wallTime) ? trace.wallTime : null,
        outcome,
        truncated: trace.truncated === true,
        exceptionCount,
        request: { method, path: pathname },
        cpuWorkload: workload ? { requestId, path: samplePath, workloadHash, payloadBytes } : null,
        primer,
      };
      return record;
    },
    summary() {
      const summary = { ...state };
      delete summary.seenRequestIds;
      return {
        ...summary,
        primerWarmObserved: state.warmPrimerObserved,
        primerOrderValid: state.warmPrimerOrderValid,
        expectedWorkloadHash,
        expectedPayloadBytes,
        expectedBenchmarkEvents: MAX_BENCHMARK_EVENTS,
        expectedPathEvents: { cold: 100, warm: 101 },
        expectedMeasuredEvents: { cold: 100, warm: 100 },
        reviewStatus: 'NOT_EVALUATED',
      };
    },
  };
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (!key.startsWith('--') || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Invalid command arguments.');
    options[key.slice(2)] = args[++i];
  }
  if (!options['wrangler-path']) throw new Error('Pass --wrangler-path to the installed Wrangler executable.');
  return options;
}

function saveSummary(dir, summary) {
  const temp = path.join(dir, 'summary.tmp');
  writeFileSync(temp, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
  renameSync(temp, path.join(dir, 'summary.json'));
}

async function runCapture(options) {
  const startedAt = new Date().toISOString();
  const stamp = startedAt.replace(/[:.]/g, '-');
  const outDir = path.resolve(options['output-root'] ?? '.local', `cpu-${stamp}`);
  mkdirSync(outDir, { recursive: true, mode: 0o700 });
  chmodPrivate(outDir);
  const eventPath = path.join(outDir, 'sanitized-events.jsonl');
  const eventFd = openSync(eventPath, 'wx', 0o600);
  const configHome = path.resolve(options['config-home'] ?? path.join(tmpdir(), 'tb-wrangler-config'));
  const cacheHome = path.resolve(options['cache-home'] ?? path.join(tmpdir(), 'tb-wrangler-cache'));
  const tempHome = path.resolve(options['tmp-dir'] ?? path.join(tmpdir(), 'tb-wrangler-tmp'));
  for (const dir of [configHome, cacheHome, tempHome]) { mkdirSync(dir, { recursive: true, mode: 0o700 }); chmodPrivate(dir); }
  const accumulator = createCaptureAccumulator();
  const parser = new JsonStreamParser();
  let status = 'RUNNING';
  let tailError = false;
  let stopRequested = false;
  const baseSummary = () => ({
    captureStartedAt: startedAt,
    captureEndedAt: null,
    status,
    tailError,
    ...parser.summary(),
    ...accumulator.summary(),
  });
  saveSummary(outDir, baseSummary());
  const env = {
    ...process.env,
    XDG_CONFIG_HOME: configHome,
    XDG_CACHE_HOME: cacheHome,
    TMPDIR: tempHome,
    NODE_USE_ENV_PROXY: '1',
    WRANGLER_SEND_METRICS: 'false',
  };
  const child = spawn(options['wrangler-path'], ['tail', 'travel-buddy-server-probe', '--format', 'json'], {
    stdio: ['ignore', 'pipe', 'pipe'], env,
  });
  const onValue = (value) => {
    const event = accumulator.consume(value);
    if (event) {
      writeSync(eventFd, `${JSON.stringify(event)}\n`);
      fsyncSync(eventFd);
    }
    saveSummary(outDir, baseSummary());
    if (accumulator.summary().benchmarkEvents >= MAX_BENCHMARK_EVENTS && !stopRequested) {
      status = 'CAPTURED_201_EVENTS';
      stopRequested = true;
      child.kill('SIGINT');
    }
  };
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { for (const value of parser.push(chunk)) onValue(value); });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => { if (/(error|failed|failure|exception)/i.test(chunk)) { tailError = true; saveSummary(outDir, baseSummary()); } });
  child.on('error', () => { tailError = true; status = 'TAIL_ERROR'; saveSummary(outDir, baseSummary()); });
  const timer = setTimeout(() => {
    if (!stopRequested) { status = 'TIMEOUT'; stopRequested = true; child.kill('SIGINT'); }
  }, MAX_CAPTURE_MS);
  timer.unref();
  const onSigint = () => {
    if (!stopRequested) { status = 'INTERRUPTED'; stopRequested = true; child.kill('SIGINT'); }
  };
  process.once('SIGINT', onSigint);
  await new Promise((resolve) => child.once('close', resolve));
  clearTimeout(timer);
  process.removeListener('SIGINT', onSigint);
  for (const value of parser.finish()) onValue(value);
  if (status === 'RUNNING') status = tailError ? 'TAIL_ERROR' : 'STOPPED_EARLY';
  const finalSummary = { ...baseSummary(), captureEndedAt: new Date().toISOString(), tailExitCode: child.exitCode };
  saveSummary(outDir, finalSummary);
  closeSync(eventFd);
  process.stdout.write(`${JSON.stringify({ outputDirectory: outDir, status: finalSummary.status, benchmarkEvents: finalSummary.benchmarkEvents, telemetryObserved: finalSummary.telemetryObserved })}\n`);
}

function chmodPrivate(dir) {
  chmodSync(dir, 0o700);
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (entry === import.meta.url) {
  try { await runCapture(parseArgs(process.argv.slice(2))); }
  catch {
    process.stderr.write('CPU telemetry capture failed; details were suppressed to avoid exposing credentials.\n');
    process.exitCode = 2;
  }
}
