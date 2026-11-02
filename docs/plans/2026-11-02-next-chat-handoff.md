# Handoff pentru chat nou — Travel Buddy Task 2

> **Executant:** un singur agent `gpt-6-luna` pentru implementare. Coordonatorul definește contractul, revizuiește difful și comportamentul, coordonează corectările, reverifică și integrează. Nu delega agenți suplimentari fără motiv clar. Coordonatorul preia cod numai dacă implementerul confirmă că sarcina îi depășește capacitatea și utilizatorul confirmă explicit. Nu folosi modele mai costisitoare fără acordul utilizatorului.

**Scop:** construiește numai fundația UI locală Travel Buddy: shell, tokenuri/componente comune, navigare și limbile RO/EN/FR cu româna implicită.

**Stack existent:** React 19, TypeScript strict, Vite, Zod. Folosește dependențele și configurația deja existente; nu schimba arhitectura fără constatare concretă și contract nou.

## Context verificat

- Repository-ul este `/workspace/Travel-Buddy`, branch `main`. SHA `aace865e28cc88d012d6b585aaad9e6044c1b701` consemnează fundația de probe istorică; nu îl folosi ca target checkout/reset. În chatul nou verifică `main` actual, sincronizează branch-ul cu remote în mod fast-forward/fără force dacă e nevoie și păstrează modificările locale existente.
- Explorarea vizuală și brief-ul sunt încheiate. Machetele aprobate și limitele lor sunt în `docs/mockups.md`; sistemul vizual este în `docs/design-system.md`; cerințele sunt în `docs/product.md`; contractele de date sunt în `docs/contracts-v1.md`.
- Task 2 existent și fișierele sale sunt în `docs/plans/2026-10-23-implementation.md` (secțiunea Task 2). Tratează acest handoff ca o delimitare și ordonare a taskului, nu redeschide designul și nu crea machete noi.
- Arborele are deja `src/main.tsx`, `src/domain/*`, `src/shared/contracts/*`, `src/pwa/sw.ts`, Vite/TS/config și pachete pentru probe. Inspectează aceste căi înainte de modificare; reutilizează ce e potrivit. Nu suprascrie aplicațiile din `probes/` și nu extinde UI-ul de consolă al probelor în produs.
- Aprobări vizuale existente: font Bricolage Grotesque; verde pădure, ivoriu/alb cald, auriu; carnet/bilet/pașaport/ștampile; Buddy leneș maro-crem cu rucsac verde; carduri cu imagini specifice destinației. Machete aprobate: preferințe alimentare și cultură, listă vacanțe, scenele 2 și 3 ale creării, generare, itinerar listă/hartă, detalii loc, confirmare Buddy, stări offline. Prima scenă de creare nu are aprobare vizuală separată. Fotografiile referință Lisabona nu sunt recuperate; nu le inventa.
- Valorile exacte de culoare, spațiere, raze și detalii responsive din `docs/design-system.md` sunt propuneri de pornire, nu valori aprobate definitiv. Păstrează această distincție.

## Gate backend și limite obligatorii

P-09 CPU cold a eșuat pragul ≤7 ms: captura corelată a observat zece valori cold de 8–15 ms din 100 de cereri, demonstrând p95 cold >7 ms. Captura nu oferă p95 exact și nu are CPU pentru toate cererile. Verdictul este **FAIL**, nu PASS și nu „rezolvat”. Păstrează limita și raportul în documentație. Nu relansa CPU sau CAS și nu modifica/resetta fixture-ul.

Gate B1 rămâne blocat. Task 3 (Firebase auth, API privat și backend live), acceptarea online și orice afirmație că produsul/backendul funcționează cer P-09 PASS și probele reale obligatorii. P12-A iPhone 14 Pro Max este deja PASS manual pentru fixture sintetic; nu repeta testul. Acest task este doar dezvoltare locală UI și nu validează serverul.

Task 4+ pot pregăti fixture-uri/UI numai când planul lor le permite după fundație; această autorizare nu înseamnă MVP complet. În acest Task 2 nu utiliza sesiuni sau date reale, nu cere/secreta tokenuri/parole, nu modifica Worker/Firebase/D1/migrații server, nu activa furnizori, nu produce costuri și nu publica/deploy.

## Contract exact pentru Task 2

Înainte de cod:

1. Citește `AGENTS.md`, `docs/memory.md`, `docs/product.md`, `docs/plan.md`, `docs/process.md`, `docs/decisions.md`, `docs/design-system.md`, `docs/mockups.md`, `docs/contracts-v1.md` și Task 2 din planul de implementare.
2. Inspectează `git status --short`, branch/commit, `package.json`, `src/main.tsx`, configul Vite/TypeScript și structura `src/`. Nu elimina sau rescrie probele existente.
3. Dă coordonatorului un contract scurt cu lista efectivă de fișiere de modificat/creat și comenzile existente pe care le vei folosi. Utilizatorul a autorizat începerea Task 2 după acest pas; nu cere din nou acord pentru același scop și nu aștepta aprobări de design deja date.
4. Citește skill-urile locale `travel-buddy-engineering`, `frontend-design`, `design-taste-frontend`, `test-driven-development`, `webapp-testing` și `travel-buddy-review`, folosind căile din `docs/skills.md`. Pentru i18n/router, scrie întâi teste comportamentale pentru chei/fallback/interpolare și navigare, confirmă eșecul înaintea implementării și apoi confirmă trecerea. Nu crea teste pentru simplul CSS/documentație.

Implementare limitată la:

