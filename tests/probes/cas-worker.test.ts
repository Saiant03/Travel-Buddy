import { describe, expect, it } from 'vitest';
import { applyProposal, createCasWorker, type ApplyInput } from '../../probes/cas-worker.js';
import { createSqliteD1 } from './helpers/sqlite-d1.js';

function seededDb() {
  const db = createSqliteD1();
  db.exec(`INSERT INTO users (uid, enabled) VALUES ('uid-alpha', 1), ('uid-beta', 1), ('uid-gamma', 0);
    INSERT INTO profiles (uid, revision, profile_json) VALUES ('uid-alpha', 4, '{}'), ('uid-beta', 9, '{}');
    INSERT INTO trips (id, version, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES ('trip-1', 7, '{"days":["old"]}', 'fp-v1', 'nonce-v7');
    INSERT INTO trip_members (trip_id, uid) VALUES ('trip-1', 'uid-alpha'), ('trip-1', 'uid-beta');
    INSERT INTO proposals
      (id, trip_id, base_version, preference_fingerprint, immutable_patch, patch_hash, profile_uid_a, profile_revision_a, profile_uid_b, profile_revision_b)
      VALUES ('proposal-a', 'trip-1', 7, 'fp-v1', '{"days":["proposal-a"]}', 'hash-a', 'uid-alpha', 4, 'uid-beta', 9),
             ('proposal-b', 'trip-1', 7, 'fp-v1', '{"days":["proposal-b"]}', 'hash-b', 'uid-alpha', 4, 'uid-beta', 9);`);
  return db;
}

const input = (overrides: Partial<ApplyInput> = {}): ApplyInput => ({
  uid: 'uid-alpha', tripId: 'trip-1', proposalId: 'proposal-a', expectedVersion: 7,
  idempotencyKey: 'key-a', ...overrides,
});

