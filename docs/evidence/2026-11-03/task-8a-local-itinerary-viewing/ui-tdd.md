# Task 8A UI — dovezi

Comenzile browser: `PREFERENCES_ONLY=1 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npx playwright test --project=itinerary-demo -g '<nume>'`. Toate jurnalele sunt în acest director.

- Rută: `npx vitest run tests/unit/router.test.ts -t 'recognizes the itinerary demonstration'`: RED `notFound` în loc de `itineraryDemo`, apoi GREEN (`ui-route-red.log`, `ui-route-green.log`).
- Pagina inițială: RED heading absent, apoi GREEN (`ui-initial-red.log`, `ui-initial-green.log`). Celelalte verificări din același test nu au RED separat.
- După introducerea controalelor shell inerte, selecția zilei a eșuat la vizibilitatea Maple, deschiderea detaliului la focalizarea titlului și scenariul invalid la vizibilitatea erorii (`ui-focused-red-*`). Apoi toate au trecut (`ui-primary-green.log`).
- Titlu document: RED «Pagina nu a fost găsită» în loc de «Itinerar demonstrativ», apoi GREEN în `ui-suite-final.log`.
- Context detaliu: RED text «Ziua 1 / Oprirea 2» absent; focus după navigare: RED buton inactive. Ambele GREEN în `ui-context-focus-green.log`. Ordinea exactă era deja GREEN (`ui-check-*`).
- Starea goală, revenirea cu focus, recuperarea scenariului, localizarea descrierilor și alte aserțiuni secundare au fost implementate împreună cu comportamentele de mai sus înainte de a avea RED separat. Aceasta este o limită TDD; nu există dovadă RED pentru ele. Primele încercări `ui-red-*` și un `ui-focused-red-home-entry.log` au eșuat pe precondiții sau port ocupat, nu sunt dovezi RED.
- `ui-suite-final.log`: 12/12 PASS pentru fluxurile UI; ulterior scenariul invalid și franceza au trecut separat în `ui-fr-existing.log` (deja GREEN). Testele pentru stări injectate, schimbare zi, ordine și date lipsă erau deja GREEN la prima execuție.
- `npm run typecheck`, `npm run lint`, `npm run build`: PASS; build afișează avertismente Rollup pentru comentarii din zod.

## Corecții review
- U01: `ui-u01-red.log` arată URL-ul exact Maple absent; `ui-u01-green.log` trece după afișarea sursei ca text inert și verificarea lipsei ancorelor .invalid. Suita build inițială a prins o regresie de potrivire a etichetei sursei (`ui-u02-build.log`); marcajul separat a reparat-o (`ui-u02-build-green.log`).
- U02: testul de injectare a fost mutat în `itinerary-state-harness.spec.ts`, proiect disponibil numai cu `PREFERENCES_ONLY=1`. `ui-u02-dev.log` trece; proiectul `itinerary-demo` rulează separat pe build/preview.
- S01: `ui-s01-red-unknown-day-offers.log` și `ui-s01-red-unknown-stop-offers.log` arată butoanele de revenire absente; `ui-s01-green.log` trece după implementare. Asserțiunile focus adăugate ulterior sunt existente GREEN în `ui-review-harness.log`, fără RED separat.
- S02: înlocuite culorile și raza locale cu tokenurile proiectului; inspecție CSS, fără test artificial.
- S03: `ui-s03-red.log` arată marcajul locului absent; `ui-s03-green.log` trece după adăugare localizată pentru loc neconfirmat.
- Final: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npx playwright test --project=itinerary-demo` = 14 PASS pe build (`ui-review-build.log`); `PREFERENCES_ONLY=1 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npx playwright test --project=itinerary-state-harness` = 3 PASS (`ui-review-harness.log`); typecheck și lint PASS.
- B01: șase teste focalizate pentru 320px și zoom 200% la 640px, în RO/EN/FR. RED `ui-b01-red.log`: depășiri de 45px, respectiv 91px. GREEN `ui-b01-green.log`: 6/6, URL complet vizibil și revenire utilizabilă. CSS permite ruperea textului fără ascundere. Suita build/preview `ui-b01-build.log`: 20/20 PASS. Mesajele scenariului invalid au fost reformulate în limbaj accesibil; testele actualizate.
