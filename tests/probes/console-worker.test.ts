import { describe, expect, it, vi } from 'vitest';
import { createConsoleWorker } from '../../probes/server/console-worker.js';

describe('server probe console shell', () => {
  it('returns only public Firebase web configuration when explicitly configured', async () => {
    const worker = createConsoleWorker({
      probeFetch: vi.fn(),
      assetsFetch: vi.fn(),
    });
    const response = await worker.fetch(new Request('https://probe.example/probe/public-config'), {
      FIREBASE_PROJECT_ID: 'travel-buddy-test',
      FIREBASE_WEB_API_KEY: 'AIza-public-web-config',
      ALLOWED_UID_1: 'uid-alpha',
      ALLOWED_UID_2: 'uid-beta',
      DB: {} as never,
      ASSETS: {} as never,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ firebaseProjectId: 'travel-buddy-test', firebaseWebApiKey: 'AIza-public-web-config' });
  });

  it.each([
    ['malformed project ID', 'not a real project', 'AIza-public-web-config', 'uid-alpha', 'uid-beta'],
    ['reused account UID', 'travel-buddy-test', 'AIza-public-web-config', 'uid-alpha', 'uid-alpha'],
  ])('fails closed for %s without exposing environment values', async (_name, projectId, apiKey, uid1, uid2) => {
    const worker = createConsoleWorker({ probeFetch: vi.fn(), assetsFetch: vi.fn() });
    const response = await worker.fetch(new Request('https://probe.example/probe/public-config'), {
      FIREBASE_PROJECT_ID: projectId, FIREBASE_WEB_API_KEY: apiKey, ALLOWED_UID_1: uid1, ALLOWED_UID_2: uid2,
      DB: {} as never, ASSETS: {} as never,
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ configured: false });
  });

  it('fails closed when runtime configuration variables are absent', async () => {
    const worker = createConsoleWorker({ probeFetch: vi.fn(), assetsFetch: vi.fn() });
    const response = await worker.fetch(new Request('https://probe.example/probe/public-config'), { DB: {} as never, ASSETS: {} as never } as never);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ configured: false });
  });

  it('hides blank or placeholder configuration without exposing environment values', async () => {
    const worker = createConsoleWorker({ probeFetch: vi.fn(), assetsFetch: vi.fn() });
    const response = await worker.fetch(new Request('https://probe.example/probe/public-config'), {
      FIREBASE_PROJECT_ID: 'travel-buddy-local-probe.invalid',
      FIREBASE_WEB_API_KEY: '',
      ALLOWED_UID_1: 'synthetic-uid-alpha',
      ALLOWED_UID_2: 'synthetic-uid-beta',
      DB: {} as never,
      ASSETS: {} as never,
    });

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ configured: false });
  });

  it('forwards probe routes to the existing probe handler and serves other GETs from same-origin assets', async () => {
    const probeResponse = new Response('probe response', { status: 418 });
    const assetResponse = new Response('asset response');
    const probeFetch = vi.fn(async () => probeResponse);
    const assetsFetch = vi.fn(async () => assetResponse);
    const worker = createConsoleWorker({ probeFetch, assetsFetch });
    const env = { FIREBASE_PROJECT_ID: 'travel-buddy-test', FIREBASE_WEB_API_KEY: 'AIza-public-web-config', ALLOWED_UID_1: 'uid-alpha', ALLOWED_UID_2: 'uid-beta', DB: {} as never, ASSETS: {} as never };

    expect(await worker.fetch(new Request('https://probe.example/probe/profile/alpha'), env)).toBe(probeResponse);
    expect(probeFetch).toHaveBeenCalledOnce();
    expect(assetsFetch).not.toHaveBeenCalled();
    const shellResponse = await worker.fetch(new Request('https://probe.example/'), env);
    expect(shellResponse.status).toBe(200);
    expect(shellResponse.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
    expect(shellResponse.headers.get('x-content-type-options')).toBe('nosniff');
    expect(assetsFetch).toHaveBeenCalledOnce();
  });

  it('serves static assets for HEAD without serving probe routes as assets', async () => {
    const assetsFetch = vi.fn(async () => new Response(null, { status: 200 }));
    const probeFetch = vi.fn();
    const worker = createConsoleWorker({ probeFetch, assetsFetch });
    const response = await worker.fetch(new Request('https://probe.example/', { method: 'HEAD' }), {} as never);

    expect(response.status).toBe(200);
    expect(assetsFetch).toHaveBeenCalledOnce();
    expect(probeFetch).not.toHaveBeenCalled();
  });

  it('does not send non-GET shell requests to static assets', async () => {
    const assetsFetch = vi.fn();
    const worker = createConsoleWorker({ probeFetch: vi.fn(), assetsFetch });
    const response = await worker.fetch(new Request('https://probe.example/', { method: 'POST' }), {} as never);

    expect(response.status).toBe(405);
    expect(assetsFetch).not.toHaveBeenCalled();
  });
});
