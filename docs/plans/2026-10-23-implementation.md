# Travel Buddy MVP Implementation Plan

## Execuție curentă — 2026-10-23
Utilizatorul a autorizat implementarea, începând cu Tasks 0, 1 și 1b, apoi activarea serviciilor gratuite și publicarea. [Contractele wire v1](../contracts-v1.md) sunt înghețate înaintea parserelor. Alegerea locală este React 19/TypeScript strict/Vite/Zod. Gate B1 rămâne obligatoriu pentru Task 3/backend live; Task 2 local este separat și autorizat la 2026-11-02 prin handoff. Starea accesului este consemnată în [conectarea conturilor și accesul rețelei](../cloud-access.md). Plata/cardul/billing nu sunt autorizate. Formulările despre neautorizare de mai jos sunt istoricul redactării planului.

> **For agentic workers:** Urmați `docs/process.md`: implementare delegată, review, remediere și verificarea finală a coordonatorului task cu task. Bifați fiecare pas (`- [ ]`) pe măsură ce este executat. Nicio probă, implementare, activare de serviciu sau publicare din acest plan nu este autorizată de documentul în sine.

**Goal:** Construim un MVP privat, accesibil online celor două conturi, pentru preferințe individuale, vacanțe comune și itinerarii editabile, cu consultarea manuală a unei copii offline pe fiecare telefon.

**Architecture:** Interfața este o PWA statică, iar API-ul Worker protejat aplică autorizarea și regulile comune înainte de persistența în baza de date. Furnizorii de căutare, generare, geocodare și rute sunt accesați prin adaptoare cu plafoane explicite; stările și confirmările produsului rămân controlate de aplicație. Copia offline este o fotografie locală atomică a itinerariului în limba contului.

**Tech Stack:** Propunere de evaluat, nu aprobată de utilizator: React + TypeScript + Vite PWA; Cloudflare Pages + Worker API + D1; Firebase Auth Spark numai pentru identitate; Tavily Free, Groq Free și Geoapify Free prin adaptoare. Nu se planifică R2 sau Firebase Storage; asseturile editoriale stau în Pages, iar URL-urile externe se folosesc numai în limitele drepturilor/licenței și ale proxy-ului restricționat. Nu faceți upgrade automat și nu activați billing.

**Spec:** `docs/product.md`, `docs/design-system.md`, `docs/architecture.md`, `docs/feasibility.md`, `docs/mockups.md`, `docs/verification.md`; probele și limitele tehnice sunt în `docs/plans/2026-10-23-technical-probes.md`.

## Global Constraints

- Produs pentru exact două conturi alăturate administrativ; fără înregistrare publică, invitații publice sau partajare către alte persoane.
- Conturile au preferințe și limbi proprii; vacanța și itinerariul sunt comune, iar ambele persoane pot consulta și modifica planul online.
- Limbi UI și conținut: română, engleză, franceză; implicit română. Nicio schimbare de limbă nu creează o copie separată a vacanței comune.
- Cele cinci categorii de preferințe se parcurg pentru profilul fiecărui cont; în fiecare categorie se alege cel puțin o preferință sau explicit „Nu am preferințe speciale aici”. Alergiile/intoleranțele sunt opționale și distincte de gusturi/refuzuri.
- Refuzul explicit al oricăruia exclude activitatea din planul comun; „nu mă interesează, dar pot participa” rămâne distinct. Nu se propune timp separat implicit.
- Fluxul de creare are trei pași; destinație și perioadă ori număr de zile, transport combinabil; cazări/baze multiple pe intervale și ore aproximative de sosire/plecare opționale; bugetul nu este obligatoriu.
- Planul este flexibil, fără program impus pe ore. Ordinea zilnică trebuie să țină cont de bază, transport și continuitate; harta online desenează geometria traseului dintre opriri, fără distanțe sau durate afișate. Transportul public poate fi marcat neconfirmat.
- Un loc recomandat afișează fotografia disponibilă, descrierea, prețul, sursa și motivul potrivirii. Datele lipsă nu se inventează; prețul/programul neconfirmat are marcaj și link. Fotografiile folosite trebuie licențiate corespunzător.
- Loc adăugat prin nume/link poate avea rezultate ambigue; aplicația cere alegere/confirmare înainte de integrare și păstrează opririle deja alese.
- Propunerile lui Buddy nu schimbă planul până la confirmarea explicită a unui singur participant. La versiune veche: CAS respinge scrierea, cererea rămâne, propunerea se adaptează la planul curent și necesită reconfirmare. Operațiile retry-safe au idempotency key.
- Generarea raportează progres pe baza etapelor măsurabile și separă succesul complet, parțial, întrerupt și eșuat; nu afișează succes complet dacă lipsește o zi sau etapă obligatorie.
- Salvarea offline este manuală, per dispozitiv, în limba contului; include toate zilele, ordinea, informațiile aprobate, fotografiile disponibile, cazări și sugestii păstrate. Actualizarea atomică păstrează ultima copie completă la eșec. Harta și recomandările/conversațiile noi cer internet. O sesiune expirată cât timp dispozitivul este offline poate consulta snapshotul propriu deja salvat până la logout; logout șterge snapshotul, blobs și cache-ul privat local.
- Pagina introductivă are șase secțiuni aprobate, derulare calmă și progresivă; folosește fontul real Bricolage Grotesque, 2 imagini Lisabona autorizate/recuperate și traseu decorativ accesibil. Dacă referințele imaginilor Lisabona nu sunt recuperabile, acesta este un ticket de asset deschis și nu justifică înlocuirea cu imagini inventate ori blocarea fundației.
- Direcție aprobată: verde pădure, alb cald, auriu; aspect de jurnal/pașaport, Buddy leneș discret și prietenos; machetele aprobate sunt în `docs/mockups.md`. Nu recreați machete și nu redeschideți compromisurile confirmate.
- Limitele planurilor gratuite sunt stricte: oprire controlată la plafon, fără plată automată, fără servicii pay-as-you-go și fără secrete în browser. Costul zero este obiectiv de ofertă gratuită, nu promisiune de disponibilitate nelimitată.
- Toate fișierele de aplicație menționate mai jos sunt **PLANIFICATE** și inexistente până la execuția autorizată; fișierele cu probe, design sau arhitectură rămân documentație, nu aplicație.
- Nicio probă viitoare nu se execută înainte de autorizarea etapei. Acest plan nu creează conturi/chei, nu activează servicii, nu publică site-ul și nu acordă aprobare pentru implementare.

## Review Focus

- Date concurente de la cele două conturi: nu se pierde nicio schimbare aprobată, iar operația învechită cere reconfirmare (Task 8).
- Date externe incomplete, ambigue, nevalide ori în altă limbă: utilizatorul vede incertitudinea și alege explicit înainte de a salva (Tasks 6–7).
- Limite, timeout-uri, răspunsuri parțiale și retry-uri ale serviciilor: starea reflectă realitatea, quota nu se depășește intenționat și idempotency nu dublează modificări (Tasks 5–7).
- Dispozitiv offline cu stocare insuficientă, snapshot invalid sau întrerupere la actualizare: ultima copie completă rămâne utilizabilă. Logout șterge datele locale private; expirarea sesiunii offline permite numai snapshotul deja salvat până la logout (Task 11).
- Preferințe contradictorii, profil incomplet sau schimbare de limbă: refuzurile, starea necunoscută și alegerea categoriei goale nu se confundă; profilul obișnuit nu se suprascrie (Tasks 4, 6).

