PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL CHECK (enabled IN (0, 1))
);

CREATE TABLE IF NOT EXISTS profiles (
  uid TEXT PRIMARY KEY REFERENCES users(uid),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 0),
  profile_json TEXT NOT NULL CHECK (json_valid(profile_json))
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL CHECK (version >= 0),
  itinerary_json TEXT NOT NULL CHECK (json_valid(itinerary_json)),
  preference_fingerprint TEXT NOT NULL,
  last_mutation_nonce TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trip_members (
  trip_id TEXT NOT NULL REFERENCES trips(id),
  uid TEXT NOT NULL REFERENCES users(uid),
  PRIMARY KEY (trip_id, uid),
  UNIQUE (trip_id, uid)
);

CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id),
  base_version INTEGER NOT NULL CHECK (base_version >= 0),
  preference_fingerprint TEXT NOT NULL,
  immutable_patch TEXT NOT NULL CHECK (json_valid(immutable_patch)),
  patch_hash TEXT NOT NULL,
  profile_uid_a TEXT NOT NULL REFERENCES profiles(uid),
  profile_revision_a INTEGER NOT NULL,
  profile_uid_b TEXT NOT NULL REFERENCES profiles(uid),
  profile_revision_b INTEGER NOT NULL,
  UNIQUE (id, trip_id)
);

CREATE TABLE IF NOT EXISTS idempotency_records (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id),
  uid TEXT NOT NULL REFERENCES users(uid),
  proposal_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  revision INTEGER NOT NULL,
  apply_nonce TEXT NOT NULL,
  UNIQUE (proposal_id),
  UNIQUE (trip_id, uid, idempotency_key),
  FOREIGN KEY (proposal_id, trip_id) REFERENCES proposals(id, trip_id)
);
