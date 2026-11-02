import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(new URL('../../../migrations/0001_initial.sql', import.meta.url), 'utf8');

describe('initial SQLite migration', () => {
  it('executes in SQLite and enforces JSON, foreign keys, uniqueness, immutable proposals, and two-member caps', () => {
    const db = new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys = ON');
    db.exec(migration);
    const rejected = (sql: string, values: SQLInputValue[] = []) => {
      expect(() => db.prepare(sql).run(...values)).toThrow();
    };

    db.prepare('INSERT INTO users(uid, email_verified) VALUES (?, 1)').run('u-alfa');
    db.prepare('INSERT INTO users(uid, email_verified) VALUES (?, 1)').run('u-beta');
    rejected('INSERT INTO users(uid, email_verified) VALUES (?, 1)', ['u-gamma']);
    db.exec('DROP TRIGGER users_max_two_insert');
    db.prepare('INSERT INTO users(uid, email_verified) VALUES (?, 1)').run('u-gamma');
    db.prepare("INSERT INTO profiles(uid, revision, locale, description_locale, profile_json) VALUES ('u-alfa', 0, 'ro', 'ro', '{\"schemaVersion\":1}')").run();
    rejected("INSERT INTO profiles(uid, revision, locale, description_locale, profile_json) VALUES ('u-beta', 0, 'de', 'ro', '{\"schemaVersion\":1}')");
    rejected("INSERT INTO profiles(uid, revision, locale, description_locale, profile_json) VALUES ('u-gamma', 0, 'ro', 'ro', '{}')");
    rejected("INSERT INTO profiles(uid, revision, locale, description_locale, profile_json) VALUES ('u-gamma', 0, 'ro', 'ro', '{\"schemaVersion\":null}')");

    db.prepare("INSERT INTO trips(id, version, trip_json, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES ('trip-1', 7, '{\"schemaVersion\":1}', NULL, ?, 'nonce-1')").run('a'.repeat(64));
    db.prepare("INSERT INTO trip_members(trip_id, uid) VALUES ('trip-1', 'u-alfa')").run();
    db.prepare("INSERT INTO trip_members(trip_id, uid) VALUES ('trip-1', 'u-beta')").run();
    rejected("INSERT INTO trip_members(trip_id, uid) VALUES ('trip-1', 'u-alfa')");
    rejected("INSERT INTO trip_members(trip_id, uid) VALUES ('trip-1', 'u-gamma')");
    rejected("INSERT INTO trip_members(trip_id, uid) VALUES ('trip-1', 'u-unknown')");
    rejected("INSERT INTO trips(id, version, trip_json, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES ('trip-bad', 0, '{}', NULL, ?, 'n')", ['a'.repeat(64)]);
    rejected("INSERT INTO trips(id, version, trip_json, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES ('trip-missing-version', 0, '{}', NULL, ?, 'n')", ['a'.repeat(64)]);
    rejected("INSERT INTO trips(id, version, trip_json, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES ('trip-null-version', 0, '{\"schemaVersion\":null}', NULL, ?, 'n')", ['a'.repeat(64)]);
    rejected("INSERT INTO trips(id, version, trip_json, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES ('trip-invalid-itinerary', 0, '{\"schemaVersion\":1}', 'not-json', ?, 'n')", ['a'.repeat(64)]);
    rejected("INSERT INTO trips(id, version, trip_json, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES ('trip-missing-itinerary-version', 0, '{\"schemaVersion\":1}', '{}', ?, 'n')", ['a'.repeat(64)]);
    rejected("INSERT INTO trips(id, version, trip_json, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES ('trip-null-itinerary-version', 0, '{\"schemaVersion\":1}', '{\"schemaVersion\":null}', ?, 'n')", ['a'.repeat(64)]);

    db.prepare("INSERT INTO trips(id, version, trip_json, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES ('trip-with-plan', 0, '{\"schemaVersion\":1}', '{\"schemaVersion\":1}', ?, 'n')").run('b'.repeat(64));
    rejected("INSERT INTO itinerary_revisions(trip_id, version, itinerary_json, preference_fingerprint, created_by) VALUES ('trip-with-plan', 0, '{}', ?, 'u-alfa')", ['a'.repeat(64)]);
    rejected("INSERT INTO itinerary_revisions(trip_id, version, itinerary_json, preference_fingerprint, created_by) VALUES ('trip-with-plan', 0, '{\"schemaVersion\":null}', ?, 'u-alfa')", ['a'.repeat(64)]);

    db.prepare("INSERT INTO proposals(id, trip_id, base_version, uid, request_json, preference_fingerprint, immutable_patch_json, patch_hash, summary_json) VALUES ('proposal-1', 'trip-1', 7, 'u-alfa', '{}', ?, '{}', ?, '{}')").run('b'.repeat(64), 'c'.repeat(64));
    rejected("INSERT INTO proposals(id, trip_id, base_version, uid, request_json, preference_fingerprint, immutable_patch_json, patch_hash, summary_json) VALUES ('proposal-outsider', 'trip-1', 7, 'u-gamma', '{}', ?, '{}', ?, '{}')", ['b'.repeat(64), 'c'.repeat(64)]);
    rejected("UPDATE proposals SET immutable_patch_json='{}' WHERE id='proposal-1'");
    rejected("DELETE FROM proposals WHERE id='proposal-1'");

    db.prepare("INSERT INTO idempotency_records(id, trip_id, uid, idempotency_key, proposal_id, revision, apply_nonce) VALUES ('receipt-1', 'trip-1', 'u-alfa', 'cmd-1', 'proposal-1', 8, 'nonce-2')").run();
    rejected("INSERT INTO idempotency_records(id, trip_id, uid, idempotency_key, proposal_id, revision, apply_nonce) VALUES ('receipt-2', 'trip-1', 'u-alfa', 'cmd-2', 'proposal-1', 8, 'nonce-3')");
    rejected("INSERT INTO idempotency_records(id, trip_id, uid, idempotency_key, proposal_id, revision, apply_nonce) VALUES ('receipt-3', 'trip-1', 'u-alfa', 'cmd-1', 'proposal-1', 8, 'nonce-4')");
    db.prepare("INSERT INTO proposals(id, trip_id, base_version, uid, request_json, preference_fingerprint, immutable_patch_json, patch_hash, summary_json) VALUES ('proposal-2', 'trip-1', 7, 'u-beta', '{}', ?, '{}', ?, '{}')").run('d'.repeat(64), 'e'.repeat(64));
    rejected("INSERT INTO idempotency_records(id, trip_id, uid, idempotency_key, proposal_id, revision, apply_nonce) VALUES ('receipt-4', 'trip-1', 'u-alfa', 'cmd-1', 'proposal-2', 8, 'nonce-5')");

    db.prepare("INSERT INTO generation_jobs(id, trip_id, status, claim_version, stage, completed, total, checkpoint_json) VALUES ('job-1', 'trip-1', 'queued', 0, 'search', 0, 3, '{\"cursor\":0}')").run();
    rejected("INSERT INTO generation_jobs(id, trip_id, status, claim_version, stage, completed, total, checkpoint_json) VALUES ('job-bad', 'trip-1', 'queued', -1, 'search', 0, 3, '{}')");
    const cols = (db.prepare('PRAGMA table_info(trips)').all() as Array<{ name: string }>).map((column) => column.name);
    expect(cols).toEqual(expect.arrayContaining(['version', 'trip_json', 'itinerary_json', 'preference_fingerprint', 'last_mutation_nonce']));
    const jobCols = (db.prepare('PRAGMA table_info(generation_jobs)').all() as Array<{ name: string }>).map((column) => column.name);
    expect(jobCols).toEqual(expect.arrayContaining(['attempt_id', 'claim_version', 'lease_token', 'checkpoint_json']));
    db.close();
  });
});