describe('D1 compare-and-swap proposal probe', () => {
  it('mounts an authenticated strict confirmation endpoint with identity from token and no client patch', async () => {
    const db = seededDb();
    const worker = createCasWorker({ verifyIdentity: async (token) => {
      if (token !== 'signed-test-token') throw new Error('invalid token');
      return { uid: 'uid-alpha', emailVerified: true };
    }, db });
    const send = (body: unknown) => worker.fetch(new Request('https://probe.test/probe/trip/trip-1/proposals/confirm', {
      method: 'POST',
      headers: { Authorization: 'Bearer signed-test-token', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }));

    const spoofed = await send({ proposalId: 'proposal-a', expectedVersion: 7, idempotencyKey: 'key-a', uid: 'uid-gamma' });
    expect(spoofed.status).toBe(400);
    expect(await db.prepare('SELECT version FROM trips').first()).toEqual({ version: 7 });
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 0 });

    const applied = await send({ proposalId: 'proposal-a', expectedVersion: 7, idempotencyKey: 'key-a' });
    expect(applied.status).toBe(200);
    expect(applied.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await applied.json()).toMatchObject({ ok: true, data: { uid: 'uid-alpha', proposalId: 'proposal-a', revision: 8 } });
  });

  it('applies the immutable server proposal once and records a receipt atomically', async () => {
    const db = seededDb();
    const result = await applyProposal(db, input());
    expect(result).toMatchObject({ status: 'applied', receipt: { proposalId: 'proposal-a', revision: 8 } });
    expect(await db.prepare("SELECT version, itinerary_json FROM trips WHERE id='trip-1'").first()).toEqual({
      version: 8, itinerary_json: '{"days":["proposal-a"]}',
    });
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 1 });
  });

  it('returns the same receipt for a retry and rejects reuse of the key for another proposal', async () => {
    const db = seededDb();
    const first = await applyProposal(db, input());
    const retry = await applyProposal(db, input());
    expect(retry).toEqual({ status: 'already_applied', receipt: first.receipt });
    await expect(applyProposal(db, input({ proposalId: 'proposal-b' })))
      .rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
  });

  it('returns a proposal receipt for any new key and either authorized trip member', async () => {
    const db = seededDb();
    const first = await applyProposal(db, input());
    const otherMemberRetry = await applyProposal(db, input({ uid: 'uid-beta', idempotencyKey: 'beta-key' }));
    const newKeyRetry = await applyProposal(db, input({ idempotencyKey: 'another-key' }));
    expect(otherMemberRetry).toEqual({ status: 'already_applied', receipt: first.receipt });
    expect(newKeyRetry).toEqual({ status: 'already_applied', receipt: first.receipt });
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 1 });
  });

  it('returns the single receipt when the same proposal races with two keys', async () => {
    const db = seededDb();
    const outcomes = await Promise.all([
      applyProposal(db, input({ idempotencyKey: 'key-a' })),
      applyProposal(db, input({ idempotencyKey: 'key-race' })),
    ]);
    expect(outcomes.map((result) => result.status).sort()).toEqual(['already_applied', 'applied']);
    expect(outcomes[0]?.receipt).toEqual(outcomes[1]?.receipt);
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 1 });
  });

  it('finds the committed receipt if the D1 batch response times out after commit', async () => {
    const db = seededDb();
    let dropResponse = true;
    const flakyD1 = {
      prepare: db.prepare.bind(db),
      batch: async (statements: Parameters<typeof db.batch>[0]) => {
        const result = await db.batch(statements);
        if (dropResponse) { dropResponse = false; throw new Error('simulated response timeout'); }
        return result;
      },
    };
    const first = await applyProposal(flakyD1, input());
    expect(first.status).toBe('already_applied');
    const retry = await applyProposal(db, input());
    expect(retry).toEqual({ status: 'already_applied', receipt: first.receipt });
    expect(await db.prepare('SELECT version FROM trips').first()).toEqual({ version: 8 });
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 1 });
  });

  it('allows only one winner when two different proposals race on version seven', async () => {
    const db = seededDb();
    // D1 serializes atomic batches per database; this queue gives the SQLite adapter the same batch behavior.
    let previousBatch = Promise.resolve();
    const serializedDb = {
      prepare: db.prepare.bind(db),
      batch: (statements: Parameters<typeof db.batch>[0]) => {
        const current = previousBatch.then(() => db.batch(statements));
        previousBatch = current.then(() => undefined, () => undefined);
        return current;
      },
    };
    const outcomes = await Promise.allSettled([
      applyProposal(serializedDb, input()),
      applyProposal(serializedDb, input({ proposalId: 'proposal-b', idempotencyKey: 'key-b' })),
    ]);
    expect(outcomes.filter((entry) => entry.status === 'fulfilled')).toHaveLength(1);
    expect(outcomes.filter((entry) => entry.status === 'rejected')).toHaveLength(1);
    const rejected = outcomes.find((entry) => entry.status === 'rejected');
    expect(rejected?.status === 'rejected' ? rejected.reason : undefined).toMatchObject({ code: 'VERSION_CONFLICT' });
    expect(await db.prepare('SELECT version FROM trips WHERE id=?').bind('trip-1').first('version')).toBe(8);
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 1 });
  });

  it('maps a losing concurrent proposal confirmation to HTTP 409', async () => {
    const db = seededDb();
    let previousBatch = Promise.resolve();
    const serializedDb = {
      prepare: db.prepare.bind(db),
      batch: (statements: Parameters<typeof db.batch>[0]) => {
        const current = previousBatch.then(() => db.batch(statements));
        previousBatch = current.then(() => undefined, () => undefined);
        return current;
      },
    };
    const worker = createCasWorker({ verifyIdentity: async () => ({ uid: 'uid-alpha', emailVerified: true }), db: serializedDb });
    const send = (proposalId: string, idempotencyKey: string) => worker.fetch(new Request(
      'https://probe.test/probe/trip/trip-1/proposals/confirm', {
        method: 'POST', headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, expectedVersion: 7, idempotencyKey }),
      },
    ));
    const responses = await Promise.all([
      send('proposal-a', 'race-a'), send('proposal-b', 'race-b'),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    const conflict = responses.find((response) => response.status === 409)!;
    expect(await conflict.json()).toMatchObject({ ok: false, error: { code: 'VERSION_CONFLICT' } });
    expect(await db.prepare('SELECT version FROM trips').first()).toEqual({ version: 8 });
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 1 });
  });

  it('rejects a stale v7 write without creating a receipt', async () => {
    const db = seededDb();
    db.exec("UPDATE trips SET version=8 WHERE id='trip-1'");
    await expect(applyProposal(db, input())).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 0 });
  });

  it('rejects changed preference fingerprint without modifying the plan', async () => {
    const db = seededDb();
    db.exec("UPDATE trips SET preference_fingerprint='fp-v2' WHERE id='trip-1'");
    await expect(applyProposal(db, input())).rejects.toMatchObject({ code: 'PREFERENCES_CHANGED' });
    expect(await db.prepare('SELECT version, itinerary_json FROM trips').first()).toEqual({
      version: 7, itinerary_json: '{"days":["old"]}',
    });
  });

  it('rejects a profile revision change without a trip version change', async () => {
    const db = seededDb();
    db.exec("UPDATE profiles SET revision=5 WHERE uid='uid-alpha'");
    await expect(applyProposal(db, input())).rejects.toMatchObject({ code: 'PREFERENCES_CHANGED' });
    expect(await db.prepare('SELECT version FROM trips').first()).toEqual({ version: 7 });
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 0 });
  });

  it('checks membership before looking up a receipt', async () => {
    const db = seededDb();
    await applyProposal(db, input());
    await expect(applyProposal(db, input({ uid: 'uid-gamma' }))).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 1 });
  });

  it('rolls back the trip update when receipt insertion fails inside D1 batch', async () => {
    const db = seededDb();
    db.exec(`CREATE TRIGGER reject_probe_receipt BEFORE INSERT ON idempotency_records
      BEGIN SELECT RAISE(ABORT, 'injected receipt failure'); END;`);
    await expect(applyProposal(db, input())).rejects.toThrow();
    expect(await db.prepare('SELECT version, itinerary_json FROM trips').first()).toEqual({
      version: 7, itinerary_json: '{"days":["old"]}',
    });
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 0 });
  });

  it('rolls back the trip update when a guarded receipt insert silently inserts zero rows', async () => {
    const db = seededDb();
    db.exec(`CREATE TRIGGER ignore_probe_receipt BEFORE INSERT ON idempotency_records
      WHEN NEW.proposal_id = 'proposal-a' BEGIN SELECT RAISE(IGNORE); END;`);
    await expect(applyProposal(db, input())).rejects.toThrow();
    expect(await db.prepare('SELECT version, itinerary_json FROM trips').first()).toEqual({
      version: 7, itinerary_json: '{"days":["old"]}',
    });
    expect(await db.prepare('SELECT COUNT(*) AS count FROM idempotency_records').first()).toEqual({ count: 0 });
  });
});
