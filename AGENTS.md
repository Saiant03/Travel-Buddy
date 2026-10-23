# Travel Buddy — instrucțiuni de proiect

## La începutul lucrului
1. Citește `docs/memory.md`, `docs/product.md` și `docs/plan.md`.
2. Pentru implementare sau review, citește `docs/process.md` și deciziile relevante din `docs/decisions.md`.
3. Păstrează documentele la zi cu fapte verificate; memoria nu se încarcă singură și nu înlocuiește codul.

## Mandat
Site local personal pentru utilizator și prietena lui. Comunicăm în română.
Utilizatorul nu are cunoștințe IT. Explică în termeni simpli acțiunea, motivul și alegerea necesară, cu exemple concrete. Evită jargonul și tonul infantil. Skill-urile de comprimare a mesajelor pot fi folosite între agenți, dar nu reduc claritatea explicațiilor pentru utilizator.
Etapa curentă este implementarea autorizată, începând cu Tasks 0, 1 și 1b din planul salvat. Explorarea vizuală este încheiată. Gate B1 trebuie demonstrat înaintea implementării extinse. La 2026-10-23 utilizatorul a autorizat și activarea serviciilor gratuite și publicarea în scopul proiectului; nu cere din nou acest acord. Fără card, billing sau upgrade automat. Oprește-te înaintea oricărui pas cu plată ori care poate activa facturarea și explică utilizatorului. Conectarea conturilor și accesul tehnic se verifică separat de autorizare.
Nu presupune stack, funcționalități, stil sau sensul cuvântului „local”.

## Ierarhie autorizată de utilizator
Agentul principal planifică, stabilește contractele, deleagă, integrează și verifică rezultatul final.
Folosește agenți mai mici pentru sarcini clare de implementare și corectare; delegarea este autorizată pentru acest proiect.
Folosește `gpt-6-luna` pentru lucrări delimitate și modelul principal pentru decizii și review final.
Pentru review independent dificil folosește `gpt-6.1-sol`, dacă este disponibil.
Folosește atâția subagenți câte lucrări independente justifică, în limita capacității sesiunii (în această sesiune: șase subagenți plus coordonatorul), inclusiv în valuri. Instrucțiunea utilizatorului din 2026-10-23 înlocuiește limita istorică de trei. Fiecare are fișiere proprii; serializăm modificările comune.
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
