# Plan de lucru — Travel Buddy

## Snapshot curent — Task 4A verificat local, 2026-11-02

Task 4A a fost extras explicit din Task 4 și implementat delegat după fundația Task 2 (`40198ed`, confirmare `55c2c11`). [Contractul local](plans/2026-11-02-task-4a-local-preferences.md) și [dovezile](evidence/2026-11-02/task-4a-local-preferences.md) descriu pagina celor cinci carnete, alegerile exclusive, căutarea, precizările, progresul, RO/EN/FR și exemplele fictive în memorie. Resetarea la reload este explicată. Inventarul alimentar nu este aprobat final; precizările non-food sunt note, iar prepararea structurată este demonstrată la ceapă/roșii.

Coordonatorul a confirmat 130/130 teste, typecheck, lint, build și 9/9 E2E Chromium; browserul independent a acoperit tastatură, cele trei limbi, mobil/desktop, reduced motion și zoom CSS 200%. Zoomul nativ, Safari/dispozitivul fizic și cititorul de ecran nu sunt demonstrate; limitele TDD și ale probelor sunt în raport. Task 4 complet rămâne nefinalizat și dependent de Task 3; backendul, izolarea reală și ajustările per vacanță nu sunt implementate. P-09 rămâne FAIL, p95 exact necunoscut; B1, Task 3 și acceptarea online rămân blocate. Fără reluarea probelor reale, schimbări de servicii, deploy/publicare sau PR. Commit/push sunt autorizați după review; livrarea Git se consemnează separat.

## Snapshot curent — Task 2 finalizat local, 2026-11-02

Fundația UI locală a trecut reviewul și verificările coordonatorului; detaliile și limitele sunt în [dovada Task 2](evidence/2026-11-02/task-2-ui.md). Exemplele sunt fictive, iar limba este doar în memorie. Nu s-au implementat produsul complet sau backendul. P-09 rămâne FAIL, p95 exact necunoscut; Gate B1 și Task 3/backend/acceptarea online rămân blocate. Task 4+ nu sunt autorizate în bloc. Implementarea a fost livrată pe `main` prin `40198eda5bc83976ef3aaef8dcb0f8c2897bbf38`; push fără force confirmat, fără deploy. Actualizarea documentară de livrare urmează separat. Textul de pornire al Task 2 de mai jos este istoric.

## Prioritate curentă — fundație locală și gate server separat, 2026-11-02

Utilizatorul a autorizat începerea Task 2 pentru interfața locală: React 19 + TypeScript strict + Vite + Zod, fundație comună, design tokens/componente de bază, navigare și localizare RO/EN/FR (româna implicită). Această lucrare folosește machetele și contractele deja aprobate/documentate; nu redeschide brief-ul sau explorarea vizuală. Datele/sesiunile folosite în interfață sunt explicite mock/synthetic, fără Firebase/Auth real sau date personale.

Dezvoltarea locală a UI este separată de validarea serverului. Gate B1 rămâne BLOCAT: P-09 CPU cold a eșuat pragul p95 ≤7 ms; raportul corelat are 10/100 cereri cold peste 7 ms, iar rezultatul exact pentru restul cererilor nu este cunoscut. Acest eșec nu se elimină, nu se prezintă ca rezolvat și nu se deduce din performanța locală. Task 3 (auth/API privat/live backend) rămâne blocat de P-09 și probele reale aferente. Tasks ulterioare pot pregăti UI cu fixture-uri locale numai conform planului și nu sunt autorizate în bloc. Nu reporni CPU/CAS, nu schimba Worker/Firebase/D1, nu publica și nu activa servicii/costuri.

Următorul handoff pentru implementare este [Task 2](plans/2026-11-02-next-chat-handoff.md). În această conversație a fost autorizată documentarea și promptul de pornire; crearea chatului rămâne manuală. După review și verificările cerute, commit/push pe `main` sunt acoperite de autorizarea Git existentă; fără deploy/publicare a produsului sau PR automat.


Integrarea selectivă este confirmată în `main` la `aace865e28cc88d012d6b585aaad9e6044c1b701` (părinți `1fb41d7, b295642`), cu push fără force. Corectările au trecut 111/111 teste, 8/8 E2E Chromium, typecheck, lint și cele trei builds pornite prin Playwright `webServer`; scanarea țintită a celor 133 de fișiere staged nu a găsit cele două UID-uri vechi, markeri de cheie privată sau conflicte; nu a fost un audit exhaustiv. Avertismentele Rollup Zod `@PURE` și `NO_COLOR` au fost non-blocking. Produsul complet nu este implementat.

