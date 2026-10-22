# Probe tehnice timpurii — plan pentru execuție viitoare

> **Pentru agenții care vor executa:** Urmați `docs/process.md`: coordonatorul fixează contractele după revizuirea arhitecturii, agentul `gpt-6-luna` execută fiecare probă delimitată, iar coordonatorul verifică dovezile. Acesta este un plan de probe, nu o cerere de implementare. Toate probele de mai jos sunt **NEEXECUTATE**.

**Scop:** Să măsurăm riscurile tehnice și de produs prin experimente izolate, înainte de a promite funcționarea integrată sau de a fixa tehnologii.

**Abordare:** Recomandarea tehnică din `docs/architecture.md` devine baza condiționată a probelor după revizuirea `docs/architecture.md` și confirmarea contractelor de către coordonator. Se testează separat simulări locale deterministe, apoi furnizori/telefoane numai după autorizarea activării. Un rezultat PASS validează doar proba și configurația documentată, nu întregul produs. Dacă arhitectura nu trece probele, se oprește extinderea și se revine coordonatorului pentru decizie; nu se schimbă automat furnizorul, costul sau experiența și nu se relaxează brief-ul.

**Tehnologii:** Recomandare condiționată: Cloudflare Pages pentru asseturile statice/PWA, Worker pentru API, D1 pentru date, Firebase Authentication email/parolă cu email verificat și allowlist pentru cele două UID-uri; fotografii numai din surse ale căror termeni permit afișarea și metoda de livrare aleasă; dacă proxy-ul este permis, acesta este bounded, iar blobul poate fi salvat în IndexedDB pentru offline dacă licența și quota permit. Dacă proxy/cache nu sunt permise, nu se folosesc. R2 nu este obligatoriu. Acestea nu sunt activate sau aprobate ca funcționare până la probe și coordonatorul poate respinge recomandarea pe baza dovezilor. Harness-ul local se alege după architecture.md revizuit.

**Specificație:** `docs/product.md`, `docs/feasibility.md`, `docs/decisions.md`, `docs/verification.md`, `docs/architecture.md`; ghid de lucru `docs/process.md`. Cerințele existente au prioritate; probele nu le schimbă.

## Constrângeri globale

- Produsul rămâne privat pentru două conturi; outsiderii nu văd și nu modifică datele comune.
- Interfața și descrierile suportă română, engleză și franceză; româna este limba de comunicare a proiectului.
- Confirmarea propunerii Buddy se face explicit; o versiune depășită cere reconfirmare și păstrează cererea inițială.
- Harta/rutele pot fi evaluate, dar prima versiune nu afișează distanțe sau durate estimate între opriri și nu cere trafic live.
- Salvarea offline este manuală și pe fiecare telefon; include planul și informațiile aprobate în limba contului. Harta și recomandările noi necesită internet.
- Prioritate cost zero; nicio probă nu cere billing obligatoriu, upgrade, R2 ori plan plătit. Nu se depășesc cotele prin retry sau concurență.
- Stack-ul de mai sus este recomandare pentru probe, nu decizie de produs; activarea Cloudflare/Firebase și furnizorilor este separată și cere decizia/autorizația viitoare.
- Asseturile editoriale sunt statice în Pages. Fotografiile se preiau/cache-uiesc numai prin metoda permisă de licența sursei; proxy bounded și IndexedDB se folosesc doar când termenii permit proxy/cache. Fallback-ul fără drepturi sau permisiune este omiterea fotografiei cu starea reală, nu schimbarea regulii offline.

## Puncte de review

- Identitate, permisiuni și izolarea profilului trebuie verificate inclusiv prin acces direct la interfețe server/API.
- Concurența și retry-urile nu trebuie să aplice modificări duplicate sau să piardă versiuni/capacitatea de recuperare.
- Răspunsurile furnizorilor și conținutul extern sunt neîncredere: surse, URL-uri, licențe, cote și timeouts trebuie limitate și explicabile.
- Lipsa datelor, limba greșită și refuzurile/alergiile trebuie să producă rezultate prudente, nu afirmații inventate ori recomandări incompatibile.
- Copia locală incompletă sau veche nu trebuie prezentată ca actuală/completă; evacuarea și ștergerea trebuie să respecte stările aprobate.

---

## Reguli de execuție și dovezi

Fiecare probă are ID stabil, responsabil `gpt-6-luna`, stare inițială **NEEXECUTATĂ**, condiții de intrare, fișiere viitoare, pași, PASS/FAIL, dovezi și oprire/fallback. Se execută separat și se arhivează comanda/configurația exactă, versiunea aplicației/harness-ului, setul de intrare, rezultatul, loguri redactate și capturi utile. Nu se includ secrete, date personale sau conținut cu licență neclară. Un eșec de mediu este **BLOCAT**, nu PASS. Un FAIL se raportează coordonatorului; fallback-ul descrie o opțiune de investigat și nu schimbă cerința.

### Contracte de intrare comune

