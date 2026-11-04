import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, utimesSync, chmodSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runAlphaSession } from './cpu-alpha-session.mjs';

const project = 'synthetic-project';
const email = 'synthetic@example.test';
const password = 'synthetic-password-secret';
const token = (changes = {}) => [
  Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'synthetic' })).toString('base64url'),
  Buffer.from(JSON.stringify({ aud: project, iss: `https://securetoken.google.com/${project}`, sub: 'synthetic-uid', email, email_verified: true, iat: Math.floor(Date.now()/1000), auth_time: Math.floor(Date.now()/1000)-60, exp: Math.floor(Date.now()/1000)+3600, ...changes })).toString('base64url'),
  Buffer.from('synthetic-signature').toString('base64url'),
].join('.');
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'alpha-session-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const now = Date.now(), version='synthetic-version', build='a'.repeat(64);
  const config=join(dir,'firebase.json'), manifest=join(dir,'manifest.json'), summary=join(dir,'summary.json'), report=join(dir,'report.json');
  const endpoint='https://synthetic.workers.dev/probe/benchmark';
  writeFileSync(config,JSON.stringify({firebaseProjectId:project,firebaseWebApiKey:'synthetic-key',expectedAlphaUid:'synthetic-uid'}), {mode:0o600});
  writeFileSync(manifest,JSON.stringify({endpoint,buildHash:build,scriptVersionId:version,workloadHash:'e72a2f1d6b21af68ca1860b9dc6528005721f236ead66eaf0cbd9ebdfdab62d9',payloadBytes:262144}));
  writeFileSync(summary,JSON.stringify({status:'RUNNING',telemetryObserved:true,telemetryScriptVersionId:version,captureStartedAt:new Date(now).toISOString(),updatedAt:new Date(now).toISOString(),tailError:false,reconnectObserved:false,parseErrors:0,tailInfo:{overload:0,overloadStop:0},missingCpuEvents:0,invalidWorkloadEvents:0,invalidTraceEvents:0,truncatedEvents:0,exceptionEvents:0,outcomeErrors:0,duplicateRequestIds:0,scriptVersionIds:[version]}));
  utimesSync(summary, new Date(now - 50), new Date(now - 50));
  const env={TRAVEL_BUDDY_ALPHA_EMAIL:email,TRAVEL_BUDDY_ALPHA_PASSWORD:password,TRAVEL_BUDDY_FIREBASE_PUBLIC_CONFIG:config,TRAVEL_BUDDY_PROBE_URL:endpoint,TRAVEL_BUDDY_PROBE_BUILD_HASH:build,TRAVEL_BUDDY_PROBE_MANIFEST:manifest,TRAVEL_BUDDY_CAPTURE_SUMMARY:summary,TRAVEL_BUDDY_PROBE_REPORT:report,HTTPS_PROXY:'http://synthetic-proxy.test:3128',NODE_EXTRA_CA_CERTS:'/synthetic-ca.pem',CODEX_EXEC_SERVER_PROXY_PRIVATE_IPS_VIA_UPSTREAM:'synthetic-guard',FIREBASE_SERVICE_ACCOUNT_JSON:'admin-secret-marker',CLOUDFLARE_API_TOKEN:'cf-secret-marker',TRAVEL_BUDDY_BETA_PASSWORD:'beta-secret-marker'};
  return { env, summary, config, manifest, report, now };
}
const response = (payload={idToken:token(),localId:'synthetic-uid',email}) => new Response(JSON.stringify(payload),{status:200});

test('successful existing-account sign-in passes only the token to the runner', async t => {
  const {env,now}=fixture(t); const idToken=token(); let calls=0, spawned=0, passedEnv;
  const result=await runAlphaSession({env,runnerAvailable:()=>true,now:()=>now,fetcher:async (url,options)=>{calls++; assert.equal(url,'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=synthetic-key'); assert.equal(options.method,'POST'); assert.equal(options.redirect,'error'); assert.deepEqual(JSON.parse(options.body),{email,password,returnSecureToken:true}); return response({idToken,localId:'synthetic-uid',email});},launcher:async (childEnv)=>{spawned++; passedEnv={...childEnv}; return 0;}});
  assert.equal(calls,1); assert.equal(spawned,1); assert.deepEqual(result,{status:'completed',exitCode:0});
  assert.equal(passedEnv.TRAVEL_BUDDY_PROBE_BEARER,idToken); assert.equal(passedEnv.TRAVEL_BUDDY_ALPHA_PASSWORD,undefined); assert.equal(passedEnv.TRAVEL_BUDDY_ALPHA_EMAIL,undefined);
  assert.equal(passedEnv.CODEX_EXEC_SERVER_PROXY_PRIVATE_IPS_VIA_UPSTREAM,'synthetic-guard');
  assert.equal(passedEnv.HTTPS_PROXY,'http://synthetic-proxy.test:3128'); assert.equal(passedEnv.NODE_EXTRA_CA_CERTS,'/synthetic-ca.pem');
  assert.equal(passedEnv.FIREBASE_SERVICE_ACCOUNT_JSON,undefined); assert.equal(passedEnv.CLOUDFLARE_API_TOKEN,undefined); assert.equal(passedEnv.TRAVEL_BUDDY_BETA_PASSWORD,undefined);
  assert.doesNotMatch(JSON.stringify(result),/synthetic-password-secret|synthetic@example\.test|synthetic-signature/);
});


