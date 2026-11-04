// Synthetic local workerd wall-clock comparison. No network or real identities.
import { generateKeyPairSync, createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { SignJWT } from 'jose';
import { build } from 'esbuild';
import { Miniflare, Log, LogLevel, convertV4MiniflareOptions } from 'miniflare';
const dir = mkdtempSync(join(tmpdir(), 'tb-auth-workerd-'));
let mf;
try {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const key = join(dir, 'key.pem'), certPath = join(dir, 'cert.pem');
  writeFileSync(key, privateKey.export({ type: 'pkcs8', format: 'pem' }));
  execFileSync('openssl', ['req','-new','-x509','-key',key,'-out',certPath,'-subj','/CN=synthetic.test','-days','1'], { stdio: 'ignore' });
  const cert = readFileSync(certPath, 'utf8'), jwk = publicKey.export({ format: 'jwk' });
  const token = await new SignJWT({ aud:'probe-project', iss:'https://securetoken.google.com/probe-project', sub:'uid-alpha', email_verified:true, auth_time:Math.floor(Date.now()/1000)-60 }).setProtectedHeader({alg:'RS256',kid:'synthetic'}).setIssuedAt().setExpirationTime('1h').sign(privateKey);
  const source = `import { importJWK, importX509, jwtVerify } from 'jose';
import { createFirebaseVerifier } from './probes/auth-worker.ts';
import { createBenchmarkWorker } from './probes/cpu-runner.ts';
let warm;
export default { async fetch(request, env) {
 const u = new URL(request.url); const data = JSON.parse(env.DATA);
 if (u.pathname === '/crypto') { for (let i=0;i<20;i++) { const key = u.searchParams.get('type') === 'jwk' ? await importJWK(data.jwk,'RS256') : await importX509(data.cert,'RS256'); await jwtVerify(data.token,key,{algorithms:['RS256'], audience:'probe-project',issuer:'https://securetoken.google.com/probe-project',requiredClaims:['aud','iss','exp','iat','sub']}); } return new Response('ok'); }
 const opts = {projectId:'probe-project',allowedUids:['uid-alpha','uid-beta'],fetchCertificates:async()=>new Response(JSON.stringify({synthetic:data.cert}),{headers:{'Cache-Control':'max-age=3600'}})};
 const verifier = u.searchParams.get('type') === 'cold' ? createFirebaseVerifier(opts) : (warm ??= createFirebaseVerifier(opts));
 return createBenchmarkWorker({verifyIdentity:verifier,verifyIdentityWithKeyCacheState:verifier.verifyWithKeyCacheState,db:env.DB}).fetch(request);
}};`;
  const built = await build({stdin:{contents:source,resolveDir:process.cwd(),sourcefile:'auth-profile-workerd-entry.ts',loader:'ts'},bundle:true,platform:'browser',format:'esm',write:false});
  mf = new Miniflare(convertV4MiniflareOptions({ modules:true, script:built.outputFiles[0].text, compatibilityDate:'2026-10-22', d1Databases:['DB'], bindings:{ DATA:JSON.stringify({cert,jwk,token}) }, log:new Log(LogLevel.NONE) }));
  const db = await mf.getD1Database('DB');
  await db.exec("CREATE TABLE trips (id TEXT PRIMARY KEY, version INTEGER); CREATE TABLE trip_members (trip_id TEXT, uid TEXT); INSERT INTO trips VALUES ('trip-1', 7); INSERT INTO trip_members VALUES ('trip-1', 'uid-alpha');");
  const body = JSON.stringify({tripId:'trip-1',padding:'x'.repeat(262144-('trip-1'.length)-26)});
  const bytes = Buffer.byteLength(body); if (bytes !== 262144) throw new Error(`invalid bytes ${bytes}`);
  const hash = createHash('sha256').update(body).digest('hex');
  async function sample(path, init, count) { const times=[]; for(let i=0;i<count;i++){const start=performance.now();const res=await mf.dispatchFetch(`http://local${path}`,init); if(!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`); await res.arrayBuffer(); times.push(performance.now()-start);} return times; }
  function stats(values) {const a=[...values].sort((x,y)=>x-y);return {n:a.length,meanWallMs:values.reduce((x,y)=>x+y,0)/a.length,p50WallMs:a[Math.ceil(a.length*.5)-1],p95WallMs:a[Math.ceil(a.length*.95)-1],first16MeanWallMs:values.slice(0,16).reduce((x,y)=>x+y,0)/16};}
  const results={};
  for(const type of ['x509','jwk']) results[`crypto20_${type}`]=stats(await sample(`/crypto?type=${type}`,{},80));
  for(const type of ['cold','warm']) results[`full_${type}`]=stats(await sample(`/probe/benchmark?type=${type}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'X-Probe-Path':type,'X-Probe-Workload-SHA256':hash},body},80));
  console.log(JSON.stringify({node:process.version,note:'Local Miniflare/workerd end-to-end wall time, not platform CPU; synthetic token, local SQLite D1, 256 KiB body. Crypto scenarios perform 20 imports and JWT verifies per request. Different ordering, JIT and process noise limit comparisons.',results},null,2));
} finally {if(mf) await mf.dispose(); rmSync(dir,{recursive:true,force:true});}