Gate B1 înaintea aplicației extinse: după Task 1 se face Task 1b, spike tehnic minim numai în fișierele probe harness pentru auth verifier, D1 CAS/receipt și măsurare CPU; acesta este prerechizit pentru P-01/P-02/P-09. Un spike mobil P-12-A poate începe după shell-ul Task 0 și Task 1b. Acesta este numai harness de probă și nu implementează fluxuri de produs. Task 3 și Task 8 integrează soluția ulterior și repetă probele relevante; nu sunt dependențe pentru gate-ul timpuriu. Înainte de celelalte probe care depind de aplicație, coordonatorul fixează contractele după `architecture.md` revizuit la 2026-10-23: Firebase email/parolă cu email verificat și allowlist de exact două UID-uri precreate; obiect vacanță și apartenență; versiune monotonă; un singur UPDATE condițional D1 pentru CAS și receipt/effects protejate atomic; job explicit cu claim/lease/checkpoint; polling numai când pagina este vizibilă la interval de 15 secunde; snapshot offline; cote provider. Acestea sunt recomandări condiționate până la review, nu API-uri implementate.

### Date sintetice

Pregătiți fixture-uri locale fictive, fără persoane sau locații private reale: `u-alfa`, `u-beta` (membrii vacanței `trip-1`), outsider `u-gamma`; profiluri cu preferințe distincte; alergie fictivă la alune pentru un profil și aliment evitat pe bază de gust pentru altul; itinerariu `trip-1` versiunea 7 cu 3 zile, câteva opriri și câmpuri de sursă/licență; versiunea 8 cu o oprire nouă făcută de celălalt cont; proposal Buddy derivată din versiunea 7; răspunsuri sintetice de furnizori inclusiv timeout, 429, rezultat lipsă, sursă neconfirmată și URL ambiguă; fixture separat cu două limbi pe două conturi. Nu folosiți date reale de acces, nume sau preferințe personale.

---

## Probe locale simulate și contractuale — se pot planifica numai după arhitectură

### P-01 — Granița privată: doi membri, outsider și apel direct


**Responsabil:** `gpt-6-luna`

**Dependențe:** Gate B1 Task 1b spike minim: JWT verifier + allowlist/authz și D1 query pe fixture local/de test; contractele din `architecture.md`. Task 3 este integrare ulterioară și retest, nu prerequisite pentru această probă.

**Repere implementare:** Task 1b spike Gate B1 pentru probă timpurie; ulterior Task 3 din `docs/plans/2026-10-23-implementation.md` integrează și repetă verificarea auth. Fixture sintetic și raportul probei.

**Pași:** autentificați `u-alfa` și `u-beta`, verificați citirea și modificarea itinerariului comun și profilului propriu; încercați ca fiecare să citească/modifice profilul celuilalt; încercați ca `u-gamma` să acceseze ecranele și endpoint-urile pentru `trip-1`; repetați cererea direct la API fără a folosi UI; verificați răspunsurile private au `Cache-Control: private, no-store` și nu pot fi servite unei a doua sesiuni/UID din cache comun; modificați/semnați fals token-ul JWT sintetic, testați email neverificat, claim-uri greșite și token expirat; apoi faceți Firebase signOut și verificați separat că clientul golește IndexedDB/cache privat și nu mai trimite tokenul. Testați allowlist disable pentru UID revocat. Un ID token încă valid copiat înainte de signOut poate rămâne acceptat de Worker până la expirare: documentați acest comportament și nu îl declarați defect de revocare imediată, care nu este garantată de arhitectură.


**PASS:** numai cei doi membri citesc/modifică resursa comună; fiecare își gestionează doar propriul profil; apelul direct are aceeași autorizare ca UI; cache-ul nu amestecă răspunsuri private; token invalid, email neverificat, claim greșit sau token expirat sunt respinse; allowlist disable revocă accesul următoarelor cereri; după logout clientul golește copia locală și încetează API-ul. Tokenul valid existent poate rămâne valabil până la expirare și acest lucru este documentat, fără pretenție de invalidare imediată; răspunsurile nu divulgă dacă o resursă privată există.

**FAIL:** orice citire/modificare neautorizată, validare doar în UI, date locale rămase după logout sau detaliu privat în răspuns; de asemenea, acceptarea tokenului expirat/invalid ori a UID-ului dezactivat.

**Dovezi:** cereri/redactări, coduri și corpuri răspuns fără secrete, actor și permisiunea așteptată/obținută, log de audit dacă există.

**Stop/fallback:** opriți imediat și raportați acces neautorizat; păstrați numai fixture local. Dacă Firebase nu este configurat, testați contractul local și marcați componenta reală BLOCKED; nu introduceți cont real ca substitut. Nu adăugați mecanism nou de revocare imediată doar pentru a schimba rezultatul tokenului încă valabil după signOut.

### P-02 — Sincronizare și CAS la editări concurente


**Responsabil:** `gpt-6-luna`

**Dependențe:** Gate B1 Task 1b spike minim cu D1 CAS/receipt API; identificatorul și versiunea itinerariului și regula de conflict din `docs/product.md`. Task 8 integrează Buddy ulterior și repetă proba; nu este prerequisite pentru gate-ul timpuriu.