Alpha/Beta au trecut 10/10 acces autentificat și 14/14 CAS/idempotency pe buildul raportat. Fixture-ul este la versiunea 8; nu reseta și nu relua CAS. Runda CPU a doua (captură UTC 07:10:33–07:20:34) a corelat 10 cereri cold distincte din 100, toate peste 7 ms, deci pragul p95 cold al P-09 este demonstrat ca depășit; CPU-ul pentru celelalte 179 de cereri măsurate și p95-ul exact rămân necunoscute. Nu relansa probele CPU sau CAS. Profilarea locală a căii cold/cache poate fi evaluată separat ulterior; ea nu schimbă verdictul P-09 și nu deblochează backend-ul. P12-A manual pe iPhone 14 Pro Max a trecut pentru fixture-ul sintetic conform [dovezii](evidence/2026-10-23/phone-probe-progress.md); nu cere repetarea. Android nu este confirmat și nu condiționează integrarea; nu se decide aici eliminarea criteriilor de acceptare ale produsului. Facturarea nu este autorizată.

Preflight-ul read-only a confirmat Cloudflare HTTP 200 pentru lista celor două Worker-e și metadata/listare D1 (șase tabele afișate, fără validarea schemei/conținutului), plus Firebase OAuth/Auth read HTTP 200, două conturi confirmate și enabled. Nu s-au făcut mutații, CAS sau workload CPU în preflight. Workers Builds API a răspuns 403 la trigger; automatizarea de branch rămâne necunoscută și nu am lansat nicio comandă sau acțiune de deploy. Comparația directă a valorilor allowlist-ului live rămâne neexecutată deoarece sursa privată lipsește; nu blochează integrarea GitHub și trebuie făcută înaintea unui deploy ulterior. Rețeaua este disponibilă prin `exec` cu permisiune explicită; diagnosticele din octombrie sunt istorice. Vezi [jurnalul Alpha/Beta](operations/2026-11-02-alpha-beta-verification.md) și [raportul de verificare](verification.md).

## Etapa precedentă — recuperarea probelor, 2026-11-01

Cererea din 1 noiembrie a autorizat alinierea conturilor probei server Cloudflare la cele două conturi Firebase existente, pregătirea fixture-ului sintetic în D1 dedicată și verificarea probelor, cu evidențe în GitHub. Nu a autorizat implementarea produsului complet sau servicii cu plată.

Starea operațională și dovezile acelui moment sunt în [jurnalul de recuperare](operations/2026-11-01-probe-recovery.md). Preflight-ul, backup-ul privat, reviewul, corectarea allowlist-ului, fixture-ul D1 și verificările negative au fost finalizate și reverificate. Statutul conturilor/fixture-ului din acest snapshot este istoric, fiind înlocuit de rezultatele autentificate din 2 noiembrie.

Nu relua explorarea vizuală sau interviul de produs. Nu interpreta notele vechi despre servicii indisponibile ca stare actuală. Integrarea documentației/fundației nu înseamnă publicarea produsului.

## Etapa încheiată: brief și evaluare documentară (2026-10-22)
- Definirea inițială este încheiată. Cerințele au fost consolidate în `product.md`, cu flux, limite și criterii observabile; întrebările vechi deja rezolvate au fost eliminate.
- Evaluarea actuală a accesului online, căutării, generării, hărților/traseelor și consultării offline este în `feasibility.md`, cu surse oficiale, cote, compromisuri și limite de verificare.
- Trei agenți gpt-6-luna au cercetat domenii separate, fără editări comune. Coordonatorul a integrat și verificat rezultatul, inclusiv corectarea limitelor ORS vechi și a eligibilității Gemini.
- Nu s-au implementat site-ul, ales definitiv tehnologii, creat conturi sau activat servicii.

## Istoric — pregătirea implementării, 2026-10-23
Explorarea vizuală este încheiată. Cererea curentă autorizează documentarea și planificarea, nu implementarea, activarea serviciilor sau publicarea site-ului. Notele istorice de mai jos păstrează parcursul proiectului; această secțiune stabilește următorul pas.

**Plan de execuție:** [Etape, contracte pentru agenți și criterii de acceptare](plans/2026-10-23-implementation.md).

Livrabile complementare:
- [Reguli vizuale, componente reutilizabile și inventarul imaginilor](design-system.md).
- [Recomandarea tehnică, alternativele și condițiile costului zero](architecture.md).
- [Probele timpurii: acces, sincronizare, conflicte, Buddy, hartă, surse, cote și telefon offline](plans/2026-10-23-technical-probes.md).

