# Probe login fetch regression

The probe frontend stores the native `fetch` function and later invokes it as a class method. Chromium rejects that call because it binds the class instance as the receiver. The patcher changes only the default branch to `fetch.bind(globalThis)`; an injected fetch function stays unchanged.

`patch-fetch-binding.mjs` requires explicit input and output paths. It verifies the original bundle SHA-256 and requires one exact marker before writing a separate patched bundle. It refuses changed or ambiguous bundles.

`login-browser-regression.py` runs the real bundle in headless Chromium. It intercepts every request, serves the app config locally, stubs Firebase responses, and aborts all unexpected requests. It uses only synthetic values; no real account credentials or Firebase requests are used.

Run with paths to the recovered original bundle and the temporary patched output:

```sh
node tools/probe-recovery/patch-fetch-binding.mjs \
  --input /path/to/original-client-bundle.js \
  --output /tmp/travel-buddy-client-fixed.js

python3 tools/probe-recovery/login-browser-regression.py \
  --mode original \
  --original-bundle /path/to/original-client-bundle.js \
  --patched-bundle /tmp/travel-buddy-client-fixed.js

python3 tools/probe-recovery/login-browser-regression.py \
  --mode patched \
  --original-bundle /path/to/original-client-bundle.js \
  --patched-bundle /tmp/travel-buddy-client-fixed.js
```

The original-mode regression should fail at the assertion that the sign-in request reached its local stub. It passes if the original bundle is already corrected. Patched mode checks invalid credentials, successful unverified and verified sign-in, and the probe's existing button gating. These scripts only create a local bundle; they do not deploy it.

## CPU capture and offline correlation

These commands describe a future explicitly authorized run; they do not grant that authorization. The local tests below do not connect to Cloudflare. Set all paths and the Worker name explicitly; use a new private directory and a new report path for each run. The manifest is prepared independently from the deployment/build evidence and must contain the build hash **and** the deployed script version ID, which are different identifiers:

```json
{"buildHash":"<40-64 lowercase hex characters>","scriptVersionId":"<deployed-version-id>","workloadHash":"e72a2f1d6b21af68ca1860b9dc6528005721f236ead66eaf0cbd9ebdfdab62d9","payloadBytes":262144,"endpoint":"https://<verified-worker-host>/probe/benchmark"}
```

Prepare the runner locally using the installed bundler (no package download):

```sh
cd /workspace/Travel-Buddy
mkdir -p -m 700 .local/p09
./node_modules/.bin/esbuild probes/server/run-cpu.ts --platform=node --bundle --format=esm --outfile=.local/p09/run-cpu.mjs
```

Start the capture with explicit paths. The output directory must not already exist; its parent must exist. It and its sanitized files are private. `--report` must name the same new report file supplied to the runner:

```sh
node /workspace/Travel-Buddy/tools/probe-recovery/cpu-capture.mjs \
  --wrangler-path /workspace/Travel-Buddy/node_modules/.bin/wrangler \
  --script <explicit-worker-name> \
  --report /workspace/Travel-Buddy/.local/p09/dispatch.json \
  --output-dir /workspace/Travel-Buddy/.local/p09/capture
```

The capture starts Wrangler JSON tail without a sampling filter. Wrangler 4.152 accepts a sampling filter only strictly between zero and one. Its JSON mode does not emit the pretty-mode connection-ready message: a `RUNNING` summary alone does not establish readiness. Before dispatch, an explicitly authorized public-config diagnostic must appear in the capture summary as `telemetryObserved: true`, with `telemetryScriptVersionId` matching the independently prepared manifest. This observation establishes that one diagnostic reached the collector; it does not prove that every later event will arrive. Overload notifications, reconnect warnings, parser errors, invalid events and early termination are retained as sanitized indicators and block evaluation. No raw log, URL query, header, body or credential is stored. Wrangler can reconnect silently in circumstances not surfaced as a recognized warning; missing IDs are therefore checked independently.

Only after the diagnostic and when separately authorized, launch the runner with environment variables supplied securely, including:

- `TRAVEL_BUDDY_PROBE_URL`: explicit HTTPS `/probe/benchmark` endpoint, without credentials or query parameters; it must exactly match the independently verified endpoint in the manifest.
- `TRAVEL_BUDDY_PROBE_BEARER`: authorized token, supplied without storing it in the report or shell history.
- `TRAVEL_BUDDY_PROBE_BUILD_HASH`: the build hash in the manifest.
- `TRAVEL_BUDDY_PROBE_MANIFEST`: absolute path to the independently prepared manifest.
- `TRAVEL_BUDDY_CAPTURE_SUMMARY`: `/workspace/Travel-Buddy/.local/p09/capture/summary.json`.
- `TRAVEL_BUDDY_PROBE_REPORT`: `/workspace/Travel-Buddy/.local/p09/dispatch.json`, which must not already exist.