**Repere implementare:** Task 1b spike Gate B1 pentru D1 CAS/receipt; Task 8 din `docs/plans/2026-10-23-implementation.md` integrează și repetă ulterior. Fixture `trip-1` v7, harness concurent și raport distinct pentru simulare vs D1 API real.

**Pași:** în D1 de test, două sesiuni citesc v7; trimit aproape simultan schimbări independente și conflictuale; forțați întârzierea unei scrieri; încercați scriere condiționată pe v7 după ce v8 există; reîncărcați ambele sesiuni. Verificați exact un `UPDATE` pe documentul planului cu predicatele `trip_id`, `expectedVersion`, membership și proposal immutable pending cu `base_version`/fingerprint potrivite și lipsă receipt; update-ul setează `version+1` și `last_mutation_nonce=applyNonce`. Apoi `INSERT ... SELECT` al receipt-ului este permis numai dacă versiunea nouă și `last_mutation_nonce` corespund lui `applyNonce`. Forțați CAS rowcount zero și confirmați că nu există receipt/applied; forțați eroare batch între statementuri și verificați rollback complet; repetați concurent pe aceeași cheie și pe chei diferite pentru aceeași propunere. Folosiți D1 API real, nu emulare locală drept dovadă finală.


**PASS:** fiecare actualizare reușită are versiune vizibilă monotonă; CAS este un singur `UPDATE` cu toate condițiile și setează `last_mutation_nonce=applyNonce`; rowcount zero nu produce receipt sau `applied`; receipt-ul/side effects apar numai gardate la versiune nouă și cheie, iar eroarea de batch face rollback; aceeași comandă retry returnează receipt, iar aceeași propunere nu produce două efecte nici cu chei diferite; conflictul este raportat și reload arată starea canonică. Pentru schimbări independente, păstrarea/rezolvarea urmează contractul confirmat, fără pierdere tăcută.

**FAIL:** pierdere de update, versiune regresată, succes fals, duplicare sau suprascriere tăcută.

**Dovezi:** SQL-ul efectiv, D1 binding/API/environment, secvența temporală, payload sintetic, meta.changes, rows plan/receipt înainte/după, loguri și rezultat după reload.

**Stop/fallback:** opriți la corupere/lost update; reproduceți numai cu baza sintetică resetabilă. Mocks pot ajuta la dezvoltarea probei, dar PASS atomic necesită D1 API real. Dacă Worker/D1 Free nu se poate testa fără billing, marcați BLOCKED și escaladați; nu schimbați automat baza sau contractul.

### P-03 — Buddy: cerere păstrată, reconfirmare, dublare și timeout


**Responsabil:** `gpt-6-luna`

**Dependențe:** P-02 și contractele de propunere/confirmare din `docs/product.md`, `docs/verification.md`.

**Repere implementare:** Tasks 6–8 din `docs/plans/2026-10-23-implementation.md`; fixture proposal pe v7 și itinerariu v8, plus job endpoint explicit pentru claim/step/checkpoint.

**Pași:** cereți eliminarea/înlocuirea pe v7; modificați itinerariul în altă sesiune la v8; încercați confirmarea vechii propuneri; verificați că cererea rămâne și se generează o propunere nouă adaptată cu schimbarea concurentă prezentă; confirmați că proposal-ul este imuabil și legat de `proposal_id`, `trip_id`, `base_version` egal cu versiunea așteptată curentă, prefs-version fingerprint și patch definit de server; clientul trimite numai `proposalId`, versiunea așteptată și cheia, niciodată patch; pending se deduce din lipsa receipt-ului; versiunea planului sau fingerprint-ul preferințelor schimbat invalidează proposal-ul vechi și cere adaptare/reconfirmare; reconfirmați noul proposal și aplicați; trimiteți confirmarea de două ori cu același identificator; declanșați două confirmări simultane de la sesiuni, mai întâi aceeași cheie și apoi chei distincte pentru aceeași propunere; întrerupeți răspunsul după aplicare și reîncercați; injectați crash exact după CAS înainte de receipt/side effect și verificați atomicitatea/rollback-ul; injectați timeout înainte și după aplicare. Verificați separat jobul Buddy: claim cu `claimVersion` monoton și `leaseToken` unic, toate scrierile checkpoint/result/status protejate prin CAS pe attempt+claimVersion+leaseToken+state; abandonarea workerului A, expirarea lease-ului și revendicarea de către B, apoi răspuns târziu A după rezultat B; reluarea după reload și polling la 15 secunde numai cât pagina este vizibilă. Simulați timeout după apel extern: furnizorul poate procesa duplicat, deci rezervați quota conservator per attempt, nu rambursați prematur consumul neclar, dedupe numai efectele locale și nu pretindeți exactly-once extern.


