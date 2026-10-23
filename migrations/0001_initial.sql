PRAGMA foreign_keys = ON;

CREATE TABLE users (
  uid TEXT PRIMARY KEY CHECK (length(uid) BETWEEN 1 AND 128),
  email_verified INTEGER NOT NULL CHECK (email_verified = 1),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TRIGGER users_max_two_insert
BEFORE INSERT ON users
WHEN (SELECT count(*) FROM users) >= 2
BEGIN
  SELECT RAISE(ABORT, 'at most two approved users');
END;

CREATE TABLE profiles (
  uid TEXT PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  revision INTEGER NOT NULL CHECK (revision >= 0),
  locale TEXT NOT NULL CHECK (locale IN ('ro', 'en', 'fr')),
  description_locale TEXT NOT NULL CHECK (description_locale IN ('ro', 'en', 'fr')),
  profile_json TEXT NOT NULL CHECK (
    json_valid(profile_json) AND json_type(profile_json) = 'object'
    AND json_type(profile_json, '$.schemaVersion') IS 'integer'
    AND json_extract(profile_json, '$.schemaVersion') = 1
  ),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE preferences (
  uid TEXT NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  category_id TEXT NOT NULL CHECK (category_id IN ('food', 'culture', 'nature', 'relaxation', 'shopping')),
  subcategory_id TEXT NOT NULL CHECK (length(subcategory_id) BETWEEN 1 AND 128),
  item_id TEXT NOT NULL CHECK (length(item_id) BETWEEN 1 AND 128),
  answer TEXT NOT NULL,
  preference_json TEXT NOT NULL CHECK (json_valid(preference_json) AND json_type(preference_json) = 'object'),
  PRIMARY KEY (uid, category_id, subcategory_id, item_id),
  CHECK (
    (category_id = 'food' AND answer IN ('strong_like', 'eat', 'try', 'avoid')) OR
    (category_id <> 'food' AND answer IN ('strong_like', 'try', 'no_interest', 'hard_no'))
  )
) STRICT;

CREATE TABLE trips (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 1 AND 128),
  version INTEGER NOT NULL CHECK (version >= 0),
  trip_json TEXT NOT NULL CHECK (
    json_valid(trip_json) AND json_type(trip_json) = 'object'
    AND json_type(trip_json, '$.schemaVersion') IS 'integer'
    AND json_extract(trip_json, '$.schemaVersion') = 1
  ),
  itinerary_json TEXT CHECK (
    itinerary_json IS NULL OR (
      json_valid(itinerary_json) AND json_type(itinerary_json) = 'object'
      AND json_type(itinerary_json, '$.schemaVersion') IS 'integer'
      AND json_extract(itinerary_json, '$.schemaVersion') = 1
    )
  ),
  preference_fingerprint TEXT NOT NULL CHECK (length(preference_fingerprint) = 64 AND preference_fingerprint NOT GLOB '*[^0-9a-f]*'),
  last_mutation_nonce TEXT NOT NULL CHECK (length(last_mutation_nonce) BETWEEN 1 AND 128),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE trip_members (
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  uid TEXT NOT NULL REFERENCES users(uid) ON DELETE RESTRICT,
  PRIMARY KEY (trip_id, uid)
) STRICT;

CREATE TRIGGER trip_members_max_two_insert
BEFORE INSERT ON trip_members
WHEN (SELECT count(*) FROM trip_members WHERE trip_id = NEW.trip_id) >= 2
BEGIN
  SELECT RAISE(ABORT, 'at most two members per trip');
END;

CREATE TABLE itinerary_revisions (
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK (version >= 0),
  itinerary_json TEXT NOT NULL CHECK (
    json_valid(itinerary_json) AND json_type(itinerary_json) = 'object'
    AND json_type(itinerary_json, '$.schemaVersion') IS 'integer'
    AND json_extract(itinerary_json, '$.schemaVersion') = 1
  ),
  preference_fingerprint TEXT NOT NULL CHECK (length(preference_fingerprint) = 64 AND preference_fingerprint NOT GLOB '*[^0-9a-f]*'),
  created_by TEXT NOT NULL REFERENCES users(uid) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (trip_id, version),
  FOREIGN KEY (trip_id, created_by) REFERENCES trip_members(trip_id, uid) ON DELETE RESTRICT
) STRICT;

CREATE TABLE proposals (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 1 AND 128),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  base_version INTEGER NOT NULL CHECK (base_version >= 0),
  uid TEXT NOT NULL REFERENCES users(uid) ON DELETE RESTRICT,
  request_json TEXT NOT NULL CHECK (json_valid(request_json) AND json_type(request_json) = 'object'),
  preference_fingerprint TEXT NOT NULL CHECK (length(preference_fingerprint) = 64 AND preference_fingerprint NOT GLOB '*[^0-9a-f]*'),
  immutable_patch_json TEXT NOT NULL CHECK (json_valid(immutable_patch_json) AND json_type(immutable_patch_json) = 'object'),
  patch_hash TEXT NOT NULL CHECK (length(patch_hash) = 64 AND patch_hash NOT GLOB '*[^0-9a-f]*'),
  summary_json TEXT NOT NULL CHECK (json_valid(summary_json) AND json_type(summary_json) = 'object'),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (id, trip_id),
  FOREIGN KEY (trip_id, uid) REFERENCES trip_members(trip_id, uid) ON DELETE RESTRICT
) STRICT;

CREATE TRIGGER proposals_insert_only_update
BEFORE UPDATE ON proposals
BEGIN
  SELECT RAISE(ABORT, 'proposal content is immutable');
END;

CREATE TRIGGER proposals_insert_only_delete
BEFORE DELETE ON proposals
BEGIN
  SELECT RAISE(ABORT, 'proposal content is immutable');
END;

CREATE TABLE generation_jobs (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 1 AND 128),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'partial', 'complete', 'quota_exhausted', 'failed')),
  attempt_id TEXT,
  claim_version INTEGER NOT NULL CHECK (claim_version >= 0),
  lease_token TEXT,
  checkpoint_json TEXT CHECK (checkpoint_json IS NULL OR (json_valid(checkpoint_json) AND json_type(checkpoint_json) IN ('object', 'array', 'text', 'integer', 'real', 'true', 'false', 'null'))),
  stage TEXT NOT NULL CHECK (stage IN ('search', 'organize', 'verify')),
  completed INTEGER NOT NULL CHECK (completed >= 0),
  total INTEGER NOT NULL CHECK (total > 0 AND completed <= total),
  result_trip_version INTEGER CHECK (result_trip_version IS NULL OR result_trip_version >= 0),
  error_code TEXT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK ((attempt_id IS NULL) = (lease_token IS NULL)),
  CHECK (status <> 'running' OR (attempt_id IS NOT NULL AND lease_token IS NOT NULL)),
  CHECK (status <> 'complete' OR (completed = total AND result_trip_version IS NOT NULL))
) STRICT;

CREATE TABLE idempotency_records (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 1 AND 128),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  uid TEXT NOT NULL REFERENCES users(uid) ON DELETE RESTRICT,
  idempotency_key TEXT NOT NULL CHECK (length(idempotency_key) BETWEEN 1 AND 128),
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE RESTRICT,
  revision INTEGER NOT NULL CHECK (revision >= 0),
  apply_nonce TEXT NOT NULL CHECK (length(apply_nonce) BETWEEN 1 AND 128),
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status = 'applied'),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (trip_id, uid, idempotency_key),
  UNIQUE (proposal_id),
  FOREIGN KEY (proposal_id, trip_id) REFERENCES proposals(id, trip_id) ON DELETE RESTRICT,
  FOREIGN KEY (trip_id, uid) REFERENCES trip_members(trip_id, uid) ON DELETE RESTRICT
) STRICT;

CREATE INDEX trip_members_by_uid ON trip_members(uid, trip_id);
CREATE INDEX proposals_by_trip_base ON proposals(trip_id, base_version, created_at);
CREATE INDEX generation_jobs_by_trip_status ON generation_jobs(trip_id, status, updated_at);
