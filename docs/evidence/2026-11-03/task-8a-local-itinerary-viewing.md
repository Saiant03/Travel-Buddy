# Task 8A: vizualizare locală a itinerarului

Acest raport consemnează verificările locale pentru demonstrația independentă de vizualizare a itinerarului. Verificările descrise au trecut cu limitele TDD și ale platformelor menționate mai jos. Rezultatul nu închide Task 8 complet și nu reprezintă acceptare umană finală a aspectului.

## Domeniu demonstrativ

Ruta explicită `/itinerary-demo` afișează un fixture determinist cu trei zile: ziua 1 are trei opriri, ziua 2 are două opriri cu date opționale absente, iar ziua 3 este goală. Fixture-ul folosește contractele comune `Place`, `DayPlan`, `Stop` și `Itinerary`; valorile au marcaj fictiv/neconfirmat, iar sursele `.invalid` apar numai ca text inert.

Starea rutei și limba rămân în memoria paginii. Interfața nu se conectează la Task 5A, Task 6A sau Task 7A; finalizarea simulării Task 7A nu reprezintă un itinerar confirmat. Demonstrația nu include hartă/geocodare/rute, editare/ștergere/reordonare, Buddy/chat, propuneri/confirmări/CAS/sync, HTTP/AI/auth/endpointuri, persistență/offline sau date personale. Fixture-ul nu conține valori de preț, program ori rezervare; UI poate arăta numai texte localizate pentru date neprecizate.

## Verificări executate

Coordonatorul a rulat suita completă Vitest: **242/242 teste în 26 fișiere PASS**. Typecheck și lint au trecut. După remedierea B01, Playwright pe build a trecut **80/80 teste**: 20 pentru itinerarul demonstrativ, 53 pentru funcțiile locale existente, 6 pentru consola server simulată și 1 pentru proba offline sintetică. Configurația Playwright a pornit și a încheiat trei builduri locale în timpul suitei.

Pe serverul de dezvoltare, au trecut **3/3 teste** pentru harnessul de stare 8A și **3/3 teste întârziate** pentru generarea 7A. Aceste teste folosesc harnessuri locale; ele nu sunt probe ale serviciilor reale și nu extind domeniul 8A.

Reviewul static independent al domeniului și UI-ului nu a lăsat defecte confirmate deschise. Observațiile închise au verificat sursele `.invalid` afișate ca text inert, harnessul izolat la dezvoltare și absent din build, recuperarea scenariilor necunoscute, folosirea tokenurilor proiectului, marcajul locurilor neconfirmate și revenirea cu context/focus.

## Limite TDD

Jurnalele păstrează separat RED-urile observate și GREEN-urile ulterioare, inclusiv regresia B01 și remedierea sa. Jurnalul domeniului este narativ pentru patru RED-uri, fără loguri RED brute independente. UI-ul păstrează loguri RED focalizate și unele GREEN-uri care au urmat implementării. TDD integral nu este demonstrat. Domeniul are RED observat pentru fixture-ul valid, validarea scenariului invalid, marcajele sintetice și selectarea zilei 2. Testul de izolare a fost blocat întâi de o precondiție și nu este numărat ca RED. Testul care verifică absența datelor opționale a trecut la prima rulare, fără RED separat.

UI-ul are RED-uri focalizate pentru rută, intrare, selectarea zilei, detaliu, scenariul invalid, titlu, context/focus și observațiile reviewului. Unele rulări inițiale au eșuat la precondiții sau la portul ocupat și nu sunt numărate drept RED. Alte comportamente au fost implementate înainte de un RED individual. Prin urmare, istoricul nu demonstrează TDD integral pentru fiecare comportament. Nu am fabricat probe retroactive și nu am eliminat cod funcțional pentru a rescrie ordinea.

## Matricea browser finală

Agentul browser a rulat matricea pe buildul local corectat. Raportul brut conține **178 observații**: 144 stări de interfață (RO/EN/FR × 1440/768/390/320 px × șase stări × mișcare normală/redusă), 18 probe cu zoom CSS 200% (1280/640 px × trei stări × trei limbi), câte trei probe pentru tastatură, revenirea focusului, starea înainte și după navigarea dus-întors și reset la reload, plus o observație separată a service workerului.

Câmpul `counts.cases` din runner raportează 172, deoarece nu include cele șase observații `route-state-before/after`; `report.cases.length` este 178. Raportul a înregistrat zero eșecuri, zero erori de pagină și zero cereri externe. Cele 147 de instantanee storage au fiecare zero intrări în localStorage/sessionStorage/IndexedDB și zero apeluri de scriere/open IndexedDB raportate; verificările separate de set/remove/clear și tranzacțiile IndexedDB au înregistrat zero scrieri. Controale fără etichetă: zero. Linkuri active către `.invalid`: zero. Detalii cu imagini sau hărți: zero.

Tastatura a trecut în 3/3 limbi cu focus vizibil și contur de 3 px; revenirea focusului a trecut 3/3. Contextul zilei, detaliului, limbii și scenariului s-a păstrat la navigare dus-întors în 3/3; reload-ul a revenit la română și lista implicită fără detaliu. Service workerul public existent a fost observat separat, într-un context cu service worker permis. Matricea principală a blocat service workerul; nu deducem din aceasta că întreg shell-ul/PWA nu are cache sau că itinerarul se salvează offline.

Regresia B01 trece după remediere: detaliul încape la 320 px și la zoom CSS 200%/640 px în toate cele trei limbi. Zoomul CSS este o aproximare, nu zoom nativ. Coordonatorul a inspectat capturile finale franceze la ambele dimensiuni și a confirmat că textul se rupe pe rânduri fără tăiere sau ascundere. Măsurarea finală a 15 combinații text/fundal a variat între **9,89:1 și 18,26:1**.

## Review vizual și limite

Launcherul Impeccable a returnat `Permission denied`; launcherul nu a rulat. Reviewul a folosit inspecția manuală după referințele UI și regulile live Vercel, plus verificările browser descrise mai sus. Acest rezultat nu este un audit automat WCAG și nu reprezintă acceptarea umană finală a aspectului.

Nu s-au executat Safari/WebKit, cititor de ecran, zoom nativ, dispozitiv fizic sau integrări live. Nu s-au rerulat probe CPU/CAS/iPhone și nu s-au modificat servicii, deployment ori publicare.

## Starea proiectului și probele reale

Task 8A rămâne separată de Task 8 complet. Acesta păstrează dependențele Tasks 1, 3, 5–7, probele P-02/P-03/P-04 și routing live P-10 separat. P-06/P-07 țin de fluxul de generare și nu înlocuiesc probele Task 8. Task 8 complet, Tasks 4/5/6/7 complete și backendul online rămân nefinalizate.

P-09 rămâne **FAIL**: 10 din 100 de cereri cold au depășit 7 ms; p95 exact este necunoscut. Gate B1, Task 3 și backendul online rămân blocate. Nu s-au reluat probe reale și nu s-au modificat servicii, fixture-uri reale, deployment sau publicare. Dovezile P-09 existente rămân în [raportul operațional din 2 noiembrie](../../operations/2026-11-02-cpu-rerun.md).

## Fișiere de dovadă

Subdirectorul [jurnalelor și artefactelor selectate](task-8a-local-itinerary-viewing/) conține jurnalele TDD, logurile RED/GREEN, verificările finale, JSON-ul browser, contrastul, scriptul și capturile finale selectate. Raportul inițial cu B01 este păstrat separat ca baseline. Logurile redundante și încercările eșuate la precondiții nu au fost copiate drept dovezi RED.