**PASS:** versiunea veche nu se aplică; cererea originală rămâne vizibilă/neaplicată; rezumatul adaptat păstrează modificarea celuilalt; numai reconfirmarea explicită pe versiunea curentă aplică; confirmările duplicate/concurente dau un singur efect chiar cu chei idempotency distincte pentru aceeași propunere prin restricție `applied` unică per proposal; CAS acceptă numai proposal-ul immutable pending cu `proposal_id/trip_id/base_version=current/prefs-version fingerprint` concordante și patch-ul server-side; clientul nu poate trimite patch; receipt-ul este verificat înainte de conflictul de versiune; guard-ul de receipt leagă planul nou și `applyNonce`; există UNIQUE(`proposalId`) și UNIQUE(`tripId`,`uid`,`idempotencyKey`); la coliziune pe aceeași cheie se returnează receipt-ul câștigător, iar cheie diferită nu poate aplica aceeași propunere de două ori; versiunea sau fingerprint-ul nou nu reactivează proposal vechi; crash-ul între CAS și receipt se rezolvă atomic, fără plan aplicat fără receipt sau receipt fără plan. Jobul A cu claimVersion/leaseToken vechi nu poate suprascrie checkpoint/result/status lui B după lease takeover; retry extern dedupe numai efectele locale și contabilizează conservator quota per attempt, fără rambursarea prematură a utilizării neclare; polling-ul vizibil respectă intervalul de 15 secunde.

**FAIL:** aplicare implicită după conflict, pierderea cererii, pierderea editării concurente, efect dublu, proposal vechi reactivat, patch client-side acceptat, rezultat târziu al jobului A peste B sau imposibilitatea de a distinge applied/neaplicat după timeout.

**Dovezi:** transcript sintetic cu stări înainte/după, identificatori de comandă, versiuni și numărul efectelor aplicate.

**Stop/fallback:** opriți fluxul la efect ireversibil duplicat; resetați fixture-ul local. Dacă încă nu există un furnizor AI, folosiți proposal fix determinist; nu considerați acest test de logică drept verificare a calității AI.

### P-04 — Routing sintetic pentru mers, mașină, transport public și combinație


**Responsabil:** `gpt-6-luna`

**Dependențe:** `architecture.md`; contractul de traseu/transport și fixture-uri cu noduri și muchii sintetice. Orice probă pe furnizor este P-10.

**Repere implementare:** Tasks 6 și 8 din `docs/plans/2026-10-23-implementation.md`; adaptorul de rutare și verificatorul rezultatului.

**Pași:** pentru același set mic de opriri, cereți traseu mers, mașină, public și combinație; includeți o muchie inaccesibilă, rută lipsă și punct fără coordonate; verificați ordinea/topologia traseului și modul pe fiecare segment. Nu afișați și nu validați distanțe/durate către utilizator ca funcție cerută.


**PASS:** traseele sunt conectate conform grafului sintetic și respectă modul cerut pe segment; lipsurile sunt explicite și nu inventează conexiuni; combinația păstrează modul aplicat fiecărui segment; nu sunt produse distanțe/durate în UI/contractul de produs.

**FAIL:** segment imposibil prezentat ca rutabil, mod ignorat, opriri pierdute sau date lipsă transformate în certitudine.

**Dovezi:** fixture, rezultat structurat, validarea muchiilor și captură/raport fără metrici de distanță/durată.

**Stop/fallback:** opriți când fixture-ul nu poate distinge modurile; ajustați doar datele sintetice. Lipsa unui provider marchează integrarea reală neexecutată, nu eșecul cerinței de produs.

### P-05 — Sursă incertă, URL ambiguă, SSRF și licențe


**Responsabil:** `gpt-6-luna`

**Dependențe:** `architecture.md`; contract de adăugare locuri și politica de fetch; regulile surselor din product/feasibility.

**Repere implementare:** Tasks 6 și 8 din `docs/plans/2026-10-23-implementation.md`; mock server local și registru sintetic de licențe.

**Pași:** transmiteți nume ambiguu cu două rezultate sintetice; URL validă, redirect către loopback/IP privată, adresă locală IPv6, DNS rebinding simulat, scheme ne-web, redirect în lanț, răspuns foarte mare și timeout; furnizați rezultat fără sursă, licență necunoscută ori restricție incompatibilă. Includeți proxy-ul de imagini numai pentru host/path preautorizat și sursă care permite proxy/cache: redirect cross-host, MIME fals/SVG/HTML, adresă privată/loopback, DNS rezolvat privat, corp peste 2 MiB, timeout și rate de peste un fetch extern per request. Verificați plafonul de 50 external subrequests al Worker Free și no-store/CORS limitat. Nu accesați gazde reale. Verificați și că sursa incertă este marcată și cere verificare, fără inventarea prețului/programului.


**PASS:** identificarea ambiguă cere alegere/clarificare; sursa și incertitudinea sunt vizibile; proxy-ul acceptă numai sursa autorizată și termenii ei permit metoda de livrare; blochează destinațiile private/rezervate și redirect cross-host la fiecare hop, verifică MIME, limitează fotografia la 2 MiB și timeout scurt și cel mult un fetch extern per request; CORS/no-store nu expune cache privat. Conținutul fără drepturi confirmate nu este copiat/afișat.

**FAIL:** cerere către rețeaua locală/metadata, urmărire nesigură redirect, descărcare peste 2 MiB/timeout, mai multe fetch-uri externe într-o singură cerere, CORS wildcard/cache privat, certitudine inventată sau proxy/cache fără licență clară.

