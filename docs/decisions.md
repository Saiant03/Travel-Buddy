# Decizii

## D010 — Recuperarea probelor existente și continuitate în GitHub (2026-11-01)

După conectarea instrumentelor administrative Cloudflare și Firebase și o verificare numai de citire, utilizatorul a autorizat corectarea listei celor două conturi acceptate de proba server, pregătirea datelor sintetice în D1 dedicată și reluarea verificărilor. Autorizarea include aplicarea configurației necesare probei și salvarea documentației în GitHub. Nu include produsul complet, alte servicii sau facturare.

Conectarea administrativă nu înlocuiește autentificarea celor două conturi ale aplicației. Confirmarea reală a emailurilor rămâne la proprietarii inboxurilor; nu ocolim controlul prin schimbarea manuală a `emailVerified`. Documentăm dovezile și limitele în [jurnalul operațional](operations/2026-11-01-probe-recovery.md); nu păstrăm acreditări sau identificatori personali în Git. Starea verificată recent primează asupra notelor istorice din octombrie.

## D001 — Context în fișiere locale (2026-10-22)
`AGENTS.md` este punctul de intrare, iar `docs/` păstrează memoria, brief-ul, procesul și planul. Sunt convenții locale: agenții trebuie să citească și să actualizeze documentele pentru continuitate.

## D002 — Delegare cu responsabilitate centrală (2026-10-22)
Conform cererii utilizatorului, coordonatorul planifică și verifică; agenții mai mici implementează și repară. Sarcinile comune se execută secvențial pentru a evita suprascrierile.

## D003 — Skill-uri de proiect, cu surse fixate (2026-10-22)
Impeccable și Taste sunt instalate în `.agents/skills/` la commituri fixe. Două skill-uri proprii acoperă regulile tehnice și reviewul. Actualizările externe sunt deliberate, urmate de inspecție; nu se suprascriu automat versiunile.
Taste conduce explorarea vizuală; Impeccable susține auditul și finisarea. Cerințele utilizatorului și accesibilitatea au prioritate.

## Statut actual al alegerilor — 2026-10-23
Direcția vizuală și compromisurile sunt aprobate în `product.md` și `mockups.md`. Recomandarea tehnică pentru execuție este în [architecture.md](architecture.md), condiționată de probele timpurii. Nu reprezintă activare, acceptare funcțională sau autorizare de implementare. Fotografiile exacte Lisabona rămân de recuperat; verificările în browser și pe telefoane rămân neexecutate.

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
