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
[Imagine și note în galerie](mockups.md), fișier `docs/mockups/generation-mobile-hybrid-02-03.png`. Fontul stabilit rămâne Bricolage Grotesque; imaginile generate nu verifică redarea exactă a fontului. Direcția vizuală a variantei combinate este aprobată: atmosferă de pașaport/bilete/ștampile, Buddy organizând cartonașele zilelor, text drept și progres clar. Se păstrează verde pădure, alb cald, auriu și fontul Bricolage Grotesque. Aprobarea direcției nu confirmă fidelitatea fontului din imagine sau un comportament funcțional în browser. Macheta itinerariului unei zile pe telefon a fost creată la cererea utilizatorului, cu stările Listă/Hartă și detaliile la cerere. Aspectul a primit feedback pozitiv și utilizatorul a cerut continuarea; macheta detaliilor unei opriri este acum aprobată. În ecranele de consultare, funcțiile rămân centrale și Buddy este discret, conform brief-ului. Nu există site sau animație implementată.

## Machetă itinerariu zilnic pe telefon — 2026-10-22
La cererea utilizatorului a fost creată o machetă statică în direcția vizuală aprobată 2 + 3. Sunt prezentate alăturat două stări alternative ale aceluiași ecran mobil: Listă și Hartă, pentru aceeași zi.
[Imagine și note](mockups.md), fișier `docs/mockups/itinerary-day-mobile-list-map-v1.png`.
- Exemplu: Lisabona, 5 zile, pe jos, Ziua 2 selectată. Nu reprezintă o vacanță declarată de utilizatori.
- Lista arată trei opriri ordonate (Miradouro da Graça, Castelo de São Jorge, Alfama), detalii la cerere și „Preț neconfirmat”.
- Harta arată aceeași ordine, cu legătura Centru → 1 → 2 → 3 → Centru, conform bazei implicite fără cazare. Harta și miniaturile sunt ilustrative, nu date cartografice sau fotografii verificate.
- Cafenelele sunt sugestii opționale separate; există intrări pentru adăugarea unui loc, salvarea planului offline și modificări cu Buddy. Harta rămâne online.
- Buddy este discret; biletele, ștampilele și culorile preiau direcția aprobată. Fontul stabilit rămâne Bricolage Grotesque, cu fidelitatea reală de verificat în browser.
Macheta itinerariului a primit feedback pozitiv privind aspectul, iar utilizatorul a cerut continuarea designului. Cele două stări alăturate sunt pentru comparație; pe telefon se comută între ele. Nu s-a implementat un site, o hartă sau salvarea offline.

## Machetă detalii loc pe telefon — 2026-10-22
Utilizatorul a apreciat aspectul machetei itinerariului („Îmi place cum arată”) și a cerut continuarea după clarificarea accesului de pe telefon. Depozitul GitHub este privat; pentru consultarea lui în browser este necesară autentificarea cu un cont autorizat. Imaginile sunt incluse și direct în mesajele finale.
A fost creată următoarea machetă statică: detaliile unei opriri într-un panou peste itinerariu. [Imagine și note](mockups.md), fișier `docs/mockups/place-detail-mobile-v1.png`.
- Exemplu: Castelo de São Jorge, Ziua 2 / Oprirea 2, Lisabona.
- Panou cu imagine ilustrativă, descriere scurtă și motivul recomandării.
- Preț și program neconfirmate; rezervare de verificat; acces la sursă.
- Controale pentru înlocuire, eliminare și revenire la plan; închiderea păstrează poziția din itinerariu, conform cerinței existente.
Direcția vizuală rămâne cea aprobată (pașaport, bilete, ștampile; verde pădure/alb cald/auriu; Bricolage Grotesque). Macheta detaliilor este aprobată de utilizator: „da, arată bine și este în temă”. Sunt acceptate organizarea panoului, păstrarea contextului itinerariului, informațiile de verificat și acțiunile prezentate. Imaginea și motivul de potrivire sunt exemple de design, nu fotografie verificată sau preferințe personale completate. Nicio interacțiune nu este implementată.

Macheta conversației cu Buddy a fost realizată, cu rezumatul modificărilor, confirmare înainte de aplicare și reconfirmare după schimbarea planului comun. Aspectul machetei este aprobat vizual. La cererea utilizatorului, claritatea fluxului se verifică în etapa de verificare a site-ului funcțional. Se păstrează regulile aprobate: o persoană poate confirma, iar o propunere bazată pe o versiune veche se adaptează și se reconfirmă. Continuăm cu machete statice, fără implementarea site-ului sau activarea serviciilor.

