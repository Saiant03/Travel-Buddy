# Diagnoza și remedierea locală P-09

Acest jurnal separă rezultatele locale de proba live P-09 și descrie ce ar necesita o singură aprobare viitoare. Nicio măsurare CPU live sau deploy nu a fost pornit în această lucrare. P-09 rămâne FAIL, iar B1 și Task 3 rămân blocate.

## Baza și accesul numai în citire

La începutul lucrului, coordonatorul sincronizase `main` la `5b785c8`; arborele era curat. Preflight-ul administrativ din **2026-11-03** a primit HTTP 200 pentru lista și setările Worker-elor Cloudflare, metadata D1 și configurația Firebase OAuth/Auth. Worker-ul probei este prezent. Preflight-ul a observat `observability=null` și `tailConsumers=0`; aceste valori nu dovedesc de ce lipseau evenimentele din captura precedentă. Fetch-ul Git din **2026-11-04** a confirmat că `main` rămâne la `5b785c8`. Astăzi nu s-au făcut apeluri API Cloudflare sau Firebase.

În același preflight din 2026-11-03, GET-ul către sursa deploymentului și endpointul content v2 au primit HTTP 200. Sursa publicată conține marcajele X509/importX509, forțarea cache-ului gol și workloadul. GET-ul către ruta greșită `/content` a răspuns 405; rezultatul indică o rută diagnostică greșită, nu o defecțiune a serviciului. Endpointul subscriptions a răspuns 403; acesta nu verifică planul Free sau cota rămasă. Nu s-a repetat setup-ul și nu s-au modificat Worker, D1, Firebase, conturi ori fixture-uri. Jurnalul nu conține secrete.

## Rezultatele locale

Patchul auth păstrează CryptoKey-ul per set de certificate până la expirarea lui, unește importurile concurente și păstrează încercarea limitată după refresh. Reviewul a confirmat că verificările JWT și comportamentul fail-closed rămân. Profilul Node local, calculat cu `process.cpuUsage`, măsoară verificatorul rece la 0,295 ms înainte și 0,302 ms după; verificatorul cald a măsurat 0,150 ms înainte și 0,072 ms după. Profilul rece nu s-a îmbunătățit în această microprobă. Aceste valori sunt CPU local Node, nu CPU Cloudflare și nu explică rezultatul P-09.

Profilarea workerd/Miniflare locală a folosit 80 de cereri în fiecare scenariu, trip ID-ul `trip-1`, hashul alternativ `ab53445aed25d193ea5f85d0515eda15562ef926b43ad7a533b53c0d5dff5630` și 20 de importuri/verificări crypto per cerere. Timpul de perete mediu pentru scenariul complet rece a fost 5,685 ms înainte și 5,541 ms după; cel cald a fost 5,341 ms și apoi 5,068 ms. Scenariile nu au fost împerecheate, ordinea/JIT-ul/procesul pot influența comparația, iar D1 a fost SQLite local. Aceasta nu este proba P-09: nu măsoară CPU Cloudflare și nu folosește 100 + 100 cereri cu hashul workloadului canonic.

Profilarea locală a confirmat că verificatorul warm importa repetat cheia X509 înaintea patchului; această optimizare locală nu demonstrează cauza p95 CPU Cloudflare. Importul/conversia X509 pe calea rece, procesarea JSON/UTF-8/SHA-256 și răspunsul/serializarea D1 pot contribui la CPU, dar profilul local nu stabilește contribuția lor pe platforma Cloudflare. Primele cereri pot avea costuri JIT, însă nu există dovadă că JIT explică evenimentele CPU observate. Latența fetch către Google sau D1 este timp de perete și nu explică singură CPU-ul platformei. Supraîncărcarea/reconectarea tail ar putea explica pierderi de captură, dar cauza istorică rămâne necunoscută. Tail a păstrat 22 de evenimente pentru 201 invocări (primer + 200 cereri), fără explicație demonstrată pentru cele 179 de evenimente absente.

Patchul de captură identifică primerul explicit, unește toate cele 201 invocări după ID unic, păstrează separat `scriptVersionId` și `buildHash`, adaugă diagnostic readiness și verificări de integritate și nu calculează percentile din capturi incomplete. Toate cele 100 de cereri cold se trimit serial. Limita implicită de concurență a scăzut de la 16 la 1. Aceasta limitează burstul; nu dovedește o îmbunătățire CPU Cloudflare.

Reviewul Sol a închis CAP01–CAP06 și reviewul auth fără defecte confirmate deschise. Cinci teste noi de securitate au trecut după patch; acestea nu demonstrează retrospectiv că fiecare test a precedat implementarea. Testul inițial de cache are dovadă RED reală. La 2026-11-04, coordonatorul a raportat 256/256 teste în 26 fișiere, 21/21 teste Node de captură/corelare, typecheck și 6/6 E2E Chromium cu Firebase simulat; E2E a pornit toate cele trei builduri. Lint a raportat 186 erori numai în fișierul generat `.local/p09-deploy/console-worker.js`. Ignore-ul ESLint `**/.local/**` a fost revizuit de Sol, iar lintul autorului a trecut. Reverificarea finală a coordonatorului a trecut lintul după noul bundle; logul eșuat anterior se păstrează ca problemă de lint pe artefact generat, nu ca defect comportamental.

## Comenzi locale verificate

Aceste comenzi compilează și verifică local. Wrangler dry-run nu publică Workerul.

```bash
npm run build:server-probe
```

```bash
./node_modules/.bin/esbuild probes/server/run-cpu.ts --bundle --platform=node --format=esm --outfile=/workspace/Travel-Buddy/.local/p09/run-cpu.mjs
```

