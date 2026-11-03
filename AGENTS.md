# Travel Buddy — instrucțiuni de proiect

## La începutul lucrului
1. Citește `docs/memory.md`, `docs/product.md`, `docs/plan.md` și `docs/skills.md`; identifică și aplică skill-urile Vercel relevante fără să aștepți o nouă cerere explicită pentru ele.
2. Pentru implementare sau review, citește `docs/process.md` și deciziile relevante din `docs/decisions.md`.
3. Păstrează documentele la zi cu fapte verificate; memoria nu se încarcă singură și nu înlocuiește codul.
4. Înaintea unei sarcini administrative, verifică discret accesul disponibil în sesiunea curentă. Variabilele persistente apar în sesiunile care folosesc mediul Travel-Buddy; un chat vechi poate să nu le încarce. Nu reface setup-ul automat, nu afișa și nu copia secrete și nu presupune că profilul CLI `cf` este autentificat (profilul `default` a fost găsit neconectat). Separă rapoartele din alte sesiuni de preflight-ul efectuat direct în sesiunea curentă. Ultimul preflight read-only a confirmat Cloudflare Worker/D1 metadata și Firebase OAuth/Auth cu HTTP 200; D1 a afișat șase tabele fără validarea schemei/conținutului. Nu afișa secrete și nu reface setup-ul dacă preflight-ul actual a reușit.

## Mandat
Site local personal pentru utilizator și prietena lui. Comunicăm în română.
Utilizatorul nu are cunoștințe IT. Explică în termeni simpli acțiunea, motivul și alegerea necesară, cu exemple concrete. Evită jargonul și tonul infantil. Skill-urile de comprimare a mesajelor pot fi folosite între agenți, dar nu reduc claritatea explicațiilor pentru utilizator.
Fundația de probe este integrată în `main` la `aace865e28cc88d012d6b585aaad9e6044c1b701` (SHA istoric; chatul nou trebuie să folosească `main` sincronizat actual și să nu facă checkout/reset la acel SHA). Reviewul/testele de integrare au trecut, dar produsul complet rămâne neimplementat. Nu deduce deploy Cloudflare din push-ul GitHub; nu am lansat nicio comandă sau acțiune de deploy. Starea reală a probelor, a măsurătorilor și a telefonului este în `docs/memory.md` și `docs/verification.md`. Rezolvarea documentației pentru integrare nu autorizează implementarea produsului, facturarea sau activarea altor furnizori. Machetele existente rămân referințe istorice aprobate; feedbackul din 2026-11-03 constată că fidelitatea vizuală a demo-ului itinerarului nu este validată, iar direcția vizuală implementată nu este stabilită sau acceptată. Nu trata explorarea anterioară drept acceptare a implementării.
Utilizatorul a autorizat operațiunile GitHub/Firebase/Cloudflare necesare cererilor explicite, fără confirmări repetitive. După review și verificările cerute, commit/push pe `main` sunt acoperite de această autorizare; nu cere acord repetat. Nu deduce din aceasta deploy/publicare a produsului, PR automat, costuri sau activarea unor furnizori. Cere confirmare dacă accesul a expirat, depinde de acțiunea proprietarului, apar costuri/ștergere importantă ori acțiunea depășește mandatul.
Task 2 — fundația UI locală — este autorizat conform `docs/plans/2026-11-02-next-chat-handoff.md`; după citirea documentelor și contractul scurt, începe implementarea fără a cere aceeași aprobare. Asta nu autorizează produsul live complet, backend real, costuri, deploy sau publicare. Nu presupune alte sensuri ale cuvântului „local” dincolo de delimitarea handoff-ului.

## Ierarhie autorizată de utilizator
Agentul principal planifică, stabilește contractele, deleagă, face reviewul și verificările, coordonează corectările și integrează rezultatul final; nu implementează.
Implementarea revine agenților delegați. Coordonatorul poate delega sarcini ușoare și independente mai multor agenți când acest lucru este justificat, alegând între modelele disponibile potrivit sarcinii și consumului. `gpt-6-luna` este opțiunea implicită pentru lucrări simple; `gpt-6-sol` și `gpt-6.1-terra` sunt de asemenea permise pentru sarcini potrivite. Nu presupune că Sol sau Terra au cost inferior garantat. Evită paralelismul risipitor; împarte lucrul pe fișiere distincte și serializează modificările comune. Coordonatorul poate prelua implementarea numai dacă agentul confirmă că sarcina îi depășește capacitatea și utilizatorul confirmă intervenția. Cere acordul utilizatorului înainte de escaladarea la modele, cost sau complexitate peste acest mandat.
Nu schimba automat modelul principal. Dacă un model cerut nu este disponibil, raportează și folosește o alternativă disponibilă explicit identificată.

