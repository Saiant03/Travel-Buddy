# Task 6A — identificare demonstrativă locală a locurilor

> **For agentic workers:** Urmați `docs/process.md`: implementare delegată, review, remediere și verificarea finală a coordonatorului. Bifați numai rezultate verificate.

**Goal:** Nume sau link fictiv și confirmarea explicită a unei potriviri sintetice, fără integrare în itinerariu.

**Architecture:** Contractele interne strict validate reutilizează Place, SourceRef, LicensedImage și ProviderFailure. Furnizorul injectabil produce fixture-uri deterministe validate înainte de afișare. App deține starea în memorie, separat de Task 5A.

**Tech Stack:** React 19, TypeScript strict, Zod, Vite, Vitest, Playwright; componentele, fontul, tokenurile și i18n existente.

**Spec:** Cererea explicită Task 6A din 2026-11-02; `docs/product.md`, `docs/architecture.md`, `docs/contracts-v1.md`; Task 6 din `2026-10-23-implementation.md`; P-05/P-06 din `2026-10-23-technical-probes.md`; dovada Task 5A.

## Global Constraints

- RO/EN/FR, româna implicită. Exemple fictive, fără date personale, rezervări sau sănătate reală.
- Cazuri 0/1/multiple fără selecție/confirmare automată. Oprire la selecția locală confirmată; fără itinerariu, propuneri sau modificarea Task 5A, care rămâne oprit la rezumat.
- Rezultatele, sursele și coordonatele obligatorii sunt sintetice/neconfirmate. Fără fotografii sau informații turistice inventate prezentate ca reale. Sursele fictive sunt text inert.
- Numai memorie; păstrare la navigare și schimbarea limbii, reset la reload explicat vizibil.
- Fără cereri externe, accesarea linkurilor, căutare online, geocodare, hărți, generare, API/server, autentificare, persistență sau sincronizare. Fără formate HTTP inventate pentru furnizori reali.
- Rezultat invalid, indisponibilitate, timeout și cotă epuizată sunt scenarii etichetate ca simulări. Zero retry automat, fallback cu plată sau consum real.
- P-09 FAIL: 10 cereri cold distincte din 100 peste 7 ms; p95 exact necunoscut. B1, Task 3, backendul și acceptarea online rămân blocate. Tasks 4/5/6 complete rămân nefinalizate și păstrează dependențele.
- Nu se repetă CPU/CAS/iPhone, nu se ating fixture-uri reale, Firebase/Cloudflare/D1, furnizori/costuri, deploy/publicare sau PR. Commit/push normal în main după review/verificări sunt autorizate.

## Fișiere și interfețe

- Noi: `src/features/place-resolution/{contracts.ts,demo-provider.ts,demo-model.ts,PlaceResolution.tsx,messages.ts,place-resolution.css}`; extrageri mici în același director numai dacă sunt utile.
- Integrare: `src/app/{App.tsx,router.ts,i18n.ts}`, `playwright.config.ts`; numai ajustări necesare în stilurile comune.
- Teste: `tests/unit/place-resolution/*.test.ts`, router/i18n dacă este relevant, `tests/e2e/place-resolution.spec.ts`.
- `parseResolutionInput(unknown)` validează `{input,locale}`: nume nevid după trim, maximum 4.000 caractere; URL HTTPS fără userinfo, numai domeniu rezervat `.invalid` pentru demo. Nu pretinde protecție SSRF completă.
- `PlaceResolutionProvider.resolve(input)` este port intern injectabil cu rezultat neîncrezut; nu reprezintă API-ul unui furnizor real. Schema rezultatului reutilizează `placeSchema` și `providerFailureSchema`, respinge chei necunoscute, lipsa sursei și duplicate.
- `resolvePlaces(provider,input)` validează înaintea apelului și înaintea utilizării rezultatului, întoarce eroare tipizată, fără retry automat; excepțiile devin indisponibilitate controlată fără divulgare.
- `createResolutionDemoState()` creează starea goală. App păstrează intrarea/scenariul/rezultatele/alegerea/confirmarea. Editarea ori identificarea nouă invalidează selecția și confirmarea veche; răspunsurile învechite nu suprascriu intrarea nouă.
- Selectarea unui candidat nu confirmă. Butonul explicit confirmă numai un candidat al rezultatului curent, cu sursa și incertitudinea păstrate. Niciun efect în Task 5A.

## Review Focus

- Gol/prea lung, URL malformat, schemă ne-web, userinfo ori link real: eroare utilă și zero apel de furnizor.
- Rezultat fără sursă, schemă invalidă, duplicate sau excepție: nimic invalid afișat; intrare corectabilă.
- 1/multiple: fără alegere implicită; editarea după confirmare elimină succesul învechit.
- Identificare urmată de editare/navigare/limbă: fără răspuns vechi aplicat cererii noi, pierdere de date ori mesaje în limba veche.
- Tastatură, stări anunțate, text lung și ecran îngust: focus util, surse inerte, confirmare accesibilă, fără overflow.

## Execuție delegată — Terra medium

- [ ] Teste înainte de fiecare comportament de validare/rezultat/confirmare/eroare/stare; RED pe aserțiuni, nu numai importuri. Schelet inert permis pentru apelul testat, fără comportamentul implementat.
- [x] Furnizor/model și grupuri RED/GREEN verificate; limitele cazurilor deja GREEN sunt consemnate în raport, fără atribuire retroactivă de RED.
- [ ] Teste E2E înaintea UI: 0/1/multiple, confirmare, corectare, toate simulările, navigare/limbă și reload; fiecare eșec așteptat confirmat înaintea implementării aferente.
- [x] UI separată pe componente/tokenuri existente, traduceri complete, surse fictive vizibile. Fără teste artificiale CSS/documentație.
- [x] Review coordonator și independent; remedieri delegate cu RED pentru defectele comportamentale, apoi reverificare.
- [x] Teste/regresii, typecheck/lint/build și browser local: tastatură, RO/EN/FR, mobil/desktop, zoom CSS 200% (nu nativ), reduced motion, stocare/reset și rețea.
- [x] Memorie/plan/dovadă numai cu fapte verificate; livrarea Git se confirmă în raportul conversației după push.

**Rezultat local, 2026-11-02:** 184/184 teste, 26/26 E2E Chromium și 198 verificări de stare/layout în browser trecute. Cele două cerințe de RED integral de mai sus rămân nebifate: testele combinate nu au demonstrat separat toate comportamentele, iar testul mobil suplimentar a fost adăugat ulterior. Funcționalitatea este verificată, fără certificare TDD integrală. [Dovezi, review, capturi și limite](../evidence/2026-11-02/task-6a-local-place-resolution.md).

## Partea reală neimplementată a Task 6

Adaptoarele HTTP reale, endpointurile, autentificarea, protecția completă a URL-urilor/SSRF și proxy-ului de imagini, licențele reale, cotele persistente, concurența/resetul/timezone/retry bounded și probele live rămân în Task 6 complet. Dependențele Task 1, P-05/P-06 și P-07/P-11 pentru calitate live se păstrează; integrarea serverului respectă B1/Task 3. Fixture-urile 6A sunt dovezi locale limitate, fără PASS integral P-05/P-06 și fără validarea serverului/furnizorilor reali.
