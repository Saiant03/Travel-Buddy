# Travel Buddy server probes (local first)

These files are an isolated spike, not product API code. The automated local probes use synthetic Firebase tokens signed by a newly generated RSA private key, a generated local X.509 certificate, synthetic CPU fixtures, and an in-memory Node 24 SQLite database. Those fixtures test validation and thresholds only; they are not measured results. The SQLite adapter executes the actual migration and SQL statements and wraps `batch()` in a real SQLite transaction. The certificate fetch is injected in tests; tests never call Google or Cloudflare.

Run the local server-side probe suites with:

```sh
npm run test -- tests/probes/auth-worker.test.ts tests/probes/cas-worker.test.ts tests/probes/cpu-runner.test.ts
```

`probes/server/wrangler.toml` contains only a placeholder project, two synthetic UIDs, and an unmistakably local D1 ID. It has no account ID or real database. From the repository root, the local Worker shell can be started with `npx wrangler dev --config probes/server/wrangler.toml`; it cannot authenticate real Firebase users until separately configured. Apply only the synthetic probe migration to Wrangler's local D1 state with `npx wrangler d1 migrations apply travel-buddy-probe-local --local --config probes/server/wrangler.toml`. Do not pass `--remote`.

## Probe behavior

- `GET /probe/profile/:uid` returns only the authenticated user's profile.
- `GET /probe/trip/:tripId` checks membership before reading the trip.
- `POST /probe/benchmark` performs RSA JWT verification, allowlist and membership checks, reads/parses a body capped at 256 KiB, checks its SHA-256, and queries D1. It requires `X-Probe-Path: cold|warm` and `X-Probe-Workload-SHA256`. `cold` creates a fresh verifier with an empty public-key cache for that request; `warm` uses the isolate's shared verifier. The response reports the observed key-cache state in `X-Probe-Key-Cache`. Responses are private/no-store. Logs contain only a generated request ID, sample path, hash and byte count; no token or UID.
- `POST /probe/trip/:tripId/proposals/confirm` is mounted through `createCasWorker()`. Its strict `ConfirmProposalRequest` accepts only `proposalId`, `expectedVersion` and `idempotencyKey`; UID comes from the verified token and any client patch/UID is rejected. Membership is checked before receipt lookup. A reused member key for another proposal conflicts; an existing proposal receipt is returned to any authorized trip member even with a new key. The server loads the immutable proposal, checks the live preference fingerprint and both profile revisions, then executes the guarded trip update and receipt insert in one D1 `batch()`.
- `buildWorkloadPayload()` prepares the exact 256 KiB JSON request. `evaluateCpuEvidence()` accepts only a matching, complete workload hash and at least 100 samples for each path, and uses CPU values supplied by the Cloudflare platform. Local wall-clock and synthetic evidence stay `simulated`; they cannot pass Gate B1.

The CPU dispatcher sends exactly 100 measured requests for each key-cache state, plus one uncounted warm-cache priming request. It records unique Worker request IDs, rejects missing/duplicate IDs and any requested/observed key-cache mismatch, and stops on the first failed response. It returns no CPU duration and cannot observe whether the runtime reused or started an isolate. The evaluator rejects repeated sample indexes/request IDs, malformed/non-number CPU values (including `NaN` and infinities), incorrect byte counts, incomplete sample counts and mismatched workload hashes. Platform-labelled records remain **BLOCKED** by default; the caller must pass `platform-export-reviewed` only after independently reconciling the records with Cloudflare's export and Worker request IDs. That flag is a review marker, not proof: `source`, `environment` and build/workload hashes are caller-supplied claims. A Gate B1 result therefore requires independent reconciliation with the platform export; a local or hand-authored object is not proof of platform CPU.

## Real measurement, reserved for a separate agreement

No Firebase project, Worker, D1 database, account, billing setting or deployment is created by this spike. After separate agreement and only if a no-billing Free setup is available, the operator must provision the real D1 database and Worker, replace the placeholder project ID and exactly two approved UIDs, and store no service-account key. Then apply the probe migration to the approved remote D1, deploy the probe Worker, and build the local dispatcher with `./node_modules/.bin/esbuild probes/server/run-cpu.ts --bundle --platform=node --format=esm --outfile=/tmp/travel-buddy-run-cpu.mjs`. Supply the approved endpoint, verified-member token and source build hash through a secure local secret mechanism as `TRAVEL_BUDDY_PROBE_URL`, `TRAVEL_BUDDY_PROBE_BEARER` and `TRAVEL_BUDDY_PROBE_BUILD_HASH`, then run `node /tmp/travel-buddy-run-cpu.mjs`. It sends 100 cold-key-cache and 100 observed warm-key-cache requests (plus one uncounted warm primer), and writes correlation IDs only. `cold` means the verifier starts with an empty public-key cache; `warm` means the isolate reports a valid cached key set. The dispatcher cannot confirm actual isolate cold starts, and Worker platform CPU records must still be collected and correlated. Join each record to one unique request ID and check the build hash, exact workload SHA-256, 256 KiB body length, observed key-cache state and platform environment. Independently verify the export origin because the evaluator checks structure and consistency, not provenance. If the platform cannot identify/correlate CPU values reliably, report P-09 as **BLOCKED**. Do not substitute `performance.now()`, local `wrangler dev`, wall-clock latency, or a hand-entered synthetic CPU value. Measure unknown-`kid` refresh separately using a malformed-signature JWT with an unknown `kid`; expect one bounded refresh and authentication failure. Stop if setup would require billing.

Future command outline only (not run):

```sh
npx wrangler d1 create travel-buddy-probe
# Add the returned binding/database ID to the reviewed probe config.
npx wrangler d1 migrations apply travel-buddy-probe --remote --config probes/server/wrangler.toml
npx wrangler deploy --config probes/server/wrangler.toml
npx wrangler tail travel-buddy-probe-local --format json
```

Those commands can create remote resources or deploy code. They require a separate agreement and must not be run as part of the local probe.