- Shell/router local cu fallback SPA, reutilizând `vite.config.ts`, `tsconfig.json`, `package.json`, `src/main.tsx` și PWA public shell/probele existente; modifică config numai dacă necesar. Nu crea `wrangler.toml` sau alt config de deployment pentru UI locală.
- Tokens CSS și componente comune accesibile: Button, Card, Field, Dialog, Toast, Loading, EmptyState, ErrorState (adaptează numele/locul la convențiile constatate și evită duplicatele).
- Navigare responsive și stări demonstrative locale.
- Catalog de mesaje fundație pentru `ro`, `en`, `fr`; româna implicită; helper tipizat `t(locale, key, args?)`; chei complete, interpolare sigură și fallback determinist/documentat.
- Bricolage Grotesque este aprobat; obține fișierul din sursa oficială dacă e necesar, self-host și păstrează OFL/proveniența în proiect.
- Interacțiunile locale (navigare, câmpuri, meniuri și stări demo) funcționează. Fixture-urile sunt marcate mock/synthetic; nu pretind autentificare, sincronizare, API sau persistență server reale.

Planul menționează în mod orientativ: `package.json`, `tsconfig.json`, `index.html`, `vite.config.ts`, `src/main.tsx`, module în `src/`, asset font/licență și testele i18n sunt candidate; modifica numai ce este necesar după inspecția codului existent. `vite.config.ts` există deja, iar Task 2 nu adaugă `wrangler.toml`/config de deploy. Păstrează shell-ul PWA public și probele existente.

## Criterii de ieșire și verificare

- Shell-ul pornește prin comenzile existente; rute cunoscute și fallback funcționează și sunt acoperite de teste comportamentale existente/noi relevante.
- Componentele comune sunt keyboard-operable, au focus vizibil, label-uri și stări accesibile; layoutul nu se rupe la viewport mobil/desktop și zoom 200%; animația respectă reduced motion.
- Nicio cheie vizibilă din catalogul fundației nu lipsește în RO/EN/FR; româna este inițială.
- Tokenurile sunt centralizate; componentele nu hardcodează culori arbitrare. Propunerile cromatice sunt marcate propuneri.
- UI-ul și interacțiunile locale sunt funcționale, dar nu pretind login, sincronizare sau date de backend reale. Nu există modificări server/deploy/cost.
- Rulează typecheck, lint, testele unit comportamentale pentru i18n/router, build și smoke test în browser local când mediul permite. Nu adăuga teste pentru CSS/documentație sau teste artificiale care oglindesc implementarea. Raportează exact comenzile, rezultatele și ce nu s-a verificat. Niciun test local nu închide P-09/Gate B1; nu relua CPU/CAS ori probe live.
- Reviewul coordonatorului citește difful și inspectează UI la dimensiuni mobile/desktop când browserul local este disponibil. Constatările se repară de același agent `gpt-6-luna`; apoi coordonatorul reverifică.
- Actualizează documentația curentă doar dacă Task 2 schimbă fapte/contracte; păstrează istoricul și datază orice snapshot nou.
- După review și verificările cerute, folosește autorizarea persistentă existentă pentru commit și push pe `main`, fără confirmare repetată. Nu face deploy/publicare a produsului și nu deschide PR automat.

## Prompt de copiat în chatul nou

```text
Continuă Travel Buddy în `/workspace/Travel-Buddy`, branch `main` actual, sincronizat cu remote. SHA-ul fundației din 2 noiembrie este istoric; nu face checkout/reset la el și nu arunca modificări existente. Citește AGENTS.md și documentele/skill-urile indicate în `docs/plans/2026-11-02-next-chat-handoff.md`; inspectează Git status și fișierele reale înainte de editare. Pentru i18n/router urmează test-driven-development: teste comportamentale fail-then-pass; rulează typecheck, lint, unit tests relevante, build și smoke browser local. Fără teste doar pentru CSS/documentație.

Execută doar Task 2: UI local React 19/TypeScript strict/Vite/Zod, shell și navigare, tokens/componente comune și RO/EN/FR (implicit RO), cu fixture-uri explicit mock/synthetic; interacțiunile locale trebuie să funcționeze, fără a simula autentificare/sincronizare reale. Refolosește Vite/configurația, PWA public shell și probele existente; fără explorare vizuală sau interviu din nou. Trimite coordonatorului contract scurt de fișiere/comenzi după citire și apoi începe; autorizarea pentru acest Task 2 este deja dată.

P-09 CPU cold este FAIL: 10/100 cereri observate sunt peste 7 ms; p95 exact și restul măsurărilor sunt necunoscute. Păstrează verdictul. Gate B1 rămâne obligatoriu; Task 3/backend privat/live și acceptarea online rămân blocate până la P-09 PASS și probe reale. P12-A iPhone pe fixture sintetic a trecut deja; nu repeta. Nu rula CPU/CAS, nu reseta fixture, nu folosi date/sesiuni reale, nu modifica Worker/Firebase/D1, nu crea config de deploy, nu activa costuri/providers și nu publica. Tasks 4+ nu sunt autorizate implicit.

Implementarea revine unui singur agent gpt-6-luna; coordonatorul face review, remedieri delegate și reverificare. Nu delega suplimentar și nu folosi model mai scump fără aprobare. Verifică typecheck, lint, unit tests comportamentale relevante, build și smoke browser local; raportează exact rezultate și limite. După review și verificările cerute, commit/push pe `main` sunt deja autorizate; fără deploy sau publicare a produsului.
```