**Dovezi:** loguri mock, lista țintelor blocate/permise, rezultat de identificare și marcajele sursei/licenței.

**Stop/fallback:** la orice încercare de fetch non-local din harness, mock server-ul izolat simulează requestul mașinii locale; nu accesați gazde reale în această probă de securitate. Dacă termenii permit numai hotlink, nu forțați proxy-ul: folosiți sursa online când permis și omiteți fotografia offline; dacă drepturile nu permit nici asta, omiteți fotografia și marcați indisponibilă. Licență neclară înseamnă omiterea activului și escaladare către coordonator, nu presupunerea unei licențe.

### P-06 — Cote, concurență, reset, timeout și retry mărginit


**Responsabil:** `gpt-6-luna`

**Dependențe:** `architecture.md`, furnizorii și planurile candidate din feasibility.md; buget de probe aprobat ulterior.

**Repere implementare:** Tasks 6–7 din `docs/plans/2026-10-23-implementation.md`; mock provider și jurnal contoare. Simularea locală precedă orice test real.

**Pași:** în mock, simulați cotă rămasă, prag epuizat, reset la oră stabilită, răspuns 429 cu și fără Retry-After, timeout, 5xx și concurență peste plafon configurat; verificați comportamentul la granița resetului folosind timezone-ul și momentul de reset publicate de furnizor (nu timezone-ul hostului), inclusiv schimbarea timezone-ului hostului; încercați reset chiar înainte/după momentul providerului și retry cu backoff/jitter plafonat. După activarea ulterioară explicită a furnizorului, repetați numai cereri minime, cu buget și contor înainte/după aprobate de coordonator.


**PASS:** plafonul local nu este depășit, concurența este limitată, retry-urile au limită și termen total, un 429/capăt de cotă nu se transformă în furtună; resetul respectă timpul/timezone-ul furnizorului documentat independent de timezone-ul hostului; interfața poate comunica limitarea și păstra datele existente. Proba reală consumă doar bugetul aprobat și jurnalul se reconciliază.

**FAIL:** retry nelimitat, apeluri paralele peste limită, reset dedus greșit, depășire bugetară sau stare de produs pierdută la epuizarea cotei.

**Dovezi:** configurația cotei, cronologie simulată, număr apeluri/max concurență; pentru test real, autorizarea, furnizor/plan, contoare înainte/după și chitanțe redactate.

**Stop/fallback:** mock-ul este fallback complet până la activare. Opriți apelurile reale înainte de pragul rezervat; fără autorizare, cheie sau informații certe de reset, testul real rămâne **NEEXECUTAT/BLOCAT**. Niciun upgrade plătit.

### P-07 — Calitatea limbilor, refuz explicit și alergii


**Responsabil:** `gpt-6-luna`

**Dependențe:** cerințele de profil/alergii din `docs/product.md`; fixture-uri sintetice și rubrică revizuită de coordonator. Verificarea unui model/furnizor extern este separată și necesită P-11.

**Repere implementare:** Tasks 4, 6–7 din `docs/plans/2026-10-23-implementation.md`; evaluator local de set fix, generator determinist/mock și rezultate etichetate.

**Pași:** pentru același scenariu, produceți/inspectați RO, EN și FR; includeți refuz explicit al unei activități de către unul, preferințe diferite, alergie fictivă, aliment evitat doar ca gust, date incomplete despre contaminare încrucișată și traducere pentru stări de incertitudine. Verificați toate mesajele utilizatorului, sursa, motivul potrivirii și rezumatul.


**PASS:** refuzul oricăruia exclude activitatea comună; alergia distinctă de gust este respectată; informația despre contaminare necunoscută cere confirmare cu localul și nu oferă garanții; nicio preferință/date lipsă nu este inventată; sensul incertitudinii, refuzului și acțiunilor este consecvent în toate trei limbile.

**FAIL:** recomandare incompatibilă cu alergia/refuzul, confundarea gustului cu alergia, traducere care schimbă siguranța sau certitudine nefondată.

**Dovezi:** corpusul sintetic, rubrică, ieșire pe limbă, evaluator uman și motive de PASS/FAIL; nu prezentați scor automat ca verdict unic.

**Stop/fallback:** la rezultate de siguranță ambigue, blocați acel exemplu din recomandare și cereți revizuire; nu modificați politica alergiilor. Dacă nu există generator funcțional, testarea poate verifica fixture-urile și rubrică doar parțial și rămâne marcată incompletă.

### P-08 — Copie offline atomică și integritatea datelor locale


**Responsabil:** `gpt-6-luna`

**Dependențe:** arhitectură de stocare locală, schema și limba copiei din `architecture.md`/product.md.

**Repere implementare:** Task 11 din `docs/plans/2026-10-23-implementation.md`; injectare erori/quota, fixture itinerariu complet și pachet de imagini sintetice.

