function sqlText(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function validateUid(uid: string): void {
  if (typeof uid !== 'string' || uid.length === 0 || uid.length > 128) {
    throw new Error('probe_seed_invalid_uid');
  }
}

/** Build insert-only synthetic D1 fixtures for an explicitly isolated probe database. */
export function buildProbeSeedSql(alphaUid: string, betaUid: string): string {
  validateUid(alphaUid);
  validateUid(betaUid);
  if (alphaUid === betaUid) throw new Error('probe_seed_duplicate_uid');

  const alpha = sqlText(alphaUid);
  const beta = sqlText(betaUid);
  return `
INSERT INTO users (uid, enabled) VALUES (${alpha}, 1), (${beta}, 1);
INSERT INTO profiles (uid, revision, profile_json) VALUES
  (${alpha}, 4, '{"name":"Alpha"}'),
  (${beta}, 9, '{"name":"Beta"}');
INSERT INTO trips (id, version, itinerary_json, preference_fingerprint, last_mutation_nonce) VALUES
  ('trip-1', 7, '{"days":["old"]}', 'fp-v1', 'nonce-v7'),
  ('probe-trip-1', 7, '{"days":["CPU probe fixture"]}', 'fp-v1', 'nonce-cpu-v7'),
  ('probe-private-trip', 7, '{"days":["private fixture"]}', 'fp-v1', 'nonce-private-v7');
INSERT INTO trip_members (trip_id, uid) VALUES
  ('trip-1', ${alpha}), ('trip-1', ${beta}),
  ('probe-trip-1', ${alpha}), ('probe-trip-1', ${beta}),
  ('probe-private-trip', ${alpha});
INSERT INTO proposals (
  id, trip_id, base_version, preference_fingerprint, immutable_patch, patch_hash,
  profile_uid_a, profile_revision_a, profile_uid_b, profile_revision_b
) VALUES
  ('proposal-a', 'trip-1', 7, 'fp-v1', '{"days":["proposal-a"]}', 'hash-a', ${alpha}, 4, ${beta}, 9),
  ('proposal-b', 'trip-1', 7, 'fp-v1', '{"days":["proposal-b"]}', 'hash-b', ${alpha}, 4, ${beta}, 9);
`;
}
