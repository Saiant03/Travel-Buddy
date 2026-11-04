import { readFileSync, statSync, lstatSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RUNNER = path.join(ROOT, '.local/p09/run-cpu.mjs');
const WORKLOAD_HASH = 'e72a2f1d6b21af68ca1860b9dc6528005721f236ead66eaf0cbd9ebdfdab62d9';
const MAX_BYTES = 64 * 1024;
const blocked = (code) => ({ status: 'blocked', code });

function jsonFile(file) {
  if (typeof file !== 'string' || !path.isAbsolute(file)) throw new Error('path');
  if (statSync(file).size > MAX_BYTES) throw new Error('size');
  return JSON.parse(readFileSync(file, 'utf8'));
}
function captureHealthy(summary, version, now, summaryPath) {
  const started = Date.parse(summary.captureStartedAt), updated = Date.parse(summary.updatedAt);
  const modified = statSync(summaryPath).mtimeMs;
  return summary.status === 'RUNNING' && summary.telemetryObserved === true && summary.telemetryScriptVersionId === version &&
    Number.isFinite(started) && now - started >= 0 && now - started < 600_000 &&
    Number.isFinite(updated) && now - updated >= 0 && now - updated < 5000 && now - modified >= 0 && now - modified < 5000 &&
    summary.tailError === false && summary.reconnectObserved === false && summary.parseErrors === 0 &&
    summary.tailInfo?.overload === 0 && summary.tailInfo?.overloadStop === 0 &&
    summary.missingCpuEvents === 0 && summary.invalidWorkloadEvents === 0 && summary.invalidTraceEvents === 0 && summary.truncatedEvents === 0 &&
    summary.exceptionEvents === 0 && summary.outcomeErrors === 0 && summary.duplicateRequestIds === 0 &&
    Array.isArray(summary.scriptVersionIds) && summary.scriptVersionIds.every((id) => id === version);
}
function pathExists(file) {
  try { lstatSync(file); return true; }
  catch (error) { if (error?.code === 'ENOENT') return false; throw error; }
}
function validate(env, now, runnerAvailable) {
  const email = env.TRAVEL_BUDDY_ALPHA_EMAIL, password = env.TRAVEL_BUDDY_ALPHA_PASSWORD;
  if (typeof email !== 'string' || !email || email.length > 320 || email !== email.trim() || typeof password !== 'string' || !password || password.length > 4096) throw new Error('credentials');
  const configPath = env.TRAVEL_BUDDY_FIREBASE_PUBLIC_CONFIG;
  if (typeof configPath !== 'string' || !path.isAbsolute(configPath) || (statSync(configPath).mode & 0o077) !== 0 ||
      (statSync(path.dirname(configPath)).mode & 0o077) !== 0) throw new Error('config permissions');
  const config = jsonFile(configPath);
  if (typeof config.firebaseProjectId !== 'string' || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(config.firebaseProjectId) ||
      typeof config.firebaseWebApiKey !== 'string' || !/^[A-Za-z0-9_-]{1,256}$/.test(config.firebaseWebApiKey) ||
      typeof config.expectedAlphaUid !== 'string' || !config.expectedAlphaUid.trim() || config.expectedAlphaUid.length > 128 || config.expectedAlphaUid !== config.expectedAlphaUid.trim()) throw new Error('config');
  const manifest = jsonFile(env.TRAVEL_BUDDY_PROBE_MANIFEST);
  const endpoint = new URL(env.TRAVEL_BUDDY_PROBE_URL);
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || endpoint.pathname !== '/probe/benchmark' || endpoint.href !== env.TRAVEL_BUDDY_PROBE_URL ||
      manifest.endpoint !== endpoint.href || manifest.buildHash !== env.TRAVEL_BUDDY_PROBE_BUILD_HASH || !/^[a-f0-9]{40,64}$/.test(manifest.buildHash) ||
      typeof manifest.scriptVersionId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(manifest.scriptVersionId) || manifest.scriptVersionId === manifest.buildHash ||
      manifest.workloadHash !== WORKLOAD_HASH || manifest.payloadBytes !== 262144) throw new Error('manifest');
  const report = env.TRAVEL_BUDDY_PROBE_REPORT;
  if (typeof report !== 'string' || !path.isAbsolute(report) || pathExists(report) || (statSync(path.dirname(report)).mode & 0o077) !== 0) throw new Error('report');
  if (!runnerAvailable() || !captureHealthy(jsonFile(env.TRAVEL_BUDDY_CAPTURE_SUMMARY), manifest.scriptVersionId, now, env.TRAVEL_BUDDY_CAPTURE_SUMMARY)) throw new Error('capture');
  return { email, password, config, version: manifest.scriptVersionId };
}
async function boundedBody(response) {
  if (Number(response.headers.get('content-length')) > MAX_BYTES || !response.body) throw new Error('body');
  const reader = response.body.getReader(), chunks = [];
  let size = 0;
  try {
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      size += item.value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); throw new Error('body'); }
      chunks.push(item.value);
    }
  } finally { reader.releaseLock(); }
  const body = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), size);
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body));
}
function claimsMatch(data, config, email, now) {
  if (!data || typeof data !== 'object' || data.localId !== config.expectedAlphaUid || data.email !== email || typeof data.idToken !== 'string' || data.idToken.length > 16384) return false;
  const parts = data.idToken.split('.');
  if (parts.length !== 3 || parts.some((part) => !part || !/^[A-Za-z0-9_-]+$/.test(part))) return false;
  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const seconds = Math.floor(now / 1000);
    return header.alg === 'RS256' && typeof header.kid === 'string' && header.kid.length > 0 &&
      claims.aud === config.firebaseProjectId && claims.iss === `https://securetoken.google.com/${config.firebaseProjectId}` &&
      claims.sub === config.expectedAlphaUid && claims.email === email && claims.email_verified === true &&
      Number.isSafeInteger(claims.exp) && claims.exp > seconds && Number.isSafeInteger(claims.iat) && claims.iat <= seconds + 60 && claims.iat >= 0 &&
      Number.isSafeInteger(claims.auth_time) && claims.auth_time <= seconds + 60 && claims.auth_time >= 0;
  } catch { return false; }
}
async function launch(childEnv) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [RUNNER], { env: childEnv, stdio: 'ignore' });
    const interrupt = () => child.kill('SIGINT');
    process.once('SIGINT', interrupt);
    child.once('error', () => { process.removeListener('SIGINT', interrupt); resolve(2); });
    child.once('exit', (code) => { process.removeListener('SIGINT', interrupt); resolve(Number.isInteger(code) ? code : 2); });
  });
}
export async function runAlphaSession({ env = process.env, fetcher = fetch, launcher = launch, now = Date.now, runnerAvailable = () => statSync(RUNNER).isFile() } = {}) {
  let values;
  try { values = validate(env, now(), runnerAvailable); } catch { return blocked('PREFLIGHT_FAILED'); }
  let data;
  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(values.config.firebaseWebApiKey)}`;
    const response = await fetcher(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(20_000), body: JSON.stringify({ email: values.email, password: values.password, returnSecureToken: true }) });
    if (!response.ok || response.redirected) return blocked('SIGN_IN_FAILED');
    data = await boundedBody(response);
  } catch { return blocked('SIGN_IN_FAILED'); }
  if (!claimsMatch(data, values.config, values.email, now())) return blocked('IDENTITY_INVALID');
  // Check capture again after sign-in; the child repeats the same guard during dispatch.
  try { if (!captureHealthy(jsonFile(env.TRAVEL_BUDDY_CAPTURE_SUMMARY), values.version, now(), env.TRAVEL_BUDDY_CAPTURE_SUMMARY)) return blocked('PREFLIGHT_FAILED'); }
  catch { return blocked('PREFLIGHT_FAILED'); }
  const childEnv = { TRAVEL_BUDDY_PROBE_BEARER: data.idToken };
  for (const name of [
    'TRAVEL_BUDDY_PROBE_URL', 'TRAVEL_BUDDY_PROBE_BUILD_HASH', 'TRAVEL_BUDDY_PROBE_MANIFEST',
    'TRAVEL_BUDDY_PROBE_REPORT', 'TRAVEL_BUDDY_CAPTURE_SUMMARY',
    'PATH', 'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY', 'http_proxy', 'https_proxy', 'all_proxy', 'no_proxy',
    'NODE_USE_ENV_PROXY', 'NODE_EXTRA_CA_CERTS', 'SSL_CERT_FILE', 'SSL_CERT_DIR', 'REQUESTS_CA_BUNDLE',
    'CODEX_PROXY_CERT', 'CODEX_EXEC_SERVER_PROXY_PRIVATE_IPS_VIA_UPSTREAM',
  ]) { if (typeof env[name] === 'string') childEnv[name] = env[name]; }
  data = undefined;
  values = undefined;
  try {
    const exitCode = await launcher(childEnv);
    return { status: 'completed', exitCode: Number.isInteger(exitCode) && exitCode >= 0 && exitCode <= 255 ? exitCode : 2 };
  } catch { return blocked('RUNNER_FAILED'); }
  finally { delete childEnv.TRAVEL_BUDDY_PROBE_BEARER; }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await runAlphaSession();
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (result.status !== 'completed' || result.exitCode !== 0) process.exitCode = 2;
}
