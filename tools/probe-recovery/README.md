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
