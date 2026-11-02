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

## Capture Cloudflare CPU telemetry

Start this listener in a network-enabled terminal before using the probe panel:

```sh
node tools/probe-recovery/cpu-capture.mjs \
  --wrangler-path /workspace/tb-integration/node_modules/.bin/wrangler \
  --config-home /tmp/tb-cpu-wrangler-config \
  --cache-home /tmp/tb-cpu-wrangler-cache \
  --tmp-dir /tmp/tb-cpu-wrangler-tmp
```

The script sets `NODE_USE_ENV_PROXY=1`, starts `wrangler tail travel-buddy-server-probe --format json`, and writes only allowlisted event fields to a private `.local/cpu-<timestamp>/` directory (directory mode 700, files mode 600). It never writes raw tail JSON, headers, request bodies, query strings, or credentials. It records each sanitized event immediately and updates `summary.json`; CPU and wall-time numbers remain exactly as Wrangler reports them, with no unit conversion. Status strings are discarded. A `/probe/public-config` trace can mark telemetry observed only when it includes a finite nonnegative `cpuTime` and string `outcome`; that event is not saved as a benchmark sample.

Wrangler 4.152 rejects `--sampling-rate 1` because its CLI only accepts values strictly between 0 and 1; the capture therefore leaves that filter unset and counts the observed benchmark events.

After the listener is active, sign in with Alpha only and click **Verifică sarcina serverului** once. Do not click access or CAS controls during this capture. The UI starts the existing workload; this script only listens. It stops after 201 benchmark invocations (the first warm invocation is the unmeasured primer, followed by 100 cold and 100 measured warm invocations), on Ctrl+C, or after ten minutes. The summary reports missing metrics, duplicates, hash/size mismatches, truncation and error outcomes. `reviewStatus` stays `NOT_EVALUATED`; a captured set is not a CPU verdict. The reviewer must check Wrangler's metric units and correlate the 201 records before evaluating P-09.

Run the parser and aggregation tests without network access:

```sh
node tools/probe-recovery/cpu-capture.test.mjs
```
