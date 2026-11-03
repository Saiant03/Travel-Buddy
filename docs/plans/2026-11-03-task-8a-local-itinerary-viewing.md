# Cum parcurgeți itinerarul demonstrativ pe zile

> **Pentru agenții de implementare:** Urmați `docs/process.md`: implementare delegată, review, corectare și verificare finală de către coordonator. Bifați pașii după verificarea lor.

**Scop:** utilizatorul poate deschide explicit o demonstrație locală, selecta o zi, vedea opririle în ordinea fixture-ului și consulta/revizita detaliile unei opriri cu ziua și poziția păstrate.

**Arhitectură:** O rută dedicată afișează date sintetice deterministe, validate prin schemele comune existente de itinerar. App deține rezultatul încărcării, ziua, oprirea, scenariul și limba numai în memorie; reîncărcarea resetează starea.

**Tip de conținut:** plan de implementare.

**Skill-uri de implementare UI:** `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`, `test-driven-development`, `travel-buddy-engineering` și `webapp-testing`.

**Skill-uri de review UI:** `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines` cu regulile live și `travel-buddy-review`.

**Skill-uri pentru acest plan și review documentar:** `writing-plans` și `writing-guidelines` cu regulile live.

**Stack:** React 19, TypeScript, Vite, Vitest, Playwright, Zod și componentele/tokenurile UI existente.

