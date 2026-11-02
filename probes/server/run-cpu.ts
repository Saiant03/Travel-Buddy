import { runCpuProbe } from '../cpu-runner.js';

const endpoint = process.env.TRAVEL_BUDDY_PROBE_URL ?? '';
const bearerToken = process.env.TRAVEL_BUDDY_PROBE_BEARER ?? '';
const buildHash = process.env.TRAVEL_BUDDY_PROBE_BUILD_HASH ?? '';
const controller = new AbortController();
process.once('SIGINT', () => controller.abort(new Error('interrupted')));

try {
  const result = await runCpuProbe({ endpoint, bearerToken, buildHash, signal: controller.signal });
  // The dispatch report contains correlation IDs and metadata only, never credentials or CPU estimates.
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (result.status !== 'sent') process.exitCode = 2;
} catch {
  process.stderr.write('CPU probe dispatch failed before producing a report.\n');
  process.exitCode = 2;
}
