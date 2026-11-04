import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFirebaseFixture } from './helpers/probe-fixtures.js';
import { createAuthWorker, createFirebaseVerifier } from '../../probes/auth-worker.js';
import { createSqliteD1 } from './helpers/sqlite-d1.js';

const fixtures: Array<() => void> = [];
afterEach(() => { vi.restoreAllMocks(); fixtures.splice(0).forEach((cleanup) => cleanup()); });

function setup() {
  const certFixture = createFirebaseFixture();
  fixtures.push(certFixture.cleanup);
  let calls = 0;
  const fetchCertificates = async () => {
    calls += 1;
    return new Response(JSON.stringify({ [certFixture.kid]: certFixture.publicCertificate }), {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  };
  const verifier = createFirebaseVerifier({
    projectId: 'probe-project',
    allowedUids: ['uid-alpha', 'uid-beta'],
    fetchCertificates,
  });
  const db = createSqliteD1();
  db.exec(`INSERT INTO users (uid, enabled) VALUES ('uid-alpha', 1), ('uid-beta', 1);
    INSERT INTO trips (id, version, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES ('trip-1', 7, '{}', 'fingerprint-v1', 'nonce-0');
    INSERT INTO trip_members (trip_id, uid) VALUES ('trip-1', 'uid-alpha'), ('trip-1', 'uid-beta');
    INSERT INTO profiles (uid, revision, profile_json) VALUES ('uid-alpha', 1, '{"name":"Alpha"}'), ('uid-beta', 1, '{"name":"Beta"}');`);
  return { certFixture, verifier, db, fetchCount: () => calls };
}

describe('Firebase identity probe', () => {
  it('verifies the RSA signature and all required Firebase claims before returning identity', async () => {
    const { certFixture, verifier } = setup();
    const identity = await verifier(await certFixture.token());
    expect(identity).toEqual({ uid: 'uid-alpha', emailVerified: true });
  });

  it.each([
    ['audience', { aud: 'other-project' }],
    ['issuer', { iss: 'https://securetoken.google.com/other-project' }],
    ['verified email', { email_verified: false }],
    ['auth time', { auth_time: undefined }],
    ['subject', { sub: '' }],
  ])('rejects a token with invalid %s claim', async (_name, claim) => {
    const { certFixture, verifier } = setup();
    await expect(verifier(await certFixture.token(claim))).rejects.toThrow();
  });

  it('rejects a correctly signed but expired token', async () => {
    const { certFixture, verifier } = setup();
    const expired = await certFixture.token({ exp: Math.floor(Date.now() / 1000) - 5 });
    await expect(verifier(expired)).rejects.toThrow();
  });

  it('refreshes Google certificates once for an unknown kid and fails closed', async () => {
    const { certFixture, verifier, fetchCount } = setup();
    await expect(verifier(await certFixture.token({}, 'unknown-kid'))).rejects.toThrow();
    expect(fetchCount()).toBe(2);
  });

  it('limits refreshes for repeated unknown kids until the cooldown expires', async () => {
    const cert = createFirebaseFixture();
    fixtures.push(cert.cleanup);
    let now = Date.now(), fetches = 0;
    const verifier = createFirebaseVerifier({ projectId: 'probe-project', allowedUids: ['uid-alpha', 'uid-beta'], now: () => now,
      fetchCertificates: async () => {
        fetches++;
        return new Response(JSON.stringify({ [cert.kid]: cert.publicCertificate }), { headers: { 'Cache-Control': 'max-age=3600' } });
      } });
    const token = await cert.token({}, 'unknown-kid');
    for (let i = 0; i < 3; i++) await expect(verifier(token)).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(fetches).toBe(2);
    now += 2001;
    await expect(verifier(token)).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(fetches).toBe(3);
  });

  it('fails closed when fetching certificates fails and permits a later retry', async () => {
    const cert = createFirebaseFixture();
    fixtures.push(cert.cleanup);
    let fetches = 0;
    const verifier = createFirebaseVerifier({ projectId: 'probe-project', allowedUids: ['uid-alpha', 'uid-beta'],
      fetchCertificates: async () => {
        fetches++;
        if (fetches === 1) throw new Error('synthetic network failure');
        return new Response(JSON.stringify({ [cert.kid]: cert.publicCertificate }), { headers: { 'Cache-Control': 'max-age=3600' } });
      } });
    const token = await cert.token();
    await expect(verifier(token)).rejects.toMatchObject({ code: 'KEYS_UNAVAILABLE' });
    await expect(verifier(token)).resolves.toMatchObject({ uid: 'uid-alpha' });
    expect(fetches).toBe(2);
  });

  it('rejects missing or non-string key identifiers before requesting certificates', async () => {
    const cert = createFirebaseFixture();
    fixtures.push(cert.cleanup);
    let fetches = 0;
    const verifier = createFirebaseVerifier({ projectId: 'probe-project', allowedUids: ['uid-alpha', 'uid-beta'],
      fetchCertificates: async () => { fetches++; return new Response('{}'); } });
    const parts = (await cert.token()).split('.');
    for (const header of [{ alg: 'RS256' }, { alg: 'RS256', kid: 123 }]) {
      const encoded = Buffer.from(JSON.stringify(header)).toString('base64url');
      await expect(verifier(`${encoded}.${parts[1]}.${parts[2]}`)).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    }
    expect(fetches).toBe(0);
  });

  it('reuses an imported public key within a verifier but starts each new verifier cold', async () => {
    const cert = createFirebaseFixture();
    fixtures.push(cert.cleanup);
    const token = await cert.token();
    const options = { projectId: 'probe-project', allowedUids: ['uid-alpha', 'uid-beta'] as const,
      fetchCertificates: async () => new Response(JSON.stringify({ [cert.kid]: cert.publicCertificate }), { headers: { 'Cache-Control': 'max-age=3600' } }) };
    const importKey = vi.spyOn(crypto.subtle, 'importKey');
    const verifier = createFirebaseVerifier(options);
    await Promise.all([verifier(token), verifier(token)]);
    await verifier(token);
    expect(importKey.mock.calls.filter(([format]) => format === 'spki')).toHaveLength(1);
    await createFirebaseVerifier(options)(token);
    expect(importKey.mock.calls.filter(([format]) => format === 'spki')).toHaveLength(2);
  });

  it('rejects another signing key with the same kid while the public key is cached', async () => {
    const trusted = createFirebaseFixture(), other = createFirebaseFixture();
    fixtures.push(trusted.cleanup, other.cleanup);
    let fetches = 0;
    const verifier = createFirebaseVerifier({ projectId: 'probe-project', allowedUids: ['uid-alpha', 'uid-beta'],
      fetchCertificates: async () => {
        fetches++;
        return new Response(JSON.stringify({ [trusted.kid]: trusted.publicCertificate }), { headers: { 'Cache-Control': 'max-age=3600' } });
      } });
    await expect(verifier(await trusted.token())).resolves.toMatchObject({ uid: 'uid-alpha' });
    await expect(verifier(await other.token())).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(fetches).toBe(1);
  });

  it('retries a failed public key import after concurrent verification attempts fail closed', async () => {
    const cert = createFirebaseFixture();
    fixtures.push(cert.cleanup);
    const token = await cert.token();
    let fetches = 0;
    const verifier = createFirebaseVerifier({ projectId: 'probe-project', allowedUids: ['uid-alpha', 'uid-beta'],
      fetchCertificates: async () => {
        fetches++;
        return new Response(JSON.stringify({ [cert.kid]: cert.publicCertificate }), { headers: { 'Cache-Control': 'max-age=3600' } });
      } });
    const importKey = vi.spyOn(crypto.subtle, 'importKey');
    importKey.mockImplementationOnce(async () => { throw new Error('synthetic import failure'); });
    const results = await Promise.allSettled([verifier(token), verifier(token)]);
    expect(results).toHaveLength(2);
    for (const result of results) {
      expect(result.status).toBe('rejected');
      if (result.status === 'rejected') expect(result.reason).toMatchObject({ code: 'UNAUTHENTICATED' });
    }
    await expect(verifier(token)).resolves.toMatchObject({ uid: 'uid-alpha' });
    expect(importKey.mock.calls.filter(([format]) => format === 'spki')).toHaveLength(2);
    expect(fetches).toBe(1);
  });

  it('uses the replacement certificate after expiry even when the kid is reused', async () => {
    const oldCert = createFirebaseFixture(), newCert = createFirebaseFixture();
    fixtures.push(oldCert.cleanup, newCert.cleanup);
    let now = Date.now();
    let certificate = oldCert.publicCertificate;
    const verifier = createFirebaseVerifier({ projectId: 'probe-project', allowedUids: ['uid-alpha', 'uid-beta'], now: () => now,
      fetchCertificates: async () => new Response(JSON.stringify({ [oldCert.kid]: certificate }), { headers: { 'Cache-Control': 'max-age=1' } }) });
    const oldToken = await oldCert.token(), newToken = await newCert.token();
    await expect(verifier(oldToken)).resolves.toMatchObject({ uid: 'uid-alpha' });
    now += 1001;
    certificate = newCert.publicCertificate;
    await expect(verifier(newToken)).resolves.toMatchObject({ uid: 'uid-alpha' });
    await expect(verifier(oldToken)).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('returns private no-store responses, limits profiles to self, and checks trip membership', async () => {
    const { certFixture, verifier, db } = setup();
    const worker = createAuthWorker({ verifyIdentity: verifier, db });
    const token = await certFixture.token();
    const ownProfile = await worker.fetch(new Request('https://probe.test/probe/profile/uid-alpha', {
      headers: { Authorization: `Bearer ${token}` },
    }));
    expect(ownProfile.status).toBe(200);
    expect(ownProfile.headers.get('Cache-Control')).toBe('private, no-store');
    const otherProfile = await worker.fetch(new Request('https://probe.test/probe/profile/uid-beta', {
      headers: { Authorization: `Bearer ${token}` },
    }));
    expect(otherProfile.status).toBe(403);
    expect(await otherProfile.json()).toMatchObject({ ok: false, error: { code: 'FORBIDDEN' } });
    const ownTrip = await worker.fetch(new Request('https://probe.test/probe/trip/trip-1', {
      headers: { Authorization: `Bearer ${token}` },
    }));
    expect(ownTrip.status).toBe(200);
    const outsiderToken = await certFixture.token({ sub: 'uid-gamma' });
    const outsiderTrip = await worker.fetch(new Request('https://probe.test/probe/trip/trip-1', {
      headers: { Authorization: `Bearer ${outsiderToken}` },
    }));
    expect(outsiderTrip.status).toBe(403);
  });
});