**Spec:** [Task 8 principal](2026-10-23-implementation.md#task-8-itinerar-pe-zi-listăhartă-detalii-și-buddy-cas), limitat aici la vizualizarea locală explicit separată; machetele aprobate din [detaliile aprobate ale unui loc](../mockups.md#detaliile-unui-loc-pe-telefon--machetă-aprobată) și [itinerarul zilnic](../mockups.md#itinerariul-unei-zile-pe-telefon--listă-și-hartă-pentru-evaluare) sunt referințe de compoziție, nu surse de fapte turistice.

## Constrângeri globale

- Nu conectați această rută la Task 5A, Task 6A ori Task 7A; finalizarea Task 7A nu este un plan confirmat.
- Fixture-urile sunt sintetice, deterministe, vizibil etichetate fictive/neconfirmate; URL-urile folosesc domeniul `.invalid` ca text inert. Fără imagini, fotografii sau afirmații turistice reale inventate.
- Interfața este disponibilă numai prin intrare/rută explicită și folosește RO implicit, EN și FR.
- Se refolosesc contractele Place/DayPlan/Stop/Itinerary și tokenurile/fontul/componentele UI deja existente.
- Numai memorie de proces: itinerar, zi, oprire deschisă și limbă dispar la reload; explicați acest lucru vizibil.
- Excluse: hartă/geocodare/rute/distanțe/durate, editare/ștergere/reordonare, Buddy/chat/propuneri/confirmări/CAS/sync, HTTP/AI/auth/endpointuri, persistență/offline și date personale, de sănătate ori rezervări.
- Task 8 complet păstrează dependențele originale Tasks 1, 3, 5–7, P-02/P-03/P-04 și routing live P-10 separat; probele Task 8 P-02/P-03/P-04 rămân deschise. P-06/P-07 rămân legături ale generării, nu înlocuiesc probele Task 8. P-09 este FAIL (10/100 cold peste 7 ms, p95 exact necunoscut); B1/Task 3/backend online rămân blocate. Nu reluați probe reale, servicii, deployment sau publicare.

## Contract și structură

**Fișiere propuse după inspecția arborelui curent:**
- Creează `src/domain/itinerary/demo.ts` pentru fabricarea fixture-urilor și validarea la limită.
- Creează `src/features/itinerary/ItineraryPage.tsx` pentru lista zilelor și a opririlor ordonate.
- Creează `src/features/itinerary/PlaceDetail.tsx` pentru detaliile opririi selectate și acțiunea de revenire.
- Creează `src/features/itinerary/messages.ts` pentru mesaje RO/EN/FR.
- Creează `src/features/itinerary/itinerary.css` pentru layout local folosind sistemul vizual existent.
- Modifică `src/app/router.ts` (nu `router.tsx`) pentru ruta dedicată `itinerary-demo` și `src/app/App.tsx` pentru starea în memorie, titlu/localizare, legătură explicită din home și montarea paginii.
- Creează `tests/unit/itinerary/demo.test.ts` și `tests/unit/itinerary/navigation.test.ts`.
- Creează `tests/e2e/itinerary-demo.spec.ts` pentru fluxul UI izolat.

**Contract domeniu:** `DemoScenario = 'standard' | 'invalid'`; `loadItineraryDemo(scenario): Result<Itinerary>` validează prin contractele `Place`, `DayPlan`, `Stop`, `Itinerary` și `parseItinerary` din `src/shared/contracts/itinerary.ts`. `createInitialItineraryDemoState(scenario?): ItineraryDemoState`, `itineraryDemoReducer` și `selectItineraryDemo(state) -> { day: DayPlan | null; stop: Stop | null }` gestionează starea și selecția fără excepții către App. Starea are `scenario`, `result`, `selectedDayNumber` și `selectedStopId`. Acțiunile sunt `load-scenario`/`scenario`, `select-day`/`dayNumber`, `open-stop`/`stopId` și `close-details`. App deține reducerul; locale rămâne stare externă. Numele sunt contractul convenit, nu orientative. Fixture-ul are exact trei zile: ziua 1 are trei opriri; ziua 2 are două opriri și date opționale necompletate; ziua 3 este goală. Place-urile au `confidence: 'unconfirmed'`, `matchReasons` explicite și cel puțin o `SourceRef` cu URL `.invalid`. Contractul comun cere `location`; coordonatele sintetice rămân doar pentru validare și nu apar în UI. Omit `photo` și `route`; fixture-ul nu conține valori de preț, program sau rezervare. UI poate afișa numai mesajele localizate „neprecizat”/„de verificat”, fără valori ori acțiuni reale de rezervare. Ordinea `DayPlan.stops` este ordinea afișării; nu sortați implicit.

**Contract UI/stare:** App folosește `useReducer(itineraryDemoReducer, scenario, createInitialItineraryDemoState)` și deține locale separat. Erorile rămân în `Result` și UI, fără throw care să prăbușească App. Schimbarea limbii păstrează ziua și oprirea; navigarea în aplicație păstrează aceeași instanță. Detaliul afișează numele fixture-ului, contextul „Ziua N · Oprirea M”, descrierea ori mesajul localizat pentru lipsă, starea neconfirmată și sursa inertă. Revenirea închide detaliul și păstrează ziua, ordinea și focusul util: focus pe controlul opririi care a deschis detaliul (ref/ID stabil); dacă acel element nu mai există, focus pe titlul listei zilei. Nu se deschide linkul `.invalid`.

Ziua goală afișează stare goală localizată fără carduri inventate. Data absentă afișează explicit „dată neprecizată”. Ziua nevalidă/necunoscută ori oprirea absentă conduce la eroare localizată cu control de întoarcere către lista zilei/itinerarul, fără a ascunde ori repara fixture-ul implicit în tăcere.

## Riscuri de verificat

- Fixture invalid sau cu ID-uri duplicate: parserul refuză încărcarea și UI arată eroare locală sigură.
- Parametru zi/opriere necunoscut: nu afișează detalii ale altei opriri și oferă revenire.
- Zi goală și date opționale absente: fiecare are mesaj separat, fără text gol sau date fabricate.
- Revenire după schimbarea limbii/navigare: contextul rămâne coerent, iar focusul este vizibil și util.
- Reload: toate stările sunt resetate, iar explicația memoriei rămâne vizibilă.

## Sarcini TDD

Bifați numai rezultatele susținute de loguri sau de raportul final. Pașii TDD fără RED comportamental separat rămân nebifați, chiar dacă verificarea ulterioară a trecut. Raportul consemnează explicit unde jurnalul nu demonstrează ordinea RED/GREEN.

### Sarcina 1: Fixture validat și determinist

**Fișiere:** creează `src/domain/itinerary/demo.ts`, `tests/unit/itinerary/demo.test.ts`.

- [ ] **Pasul 1 — RED pentru fixture-ul valid:** adaugă testul pentru loader-ul standard; verifică exact trei zile (3 opriri, 2 opriri, 0 opriri), ordinea ID-urilor, `unconfirmed`, sursă `.invalid`, absența fotografiei/rutei și a valorilor de preț/program/rezervare și faptul că rezultatul trece `parseItinerary`. Testul inițial a eșuat fiindcă fixture-ul valid lipsea. Mesajele localizate pentru date neprecizate sunt verificate în UI.
- [ ] **Pasul 2 — RED confirmat:** rulează `npm run test -- tests/unit/itinerary/demo.test.ts`; se așteaptă eșecul aserțiunii de comportament a testului nou. Testul de izolare a apelurilor a fost oprit de precondiție; nu îl numărăm RED. Izolarea a trecut după implementare, fără RED separat. Import lipsă sau precondiție eșuată nu certifică RED pentru aserțiunile ulterioare.
- [x] **Pasul 3 — implementare minimă:** creează fixture-ul stabil și loader-ul Result, care returnează rezultatul validat sau eroarea de validare fără throw în App.
- [ ] **Pasul 4 — GREEN și caz invalid:** adaugă test separat pentru scenariul invalid; verifică `Result` de eroare, fără throw, prin aceeași cale publică a loader-ului. Dovedește întâi RED la aserțiunea de eroare. Nu testa doar importuri.
- [x] **Pasul 5 — verifică:** `npm run test -- tests/unit/itinerary/demo.test.ts`; ambele comportamente PASS.

Jurnalul domeniului relatează RED pentru fixture-ul standard absent, issues invalide goale, ID-uri nesintetice și selectarea Zilei 2. Nu păstrează loguri RED brute independente. Testul de izolare s-a oprit la precondiție; izolarea și testele finale au trecut ulterior GREEN. De aceea pașii RED 1, 2 și 4 rămân nebifați.

### Sarcina 2: Listă pe zi și navigare către detaliu

**Fișiere:** creează componentele/messages/CSS de mai sus; modifică `src/app/router.ts`, `src/app/App.tsx` și `playwright.config.ts`; creează `tests/unit/itinerary/navigation.test.ts` și `tests/e2e/itinerary-demo.spec.ts`. Înregistrează proiectul Playwright separat cu `testMatch` exact pe fișierul E2E 8A și configurația preview local existentă.

- [ ] **Pasul 1 — RED pe selectarea zilei și ordinea opririlor:** testul verifică selectarea explicită a Zilei 2 și ordinea exactă a ID-urilor afișate din fixture. Rulează testul focalizat și obține eșec la comportament, nu import.
- [x] **Pasul 2 — implementare minimă:** ruta și intrarea vizibilă explicit deschid vizualizatorul; lista zilelor selectează o singură zi, iar opririle se redau în ordinea array-ului. Adaugă etichetele fictiv/neconfirmat și nota numai-memorie în toate cele trei limbi.
- [x] **Pasul 3 — GREEN:** `npm run test -- tests/unit/itinerary/navigation.test.ts`; verifică trecerea selectării/ordinii și fallback-ul limba RO la prima încărcare.
- [ ] **Pasul 4 — RED/GREEN stări lipsă:** teste separate pentru ziua 3 goală și datele opționale absente din ziua 2; pentru fiecare dovedește eșec la aserțiunea de mesaj înainte de UI, apoi implementează mesajele distincte RO/EN/FR și verifică DOM-ul accesibil.
- [ ] **Pasul 5 — RED/GREEN intrare invalidă:** test separat pentru zi necunoscută și oprire necunoscută; dovedește eșec comportamental, apoi afișează eroare localizată cu cale clară de revenire și fără a substitui altă oprire.

Testele pentru zi necunoscută și oprire necunoscută erau deja GREEN înainte de RED separat. S01 a avut RED doar pentru lipsa butoanelor explicite de revenire la zi/listă; acele corecții au trecut GREEN. Pasul 5 rămâne nebifat pentru RED-ul comportamentului invalid.

### Sarcina 3: Detaliu și revenire cu context/focus

**Fișiere:** modifică `ItineraryPage.tsx`, `PlaceDetail.tsx`, `App.tsx`, messages/CSS; extinde testele unitare și E2E.

- [ ] **Pasul 1 — RED detaliu:** test focalizat verifică numele, ziua/poziția, descrierea disponibilă, starea neconfirmată și sursa inertă `.invalid`; confirmă că nu există anchor activ sau navigare de rețea. Testul trebuie să eșueze pe aserțiunea de conținut, nu la montare.
- [x] **Pasul 2 — implementare minimă:** afișează panoul de detalii cu buton de revenire, asociat controlului sursă prin ref/ID stabil; fără acțiuni neincluse în scope.

Logurile UI dovedesc RED pentru textul de context „Ziua 1 / Oprirea 2” absent și pentru focusul lipsă pe Zinnia după navigare. Testele finale au trecut GREEN pentru context, detalii și revenire, dar RED-ul nu acoperă toate aserțiunile grupate în pașii 1 și 3. Acești doi pași rămân nebifați.
- [ ] **Pasul 3 — RED/GREEN revenire:** testul deschide oprirea din Ziua 2, schimbă limba, revine și verifică aceeași zi, aceeași ordine, detaliul închis și focusul vizibil pe controlul sursă. Dovedește RED pe verificarea de context/focus înainte de codul aferent; implementează starea controlată și restaurarea focusului.
- [ ] **Pasul 4 — RED/GREEN navigare și reload:** test separat verifică păstrarea contextului la schimbarea rutei și limbii, apoi reload cu revenire la RO, ziua inițială și fără detaliu deschis. Dovedește RED la fiecare rezultat relevant înainte de implementarea sa; reîncărcarea trebuie să arate explicația că starea se resetează.
- [x] **Pasul 5 — verificări locale:** `npm run test -- tests/unit/itinerary` și `npm run test:e2e -- tests/e2e/itinerary-demo.spec.ts`; apoi `npm run typecheck`, `npm run lint`, `npm run build`.
- [x] **Pasul 6 — probe browser pentru predare:** pe build local, verificați RO/EN/FR la viewport 320, 390, 768 și 1440 px; includeți zoom CSS 200% ca aproximare și notați că zoom-ul nativ nu s-a executat. Verificați tastatură/focus și reduced motion, ziua 3 goală, date opționale lipsă, intrare invalidă, detalii/revenire, context la navigare/limbă și reset la reload. Inspectați zero cereri externe și zero scrieri în localStorage/sessionStorage/IndexedDB, plus absența imaginilor, hărților, timpilor/distanțelor și controalelor excluse. Păstrați scriptul, logurile, raportul JSON, capturile și condițiile exacte în `docs/evidence/2026-11-03/task-8a-local-itinerary-viewing.md`.
- [x] **Pasul 7 — închidere de proces:** reviewerul raportează defecte cu ID, severitate, fișier/linie, comportament și rezultat așteptat; autorul remediază și reviewerul reverifică. Coordonatorul verifică integrarea completă. Nu marcați Task 8 complet și nu atribuiți PASS probelor integrale.

## Dovezi păstrate și interdicții de rerulare

Păstrați ca istoric, fără modificare sau rerulare: raportul Task 7A `docs/evidence/2026-11-02/task-7a-local-generation.md`, logurile și capturile aferente lui; raportul P-09 `docs/operations/2026-11-02-cpu-rerun.md` și limitele sintetizate în `docs/memory.md`. Acestea nu sunt probe pentru Task 8A. Nu rulați CPU/CAS/iPhone, P-03/P-04/P-06/P-07 reale, nu atingeți fixture-uri reale sau servicii și nu porniți deployment/publicare. Dovezile Task 8A trebuie să fie exclusiv din fixture local și build/test local; notați fiecare comandă efectivă, rezultatul integral relevant și orice verificare neexecutată.
