# Plan de lucru — Travel Buddy

## Etapa încheiată: brief și evaluare documentară (2026-10-22)
- Definirea inițială este încheiată. Cerințele au fost consolidate în `product.md`, cu flux, limite și criterii observabile; întrebările vechi deja rezolvate au fost eliminate.
- Evaluarea actuală a accesului online, căutării, generării, hărților/traseelor și consultării offline este în `feasibility.md`, cu surse oficiale, cote, compromisuri și limite de verificare.
- Trei agenți gpt-6-luna au cercetat domenii separate, fără editări comune. Coordonatorul a integrat și verificat rezultatul, inclusiv corectarea limitelor ORS vechi și a eligibilității Gemini.
- Nu s-au implementat site-ul, ales definitiv tehnologii, creat conturi sau activat servicii.

## Următorul pas
Prezintă și clarifică doar compromisurile rezultate din evaluare: oprire temporară a recomandărilor la cote, lipsa unor fotografii, transport public cu precizie variabilă și plan offline separat de harta completă. Nu relua întrebările despre scop, două conturi, limbi sau direcția vizuală.

După această discuție, coordonatorul poate propune o combinație tehnică și fluxuri concrete, fără a cere utilizatorului să aleagă biblioteci. Candidaturile din evaluare nu reprezintă alegeri aprobate.

## Etape viitoare
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
Utilizatorul a cerut categorii mai complexe și selecția exactă a alimentelor și preparatelor consumate. Cerința și cele patru răspunsuri alimentare („Îmi place mult”, „Mănânc”, „Aș încerca”, „Nu mănânc”) sunt aprobate; inventarul alimentar rămâne propunere în `docs/product.md`. Regula alimentelor necompletate este aprobată: preferință necunoscută, prioritate preparatelor acceptate, respectarea refuzurilor și clarificări doar dacă informația este esențială alegerii unui restaurant. Profilul se poate completa treptat. Sunt aprobate precizările opționale pe aliment (opțiuni rapide și text propriu), toleranța la picant și preferințele de preparare. Buddy le respectă când există date și marchează ce trebuie verificat când informațiile lipsesc. Regulile pentru alergii/intoleranțe sunt aprobate în `docs/product.md`: preparate incompatibile cunoscute excluse; localuri cu informații incomplete vizibile separat cu „Necesită confirmare cu localul”, inclusiv pentru contaminare încrucișată; fără garanții de siguranță din meniul online. Structura detaliată „Atracții și cultură” este aprobată. Urmează discutarea propunerii „Activități și natură” și a filtrelor despre efort, apă, înălțimi, experiență, format și limite, apoi relaxarea, shoppingul și rafinarea inventarului. Nu tratăm exemplele ca profiluri personale sau alegeri aprobate.
