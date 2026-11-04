#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { EXPECTED_PAYLOAD_BYTES, EXPECTED_WORKLOAD_HASH } from './cpu-capture.mjs';

const validId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(id);
const validBuild = (value) => typeof value === 'string' && /^[a-f0-9]{40,64}$/.test(value);

/** All inputs are local, sanitized metadata. A result always requires independent provenance review. */
export function correlateCpuCapture({ report, events, summary, manifest }) {
  const blocked = (reason) => ({ status: 'blocked', reason });
  if (!manifest || !validBuild(manifest.buildHash) || !validId(manifest.scriptVersionId) ||
      manifest.scriptVersionId === manifest.buildHash || manifest.workloadHash !== EXPECTED_WORKLOAD_HASH || manifest.payloadBytes !== EXPECTED_PAYLOAD_BYTES)
    return blocked('invalid_independent_manifest');
  if (!report || report.status !== 'sent' || report.buildHash !== manifest.buildHash || report.workloadHash !== manifest.workloadHash ||
      report.payloadBytes !== manifest.payloadBytes || report.requested?.cold !== 100 || report.requested?.warm !== 100 ||
      !Array.isArray(report.records) || report.records.length !== 200 || !report.primer ||
      report.primer.requestedPath !== 'warm' || report.primer.index !== -1 || !['cold', 'warm'].includes(report.primer.keyCacheState))
    return blocked('invalid_or_incomplete_report');
  const expected = new Map();
  const indexes = { cold: new Set(), warm: new Set() };
  for (const record of [report.primer, ...report.records]) {
    if (!validId(record?.requestId) || expected.has(record.requestId)) return blocked('duplicate_or_invalid_report_id');
    expected.set(record.requestId, record);
    if (record === report.primer) continue;
    const p = record.requestedPath;
    if (!['cold', 'warm'].includes(p) || record.keyCacheState !== p || !Number.isInteger(record.index) || record.index < 0 || record.index >= 100 || indexes[p].has(record.index))
      return blocked('invalid_report_coverage');
    indexes[p].add(record.index);
  }
  if (indexes.cold.size !== 100 || indexes.warm.size !== 100) return blocked('invalid_report_coverage');
  if (!summary || summary.status !== 'MATCHED_REPORT_IDS' || summary.tailError !== false || summary.reconnectObserved !== false || summary.parseErrors !== 0 ||
      summary.telemetryObserved !== true || summary.telemetryScriptVersionId !== manifest.scriptVersionId ||
      summary.tailInfo?.overload !== 0 || summary.tailInfo?.overloadStop !== 0) return blocked('capture_not_complete');
  if (!Array.isArray(events) || events.length !== 201) return blocked('missing_or_extra_events');
  const seen = new Set();
  const values = { cold: [], warm: [] };
  for (const event of events) {
    const workload = event?.cpuWorkload;
    const record = expected.get(workload?.requestId);
    if (!record || seen.has(workload.requestId)) return blocked('unexpected_or_duplicate_event');
    seen.add(workload.requestId);
    if (event.request?.method !== 'POST' || event.request?.path !== '/probe/benchmark' || event.scriptVersionId !== manifest.scriptVersionId ||
        workload.path !== record.requestedPath || workload.workloadHash !== manifest.workloadHash || workload.payloadBytes !== manifest.payloadBytes ||
        typeof event.cpuTime !== 'number' || !Number.isFinite(event.cpuTime) || event.cpuTime < 0 || event.outcome !== 'ok' ||
        event.truncated !== false || event.exceptionCount !== 0) return blocked('invalid_platform_event');
    if (record !== report.primer) values[record.requestedPath].push(event.cpuTime);
  }
  if (seen.size !== 201 || values.cold.length !== 100 || values.warm.length !== 100) return blocked('missing_events');
  const summarize = (list) => { const sorted = list.toSorted((a, b) => a - b); return { n: 100, p50Ms: sorted[49], p95Ms: sorted[94], terminations: 0 }; };
  const cold = summarize(values.cold); const warm = summarize(values.warm);
  return { status: 'review_required', criteriaMet: cold.p95Ms <= 7 && warm.p95Ms <= 7, cold, warm };
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (entry === import.meta.url) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 4) throw new Error('expected report, events, summary and manifest paths');
    const [reportPath, eventsPath, summaryPath, manifestPath] = args;
    const parse = (file) => JSON.parse(readFileSync(file, 'utf8'));
    const raw = readFileSync(eventsPath, 'utf8');
    const events = raw.split('\n').filter(Boolean).map((line) => JSON.parse(line));
    const result = correlateCpuCapture({ report: parse(reportPath), events, summary: parse(summaryPath), manifest: parse(manifestPath) });
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (result.status === 'blocked') process.exitCode = 2;
  } catch {
    process.stderr.write('Correlation failed: invalid or unreadable local input.\n');
    process.exitCode = 2;
  }
}