## Machetă conversație Buddy și confirmare — 2026-10-22
La cererea utilizatorului a fost creată macheta statică a conversației cu Buddy, în direcția vizuală aprobată. [Imagine și note](mockups.md), fișier `docs/mockups/buddy-chat-confirmation-mobile-v1.png`.
Două stări ale aceluiași ecran pe telefon sunt prezentate alăturat:
- Propunerea normală: cererea „Scoate castelul și păstrează restul”, rezumat cu eliminarea Castelo de São Jorge, păstrarea Miradouro da Graça și Alfama, ordinea rezultată și „Confirmă și aplică”.
- Plan comun modificat între timp: cererea este păstrată; Sé de Lisboa, adăugată între timp, rămâne în noua propunere. Buddy afișează rezumatul actualizat și „Reconfirmă și aplică”.
În ambele stări planul actual rămâne salvat, iar schimbările așteaptă confirmarea unei singure persoane, conform regulii existente. Există acțiunea „Mai ajustează”, câmpul de mesaj și revenirea la itinerariu.
Macheta este aprobată vizual de utilizator: „arată bine”. Claritatea conversației, a rezumatului și a confirmării nu este încă validată; utilizatorul dorește această evaluare când site-ul este funcțional, în etapa de verificare. Locurile și mesajele sunt exemple, nu modificări reale ale unei vacanțe. Nu există chat sau sincronizare implementate. Fontul rămâne Bricolage Grotesque; redarea exactă și interacțiunile se verifică la implementare. Aspectul este acceptat pentru continuarea designului. Scenariile de verificare sunt consemnate în `docs/verification.md`; rămân neexecutate. În etapa actuală evaluăm machetele vizual, fără a cere un verdict de funcționare pe baza imaginilor statice.

Macheta salvării offline a fost realizată cu trei stări: copie salvată, actualizare disponibilă și actualizare nereușită cu ultima copie completă păstrată. Aspectul machetei offline este aprobat vizual; verificarea clarității și a comportamentului se face ulterior în site-ul funcțional.

## Machetă salvare offline pe telefon — 2026-10-22
A fost creată macheta statică a copiei offline, în direcția vizuală aprobată. [Imagine și note](mockups.md), fișier `docs/mockups/offline-copy-mobile-states-v1.png`.
Trei stări alternative sunt prezentate alăturat:
1. Copie completă salvată pe acest telefon, în limba contului, cu data ultimei salvări și acces la plan.
2. Actualizare disponibilă după schimbarea planului comun; copia existentă rămâne accesibilă, iar actualizarea pornește manual.
3. Actualizare nereușită după întreruperea conexiunii; ultima copie completă și data ei se păstrează. Planul salvat se poate deschide; reîncercarea așteaptă reconectarea.
„Lisabona · 5 zile”, româna și data 22 octombrie 2026 · 18:40 sunt exemple pentru machetă (ora locală Europe/Bucharest), nu o salvare reală.
Harta și mesajele noi către Buddy necesită internet. Salvarea este separată pe fiecare telefon; cardul cu trei rânduri despre conținut este o sinteză vizuală, fără a reduce conținutul offline deja aprobat. Bricolage Grotesque rămâne fontul stabilit.
Macheta offline este aprobată vizual de utilizator: „foarte bine, mai departe”. Verificările funcționale sunt planificate în `docs/verification.md`, neexecutate. Nu există salvare offline implementată.

## Machetă „Vacanțele noastre” — 2026-10-22
Utilizatorul a aprobat vizual macheta offline („foarte bine, mai departe”). Verificările funcționale și de claritate rămân planificate pentru site-ul funcțional, neexecutate.
A fost creată macheta statică a paginii private de după conectare, în direcția vizuală aprobată. [Imagine și note](mockups.md), fișier `docs/mockups/trips-home-mobile-v1.png`.
Două stări ale aceleiași pagini mobile sunt prezentate alăturat:
- Cu vacanțe existente: carduri ilustrative, destinație, număr de zile, transport și acces la itinerariu; acțiunea „Vacanță nouă”.
- Înainte de prima vacanță: mesaj introductiv, Buddy cu un bilet și acțiunea „Planifică prima vacanță”.
În ambele stări se poate accesa „Preferințele mele”. Cardurile Lisabona / 5 zile / pe jos și Madeira / 7 zile / mașină sunt exemple, nu vacanțe declarate sau date salvate ale utilizatorilor. Imaginile sunt ilustrative.
Macheta paginii „Vacanțele noastre”, în ambele stări, este aprobată vizual la 2026-10-23. Nu s-au implementat conectarea, gestionarea vacanțelor sau preferințele. Utilizatorul apreciază explicit imaginile personalizate ale fiecărei destinații. Fluxul de creare în trei pași este reprezentat în macheta de mai jos, încă neaprobată vizual.

## Aprobare „Vacanțele noastre” și imagini specifice destinațiilor — 2026-10-23
Utilizatorul a aprobat vizual cele două stări ale paginii „Vacanțele noastre” și a apreciat explicit faptul că fiecare destinație are o imagine personalizată.
Pe cardurile vacanțelor păstrăm imagini/ilustrații proprii fiecărei destinații, cu repere, peisaje sau atmosferă recognoscibile, în stilul vizual unitar aprobat (jurnal de călătorie, bilete și ștampile, paleta verde pădure/alb cald/auriu). Ilustrațiile Lisabona și Madeira din machetă sunt referințe vizuale acceptate pentru această direcție.
Această alegere privește cardurile destinațiilor; cerințele despre fotografiile locurilor recomandate și referințele exacte ale fotografiilor pentru introducere rămân cele consemnate anterior. Metoda de obținere și păstrare a imaginilor destinațiilor rămâne de ales în limitele costului zero înainte de implementare.
Aspectul paginii este aprobat. Interacțiunile și claritatea se verifică ulterior în site-ul funcțional. Macheta creării unei vacanțe în trei pași a fost realizată; gruparea ecranelor și aspectul sunt propuneri pentru evaluare vizuală.

