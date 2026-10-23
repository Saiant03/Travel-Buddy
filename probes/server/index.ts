import { createAuthWorker, createFirebaseVerifier } from '../auth-worker.js';
import { createCasWorker, type BatchD1 } from '../cas-worker.js';
import { createBenchmarkWorker } from '../cpu-runner.js';

interface ProbeEnv {
  DB: BatchD1;
  FIREBASE_PROJECT_ID: string;
  ALLOWED_UID_1: string;
  ALLOWED_UID_2: string;
}

const verifierCache = new Map<string, ReturnType<typeof createFirebaseVerifier>>();

function verifierFor(env: ProbeEnv, forceColdKeyCache = false): ReturnType<typeof createFirebaseVerifier> {
  const cacheKey = `${env.FIREBASE_PROJECT_ID}\u0000${env.ALLOWED_UID_1}\u0000${env.ALLOWED_UID_2}`;
  if (forceColdKeyCache) {
    return createFirebaseVerifier({ projectId: env.FIREBASE_PROJECT_ID, allowedUids: [env.ALLOWED_UID_1, env.ALLOWED_UID_2] });
  }
  let verifier = verifierCache.get(cacheKey);
  if (!verifier) {
    verifier = createFirebaseVerifier({
      projectId: env.FIREBASE_PROJECT_ID,
      allowedUids: [env.ALLOWED_UID_1, env.ALLOWED_UID_2],
    });
    verifierCache.set(cacheKey, verifier);
  }
  return verifier;
}

export default {
  async fetch(request: Request, environment: ProbeEnv): Promise<Response> {
    const benchmarkRequest = new URL(request.url).pathname === '/probe/benchmark';
    const forceColdKeyCache = benchmarkRequest && request.headers.get('X-Probe-Path') === 'cold';
    const verifyIdentity = verifierFor(environment, forceColdKeyCache);
    if (new URL(request.url).pathname.match(/^\/probe\/trip\/[^/]+\/proposals\/confirm$/)) {
      return createCasWorker({ verifyIdentity, db: environment.DB }).fetch(request);
    }
    if (new URL(request.url).pathname === '/probe/benchmark') {
      return createBenchmarkWorker({ verifyIdentity, verifyIdentityWithKeyCacheState: verifyIdentity.verifyWithKeyCacheState, db: environment.DB }).fetch(request);
    }
    return createAuthWorker({ verifyIdentity, db: environment.DB }).fetch(request);
  },
};
