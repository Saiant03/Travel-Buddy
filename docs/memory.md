# Memorie de proiect

## Stare curentă — conectarea Alpha corectată, 2026-11-02

Pagina de probă avea un defect de apel al funcției native `fetch`, care oprea conectarea înainte să ajungă la Firebase. Corecția este aplicată, verificată în browser și documentată în [predarea incidentului Alpha](operations/2026-11-02-alpha-login-fix.md). Instrumentele de reproducere sunt salvate în `tools/probe-recovery`; sursa TypeScript originală a clientului rămâne de recuperat, nu există un build complet în checkout.

Ambele emailuri sunt acum confirmate. **Următorul pas:** utilizatorul reîncarcă panoul și încearcă Alpha, apoi Beta. Nu este încă demonstrată conectarea cu parolele reale sau rularea probelor pozitive/CAS/CPU. Nu cere parole în chat și nu reface setup-ul administrativ fără un eșec concret. Allowlist-ul și fixture-ul D1 au rămas corecte; nu reseta baza. Contextul de mai jos este istoricul etapei precedente.

## Etapa precedentă — recuperarea probelor, 2026-11-01

Utilizatorul a autorizat corectarea probei server Cloudflare/Firebase, date fictive în D1 dedicată și salvarea rezultatelor în GitHub. Nu este o cerere de implementare a produsului complet. Starea detaliată și pașii de reluare se păstrează în [jurnalul operațional](operations/2026-11-01-probe-recovery.md); această secțiune primează asupra istoricului din octombrie.