---

## Contracte de proiect și hartă de fișiere

Toate căile din această secțiune sunt planificate, inclusiv fișierele aplicației. Contractele canonice se definesc înainte de delegarea implementării și se păstrează compatibile între taskuri.

**Aplicație planificată:**

- `package.json`, `vite.config.ts`, `tsconfig.json`, `wrangler.toml`, `index.html`: scripts și setări Vite/Worker.
- `src/app/router.tsx`, `src/app/App.tsx`: rutare și shell UI; `src/app/i18n/{ro,en,fr}.ts`: toate cheile și textele locale.
- `src/shared/contracts/{auth,preferences,trip,itinerary,generation,offline,provider}.ts`: scheme TypeScript partajate API/UI, cu versionare pentru payload-urile persistate.
- `src/domain/preferences/{model,service}.ts`; `src/domain/trips/{model,service}.ts`; `src/domain/itinerary/{model,rules,service}.ts`; `src/domain/generation/{model,orchestrator}.ts`: reguli fără acces direct la React sau DB.
- `src/server/{auth,env,errors}.ts`; `src/server/routes/{profile,trips,preferences,itinerary,generation,places,offline}.ts`; `src/server/repositories/{d1-profile,d1-trip,d1-itinerary}.ts`; `src/server/providers/{tavily,groq,geoapify,images}.ts`: API, verificare acces, persistență și adaptoare externe.
- `src/features/{intro,auth,trips,preferences,trip-creation,generation,itinerary,place-detail,buddy-chat,offline}/`: componente, formulare și interacțiuni organizate pe funcționalitate.
- `src/ui/{Button,Card,Field,Dialog,Toast,Loading,EmptyState,ErrorState}.tsx`, `src/ui/tokens.css`, `src/ui/global.css`: componente și tokenuri conforme design-system.
- `src/pwa/{register-sw,cache-policy}.ts`, `src/offline/{db,snapshot,repository}.ts`: cache static separat de date private și snapshot atomic.
- `migrations/0001_initial.sql`, `migrations/0002_generation.sql`: tabele/indexuri/revizii/idempotency/membership.
- `tests/unit/`, `tests/api/`, `tests/e2e/`, `tests/fixtures/`: teste semnificative de domeniu, API concurent, flux și accesibilitate.
- `public/assets/{font,illustrations,destinations}`: font și ilustrații cu proveniență/licență. Fotografiile Lisabona rămân pending dacă lipsesc sursele exacte.

**Contracte compacte, normative pentru taskurile ulterioare:**

```ts
type Locale = 'ro' | 'en' | 'fr';
type PreferenceAnswer = 'strong_like' | 'try' | 'no_interest' | 'hard_no' | 'eat' | 'avoid';
type CategoryCompletion = { categoryId: string; complete: boolean; noSpecialPreferences: boolean };
type Profile = { uid: string; locale: Locale; descriptionLocale: Locale; categories: CategoryCompletion[]; preferences: Preference[]; avoidFoods: string[]; allergies: string[]; intolerances: string[] };
type Trip = { id: string; revision: number; memberUids: [string, string]; destination: PlaceRef; dates: { start?: string; end?: string; days: number }; transport: ('walk'|'transit'|'car')[]; bases: BaseStay[]; arrivalTime?: string; departureTime?: string; budget?: Money };
type Place = { id: string; name: string; location: LatLng; description?: string; price?: Money; opening?: string; reservation?: string; photo?: LicensedImage; sources: SourceRef[]; confidence: 'verified'|'unconfirmed'; matchReasons: string[] };
type Itinerary = { tripId: string; revision: number; days: DayPlan[]; locale: Locale };
type DayPlan = { date?: string; baseId?: string; stops: Stop[]; route?: { geometry: string; provider: string; confidence: 'verified'|'unconfirmed' } };
type Proposal = { id: string; tripId: string; baseVersion: number; request: BuddyRequest; preferenceFingerprint: string; immutablePatch: ChangePatch; patchHash: string; appliedReceipt?: AppliedReceipt };
type GenerationJob = { id: string; status: 'queued'|'running'|'partial'|'complete'|'quota_exhausted'|'failed'; attemptId?: string; claimVersion: number; leaseToken?: string; checkpoint?: JsonValue; stage: string; completed: number; total: number; resultTripVersion?: number; errorCode?: string };
type OfflineSnapshot = { schemaVersion: number; ownerUid: string; tripId: string; revision: number; locale: Locale; sessionGeneration: number; savedAt: string; payload: Itinerary; assets: PhotoManifestEntry[]; checksum: string };
type ApiResult<T> = { ok: true; data: T; requestId: string } | { ok: false; error: { code: string; messageKey: string; retryable: boolean }; requestId: string };
```

`Preference` are categorie/subcategorie/item concrete, cu răspuns validat în funcție de domeniu; `no_interest` și `hard_no` există pentru activități, iar răspunsurile alimentare folosesc `eat`/`avoid`. Contractul wire se îngheață în documentație înainte de implementare, iar Task 1 implementează schemele/parser-ele corespunzătoare; UI și API nu pot schimba unilateral tipurile. Se precreează administrativ două conturi Firebase Email/Password cu email verificat; signup UI/API și invitații publice nu există. Allowlist exactă de UID + claim `email_verified` și membership în DB protejează fiecare resursă. UI afișează `revision`; pe wire toate mutate requests folosesc `expectedVersion=revision`, iar propunerea immutable păstrează `baseVersion`. D1 CAS-ul este un UPDATE unic condiționat de `trip_id`, `expectedVersion`, membership, proposal immutable pending/baseVersion/fingerprint și absența receipt-ului; același D1 `batch()` atomic conține UPDATE și INSERT receipt, iar INSERT este efectuat numai dacă `last_mutation_nonce` corespunde, receipt unic `(trip_id, uid, idempotency_key)` și `proposal_id`. Batch este atomic, fără interactive transaction presupusă. Joburile au `attemptId`, `claimVersion`, `leaseToken`, checkpoint și scrieri fenced; cota externă se rezervă conservator, timeout-ul poate dubla apelul furnizorului și nu promitem exactly-once extern.

**Dependențe externe planificate:** React 19, TypeScript strict, Vite, router cu history fallback compatibil Pages, validator scheme runtime (Zod sau echivalent ales în Task 1), Vitest, Playwright, MapLibre GL JS, Firebase Auth SDK, Wrangler. Nicio dependență nu se instalează în redactarea planului; probele determină versiunile compatibile.

## Etape, gates și coordonare

