# Proces de lucru

## Flux permanent

<a id="flux-permanent"></a>

La începutul fiecărei sesiuni urmează pornirea din `AGENTS.md`: citește integral instrucțiunile, secțiunile curente din memorie și plan, statusul Git complet, cererea curentă și starea verificată relevantă. Încarcă doar documentele necesare etapei. Depozitul, codul verificat și documentele menținute sunt sursele de adevăr; conversațiile și autorizările istorice sunt context, nu mandat activ.

Fluxul fiecărei sarcini este **UNDERSTAND → PLAN → DELEGATE → IMPLEMENT → VERIFY → DOCUMENT → REPORT**:

1. **UNDERSTAND:** clarifică rezultatul cerut, limitele autorizării, starea verificată, constrângerile și dependențele. Nu inventa cerințe sau priorități.
2. **PLAN:** precizează obiectivul și scopul, criteriile de acceptare, fișierele afectate, dependențele, responsabilul, riscurile și metoda de verificare proporțională. Actualizează planul activ pentru sarcina curentă.
3. **DELEGATE:** împarte numai lucrările independente în contracte mici cu fișiere permise, context relevant, interfețe, acceptare și verificări. Respectă limita de cel mult trei subagenți concurenți și poarta de implementare a coordonatorului din `AGENTS.md`. Nu suprapune scrierea: serializează sarcinile concurente care ating același fișier.
4. **IMPLEMENT:** autorul lucrează numai în fișierele atribuite, raportează diff-ul și dovezile, apoi repară observațiile delegate. Reviewerul independent rămâne read-only.
5. **VERIFY:** coordonatorul examinează fiecare diff real și dovezile; reviewul independent read-only se folosește proporțional cu schimbarea. Rulează doar verificări relevante, sigure, autorizate și practice; nu declara drept trecute verificări neexecutate. Reverifică remedierile înainte de închidere.
6. **DOCUMENT:** după verificare actualizează numai sursele curente relevante: memorie pentru starea proiectului; plan pentru starea, dependențele și handoff-ul sarcinii; decizii doar pentru alegeri aprobate de produs/arhitectură; verificări doar cu rezultate efectiv executate. Actualizează alte documente numai când sunt efectiv afectate. Păstrează istoria, sursele, incertitudinile, blocajele și legăturile ca parte a închiderii sarcinii; nu rescrie documente fără legătură și nu extinde scopul.
7. **REPORT:** explică rezultatul și fișierele schimbate, ce s-a verificat, ce a rămas neexecutat, riscuri/blocaje, starea Git și următoarea acțiune logică. Nu o executa automat dacă nu este autorizată.

## Reguli de branch și autorizare

Dezvoltarea se face numai pe `main`; nu crea sau folosi branch-uri temporare/de feature ori worktrees. Înaintea unei tranziții verifică și păstrează toate schimbările staged, unstaged și untracked. Este permisă numai trecerea la un `main` deja existent, pe același commit, fără pierderea niciunui byte local. Dacă `main` lipsește sau pointează la alt commit, tranziția este blocată: raportează starea și oprește tentativa de tranziție și dezvoltarea produsului. Continuă numai acțiuni read-only sau lucru documentar permis explicit de cererea curentă. Nu crea branch-uri și nu folosi fetch, merge, rebase, reset sau clean ca remediere automată.

Commitul și push-ul cer autorizare explicită. Deploy/publicarea, costurile, serviciile, activarea furnizorilor, probele reale și integrările externe au nevoie fiecare de autorizarea explicită relevantă. Cererea de dezvoltare sau documentare nu le implică.

## Istoric — recuperare documentară locală, 2026-11-03

Mandatul de atunci privea numai recuperarea și alinierea locală a documentației atribuite. Nu autoriza cod/configurație de produs, mutații Git/commit/push, deploy/publicare, servicii, teste/probe, instalări sau costuri. Acea limită era specifică sarcinii și nu este regula permanentă.

## Istoric — execuție curentă la 2026-10-23
Implementarea conform planului, activarea serviciilor gratuite și publicarea sunt autorizate prin cererea actuală; nu cere repetarea acordului. Instrucțiunile istorice despre acord separat pentru gratuit sunt depășite. Tasks 0–1 și partea locală Task 1b au urmat delegare → review → corectare delegată → reverificare → integrare → verificare finală. Gate B1 cere în continuare dovezile reale. Fără card/billing/upgrade automat; orice pas cu plată se oprește și se explică înainte de executare. Nu se publică automat issues sau PR-uri.