**Pași:** salvați manual un itinerariu complet cu text, ordine, surse/semne de incertitudine, cazare, sugestii, fotografie sintetică și limba contului; dacă termenii sursei permit proxy și cache, verificați fotografia de la origin fără CORS prin proxy bounded, cu răspuns validat, licență/atribuire păstrată și blob salvat în IndexedDB; dacă permit doar hotlink ori nu permit cache, verificați omiterea din snapshot cu starea corectă, fără proxy forțat; forțați lipsă de spațiu înainte/în timpul scrierii; corupeți o copie; creați schemă mai veche/nouă, limbă diferită și sesiune expirată; verificați explicit că sesiunea expirată offline poate citi numai copia salvată pe acel dispozitiv până la logout și nu poate sincroniza/apela API; includeți în manifest și active pointer `ownerUid`, `tripId`, `locale`, verificați aceste trei chei la load și commit sub account switch; simulați logout purge întrerupt și cold start înaintea reluării purge-ului, confirmând că alt UID nu poate citi snapshotul. Simulați ștergerea din cont și eviction/ștergere locală. Manifestul snapshotului fixează dinainte fotografiile eligibile și resursele obligatorii. Pentru o fotografie eligibilă/obligatorie din manifest, forțați fetch eșuat și verificați că actualizarea eșuează ca snapshot nou, păstrează vechea copie completă și nu declară noul snapshot complet cu fotografia omisă tacit. Dacă politica de licență nu permite cache sau fotografia e indisponibilă, fallback-ul trebuie declarat înainte de manifest: fotografia este exclusă și marcată indisponibilă explicit; nu se schimbă eligibilitatea în mijlocul salvării. Încercați actualizare întreruptă și deschidere offline.


**PASS:** utilizatorul poate distinge copia completă și data ei de o încercare parțială; actualizarea eșuată păstrează ultima copie completă; schemă necunoscută/coruptă nu este prezentată drept corectă; `ownerUid/tripId/locale` sunt validați atât la pointer load cât și la commit, fără cross-account leak și fără copierea limbii altui UID; fotografiile eligibile/obligatorii sunt fixate în manifest, iar fallback-ul indisponibil este declarat înainte de start; dacă un asset inclus în manifest eșuează, noul commit se respinge și pointerul vechi rămâne activ; limba salvării este cea cerută; sesiunea expirată poate citi snapshotul propriu numai cât rămâne offline și până la logout, fără API/sync; logout/ștergerea locală elimină copia conform contractului, iar offline nu promite hartă/linkuri/recomandări noi. Pierderea de spațiu este explicată, nu ascunsă.

**FAIL:** amestec de versiuni parțiale, succes fals, conținut vechi etichetat actual, accesul altui cont după logout/account switch ori purge întrerupt, manifest/pointer fără ownership/locale verificat, date corupte prezentate ca valide, commit nou parțial cu resursă obligatorie lipsă sau dispariția tăcută a ultimei copii.

**Dovezi:** hash/rezumat al fixture-ului înainte/după, versiune și limbă, stări ale copiilor, log de eroare și rezultat după redeschidere offline.

**Stop/fallback:** folosiți stocare locală de test fără date reale. Dacă platforma elimină datele independent, marcați limita și prezentați copie absentă; nu modificați cerința de salvare manuală.

### P-09 — Gate de CPU Cloudflare Workers Free pentru verificarea JWT și request


**Responsabil:** `gpt-6-luna` cu review coordonator.

**Dependențe:** Gate B1 Task 1b spike minim: Worker identity verifier și D1 query; proiect Workers Free fără billing obligatoriu; contractele din `docs/architecture.md`; payload JSON maxim tehnic de 256 KiB per request, cu planuri mari fragmentate pe zile — acesta nu limitează numărul de zile oferite produsului. P-09 și acest spike preced implementarea extinsă; Task 3 integrează auth ulterior și repetă benchmarkul. Benchmark local/mock nu înlocuiește gate-ul.

**Repere implementare:** Task 1b spike Gate B1; Task 3 din `docs/plans/2026-10-23-implementation.md` integrează ulterior verifierul și repetă benchmarkul. Harness-ul minim de benchmark nu cere fundația UI completă din Task 0.

**Pași:** măsurați CPU pentru verificare Firebase JWT + allowlist/authz + parsarea payload-ului JSON de 256 KiB + query D1, pe chei publice cold și warm. Rulați cel puțin n=100 cereri pentru fiecare path cold și warm; înregistrați workload, fiecare terminare/eroare CPU și totalul cotei consumate. Nu epuizați cotele prin benchmark. Măsurați separat verificarea cu `kid` cunoscut (warm) și recuperarea/actualizarea controlată a cheii necunoscute; rețeaua pentru refresh nu trebuie să ascundă timpul CPU sau să repete apeluri nelimitat.


**PASS:** p95 CPU ≤7 ms pentru cold și warm path, zero terminări CPU, cel puțin 100 cereri măsurate în fiecare path. Raportați p50/p95 și distribuția, workload-ul exact și consumul de cotă, nu doar media.

**FAIL:** p95 >7 ms pe oricare path ori orice terminare din limita CPU.

**Dovezi:** commit/build hash, mărimea payload-ului, numărul de iterații, stare cache keys, p50/p95 CPU și erori; fără token-uri sau UID-uri reale în raport.