1. **Gate A — pregătire:** `docs/design-system.md`, `docs/architecture.md`, planul probelor și Task 0 harness local. Task 1 îngheață scheme înainte de implementarea tipurilor.
2. **Gate B1 — probes server/dispozitiv după Task 1 + Task 1b:** conform autorizării și accesului: P-01 auth/API, P-02 D1 CAS real, P-09 Worker CPU și mini P-12-A offline pe shell instalabil Task 0. P-09 cere ≥100 cold + ≥100 warm, JSON ≤256 KiB, zero CPU terminations, p95 ≤7 ms; peste 7 ms reconsiderare fără paid fallback. P-02 CAS + receipt batch; rowcount 0 fără applied. P-12-A verifică manual save, cold launch, mod avion și update întrerupt pe device înainte de UI extinsă.
3. **Gate C — UI local și backend:** Task 2 (fundație UI locală) poate începe după Tasks 0–1 fără a depinde de B1. Task 3 și auth/API privat/live backend așteaptă B1 PASS. Task 4A local este autorizat separat după Tasks 1–2, conform contractului din 2 noiembrie. Task 4 complet păstrează dependența de Task 3; celelalte taskuri pornesc numai conform dependențelor și autorizării aplicabile.
4. **Gate D — fluxuri:** Tasks 5–10 în ordinea dependențelor; probe locale P-03–P-08 se rulează lângă implementarea deținătoare, nu ca prerequisite pentru shell. P-03 înainte/în Task 7–8; P-04 lângă Task 8; P-05/P-06/P-07 lângă Task 6–7; P-08 lângă Task 11.
5. **Gate E — offline real:** Task 11 după Task 2/3/5/8/10; P-12 iOS/Safari + Android numai după build-ul snapshot și autorizarea testelor pe dispozitive. Logout invalidează `sessionGeneration`, blochează citirea snapshotului imediat, apoi șterge IndexedDB/private cache; purge întrerupt nu permite alt UID să citească.
6. **Gate F — live providers/integrated review:** P-10/P-11 după probe locale și numai cu autorizare de furnizor; Task 12 după tasks/probes. Două conturi și două telefoane, itinerary RO/EN/FR, airplane mode. Publicarea/activarea rămâne în afara planului fără autorizare explicită.

**Valuri planificate (numai după autorizarea implementării):**

| Val | Taskuri/agenți paralelizabili | Dependențe | Gate/integrare |
|---|---|---|---|
| 0 | Task 0, un agent | Gate A | shell local trece typecheck/test/lint/build |
| 1 | Task 1, un agent | Task 0 + documente de arhitectură/design/probe | contract review înainte de codul UI/API |
| B1 | Task 1b: probe reale P-01, P-02, P-09 și mini P-12-A secvențial; spike-ul server e separat de UI | Tasks 0–1 + autorizările specifice D1/Worker/phone | FAIL P-09 blochează Task 3/backend live; UI local Task 2 poate continua. CAS/telefon păstrează gate-urile lor |
| 2 | Task 2 local | Tasks 0–1 și contracte vizuale; nu depinde de Gate B1 | mock/synthetic only; nu contactează serverul; gate separat pentru backend |
| 3 | Task 3 | Task 2 + Gate B1 PASS și probe live P-01/P-09 | auth merge înainte de date reale; cât P-09 eșuează, taskul rămâne blocat |
| 4A local | Task 4A — carnete demonstrative | Tasks 1–2; autorizare explicită 2026-11-02 | numai memorie; fără backend; nu finalizează Task 4 |
| 4 | Restul Task 4 și Task 9 pot fi separate după Task 2–3; distincte paths | contracts + shell + login interface pentru CTA | UI review separat; Task 9 deține singur IntroPage |
| 5 | Task 5; Task 6 poate lucra în paralel pe adapters/domeniu cu paths disjuncte | Task 4 pentru trip; Task 1 + provider contract pentru Task 6 | wrangler/env bindings și lockfile integrate serial; P-05/P-06 locale |
| 6 | Task 7 | Tasks 5–6; P-03/P-06/P-07 locale | migrarea job-urilor și bindings integrate serial |
| 7 | Task 8 | Task 7 și Task 5–6; P-02/P-03/P-04 | CAS/concurrency review înainte de UI acceptare |
| 8 | Task 10 | Task 8 | limbile per cont și aceleași trip/version |
| 9 | Task 11 | Tasks 2,3,5,8,10; P-08; P-12 numai cu device auth | atomic snapshot, owner isolation, logout |
| 10 | Task 12 | toate tasks; P-09–P-12 după autorizațiile lor | reviewer integrat/retest și handoff |

**Reguli de delegare:** fiecare task de implementare/remediere este trimis unui agent `gpt-6-luna`, cu contractul taskului, fișierele exacte și skill-ul numit explicit. Se pot rula în paralel numai taskurile independente cu fișiere disjuncte și contracte înghețate; fără plafon global arbitrar de agenți. Configurarea, migrațiile, provider bindings și lockfile comune rămân seriale. Reviewer-ul taskului este coordonatorul; pentru review integrat dificil se folosește un agent `gpt-6.1-sol` dacă este disponibil. Skill-urile sunt `travel-buddy-engineering` pentru implementare, `writing-plans` pentru plan, `test-driven-development` pentru reguli/comportamente, `frontend-design` + `design-taste-frontend` pentru UI, `webapp-testing` pentru browser și `travel-buddy-review` la final. La fiecare skill nou invocat, executorul citește fișierul local indicat în `docs/skills.md` înainte de lucru.

## Taskuri

### Task 0: Harness local pentru teste și typecheck

**Fișiere:** Creează `package.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.js`, `index.html`, `src/main.tsx`, `public/manifest.webmanifest`, `src/pwa/sw.ts`, `tests/setup.ts`.

**Interfețe:** Scripts exacte: `test: vitest run`, `typecheck: tsc --noEmit`, `lint: eslint .`, `test:e2e: playwright test`, `build: vite build`. Dev dependencies: TypeScript, Vitest, ESLint, Vite, Playwright. Configurația nu cere chei sau servicii externe.

- [x] **Pasul 1:** Configurează scripts și discovery pentru `tests/unit`, `tests/api`, `tests/e2e`, fără test artificial sau import din contracte încă inexistente.
- [x] **Pasul 2:** Rulează `npm run test -- --passWithNoTests` — PASS cu zero teste; `npm run typecheck` — PASS pe shell gol.
- [x] **Pasul 3:** Rulează `npm run lint` și `npm run build` — PASS pentru `index.html`, shell `src/main.tsx`, manifest și service worker instalabil minimal.
- [x] **Pasul 4:** Rulează `npm run test:e2e -- --list --pass-with-no-tests` — PASS fără spec-uri; niciun script nu face apel la furnizori.

**Executant:** `gpt-6-luna`; **Skill:** `travel-buddy-engineering`; **Dependențe:** Gate A; doar harness local.

### Task 1: Înghețare scheme și schema MVP

**Fișiere:** Actualizează contractele din `docs/architecture.md`, `docs/plans/2026-10-23-technical-probes.md`; creează `src/shared/contracts/{auth,preferences,trip,itinerary,generation,offline,provider}.ts`, `src/domain/{preferences,trips,itinerary,generation}/model.ts`, `migrations/0001_initial.sql`, `tests/unit/contracts/*.test.ts`.

