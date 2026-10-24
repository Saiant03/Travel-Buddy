import { describe, expect, it } from 'vitest';
import { buildProbeSeedSql } from '../../probes/server-console/seed.js';
import { createSqliteD1 } from './helpers/sqlite-d1.js';

describe('probe D1 fixture SQL', () => {
  it('seeds only the two supplied identities and the synthetic CAS/access/CPU fixtures', async () => {
    const db = createSqliteD1();
    db.exec(buildProbeSeedSql('firebase-alpha-uid', 'firebase-beta-uid'));

    expect(await db.prepare('SELECT uid, enabled FROM users ORDER BY uid').all()).toMatchObject({
      results: [
        { uid: 'firebase-alpha-uid', enabled: 1 },
        { uid: 'firebase-beta-uid', enabled: 1 },
      ],
    });
    expect(await db.prepare('SELECT uid, revision FROM profiles ORDER BY uid').all()).toMatchObject({
      results: [
        { uid: 'firebase-alpha-uid', revision: 4 },
        { uid: 'firebase-beta-uid', revision: 9 },
      ],
    });
    expect(await db.prepare('SELECT id, version, preference_fingerprint FROM trips ORDER BY id').all()).toMatchObject({
      results: [
        { id: 'probe-private-trip', version: 7, preference_fingerprint: 'fp-v1' },
        { id: 'probe-trip-1', version: 7, preference_fingerprint: 'fp-v1' },
        { id: 'trip-1', version: 7, preference_fingerprint: 'fp-v1' },
      ],
    });
    expect(await db.prepare('SELECT id, trip_id, base_version, preference_fingerprint FROM proposals ORDER BY id').all()).toMatchObject({
      results: [
        { id: 'proposal-a', trip_id: 'trip-1', base_version: 7, preference_fingerprint: 'fp-v1' },
        { id: 'proposal-b', trip_id: 'trip-1', base_version: 7, preference_fingerprint: 'fp-v1' },
      ],
    });
    expect(await db.prepare("SELECT uid FROM trip_members WHERE trip_id='probe-private-trip' ORDER BY uid").all()).toMatchObject({
      results: [{ uid: 'firebase-alpha-uid' }],
    });
    expect(await db.prepare("SELECT COUNT(*) AS count FROM trip_members WHERE trip_id='trip-1'").first()).toMatchObject({ count: 2 });
    expect(await db.prepare("SELECT COUNT(*) AS count FROM trip_members WHERE trip_id='probe-trip-1'").first()).toMatchObject({ count: 2 });
  });

  it('escapes a quoted Firebase UID as data and does not allow rerunning a seed over existing rows', async () => {
    const db = createSqliteD1();
    const sql = buildProbeSeedSql("alpha' OR 1=1 --", 'beta-uid');
    db.exec(sql);

    expect(await db.prepare('SELECT COUNT(*) AS count FROM users').first()).toMatchObject({ count: 2 });
    expect(await db.prepare('SELECT uid FROM users WHERE uid=?').bind("alpha' OR 1=1 --").first()).toMatchObject({
      uid: "alpha' OR 1=1 --",
    });
    expect(() => db.exec(sql)).toThrow();
    expect(await db.prepare('SELECT COUNT(*) AS count FROM trips').first()).toMatchObject({ count: 3 });
  });

  it.each([
    ['', 'beta-uid'],
    ['alpha-uid', 'alpha-uid'],
    ['a'.repeat(129), 'beta-uid'],
  ])('rejects invalid or duplicate UIDs before producing fixture SQL', (alpha, beta) => {
    expect(() => buildProbeSeedSql(alpha, beta)).toThrow();
  });
});