test('invalid configuration or capture blocks before sign-in', async t => {
  const cases = [
    ({config}) => writeFileSync(config, JSON.stringify({firebaseProjectId:project,firebaseWebApiKey:'synthetic-key'})),
    ({summary}) => writeFileSync(summary, JSON.stringify({status:'STOPPED'})),
    ({config}) => chmodSync(config, 0o644),
    ({env}) => { env.TRAVEL_BUDDY_PROBE_URL='https://elsewhere.test/probe/benchmark'; },
    ({report}) => writeFileSync(report, 'existing'),
    ({report}) => symlinkSync('missing-target', report),
  ];
  for (const change of cases) {
    const f=fixture(t); change(f); let calls=0;
    const result=await runAlphaSession({env:f.env,runnerAvailable:()=>true,fetcher:async()=>{calls++; throw Error('unexpected');},launcher:async()=>{throw Error('unexpected');}});
    assert.equal(result.code,'PREFLIGHT_FAILED'); assert.equal(calls,0);
  }
});

test('rejects malformed, unverified or wrong-account responses without launching', async t => {
  const invalid = [
    { idToken:token({email_verified:false}),localId:'synthetic-uid',email },
    { idToken:token({sub:'other'}),localId:'synthetic-uid',email },
    { idToken:token(),localId:'other',email },
    { idToken:token({aud:'other-project'}),localId:'synthetic-uid',email },
    { idToken:token({iss:'https://other.test'}),localId:'synthetic-uid',email },
    { idToken:'malformed',localId:'synthetic-uid',email },
    { idToken:token(),localId:'synthetic-uid',email:'other@example.test' },
  ];
  for (const data of invalid) {
    const f=fixture(t); let spawned=0;
    const result=await runAlphaSession({env:f.env,runnerAvailable:()=>true,fetcher:async()=>response(data),launcher:async()=>{spawned++;return 0;}});
    assert.equal(result.code,'IDENTITY_INVALID'); assert.equal(spawned,0);
    assert.doesNotMatch(JSON.stringify(result),/synthetic-password-secret|synthetic@example\.test|synthetic-signature/);
  }
});

test('sign-in errors, redirects and oversized bodies fail closed without retry or secret output', async t => {
  const cases = [
    async () => { throw Error(`private ${email} ${password} ${token()}`); },
    async () => new Response('private response', {status:400}),
    async () => new Response(null, {status:302,headers:{location:'https://unexpected.test'}}),
    async () => new Response('x'.repeat(65537), {status:200}),
    async () => new Response('invalid json', {status:200}),
  ];
  for (const run of cases) {
    const f=fixture(t); let calls=0, spawned=0;
    const result=await runAlphaSession({env:f.env,runnerAvailable:()=>true,fetcher:async()=>{calls++;return run();},launcher:async()=>{spawned++;return 0;}});
    assert.equal(result.code,'SIGN_IN_FAILED'); assert.equal(calls,1); assert.equal(spawned,0);
    assert.doesNotMatch(JSON.stringify(result),/synthetic-password-secret|synthetic@example\.test|synthetic-signature|private/);
  }
});

test('a capture becoming unhealthy during sign-in prevents dispatch', async t => {
  const f=fixture(t); let spawned=0;
  const result=await runAlphaSession({env:f.env,runnerAvailable:()=>true,fetcher:async()=>{writeFileSync(f.summary,JSON.stringify({status:'STOPPED'})); return response();},launcher:async()=>{spawned++;return 0;}});
  assert.equal(result.code,'PREFLIGHT_FAILED'); assert.equal(spawned,0);
});