**Interfețe:** Completează cu `PlaceRef`, `BaseStay`, `Preference`, `Stop`, `Money`, `SourceRef`, `LicensedImage`, `PhotoManifestEntry`, `LatLng`, `ChangeSummary`, `SnapshotAsset`; scheme `parseX(input: unknown): Result<X, ValidationError>`. UI `revision` se mapează unic la wire `expectedVersion`; proposal folosește `baseVersion`. DB: `users`, `profiles`, `trips`, `trip_members`, `preferences`, `itinerary_revisions`, `generation_jobs`, `idempotency_records`, receipt unic `(trip_id,uid,idempotency_key)` și per `proposal_id`.

- [x] **Pasul 1:** Coordonatorul îngheață contractele wire și codurile API în documentație, inclusiv exact cinci categorii, `revision → expectedVersion`, lifecycle job și snapshot owner-scoped.
- [x] **Pasul 2:** Adaugă teste pentru `parseProfile`, `parseTrip`, `parseItinerary`, `parseGenerationJob`, `parseOfflineSnapshot`: payload valid roundtrip; `revision: -1`, locale `de`, status necunoscut, manifest foto incomplet ori snapshot fără `ownerUid` sunt respinse cu `ValidationError`.
- [x] **Pasul 3:** Rulează `npm run test -- tests/unit/contracts` — așteptat FAIL pentru parser-ele lipsă.
- [x] **Pasul 4:** Implementează parser-ele/schemele și migrarea SQL; compilează strict TypeScript.
- [x] **Pasul 5:** Rulează `npm run typecheck && npm run test -- tests/unit/contracts` — PASS; frontend și API folosesc același wire contract.
- [x] **Pasul 6:** Review gate înainte de paralelizare; CAS, job states și offline ownership au aserțiuni clare.

**Executant:** `gpt-6-luna`; **Skill-uri:** `travel-buddy-engineering`, `test-driven-development`; **Dependențe:** Task 0; design-system, architecture și technical-probes.

### Task 1b: Spike minim P-01/P-02/P-09/P-12-A pentru decizia de arhitectură

**Fișiere:** Creează `probes/auth-worker.ts`, `probes/cas-worker.ts`, `probes/cpu-runner.ts`, `probes/offline-pwa.ts`, `probes/migrations/0001_probe.sql`, `tests/probes/{auth-worker,cas-worker,cpu-runner,offline-pwa}.test.ts`; nu editează `src/` aplicației.

**Interfețe:** Harness-ul verifică JWT Firebase RS256 + claims + allowlist, membership D1; CAS este un D1 `batch()` cu un UPDATE condiționat (`expectedVersion`, membership, no receipt) și INSERT receipt guardat în același atomic batch; benchmark măsoară parsarea JSON ≤256 KiB, verifier/authz și D1. Receipt policy: conflict rowcount 0 => fără receipt/applied; duplicate key sau proposal răspunde receipt existent.

- [x] **Pasul 1:** Adaptează fixture-urile sintetice P-01/P-02/P-09 la contractele aprobate; păstrează modulele de spike în `probes/`.
- [x] **Pasul 2:** Testele celor patru probe sunt implementate. Cicluri RED→GREEN au fost confirmate pentru regresiile CAS/receipt, conflict 409 și izolare offline; logul global inițial cu toate modulele lipsă nu este păstrat și nu este certificat retrospectiv.
- [x] **Pasul 3:** Implementează numai minimum de probe pentru token invalid/UID outsider și două sesiuni concurente + duplicate receipt; fără UI, login form, provider adapter sau product data.
- [x] **Pasul 4 local:** Cele patru suite locale au trecut în verificarea integrată (75/75 teste totale), împreună cu 2 E2E Chromium și build-urile dedicate.
- [ ] **Pasul 4 real:** P-01/P-02/P-09 Cloudflare/Firebase și P-12-A iOS/Android necesită autorizarea și accesul specifice probei; SQLite/desktop nu le înlocuiesc. La momentul actual P-09 este FAIL și nu se rerulează fără autorizare separată. P-09 cere ≥100 cold + ≥100 warm, zero CPU terminations și p95 ≤7 ms la payload ≤256 KiB. `p95 >7 ms` ori failure CAS oprește Gate B1; nu se mută codul de spike în aplicație ca workaround.
- [x] **Pasul 5 local:** SQL-ul, versiunile, scenariile changes/receipts și limitele sunt consemnate; CPU p50/p95 real = neexecutat, fără valori inventate. Coordonatorul menține Gate B1 BLOCAT.
- [ ] **Pasul 5 real:** Arhivarea măsurătorilor CPU și rezultatelor API/telefon, apoi decizia Gate B1, după acord și acces.

**Executant:** `gpt-6-luna`; **Skill-uri:** `travel-buddy-engineering`, `test-driven-development`; **Dependențe:** Task 1 și shell-ul Task 0; Task 3/backend depinde de Gate B1 PASS; Task 2 local este separat. P-01/P-02/P-09 și mini P-12-A din technical-probes corespund acestui spike. Task 11 execută P-12-B full snapshot după MVP-ul offline.

**Stare curentă, 2026-11-02:** [captura CPU](../operations/2026-11-02-cpu-rerun.md) demonstrează că P-09 cold depășește 7 ms și eșuează pragul; eșantionul corelat este incomplet, iar p95 exact rămâne necunoscut. Gate-ul server B1 rămâne BLOCAT. Aceasta blochează Task 3 și folosirea unui backend real, dar nu dezvoltarea izolată a fundației locale Task 2. Dezvoltarea UI locală nu poate fi folosită ca dovadă sau remediere P-09.

### Task 2: Fundație aplicație, design tokens și localizare

**Fișiere:** Inspectează și modifică numai configurile existente care sunt necesare (`package.json`, `tsconfig.json`, `index.html`, `vite.config.ts`, `src/main.tsx`); adaugă module UI/i18n în structura `src/` deja existentă și, dacă justificat, font/licența în `public/assets/font/`. Nu adăuga `wrangler.toml` pentru UI locală. Păstrează configurile și probele PWA existente.

**Interfețe:** `App` furnizează router; `t(locale: Locale, key: MessageKey, args?: Record<string,string|number>): string`; componente UI primesc props accesibile și clase/tokens, nu culori hardcodate. UI-ul Task 2 operează numai cu stări demonstrative/mock și nu conectează Firebase, Worker sau D1.

- [x] **Pasul 1 — inventariere:** verifică fișierele și dependențele existente (Task 0–1, `src/main.tsx`, `src/shared/contracts/*`, configul Vite/TS/package); marchează ce se reutilizează și evită rescrierea probei server/offline.
- [x] **Pasul 2 — contract vizual:** extrage din `docs/design-system.md` valorile propuse (marcate în cod/documentație ca propuneri ajustabile), creează tokens CSS și componente comune accesibile: Button, Card, Field, Dialog, Toast, Loading, EmptyState, ErrorState; fără culori inline fixe.
- [x] **Pasul 3 — shell:** configurează routerul și navigarea locală responsive; traseele inexistente au fallback. Adaugă date mock explicite dacă e nevoie să demonstrezi interacțiunea; nu acceptă sesiune reală sau date private.
- [x] **Pasul 4 — localizare:** implementează catalog complet pentru cheile fundației în RO/EN/FR, cu româna implicită; `t` este tipizat, interpolarea sigură, iar cheile lipsă se detectează în verificare locală.
- [x] **Pasul 5 — asset font:** descarcă Bricolage Grotesque aprobat din sursa oficială când este necesar; self-host fișierul și păstrează OFL și proveniența lângă asset.
- [x] **Pasul 6 — verificare locală:** rulează verificările existente adecvate (`npm run typecheck`, `npm run lint`, testele fundației/i18n și `npm run build`); documentează exact comenzile și rezultatul. Acestea verifică numai codul local, nu serverul sau P-09.
- [x] **Pasul 7 — review:** coordonatorul verifică comportamentul/responsivitatea/accessibility, linkurile, difful și lipsa conectării backend; implementerul repară constatările și coordonatorul reverifică.

