# Dovezi pentru remedierea locală P-09

Acest index separă verificările locale de proba live P-09. Codul, runnerul și capturarea au trecut verificările locale raportate, dar aceste rezultate nu schimbă verdictul live. P-09 rămâne FAIL, iar B1 și Task 3 rămân blocate.

## Verificarea finală a coordonatorului

La 2026-11-04 au trecut:

- 256/256 teste în 26 de fișiere
- 21/21 teste Node de captură și corelare
- Typecheck și lint
- 6/6 E2E Chromium cu Firebase simulat; Playwright a pornit toate cele trei builduri
- Buildul runnerului esbuild și Wrangler dry-run
- Verificarea guardului CLI: a refuzat să pornească workloadul fără manifest complet, cod de ieșire 2 și stdout gol

Dry-runul a confirmat bindings D1 și Assets, bundle de 842,32 KiB și gzip de 138,11 KiB. Nu a făcut deploy. Logul lint anterior a raportat 186 erori în `probes/server/.local/p09-deploy/console-worker.js`, bundle generat. Sol a revizuit regula ESLint `**/.local/**`; lintul final a trecut după regula și bundle-ul nou. Logul eșuat rămâne păstrat pentru istoric și nu indică defect comportamental.

Manifestul [verificării finale](coordinator-final-verification.json) păstrează data, baza `5b785c8`, comenzile exacte, rezultatele, logurile și hashurile pentru 12 fișiere de cod/test/config folosite la verificare.

## Review și limite TDD

Reviewul Sol a închis CAP01–CAP06 și acoperirea auth fără defecte confirmate deschise. Testul original de cache a produs RED înainte de patch; verificarea GREEN focalizată a trecut 11/11. Reviewul de regresii auth a trecut 13/13, iar cel de securitate 16/16. Cinci teste de securitate au fost adăugate după implementare; ele nu dovedesc retrospectiv TDD complet.

Nu s-a demonstrat un RED comportamental separat pentru fiecare caz nou al corelatorului. `capture-red-correlate.log.txt` arată că testul a eșuat deoarece funcția de corelare strictă încă lipsea, nu pentru un rezultat greșit al join-ului sau percentilelor. RED-uri comportamentale ulterioare există pentru CAP01/CAP02, endpoint, guard, outcome și evenimente târzii. Logurile păstrează ordinea și rezultatul real.

## Profile locale

Profilul Node folosește `process.cpuUsage`, token RSA sintetic și proces local încălzit. Verificatorul rece a măsurat 0,295 ms înainte și 0,302 ms după; cel cald a măsurat 0,150 ms înainte și 0,072 ms după. Profilul a confirmat import repetat X509 pe calea warm înaintea patchului. Compararea JWK a redus costul modest, deci JWK nu a fost ales drept remediere. Aceste măsurători nu indică dacă aceeași cale sau cost apare în CPU Cloudflare.

Profilul workerd/Miniflare a rulat 80 de cereri per scenariu, pentru trip ID-ul `trip-1`, hash alternativ `ab53445aed25d193ea5f85d0515eda15562ef926b43ad7a533b53c0d5dff5630` și 20 de importuri/verificări crypto per cerere. D1 a fost SQLite local. Timpul mediu de perete pentru scenariul complet rece a fost 5,685 ms înainte și 5,541 ms după; cel cald a fost 5,341 ms și apoi 5,068 ms. Scenariile nu au fost împerecheate; ordinea, JIT-ul și zgomotul procesului pot schimba comparația. Nu sunt rezultate CPU Cloudflare și nu sunt workloadul canonic P-09.

Importul/conversia X509 pe calea cold, calculul JSON/UTF-8/SHA-256 și răspunsul/serializarea D1 rămân costuri CPU de măsurat pe platforma Cloudflare. Primele cereri pot avea costuri JIT, dar profilarea locală nu le stabilește pe cele din Cloudflare. Latența fetch către Google/D1 este timp de perete și nu explică singură CPU-ul platformei. Supraîncărcarea/reconectarea tail rămân posibile cauze ale pierderii evenimentelor, însă cauza istorică este necunoscută.

## Index de loguri

- Auth: `auth-cache-red.log.txt`, `auth-cache-green.log.txt`, `auth-review-regressions-green.log.txt`, `auth-review-security-green.log.txt`, `auth-suite.log.txt`
- Profile: `auth-profile-before.json`, `auth-profile-after.json`, `auth-workerd-before.json`, `auth-workerd-after.json` și logurile omonime
- Captură: logurile `capture-red-*`, `capture-green-*`, `coordinator-capture.log.txt` și `coordinator-final-capture.log.txt`
- Coordonator: `coordinator-final-unit.log.txt`, `coordinator-final-types.log.txt`, `coordinator-final-lint.log.txt`, `coordinator-final-lint-green.log.txt`, `coordinator-final-console-e2e.log.txt`, `coordinator-final-dryrun.log.txt`, `coordinator-final-runner-bundle.log.txt`, `coordinator-final-cli-guard.json` și `coordinator-final-verification.json`

## Proba live anterioară

Jurnalul [măsurării CPU din 2 noiembrie](../../../operations/2026-11-02-cpu-rerun.md) documentează 10/100 cereri cold-key-cache cu CPU peste 7 ms și 22 evenimente salvate pentru 201 invocări. Cauza celorlalte 179 evenimente nu este demonstrată. Nu s-a relansat workloadul live în această remediere.

Reviewul și rezultatele locale sunt documentate în [jurnalul operațional P-09](../../../operations/2026-11-03-p09-local-remediation.md). Este necesară o singură aprobare separată pentru un viitor deploy/probe limitată. Pragurile nu s-au schimbat, iar P-09 și B1 nu sunt acceptate.
