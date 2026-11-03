# Travel Buddy — instrucțiuni de proiect

## Pornire obligatorie

Proiect personal pentru două persoane. Produsul urmărit îi ajută să planifice vacanțe împreună, cu itinerarii zilnice potrivite preferințelor amândurora și informații online; demonstrațiile locale nu oferă încă fluxul complet. Utilizatorul comunică în română și nu are experiență IT; explică simplu, fără infantilizare. Stack: React 19, TypeScript, Vite și Zod. SHA-urile din notele istorice sunt doar proveniență; nu face checkout sau reset la ele.

- La fiecare pornire citește integral acest fișier, secțiunea `Stare curentă` din [memorie](docs/memory.md#stare-curenta), secțiunea `Execuție activă` din [plan](docs/plan.md#executie-activa), statusul Git (branch, staged, unstaged și untracked), cererea curentă și starea verificată relevantă. Citește alte documente doar când cererea sau etapa le cere; nu încarcă întregul istoric.
- Pentru produs și raționamente durabile, consultă [cerințele](docs/product.md) și [deciziile](docs/decisions.md). Pentru sarcină, dovezi, proces ori skill, urmează harta de mai jos.
- Task 2, 4A, 5A, 6A, 7A și 8A au livrabile locale în memorie; produsul complet și Task 4–8 complete nu sunt finalizate. Nu relua sarcini încheiate și nu transforma handoff-ul istoric Task 2 într-un mandat.
- Istoricul și handoff-urile nu autorizează reluarea sarcinilor încheiate sau un task nou de produs; planul descrie sarcina curentă, iar cererea curentă îi stabilește limitele și autorizarea.

## Branch și păstrarea muncii

Dezvoltarea are loc numai pe branch-ul local `main`; nu crea și nu folosi branch-uri temporare/de feature ori worktrees. Înaintea oricărei schimbări de branch verifică working tree-ul și păstrează toate modificările staged, unstaged și untracked. Schimbă numai către un `main` deja existent care pointează la același commit; dacă lipsește sau diferă, oprește tranziția și raportează blocajul. Nu crea branch-uri, nu face fetch, merge, rebase, reset sau clean pentru a rezolva diferența.

Commit și push cer autorizare explicită pentru acele acțiuni. Nici cererile de dezvoltare, nici istoricul nu autorizează deploy/publicare, costuri, servicii, furnizori, probe reale sau integrări externe; cere autorizarea explicită relevantă înaintea lor. Verificările automate se rulează numai dacă sunt sigure, relevante, autorizate și practice.

## Surse canonice

| Subiect | Sursa canonică |
|---|---|
| Starea actuală și limitele scurte | [docs/memory.md](docs/memory.md) |
| Sarcini, stări, dependențe și predarea activă | [docs/plan.md](docs/plan.md) |
| Cerințe și acceptare de produs | [docs/product.md](docs/product.md) |
| Decizii și motive | [docs/decisions.md](docs/decisions.md) |
| Rezultate de verificare și limite | [docs/verification.md](docs/verification.md) |
| Surse operaționale și dovezi datate | [docs/operations/](docs/operations/), [docs/evidence/](docs/evidence/) |
| Flux de lucru | [docs/process.md](docs/process.md) |
| Inventar, alegere și proveniență skill-uri | [docs/skills.md](docs/skills.md), `skills-lock.json` |
| Introducere și puncte de pornire | [README.md](README.md), [CLAUDE.md](CLAUDE.md) |

Încărcă documente suplimentare numai când sarcina le cere. `docs/memory.md` este un snapshot, nu înlocuiește implementarea ori sursele de dovezi.

## Produs și siguranța sesiunii

Datele demo pentru Tasks 2/4A/5A/6A/7A/8A sunt sintetice, numai în memorie și se pierd la reload. Rutele și rezultatele locale, inclusiv `/itinerary-demo` pentru Task 8A, sunt în snapshotul memoriei și planului. Aceste demonstrații nu înseamnă produs complet, backend sau acceptare integrală.

Machetele existente rămân aprobări istorice; fidelitatea vizuală a demo-ului itinerarului nu este validată, iar direcția implementată nu este stabilită sau acceptată. Prioritatea este diagnosticul și remedierea P-09, apoi B1 și funcționalitatea conform dependențelor, inclusiv Task 3 și accesul privat. Verificările reușite ale conturilor/probelor istorice nu dovedesc accesul complet în produs. Nu presupune rerulare live, schimbarea pragurilor ori deploy; amână designul și finisarea până când fluxurile funcționează și sunt verificate.

P-09 este **FAIL la pragul CPU cold**: 10/100 cereri distincte depășesc 7 ms; valoarea p95 exactă și CPU-ul complet rămân necunoscute. B1, Task 3, backendul și acceptarea online sunt blocate. iPhone: PASS manual pentru fixture sintetic; nu este acceptare completă și nu se repetă. Android: necunoscut și nu este gate de integrare. Nu relua CPU/CAS/iPhone, nu reseta fixture-ul, nu modifica servicii și nu activa furnizori ori costuri. Fotografiile și acceptarea vizuală deschisă, precum și limitele TDD, sunt în evidențele legate din memorie/plan.

Rapoartele de acces/preflight din alte sesiuni nu dovedesc accesul curent. Înaintea unei acțiuni administrative, verifică numai accesul necesar în sesiunea curentă; nu expune sau copia secrete, nu reface setup-ul automat și nu presupune autentificarea profilului CLI `cf` (profilul `default` a fost găsit neconectat). Dacă preflight-ul actual a reușit, nu repeta setup-ul. Preflight-ul read-only din 2 noiembrie este istoric, nu verificare actuală.

## Mandat și delegare

Utilizatorul decide scopul, preferințele și acceptarea. Coordonatorul planifică, definește contractul, deleagă, revizuiește, verifică integrarea și predă; nu implementează în locul agentului. Agentul implementator lucrează numai în fișierele atribuite, repară observațiile și raportează dovezi, limite și verificări neexecutate. Nu declara integrarea sau acceptarea finală înaintea verificării coordonatorului.

Poolul permis: `gpt-6-luna` implicit pentru lucrări mici; `gpt-6-sol` și `gpt-6.1-terra` sunt opțiuni potrivite fără promisiune de cost mai mic. Nu schimba automat modelul principal. Coordonatorul poate delega lucrări independente justificate, dar cel mult **3 subagenți concurenți**, conform limitei curente a utilizatorului; vechea limită de 7 este istorică. Escaladarea peste mandatul de cost/complexitate cere acordul utilizatorului. Coordonatorul implementează numai după confirmarea agentului că nu poate prelua sarcina și acordul utilizatorului.

Nu deduce deploy, costuri, furnizori, PR sau publicare din push ori din autorizări istorice. Nu crea chat nou automat. Dacă un model explicit nu este disponibil, raportează și identifică alternativa.

## Alegerea skill-urilor

Inventarul canonic, proveniența și regulile complete sunt în [docs/skills.md](docs/skills.md). Încarcă doar skill-urile relevante și numește-le în contractele de implementare/review. Pentru React folosește `vercel-react-best-practices`, pentru API-uri de componentă `vercel-composition-patterns`, pentru UI `web-design-guidelines`, iar la review de documentație `writing-guidelines` cu sursa live și adaptare clară în română. Aplică skill-urile Vercel relevante fără o nouă cerere; brief-ul utilizatorului primează față de preferințele estetice. Native, view transitions și serviciile Vercel se folosesc numai când sunt relevante și explicit autorizate. Skill-urile nu presupun Next.js/RSC/React Native/Vercel și nu autorizează upload/deploy. Originalele `SKILL.upstream.md` sunt surse de referință, nu puncte de intrare; folosește instrumentele disponibile, nu nume preluate literal din alt produs.

## Flux și raportare

Urmează [fluxul operațional](docs/process.md): **UNDERSTAND → PLAN → DELEGATE → IMPLEMENT → VERIFY → DOCUMENT → REPORT**. Coordonatorul verifică fiecare diff real și dovezile aferente; reviewul independent este read-only și proporțional cu schimbarea. Agenții primesc sarcini mici, contracte și context strict relevant. Alocă fișiere fără suprapunere; dacă două sarcini necesită același fișier, serializează-le și atribuie un singur editor. Actualizează numai documentele curente relevante după verificarea faptelor și raportează verificările trecute, neexecutate și incertitudinile. Documentarea sau handoff-ul nu creează aprobare implicită.

## Istoric păstrat

Autorizările Git și Task 2 păstrate în istoric nu sunt active prin simpla lor prezență. Verifică întotdeauna cererea curentă și planul activ. Textul original Git este păstrat integral în [proces, secțiunea de istoric](docs/process.md#autorizare-git-istorica-din-agentsmd).
