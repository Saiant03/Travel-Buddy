# Travel Buddy — handoff pentru Claude Code

## Stare curentă — noiembrie 2026

Branch-ul de fundație este candidat de integrare, încă necomis; produsul complet nu este implementat. Preflight-ul read-only curent a confirmat Cloudflare HTTP 200 la listarea ambelor Worker-e și la listarea/detaliile D1 (șase tabele afișate, fără validarea schemei/conținutului), plus Firebase OAuth/Auth read HTTP 200 și două conturi email-confirmate, enabled. Nu s-au făcut mutații la servicii.

Verificările locale finale au trecut: `npm ci`, 111/111 teste în 12 fișiere, typecheck, lint și E2E Chromium 8/8 (shell 1, server-console 6, offline 1). Testul BR01 a reprodus „Neautentificat” înaintea remedierii și a trecut după fix; toate cele trei builds pornite de Playwright `webServer` au trecut. Avertismentele Rollup Zod `@PURE` și `NO_COLOR` au fost non-blocking. Reviewul coordonatorului este încheiat, dar integrarea nu este declarată finală înainte de commit.

Probele autentificate Alpha/Beta au trecut 10/10 acces și 14/14 CAS/idempotency. Fixture-ul este la versiunea 8; nu îl reseta și nu relua CAS automat. Workload-ul CPU a fost trimis, însă metricile Cloudflare necesare verdictului P-09 lipsesc. P12-A manual pe iPhone 14 Pro Max a trecut pentru fixture-ul sintetic; nu cere repetarea. Android este neconfirmat, nu este gate de integrare și această stare nu decide eliminarea unui gate de acceptare a produsului.

Workers Builds API a răspuns HTTP 403 la trigger. Automatizarea de branch este necunoscută și nu s-a executat nicio acțiune de deploy. Nu trata acest răspuns ca dovadă a unui deploy reușit/eșuat sau ca blocaj demonstrat pentru integrarea locală.

Surse curente: [memoria](docs/memory.md), [planul](docs/plan.md), [verificările](docs/verification.md), [planul de reconciliere](docs/plans/2026-11-02-branch-reconciliation.md), [jurnalul Alpha/Beta](docs/operations/2026-11-02-alpha-beta-verification.md) și [progresul P12-A](docs/evidence/2026-10-23/phone-probe-progress.md).

**Istoric:** toate secțiunile de mai jos păstrează dovezile și instrucțiunile din octombrie 2026; nu folosi stările lor de autentificare, seed, blocaj sau build drept stare curentă. Regulile generale de protejare a secretelor și de a nu factura rămân valabile.

Lucrează în română, cu explicații simple și pași mici. Utilizatorul nu are experiență IT; spune clar ce să apese și ce rezultat să caute. Nu cere parole, API key Firebase sau tokenuri în chat și nu le include în capturi. Nu cere din nou acordul pentru activare/publicare gratuită; acesta există. Fără card, billing sau upgrade automat.

## Context și surse de adevăr

- Repository: `Saiant03/Travel-Buddy`; branch de lucru: `codex/implementation-foundation`. Verifică head-ul și fișierele remote înainte să presupui că un snapshot local este sincronizat.
- `/workspace/travel-buddy-current` poate fi un snapshot parțial, nu un checkout Git complet. Nu folosi copia veche `/workspace/Travel-Buddy` ca sursă curentă.
- Citește `AGENTS.md`, `docs/memory.md`, `docs/plan.md`, `docs/process.md` și documentele relevante. Pentru consola server: `docs/contracts-probe-console.md`, `probes/server-console/README.md`, `probes/server/wrangler.console.toml` și dovezile din `docs/evidence/`.

## Snapshot istoric — 25 octombrie 2026