Ordine recomandată: autorizarea viitoare a execuției → contracte/fundație și probe locale → autorizarea separată a activării strict gratuite, când sunt necesare probe reale → dovezi pentru acces/conflicte/offline și furnizori → fluxuri complete → review, corectare delegată, reverificare și verificare finală pe telefon/calculator. Nu este o autorizare implicită de publicare.

Tehnic, recomandarea coordonatorului este React/TypeScript/Vite ca aplicație web instalabilă, Cloudflare Pages + Worker + D1 pentru interfață/API/date și Firebase Auth Spark pentru cele două conturi; Tavily/Groq/Geoapify rămân furnizori verificați documentar, condiționați de probe. Nu se activează facturare sau upgrade automat. Detaliile și pragurile sunt în arhitectură și în planul probelor.

Preferințele rămase reutilizează carnetele aprobate. Nu mai producem serii de machete fără o problemă concretă. Fontul real, adaptarea și interacțiunile se verifică în browser în etapa autorizată. Referințele exacte ale celor două fotografii Lisabona pentru introducere trebuie recuperate; această lipsă blochează acceptarea acelei secțiuni, nu pregătirea aplicației private.

Patru agenți gpt-6-luna au finalizat documentele independente (vizual, arhitectură, probe, execuție) și corectările. Un agent gpt-6.1-sol a reverificat IR-01–IR-08; toate sunt închise documentar. Coordonatorul a verificat integrarea finală, fără a declara probele tehnice executate. Capacitatea disponibilă înlocuiește limita istorică de trei subagenți, conform cererii actuale.

## Istoric — etape planificate anterior
1. Design: structură, fluxuri, preferințe detaliate, aspectul Buddy și tratarea informațiilor lipsă.
2. Plan detaliat: responsabilități, contracte, probe de fezabilitate și criterii pentru MVP. Probele reale de API/telefon rămân neexecutate; vor preceda promisiunea funcționării integrate.
3. Implementare: numai după cerere explicită. Coordonatorul planifică și deleagă lucrări delimitate către gpt-6-luna, cu fișiere distincte.
4. Review, corectare delegată și reverificare, apoi verificarea integrată a coordonatorului.
5. Verificare finală umană: utilizatorul confirmă dacă produsul răspunde brief-ului.

## Fundația existentă
Documentele de context și cele 24 de skill-uri sunt pregătite; inventarul este în `skills.md` și `skills-lock.json`. Nu se reia instalarea lor. Dovezile și limitele verificărilor sunt în `verification.md`.


## Prioritatea curentă — 2026-10-22
Utilizatorul continuă prin GitHub. Predarea curentă de la finalul `docs/memory.md` înlocuiește pașii istorici depășiți de mai sus. Cele patru compromisuri și direcția vizuală concretă sunt aprobate. Conținutul copiei offline este aprobat: toate zilele și ordinea locurilor, detalii cunoscute cu marcajele de incertitudine, fotografii pentru telefon, cazări, sugestii păstrate și linkuri către surse (detalii în `product.md`). Harta și conversațiile noi cu Buddy necesită internet. Copia offline se salvează în limba aleasă în cont pe fiecare telefon; schimbarea limbii salvate necesită internet și actualizarea copiei. Nu se salvează implicit toate cele trei limbi. Urmează detaliile preferințelor, alergiile/intoleranțele, identificarea locurilor, stările generării și machetele. Tehnologiile nu sunt aprobate; nu implementăm sau publicăm site-ul.

### Pas curent: inventar detaliat de preferințe
Utilizatorul a cerut categorii mai complexe și selecția exactă a alimentelor și preparatelor consumate. Cerința și cele patru răspunsuri alimentare („Îmi place mult”, „Mănânc”, „Aș încerca”, „Nu mănânc”) sunt aprobate; inventarul alimentar rămâne propunere în `docs/product.md`. Regula alimentelor necompletate este aprobată: preferință necunoscută, prioritate preparatelor acceptate, respectarea refuzurilor și clarificări doar dacă informația este esențială alegerii unui restaurant. Profilul se poate completa treptat. Sunt aprobate precizările opționale pe aliment (opțiuni rapide și text propriu), toleranța la picant și preferințele de preparare. Buddy le respectă când există date și marchează ce trebuie verificat când informațiile lipsesc. Regulile pentru alergii/intoleranțe sunt aprobate în `docs/product.md`: preparate incompatibile cunoscute excluse; localuri cu informații incomplete vizibile separat cu „Necesită confirmare cu localul”, inclusiv pentru contaminare încrucișată; fără garanții de siguranță din meniul online. Structura detaliată „Atracții și cultură” este aprobată. Structura „Activități și natură” și filtrele despre efort, apă, înălțimi, experiență, format și limite sunt aprobate. Structura „Relaxare” este aprobată împreună cu precizările despre atmosferă, cadru, confort, acces și pauze. Structura „Shopping” este aprobată împreună cu precizările opționale. Fluxul de identificare a locurilor prin nume/link și tratarea ambiguităților este aprobat în `docs/product.md`. Sunt aprobate progresul real vizibil al generării, păstrarea separată a rezultatelor incomplete și reîncercarea manuală după întreruperi. Utilizatorul cere feedback vizibil pe parcursul așteptării, pentru a evita confuzia. Direcția de machetă pentru generare este aprobată în `docs/product.md`: Buddy animat discret, etape active/încheiate și mesaje concrete despre progres real. Prima machetă statică pentru telefon a ecranului de generare nu a fost acceptată; au fost create cinci alternative mai jucăușe și urmează alegerea/refinarea lor, celelalte machete și evaluarea tehnologiilor; fără implementare sau activarea serviciilor. Randările și desenul final al mascotei nu sunt aprobate implicit. Inventarul alimentar exact rămâne de rafinat înaintea implementării formularului. Nu tratăm exemplele ca profiluri personale sau alegeri aprobate.


