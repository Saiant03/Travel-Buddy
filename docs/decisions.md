# Decizii

## D001 — Context în fișiere locale (2026-10-22)
`AGENTS.md` este punctul de intrare, iar `docs/` păstrează memoria, brief-ul, procesul și planul. Sunt convenții locale: agenții trebuie să citească și să actualizeze documentele pentru continuitate.

## D002 — Delegare cu responsabilitate centrală (2026-10-22)
Conform cererii utilizatorului, coordonatorul planifică și verifică; agenții mai mici implementează și repară. Sarcinile comune se execută secvențial pentru a evita suprascrierile.

## D003 — Skill-uri de proiect, cu surse fixate (2026-10-22)
Impeccable și Taste sunt instalate în `.agents/skills/` la commituri fixe. Două skill-uri proprii acoperă regulile tehnice și reviewul. Actualizările externe sunt deliberate, urmate de inspecție; nu se suprascriu automat versiunile.
Taste conduce explorarea vizuală; Impeccable susține auditul și finisarea. Cerințele utilizatorului și accesibilitatea au prioritate.

## Încă nedecis
Cerințele funcționale, accesul online de oriunde, două conturi și consultarea planului offline sunt confirmate în product.md. Rămân deschise stackul, mecanismele de stocare/autentificare, designul concret, harta offline și compromisurile din feasibility.md. Nicio tehnologie de aplicație nu a fost aleasă prin evaluare.

## D004 — Extinderea skill-urilor solicitată de utilizator (2026-10-22)
Adăugăm sursele oficiale Anthropic Frontend Design, UI/UX Pro Max, Vercel Web Design Guidelines și cele opt module GSAP, cu resursele lor și commituri fixe. Impeccable rămâne instalarea existentă.
Adaptăm numai căile din manifestul UI/UX Pro Max pentru acest proiect Codex și păstrăm manifestul original. Biblioteca GSAP și stackul aplicației rămân alegeri pentru implementare.

## D005 — Skill-uri pentru întregul proces și comunicare accesibilă (2026-10-22)
La cererea utilizatorului adăugăm nouă skill-uri pentru interviu, cerințe, planificare, arhitectură, teste, browser, review, lucru izolat și comunicarea agenților. Sursele și adaptările sunt în `docs/skills.md` și `skills-lock.json`.
Utilizatorul nu are experiență IT: deciziile și rezultatele se explică simplu în română, cu exemple. Caveman este limitat la mesaje tehnice între agenți. Documentele rămân locale și nu se publică automat pe GitHub. Alegerea modului de delegare existent este păstrată.
Folosim versiunea istorică autonomă a celor trei skill-uri Matt Pocock pentru a păstra comenzile cerute fără dependențe noi; restul surselor au fost fixate la commiturile verificate. Adaptările păstrează manifestele originale pentru comparație.


## D006 — Brief consolidat și evaluare fără implementare (2026-10-22)
La cererea utilizatorului, definirea inițială este considerată încheiată; product.md rămâne sursa cerințelor și include criterii observabile. feasibility.md documentează opțiunile gratuite și limitele lor. Cercetarea nu autorizează implementarea, activarea serviciilor cu plată sau reducerea cerințelor. Opțiunile tehnice și compromisurile sunt propuneri, nu decizii aprobate. Delegarea către gpt-6-luna și verificarea finală de către coordonator au fost păstrate.