Acest paragraf păstrează autorizarea și starea din 2026-10-23; nu se aplică sarcinii active din 2026-11-03.

## Responsabilități
Utilizatorul decide scopul, preferințele și acceptarea finală.
Coordonatorul păstrează imaginea de ansamblu, alege soluția tehnică după brief, definește sarcinile și verifică integrarea.
Implementatorii rezolvă sarcini delimitate și repară observațiile primite. Reviewerul independent caută defecte și lipsuri de verificare.
Reviewul independent completează verificarea coordonatorului; nu o înlocuiește.

## Cum discutăm cu utilizatorul
Utilizatorul nu are experiență IT. Explicăm mai întâi ce va putea face sau ce se schimbă pentru el, apoi motivul. Termenii necesari primesc o explicație scurtă: de exemplu, un test este o verificare automată, iar un worktree este o copie separată pentru lucru.
Punem întrebările pe rând, cu o recomandare și consecințe ușor de înțeles. Nu îi cerem să aleagă nume de biblioteci sau comenzi când coordonatorul poate lua decizia. Preferințele de produs și compromisurile care îi afectează utilizarea rămân ale utilizatorului.
Caveman poate scurta mesajele tehnice dintre agenți. Mesajele către utilizator, planurile pentru aprobare și instrucțiunile de verificare rămân complete și clare.

## Alegerea skill-urilor după etapă

Inventarul, proveniența, regulile de selecție și integrarea Travel Buddy sunt în [docs/skills.md](skills.md). Alege doar skill-urile relevante, consultă regulile live la review unde se cere și numește skill-urile aplicabile în contract. Nu dubla aici inventarul.

## Ciclu pentru o funcționalitate
La reluare verifică starea curentă și cererea activă, apoi citește contractul înainte de delegare. Dovezile vechi nu dovedesc acces, stare sau autorizare în sesiunea curentă.