**Stop/fallback:** opriți la terminare repetată sau risc de cost; nu activați billing și nu mutați automat la alt furnizor/plan. Coordonatorul revizuiește eficientizarea sau reconsideră arhitectura fără a reduce securitatea, verificările de auth ori regulile produsului. Dacă Worker real nu poate fi activat fără billing sau CPU nu poate fi măsurat fiabil pe Free, proba rămâne BLOCKED și arhitectura nu este declarată validată.

## Probe care necesită activare viitoare

Gate B1, probele P-01/P-02/P-09 și partea de fault injection tranzacțională din P-03 necesită Task 1b spike și servicii Cloudflare Free active fără billing obligatoriu; P-10–P-11 cer și activarea furnizorilor; P-12-A cere telefoane după Task 0/1b; P-12-B cere Task 11 și telefoane. Niciuna nu se execută fără revizuirea `architecture.md` și aprobarea coordonatorului pentru resursă, buget și conturi. Situația curentă pentru toate aceste probe reale: **NEEXECUTATE**.

### P-10 — API real de hărți/rutare și acoperire


**Responsabil:** `gpt-6-luna` după activare autorizată.

**Dependențe:** P-04 PASS pe date sintetice; furnizor și cotă confirmate, orașe de probă alese de coordonator, fără date personale; buget minim scris.

**Repere implementare:** Tasks 6 și 8 din `docs/plans/2026-10-23-implementation.md`; adaptor API și raport de probe.

**Pași:** rulați un set mic de perechi de puncte publice pentru mers, mașină, transport public și combinație; includeți cel puțin o zonă cu așteptare realistă de acoperire variabilă; verificați dacă există traseu și modul corect. Nu colectați distanțe/durate pentru interfața produsului și nu cereți trafic live.


**PASS:** furnizorul răspunde în limita timeout-ului și cotei, acoperirea și lipsurile sunt raportate exact, modul este respectat unde disponibil; nicio afirmație că acoperirea este universală.

**FAIL:** răspuns neverificat prezentat ca rută, limită/cost ascuns sau furnizorul nu poate reprezenta transportul selectat.

**Dovezi:** dată, zonă generală, profil API/versiune, răspunsuri minimizate și contoare înainte/după.

**Stop/fallback:** oprire la buget/cotă sau condiții de utilizare neclare; folosiți mesaj de indisponibilitate și evaluați ulterior un alt furnizor, fără a elimina transportul public din cerință.

### P-11 — Furnizori reali: surse, calitate lingvistică și cotă


**Responsabil:** `gpt-6-luna` după activare autorizată.

**Dependențe:** P-05/P-06/P-07 PASS local; serviciile exacte, termenii, utilizarea în SEE, cota/resetul și drepturile conținutului documentate și acceptate de coordonator.

**Repere implementare:** Tasks 6–7 din `docs/plans/2026-10-23-implementation.md`; set de evaluare sintetic și raport cu mostre redactate.

**Pași:** numai cu un set mic controlat, testați căutare/surse, generare/traducere în RO/EN/FR și fotografii dacă sunt în scop; verificați atribuire, licență, marcarea incertitudinii, refuzuri/alergii; numărați utilizarea și testați timeout/retry în limite aprobate.


**PASS:** toate rezultatele respectă P-05/P-07, sursele sunt verificabile și licențele permit afișarea propusă, rata de eroare/cotă rămâne sub limita convenită, fără condiții de serviciu incompatibile.

**FAIL:** sursă fabricată, licență neclară, traducere care inversează sensul, recomandare contra refuzului/alergiei, utilizare incompatibilă cu termenii sau cost/depășire neprevăzută.

**Dovezi:** termenii și data verificării, configurația, corpusul sintetic, ieșiri și surse, contoare; cheile redactate.

**Stop/fallback:** opriți acel furnizor dacă termenii, licența sau limita sunt neclare; reveniți la mock și propuneți furnizor alternativ pentru review, fără a activa automat alt cont.

## Probe pe telefon real — necesită dispozitive și autorizare ulterioară

Aceste probe sunt manuale pe telefon/browser real și **nu sunt executate**. Proprietarii dispozitivelor trebuie să accepte folosirea telefoanelor înaintea probelor reale. `webapp-testing` poate ghida numai verificarea în browser disponibil; instalarea skill-ului nu înseamnă că browserul sau aplicația au fost lansate.

### P-12-A — Mini-spike instalabil și stocare IndexedDB pe telefon

**Responsabil:** `gpt-6-luna` pregătește scenariul; coordonatorul/asistentul de verificare îl execută cu telefoanele numai după autorizarea viitoare a probei.

**Dependențe:** shell PWA din Task 0 și harness-ul Task 1b; un iPhone/iOS Safari și un Android convenite, build spike dedicat, fixture local cu itinerariu sintetic și fotografie sintetică. Se execută înaintea UI extinse și a Task 11.

**Repere implementare:** Tasks 0 și 1b din `docs/plans/2026-10-23-implementation.md`; raportul notează model/versiune OS fără date personale.