**Executant:** `gpt-6.1-terra` medium (conform D014); **Skill-uri:** `travel-buddy-engineering`, `frontend-design`, `design-taste-frontend`, `test-driven-development`, `webapp-testing`, `travel-buddy-review`; testele comportamentale i18n/router urmează fail-then-pass; smoke browser local; fără teste pentru CSS/documentație; **Dependențe locale:** Task 0–1 și contractele vizuale existente. **Gate server:** Task 3/live backend rămân blocate de Gate B1/P-09. Asset Lisabona poate rămâne ticket deschis.

**Snapshot 2026-11-02:** Task 2 local revizuit și verificat; [dovezi și limite](../evidence/2026-11-02/task-2-ui.md). Nu este acceptare online, iar Task 3 rămâne blocat de B1/P-09. Implementarea a fost livrată pe `main` prin `40198eda5bc83976ef3aaef8dcb0f8c2897bbf38`; push fără force confirmat, fără deploy. Actualizarea documentară de livrare urmează separat.

### Task 3: API auth, administrare celor două conturi și izolarea privată

**Fișiere:** Creează `src/server/{auth.ts,env.ts,errors.ts}`, `src/server/routes/profile.ts`, `src/server/repositories/d1-profile.ts`, `src/features/auth/{LoginPage.tsx,AuthProvider.tsx}`, `tests/api/auth.test.ts`, `tests/e2e/access-control.spec.ts`.

**Interfețe:** `verifyIdentity(token: string): Promise<VerifiedIdentity>` verifică RS256 și `aud/iss/exp/iat/auth_time/sub/email_verified`; `authorizeTrip(uid: string, tripId: string): Promise<TripMember>` interoghează membership; `requireAuth(request): Promise<Session>` fail-closed. Cele două conturi Firebase Email/Password și emailurile verificate se precreează administrativ; signup UI/API și public invite nu există. Allowlist-ul conține exact cele două UID.

- [ ] **Pasul 1:** Testează token expirat, aud/iss/sub greșit, email neverificat, lipsă auth_time, UID necunoscut/al treilea cont și acces trip străin; așteptat 401/403, fără data disclosure.
- [ ] **Pasul 2:** `npm run test -- tests/api/auth.test.ts` — FAIL inițial.
- [ ] **Pasul 3:** Implementează verifier Firebase ID JWT + allowlist/membership authorization; pagina login/reset password folosește Firebase Auth; API privat `Cache-Control: private, no-store`, CORS la originul aplicației. UID allowlist disable blochează următoarea cerere; logout local nu promite revocarea instantanee a tokenului deja emis.
- [ ] **Pasul 4:** Rulare `npm run test -- tests/api/auth.test.ts && npm run test:e2e -- tests/e2e/access-control.spec.ts` — PASS pentru ambii membri, FAIL CLOSED pentru nonmember; review loguri fără token/secrete.
- [ ] **Pasul 5:** Gate auth înainte de date reale; niciun user test extern persistent.

**Executant:** `gpt-6-luna`; **Skill-uri:** `travel-buddy-engineering`, `test-driven-development`; **Dependențe:** Tasks 1–2 și P-01/P-09.

### Task 4: Profiluri, cinci categorii, alergii și override per vacanță

**Separare autorizată, 2026-11-02:** [Task 4A local](2026-11-02-task-4a-local-preferences.md) extrage numai interfața demonstrativă a propriilor preferințe și depinde de Tasks 1–2. Task 4 complet rămâne nefinalizat; dependența sa de Task 3 se păstrează pentru autentificare, API, persistență, izolarea reală a profilurilor și ajustările per vacanță. P-09 FAIL/B1 blochează în continuare aceste părți. Checkboxurile de mai jos sunt ale Task 4 complet și nu se bifează prin realizarea 4A.

**Fișiere:** Creează `src/domain/preferences/service.ts`, `src/server/routes/preferences.ts`, `src/features/preferences/{PreferencesHome.tsx,CategoryNotebook.tsx,FoodNotebook.tsx,AllergyForm.tsx,PreferenceAnswer.tsx}`, `src/features/trips/TripPreferenceOverrides.tsx`, `tests/unit/preferences/*.test.ts`, `tests/api/preferences.test.ts`, `tests/e2e/preferences.spec.ts`.

**Interfețe:** `saveProfilePreferences(uid, patch): Promise<Profile>`; `saveTripOverrides(tripId, uid, patch): Promise<TripPreferenceOverride>`; `isProfileReady(profile): boolean`; răspunsurile exclusive, kategoriile cu `noSpecialPreferences` explicit; toate patch-urile validate server side.

- [ ] **Pasul 1:** Testează cele 5 categorii, necunoscut versus nu-mi pasă, food `eat/avoid`, note de crud/gătit, alergii opționale și distincte, refuz contra preferință, izolarea profilurilor și override fără mutarea profilului principal.
- [ ] **Pasul 2:** `npm run test -- tests/unit/preferences` — FAIL inițial.
- [ ] **Pasul 3:** Implementează model/service și carnetele; grupele concrete urmează `docs/product.md`, extensibile fără propagare implicită a stării la subtipuri.
- [ ] **Pasul 4:** `npm run test -- tests/unit/preferences && npm run test -- tests/api/preferences.test.ts && npm run test:e2e -- tests/e2e/preferences.spec.ts` — PASS; ambii utilizatori editează doar propriul profil și readiness se evaluează separat.
- [ ] **Pasul 5:** Browser review pe telefon: completare progresivă, ecran pentru alergii, stări necunoscute, limbă; explică sensibilitatea alergiilor UI simplu, fără a pretinde verificare de siguranță alimentară.

**Executant:** `gpt-6-luna`; **Skill-uri:** `travel-buddy-engineering`, `test-driven-development`, `frontend-design`; **Dependențe:** Task 1–3.

### Task 5: Vacanță comună, trei pași și carduri de destinație

**Fișiere:** Creează `src/domain/trips/service.ts`, `src/server/routes/trips.ts`, `src/server/repositories/d1-trip.ts`, `src/features/trip-creation/{TripWizard.tsx,DestinationTicket.tsx,TransportAndStay.tsx,PassportSummary.tsx}`, `src/features/trips/{TripsHome.tsx,TripCard.tsx}`, `tests/unit/trips/*.test.ts`, `tests/api/trips.test.ts`, `tests/e2e/trip-creation.spec.ts`.

**Interfețe:** `createTrip(uid, input): Promise<Trip>`; `updateTrip(uid, id, expectedVersion, patch, idempotencyKey): Promise<Trip>`; `listTrips(uid): Promise<Trip[]>`. Trip creează membri doar pe baza celor două UID administrativ asociate; bazele au intervale non-overlap validate, să nu fie obligatoriile.