## Skill-uri
Inventarul și sursele sunt în `docs/skills.md`.
- Direcție vizuală: `.agents/skills/design-taste-frontend/SKILL.md`.
- Audit și finisare UI: `.agents/skills/impeccable/SKILL.md`.
- Bază frontend Anthropic: `.agents/skills/frontend-design/SKILL.md`.
- Cercetare de stil, palete și UX: `.agents/skills/ui-ux-pro-max/SKILL.md` (include căutare locală).
- Audit de cod UI după regulile Vercel: `.agents/skills/web-design-guidelines/SKILL.md` (încarcă regulile actuale la review).
- Animații GSAP: skill-urile `gsap-*`; alege modulele pentru core, timeline, scroll, pluginuri, utilitare, performanță și frameworkul folosit.
- Structură și implementare: `.agents/skills/travel-buddy-engineering/SKILL.md`.
- Verificare înainte de predare: `.agents/skills/travel-buddy-review/SKILL.md`.
- Clarificarea ideii, o întrebare pe rând: `.agents/skills/grill-me/SKILL.md`.
- Cerințe de produs în documentul local existent: `.agents/skills/write-a-prd/SKILL.md`.
- Planuri detaliate pentru agenți: `.agents/skills/writing-plans/SKILL.md`.
- Îmbunătățirea organizării codului existent: `.agents/skills/improve-codebase-architecture/SKILL.md`.
- Teste înainte de implementarea comportamentelor: `.agents/skills/test-driven-development/SKILL.md`.
- Verificare în browser: `.agents/skills/webapp-testing/SKILL.md`.
- Review tehnic: `.agents/skills/code-review-and-quality/SKILL.md`.
- Izolare când lucrarea o cere: `.agents/skills/using-git-worktrees/SKILL.md`.
- Mesaje tehnice scurte între agenți: `.agents/skills/caveman/SKILL.md`; nu activa vocea Caveman pentru utilizator.
Încarcă doar skill-urile necesare sarcinii. Brief-ul utilizatorului primează asupra preferințelor estetice din skill-uri.
Anthropic și Taste oferă repere pentru aceeași direcție vizuală; UI/UX Pro Max furnizează opțiuni, nu aprobă automat un stil. Impeccable și Vercel au rol de verificare complementară. Instalarea skill-urilor GSAP nu instalează biblioteca și nu obligă folosirea ei în fiecare interacțiune.
Notele „Travel Buddy integration” din skill-urile adaptate stabilesc utilizarea lor în acest proiect. Originalele `SKILL.upstream.md` sunt copii de referință, nu puncte de intrare. Documentele și propunerile se salvează local; nu publicăm automat issues sau PR-uri. Folosește instrumentele disponibile în sesiune, nu nume de unelte preluate literal din alt produs.

## Aplicarea skill-urilor Vercel
Skill-urile din `.agents/skills/` se aleg după relevanță, nu se încarcă toate automat. La React implementare/refactor/review aplică `vercel-react-best-practices`; la proiectarea API-urilor de componente aplică `vercel-composition-patterns`; la UI aplică `web-design-guidelines`, inclusiv regulile live la review; la documentație aplică `writing-guidelines`, inclusiv regulile live la review, adaptate pentru română clară. Skill-urile native, view transitions și serviciile Vercel se folosesc numai pentru sarcini relevante și autorizate. Contractele delegate și de review numesc explicit skill-urile aplicabile. Cerințele utilizatorului și procesul proiectului au prioritate; skill-urile nu presupun Next.js/RSC/React Native/Vercel și nu autorizează upload sau deploy.

## Predare
Coordonator → plan și criterii → implementare delegată → review → corectare delegată → reverificare → verificare integrată a coordonatorului → utilizator.
Nu declara un rezultat verificat fără dovezi. Raportează separat verificările trecute, cele neexecutate și problemele rămase.
Actualizarea memoriei și predarea nu presupun aprobare implicită din partea utilizatorului.
