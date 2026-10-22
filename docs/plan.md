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
Utilizatorul a cerut categorii mai complexe și selecția exactă a alimentelor și preparatelor consumate. Cerința și cele patru răspunsuri alimentare („Îmi place mult”, „Mănânc”, „Aș încerca”, „Nu mănânc”) sunt aprobate; inventarul alimentar rămâne propunere în `docs/product.md`. Regula alimentelor necompletate este aprobată: preferință necunoscută, prioritate preparatelor acceptate, respectarea refuzurilor și clarificări doar dacă informația este esențială alegerii unui restaurant. Profilul se poate completa treptat. Sunt aprobate precizările opționale pe aliment (opțiuni rapide și text propriu), toleranța la picant și preferințele de preparare. Buddy le respectă când există date și marchează ce trebuie verificat când informațiile lipsesc. Regulile pentru alergii/intoleranțe sunt aprobate în `docs/product.md`: preparate incompatibile cunoscute excluse; localuri cu informații incomplete vizibile separat cu „Necesită confirmare cu localul”, inclusiv pentru contaminare încrucișată; fără garanții de siguranță din meniul online. Structura detaliată „Atracții și cultură” este aprobată. Structura „Activități și natură” și filtrele despre efort, apă, înălțimi, experiență, format și limite sunt aprobate. Structura „Relaxare” este aprobată împreună cu precizările despre atmosferă, cadru, confort, acces și pauze. Structura „Shopping” este aprobată împreună cu precizările opționale. Fluxul de identificare a locurilor prin nume/link și tratarea ambiguităților este aprobat în `docs/product.md`. Sunt aprobate progresul real vizibil al generării, păstrarea separată a rezultatelor incomplete și reîncercarea manuală după întreruperi. Utilizatorul cere feedback vizibil pe parcursul așteptării, pentru a evita confuzia. Direcția de machetă pentru generare este aprobată în `docs/product.md`: Buddy animat discret, etape active/încheiate și mesaje concrete despre progres real. Prima machetă statică pentru telefon a ecranului de generare nu a fost acceptată; au fost create cinci alternative mai jucăușe și urmează alegerea/refinarea lor, celelalte machete și evaluarea tehnologiilor; fără implementare sau activarea serviciilor. Randările și desenul final al mascotei nu sunt aprobate implicit. Inventarul alimentar exact rămâne de rafinat înaintea implementării formularului. Nu tratăm exemplele ca profiluri personale sau alegeri aprobate.


## Prima machetă pentru telefon — 2026-10-22
A fost generată o machetă statică a ecranului de generare: [previzualizare și note](mockups.md), imagine în `docs/mockups/generation-mobile-v1.png`.
Baza vizuală și comportamentul sunt aprobate; prima randare și desenul propus al lui Buddy nu au fost acceptate de utilizator. Cele cinci alternative mai jucăușe sunt documentate mai jos. Lisabona / 5 zile este un exemplu de ecran, nu o vacanță declarată. Nu există site sau animație implementată. Tipografia exactă, dimensiunile responsive, contrastul și comportamentul din browser se verifică la implementare.

## Iterații vizuale mai jucăușe — 2026-10-22
Utilizatorul nu a acceptat prima machetă și a cerut cinci iterații mai jucăușe, păstrând baza. Fontul aprobat rămâne **Bricolage Grotesque**. În prima randare, tipografia nu a redat fidel fontul; imaginile generate sunt explorări vizuale, iar fontul exact se verifică ulterior în browser.
Au fost create cinci alternative pentru ecranul de generare, numerotate în [galeria de machete](mockups.md): 1 — Traseu cu opriri; 2 — Pașaport cu ștampile; 3 — Atelierul lui Buddy; 4 — Hartă de buzunar; 5 — Bagaj de vacanță.
Se păstrează paleta verde pădure/alb cald/auriu, Buddy maro-crem cu rucsac verde și etapele clare de progres. Compoziția, stilul ilustrației și reprezentarea progresului sunt explorate separat. Variantele 2 și 3 au fost indicate ca cele mai interesante; toate cele cinci randări și variantele mascotei rămân fără aprobare finală. Originalul este păstrat ca istoric, nu ca design acceptat. Nu există site sau animație implementată.

## Direcție vizuală aprobată — combinația 2 + 3, 2026-10-22
Utilizatorul a indicat inițial variantele 2 („Pașaport cu ștampile”) și 3 („Atelierul lui Buddy”) drept cele mai interesante, apoi a aprobat explicit direcția ilustrată de combinația lor: „arată grozav, exact direcția dorită”. Macheta combinată devine referința vizuală aprobată pentru ecranul de generare și pentru dezvoltarea următoarelor machete.
A fost creată o propunere combinată: bilete și ștampile din varianta 2, Buddy organizând cartonașele zilelor din varianta 3, iar progresul este prezentat pe o foaie de pașaport cu text drept pentru lizibilitate.
[Imagine și note în galerie](mockups.md), fișier `docs/mockups/generation-mobile-hybrid-02-03.png`. Fontul stabilit rămâne Bricolage Grotesque; imaginile generate nu verifică redarea exactă a fontului. Direcția vizuală a variantei combinate este aprobată: atmosferă de pașaport/bilete/ștampile, Buddy organizând cartonașele zilelor, text drept și progres clar. Se păstrează verde pădure, alb cald, auriu și fontul Bricolage Grotesque. Aprobarea direcției nu confirmă fidelitatea fontului din imagine sau un comportament funcțional în browser. Următoarea machetă propusă este itinerariul unei zile pe telefon, cu comutarea listă/hartă și detaliile la cerere deja aprobate. În ecranele de consultare, funcțiile rămân centrale și Buddy este discret, conform brief-ului. Nu există site sau animație implementată.