1. Coordonatorul notează în plan rezultatul așteptat, criteriile de acceptare și dependențele.
2. Deleagă un contract: scop, fișiere permise, interfețe, criterii, verificări și lucruri excluse.
3. Agentul implementează și raportează fișierele schimbate, dovezile și incertitudinile. Nu modifică fișierele altui agent.
4. Coordonatorul citește modificările și solicită review independent când complexitatea justifică acest lucru.
5. Fiecare defect are identificator, severitate, locație, comportament observat și rezultat așteptat. Coordonatorul trimite defectele agentului responsabil.
6. Agentul repară și repetă verificările afectate. Coordonatorul verifică fiecare remediere și efectele asupra integrării.
7. Coordonatorul face verificarea finală a întregului flux. Problemele care împiedică utilizarea sau pierd date blochează marcarea ca finalizat.
8. Închide documentarea conform etapei [DOCUMENT din fluxul permanent](#flux-permanent); predă utilizatorului rezultatul, instrucțiunile de verificare și limitările reale.

Nu repetăm corectări identice fără diagnostic nou. Când un agent nu progresează, coordonatorul restrânge sarcina sau schimbă abordarea; preluarea implementării urmează poarta din `AGENTS.md`. Întrebările către utilizator privesc decizii de produs sau blocaje reale.

## Verificări proporționale
- Pentru documentație: coerență, linkuri, fapte și separarea deciziilor de propuneri.
- Pentru cod: verificări disponibile de lint, tipuri și build; teste pentru comportamente relevante, fără teste care copiază implementarea.
- Pentru UI: fluxurile principale într-un browser real, dimensiuni desktop și mobil, navigare cu tastatura, stări goale și erori relevante.
- Pentru date: salvare și reîncărcare, validare la intrare, recuperare/export dacă sunt cerute prin brief.
Comenzile exacte se stabilesc odată cu stackul. Orice verificare neexecutată se declară explicit.

## Continuitate
La început citește documentele de context. La final salvează doar fapte, decizii, obstacole și următorul pas util.
Nu păstra parole, tokenuri sau date personale de călătorie în memoria agenților.
Schimbarea instrucțiunilor de proces aparține coordonatorului; implementatorii pot propune ajustări.

## Modele și disponibilitate
Principalul rămâne modelul selectat în aplicație. `gpt-6-luna` este alegerea pentru sarcini mici; `gpt-6.1-sol` poate face review dificil.
Rolurile din `.codex/agents/` și instrucțiunile din `AGENTS.md` exprimă această împărțire. Nu garantează disponibilitatea unui model și nu schimbă permisiunile sesiunii.
În această sesiune, coordonatorul poate indica explicit modelul la delegare. Pentru sesiunile noi, dacă rolurile nu apar, redeschide proiectul și verifică descoperirea lor.


## Istoric — ajustări pentru pregătirea implementării, 2026-10-23
- Verificăm actualitatea copiei locale înainte de delegare. În această sesiune copia inițială era veche și îi lipsea galeria; cele zece documente au fost recuperate prin conexiunea GitHub. Nu tratăm un fișier lipsă local ca lipsă în repository.
- Cererea actuală și notele recente primează; istoricul cu întrebări/limite închise nu reactivează un interviu sau seria de machete. Documentele lungi primesc o stare curentă la început.
- Capacitatea sesiunii este șapte agenți în total. Patru lucrări independente de redactare justifică patru agenți gpt-6-luna: vizual/imagini, arhitectură, probe, execuție. Reviewul independent dificil folosește gpt-6.1-sol și începe după existența livrabilelor. Nu ocupăm sloturi fără sarcină independentă.
- Contractele includ scop, context de citit, skill-uri de aplicat, fișiere permise, interfețe, dependențe, rezultat și verificări. Agentul raportează ce a verificat efectiv. Configurațiile, fișierele de contracte comune și memoria au un singur proprietar la un moment dat.
- Înghețăm contractele de date și alegerea tehnică înainte de implementarea în paralel. Agenții care planifică își transmit dependențele; coordonatorul rezolvă nepotrivirile.
- Reviewul produce observații cu ID; autorul repară, reviewerul recitește remedierea, coordonatorul verifică integrarea. Nu marcăm un test tehnic trecut pentru că scenariul este bine documentat.
- Salvarea documentației în GitHub este autorizată în această etapă. Folosim un commit cu numai documentele schimbate, pe baza ultimului arbore, cu verificarea versiunii anterioare la actualizare. Nu creăm automat issues/PR-uri și nu activăm publicarea site-ului.
- Separăm proba locală simulată de proba reală cu furnizor/telefon. Activarea serviciilor și implementarea sunt în afara mandatului curent.

- La reviewul acestei etape au apărut ID-uri de probe inventate în matrice și o dependență circulară între probele de telefon și fundație. Păstrăm un singur inventar canonic de ID-uri, verificăm legăturile dintre planuri după redactare și separăm gate-ul minim timpuriu de probele de integrare care cer funcționalități deja construite.
- După orice corecție a contractului (de exemplu nonce CAS, ownership offline sau stările joburilor), autorul notifică explicit documentele consumatoare; coordonatorul verifică aceleași denumiri, nu doar faptul că autorii au acceptat observația.
- Pentru reducerea rundelor inutile, autorul declară un snapshot „gata pentru review” înaintea verdictului integrat. Observațiile timpurii pot ghida redactarea, dar închiderea lor cere recitirea snapshotului final. După corectarea unei decizii repetate în mai multe secțiuni, căutăm întregul document pentru formulări vechi, nu doar paragraful indicat.


## Autorizare Git istorică din AGENTS.md

<a id="autorizare-git-istorica-din-agentsmd"></a>

Textul de mai jos este păstrat integral din instrucțiunile inițiale. El descria autorizarea persistentă din acea perioadă; nu extinde autorizarea activă a documentării locale din 2026-11-03:

Utilizatorul a autorizat operațiunile GitHub/Firebase/Cloudflare necesare cererilor explicite, fără confirmări repetitive. După review și verificările cerute, commit/push pe `main` sunt acoperite de această autorizare; nu cere acord repetat. Nu deduce din aceasta deploy/publicare a produsului, PR automat, costuri sau activarea unor furnizori. Cere confirmare dacă accesul a expirat, depinde de acțiunea proprietarului, apar costuri/ștergere importantă ori acțiunea depășește mandatul.