```bash
WRANGLER_SEND_METRICS=false NODE_USE_ENV_PROXY=1 ./node_modules/.bin/wrangler deploy --config probes/server/wrangler.console.toml --dry-run --outdir /workspace/Travel-Buddy/.local/p09-deploy-final --keep-vars
```

Dry-runul final a trecut. Wrangler a raportat bindings D1 și Assets, bundle 842,32 KiB și 138,11 KiB gzip. Comanda nu a făcut deploy. Snapshotul comenzilor, rezultatelor și hashurilor este în [verificarea coordonatorului](../evidence/2026-11-03/p09-local/coordinator-final-verification.json).

Primul lint după dry-run a raportat 186 erori în bundle-ul generat `.local/p09-deploy/console-worker.js`. Sol a revizuit regula ESLint `**/.local/**`; lintul final a trecut după regula și noul bundle. Păstrăm logul eșuat ca problemă de lint pe artefact generat, nu ca defect comportamental.

Instrucțiunile pentru captură și corelare, inclusiv variabilele locale, sunt în [README-ul instrumentului](../../tools/probe-recovery/README.md#cpu-capture-and-offline-correlation). Nu porni comenzile live înainte de aprobarea utilizatorului pentru planul concret.

## Runbook pentru o eventuală probă live aprobată

Această secțiune descrie pașii condiționați de o singură aprobare a utilizatorului. După patchul testat și verificările finale, coordonatorul prezintă un plan concret pentru deploy-ul probei existente, cel mult două GET-uri de diagnostic și benchmarkul plafonat. Până sosește aprobarea, rămânem la verificările locale.

Înainte de a porni măsurarea live aprobată, coordonatorul confirmă manual în Cloudflare Dashboard că planul este Workers Free și cota permite cel mult 203 invocări. GET-ul subscriptions care a răspuns 403 nu verifică planul sau cota. Verifică bindings ASSETS și D1, allowlist UID și variabilele/secretele private ale Workerului fără să afișeze ori copieze valorile. Nu reface setup-ul și nu cere credențiale în chat. Dacă operatorul nu poate verifica planul/cota sau are nevoie de acțiunea proprietarului, oprește măsurarea până când condiția este îndeplinită. Sesiunea securizată a operatorului trebuie să aibă token ID Alpha actual; nu se fac mutații de conturi.

La aprobare, publică numai Workerul probei existent și păstrează variabilele:

```bash
WRANGLER_SEND_METRICS=false NODE_USE_ENV_PROXY=1 ./node_modules/.bin/wrangler deploy --config probes/server/wrangler.console.toml --keep-vars
```

După deploy, obține independent ID-ul versiunii din metadata deploymentului. Manifestul trebuie să lege endpointul HTTPS aprobat, `scriptVersionId`, commit/hashul buildului, hashul workloadului canonic și payloadul de 262144 bytes. Nu folosi `buildHash` drept `scriptVersionId`. Diagnosticul GET este limitat la o cerere înainte de benchmark pentru readiness și, dacă aprobarea o include, una după benchmark. Nu trimite tokenuri în argumente/loguri.

Rulează o singură secvență: un primer explicit, 100 de cereri cold-key-cache și 100 warm-key-cache, câte 262144 bytes fiecare, cu toate cererile cold serializate. Durata capturii tail nu depășește 10 minute; fiecare cerere are timeout de 30 secunde. Captura trebuie să coreleze exact toate cele 201 ID-uri, cu un singur eveniment CPU per invocare. Păstrează primerul separat și nu deduce ordinea după ordinea tail. Limita rece de concurență 1, în loc de 16 anterior, controlează burstul, dar comparația nu demonstrează câștig CPU.

Oprește imediat la orice terminare CPU, eroare HTTP/auth, cache invalid, lipsă/invaliditate metrică CPU, timeout, parse error, tail reconnect/overload, versiune/hash nepotrivit, rezultat de billing sau incertitudine despre plan/cotă. Nu repeta automat o cerere, nu relansa benchmarkul și nu continua la captură incompletă. Rezultatul incomplet rămâne `NOT_EVALUATED`; nu se calculează percentile lipsă și nu se declară zero terminări. Review independent și verificarea coordonatorului sunt necesare înainte de a evalua pragurile.

Pragul neschimbat este p95 CPU ≤7 ms pentru ambele căi, minimum 100 de măsurători pe cale și zero terminări CPU. Orice eșec menține Gate B1 blocat. Dacă un trace complet confirmă din nou depășirea cold, următorul pas este profilare CPU țintită ori o propunere de reconsiderare arhitecturală pentru utilizator. Nu slăbi autentificarea și nu trece automat la un plan plătit sau furnizor alternativ.

Nu modifica migrații, fixture-uri, versiuni CAS sau conturi. Nu repeta probele CAS/iPhone, nu publica produsul și nu crea PR automat.

## Reluare la 2026-11-04

Fetch-ul Git nu a adus commituri noi; `main` a rămas la `5b785c8`. Coordonatorul nu a repetat verificările API Cloudflare/Firebase. Reviewul Sol a închis CAP01–CAP06 și reviewul auth. Coordonatorul a confirmat 256/256 teste în 26 fișiere, 21/21 teste Node de captură/corelare, typecheck, lint, 6/6 E2E Chromium cu Firebase simulat, pornirea celor trei builduri prin E2E, compilarea runnerului esbuild și Wrangler dry-run. Primul lint a eșuat numai pe bundle-ul generat din `.local`; după adăugarea ignore-ului `**/.local/**`, noul bundle și lintul au trecut. Comenzile și rezultatele exacte sunt în [manifestul verificării](../evidence/2026-11-03/p09-local/coordinator-final-verification.json). Captura live nu s-a repetat, iar P-09 rămâne FAIL.
