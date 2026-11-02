# Decizii

## Stare curentă — 2026-11-02

Integrarea selectivă în `main` este confirmată la `aace865e28cc88d012d6b585aaad9e6044c1b701` (părinți `1fb41d7, b295642`), prin push fără force; produsul complet nu este implementat. Alpha/Beta au trecut 10/10 acces și 14/14 CAS/idempotency. CPU a fost trimis, dar măsurătorile necesare verdictului P-09 lipsesc. P12-A manual pe iPhone 14 Pro Max a trecut pentru fixture-ul sintetic conform dovezii; Android nu este confirmat și nu este condiție de integrare. Această stare nu schimbă criteriile de acceptare ale produsului. Preflight-ul curent a citit Cloudflare Worker/D1 metadata și Firebase OAuth/Auth cu HTTP 200, fără mutații; D1 a afișat șase tabele, fără validare de schemă/conținut. Testul BR01 a reprodus „Neautentificat” înainte de fix și a trecut după fix; suitele E2E au trecut 8/8, iar cele trei builds pornite de Playwright `webServer` au trecut. Au rămas numai avertismente non-blocking Rollup Zod `@PURE` și `NO_COLOR`. Reviewul final și verificările de integrare s-au încheiat. Nu s-a executat deploy și push-ul GitHub nu este dovadă de deploy. Detaliile și limitele sunt în [memory.md](memory.md) și [verification.md](verification.md). Diagnosticele vechi de blocare a rețelei sunt istorice.

## D010 — Recuperarea probelor existente și continuitate în GitHub (2026-11-01)

La 2026-11-01, după conectarea instrumentelor administrative Cloudflare și Firebase și o verificare numai de citire, utilizatorul a autorizat corectarea listei celor două conturi acceptate de proba server, pregătirea datelor sintetice în D1 dedicată și reluarea verificărilor. Autorizarea a inclus aplicarea configurației necesare probei și salvarea documentației în GitHub. Nu a inclus produsul complet, alte servicii sau facturare.

Conectarea administrativă nu înlocuiește autentificarea celor două conturi ale aplicației. Confirmarea reală a emailurilor rămâne la proprietarii inboxurilor; nu ocolim controlul prin schimbarea manuală a `emailVerified`. Documentăm dovezile și limitele în [jurnalul operațional](operations/2026-11-01-probe-recovery.md); nu păstrăm acreditări sau identificatori personali în Git. Starea verificată recent primează asupra notelor istorice din octombrie.

## D001 — Context în fișiere locale (2026-10-22)
`AGENTS.md` este punctul de intrare, iar `docs/` păstrează memoria, brief-ul, procesul și planul. Sunt convenții locale: agenții trebuie să citească și să actualizeze documentele pentru continuitate.

## D002 — Delegare cu responsabilitate centrală (2026-10-22)
Conform cererii utilizatorului, coordonatorul planifică și verifică; agenții mai mici implementează și repară. Sarcinile comune se execută secvențial pentru a evita suprascrierile.

## D003 — Skill-uri de proiect, cu surse fixate (2026-10-22)
Impeccable și Taste sunt instalate în `.agents/skills/` la commituri fixe. Două skill-uri proprii acoperă regulile tehnice și reviewul. Actualizările externe sunt deliberate, urmate de inspecție; nu se suprascriu automat versiunile.
Taste conduce explorarea vizuală; Impeccable susține auditul și finisarea. Cerințele utilizatorului și accesibilitatea au prioritate.

## Statut al alegerilor la 2026-10-23 (istoric)
Implementarea este autorizată prin cererea curentă, începând cu Tasks 0, 1 și 1b. Direcția vizuală și compromisurile aprobate se păstrează. Arhitectura cloud din [architecture.md](architecture.md) rămâne condiționată de Gate B1. Activarea serviciilor și publicarea cer acord separat. Fotografiile exacte Lisabona rămân de recuperat.

## D004 — Extinderea skill-urilor solicitată de utilizator (2026-10-22)
Adăugăm sursele oficiale Anthropic Frontend Design, UI/UX Pro Max, Vercel Web Design Guidelines și cele opt module GSAP, cu resursele lor și commituri fixe. Impeccable rămâne instalarea existentă.
Adaptăm numai căile din manifestul UI/UX Pro Max pentru acest proiect Codex și păstrăm manifestul original. Biblioteca GSAP și stackul aplicației rămân alegeri pentru implementare.

## D005 — Skill-uri pentru întregul proces și comunicare accesibilă (2026-10-22)
La cererea utilizatorului adăugăm nouă skill-uri pentru interviu, cerințe, planificare, arhitectură, teste, browser, review, lucru izolat și comunicarea agenților. Sursele și adaptările sunt în `docs/skills.md` și `skills-lock.json`.
Utilizatorul nu are experiență IT: deciziile și rezultatele se explică simplu în română, cu exemple. Caveman este limitat la mesaje tehnice între agenți. Documentele rămân locale și nu se publică automat pe GitHub. Alegerea modului de delegare existent este păstrată.
Folosim versiunea istorică autonomă a celor trei skill-uri Matt Pocock pentru a păstra comenzile cerute fără dependențe noi; restul surselor au fost fixate la commiturile verificate. Adaptările păstrează manifestele originale pentru comparație.