## Prima machetă pentru telefon — 2026-10-22
A fost generată o machetă statică a ecranului de generare: [previzualizare și note](mockups.md), imagine în `docs/mockups/generation-mobile-v1.png`.
Baza vizuală și comportamentul sunt aprobate; prima randare și desenul propus al lui Buddy nu au fost acceptate de utilizator. Cele cinci alternative mai jucăușe sunt documentate mai jos. Lisabona / 5 zile este un exemplu de ecran, nu o vacanță declarată. Nu există site sau animație implementată. Tipografia exactă, dimensiunile responsive, contrastul și comportamentul din browser se verifică la implementare.

## Iterații vizuale mai jucăușe — 2026-10-22
Utilizatorul nu a acceptat prima machetă și a cerut cinci iterații mai jucăușe, păstrând baza. Fontul aprobat rămâne **Bricolage Grotesque**. În prima randare, tipografia nu a redat fidel fontul; imaginile generate sunt explorări vizuale, iar fontul exact se verifică ulterior în browser.
Au fost create cinci alternative pentru ecranul de generare, numerotate în [galeria de machete](mockups.md): 1 — Traseu cu opriri; 2 — Pașaport cu ștampile; 3 — Atelierul lui Buddy; 4 — Hartă de buzunar; 5 — Bagaj de vacanță.
Se păstrează paleta verde pădure/alb cald/auriu, Buddy maro-crem cu rucsac verde și etapele clare de progres. Compoziția, stilul ilustrației și reprezentarea progresului sunt explorate separat. Variantele 2 și 3 au fost indicate ca cele mai interesante; toate cele cinci randări și variantele mascotei rămân fără aprobare finală. Originalul este păstrat ca istoric, nu ca design acceptat. Nu există site sau animație implementată.

## Direcție vizuală aprobată — combinația 2 + 3, 2026-10-22
Utilizatorul a indicat inițial variantele 2 („Pașaport cu ștampile”) și 3 („Atelierul lui Buddy”) drept cele mai interesante, apoi a aprobat explicit direcția ilustrată de combinația lor: „arată grozav, exact direcția dorită”. Macheta combinată devine referința vizuală aprobată pentru ecranul de generare și pentru dezvoltarea următoarelor machete.
A fost creată o propunere combinată: bilete și ștampile din varianta 2, Buddy organizând cartonașele zilelor din varianta 3, iar progresul este prezentat pe o foaie de pașaport cu text drept pentru lizibilitate.
[Imagine și note în galerie](mockups.md), fișier `docs/mockups/generation-mobile-hybrid-02-03.png`. Fontul stabilit rămâne Bricolage Grotesque; imaginile generate nu verifică redarea exactă a fontului. Direcția vizuală a variantei combinate este aprobată: atmosferă de pașaport/bilete/ștampile, Buddy organizând cartonașele zilelor, text drept și progres clar. Se păstrează verde pădure, alb cald, auriu și fontul Bricolage Grotesque. Aprobarea direcției nu confirmă fidelitatea fontului din imagine sau un comportament funcțional în browser. Macheta itinerariului unei zile pe telefon a fost creată la cererea utilizatorului, cu stările Listă/Hartă și detaliile la cerere. Aspectul a primit feedback pozitiv și utilizatorul a cerut continuarea; macheta detaliilor unei opriri este acum aprobată. În ecranele de consultare, funcțiile rămân centrale și Buddy este discret, conform brief-ului. Nu există site sau animație implementată.

