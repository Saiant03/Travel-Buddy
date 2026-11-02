# Travel Buddy

Proiect personal pentru doi utilizatori. Aplicația completă nu este încă implementată. Există două probe tehnice Cloudflare, cu Firebase Authentication și o bază D1 dedicată probei server.

## Stare actuală — 2 noiembrie 2026

Fundația tehnică din `codex/implementation-foundation` este candidat de integrare; produsul complet nu este implementat. Preflight-ul de integrare a confirmat citiri Cloudflare pentru ambele Worker-e și D1, plus Firebase OAuth/Auth; răspunsul D1 afișează șase tabele, fără validarea schemei sau conținutului. Nu s-au făcut mutații de servicii în acest preflight. Verificările coordonatorului au trecut: `npm ci`, 111/111 teste în 12 fișiere, typecheck, lint și E2E Chromium 8/8 (shell 1, server-console 6, offline 1); testul BR01 a reprodus eroarea înaintea fixului și a trecut după fix. Trei builds pornite de Playwright `webServer` au trecut. Au rămas doar avertismente Rollup Zod `@PURE` și `NO_COLOR`. Reviewul final s-a încheiat, dar candidatul este necomis și integrarea nu este finală.

Probele autentificate Alpha/Beta au trecut accesul 10/10 și CAS/idempotency 14/14. Fixture-ul CAS este la versiunea 8 și nu trebuie resetat ori reluat automat. Proba CPU a fost trimisă (100 cereri cold și 100 warm), însă lipsesc CPU p50/p95, erorile și cotele Cloudflare. P12-A manual pe iPhone 14 Pro Max a trecut pentru fixture-ul sintetic, conform [dovezii de progres](docs/evidence/2026-10-23/phone-probe-progress.md); nu cere repetarea. Android nu este confirmat și nu este condiție de integrare. Aceste probe nu validează produsul complet și nu decid eliminarea criteriilor de acceptare a produsului.

[Memoria](docs/memory.md) și [raportul de verificare](docs/verification.md) păstrează delimitarea dintre rezultatele actuale și cele istorice. Nu sunt autorizate facturarea sau upgrade-uri cu plată.

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

Următorul pas pentru probe este obținerea măsurătorilor CPU lipsă; fixture-ul CAS nu se reia. Nu există încă produs complet sau comandă pentru fluxurile private ale aplicației. Fotografiile exacte Lisabona pentru introducere rămân de recuperat.
