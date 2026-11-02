# Travel Buddy — instrucțiuni de proiect

## La începutul lucrului
1. Citește `docs/memory.md`, `docs/product.md` și `docs/plan.md`.
2. Pentru implementare sau review, citește `docs/process.md` și deciziile relevante din `docs/decisions.md`.
3. Păstrează documentele la zi cu fapte verificate; memoria nu se încarcă singură și nu înlocuiește codul.
4. Înaintea unei sarcini administrative, verifică discret accesul disponibil în sesiunea curentă. Variabilele persistente apar în sesiunile care folosesc mediul Travel-Buddy; un chat vechi poate să nu le încarce. Nu reface setup-ul automat, nu afișa și nu copia secrete și nu presupune că profilul CLI `cf` este autentificat (profilul `default` a fost găsit neconectat). Separă rapoartele din alte sesiuni de preflight-ul efectuat direct în sesiunea curentă. Ultimul preflight read-only a confirmat Cloudflare Worker/D1 metadata și Firebase OAuth/Auth cu HTTP 200; D1 a afișat șase tabele fără validarea schemei/conținutului. Nu afișa secrete și nu reface setup-ul dacă preflight-ul actual a reușit.

## Mandat
Site local personal pentru utilizator și prietena lui. Comunicăm în română.
Utilizatorul nu are cunoștințe IT. Explică în termeni simpli acțiunea, motivul și alegerea necesară, cu exemple concrete. Evită jargonul și tonul infantil. Skill-urile de comprimare a mesajelor pot fi folosite între agenți, dar nu reduc claritatea explicațiilor pentru utilizator.
Fundația tehnică din branch-ul `codex/implementation-foundation` este candidat de integrare; produsul complet rămâne neimplementat. Starea reală a probelor, a măsurătorilor și a telefonului este în `docs/memory.md` și `docs/verification.md`. Rezolvarea documentației pentru integrare nu autorizează implementarea produsului, facturarea sau activarea altor furnizori. Explorarea vizuală este încheiată.
Utilizatorul a autorizat și operațiunile necesare cererilor explicite de lucru prin GitHub, Firebase și Cloudflare, fără confirmări repetitive. Cere confirmare numai dacă accesul a expirat sau verificarea depinde de o acțiune a proprietarului, dacă apar costuri, ștergere importantă ori o acțiune care depășește mandatul. Această autorizare nu este permisiune implicită de implementare sau publicare a produsului.
Nu presupune stack, funcționalități, stil sau sensul cuvântului „local”.

## Ierarhie autorizată de utilizator
Agentul principal planifică, stabilește contractele, deleagă, integrează și verifică rezultatul final.
Delegarea este autorizată, cu preferința curentă a utilizatorului: subagenții folosesc numai `gpt-6-luna`; coordonatorul face reviewul final. Nu folosi modele mai costisitoare, inclusiv `gpt-6.1-sol`, fără acordul utilizatorului. Împarte lucrul pe fișiere distincte și serializează modificările comune.
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

## Predare
Coordonator → plan și criterii → implementare delegată → review → corectare delegată → reverificare → verificare integrată a coordonatorului → utilizator.
Nu declara un rezultat verificat fără dovezi. Raportează separat verificările trecute, cele neexecutate și problemele rămase.
Actualizarea memoriei și predarea nu presupun aprobare implicită din partea utilizatorului.
