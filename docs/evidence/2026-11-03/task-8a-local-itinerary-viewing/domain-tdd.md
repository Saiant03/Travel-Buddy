# Jurnal TDD — domeniu Task 8A

## Fixture și validarea parserului

- Test: `loads a deterministic three-day fixture in its declared stop order`.
- Înaintea implementării, API-ul avea stub nefuncțional; comanda `npm test -- tests/unit/itinerary/demo.test.ts` a eșuat la aserțiunea `first.ok === true` (fixture-ul standard lipsea). Aceasta este RED-ul observat pentru fixture-ul valid.
- `reports schema validation failure for the invalid scenario` a ajuns la aserțiunea proprie privind lista de issues și a eșuat fiindcă stub-ul întorcea `issues: []`. Loader-ul invalid real modifică numărul zilei, apoi folosește `parseItinerary`; parserul întoarce eroarea de schemă.
- După implementarea fixture-ului, ambele teste au trecut. `parseItinerary` acceptă fixture-ul valid; acest comportament de contract existent este verificat ca PASS, nu este prezentat ca RED nou.
- Testul de izolare a fost inițial blocat de precondiția `first.ok && second.ok` și nu îl număr ca RED observat. După implementare verifică faptul că modificarea rezultatului unui apel nu schimbă apelul următor.

## Marcaje sintetice și goluri opționale

- Testul nou `marks every fixture identity and name as synthetic` a rulat focalizat înainte de ajustarea datelor: `npm test -- tests/unit/itinerary/demo.test.ts -t 'marks every fixture identity'`; a eșuat la aserțiunea prefixului `synthetic-` pentru ID-ul de oprire. Datele au fost apoi marcate sintetic în ID-uri și nume; focalizat GREEN.
- `leaves dates and unsupported travel details absent` verifică data lipsă pe ziua 2, ziua 3 goală și lipsa route/fixedTime/address/photo/price/opening/reservation. A trecut la prima rulare; acest test nu are RED observat separat și nu îl pretind.

## Starea de navigare

- Testele au fost scrise înaintea reducerului funcțional, cu un stub care nu schimba starea.
- RED focalizat observat: `npm test -- tests/unit/itinerary/navigation.test.ts -t 'selects day two'` a eșuat la `selectedDayNumber` (așteptat 2, primit 1). După implementarea selectării și selectorului, comanda focalizată a trecut.
- Testele de deschidere/zi greșită, închidere cu păstrarea zilei, schimbarea zilei care închide detaliul, zi necunoscută, scenariu invalid și imutabilitate au fost rulate după implementarea reducerului. Sunt raportate drept verificări GREEN, nu RED separat; primul RED nu certifică retroactiv aserțiunile ulterioare.

## Verificări finale

- `npm test -- tests/unit/itinerary/demo.test.ts tests/unit/itinerary/navigation.test.ts` — PASS, 2 fișiere / 12 teste.
- `npm run typecheck` — PASS (`tsc --noEmit`).
- O rulare intermediară după schimbarea numelor a prins un literal așteptat rămas vechi în test; literalul a fost corectat după ce numele sintetice au fost verificate, apoi ambele fișiere au trecut.
