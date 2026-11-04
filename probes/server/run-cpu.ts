import { openSync, closeSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { runCpuProbe } from '../cpu-runner.js';

const endpoint = process.env.TRAVEL_BUDDY_PROBE_URL ?? '';
const bearerToken = process.env.TRAVEL_BUDDY_PROBE_BEARER ?? '';
const buildHash = process.env.TRAVEL_BUDDY_PROBE_BUILD_HASH ?? '';
const reportPath = process.env.TRAVEL_BUDDY_PROBE_REPORT ?? '';
const captureSummaryPath = process.env.TRAVEL_BUDDY_CAPTURE_SUMMARY ?? '';
const manifestPath = process.env.TRAVEL_BUDDY_PROBE_MANIFEST ?? '';
const controller = new AbortController();
process.once('SIGINT', () => controller.abort(new Error('interrupted')));

try {
  if (!reportPath || !captureSummaryPath || !manifestPath) throw new Error('missing local paths');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { buildHash?: string; scriptVersionId?: string; workloadHash?: string; payloadBytes?: number; endpoint?: string };
  if (!manifest.endpoint || manifest.endpoint !== endpoint || manifest.buildHash !== buildHash || !/^[a-f0-9]{40,64}$/.test(buildHash) ||
      !manifest.scriptVersionId || !/^[A-Za-z0-9_-]{1,128}$/.test(manifest.scriptVersionId) || manifest.scriptVersionId === buildHash ||
      manifest.workloadHash !== 'e72a2f1d6b21af68ca1860b9dc6528005721f236ead66eaf0cbd9ebdfdab62d9' || manifest.payloadBytes !== 262144) throw new Error('invalid manifest');
  const captureGuard = () => {
    const summary = JSON.parse(readFileSync(captureSummaryPath, 'utf8'));
    const now = Date.now();
    const started = Date.parse(summary.captureStartedAt);
    const updated = Date.parse(summary.updatedAt);
    const modified = statSync(captureSummaryPath).mtimeMs;
    return summary.status === 'RUNNING' && summary.telemetryObserved === true && summary.telemetryScriptVersionId === manifest.scriptVersionId &&
      Number.isFinite(started) && now - started >= 0 && now - started < 600_000 &&
      Number.isFinite(updated) && now - updated >= 0 && now - updated < 5000 && now - modified >= 0 && now - modified < 5000 &&
      summary.tailError === false && summary.reconnectObserved === false && summary.parseErrors === 0 &&
      summary.tailInfo?.overload === 0 && summary.tailInfo?.overloadStop === 0 &&
      summary.missingCpuEvents === 0 && summary.invalidWorkloadEvents === 0 && summary.invalidTraceEvents === 0 && summary.truncatedEvents === 0 &&
      summary.exceptionEvents === 0 && summary.outcomeErrors === 0 && summary.duplicateRequestIds === 0 &&
      Array.isArray(summary.scriptVersionIds) && summary.scriptVersionIds.every((id: unknown) => id === manifest.scriptVersionId);
  };
  if (!captureGuard()) throw new Error('capture is not ready');
  if ((statSync(path.dirname(path.resolve(reportPath))).mode & 0o077) !== 0) throw new Error('report directory must be private');
  // Reserve the report path so a stale report can never be reused or overwritten.
  closeSync(openSync(reportPath, 'wx', 0o600));
  const persist = (report: unknown) => {
    const temporary = `${reportPath}.${randomUUID()}.tmp`;
    try {
      writeFileSync(temporary, `${JSON.stringify(report)}\n`, { mode: 0o600, flag: 'wx' });
      renameSync(temporary, reportPath);
    } finally {
      try { unlinkSync(temporary); } catch { /* renamed or never created */ }
    }
  };
  persist({ status: 'blocked', reason: 'in_progress' });
  const result = await runCpuProbe({ endpoint, expectedEndpoint: manifest.endpoint, bearerToken, buildHash, signal: controller.signal, onProgress: persist, captureGuard, coldConcurrency: 1, warmConcurrency: 1 });
  persist(result);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (result.status !== 'sent') process.exitCode = 2;
} catch {
  process.stderr.write('CPU probe dispatch failed before producing a report.\n');
  process.exitCode = 2;
}
