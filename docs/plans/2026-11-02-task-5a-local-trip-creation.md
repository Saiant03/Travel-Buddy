# Task 5A — creare de vacanță demonstrativă locală

> **For agentic workers:** Urmați `docs/process.md`: implementare delegată, review, remediere și verificarea finală a coordonatorului. Nu bifați verificări fără dovezi.

**Goal:** Un flux local în trei momente pentru datele fictive ale unei vacanțe, care se oprește la rezumat.

**Architecture:** Starea formularului aparține aplicației React și rezistă navigării locale și schimbării limbii, fără stocare. Un model de draft validează intrările și produce numai o reprezentare demonstrativă compatibilă cu `parseTrip`; identitățile și pozițiile necesare contractului sunt sintetice, niciodată rezultate de căutare sau coordonate verificate.

**Tech Stack:** React 19, TypeScript strict, Vite, Zod și fundația UI/i18n existentă; Vitest și Playwright.

**Spec:** Cererea explicită Task 5A din 2026-11-02; `docs/product.md`, `docs/design-system.md`, `docs/mockups.md`, `docs/contracts-v1.md`, Task 5 din `2026-10-23-implementation.md`.

## Global Constraints

- RO/EN/FR, româna implicită. Fără date personale, rezervări sau informații reale de sănătate; mesaj vizibil despre date fictive și resetarea la reîncărcare.
- Fluxul folosește „Bilet, bagaj, pașaport”; scena a doua păstrează titlul „Cum explorăm și unde stăm?”. Scenele 2 și 3 sunt aprobate vizual; prima scenă, detaliile concrete și mișcările nu primesc implicit aprobare.
- Transport combinabil `walk|transit|car`, minimum unul; calendar valid cu zile incluzive sau număr întreg pozitiv sigur, fără plafon arbitrar al duratei.
- Cazările sunt opționale și repetabile; intervale de zile incluzive, de la 1, fără suprapunere și în interiorul vacanței. Golurile dintre baze sunt permise. Orele `HH:mm` sunt opționale, bugetul nu se cere.
- Fără autentificare, API, persistență, sincronizare, ajustări per vacanță, căutare, hărți, itinerarii, generare sau progres simulat.
- P-09 FAIL: zece cereri cold distincte din 100 peste 7 ms; p95 exact necunoscut. B1, Task 3, backendul și acceptarea online rămân blocate. Task 4 și Task 5 complete rămân nefinalizate și își păstrează dependențele.
- Nu se repetă CPU/CAS/iPhone și nu se ating fixture-uri reale, Firebase/Cloudflare/D1, furnizori, costuri sau deploy/publicare. Commit/push normal în main după verificări sunt autorizate; fără PR automat.

## Fișiere și interfețe

- Noi: `src/features/trip-creation/{demo-model.ts,TripWizard.tsx,DestinationTicket.tsx,TransportAndStay.tsx,PassportSummary.tsx,trip-creation.css}`; extrageri mici în același director dacă responsabilitatea le justifică.
- Integrare: `src/app/{App.tsx,router.ts,i18n.ts}`, numai ajustări necesare în `src/ui/styles.css`; se reutilizează `src/ui/components.tsx`, fontul și tokenurile.
- Teste: `tests/unit/trips/demo-model.test.ts`, completare router, `tests/e2e/trip-creation.spec.ts`, proiect Playwright dedicat; fără modificări ale probelor existente.
- `createTripDraft()` produce starea goală; `validateDestination(draft)` și `validateTransportAndStay(draft)` produc probleme localizabile cu cale spre câmp; `buildDemoTrip(draft)` produce rezultat validat prin `parseTrip`, fără apel extern. Semnăturile concrete se păstrează consecvent între model, UI și teste.
- Draftul păstrează separat valorile calendarului și ale numărului de zile la comutarea modului; rezumatul folosește numai modul activ. Micșorarea duratei nu șterge și nu trunchiază bazele: cere corectare înainte de rezumat.
- App deține draftul și pasul curent, astfel încât revenirea din alte pagini și browser back/forward nu pierd introducerile. Reload recreează starea inițială și RO.

## Review Focus

- Calendar imposibil, interval inversat, zi unică, an bisect și durată fracționară/nesigură: erori utile, fără normalizare tăcută.
- Baze suprapuse la aceeași zi de graniță, interval inversat sau ieșit din durata modificată: blocarea rezumatului, păstrarea valorilor pentru corectare.
- Comutarea modului perioadei, limbii, pașilor și paginilor: date păstrate; numai reload resetează.
- Câmpuri omise: lipsa cazării, orelor, calendarului în modul zile și bugetului se exprimă clar, fără valori inventate.
- Tastatură și afișare îngustă cu text lung: focus util după erori/adăugare/ștergere, etichete persistente, fără drag obligatoriu sau overflow.

## Execuție delegată — Terra high

- [x] Teste inițiale model și browser scrise primele, cu RED pe aserțiuni și loguri păstrate. **Limită:** două teste suplimentare de detaliu ale rezultatului au fost adăugate ulterior; paritatea traducerilor are numai GREEN. Nu se declară ordine test-first pentru acestea. Detalii în dovada de mai jos.
- [x] Model implementat și verificat pentru calendar/zile, transport combinat, baze multiple și câmpuri opționale; limitele contractelor canonice rămân neschimbate.
- [x] Cele trei scene integrate în navigarea existentă și traduse; rezumatul este capătul demonstrației și declară informațiile lipsă. Nu se pretinde pregătirea reală a ambelor profiluri.
- [x] Testele de flux acoperă validările, revenirea, păstrarea datelor, combinatele, opționalele și resetarea.
- [x] Review și corectare delegată, apoi reverificare.
- [x] Coordonator: `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`, E2E Task 5A și regresii shell/preferințe; browser local pentru RO/EN/FR, mobil/desktop, tastatură, zoom CSS 200% (aproximare, nativ neexecutat) și reduced motion.
- [x] Numai după rezultate: memorie, plan și dovadă versionată cu rezultate exacte, verificări neexecutate și limite. Commit/push fără force/reset și fără deploy.

Task 5A depinde local de Tasks 1–2 și reutilizează fundația Task 4A fără a o reimplementa. Task 5 complet păstrează Tasks 1–4, membership, API, persistență, idempotency, reluarea salvării și trecerea reală spre generare. Acestea nu sunt validate prin 5A.

## Rezultat verificat

[Dovezi și limite](../evidence/2026-11-02/task-5a-local-trip-creation.md): 139/139 teste în 18 fișiere, typecheck/lint/build și 14/14 E2E Chromium. Reviewul independent și coordonatorul au închis defectele confirmate, inclusiv erorile mutate între cazări și contrastul acțiunilor. Sunt implementate cele trei scene și `scene-types.ts` pentru interfețele lor. Prima scenă și detaliile exacte rămân propuneri, fără acceptare vizuală implicită. Safari/dispozitiv fizic/cititor de ecran/zoom nativ nu sunt verificate. Livrare în `0695cd2a973e635d9534813fc75b8880cb2f4ee5`, push fără force pe `main` confirmat, HEAD/remote identice și arbore curat; confirmarea documentară urmează separat, fără deploy.
