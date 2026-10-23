import { afterEach, describe, expect, it } from 'vitest';
import { createFirebaseFixture } from './helpers/probe-fixtures.js';
import { createAuthWorker, createFirebaseVerifier } from '../../probes/auth-worker.js';
import { createSqliteD1 } from './helpers/sqlite-d1.js';

const fixtures: Array<() => void> = [];
afterEach(() => fixtures.splice(0).forEach((cleanup) => cleanup()));

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
