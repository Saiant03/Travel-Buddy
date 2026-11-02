# Plan de reconciliere a branchurilor — 2 noiembrie 2026

> **For agentic workers:** Follow docs/process.md: delegated implementation, review, repair and final coordinator verification task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrarea sigură a fundației și probelor în main, păstrând remedierile și dovezile recente.
**Architecture:** Se combină codul din codex/implementation-foundation cu actualizările operaționale din main. Configurația privată activă rămâne sursa identităților; integrarea Git nu implică publicare.
**Tech Stack:** TypeScript, React/Vite, Cloudflare Worker/D1, Firebase Auth, Vitest/Playwright.
**Spec:** docs/product.md, docs/process.md, docs/operations/2026-11-02-alpha-login-fix.md, docs/operations/2026-11-02-alpha-beta-verification.md.

## Starea verificată și decizia

Connectorul GitHub confirmă două branchuri: main și codex/implementation-foundation. Comparația arată 13 commituri specifice fundației și 9 specifice main; baza comună este 11e72f96. Snapshotul local work=48b91d6 este deja inclus în main=ea4f974 și nu are nimic nou de integrat.

Review independent: NU integra fundația în forma actuală. BR-01: controller.ts păstrează fetch nativ fără receptor și reintroduce defectul Illegal invocation. BR-02: wrangler.console.toml include identificatori privați și configurație veche care poate suprascrie allowlist-ul corectat. BR-03: documentele fundației trebuie reconciliate cu dovezile din 1–2 noiembrie. Reviewul a inspectat inventarul diferențelor și fișierele relevante, nu certifică fiecare fișier și nu înlocuiește testele.

Rezultate păstrate în main: acces Alpha/Beta 10/10, CAS/retry 14/14, fixture avansat la versiunea 8. CPU a fost trimis, fără verdict de performanță. Offline desktop trecut; telefon nedemonstrat. Produsul complet nu este implementat.

În această sesiune, environment_status confirmă variabilele administrative ready și politica de rețea enforced, dar cererile reale către Workers și git fetch eșuează deoarece proxy:8080 este inaccesibil. Nu putem reconfirma acum Firebase, Cloudflare sau D1. Readiness nu este dovadă HTTP.

## Global Constraints

- Fără facturare, produs complet sau publicare implicită.
- Nu reseta fixture-ul, nu relua CAS automat; versiunea 8 este rezultatul probei.
- Nu salva identificatori personali, parole sau tokenuri în Git ori rapoarte.
- Nu modifica emailVerified și nu crea sesiuni de substituție.
- Păstrează rezultatele recente din main; nu înlocui main cu snapshotul vechi.
- Problemele de proxy se remediază prin configurația mediului; nu se ocolește proxy-ul.

## Review Focus

- Fetch nativ în Chromium trebuie să ajungă la endpoint fără Illegal invocation.
- Fetcherul injectat trebuie să continue să funcționeze.
- Configurația versionată nu trebuie să introducă identități sau să înlocuiască allowlist-ul privat.
- Îmbinarea documentelor trebuie să păstreze rezultatele Alpha/Beta și restricția fixture-ului.
- Dovezile desktop nu închid automat verificarea pe telefon sau P-09.

## Task 1: Corecția sursei și regresia conectării

**Files:** probes/server-console/controller.ts; tests/e2e/server-console.spec.ts; tests/probes/console-controller.test.ts.
**Interfaces:** constructorul controllerului păstrează contractul fetcherului injectabil și operațiile actuale de conectare.
- [ ] Introdu o regresie Chromium cu fetch nativ și răspuns Firebase interceptat la nivelul rețelei, fără înlocuirea window.fetch cu wrapper arrow.
- [ ] Confirmă eșecul original: cererea nu ajunge la interceptare din cauza receptorului incorect.
- [ ] Portează corecția documentată: fallback fetch.bind(globalThis); păstrează fetcherul injectat.
- [ ] Rulează regresia Chromium și testele controllerului; confirmă răspunsurile pentru cont confirmat/neconfirmat și credentiale fictive.
- [ ] Salvează corecția pe branchul de lucru și trimite la review.

## Task 2: Configurație privată și reconciliere

**Files:** probes/server/wrangler.console.toml; probes/server-console/README.md; docs/cloud-access.md; docs/memory.md; docs/plan.md; docs/verification.md; docs/operations/.
**Interfaces:** aceleași nume de bindings; valorile private sunt furnizate în afara repository-ului.
- [ ] Elimină valorile de identitate din configurația versionată; documentează furnizarea lor privată fără a le copia în loguri.
- [ ] Verifică în privat configurația generată față de versiunea activă, fără deploy și fără a imprima bindings.
- [ ] Combină documentele păstrând starea din 2 noiembrie și dovezile istorice utile; nu transforma verificări raportate în verificări directe.
- [ ] Verifică diff-ul și fișierele urmărite pentru identificatori și secrete; nu rescrie istoricul automat.
- [ ] Trimite schimbările la review independent.

## Task 3: Verificare integrată și integrare

**Files:** întregul diff al candidatului de integrare; docs/verification.md.
**Interfaces:** main actual și branchul corectat; fără schimbări de servicii.
- [ ] Restabilește conectivitatea mediului și recitește capetele remote înaintea construirii candidatului.
- [ ] Rulează npm ci, npm test, npm run typecheck, npm run lint, npm run build, npm run build:probe, npm run build:server-probe și npm run test:e2e conform cerințelor Node din repository.
- [ ] Verifică independent BR-01–BR-03 și conflictele reale; coordonatorul verifică rezultatul combinat.
- [ ] Integrează în main numai după trecerea verificărilor; verifică SHA-ul remote rezultat. Nu publica Workers ca efect secundar.

## Task 4: Închiderea probelor rămase

**Files:** docs/operations/2026-11-02-alpha-beta-verification.md; docs/plans/2026-10-23-technical-probes.md; docs/verification.md.
**Interfaces:** datele workloadului CPU deja transmis și fixture-ul existent, fără reset.
- [ ] Reconfirmă administrativ Firebase/Cloudflare prin citiri minime când proxy-ul funcționează.
- [ ] Recuperează CPU p50/p95, erori și cote pentru workloadul existent; dacă nu mai sunt disponibile, consemnează lipsa înaintea definirii unei runde noi.
- [ ] Compară rezultatele cu criteriile P-09 existente; nu deduce izolarea cold din etichetele cererilor.
- [ ] Obține dovadă specifică telefonului: dispozitiv/browser, salvare online, închidere și redeschidere fără internet, conținut complet și comportament la actualizare întreruptă.
- [ ] Actualizează verdictul probelor. Abia apoi propune următoarea etapă de produs în limitele mandatului.
