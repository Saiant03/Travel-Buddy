# Task 4A — carnete locale demonstrative

> **For agentic workers:** Follow docs/process.md: delegated implementation, review, repair and final coordinator verification task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pagina „Preferințele mele” cu cinci carnete funcționale, exclusiv cu date demonstrative în memorie.

**Architecture:** Reutilizăm shell-ul Task 2, catalogul tipizat RO/EN/FR, componentele și contractele existente. Starea demonstrativă aparține aplicației, supraviețuiește navigării locale și schimbării limbii, dar se resetează la reîncărcare. Nu introducem servicii de salvare sau contracte server noi.

**Tech Stack:** React 19, TypeScript strict, Vite, Zod, Vitest și Playwright existente.

**Spec:** [product.md](../product.md), [carnetele aprobate](../mockups.md), [contracte v1](../contracts-v1.md), [Task 4](2026-10-23-implementation.md), cererea explicită din 2 noiembrie 2026.

## Limite globale

- Task 4A depinde local de Tasks 1–2; Task 4 complet păstrează dependența de Task 3.
- P-09 rămâne FAIL: zece cereri cold distincte din 100 peste 7 ms; p95 exact necunoscut. B1, Task 3, backendul și acceptarea online rămân blocate.
- Fără autentificare, API, persistență server/browser, sincronizare, ajustări per vacanță sau crearea vacanțelor.
- Nu se repetă CPU/CAS/iPhone, nu se ating fixture-uri reale, Firebase/Cloudflare/D1, furnizori, costuri sau publicare.
- RO implicit, EN/FR complete; fontul și metafora carnetelor rămân cele existente. Valorile exacte de design sunt propuneri ajustabile. Inventarul alimentar este demonstrativ și extensibil, fără aprobare finală.
- Alergiile/intoleranțele/alimentele de evitat sunt separate de gusturi. Numai exemple fictive; nu solicităm informații reale de sănătate și nu promitem siguranță alimentară.

## Puncte de review

- Ștergerea ultimului răspuns readuce categoria la necompletat; necunoscut nu înseamnă refuz.
- „Fără preferințe speciale” nu coexistă cu selecțiile categoriei; alegerea ulterioară înlocuiește explicit această stare.
- Subtipurile, ingredientele, preparatele și precizările nu primesc automat răspunsul altui element.
- Căutarea fără diacritice, rezultatele goale și schimbarea limbii păstrează datele și orientarea utilizatorului.
- Textele lungi, tastatura, ecranele înguste și zoom 200% nu ascund controale; reduced motion păstrează funcțiile.

## Execuție

**Proprietar implementare:** model local/teste — `gpt-6-sol`, medium; catalog de date/traduceri — `gpt-6-luna`, medium; UI/integrare — `gpt-6.1-terra`, high. După oprirea fără editări a primului agent pe scopul complet, munca a fost delimitată pe fișiere distincte, cu interfețe stabilite înaintea UI. Coordonatorul deține planul, memoria, reviewul și integrarea. Fișierele comune se modifică secvențial.

**Fișiere:** `src/features/preferences/**` (catalog demonstrativ, model local și componente), integrare în `src/app/{App.tsx,router.ts,i18n.ts}`, stiluri locale cu tokenuri existente; `tests/unit/preferences/**`, `tests/e2e/preferences.spec.ts`, includerea specului în `playwright.config.ts`. Configurația comună se schimbă numai cât este necesar testului local.

**Interfețe:** răspunsuri și categorii din `src/shared/contracts/preferences.ts`; starea locală respectă `Profile` și separarea listelor `avoidFoods`, `allergies`, `intolerances`. Progresul este derivat din cele cinci categorii: o selecție explicită sau `noSpecialPreferences` parcurge categoria, fără a pretinde completarea fiecărui element.

- [x] Scrie teste comportamentale pentru răspunsuri exclusive, reset necunoscut, no-special, progres, precizări independente și separarea restricțiilor; confirmă RED pe aserțiuni, nu doar pe importuri.
- [x] Implementează carnete cu căutare, elemente concrete, patru răspunsuri adecvate categoriei și note opționale; food are Alimente/Preparate/Băuturi și precizări de preparare.
- [x] Confirmă GREEN, apoi rulează suita unit completă, typecheck, lint și build.
- [x] Review independent și browser local al coordonatorului: selecții/căutare/progres, navigare și tastatură, RO/EN/FR, mobil/desktop, zoom 200%, reduced motion, reset la reload.
- [x] Delegă remedierile și reverifică rezultatul afectat; documentează exact verificările și limitele.
- [ ] După review și verificări trecute, commit/push fără force pe `main`, autorizate. Fără deploy sau PR automat.

## Rezultat

[Rezultatul verificat și limitele](../evidence/2026-11-02/task-4a-local-preferences.md): 130/130 teste unitare, typecheck, lint, build, 9/9 E2E Chromium. Reviewurile independente și coordonatorul au închis defectele confirmate. Browser: cinci categorii în RO/EN/FR, mobil/desktop, tastatură, reduced motion, zoom CSS 200%; zoomul nativ, Safari, cititorul de ecran și telefonul fizic nu sunt demonstrate. Precizările non-food sunt note, iar prepararea structurată este demonstrată la ceapă/roșii. Inventarul alimentar și valorile exacte de design rămân propuneri. Task 4 complet rămâne nefinalizat și blocat pentru integrarea backend/izolare reală/ajustări per vacanță.