## Machetă itinerariu zilnic pe telefon — 2026-10-22
La cererea utilizatorului a fost creată o machetă statică în direcția vizuală aprobată 2 + 3. Sunt prezentate alăturat două stări alternative ale aceluiași ecran mobil: Listă și Hartă, pentru aceeași zi.
[Imagine și note](mockups.md), fișier `docs/mockups/itinerary-day-mobile-list-map-v1.png`.
- Exemplu: Lisabona, 5 zile, pe jos, Ziua 2 selectată. Nu reprezintă o vacanță declarată de utilizatori.
- Lista arată trei opriri ordonate (Miradouro da Graça, Castelo de São Jorge, Alfama), detalii la cerere și „Preț neconfirmat”.
- Harta arată aceeași ordine, cu legătura Centru → 1 → 2 → 3 → Centru, conform bazei implicite fără cazare. Harta și miniaturile sunt ilustrative, nu date cartografice sau fotografii verificate.
- Cafenelele sunt sugestii opționale separate; există intrări pentru adăugarea unui loc, salvarea planului offline și modificări cu Buddy. Harta rămâne online.
- Buddy este discret; biletele, ștampilele și culorile preiau direcția aprobată. Fontul stabilit rămâne Bricolage Grotesque, cu fidelitatea reală de verificat în browser.
Macheta itinerariului a primit feedback pozitiv privind aspectul, iar utilizatorul a cerut continuarea designului. Cele două stări alăturate sunt pentru comparație; pe telefon se comută între ele. Nu s-a implementat un site, o hartă sau salvarea offline.

## Machetă detalii loc pe telefon — 2026-10-22
Utilizatorul a apreciat aspectul machetei itinerariului („Îmi place cum arată”) și a cerut continuarea după clarificarea accesului de pe telefon. Depozitul GitHub este privat; pentru consultarea lui în browser este necesară autentificarea cu un cont autorizat. Imaginile sunt incluse și direct în mesajele finale.
A fost creată următoarea machetă statică: detaliile unei opriri într-un panou peste itinerariu. [Imagine și note](mockups.md), fișier `docs/mockups/place-detail-mobile-v1.png`.
- Exemplu: Castelo de São Jorge, Ziua 2 / Oprirea 2, Lisabona.
- Panou cu imagine ilustrativă, descriere scurtă și motivul recomandării.
- Preț și program neconfirmate; rezervare de verificat; acces la sursă.
- Controale pentru înlocuire, eliminare și revenire la plan; închiderea păstrează poziția din itinerariu, conform cerinței existente.
Direcția vizuală rămâne cea aprobată (pașaport, bilete, ștampile; verde pădure/alb cald/auriu; Bricolage Grotesque). Macheta detaliilor este aprobată de utilizator: „da, arată bine și este în temă”. Sunt acceptate organizarea panoului, păstrarea contextului itinerariului, informațiile de verificat și acțiunile prezentate. Imaginea și motivul de potrivire sunt exemple de design, nu fotografie verificată sau preferințe personale completate. Nicio interacțiune nu este implementată.

Macheta conversației cu Buddy a fost realizată, cu rezumatul modificărilor, confirmare înainte de aplicare și reconfirmare după schimbarea planului comun. Aspectul machetei este aprobat vizual. La cererea utilizatorului, claritatea fluxului se verifică în etapa de verificare a site-ului funcțional. Se păstrează regulile aprobate: o persoană poate confirma, iar o propunere bazată pe o versiune veche se adaptează și se reconfirmă. Continuăm cu machete statice, fără implementarea site-ului sau activarea serviciilor.

## Machetă conversație Buddy și confirmare — 2026-10-22
La cererea utilizatorului a fost creată macheta statică a conversației cu Buddy, în direcția vizuală aprobată. [Imagine și note](mockups.md), fișier `docs/mockups/buddy-chat-confirmation-mobile-v1.png`.
Două stări ale aceluiași ecran pe telefon sunt prezentate alăturat:
- Propunerea normală: cererea „Scoate castelul și păstrează restul”, rezumat cu eliminarea Castelo de São Jorge, păstrarea Miradouro da Graça și Alfama, ordinea rezultată și „Confirmă și aplică”.
- Plan comun modificat între timp: cererea este păstrată; Sé de Lisboa, adăugată între timp, rămâne în noua propunere. Buddy afișează rezumatul actualizat și „Reconfirmă și aplică”.
În ambele stări planul actual rămâne salvat, iar schimbările așteaptă confirmarea unei singure persoane, conform regulii existente. Există acțiunea „Mai ajustează”, câmpul de mesaj și revenirea la itinerariu.
Macheta este aprobată vizual de utilizator: „arată bine”. Claritatea conversației, a rezumatului și a confirmării nu este încă validată; utilizatorul dorește această evaluare când site-ul este funcțional, în etapa de verificare. Locurile și mesajele sunt exemple, nu modificări reale ale unei vacanțe. Nu există chat sau sincronizare implementate. Fontul rămâne Bricolage Grotesque; redarea exactă și interacțiunile se verifică la implementare. Aspectul este acceptat pentru continuarea designului. Scenariile de verificare sunt consemnate în `docs/verification.md`; rămân neexecutate. În etapa actuală evaluăm machetele vizual, fără a cere un verdict de funcționare pe baza imaginilor statice.

