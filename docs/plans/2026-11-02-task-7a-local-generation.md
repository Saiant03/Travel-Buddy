# Task 7A — fluxul local demonstrativ al generării

> **For agentic workers:** Urmați `docs/process.md`: implementare delegată, review, remedieri delegate și verificarea finală a coordonatorului. Bifați numai rezultate verificate.

**Goal:** Demonstrație independentă, pornită explicit, a stărilor generării prin pași sintetici determinisți executați local.

**Architecture:** Contract intern strict reutilizând GenerationJob și erorile existente; executor injectabil cu ieșire validată; stare unică în memorie, păstrată deasupra paginii. Comenzile locale execută pașii search/organize/verify fără temporizare decorativă. Identitatea încercării protejează starea împotriva răspunsurilor întârziate.

**Tech Stack:** React 19, TypeScript strict, Zod, Vitest, Playwright; componentele, Bricolage Grotesque și tokenurile existente.

**Spec:** Cererea explicită Task 7A din 2026-11-02; `docs/product.md`, `docs/architecture.md`, `docs/contracts-v1.md`; Task 7 și P-03/P-06/P-07 din planurile din 2026-10-23; dovada Task 6A. Baza sincronizată este `58f07bd`.

## Global Constraints

- RO/EN/FR, româna implicită. Date sintetice exclusiv în memorie, păstrate la navigare și schimbarea limbii; reset la reload explicat vizibil.
- Demonstrația are acces separat, pornire explicită și stări queued/running/complete/partial/quota_exhausted/failed distincte. Complete descrie numai terminarea simulării; partial nu se prezintă drept rezultat complet.
- Etapele search/organize/verify sunt etichetate ca simulate; contorul crește numai pentru pași locali executați. Fără procente bazate pe timp sau așteptări decorative.
- Scenarii: succes complet, incomplet, invalid, indisponibilitate, timeout și cotă epuizată. Explicații utile, retry manual permis explicit; fără retry automat sau consum real.
- Sursele, identificatorii, rezultatele și eventualele coordonate sunt fictive/neconfirmate. Fără fotografii ori informații turistice inventate prezentate ca reale.
- Task 5A rămâne oprit la rezumat; Task 6A la confirmarea locală. Nu se salvează/aplică itinerarii, nu se creează propuneri și nu există plan comun confirmat.
- Fără căutare online, linkuri accesate, geocodare, hărți, AI, autentificare, endpointuri, persistență sau sincronizare. Fără date personale, rezervări sau sănătate reală.
- P-09 FAIL: zece cereri cold distincte din 100 peste 7 ms; p95 exact necunoscut. Gate B1, Task 3, backendul real și acceptarea online rămân blocate. Tasks 4/5/6 complete rămân nefinalizate cu dependențele păstrate.
- Nu se repetă CPU/CAS/iPhone, nu se ating fixture-uri reale sau Firebase/Cloudflare/D1, furnizori/costuri, deploy/publicare/PR. Push normal pe main este autorizat după review și verificări.

## Review Focus

- O zi lipsă sau rezultat invalid nu poate deveni succes complet; rezultatul executorului este unknown până la validare.
- Răspunsurile de la o încercare veche și apelurile locale suprapuse nu suprascriu starea curentă; această protecție nu este fencing distribuit sau reluare durabilă.
- Progresul nu crește la simpla trecere a timpului, navigare ori schimbarea limbii; fiecare etapă completată are dovada pasului local executat.
- Reîncercarea cere o acțiune manuală și o încercare nouă; cota simulată nu promite reset real.
- Tastatură, texte FR, mobil, zoom 200% și reduced motion păstrează controale și stări lizibile, cu rezultate fictive și explicații asociate.

## Fișiere și interfețe