## Istoric — prima machetă creare vacanță în trei pași, neacceptată (2026-10-23)
La cererea utilizatorului a fost creată macheta statică a fluxului de creare. Cerința celor trei pași este deja aprobată; gruparea concretă de mai jos este propunerea de design din această machetă, încă de evaluat.
[Imagine și note](mockups.md), fișier `docs/mockups/trip-creation-mobile-three-steps-v1.png`.
1. **Destinație și perioadă:** destinație, alegere între perioadă și număr de zile; exemplul folosește 12–16 mai 2027, cinci zile inclusiv.
2. **Transport și cazare:** variante combinabile (pe jos, transport public, mașină); cazare și ore aproximative de sosire/plecare opționale.
3. **Rezumat și preferințe:** datele introduse, starea pregătirii ambelor profiluri, ajustarea preferințelor proprii pentru vacanța respectivă și „Generează itinerariul”.
Exemplul este consecvent în cele trei ecrane: Lisabona, cinci zile, pe jos + transport public, cazare de completat și ore neprecizate. Pregătirea ambelor profiluri este ilustrativă, nu o declarație despre datele reale ale celor doi.
Se păstrează cerințele existente: fiecare parcurge cele cinci categorii (alege o preferință sau „Nu am preferințe speciale aici”), refuzurile ambilor sunt respectate, pot exista mai multe cazări/baze și generarea funcționează fără cazare sau buget. Stările cu preferințe incomplete se vor reprezenta în fluxul preferințelor; condiția de completare nu este eliminată de această machetă.
Ilustrația destinației urmează direcția aprobată; fontul stabilit rămâne Bricolage Grotesque, cu redarea exactă de verificat în browser. Prima machetă nu a fost acceptată vizual: utilizatorul cere o experiență mai distractivă și distinctivă, conform noii propuneri de mai jos. Nu există formular sau generare implementate. Verificările din `docs/verification.md` sunt planificate, neexecutate.

## Crearea vacanței — concept interactiv „Bilet, bagaj, pașaport”, 2026-10-23
Utilizatorul nu a acceptat prima machetă de creare: meniurile i s-au părut prea generice și insuficient de creative. Cere o experiență mai distractivă, distinctivă, dincolo de decorarea unui formular obișnuit. Cerințele funcționale și structura în trei momente se păstrează.
A fost creată o nouă propunere vizuală: [galerie și note](mockups.md), fișier `docs/mockups/trip-creation-mobile-travel-desk-v2.png`.
1. **Biletul destinației:** ilustrație personalizată, oraș editabil pe bilet, perioada reprezentată prin ștampile/date editabile și alternativa „Aleg doar zilele”.
2. **Bagajul călătoriei:** modurile de transport sunt jetoane ilustrate selectabile; cele alese apar în bagaj. Cazarea este o etichetă cu cheie, opțională; orele aproximative sunt etichete opționale separate.
3. **Pașaportul pentru Buddy:** rezumatul și starea preferințelor fiecăruia apar pe paginile unui pașaport. Acțiunea explicită „Buddy, pregătește planul!” pornește generarea, după revizuire.
Interacțiuni propuse, încă neaprobate și neimplementate: atingere pentru editarea datelor/selectarea jetoanelor, intrarea jetoanelor alese în bagaj, completarea pașaportului și tranziția către ecranul de generare. Tragerea obiectelor nu este obligatorie; se păstrează alternativele accesibile și utilizarea fără mișcare.
Toate valorile din imagine sunt exemple: Lisabona, 12–16 mai 2027, cinci zile, pe jos + transport public, cazare și ore necompletate, două profiluri pregătite. Nu sunt date reale sau rezervări. Cazările multiple, preferințele proprii ajustabile pentru vacanță și condiția celor cinci categorii parcurse de ambii se păstrează.
Direcția de bază rămâne cea aprobată: verde pădure/alb cald/auriu, Bricolage Grotesque, Buddy și ilustrații specifice destinației. Utilizatorul a aprobat vizual ultima scenă (pașaportul / rezumatul) și a cerut reformularea titlului scenei a doua. Titlul „Ce luăm în călătorie?” sugera o listă de bagaje; a fost înlocuit în machetă cu „Cum explorăm și unde stăm?”, pentru transport și cazare. Scena a treia este păstrată. Aprobarea privește doar ultima scenă; prima și a doua rămân de evaluat, inclusiv noua formulare. Mișcările propuse nu sunt încă aprobate sau implementate. Este o imagine statică; fontul real, animațiile, accesibilitatea și interacțiunile se verifică la implementare.