Macheta salvării offline a fost realizată cu trei stări: copie salvată, actualizare disponibilă și actualizare nereușită cu ultima copie completă păstrată. Aspectul machetei offline este aprobat vizual; verificarea clarității și a comportamentului se face ulterior în site-ul funcțional.

## Machetă salvare offline pe telefon — 2026-10-22
A fost creată macheta statică a copiei offline, în direcția vizuală aprobată. [Imagine și note](mockups.md), fișier `docs/mockups/offline-copy-mobile-states-v1.png`.
Trei stări alternative sunt prezentate alăturat:
1. Copie completă salvată pe acest telefon, în limba contului, cu data ultimei salvări și acces la plan.
2. Actualizare disponibilă după schimbarea planului comun; copia existentă rămâne accesibilă, iar actualizarea pornește manual.
3. Actualizare nereușită după întreruperea conexiunii; ultima copie completă și data ei se păstrează. Planul salvat se poate deschide; reîncercarea așteaptă reconectarea.
„Lisabona · 5 zile”, româna și data 22 octombrie 2026 · 18:40 sunt exemple pentru machetă (ora locală Europe/Bucharest), nu o salvare reală.
Harta și mesajele noi către Buddy necesită internet. Salvarea este separată pe fiecare telefon; cardul cu trei rânduri despre conținut este o sinteză vizuală, fără a reduce conținutul offline deja aprobat. Bricolage Grotesque rămâne fontul stabilit.
Macheta offline este aprobată vizual de utilizator: „foarte bine, mai departe”. Verificările funcționale sunt planificate în `docs/verification.md`, neexecutate. Nu există salvare offline implementată.

## Machetă „Vacanțele noastre” — 2026-10-22
Utilizatorul a aprobat vizual macheta offline („foarte bine, mai departe”). Verificările funcționale și de claritate rămân planificate pentru site-ul funcțional, neexecutate.
A fost creată macheta statică a paginii private de după conectare, în direcția vizuală aprobată. [Imagine și note](mockups.md), fișier `docs/mockups/trips-home-mobile-v1.png`.
Două stări ale aceleiași pagini mobile sunt prezentate alăturat:
- Cu vacanțe existente: carduri ilustrative, destinație, număr de zile, transport și acces la itinerariu; acțiunea „Vacanță nouă”.
- Înainte de prima vacanță: mesaj introductiv, Buddy cu un bilet și acțiunea „Planifică prima vacanță”.
În ambele stări se poate accesa „Preferințele mele”. Cardurile Lisabona / 5 zile / pe jos și Madeira / 7 zile / mașină sunt exemple, nu vacanțe declarate sau date salvate ale utilizatorilor. Imaginile sunt ilustrative.
Macheta paginii „Vacanțele noastre”, în ambele stări, este aprobată vizual la 2026-10-23. Nu s-au implementat conectarea, gestionarea vacanțelor sau preferințele. Utilizatorul apreciază explicit imaginile personalizate ale fiecărei destinații. Fluxul de creare în trei pași este reprezentat în macheta de mai jos, încă neaprobată vizual.

## Aprobare „Vacanțele noastre” și imagini specifice destinațiilor — 2026-10-23
Utilizatorul a aprobat vizual cele două stări ale paginii „Vacanțele noastre” și a apreciat explicit faptul că fiecare destinație are o imagine personalizată.
Pe cardurile vacanțelor păstrăm imagini/ilustrații proprii fiecărei destinații, cu repere, peisaje sau atmosferă recognoscibile, în stilul vizual unitar aprobat (jurnal de călătorie, bilete și ștampile, paleta verde pădure/alb cald/auriu). Ilustrațiile Lisabona și Madeira din machetă sunt referințe vizuale acceptate pentru această direcție.
Această alegere privește cardurile destinațiilor; cerințele despre fotografiile locurilor recomandate și referințele exacte ale fotografiilor pentru introducere rămân cele consemnate anterior. Metoda de obținere și păstrare a imaginilor destinațiilor rămâne de ales în limitele costului zero înainte de implementare.
Aspectul paginii este aprobat. Interacțiunile și claritatea se verifică ulterior în site-ul funcțional. Macheta creării unei vacanțe în trei pași a fost realizată; gruparea ecranelor și aspectul sunt propuneri pentru evaluare vizuală.

