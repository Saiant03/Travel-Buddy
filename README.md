# Travel Buddy

Proiect personal pentru doi utilizatori. Aplicația completă nu este încă implementată. Există două probe tehnice Cloudflare, cu Firebase Authentication și o bază D1 dedicată probei server.

## Stare actuală — 3 noiembrie 2026

Taskurile 2, 4A, 5A, 6A, 7A și 8A sunt implementate și verificate ca demonstrații locale, cu date fictive în memorie; `/itinerary-demo` este vizualizarea funcțională locală a itinerarului; acestea nu constituie produsul complet sau backend funcțional. P-09 este **FAIL**: 10 dintre 100 de cereri cold distincte au depășit 7 ms. P95-ul exact, rezultatul warm complet și terminările CPU pentru întregul set rămân necunoscute. Gate B1, Task 3, backendul și acceptarea online sunt blocate. Starea detaliată și limitele sunt în [memorie](docs/memory.md), [plan](docs/plan.md) și [verificări](docs/verification.md); măsurarea este descrisă în [reluarea CPU](docs/operations/2026-11-02-cpu-rerun.md).

### Snapshot istoric al integrării — 2 noiembrie 2026

Integrarea selectivă este confirmată în `main` la `aace865e28cc88d012d6b585aaad9e6044c1b701` (părinți `1fb41d7, b295642`), prin push fără force. Corectările au trecut 111/111 teste, 8/8 E2E Chromium, typecheck, lint și cele trei builds pornite prin Playwright `webServer`. Scanarea țintită a celor 133 de fișiere staged nu a găsit cele două UID-uri vechi, markeri de cheie privată sau conflicte; nu a fost un audit exhaustiv. Avertismentele Rollup Zod `@PURE` și `NO_COLOR` au fost non-blocking. Produsul complet nu este implementat.

Preflight-ul read-only a confirmat citiri Cloudflare pentru ambele Worker-e și D1, plus Firebase OAuth/Auth; D1 a afișat șase tabele fără validarea schemei/conținutului. Nu s-au făcut mutații de servicii. Workers Builds API a răspuns 403 la trigger; automatizarea de branch rămâne necunoscută și nu am lansat nicio comandă sau acțiune de deploy.

Alpha/Beta au trecut accesul autentificat 10/10 și CAS/idempotency 14/14. Fixture-ul CAS este la versiunea 8 și nu trebuie resetat ori reluat automat. Workload-ul CPU a fost trimis (100 cold și 100 warm), dar metricile p50/p95, erorile și cotele lipsesc; următorul pas este recuperarea metricilor existente, fără workload nou. Acesta este statusul păstrat la integrarea din 2 noiembrie; rezultatul reluării ulterioare este în snapshotul actual de mai sus și în [jurnalul CPU](docs/operations/2026-11-02-cpu-rerun.md). P12-A manual pe iPhone 14 Pro Max a trecut pentru fixture-ul sintetic, conform [dovezii de progres](docs/evidence/2026-10-23/phone-probe-progress.md); nu cere repetarea. Android nu este confirmat și nu este condiție de integrare. Aceste probe nu validează produsul complet și nu decid eliminarea criteriilor de acceptare ale produsului.

[Memoria](docs/memory.md) și [raportul de verificare](docs/verification.md) păstrează detaliile și limitele. Nu sunt autorizate facturarea sau upgrade-uri cu plată.
## Lucru local

Mediul fundației a fost verificat cu Node.js 24 și npm 11. Pentru instalare curată, folosește `npm ci --ignore-scripts`; `.npmrc` blochează implicit scripturile lifecycle ale dependențelor.

```sh
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright cere un browser instalat. Pentru Chromium-ul disponibil în mediul cloud: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Emularea dimensiunii unui telefon în browser nu validează un telefon real. Comenzile și limitele rezultatelor acestei verificări sunt consemnate în [raportul de verificare](docs/verification.md).

## Harta proiectului
- `AGENTS.md`: punctul de intrare pentru agenți.
- `docs/memory.md`: context durabil, stare și următorul pas.
- `docs/product.md`: brief și întrebări deschise.
- `docs/process.md`: delegare, review, corectare și predare.
- `docs/plan.md`: etape și progres.
- `docs/decisions.md`: decizii și motive.
- `docs/skills.md`: skill-uri, versiuni, utilizare și limite.
- `docs/verification.md`: dovezi și limite ale verificărilor.
- `docs/operations/2026-11-01-probe-recovery.md`: istoria recuperării probelor Cloudflare/Firebase.
- `docs/operations/2026-11-02-alpha-beta-verification.md`: rezultatele Alpha/Beta și măsurătorile încă lipsă.
- `.agents/skills/`: skill-uri locale, inclusiv resursele upstream.
- `.codex/agents/`: roluri reutilizabile pentru agenți.

Taskurile locale 2/4A/5A/6A/7A/8A și limitele lor sunt în [memorie](docs/memory.md) și [plan](docs/plan.md); P-09/B1/Task 3 rămân blocate conform [verificărilor](docs/verification.md). Fixture-ul CAS nu se reia. Nu există produs complet sau comandă pentru fluxurile private ale aplicației. Fotografiile exacte Lisabona pentru introducere rămân de recuperat.
