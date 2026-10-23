import type { ProbeD1, ProbeD1Statement } from './auth-worker.js';
import type { AppliedReceipt } from '../src/shared/contracts/itinerary.js';
import { parseConfirmProposalRequest } from '../src/shared/contracts/itinerary.js';
import { AuthFailure } from './auth-worker.js';
import type { VerifiedIdentity } from '../src/shared/contracts/auth.js';

export type CasFailureCode = 'FORBIDDEN' | 'VERSION_CONFLICT' | 'PREFERENCES_CHANGED' | 'IDEMPOTENCY_CONFLICT';
export class CasFailure extends Error {
  constructor(readonly code: CasFailureCode) { super(code); }
}

export interface ApplyInput {
  uid: string;
  tripId: string;
  proposalId: string;
  expectedVersion: number;
  idempotencyKey: string;
}

export type ApplyResult = { status: 'applied' | 'already_applied'; receipt: AppliedReceipt };
export interface BatchD1 extends ProbeD1 {
  batch(statements: ProbeD1Statement[]): Promise<Array<{ meta: { changes: number } }>>;
}

function randomNonce(): string {
  return crypto.randomUUID();
}

function parseReceipt(row: Record<string, unknown>): AppliedReceipt {
  return {
    id: String(row.id), tripId: String(row.trip_id), uid: String(row.uid), proposalId: String(row.proposal_id),
    idempotencyKey: String(row.idempotency_key), revision: Number(row.revision), applyNonce: String(row.apply_nonce),
  };
}

const MAX_CONFIRM_BODY_BYTES = 256 * 1024;

async function readConfirmBody(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declared) && declared > MAX_CONFIRM_BODY_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    size += next.value.byteLength;
    if (size > MAX_CONFIRM_BODY_BYTES) { await reader.cancel(); return null; }
    chunks.push(next.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { return ''; }
}

function casError(code: string, status: number, retryable = false): Response {
  return Response.json({ ok: false, error: { code, messageKey: `api.${code.toLowerCase()}`, retryable }, requestId: crypto.randomUUID() }, {
    status, headers: { 'Cache-Control': 'private, no-store' },
  });
}

/** Probe-only HTTP boundary: UID comes from verified token and patch fields are rejected by the frozen contract. */
export function createCasWorker(dependencies: {
  verifyIdentity: (token: string) => Promise<VerifiedIdentity>;
  db: BatchD1;
}): { fetch(request: Request): Promise<Response> } {
  return {
    async fetch(request: Request): Promise<Response> {
      const match = new URL(request.url).pathname.match(/^\/probe\/trip\/([^/]+)\/proposals\/confirm$/);
      if (request.method !== 'POST' || !match) return casError('VALIDATION_ERROR', 400);
      const token = request.headers.get('Authorization')?.match(/^Bearer ([^\s]+)$/)?.[1];
      if (!token) return casError('UNAUTHENTICATED', 401);
      let identity: VerifiedIdentity;
      try { identity = await dependencies.verifyIdentity(token); }
      catch (error) {
        const code = error instanceof AuthFailure ? error.code : 'UNAUTHENTICATED';
        return casError(code, code === 'FORBIDDEN' ? 403 : code === 'KEYS_UNAVAILABLE' ? 503 : 401, code === 'KEYS_UNAVAILABLE');
      }
      const bodyText = await readConfirmBody(request);
      if (bodyText === null) return casError('PAYLOAD_TOO_LARGE', 413);
      let body: unknown;
      try { body = JSON.parse(bodyText); }
      catch { return casError('VALIDATION_ERROR', 400); }
      const parsed = parseConfirmProposalRequest(body);
      if (!parsed.ok) return casError('VALIDATION_ERROR', 400);
      try {
        const result = await applyProposal(dependencies.db, {
          uid: identity.uid,
          tripId: match[1]!,
          proposalId: parsed.data.proposalId,
          expectedVersion: parsed.data.expectedVersion,
          idempotencyKey: parsed.data.idempotencyKey,
        });
        return Response.json({ ok: true, data: result.receipt, requestId: crypto.randomUUID() }, {
          headers: { 'Cache-Control': 'private, no-store' },
        });
      } catch (error) {
        if (error instanceof CasFailure) {
          const status = error.code === 'FORBIDDEN' ? 403 : 409;
          return casError(error.code, status);
        }
        return casError('INTERNAL_ERROR', 500);
      }
    },
  };
}

function validateInput(input: ApplyInput): void {
  if (!input.uid || !input.tripId || !input.proposalId || !input.idempotencyKey ||
      !Number.isSafeInteger(input.expectedVersion) || input.expectedVersion < 0 || input.idempotencyKey.length > 128) {
    throw new CasFailure('VERSION_CONFLICT');
  }
}