Run `node /workspace/Travel-Buddy/.local/p09/run-cpu.mjs`. The runner now defaults to one request at a time (previously cold used up to 16 concurrently); this reduces bursts and bounds in-flight requests during a stop. The request count, 256 KiB payload and cold definition are unchanged. This scheduling difference prevents attributing changes in future CPU results to the cache change alone. The CLI sends up to one warm primer and 100 requests for each path. It checks the current capture status before and during dispatch, aborts on failure, and writes an incremental private report containing IDs and metadata only. The collector stops after all 201 distinct report IDs are observed, on a failure, on Ctrl+C, or at the ten-minute limit. Extra and duplicate events never satisfy the report-ID condition. An early stop or failure exits nonzero. The report and capture remain evidence for review, not proof that P-09 passed.

After capture, correlate only locally:

```sh
node /workspace/Travel-Buddy/tools/probe-recovery/cpu-correlate.mjs \
  /workspace/Travel-Buddy/.local/p09/dispatch.json \
  /workspace/Travel-Buddy/.local/p09/capture/sanitized-events.jsonl \
  /workspace/Travel-Buddy/.local/p09/capture/summary.json \
  /workspace/Travel-Buddy/.local/p09/manifest.json
```

The correlator requires the explicit primer ID and exactly 100 uniquely indexed cold and warm response IDs, matches every sanitized event by ID, validates the independent build/version link and workload, and refuses incomplete or damaged input without reporting percentiles. A complete result is `review_required`, including whether the numerical criteria are met; it never grants a PASS automatically. Old reports without a primer cannot certify a complete capture. The cold label indicates an empty verification-key cache, not an observed new isolate. CPU values are milliseconds; workerd's serializer divides by `kj::MILLISECONDS` ([source](https://github.com/cloudflare/workerd/blob/881395c11579c312b0457f987e884369c30e9f84/src/workerd/api/trace.c%2B%2B#L207-L226)).

Offline checks:

```sh
node --test tools/probe-recovery/cpu-capture.test.mjs tools/probe-recovery/cpu-correlate.test.mjs
npx vitest run tests/probes/cpu-runner.test.ts
```

### Existing Alpha session for an authorized capture

The optional local helper signs in an existing Alpha account once, then passes its ID token directly in memory to the trusted `.local/p09/run-cpu.mjs` child. Prepare that bundled runner first. Supply the same endpoint, build hash, manifest, fresh capture summary, and new private report path listed above. The capture must already be healthy and have observed the authorized diagnostic; the helper checks again after sign-in, and the child continues checking during dispatch. This helper never starts the collector or performs the diagnostic.

Place the independently verified Firebase project ID, public Web API key, and expected Alpha UID in a JSON file with mode `600` in a private directory with mode `700`:

```json
{"firebaseProjectId":"<verified-project-id>","firebaseWebApiKey":"<web-api-key>","expectedAlphaUid":"<verified-alpha-uid>"}
```

Provide its absolute path as `TRAVEL_BUDDY_FIREBASE_PUBLIC_CONFIG`. Provide `TRAVEL_BUDDY_ALPHA_EMAIL` and `TRAVEL_BUDDY_ALPHA_PASSWORD` through a private environment mechanism, never in chat, shell history, files or command arguments. Then run:

```sh
node /workspace/Travel-Buddy/tools/probe-recovery/cpu-alpha-session.mjs
```

The child receives only the probe endpoint, build, manifest, report and capture-summary variables, its ID token, and the explicitly allowed PATH, proxy, CA and runtime network guard variables. Alpha/Beta credentials and administrative secrets are not forwarded.

The helper only calls Google's HTTPS `accounts:signInWithPassword` endpoint, with a bounded timeout and response, no redirects and no retry. Its output contains only a fixed result code or the child exit code; the child writes its normal private metadata report. The helper checks the response and token claims, including the independently supplied UID, but does not cryptographically verify the token; the Worker verifies its signature, Firebase claims, allowlist and membership on each invocation. A successful local check is not a P-09 result. Do not retry a live run without the applicable authorization.

The following test is offline and uses only synthetic credentials and stubbed responses:

```sh
node --test tools/probe-recovery/cpu-alpha-session.test.mjs
```