- [ ] **Pasul 1:** Testează perioadă versus zile, interval invalid, transport combinat, lipsă cazare/buget/oră, mai multe baze, back/forward wizard cu state păstrat, membership exact, idempotency create.
- [ ] **Pasul 2:** `npm run test -- tests/unit/trips` — FAIL inițial.
- [ ] **Pasul 3:** Implementează model/API și trei pași vizuali conform „Bilet, bagaj, pașaport”; designul desktop/mobile degradabil și imaginile specifice destinației cu licență; folosește ilustrație locală temporară dacă fotografia Lisabona e pending.
- [ ] **Pasul 4:** `npm run test -- tests/unit/trips && npm run test -- tests/api/trips.test.ts && npm run test:e2e -- tests/e2e/trip-creation.spec.ts` — PASS; vacanța fără cazare/buget se salvează și poate fi reluată.
- [ ] **Pasul 5:** Reviewer verifică tastatură/atingere și navigarea fără drag; generarea pornește numai la butonul explicit final.

**Executant:** `gpt-6-luna`; **Skill-uri:** `travel-buddy-engineering`, `test-driven-development`, `frontend-design`, `design-taste-frontend`; **Dependențe:** Tasks 1–4.

### Task 6: Provider adapters, căutare și identificare locurilor

**Fișiere:** Creează `src/server/providers/{tavily,groq,geoapify,images}.ts`, `src/server/routes/places.ts`, `src/domain/itinerary/place-resolution.ts`, `src/features/itinerary/AddPlaceDialog.tsx`, `tests/unit/providers/*.test.ts`, `tests/unit/place-resolution.test.ts`, `tests/api/places.test.ts`.

**Interfețe:** `SearchProvider.search(query, locale, limit): Promise<SourceCandidate[]>`; `PlaceResolver.resolve(input: string, locale): Promise<Resolution[]>`; `ImageProvider.find(place): Promise<LicensedImage | null>`; `RoutingProvider.route(stops, mode): Promise<RouteResult>`; fiecare adapter aplică quota budget, timeout, retry policy, input/output schema și citește cheile numai din Worker env.

- [ ] **Pasul 1:** Contract-test fixtures pentru rezultate lipsă, surse duplicate, 429, timeout, invalid JSON, no photo, licensed photo, ambiguitate 0/1/n rezultate; numele sau linkul nu se integrează direct cât timp ambiguu.
- [ ] **Pasul 2:** `npm run test -- tests/unit/providers tests/unit/place-resolution.test.ts` — FAIL inițial.
- [ ] **Pasul 3:** Implementează provider adapters și dialog de disambiguation; o alegere păstrează sursa/confidence/licența și opririle. Foto fără drept de cache se omite explicit din offline manifest; dacă un asset declarat în manifest eșuează, snapshotul nou eșuează atomic. Nu inventa fotografie.
- [ ] **Pasul 4:** `npm run test -- tests/unit/providers tests/unit/place-resolution.test.ts && npm run test -- tests/api/places.test.ts` — PASS cu stubs locale, fără API keys.
- [ ] **Pasul 5:** Probe live sunt exclusiv sub autorizare și checklist-ul de `technical-probes`; limitele gratuite la epuizare returnează mesaj retryable și nu fac fallback cu cost.

**Executant:** `gpt-6-luna`; **Skill-uri:** `travel-buddy-engineering`, `test-driven-development`; **Dependențe:** Task 1, P-05/P-06; P-07/P-11 pentru calitate live. Binding/env comun se integrează serializat.

### Task 7: Generare cu progres adevărat și rezultate parțiale explicite

**Fișiere:** Creează `src/domain/generation/orchestrator.ts`, `src/server/routes/generation.ts`, `src/server/repositories/d1-itinerary.ts`, `src/features/generation/{GenerationPage.tsx,GenerationProgress.tsx,GenerationResult.tsx}`, `migrations/0002_generation.sql`, `tests/unit/generation/*.test.ts`, `tests/api/generation.test.ts`, `tests/e2e/generation.spec.ts`.

**Interfețe:** `startGeneration(uid, tripId, expectedVersion, idempotencyKey): Promise<GenerationJob>` creează job durabil; `runGenerationStep(jobId, attemptId): Promise<GenerationJob>` face claim/lease limitat, cu `claimVersion` monoton și `leaseToken` unic, checkpoint și fencing la toate writes; `getGeneration(uid, jobId): Promise<GenerationJob>`. UI face polling la 15s numai când tab-ul vizibil și permite retry manual după lease expiry. Stări canonice: `queued | running | complete | partial | quota_exhausted | failed`; status distinct, `partial` nu înseamnă `complete`. Reguli deterministe pentru hard-no, ambele profiluri, opening/booking flags, păstrarea alegerilor și fallback/base; modelul doar redactează în baza faptelor returnate.

- [ ] **Pasul 1:** Testează success `complete`, lipsă zi `partial`, quota `quota_exhausted`, timeout `failed/retryable`, stale lease-token nu scrie peste checkpoint nou, retry manual reia checkpoint, rezervare cotă conservatoare și un hard-no din fiecare profil.
- [ ] **Pasul 2:** `npm run test -- tests/unit/generation` — FAIL inițial.
- [ ] **Pasul 3:** Implementează endpoint de job-step cu lease/checkpoint/fencing, progres măsurabil, rezervare conservatoare de quota înainte de apel extern și output JSON validat. Timeout extern poate însemna provider-call duplicat; dedupe doar efecte locale și nu rambursa automat consum incert. Output insuficient devine `partial`, limită `quota_exhausted`, fără marcaj fals `complete`.
- [ ] **Pasul 4:** `npm run test -- tests/unit/generation && npm run test -- tests/api/generation.test.ts && npm run test:e2e -- tests/e2e/generation.spec.ts` — PASS cu provideri stub.
- [ ] **Pasul 5:** Test de integrare controlat și măsurare reală numai după autorizare; reviewer verifică că textul UI nu sugerează progres inventat.

**Executant:** `gpt-6-luna`; **Skill-uri:** `travel-buddy-engineering`, `test-driven-development`, `frontend-design`; **Dependențe:** Tasks 1, 5–6; P-03/P-06/P-07. Job-table migration se integrează serializat.

### Task 8: Itinerar pe zi, listă/hartă, detalii și Buddy CAS

**Fișiere:** Creează `src/domain/itinerary/{rules.ts,service.ts}`, `src/server/routes/itinerary.ts`, `src/features/itinerary/{ItineraryPage.tsx,DayTabs.tsx,StopList.tsx,DayMap.tsx,PlaceDetailSheet.tsx}`, `src/features/buddy-chat/{BuddyChat.tsx,ProposalSummary.tsx}`, `src/server/routes/proposals.ts`, `tests/unit/itinerary/*.test.ts`, `tests/api/proposals.test.ts`, `tests/e2e/itinerary.spec.ts`, `tests/e2e/concurrent-edits.spec.ts`.

