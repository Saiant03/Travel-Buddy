# Proces de lucru

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
- Înțelegerea ideii: `grill-me`, apoi `write-a-prd` în `docs/product.md`.
- Planificarea implementării: `writing-plans`; harta rămâne `docs/plan.md`, cu linkuri la planuri detaliate din `docs/plans/`.
- Implementare și teste relevante: `travel-buddy-engineering` și `test-driven-development`.
- Îmbunătățirea codului existent: `improve-codebase-architecture`, pe baza unei probleme concrete.
- Review și verificare: `code-review-and-quality`, `travel-buddy-review`, `webapp-testing` pentru un site care rulează; skill-urile vizuale după necesitate.
- Izolare: `using-git-worktrees` când lucrarea justifică o copie separată, după verificarea mediului și a preferințelor existente.
Instalarea unui skill nu îl execută și nu pornește etapa respectivă.

## Ciclu pentru o funcționalitate
1. Coordonatorul notează în plan rezultatul așteptat, criteriile de acceptare și dependențele.
2. Deleagă un contract: scop, fișiere permise, interfețe, criterii, verificări și lucruri excluse.
3. Agentul implementează și raportează fișierele schimbate, dovezile și incertitudinile. Nu modifică fișierele altui agent.
4. Coordonatorul citește modificările și solicită review independent când complexitatea justifică acest lucru.
5. Fiecare defect are identificator, severitate, locație, comportament observat și rezultat așteptat. Coordonatorul trimite defectele agentului responsabil.
6. Agentul repară și repetă verificările afectate. Coordonatorul verifică fiecare remediere și efectele asupra integrării.
7. Coordonatorul face verificarea finală a întregului flux. Problemele care împiedică utilizarea sau pierd date blochează marcarea ca finalizat.
8. Actualizează memoria, planul și deciziile; predă utilizatorului rezultatul, instrucțiunile de verificare și limitările reale.

Nu repetăm corectări identice fără diagnostic nou. Când un agent nu progresează, coordonatorul restrânge sarcina, schimbă abordarea ori preia problema. Întrebările către utilizator privesc decizii de produs sau blocaje reale.

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