/** Test-only spike service. The incoming shape mirrors ConfirmProposalRequest and contains no patch. */
export async function applyProposal(
  db: BatchD1,
  input: ApplyInput,
  createNonce: () => string = randomNonce,
): Promise<ApplyResult> {
  validateInput(input);

  // Authorization precedes both receipt reads so a guessed proposal/key cannot reveal another member's state.
  const member = await db.prepare('SELECT 1 AS member FROM trip_members WHERE trip_id = ? AND uid = ?')
    .bind(input.tripId, input.uid).first();
  if (!member) throw new CasFailure('FORBIDDEN');

  const conflictingKey = await findKeyReceipt(db, input);
  if (conflictingKey) throw new CasFailure('IDEMPOTENCY_CONFLICT');

  const existingProposalReceipt = await db.prepare(`SELECT id, trip_id, uid, proposal_id, idempotency_key, revision, apply_nonce
      FROM idempotency_records WHERE proposal_id = ? AND trip_id = ?`)
    .bind(input.proposalId, input.tripId).first<Record<string, unknown>>();
  if (existingProposalReceipt) return { status: 'already_applied', receipt: parseReceipt(existingProposalReceipt) };

  const proposal = await db.prepare(`SELECT id, trip_id, base_version, preference_fingerprint,
      profile_uid_a, profile_revision_a, profile_uid_b, profile_revision_b
      FROM proposals WHERE id = ? AND trip_id = ?`).bind(input.proposalId, input.tripId).first<Record<string, unknown>>();
  if (!proposal) throw new CasFailure('FORBIDDEN');
  const live = await db.prepare(`SELECT t.version, t.preference_fingerprint,
      EXISTS(SELECT 1 FROM profiles WHERE uid = ? AND revision = ?) AS profile_a_current,
      EXISTS(SELECT 1 FROM profiles WHERE uid = ? AND revision = ?) AS profile_b_current
      FROM trips AS t WHERE t.id = ?`)
    .bind(proposal.profile_uid_a, proposal.profile_revision_a, proposal.profile_uid_b, proposal.profile_revision_b, input.tripId)
    .first<{ version: number; preference_fingerprint: string; profile_a_current: number; profile_b_current: number }>();
  if (!live) throw new CasFailure('FORBIDDEN');
  if (live.preference_fingerprint !== proposal.preference_fingerprint || !live.profile_a_current || !live.profile_b_current) {
    throw new CasFailure('PREFERENCES_CHANGED');
  }
  if (input.expectedVersion !== proposal.base_version || live.version !== proposal.base_version) {
    throw new CasFailure('VERSION_CONFLICT');
  }

  const nonce = createNonce();
  const receiptId = crypto.randomUUID();
  const update = db.prepare(`UPDATE trips
    SET itinerary_json = (SELECT immutable_patch FROM proposals WHERE id = ? AND trip_id = ?),
        version = version + 1,
        last_mutation_nonce = ?
    WHERE id = ?
      AND version = ?
      AND preference_fingerprint = (SELECT preference_fingerprint FROM proposals WHERE id = ? AND trip_id = ?)
      AND EXISTS (SELECT 1 FROM trip_members WHERE trip_id = trips.id AND uid = ?)
      AND EXISTS (SELECT 1 FROM trip_members WHERE trip_id = trips.id AND uid = (SELECT profile_uid_a FROM proposals WHERE id = ?))
      AND EXISTS (SELECT 1 FROM trip_members WHERE trip_id = trips.id AND uid = (SELECT profile_uid_b FROM proposals WHERE id = ?))
      AND EXISTS (
        SELECT 1 FROM proposals AS p
        WHERE p.id = ? AND p.trip_id = trips.id AND p.base_version = ?
          AND p.preference_fingerprint = trips.preference_fingerprint
          AND EXISTS (SELECT 1 FROM profiles WHERE uid = p.profile_uid_a AND revision = p.profile_revision_a)
          AND EXISTS (SELECT 1 FROM profiles WHERE uid = p.profile_uid_b AND revision = p.profile_revision_b)
      )
      AND NOT EXISTS (SELECT 1 FROM idempotency_records WHERE proposal_id = ?)
      AND NOT EXISTS (SELECT 1 FROM idempotency_records WHERE trip_id = trips.id AND uid = ? AND idempotency_key = ?)`)
    .bind(input.proposalId, input.tripId, nonce, input.tripId, input.expectedVersion,
      input.proposalId, input.tripId, input.uid, input.proposalId, input.proposalId,
      input.proposalId, input.expectedVersion, input.proposalId, input.uid, input.idempotencyKey);
  const receipt = db.prepare(`INSERT INTO idempotency_records
      (id, trip_id, uid, proposal_id, idempotency_key, revision, apply_nonce)
    SELECT ?, p.trip_id, ?, p.id, ?, t.version, t.last_mutation_nonce
      FROM proposals AS p JOIN trips AS t ON t.id = p.trip_id
      WHERE p.id = ? AND p.trip_id = ? AND t.version = ? AND t.last_mutation_nonce = ?
        AND EXISTS (SELECT 1 FROM trip_members WHERE trip_id = p.trip_id AND uid = ?)
        AND EXISTS (SELECT 1 FROM trip_members WHERE trip_id = p.trip_id AND uid = p.profile_uid_a)
        AND EXISTS (SELECT 1 FROM trip_members WHERE trip_id = p.trip_id AND uid = p.profile_uid_b)
        AND EXISTS (SELECT 1 FROM profiles WHERE uid = p.profile_uid_a AND revision = p.profile_revision_a)
        AND EXISTS (SELECT 1 FROM profiles WHERE uid = p.profile_uid_b AND revision = p.profile_revision_b)
        AND NOT EXISTS (SELECT 1 FROM idempotency_records WHERE proposal_id = p.id)`)
    .bind(receiptId, input.uid, input.idempotencyKey, input.proposalId, input.tripId,
      input.expectedVersion + 1, nonce, input.uid);
  // D1 batch() rolls back on SQL errors, but a zero-row INSERT ... SELECT is not an error.
  // Force a constraint failure if this exact apply did not leave its receipt, so UPDATE cannot commit alone.
  const assertReceipt = db.prepare(`INSERT INTO idempotency_records
      (id, trip_id, uid, proposal_id, idempotency_key, revision, apply_nonce)
    SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL
    WHERE EXISTS (
      SELECT 1 FROM trips WHERE id = ? AND version = ? AND last_mutation_nonce = ?
    ) AND NOT EXISTS (
      SELECT 1 FROM idempotency_records
      WHERE proposal_id = ? AND trip_id = ? AND uid = ? AND idempotency_key = ?
        AND revision = ? AND apply_nonce = ?
    )`)
    .bind(input.tripId, input.expectedVersion + 1, nonce,
      input.proposalId, input.tripId, input.uid, input.idempotencyKey, input.expectedVersion + 1, nonce);

  let updated: { meta: { changes: number } } | undefined;
  let recorded: { meta: { changes: number } } | undefined;
  try {
    [updated, recorded] = await db.batch([update, receipt, assertReceipt]);
  } catch (error) {
    const retryResult = await lookupReceipt(db, input);
    if (retryResult) return retryResult;
    const conflictingKey = await findKeyReceipt(db, input);
    if (conflictingKey) throw new CasFailure('IDEMPOTENCY_CONFLICT');
    throw error;
  }
  if (updated?.meta.changes !== 1 || recorded?.meta.changes !== 1) {
    // A zero-change result is rechecked for a competing idempotent success before becoming a conflict.
    const retryResult = await lookupReceipt(db, input);
    if (retryResult) return retryResult;
    const conflictingKey = await findKeyReceipt(db, input);
    if (conflictingKey) throw new CasFailure('IDEMPOTENCY_CONFLICT');
    const fresh = await db.prepare(`SELECT t.version, t.preference_fingerprint,
        EXISTS(SELECT 1 FROM profiles WHERE uid = ? AND revision = ?) AS profile_a_current,
        EXISTS(SELECT 1 FROM profiles WHERE uid = ? AND revision = ?) AS profile_b_current
        FROM trips AS t WHERE t.id = ?`)
      .bind(proposal.profile_uid_a, proposal.profile_revision_a, proposal.profile_uid_b, proposal.profile_revision_b, input.tripId)
      .first<{ version: number; preference_fingerprint: string; profile_a_current: number; profile_b_current: number }>();
    if (fresh && (fresh.preference_fingerprint !== proposal.preference_fingerprint || !fresh.profile_a_current || !fresh.profile_b_current)) {
      throw new CasFailure('PREFERENCES_CHANGED');
    }
    throw new CasFailure('VERSION_CONFLICT');
  }
  return {
    status: 'applied',
    receipt: { id: receiptId, tripId: input.tripId, uid: input.uid, proposalId: input.proposalId,
      idempotencyKey: input.idempotencyKey, revision: input.expectedVersion + 1, applyNonce: nonce },
  };
}

async function lookupReceipt(db: BatchD1, input: ApplyInput): Promise<ApplyResult | undefined> {
  const row = await db.prepare(`SELECT id, trip_id, uid, proposal_id, idempotency_key, revision, apply_nonce
      FROM idempotency_records WHERE proposal_id = ? AND trip_id = ?`)
    .bind(input.proposalId, input.tripId).first<Record<string, unknown>>();
  return row ? { status: 'already_applied', receipt: parseReceipt(row) } : undefined;
}

async function findKeyReceipt(db: BatchD1, input: ApplyInput): Promise<Record<string, unknown> | null> {
  const row = await db.prepare(`SELECT proposal_id FROM idempotency_records
      WHERE trip_id = ? AND uid = ? AND idempotency_key = ?`)
    .bind(input.tripId, input.uid, input.idempotencyKey).first<Record<string, unknown>>();
  if (row && row.proposal_id !== input.proposalId) return row;
  return null;
}