**Interfețe:** `reorderStops(stops, base, mode): Stop[]`; mutation API folosește unicul wire argument `expectedVersion` (UI `revision`) + `idempotencyKey`. `createProposal(uid, tripId, expectedVersion, request): Promise<Proposal>` salvează proposal immutable `{proposalId, tripId, baseVersion, preferenceFingerprint, serverPatch, patchHash}`; `confirmProposal(uid, proposalId, expectedVersion, idempotencyKey): Promise<AppliedReceipt | ReconfirmRequired>`. Confirmarea rezolvă lookup receipt înaintea comparației; D1 batch face CAS atomic + receipt, fără interactive transaction. Retry cu aceeași cheie ori proposal deja aplicat întoarce receipt; base mismatch/preference fingerprint mismatch cere proposal nou.

- [ ] **Pasul 1:** Testează list/map view, one day phone, detail open/close restores scroll, route geometry, no distance/time copy, removing/replacing keeps all other stop IDs, stale proposal does not apply, duplicate key returns same receipt, same proposal with distinct key still has one effect, retry-after-response-timeout returns applied receipt.
- [ ] **Pasul 2:** `npm run test -- tests/unit/itinerary tests/api/proposals.test.ts` — FAIL inițial.
- [ ] **Pasul 3:** Implementează sortare/recomandare, harta online GeoJSON/MapLibre cu attribution și focus list; chat rezumă ce se schimbă/se păstrează. La mismatch, păstrează cererea, returnează `RECONFIRM_REQUIRED`, reconstruiește proposal immutable pe latest version și arată „Planul a fost modificat între timp”.
- [ ] **Pasul 4:** `npm run test -- tests/unit/itinerary tests/api/proposals.test.ts && npm run test:e2e -- tests/e2e/itinerary.spec.ts tests/e2e/concurrent-edits.spec.ts` — PASS; două sesiuni: confirmarea învechită nu scrie și retry nu dublează.
- [ ] **Pasul 5:** Reviewer independently verifies UI status `proposed/reconfirmation_required/applied`, single-person confirmation, accessibility of map and equivalent textual order.

**Executant:** `gpt-6-luna`; **Skill-uri:** `travel-buddy-engineering`, `test-driven-development`, `frontend-design`, `webapp-testing`; **Dependențe:** Tasks 1, 3, 5–7; P-02/P-03/P-04; routing live P-10 separat.

### Task 9: Pagina introductivă cu șase secțiuni și intrare spre login

**Fișiere:** Creează `src/features/intro/{IntroPage.tsx,StorySection.tsx,ProgressTrail.tsx}`, `public/assets/illustrations/{buddy,trip-flow}`, `tests/e2e/intro.spec.ts`.

**Interfețe:** intro publică nu returnează date private; CTA către login; fiecare secțiune are heading/description/asset key localizat; reduced-motion scurtează/înlătură transformările fără a ascunde conținut.

- [ ] **Pasul 1:** E2E verifică exact cele 6 momente: introducere, preferințele celor doi, destinație→itinerar, conversație+confirmare, plan offline, conectare; 2 imagini Lisabona cu surse corecte sau placeholder ilustrativ documentat, niciodată fotografie prezentată ca reală fără recuperarea referinței.
- [ ] **Pasul 2:** `npm run test:e2e -- tests/e2e/intro.spec.ts` — FAIL inițial.
- [ ] **Pasul 3:** Implementează derulare calmă și traseu progresiv, font real și Buddy discret; conținutul disponibil fără animații și pe reduced motion.
- [ ] **Pasul 4:** `npm run test:e2e -- tests/e2e/intro.spec.ts` — PASS în mobil/desktop; browser check font network/local load, overflow, contrast și skip navigation.
- [ ] **Pasul 5:** Asset Lisabona rămâne backlog explicit până la verificarea conversației/surselor; CTA nu promite servicii care nu au trecut probele.

**Executant:** `gpt-6-luna`; **Skill-uri:** `travel-buddy-engineering`, `frontend-design`, `design-taste-frontend`; **Dependențe:** Task 2; Task 3 doar pentru conectarea CTA la LoginPage (IntroPage este deținut exclusiv de Task 9).

### Task 10: Limbă per cont și server-side catalog de conținut

**Fișiere:** Creează `src/domain/itinerary/localize.ts`, `src/server/routes/locale.ts`, `src/features/app/LocaleMenu.tsx`, extinde `src/app/i18n/{ro,en,fr}.ts`, `tests/unit/localize.test.ts`, `tests/api/locale.test.ts`, `tests/e2e/language.spec.ts`.

**Interfețe:** `setAccountLocale(uid, uiLocale, descriptionLocale): Promise<Profile>`; `getLocalizedItinerary(uid, tripId, locale): Promise<Itinerary>`; same `tripId/revision` across locales; missing translation returns source-language text with explicit locale/source marker, not fabricated claim.

- [ ] **Pasul 1:** Testează preferințe locale independente, same trip/revision for both, locale override offline, untranslated place facts/sources unchanged.
- [ ] **Pasul 2:** `npm run test -- tests/unit/localize.test.ts tests/api/locale.test.ts` — FAIL inițial.
- [ ] **Pasul 3:** Implementează preferințele de limbă, switcher și etichete de traducere; traducerea AI nu rescrie prețuri, nume oficiale sau surse.
- [ ] **Pasul 4:** `npm run test -- tests/unit/localize.test.ts tests/api/locale.test.ts && npm run test:e2e -- tests/e2e/language.spec.ts` — PASS; RO/EN/FR, două persoane, vacanță comună.
- [ ] **Pasul 5:** Reviewer verifică text incomplet/overflow în limbi și înțelegerea stării traduse/neconfirmate.

**Executant:** `gpt-6-luna`; **Skill-uri:** `travel-buddy-engineering`, `test-driven-development`, `frontend-design`; **Dependențe:** Tasks 1–4, 8.

### Task 11: PWA, salvare offline atomică și logout sigur

**Fișiere:** Creează `src/pwa/{register-sw.ts,cache-policy.ts}`, `src/offline/{db.ts,snapshot.ts,repository.ts}`, `src/features/offline/OfflineSavePanel.tsx`, `tests/unit/offline/*.test.ts`, `tests/e2e/offline-snapshot.spec.ts`.

**Interfețe:** IndexedDB key `(ownerUid,tripId,locale)`; `buildSnapshot(ownerUid,tripId,locale,sessionGeneration): Promise<OfflineSnapshot>`; `commitSnapshotAtomic(ownerUid,snapshot): Promise<void>`; `readLastCompleteSnapshot(ownerUid,tripId,locale,sessionGeneration): Promise<OfflineSnapshot|null>` validează owner/locale/generation la load și commit; `logout(ownerUid): Promise<void>` invalidează generation și blochează reads înainte de purge. Cache static doar shell/asset public; API privat network-only/no-store.

