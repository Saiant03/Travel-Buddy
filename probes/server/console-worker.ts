import probeWorker from './index.js';
import { CONSOLE_CSP } from '../server-console/security.js';

interface ConsoleEnvironment {
  ASSETS: { fetch(request: Request): Promise<Response> };
  DB: Parameters<typeof probeWorker.fetch>[1]['DB'];
  FIREBASE_PROJECT_ID: string;
  FIREBASE_WEB_API_KEY: string;
  ALLOWED_UID_1: string;
  ALLOWED_UID_2: string;
}

interface ConsoleWorkerDependencies {
  probeFetch?: (request: Request, env: ConsoleEnvironment) => Promise<Response>;
  assetsFetch?: (request: Request, env: ConsoleEnvironment) => Promise<Response>;
}

function isRealPublicConfiguration(env: ConsoleEnvironment): boolean {
  const projectId = env.FIREBASE_PROJECT_ID;
  const apiKey = env.FIREBASE_WEB_API_KEY;
  const uids = [env.ALLOWED_UID_1, env.ALLOWED_UID_2];
  const hasNoPlaceholder = (value: string): boolean => {
    const normalized = value?.trim().toLowerCase() ?? '';
    return normalized.length > 0 && value === value.trim() && !['replace-me', 'placeholder', 'synthetic'].some((marker) => normalized.includes(marker));
  };
  return hasNoPlaceholder(projectId) && /^[a-z0-9](?:[a-z0-9-]{4,28})[a-z0-9]$/.test(projectId) &&
    hasNoPlaceholder(apiKey) && apiKey.length <= 512 &&
    uids.every((uid) => hasNoPlaceholder(uid) && uid.length <= 128 && !/\s/.test(uid)) && uids[0] !== uids[1];
}

export function createConsoleWorker(dependencies: ConsoleWorkerDependencies = {}) {
  const forwardProbe = dependencies.probeFetch ?? ((request, env) => probeWorker.fetch(request, env));
  const serveAsset = dependencies.assetsFetch ?? ((request, env) => env.ASSETS.fetch(request));

  return {
    async fetch(request: Request, environment: ConsoleEnvironment): Promise<Response> {
      const url = new URL(request.url);
      if (request.method === 'GET' && url.pathname === '/probe/public-config') {
        const payload = isRealPublicConfiguration(environment)
          ? { firebaseProjectId: environment.FIREBASE_PROJECT_ID, firebaseWebApiKey: environment.FIREBASE_WEB_API_KEY }
          : { configured: false };
        return Response.json(payload, {
          status: payload.configured === false ? 503 : 200,
          headers: { 'cache-control': 'no-store' },
        });
      }

      if (url.pathname.startsWith('/probe/')) return forwardProbe(request, environment);
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
      const asset = await serveAsset(request, environment);
      const headers = new Headers(asset.headers);
      headers.set('Content-Security-Policy', CONSOLE_CSP);
      headers.set('X-Content-Type-Options', 'nosniff');
      return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers });
    },
  };
}

export default createConsoleWorker();