Există deja probele [server](https://travel-buddy-server-probe.saiuantonio.workers.dev/) și [offline](https://travel-buddy-offline-probe.saiuantonio.workers.dev/), actualizate la 25 octombrie. Aplicația completă nu este încă implementată în checkout. Conectarea administrativă Cloudflare/Firebase a fost verificată după repornirea mediului; înaintea oricărei lucrări noi se verifică din nou, fără afișarea acreditărilor.

Verificările au trecut pentru disponibilitatea paginii, respingerea accesului fără token/cu token malformat și fixture-ul offline în Chromium desktop. Două blocaje au fost remediate și reverificate: serverul acceptă acum exact cele două conturi Firebase, iar D1 conține fixture-ul sintetic verificat. Codul și fișierele Workerului au rămas identice; s-au schimbat numai cele două valori ale allowlist-ului. Ambele emailuri rămân neconfirmate, deci probele cu sesiuni reale, CAS și CPU sunt încă neexecutate. Nu confunda accesul de administrator cu sesiunile conturilor din aplicație și nu modifica manual `emailVerified`.

**Următorul pas:** proprietarii confirmă adresele și se autentifică în [panoul server](https://travel-buddy-server-probe.saiuantonio.workers.dev/). Alpha este contul Firebase creat primul, Beta al doilea. Dacă nu există mesajul de confirmare, butonul este disponibil după conectarea contului respectiv. Nu solicita parole în chat. Testul de concurență modifică fixture-ul de la versiunea 7; nu reseta automat baza pentru a repeta testul. Detaliile și limitele sunt în jurnal.

Continuitate: folosește CLI-urile `cf` și `firebase` deja instalate și autentificarea lor configurată. Pentru apelurile Node din acest mediu este necesar `NODE_USE_ENV_PROXY=1`. Nu reintroduce coduri de autorizare deja consumate, nu salva parole/tokenuri/UID-uri/emailuri personale în Git și nu cere parole în chat. Următorul pas este în jurnal, nu în secțiunile istorice de mai jos.

## Istoric — pregătirea implementării, 2026-10-23
Cererea actuală încheie explorarea vizuală și autorizează actualizarea documentației în GitHub și subagenții. Nu autorizează implementarea aplicației, activarea serviciilor sau publicarea site-ului. Brief-ul și cele patru compromisuri acceptate nu se rediscută. Istoricul de mai jos conține stări depășite; această predare și secțiunile recente au prioritate.

Livrabilele sunt legate din [plan.md](plan.md): [planul de execuție](plans/2026-10-23-implementation.md), [design-system.md](design-system.md), [architecture.md](architecture.md) și [probele tehnice](plans/2026-10-23-technical-probes.md). Recomandarea este React/TypeScript/Vite PWA + Cloudflare Pages/Worker/D1 + Firebase Auth Spark, cu Tavily/Groq/Geoapify în cote gratuite; nu este o combinație activată sau demonstrată integral. Detaliile de cost și probele sunt în documentele dedicate.

Paleta verde pădure/ivoriu/auriu, Bricolage Grotesque, Buddy leneș maro/crem cu rucsac verde, jurnalul/biletele/pașaportul/ștampilele și imaginile specifice destinațiilor sunt repere aprobate. Carnetele aprobate se reutilizează pentru preferințele rămase. Nu cerem machete suplimentare fără problemă concretă. Prima scenă a creării și mișcările nu au aprobare vizuală separată; se evaluează în browser. Cele două referințe fotografice Lisabona pentru introducere rămân nerecuperate; nu se inventează.

În această sesiune copia locală inițială era veche; cele zece documente au fost recuperate de pe GitHub prin conexiunea disponibilă, deoarece accesul Git prin proxy nu funcționa. PNG-urile nu sunt în copia locală; aprobările au fost citite în galerie, fără a pretinde inspecția imaginilor. Nu se suprascrie arborele remote cu copia locală inițială.

Patru agenți gpt-6-luna au redactat documente independente și au corectat constatările; un gpt-6.1-sol a reverificat riscurile/coerența. IR-01–IR-08 sunt închise documentar, fără defecte blocante rămase în cele patru livrabile. Coordonatorul a verificat integrarea, legăturile și ID-urile; dovezile sunt în verification.md. Limita istorică de trei subagenți este înlocuită de capacitatea sesiunii, cu număr justificat de sarcini și fișiere distincte. Procesul: delegare → review → remediere delegată → reverificare → integrare → verificare finală a coordonatorului.

Următorul pas după predarea documentelor: evaluarea planului de către utilizator și o cerere explicită pentru execuție. Toate probele API, browser și telefon sunt neexecutate. Nu s-au activat servicii.

## Fapte confirmate
- Numele proiectului este **Travel Buddy**.
- Utilizatorul preferă costuri zero. Evaluarea documentară a ofertelor gratuite este în feasibility.md (2026-10-22); fezabilitatea integrată nu este încă testată. Nu sunt autorizate servicii cu plată.
- Direcție vizuală confirmată: caldă, relaxată și aventuroasă; fotografii ale destinațiilor, ilustrații discrete și Buddy ca un companion simpatic. Culorile, fonturile și aspectul exact al mascotei rămân deschise.
- Buddy poate primi mesaje pentru modificarea itinerariului; propune schimbările și le aplică după confirmarea unei singure persoane, respectând preferințele și limitele ambilor.
- Grupurile cu mai mulți participanți, selecții/modificări și participare opțională sunt o idee pentru viitor, explicit în afara focusului actual. Prima versiune rămâne pentru cei doi.
- Platforma suportă română, engleză și franceză. Fiecare cont alege separat limba interfeței și a descrierilor, cu româna selectată inițial; itinerariul comun poate fi consultat în limbi diferite. Comunicarea în proiect continuă în română.
- Prima versiune păstrează vacanțele și itinerariile private pentru cele două conturi; nu include partajare către alte persoane.
- Locurile cu preț sau program neconfirmat pot fi recomandate cu marcaj explicit și link pentru verificare; informațiile lipsă nu sunt inventate.
- Buddy ține cont de zilele de închidere și semnalează rezervările necesare. Utilizatorii decid dacă acceptă activități cu oră fixă; planul general rămâne flexibil.
- Locurile găsite de utilizatori în altă parte pot fi adăugate prin nume sau link; Buddy le integrează în ziua și traseul potrivite. Sursele acceptate și identificarea ambiguă rămân de definit.
- Sunt permise mai multe cazări/localități de bază într-o vacanță, opționale și completabile ulterior. Nu sunt necesare pentru crearea itinerariului; traseele se adaptează bazei corespunzătoare, păstrând locurile alese.
- Orele aproximative de sosire și plecare sunt opționale la crearea vacanței; Buddy adaptează prima și ultima zi, fără să programeze activitățile pe ore.
- Pentru activități, lipsa interesului cu disponibilitate de participare este distinctă de „nu vreau deloc”. Buddy poate alterna prioritățile în primul caz; refuzul explicit al oricăruia exclude activitatea din planul comun.
- Personalizarea confirmată: categorii și subcategorii concrete, cu „îmi place mult”, „aș încerca”, „nu mă interesează” și posibilitatea adăugării preferințelor lipsă. Lista exactă rămâne de definit.
- Pentru gusturi alimentare diferite, Buddy recomandă restaurante cu opțiuni pentru amândoi. Nu exclude localuri doar fiindcă servesc și preparate evitate de unul; evită localurile fără opțiuni potrivite pentru ambii. Regula nu stabilește tratarea alergiilor/intoleranțelor.
- Utilizatorul cere meniuri de personalizare ample și detaliate pentru preferințele fiecăruia. Sunt confirmate câmpuri opționale pentru alergii, intoleranțe și alimente de evitat, distincte de gusturi.
- Exemplu alimentar confirmat: utilizatorul nu mănâncă pește, sushi sau fructe de mare, iar prietena lui mănâncă aceste preparate. Nu clasifica aceste evitări drept alergii.
- Restaurantele și cafenelele apar ca sugestii opționale în apropierea traseului, potrivite gusturilor celor doi; nu sunt opriri obligatorii.
- Pentru fiecare loc recomandat se afișează fotografie, descriere scurtă, preț, link către sursă și motivul potrivirii cu preferințele celor doi. Tratarea datelor indisponibile rămâne de definit.
- După eliminarea sau înlocuirea unei activități, Buddy reordonează automat opririle pentru continuitate, păstrând celelalte locuri alese.
- Pentru prima versiune, nu se afișează distanțe sau durate estimate între opriri și nu se cere trafic live. Utilizatorul consideră acest efort inutil momentan. Transportul selectat și continuitatea traseului rămân cerințe.
- Utilizatorul cere un „roadmap”: hartă cu traseul zilnic desenat între opriri, pentru a vedea continuitatea și eventualele întoarceri inutile. Harta offline nu este încă decisă.
- Itinerariile salvate pe telefon trebuie să fie consultabile fără internet (locuri, ordinea opririlor și informațiile salvate). Recomandările noi necesită internet; hărțile și navigarea offline nu sunt încă stabilite.
- Acces prin conturi separate pentru cei doi, cu vacanțe comune; fiecare își gestionează preferințele, iar amândoi pot vedea și modifica itinerariul comun.
- Preferințele fiecăruia se păstrează între vacanțe și pot fi ajustate pentru fiecare călătorie.
- Mascota confirmată este un leneș (sloth) numit **Buddy**, ilustrat simplu și expresiv, prietenos, cu mici accesorii de călătorie (de exemplu rucsac), într-un stil potrivit pentru adulți. Este și asistent conversațional; desenul concret și amplasarea în interfață nu sunt realizate.
- Preferințele sunt separate pentru fiecare persoană. Itinerariul include activități împreună și alternează prioritățile celor doi, pentru a ține cont de dorințele amândurora; nu propune implicit timp separat.
- Itinerariul este flexibil, fără program impus pe ore: utilizatorul dorește relaxare și libertate în vacanță. Buddy semnalează rezervările și utilizatorii decid acceptarea activităților cu oră fixă; prezentarea concretă rămâne pentru design.
- Încărcarea zilelor trebuie adaptată destinației și perioadei selectate, optimizând timpul pentru a profita cât mai mult de destinație. Nu s-a adoptat un număr fix de 1–2 activități pe zi. Optimizarea trebuie să respecte flexibilitatea și relaxarea deja confirmate.
- Modalitatea de transport se selectează pentru fiecare vacanță (pe jos, transport public, mașină sau combinație).
- Cazarea este opțională; itinerariul se poate crea înainte de rezervarea ei. Când este introdusă, este punctul de plecare și întoarcere al traseelor zilnice. La adăugarea ulterioară, Buddy păstrează locurile și activitățile alese, ajustând ordinea și eventual repartizarea între zile.
- Fără cazare, Buddy pornește din centrul orașului de destinație. Pentru țări sau insule, recomandă o localitate de bază pe care utilizatorii o pot schimba, folosind centrul ei ca punct de plecare implicit.
- Bugetul poate fi necunoscut la planificare și nu trebuie să fie necesar pentru recomandări. Buddy trebuie să recomande atracțiile principale și să afișeze prețurile. Câmpul opțional de buget nu este încă decis.
- Buddy propune direct itinerariul, cu atracții și prețuri; utilizatorii pot elimina sau înlocui activitățile, fără o selecție prealabilă obligatorie.
- Itinerariile trebuie să combine atracțiile principale cu locuri și experiențe mai puțin turistice („hidden gems”), potrivite preferințelor celor doi, în orice destinație.
- Traseele zilnice trebuie să lege coerent locurile și să evite întoarcerile inutile între obiective, ținând cont de transport. Utilizatorul numește această cerință trasee „liniare”, cu continuitate.
- Este o platformă personală pentru utilizator și prietena lui, accesibilă de oriunde, inclusiv în vacanță; nu este limitată la calculatorul de acasă.
- Scop confirmat: itinerarii pe zile după destinație, zilele/perioada vacanței și preferințe (mâncare, activități, shopping, atracții, relaxare etc.), folosind informații online.
- Utilizatorul a propus scraping; sursele și metoda tehnică rămân de evaluat. Direcția vizuală este confirmată mai sus; designul concret și stackul nu sunt stabilite.

## Preferințe și proces
- Utilizatorul nu are cunoștințe IT. Explicăm în română simplă ce facem, de ce și ce alegeri îi cerem; folosim exemple concrete, definim termenii necesari și evităm jargonul. Întrebările și aprobările trebuie să poată fi înțelese fără experiență tehnică.
- Preferința pentru explicații clare către utilizator primează asupra oricărui skill de comprimare a comunicării (inclusiv Caveman).
- Nu presupunem cerințe care nu au fost confirmate; ideile despre călătorii sunt propuneri, nu decizii.
- Procesul urmărit: coordonator puternic → agenți mai mici pentru sarcini delimitate → review → repararea observațiilor → verificare finală umană.
- Utilizatorul a reconfirmat delegarea pe 2026-10-22: modelul puternic coordonează și verifică; sarcinile delimitate de implementare și corectare merg către agenți cu model mai mic. Conform AGENTS.md, folosim gpt-6-luna pentru acestea, maximum trei subagenți simultan, cu responsabilități distincte.
- Înainte de implementare se pregătesc brief-ul, designul și planul MVP.

## Stare
- Extinderea pentru cerințe, planificare, arhitectură, teste, browser, review, worktrees și comunicarea agenților este instalată. Inventarul are 24 de skill-uri; folosirea lor urmează etapa proiectului. Nu s-au pornit un site, browser, proxy sau hooks prin această instalare.
- Prima extindere a adăugat Anthropic Frontend Design, UI/UX Pro Max cu baza de date, Vercel Web Design Guidelines și toate cele opt module oficiale GSAP. Impeccable existent a fost păstrat. Sursele și rolurile sunt în `skills.md`.
- Definirea inițială și consolidarea brief-ului sunt încheiate. Evaluarea documentară a fezabilității este în feasibility.md; compromisurile de produs și alegerile tehnice nu sunt aprobate.
- Site-ul nu se implementează în această etapă. Verificările și limitele setup-ului sunt consemnate în `verification.md`.

## Următorul pas
- Discută numai compromisurile din feasibility.md: cote care pot opri recomandările, fotografii indisponibile, acoperire variabilă a transportului public și plan offline separat de harta completă. Apoi propune designul și soluția tehnică; nu implementa fără cerere. Nu relua interviul inițial.

## Predare actualizată — finalul definirii inițiale, 2026-10-22
- Utilizatorul încheie această conversație și dorește continuarea într-o conversație nouă din același proiect.
- Definirea inițială este încheiată; cerințele confirmate sunt salvate în `product.md`. Nu relua interviul de la început și nu trata întrebările vechi din document ca fiind toate încă fără răspuns.
- Urmează consolidarea cerințelor într-un brief coerent în documentul existent, apoi cercetarea actuală a fezabilității cu costuri zero. Raportează dovezi și limite pentru găzduire, căutare/colectare online, generare, hărți/trasee și consultare offline. Nu promite gratuitate sau fezabilitate neverificată.
- După evaluare, prezintă alegerile și eventualele compromisuri în română simplă. Designul concret și planul de implementare urmează pe baza brief-ului și fezabilității; site-ul nu se implementează încă fără cerere de implementare.
- Mandatul rămâne: coordonatorul principal planifică, deleagă lucrările delimitate către gpt-6-luna și verifică rezultatul final; maximum trei subagenți simultan. Pentru review dificil independent este prevăzut gpt-6.1-sol. Nu crea conversații noi sau publicații externe din proprie inițiativă.

## Predare istorică înainte de definire — 2026-10-22 (depășită de predările ulterioare)
- Utilizatorul dorește să continue etapa de definire a produsului într-o conversație nouă, în același proiect Travel Buddy.
- Pregătirea este încheiată: documente de context, 24 de skill-uri și rolurile agenților sunt salvate. Nu reluăm instalarea sau căutarea de skill-uri.
- Întrebarea despre scop a primit răspuns pe 2026-10-22: planificare personalizată a vacanțelor, cu itinerarii bazate pe informații online și acces de oriunde. Detaliile confirmate sunt în `product.md`.
- La reluare citește `AGENTS.md`, acest fișier, `product.md` și `plan.md`, apoi continuă de la următorul pas curent.
- Discuția continuă în română simplă, o întrebare pe rând, cu exemple și recomandări. Utilizatorul nu are cunoștințe IT.
- La ultima verificare de setup nu existau aplicație, istoric Git inițializat sau Playwright instalat în Pythonul verificat. Stilul, tehnologiile, stocarea și detaliile funcțiilor rămân de decis.


## Ultima predare — brief consolidat și fezabilitate, 2026-10-22
- Cererea de consolidare și cercetare este îndeplinită documentar: product.md reorganizat fără reluarea interviului; feasibility.md conține comparația, surse oficiale și limite. Planul a fost actualizat.
- Coordonatorul a delegat trei cercetări către gpt-6-luna (acces/date, căutare/generare, hărți/offline) și a reverificat concluziile decisive. Niciun agent nu a editat fișiere comune; coordonatorul a integrat documentele.
- Gratuitatea este plauzibilă în cote, nu demonstrată integral: Cloudflare/Firebase, Tavily, Groq/Workers AI, Geoapify sunt candidați; nu există stack ales sau aprobat. Supabase Free poate intra în pauză după o săptămână de inactivitate.
- Tavily: 1.000 credite/lună fără card, oprire la epuizare. Geoapify: 3.000 credite/zi fără card; transport public disponibil, dar datele pot fi aproximative în unele locuri. Nu elimina transportul public din brief.
- Gemini API nu este recomandat pentru configurația personală gratuită: termenii actuali includ restricții de utilizare și cer Paid Services pentru API Clients oferiți utilizatorilor din SEE. Nu deduce eligibilitatea din tabelele de cote gratuite.
- ORS rămâne candidat gratuit conform comunicatului oficial, dar cotele vechi nu au putut fi confirmate în portalul actual. Endpointul vechi este în retragere în favoarea api.heigit.org. Nu reutiliza automat cifrele istorice 2.000/zi, 40/min.
- Offline obligatoriu: consultarea informațiilor salvate. Stocarea browserului poate fi eliminată; proba pe telefoane rămâne necesară. Harta offline nu este aprobată; serverul standard OSM interzice descărcarea anticipată.
- Nu s-au creat conturi/chei, activat servicii, ales definitiv tehnologii sau implementat site-ul. Nu s-au testat API-uri ori telefoane. Nu s-a obținut acceptarea compromisurilor.
- Următorul pas: discutarea compromisurilor concrete din raport, apoi design/soluție/plan. Nu relua scopul, conturile, limbile sau celelalte cerințe confirmate.


## Predare curentă — continuare prin GitHub, 2026-10-22
Această predare completează documentele istorice de mai sus și înlocuiește stările lor depășite. Deciziile au fost recuperate din conversațiile „Travel Buddy — continuare în cloud”, „Propune pagina introductivă” și „Configurează preluarea automată dină”. Nu reprezintă implementare sau probe tehnice.

- Utilizatorul a cerut continuarea prin GitHub, deoarece va fi plecat de la calculatorul principal. Depozitul Saiant03/Travel-Buddy este locul principal pentru documente și modificări. Automatizarea locală de preluare a fost eliminată în conversația locală; nu presupunem sincronizare automată cu calculatorul de acasă.
- Cele patru compromisuri sunt aprobate: recomandările afectate se pot opri la epuizarea cotelor gratuite fără trecere automată la plată; un loc fără fotografie poate fi recomandat ca rezervă după căutarea unei imagini utilizabile, cu lipsa indicată și link de verificare; conexiunile de transport public neconfirmate sunt marcate și au link relevant; planul salvat este consultabil offline, harta necesită internet.
- Pagina introductivă prezintă povestea în șase momente: introducere, preferințele celor doi, destinația transformată în itinerariu, modificări prin conversație și confirmare, plan salvat offline, conectare. Este aprobată compoziția cu demonstrația evolutivă și traseul care leagă secțiunile la derulare. Funcționalitățile sunt centrale; Buddy apare discret.
- Direcția aprobată: verde pădure, alb cald, auriu; Bricolage Grotesque; cele două fotografii Lisabona discutate anterior; ton cald și concret; animații calme care explică transformarea destinației în itinerariu. Referințele exacte ale fotografiilor trebuie recuperate înainte de utilizare, fără a le inventa.
- Buddy: leneș maro/crem cu rucsac verde discret. Nu există desen final, machetă randată sau site.
- Aplicația privată apare după login: „Vacanțele noastre”, creare în trei pași, cinci categorii de preferințe. În faza incipientă, ambii parcurg cele cinci categorii, alegând o preferință în fiecare sau „Nu am preferințe speciale aici”. Alergiile și intoleranțele sunt opționale. Inventarul detaliat rămâne de definit.
- Itinerariul afișează o zi pe rând; listă și hartă alăturate pe calculator, comutare pe telefon. Detaliile apar la cerere, cu revenire la aceeași poziție. Harta vizualizează traseul zilnic și ordinea coerentă a opririlor; fără navigare pe străzi, distanțe sau durate.
- Buddy arată rezumatul înainte de aplicarea modificărilor; o persoană confirmă. Dacă planul comun s-a schimbat între timp, propunerea veche nu suprascrie schimbările celuilalt. Se păstrează planul confirmat și cererea neaplicată, se afișează „Planul a fost modificat între timp”, Buddy adaptează propunerea și arată noul rezumat pentru reconfirmare.
- Salvarea offline este manuală pe fiecare telefon, cu stare și dată. La eșec se păstrează ultima copie completă. Când sunt detectate schimbări online, actualizarea se face prin buton.
- Conținutul copiei offline, inclusiv fotografiile, este aprobat în secțiunea de mai jos. Limba copiei offline este aprobată mai jos. Următorul subiect: inventarul preferințelor, alergiile/intoleranțele, locurile adăugate prin nume/link și ambiguitățile, stările generării, machetele și tehnologiile.
- Cost zero; tehnologii neaprobate. Fără implementarea site-ului, activarea serviciilor sau publicare. Cercetarea fezabilității a fost documentară, fără probe API/telefon. Discutăm în română simplă, o întrebare pe rând, fără reluarea deciziilor aprobate.

## Conținutul copiei offline — aprobat la 2026-10-22
Utilizatorul a aprobat următorul conținut pentru planul salvat manual pe fiecare telefon:
- Toate zilele vacanței, cu locurile în ordinea vizitării.
- Detaliile locurilor: descriere, adresă, preț și program cunoscut, mențiuni despre rezervări și informații neconfirmate.
- Fotografiile disponibile, în dimensiuni potrivite pentru telefon.
- Cazările introduse și sugestiile de restaurante sau cafenele păstrate în plan.
- Linkurile către surse, care pot fi deschise când există internet.

Harta și conversațiile noi cu Buddy necesită internet. Pe fiecare telefon, copia offline se salvează în limba aleasă în cont. Cele două persoane pot avea copii în limbi diferite. Schimbarea limbii salvate necesită internet și actualizarea copiei; nu se salvează implicit toate cele trei limbi. Această variantă a fost aprobată la 2026-10-22. Aceasta este o cerință aprobată, nu o funcționalitate implementată sau testată.

## Preferințe detaliate — cerință confirmată la 2026-10-22
Utilizatorul cere categorii mai complexe, pentru a înțelege concret ce dorește fiecare în vacanță. La mâncare și băuturi trebuie să poată selecta exact alimentele și preparatele consumate; selectarea unei bucătării naționale sau a unei categorii generale nu este suficientă. Aceasta este o cerință despre produs, nu completarea profilurilor personale. Cele patru răspunsuri alimentare sunt aprobate: „Îmi place mult”, „Mănânc”, „Aș încerca”, „Nu mănânc”. Inventarul detaliat rămâne propunere de lucru.

Propunerea detaliată pentru toate cele cinci categorii este în secțiunea corespunzătoare din `docs/product.md`. Cele patru răspunsuri alimentare au fost aprobate de utilizator; nu le cere din nou confirmarea. Inventarul alimentar rămâne propunere; structura „Atracții și cultură” a fost aprobată. Regulă aprobată la 2026-10-22 pentru alimentele necompletate: preferință necunoscută, fără a presupune că alimentul este plăcut sau refuzat. Buddy prioritizează preparatele acceptate și respectă alegerile „Nu mănânc”. Cere clarificări dacă informația lipsă este esențială pentru alegerea unui restaurant. Profilul poate fi completat treptat; nu se cere răspuns pentru fiecare aliment de la început. Precizări despre preparare aprobate la 2026-10-22: fiecare aliment poate avea opțional opțiuni rapide și o precizare proprie despre cum este acceptat (de exemplu ceapă gătită, dar nu crudă; roșii în sos, dar nu în salată; carne doar bine făcută). Separat se pot indica toleranța la picant și preferințele pentru prăjit, grătar, cuptor sau fiert. Buddy respectă precizările când informațiile despre preparat sunt disponibile; când lipsesc, indică ce trebuie verificat. Exemplele sunt opțiuni ale produsului, nu preferințe personale declarate. Regulile pentru alergii/intoleranțe au fost aprobate: secțiune separată opțională, excluderea preparatelor cunoscute că includ ingredientul de evitat, localuri cu date incomplete vizibile separat cu „Necesită confirmare cu localul”, inclusiv contaminare încrucișată; fără declararea siguranței doar pe baza meniului online. Nu există declarații noi de alergii personale. Structura „Atracții și cultură” este aprobată: istorie/patrimoniu, muzee, artă, arhitectură/oraș, patrimoniu religios, viață locală/tradiții, spectacole, panorame/fotografie, cu selecții individuale. Structura „Activități și natură” și precizările opționale despre efort, apă, înălțimi, experiență, format și limite sunt aprobate. Opțiunile rămân pentru produs, nu preferințe personale completate. Structura „Relaxare” și precizările opționale (atmosferă, confort, cadru, acces și integrarea pauzelor) sunt aprobate. Structura „Shopping” este aprobată, inclusiv selecția produselor și a tipurilor de locuri, intenția, frecvența, preferințele de produse, nivelul de preț opțional și aspectele practice. Fluxul de adăugare prin nume/link este aprobat: identificare cu nume/adresă și fotografie disponibilă, alegere explicită între potriviri ambigue, cerere de date suplimentare dacă linkul/identificarea nu funcționează, apoi propunere de zi/poziție în traseu și rezumat pentru confirmare. Locurile existente se păstrează; limitele deja aprobate se respectă inclusiv la adăugări manuale. Inventarul alimentar exact rămâne de rafinat înaintea implementării formularului. Stările generării și comportamentul la întreruperi sunt aprobate: etape reale vizibile, ultimul plan confirmat păstrat, propunere incompletă recuperabilă separată, motivul cunoscut și reîncercare manuală când este posibil. Utilizatorul a cerut explicit să se înțeleagă că se întâmplă ceva în timpul generării, pentru a evita confuzia. Cerința de feedback vizibil este confirmată. Direcția vizuală pentru generare este acum aprobată: Buddy animat discret, etapă activă, etape încheiate bifate și mesaje despre progres real, conform `docs/product.md`. Prima machetă statică pentru telefon a fost prezentată și nu a fost acceptată. Au fost create cinci alternative mai jucăușe, cu aceeași bază, pentru evaluare. Urmează celelalte machete și evaluarea tehnologiilor. Randarea și desenul final al mascotei necesită evaluarea rezultatului; nu sunt aprobate implicit. Păstrăm cerința fără implementare sau activarea serviciilor. Nu cere utilizatorului să completeze acum profilurile personale ale celor doi.


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
Direcția de bază rămâne cea aprobată: verde pădure/alb cald/auriu, Bricolage Grotesque, Buddy și ilustrații specifice destinației. Utilizatorul a aprobat vizual ultima scenă (pașaportul / rezumatul) și a cerut reformularea titlului scenei a doua. Titlul „Ce luăm în călătorie?” sugera o listă de bagaje; a fost înlocuit în machetă cu „Cum explorăm și unde stăm?”, pentru transport și cazare. Scena a treia este păstrată. La 2026-10-23, utilizatorul a aprobat explicit scena a doua și noul titlu: „Cum explorăm și unde stăm” este mult mai potrivit. Scenele a doua (transport/cazare) și a treia (pașaport/rezumat) sunt aprobate vizual. Prima scenă nu are încă o confirmare explicită separată; aceasta nu împiedică pregătirea următoarelor machete. Mișcările propuse nu sunt încă aprobate sau implementate. Este o imagine statică; fontul real, animațiile, accesibilitatea și interacțiunile se verifică la implementare.

Macheta preferințelor alimentare detaliate a fost creată ca un carnet de gusturi: explorare, alegerea unui răspuns pentru un aliment exact și precizări opționale. Aspectul carnetului de gusturi este aprobat vizual de utilizator. Claritatea și comportamentul interactiv se verifică în site-ul funcțional.

## Machetă preferințe alimentare — carnet de gusturi, 2026-10-23
La cererea de continuare a fost creată macheta statică a preferințelor personale pentru mâncare și băuturi, în tema unui carnet gastronomic de călătorie.
[Imagine și note](mockups.md), fișier `docs/mockups/food-preferences-mobile-tasting-notebook-v1.png`.
Trei vederi succesive sunt propuse:
1. **Explorezi:** căutare directă, file distincte Alimente / Preparate / Băuturi, grupe ilustrate, adăugarea unui aliment lipsă, acces separat la alergii și intoleranțe și opțiunea „Nu am preferințe speciale aici”.
2. **Alegi:** pentru un aliment exact, cele patru răspunsuri aprobate sunt ștampile selectabile: „Îmi place mult”, „Mănânc”, „Aș încerca”, „Nu mănânc”. Un singur răspuns pe element; alimentele necompletate rămân necunoscute.
3. **Precizezi:** precizări opționale despre preparare, cu stări explicite și o notă proprie. Exemplul arată Ceapă / Mănânc, crudă / Nu mănânc, gătită / Mănânc și nota „Doar gătită, inclusiv în sosuri”.
Aceste selecții sunt exemple ale produsului, nu preferințe alimentare sau date de sănătate declarate de utilizatori. Alergiile/intoleranțele nu sunt deduse din gusturi. Interfața privește propriul profil; ajustările pentru o vacanță rămân distincte conform cerinței existente.
Fila Băuturi folosește același model de selecție pe elemente concrete (de exemplu espresso, ceai, limonadă), fără a limita selecția la alcool. Grupele din imagine sunt o parte a inventarului extensibil; lista exactă rămâne de rafinat.
Macheta preferințelor alimentare este aprobată vizual de utilizator: „da, îmi place, e fun”. Aprobarea privește experiența și aspectul; exemplele nu completează profilurile reale, iar inventarul exact rămâne de rafinat. Nu există formular, stocare sau personalizare implementate. Fontul stabilit rămâne Bricolage Grotesque; redarea reală și claritatea se verifică în site-ul funcțional.

## Machetă „Atracții și cultură” — carnet de explorator, 2026-10-23
Utilizatorul a aprobat vizual carnetul de gusturi („da, îmi place, e fun”) și a cerut continuarea. A fost creată macheta următoarei categorii de preferințe, în același limbaj de carnet ilustrat.
[Imagine și note](mockups.md), fișier `docs/mockups/culture-preferences-mobile-explorer-notebook-v1.png`.
Trei vederi sunt propuse:
1. **Explorezi:** cele opt grupe deja aprobate — istorie, muzee, artă, arhitectură, patrimoniu religios, viață locală, spectacole, panorame/fotografie — cu căutare și adăugarea unei preferințe.
2. **Descoperi:** tipuri exacte de muzee, selectabile separat, fără propagarea automată a interesului la toate tipurile.
3. **Alegi:** pentru „Artă modernă”, opțiunile „Îmi place mult”, „Aș încerca”, „Nu mă interesează, dar pot participa” și „Nu vreau deloc”. Exemplul selectează participarea fără interes propriu și permite o precizare opțională.
Interfața explică regula existentă: participarea fără interes propriu poate permite activitatea comună pentru celălalt; refuzul explicit o exclude din planul comun. Se păstrează activitățile împreună și alternarea priorităților.
Selecțiile și nota „Prefer expoziții mai mici” sunt doar exemple, nu preferințe reale declarate. Fiecare își editează propriul profil. Gramatica vizuală preia carnetul de gusturi, cu etichete adecvate activităților, distincte de răspunsurile alimentare.
Macheta culturii a primit feedback vizual pozitiv de la utilizator („super”). Aprecierea privește direcția și aspectul, fără validare funcțională. Nu există formular sau motor de recomandări implementate. Claritatea și comportamentul se verifică în site-ul funcțional; scenariile sunt planificate în `docs/verification.md`, neexecutate.