- [ ] **Pasul 1:** Testează snapshot complet cu `ownerUid/tripId/locale/sessionGeneration`, checksum/schema version și manifest: fotografiile declarate obligatorii sunt descărcate/validate înainte de commit; dacă licența nu permite cache, excluderea se face înainte de start și starea este vizibilă. Testează quota, write interrupted, corrupted snapshot, expired offline session, logout/account switch/purge interrupted; UID B nu citește cheia UID A.
- [ ] **Pasul 2:** `npm run test -- tests/unit/offline` — FAIL inițial.
- [ ] **Pasul 3:** Scrie IndexedDB în staging, validează checksum și toate asseturile din manifest, apoi comută active pointer atomic; la eșec pointerul vechi rămâne. Logout incrementează session generation și refuză load imediat înainte de purge; la cold start purge-ul se reia înainte de afișarea altui UID.
- [ ] **Pasul 4:** `npm run test -- tests/unit/offline && npm run test:e2e -- tests/e2e/offline-snapshot.spec.ts` — PASS în browser simulând offline; service worker nu servește API privat cache-uit.
- [ ] **Pasul 5:** Gate P-12 pe Safari/iOS și Android numai după autorizare: full save, airplane mode, sesiune expirată, update failed, logout/login alt cont, cold start și purge interrupted. Cota sau asset obligatoriu eșuat păstrează snapshotul anterior și nu declară succes.

**Executant:** `gpt-6-luna`; **Skill-uri:** `travel-buddy-engineering`, `test-driven-development`, `webapp-testing`; **Dependențe la pornire:** Tasks 2, 3, 5, 8, 10. **Verificări de ieșire:** P-08 și P-12-B; P-12-A a trecut deja Gate B1 pe shell și nu este prerequisite al implementării snapshotului.

### Task 12: Review integrat pe telefon, desktop, securitate și remediere

**Fișiere:** Modifică numai fișierele afectate de findings; adaugă rezultate în `docs/verification.md`; eventual fixează `tests/e2e/release-acceptance.spec.ts` și `scripts/verify-release.mjs`.

**Interfețe:** acceptare MVP: trec toate criteriile din `docs/product.md`, scenariile existente `docs/verification.md`, testele taskurilor și gates; fiecare finding are severity, reproducere, fișier și rezultat retest.

- [ ] **Pasul 1:** Coordonatorul compilează matricea cerință → tasks/probes de mai jos și rulează lint, typecheck, unit, API, build și E2E.
- [ ] **Pasul 2:** Review integrat pentru drepturi private, expunere chei, SQL ownership, XSS din surse, rate limit/abuz, quota fail-closed, CAS, idempotency, cache PWA, payload offline și accesibilitate; folosește `travel-buddy-review`, `code-review-and-quality`, `web-design-guidelines` (încarcă regulile actuale) și `webapp-testing`.
- [ ] **Pasul 3:** Trimite remedieri independente `gpt-6-luna` cu fișiere non-overlap; pentru review tehnic dificil folosește `gpt-6.1-sol` dacă disponibil.
- [ ] **Pasul 4:** Re-run doar verificările afectate plus suitele de integrare, apoi toate comenzile release o dată.
- [ ] **Pasul 5:** Phone acceptance cu ambii utilizatori numai după acordul lor/logistică; raportează separat passed/not run/blocked. Publicarea și activarea provider-ilor necesită autorizare separată.

**Executant:** coordonator; **Review:** `gpt-6.1-sol` disponibil; **Skill-uri:** `travel-buddy-review`, `code-review-and-quality`, `web-design-guidelines`, `webapp-testing`; **Dependențe:** Tasks 1–11 și toate probele/gates.

## Matrice de acoperire cerință → task/probă

| Cerință | Task / probă obligatorie | Dovadă acceptare |
|---|---|---|
| Două conturi private, fără signup public, vacanță comună, asociere administrativă | P-01 + Tasks 3, 5, 8 | token/member e2e; al treilea UID 403; două sesiuni văd același trip |
| Preferințe persistente, cinci categorii, categorie goală explicită, override | Tasks 4, 5, 7 | profile readiness în ambele conturi; override separat după reload |
| Alergii/intoleranțe distincte, răspunsuri și limite alimentare | Task 4; P-07 și P-11 pentru provider/data minimization | `avoid` nu creează allergy; restaurant recomandabil doar opțiuni pentru ambii; datele transmise minimizate |
| Creare 3 pași, perioada/zile, transport combinat, baze multiple, sosire/plecare opționale | Tasks 5, 7 | teste date boundary și navigare/retur wizard |
| Atracții principale + gems, prețuri/surse, zile închise/rezervare, lipsă date | P-05/P-06 + Tasks 6–7; P-11 live | fixtures și apoi city/low-data live test; niciun fapt inventat |
| Căutare/generare limits, provider error, quota stop | P-05/P-06 + Tasks 6–7; P-11 live | quota stub 429/fail-closed; measured credits per itinerary, fără upgrade |
| Ruta cu opriri, modes, fără distance/time display, service transit caveat | P-04 + Tasks 6, 8; P-10 live routing | geometry nonempty connecting ordered stops; unconfirmed marker; no estimates in UI |
| Add place via name/link și ambiguity confirm | Task 6 + Task 8 | multiple candidates require explicit match; existing chosen stops unchanged |
| Eliminate/replace reorder, preserve other places | Task 8 | property test IDs preserved, route recomputed |
| Proposal preview, one-person confirm, CAS/reconfirm, idempotency | P-02/P-03 + Task 8 | two-session concurrency test and duplicate retry result |
| Partial job versus complete, truthful progress | Task 7 | missing day cannot report `completed`; progress ties to stored stage counts |
| Itinerary list/map/detail/scroll restore, desktop side-by-side/mobile toggle | Task 8 | mobile and desktop E2E; same scroll position on return |
| RO/EN/FR per account, same common trip | Task 10 | shared tripId/revision for distinct locales; untranslated labels explicit |
| Six-section intro, calm scroll, real font and Lisbon photography | Task 9; asset recovery ticket | six anchors; font file provenance; two source refs recovered or marked pending, not invented |
| Offline manual complete snapshot, images, single language, atomic update | P-08/P-12-B + Task 11 | real iOS/Safari + Android airplane-mode test; previous snapshot intact after induced failure |
| Logout, session privacy, offline access expectations | P-01/P-08/P-12-A/P-12-B + Tasks 3, 11–12 | account switch test; no other UID sees private cache; logout clears local snapshot; valid copied Firebase token may last until exp |
| Integrated review, responsive and accessibility | Task 12 | review findings closed or explicitly blocked; checks recorded in `docs/verification.md` |

## Probe IDs și acord de execuție

Probele concrete, variantele de destinație, criteriile de oprire și datele de măsurat se definesc în `docs/plans/2026-10-23-technical-probes.md`. Legătura este bidirecțională: P-01 → Task 3; P-02/P-03 → Tasks 7–8; P-04/P-10 → Task 8; P-05/P-06/P-07/P-11 → Tasks 4, 6–7; P-08/P-12-B → Task 11; P-12-A → Task 1b/Gate B1; P-09 → Task 1b/Gate B1 și retest Task 3. Probele reale necesită acces autorizat la conturi/chei și dispozitive; documentarea aceasta nu le execută și nici nu autorizează crearea/activarea lor.

Planul păstrează separat implementarea UI locale de acceptarea backend-ului. Task 2 local a fost autorizat explicit la 2026-11-02 și poate începe conform handoff-ului curent; Task 3 și activarea/live backend cer trecerea Gate B1, inclusiv P-09 PASS. Alte tasks se pornesc numai conform dependențelor și autorizărilor punctuale; handoff-ul nu autorizează MVP-ul complet, deploy-ul sau publicarea.