**Pași:** instalați/deschideți shell-ul pe fiecare platformă; salvați manual fixture-ul minim în IndexedDB; opriți browserul complet și faceți cold launch; activați airplane mode și recitiți copia, inclusiv fotografia sintetică; porniți un update cu manifest local și întrerupeți-l înainte de commit pentru a verifica păstrarea copiei vechi. Nu testați în această fază toate câmpurile offline, account switching ori comportamentul complet de logout.

**PASS pentru mini-spike:** shell-ul pornește la rece și redă fixture-ul salvat fără rețea pe ambele platforme; update-ul întrerupt nu înlocuiește copia veche și UI-ul nu declară update complet. Rezultatul este numai dovadă timpurie pentru disponibilitatea tehnică și nu este PASS pentru MVP, produs sau offline complet.

**FAIL:** copia nu supraviețuiește cold launch/airplane mode, fotografia sintetică nu poate fi citită offline, ori update-ul parțial înlocuiește copia activă sau este raportat drept complet.

**Dovezi:** build hash, model și versiune OS, pași, starea pointerului/copiei înainte și după, capturi/video fără date personale și rezultat pe fiecare platformă.

**Stop/fallback:** opriți dacă sunt implicate date reale sau device changes distructive; folosiți numai fixture local. Dacă accesul la dispozitive nu este autorizat/disponibil, marcați BLOCKED; simularea desktop nu înlocuiește această probă.

### P-12-B — Snapshot offline complet și ciclul de viață pe iOS și Android

**Responsabil:** `gpt-6-luna` pregătește scenariul; coordonatorul/asistentul de verificare îl execută cu proprietarii dispozitivelor numai după autorizarea viitoare.

**Dependențe:** Task 11 complet și integrarea web funcțională; un iPhone și un Android convenite, build identificat și aprobarea folosirii dispozitivelor. Nu se folosesc conturile/utilizatorii reali fără acordul lor.

**Repere implementare:** Task 11 din `docs/plans/2026-10-23-implementation.md`; scenariu telefon și raport cu model/versiune OS redactate.

**Pași:** pe fiecare sistem, salvați manual și deschideți fără conexiune; închideți complet browserul și porniți la rece; redeschideți după repornire; importați fixture-urile fotografice licențiate/sintetice; întrerupeți actualizarea; simulați lipsa cotei de stocare, fișier corupt, schimbare de schemă, limbă schimbată, sesiune expirată și logout cu verificarea ștergerii locale. Încercați eviction/cache clear doar controlat și notați dacă platforma o poate face independent.

**PASS:** ambele platforme afișează fără internet toate datele aprobate din ultima copie completă, data și limba corectă; fără hartă, linkuri externe ori recomandări/conversații noi; cold launch și browser închis nu pierd copia; eșec de actualizare/corupere/schemă/eviction nu este prezentat ca succes; logout elimină copia locală potrivit contractului și niciun alt profil nu o vede.

**FAIL:** conținut lipsă/mixt prezentat complet, acces după logout, pierdere la pornire la rece, fotografie locală esențială indisponibilă fără mesaj, neconformitate CORS/cache sau proxy fără limite de destinație/mărime/timp când proxy-ul este permis de licență, sau diferență între platforme care încalcă cerința.

**Dovezi:** checklist pe fiecare OS/model/versiune, filmare/capturi fără date private, data copiei, pașii offline și erorile observate.

**Stop/fallback:** opriți dacă sunt expuse date reale sau telefonul ar fi modificat/distructiv; folosiți build și fixture dedicate. Dacă un OS nu permite garantarea păstrării din cauza eviction, documentați reproducerea și reveniți coordonatorului pentru decizie, fără a modifica tacit cerința.

## Revizuire finală a acestui plan

- Acoperire cerințe: P-01 acces privat; P-02 sync/conflict/reload; P-03 Buddy, atomicitate și idempotency; P-04/P-10 rutare; P-09 gate CPU; P-05/P-11 surse, ambiguitate, SSRF/licențe; P-06/P-11 cote; P-07/P-11 limbi, refuz, alergii; P-08/P-12 offline, fotografii, cold launch, browser închis, update eșuat, quota, corupere, schemă, limbă, sesiune, logout și eviction (mini-spike P-12-A separat de verificarea completă P-12-B).
- P-01, P-02 și P-09 se execută întâi pe Task 1b spike Gate B1, iar Task 3/8 repetă integrarea; P-03–P-08 folosesc fixture-uri/simulări locale pentru scenariile care nu cer integrarea reală; dovada atomicității CAS/receipt din P-02/P-03 cere D1 API Free real. P-09 cere Worker real pe Free; P-10–P-11 cer activare de furnizor; P-12-A cere telefoane după Task 0/1b, iar P-12-B cere Task 11 și telefoane cu acord pentru probe reale.
- Toate probele API D1/Workers deployate, furnizor și telefon sunt **NEEXECUTATE**. Niciun browser nu a fost pornit și nicio cerință de produs nu este schimbată de plan. Stack-ul din architecture.md este recomandarea condiționată de rezultatele probelor și review-ul coordonatorului; R2 sau billing nu sunt gate-uri pentru acest plan.