## D006 — Brief consolidat și evaluare fără implementare (2026-10-22)
La cererea utilizatorului, definirea inițială este considerată încheiată; product.md rămâne sursa cerințelor și include criterii observabile. feasibility.md documentează opțiunile gratuite și limitele lor. Cercetarea nu autorizează implementarea, activarea serviciilor cu plată sau reducerea cerințelor. Opțiunile tehnice și compromisurile sunt propuneri, nu decizii aprobate. Delegarea către gpt-6-luna și verificarea finală de către coordonator au fost păstrate.


## D007 — Pregătirea execuției după încheierea explorării (2026-10-23)
Cererea actuală autorizează reguli vizuale/componente/inventar imagini, recomandare tehnică justificată, plan pe etape și planul probelor timpurii. Se reutilizează modelele aprobate; nu se mai produc serii de machete fără problemă concretă. Nu se redeschid brief-ul și compromisurile. Fără implementare, activarea serviciilor sau publicarea site-ului în această etapă.

## D008 — Delegare potrivit capacității și cu fișiere distincte (2026-10-23)
Instrucțiunea utilizatorului înlocuiește limita istorică de trei subagenți. Folosim gpt-6-luna pentru lucrări delimitate și corectări, gpt-6.1-sol pentru review independent dificil; coordonatorul răspunde de integrare și verificarea finală. Patru documente independente justifică patru autori în acest val; reviewul urmează existenței livrabilelor. Contractele și remedierea/reverificarea rămân obligatorii.

## D009 — Recomandare tehnică de pregătire, fără servicii activate (2026-10-23)
Coordonatorul recomandă React/TypeScript/Vite PWA, Cloudflare Pages/Worker/D1 și Firebase Auth Spark pentru identitate gestionată, cu exact două UID-uri autorizate. Tavily, Groq și Geoapify sunt furnizori propuși în cote gratuite. Costul zero se protejează prin planuri fără plată activată, limite interne și oprire la epuizare; nu prin presupunerea că o alertă de consum oprește facturarea. Arhitectura descrie accesul privat, versiunile/confirmarea atomică și copia offline manuală. Benchmarkul, concurența reală și telefoanele condiționează continuarea; o recomandare nu este dovadă de funcționare sau alegere aprobată de utilizator.

## D010 — Începerea implementării și contracte v1 (2026-10-23)
Cererea actuală autorizează execuția planului, începând cu fundația, schema și probele timpurii. Coordonatorul a verificat GitHub `main` la `11e72f96bc93c84ecf0e8c85f26d3fb0c965361e` și a adus copia locală la acea versiune prin fast-forward, fără suprascrieri. Lucrul este separat pe branch `codex/implementation-foundation`. React 19/TypeScript strict/Vite și Zod sunt alese pentru fundația locală; [contracts-v1.md](contracts-v1.md) completează contractele din plan. Testele locale nu pot închide Gate B1 fără D1/Worker real și telefoane. Niciun serviciu nu este activat prin această decizie.

## D011 — Probe locale trecute, extindere oprită la Gate B1 (2026-10-23)
Tasks 0–1 și partea locală Task 1b sunt integrate după review, corectări delegate și reverificare: 75 teste, 2 E2E desktop, tipuri/lint/build și Worker dry-run. CAS include o aserțiune în batch care anulează o modificare fără receipt; aserțiunea se aplică numai dacă nonce-ul/versiunea arată că acel UPDATE a reușit, pentru a păstra 409 la conflicte normale. Datele CPU sintetice și testele SQLite/Chromium nu aprobă arhitectura cloud. Gate B1 rămâne BLOCAT până la probele reale autorizate separat. Nu sunt implementate Tasks 2+ și nu s-au activat servicii, publicat site-ul sau recuperat/inventat fotografiile Lisabona.

## D012 — Acord general pentru pașii fără plată (2026-10-23)
Utilizatorul autorizează continuarea, inclusiv activarea serviciilor gratuite și publicarea, cât timp nu presupune plată. Acordul separat cerut anterior este acordat. Nu se activează card, billing sau upgrade automat; orice plată/condiție care poate produce taxare necesită oprire și informare înainte de acțiune. Accesul la conturi și rețeaua mediului rămân prerechizite tehnice, nu se deduc din acord. Gate B1 nu se închide fără rezultate reale. Alegerea unui serviciu cu plafon gratuit nu justifică înrolarea într-un plan care poate factura automat depășirile.
