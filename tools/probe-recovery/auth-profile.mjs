// Local synthetic microbenchmark; no network or real identities.
import { generateKeyPairSync, X509Certificate } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { importJWK, importX509, jwtVerify, SignJWT } from 'jose';
import { build } from 'esbuild';

const dir = mkdtempSync(join(tmpdir(), 'tb-auth-profile-'));
try {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const privatePath = join(dir, 'key.pem');
  const certPath = join(dir, 'cert.pem');
  writeFileSync(privatePath, privateKey.export({ type: 'pkcs8', format: 'pem' }));
  execFileSync('openssl', ['req', '-new', '-x509', '-key', privatePath, '-out', certPath, '-subj', '/CN=synthetic.test', '-days', '1'], { stdio: 'ignore' });
  const cert = readFileSync(certPath, 'utf8');
  const jwk = publicKey.export({ format: 'jwk' });
  const fromCert = new X509Certificate(cert).publicKey.export({ format: 'jwk' });
  if (jwk.n !== fromCert.n || jwk.e !== fromCert.e) throw new Error('keys differ');
  const token = await new SignJWT({ aud: 'probe-project', iss: 'https://securetoken.google.com/probe-project', sub: 'uid-alpha', email_verified: true, auth_time: Math.floor(Date.now()/1000)-60 }).setProtectedHeader({ alg: 'RS256', kid: 'synthetic' }).setIssuedAt().setExpirationTime('1h').sign(privateKey);
  const verifyOptions = { algorithms: ['RS256'], audience: 'probe-project', issuer: 'https://securetoken.google.com/probe-project', requiredClaims: ['aud','iss','exp','iat','sub'] };
  const cached = await importX509(cert, 'RS256');
  const bundle = await build({ entryPoints: ['probes/auth-worker.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
  const { createFirebaseVerifier } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].contents).toString('base64')}`);
  const options = { projectId: 'probe-project', allowedUids: ['uid-alpha', 'uid-beta'], fetchCertificates: async () => new Response(JSON.stringify({ synthetic: cert }), { headers: { 'Cache-Control': 'max-age=3600' } }) };
  const warmVerifier = createFirebaseVerifier(options);
  await warmVerifier(token);
  const scenarios = {
    importX509: async () => importX509(cert, 'RS256'),
    importJWK: async () => importJWK(jwk, 'RS256'),
    x509ImportAndVerify: async () => jwtVerify(token, await importX509(cert, 'RS256'), verifyOptions),
    jwkImportAndVerify: async () => jwtVerify(token, await importJWK(jwk, 'RS256'), verifyOptions),
    cachedKeyVerify: async () => jwtVerify(token, cached, verifyOptions),
    verifierCold: async () => createFirebaseVerifier(options)(token),
    verifierWarm: async () => warmVerifier(token),
  };
  const iterations = 1000;
  const results = {};
  for (const [name, run] of Object.entries(scenarios)) {
    for (let i=0; i<50; i++) await run();
    const samples = [];
    const cpuStart = process.cpuUsage();
    for (let i=0; i<iterations; i++) { const start = performance.now(); await run(); samples.push(performance.now()-start); }
    const cpu = process.cpuUsage(cpuStart);
    samples.sort((a,b)=>a-b);
    results[name] = { iterations, meanWallMs: samples.reduce((a,b)=>a+b,0)/iterations, p50WallMs: samples[Math.ceil(iterations*.5)-1], p95WallMs: samples[Math.ceil(iterations*.95)-1], meanCpuMs: (cpu.user+cpu.system)/1000/iterations };
  }
  console.log(JSON.stringify({ node: process.version, platform: process.platform, arch: process.arch, note: 'Local Node microbenchmark; warmed process, synthetic RSA-2048, same key, no network; not Cloudflare CPU or P-09.', results }, null, 2));
} finally { rmSync(dir, { recursive: true, force: true }); }