- `src/domain/generation/*`: contracte interne, fixture-uri, executor injectabil și controlul încercărilor; reutilizează schema GenerationJob fără modificarea contractului wire real.
- `src/features/generation/*`: pagină, progres, rezultate, traduceri și stiluri locale.
- `src/app/{App.tsx,router.ts}`: ruta `/generation`, acces separat și proprietatea stării; fără conectarea finalului Task 5A sau Task 6A.
- `tests/unit/generation/*`, `tests/e2e/generation.spec.ts`, `playwright.config.ts`: teste independente și integrarea suitei locale.
- `tests/fixtures/generation-harness.*`, `tests/e2e/generation-delayed.spec.ts`: harness exclusiv de test pentru executor controlat întârziat și montarea/demontarea paginii reale. Rulat pe serverul de dezvoltare local; nu intră în buildul produsului și nu introduce controale de test în aplicație.
- Contractele concrete ale executorului/controllerului se închid cu implementatorul înainte de UI. Intrarea/ieșirea sunt validate; erorile reutilizează ProviderFailure/ValidationError existente. Câmpurile obligatorii de lease/result version sunt valori sintetice compatibile și nu atestă persistență.

**Reguli locale stabilite la review:** pornirea accidentală duplicată este refuzată cât există o încercare activă; comanda explicită pentru o încercare nouă invalidează încercarea veche, inclusiv dacă un pas al ei încă așteaptă răspuns. Rezultatul vechi este șters la pornirea încercării noi. `completed` numără etapele locale încheiate cu ieșire validată; verificarea invalidă lasă 2/3, succesul și rezultatul parțial au 3/3 etape executate, dar stări distincte. ProviderFailure/ValidationError rămân disponibile intern; job.errorCode folosește codurile existente QUOTA_EXHAUSTED, PROVIDER_UNAVAILABLE sau VALIDATION_ERROR. Retry manual este permis pentru partial sau eroare retryable; cota simulată nu are moment de reset cunoscut. Explicația resetării este text vizibil; datele nu sunt persistate.

Fixture-ul acestei demonstrații are exact două zile așteptate, cu nume/ID-uri/surse fixe sintetice. Completitudinea este derivată din zilele și locurile validate, fără a crede o declarație de succes a executorului. Această alegere nu impune o limită de două zile produsului real.

## Execuție

- [ ] Contracte/executor/controller: teste întâi, RED pe aserțiuni separate pentru tranziții, contor, fiecare scenariu, validare, retry și răspunsuri vechi; apoi GREEN.
- [ ] UI: pregătire explicită pentru fiecare comportament testat, RED înaintea implementării sale; lipsa paginii/importului nu este dovadă suficientă. Grupurile interactive coordonate au RED/GREEN, dar unele comportamente de memorie/limbă au fost deja GREEN la prima verificare.
- [x] Review coordonator și review independent, remedieri delegate și reverificare.
- [x] Regresii, typecheck, lint, build, browser local RO/EN/FR, tastatură, mobil/desktop, zoom 200% cu metoda declarată și reduced motion; memorie/reset și zero cereri externe.
- [x] Dovezi, memorie și plan actualizate numai după verificări. Livrarea commit/push se confirmă separat după operațiile Git.

**Rezultat verificat:** 229/229 teste unitare, typecheck/lint/build, 53/53 E2E produs și 3/3 E2E cu executor întârziat pe serverul de dezvoltare; 193 verificări browser, inclusiv zoom CSS 200% (aproximare, nu nativ). Cerințele RED-first integrale de mai sus rămân nebifate: nu sunt demonstrate separat pentru toate protecțiile inițiale. [Raport exact, loguri și limite](../evidence/2026-11-02/task-7a-local-generation.md).

## Restul Task 7 — neimplementat

Task 7 complet păstrează Tasks 1, 5–6 și P-03/P-06/P-07, precum și gate-urile reale. Motorul de recomandări, ambele profiluri, furnizorii HTTP, autentificarea, endpointurile, joburile durabile, lease/checkpoint/fencing distribuit, cotele persistente și probele live rămân deschise. Simulările 7A nu dau PASS integral P-03/P-06/P-07 și nu validează serverul ori furnizorii reali.