- Workerul Cloudflare `travel-buddy-server-probe` a fost creat și conectat la repository. Production branch a fost schimbat la `codex/implementation-foundation`. Build command este `npm run build:server-probe`, deploy command este `npx wrangler deploy --config probes/server/wrangler.console.toml`, root directory `/`. Cloudflare a cerut Preview command; a rămas valoarea implicită `npx wrangler preview`. Builds for Preview branches este dezactivat.
- Buildul inițial de pe `main` a eșuat fiindcă branch-ul nu conține această configurație. După commitul de actualizare a handoff-ului, utilizatorul a confirmat că buildul nou de pe `codex/implementation-foundation` a ajuns la Ready. Nu folosi eșecul vechi de pe `main` ca rezultat al buildului curent.
- Captura Cloudflare Settings arată variabilele `FIREBASE_PROJECT_ID`, `ALLOWED_UID_1`, `ALLOWED_UID_2`, Secretul runtime `FIREBASE_WEB_API_KEY` cu valoarea criptată și bindingul D1 `DB` către `travel-buddy-server-probe`. Nu copia UID-urile în acest fișier, chat sau loguri. Secretul nu a fost dezvăluit.
- URL-ul Workerului este [travel-buddy-server-probe.saiuantonio.workers.dev](https://travel-buddy-server-probe.saiuantonio.workers.dev/). Pagina se încarcă și afișează „Configurarea Firebase este disponibilă”.
- Utilizatorul a deschis `/probe/public-config` și a confirmat că răspunsul conține `firebaseProjectId: travel-buddy-b3f48` și câmpul `firebaseWebApiKey`. Valoarea cheii nu a fost trimisă în chat. Acest lucru confirmă prezența câmpurilor, nu că Firebase acceptă cheia.
- Captura D1 Console `/tables` arată cele șase tabele ale schemei. Captura Worker Settings arată bindingul `DB`; nu s-a aplicat încă seed-ul și nu s-au rulat probe reale D1/CAS/rollback/CPU.
- Firebase `travel-buddy-b3f48` este pe Spark, Email/Password a fost confirmat activ, iar utilizatorul a confirmat că ambele conturi există. Nu include emailurile sau UID-urile. Starea de verificare a adreselor nu este cunoscută; nu s-a solicitat niciun email de confirmare.

## Blocaj istoric: autentificarea din panou nu a reușit

- Utilizatorul a încercat autentificarea în slotul Alpha. Panoul șterge parola după trimitere, dar rămâne la „Neautentificat” și afișează mesajul generic: „Operația nu a putut fi încheiată. Verifică setările probei și încearcă din nou.”
- În Network a fost văzută cererea `public-config` cu status 200. Nu a fost capturată o cerere `accounts:signInWithPassword` și nu s-a obținut un cod de eroare Firebase. Cauza autentificării eșuate rămâne necunoscută; nu pretinde că autentificarea reală funcționează.
- Utilizatorul a cerut explicit să se oprească depanarea din această conversație și să se actualizeze doar handoff-ul. Nu repeta pașii F12/Network deja încercați fără un diagnostic nou și o metodă mai simplă. În această etapă nu s-a modificat codul aplicației pentru depanare.
- Nu știm dacă parola introdusă a fost corectă, dacă cheia este acceptată de Firebase sau dacă browserul a trimis cererea. Nu trimite email de confirmare sau resetare fără ca utilizatorul să ceară asta.

## Lucruri care erau neconfirmate în snapshotul din octombrie

1. Verificarea reală a răspunsului `/probe/public-config` și a header-elor HTTPS, fără a solicita utilizatorului cheia.
2. Autentificarea ambelor conturi și confirmarea adreselor numai dacă utilizatorul dorește emailurile.
3. Descărcarea seed-ului din panou și aplicarea lui o singură dată în baza D1 dedicată.
4. Probele reale de acces, CAS/rollback și dispatch CPU; P-09 cere exportul CPU Cloudflare. Verificarea Android nu a fost făcută.
5. Gate B1 rămâne blocat; nu începe Tasks 2+ până când probele reale din plan nu trec.
6. Cloudflare UI a arătat anterior 4/3000 minute de build, valoare compatibilă cu Workers Free, dar pagina planului nu a fost verificată direct. Nu continua prin ecrane de plată, card, billing sau upgrade.

## Verificări tehnice ale snapshoturilor anterioare

- Înainte de publicarea din Cloudflare: buildul consolei, 36/36 teste de consolă, Wrangler dry-run și proba locală fără Secret (503/no-store) au trecut. Nu s-au rerulat typecheck, lint, suita completă sau E2E pentru schimbările acestei sesiuni.
- Baseline istoric: 111/111 teste, typecheck, lint și 7/7 E2E Chromium. Aceste rezultate nu înlocuiesc probele reale Firebase/Cloudflare/D1.
- P12-A PASS pe iPhone se referă doar la fixture-ul sintetic; Android rămâne neverificat.

## Reguli pentru continuare

- Păstrează direcția de produs și vizuală documentată; nu relua brief-ul sau explorarea deja aprobate.
- Nu modifica aplicația privată sau Workerul probei offline pentru a repara consola server.
- Nu inventa rezultate din capturi, teste locale sau dry-run; separă verificările trecute de cele neexecutate.
- Nu publica issues sau PR-uri automat. V1 rămâne pentru două persoane; viitoarea extindere către prieteni necesită proiectarea tenant-urilor, invitațiilor și permisiunilor.