## Istoric — prima machetă creare vacanță în trei pași, neacceptată (2026-10-23)
La cererea utilizatorului a fost creată macheta statică a fluxului de creare. Cerința celor trei pași este deja aprobată; gruparea concretă de mai jos este propunerea de design din această machetă, încă de evaluat.
[Imagine și note](mockups.md), fișier `docs/mockups/trip-creation-mobile-three-steps-v1.png`.
1. **Destinație și perioadă:** destinație, alegere între perioadă și număr de zile; exemplul folosește 12–16 mai 2027, cinci zile inclusiv.
2. **Transport și cazare:** variante combinabile (pe jos, transport public, mașină); cazare și ore aproximative de sosire/plecare opționale.
3. **Rezumat și preferințe:** datele introduse, starea pregătirii ambelor profiluri, ajustarea preferințelor proprii pentru vacanța respectivă și „Generează itinerariul”.
Exemplul este consecvent în cele trei ecrane: Lisabona, cinci zile, pe jos + transport public, cazare de completat și ore neprecizate. Pregătirea ambelor profiluri este ilustrativă, nu o declarație despre datele reale ale celor doi.
Se păstrează cerințele existente: fiecare parcurge cele cinci categorii (alege o preferință sau „Nu am preferințe speciale aici”), refuzurile ambilor sunt respectate, pot exista mai multe cazări/baze și generarea funcționează fără cazare sau buget. Stările cu preferințe incomplete se vor reprezenta în fluxul preferințelor; condiția de completare nu este eliminată de această machetă.
Ilustrația destinației urmează direcția aprobată; fontul stabilit rămâne Bricolage Grotesque, cu redarea exactă de verificat în browser. Prima machetă nu a fost acceptată vizual: utilizatorul cere o experiență mai distractivă și distinctivă, conform noii propuneri de mai jos. Nu există formular sau generare implementate. Verificările din `docs/verification.md` sunt planificate, neexecutate.

## Crearea vacanței — concept interactiv „Bilet, bagaj, pașaport”, 2026-10-23
Utilizatorul nu a acceptat prima machetă de creare: meniurile i s-au părut prea generice și insuficient de creative. Cere o experiență mai distractivă, distinctivă, dincolo de decorarea unui formular obișnuit. Cerințele funcționale și structura în trei momente se păstrează.
A fost creată o nouă propunere vizuală: [galerie și note](mockups.md), fișier `docs/mockups/trip-creation-mobile-travel-desk-v2.png`.
1. **Biletul destinației:** ilustrație personalizată, oraș editabil pe bilet, perioada reprezentată prin ștampile/date editabile și alternativa „Aleg doar zilele”.
2. **Bagajul călătoriei:** modurile de transport sunt jetoane ilustrate selectabile; cele alese apar în bagaj. Cazarea este o etichetă cu cheie, opțională; orele aproximative sunt etichete opționale separate.
3. **Pașaportul pentru Buddy:** rezumatul și starea preferințelor fiecăruia apar pe paginile unui pașaport. Acțiunea explicită „Buddy, pregătește planul!” pornește generarea, după revizuire.
Interacțiuni propuse, încă neaprobate și neimplementate: atingere pentru editarea datelor/selectarea jetoanelor, intrarea jetoanelor alese în bagaj, completarea pașaportului și tranziția către ecranul de generare. Tragerea obiectelor nu este obligatorie; se păstrează alternativele accesibile și utilizarea fără mișcare.
Toate valorile din imagine sunt exemple: Lisabona, 12–16 mai 2027, cinci zile, pe jos + transport public, cazare și ore necompletate, două profiluri pregătite. Nu sunt date reale sau rezervări. Cazările multiple, preferințele proprii ajustabile pentru vacanță și condiția celor cinci categorii parcurse de ambii se păstrează.
Direcția de bază rămâne cea aprobată: verde pădure/alb cald/auriu, Bricolage Grotesque, Buddy și ilustrații specifice destinației. Utilizatorul a aprobat vizual ultima scenă (pașaportul / rezumatul) și a cerut reformularea titlului scenei a doua. Titlul „Ce luăm în călătorie?” sugera o listă de bagaje; a fost înlocuit în machetă cu „Cum explorăm și unde stăm?”, pentru transport și cazare. Scena a treia este păstrată. La 2026-10-23, utilizatorul a aprobat explicit scena a doua și noul titlu: „Cum explorăm și unde stăm” este mult mai potrivit. Scenele a doua (transport/cazare) și a treia (pașaport/rezumat) sunt aprobate vizual. Prima scenă nu are încă o confirmare explicită separată; aceasta nu împiedică pregătirea următoarelor machete. Mișcările propuse nu sunt încă aprobate sau implementate. Este o imagine statică; fontul real, animațiile, accesibilitatea și interacțiunile se verifică la implementare.

Macheta preferințelor alimentare detaliate a fost creată ca un carnet de gusturi: explorare, alegerea unui răspuns pentru un aliment exact și precizări opționale. Aspectul carnetului de gusturi este aprobat vizual de utilizator. Claritatea și comportamentul interactiv se verifică în site-ul funcțional.

## Machetă preferințe alimentare — carnet de gusturi, 2026-10-23
La cererea de continuare a fost creată macheta statică a preferințelor personale pentru mâncare și băuturi, în tema unui carnet gastronomic de călătorie.
[Imagine și note](mockups.md), fișier `docs/mockups/food-preferences-mobile-tasting-notebook-v1.png`.
Trei vederi succesive sunt propuse:
1. **Explorezi:** căutare directă, file distincte Alimente / Preparate / Băuturi, grupe ilustrate, adăugarea unui aliment lipsă, acces separat la alergii și intoleranțe și opțiunea „Nu am preferințe speciale aici”.
2. **Alegi:** pentru un aliment exact, cele patru răspunsuri aprobate sunt ștampile selectabile: „Îmi place mult”, „Mănânc”, „Aș încerca”, „Nu mănânc”. Un singur răspuns pe element; alimentele necompletate rămân necunoscute.
3. **Precizezi:** precizări opționale despre preparare, cu stări explicite și o notă proprie. Exemplul arată Ceapă / Mănânc, crudă / Nu mănânc, gătită / Mănânc și nota „Doar gătită, inclusiv în sosuri”.
Aceste selecții sunt exemple ale produsului, nu preferințe alimentare sau date de sănătate declarate de utilizatori. Alergiile/intoleranțele nu sunt deduse din gusturi. Interfața privește propriul profil; ajustările pentru o vacanță rămân distincte conform cerinței existente.
Fila Băuturi folosește același model de selecție pe elemente concrete (de exemplu espresso, ceai, limonadă), fără a limita selecția la alcool. Grupele din imagine sunt o parte a inventarului extensibil; lista exactă rămâne de rafinat.
Macheta preferințelor alimentare este aprobată vizual de utilizator: „da, îmi place, e fun”. Aprobarea privește experiența și aspectul; exemplele nu completează profilurile reale, iar inventarul exact rămâne de rafinat. Nu există formular, stocare sau personalizare implementate. Fontul stabilit rămâne Bricolage Grotesque; redarea reală și claritatea se verifică în site-ul funcțional.

## Machetă „Atracții și cultură” — carnet de explorator, 2026-10-23
Utilizatorul a aprobat vizual carnetul de gusturi („da, îmi place, e fun”) și a cerut continuarea. A fost creată macheta următoarei categorii de preferințe, în același limbaj de carnet ilustrat.
[Imagine și note](mockups.md), fișier `docs/mockups/culture-preferences-mobile-explorer-notebook-v1.png`.
Trei vederi sunt propuse:
1. **Explorezi:** cele opt grupe deja aprobate — istorie, muzee, artă, arhitectură, patrimoniu religios, viață locală, spectacole, panorame/fotografie — cu căutare și adăugarea unei preferințe.
2. **Descoperi:** tipuri exacte de muzee, selectabile separat, fără propagarea automată a interesului la toate tipurile.
3. **Alegi:** pentru „Artă modernă”, opțiunile „Îmi place mult”, „Aș încerca”, „Nu mă interesează, dar pot participa” și „Nu vreau deloc”. Exemplul selectează participarea fără interes propriu și permite o precizare opțională.
Interfața explică regula existentă: participarea fără interes propriu poate permite activitatea comună pentru celălalt; refuzul explicit o exclude din planul comun. Se păstrează activitățile împreună și alternarea priorităților.
Selecțiile și nota „Prefer expoziții mai mici” sunt doar exemple, nu preferințe reale declarate. Fiecare își editează propriul profil. Gramatica vizuală preia carnetul de gusturi, cu etichete adecvate activităților, distincte de răspunsurile alimentare.
Macheta culturii a primit feedback vizual pozitiv de la utilizator („super”). Aprecierea privește direcția și aspectul, fără validare funcțională. Nu există formular sau motor de recomandări implementate. Claritatea și comportamentul se verifică în site-ul funcțional; scenariile sunt planificate în `docs/verification.md`, neexecutate.
