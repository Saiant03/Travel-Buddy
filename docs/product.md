# Brief de produs — Travel Buddy

Consolidat la 2026-10-22 din cerințele confirmate. Definirea inițială este încheiată. Acest document este sursa unică pentru cerințele produsului; evaluarea opțiunilor tehnice este în `feasibility.md`. Consolidarea nu reprezintă aprobarea unei tehnologii sau autorizarea implementării.

## Scop și utilizatori
Travel Buddy îi ajută pe utilizator și prietena lui să pregătească vacanțe împreună: propune itinerarii pe zile, potrivite preferințelor amândurora, folosind informații online. Include atracțiile principale și locuri sau experiențe mai puțin turistice („hidden gems”), în destinațiile alese.

Este o platformă personală accesibilă de oriunde, inclusiv în vacanță, nu doar de pe calculatorul de acasă. Cei doi au conturi separate, preferințe proprii și vacanțe comune. Ambii pot vedea și modifica itinerariul. În prima versiune, vacanțele și itinerariile sunt private pentru cele două conturi, fără partajare externă.

Preferința este funcționarea cu costuri zero. Nu este o garanție de gratuitate perpetuă și nu sunt autorizate servicii cu plată. Tehnologiile și serviciile se aleg după evaluare; eventualele compromisuri de produs necesită acordul utilizatorului.

## Experiența principală
1. Fiecare își completează preferințele. Acestea se păstrează între vacanțe și pot fi ajustate pentru o anumită călătorie.
2. Creează o vacanță cu destinație, zile/perioadă și transport: pe jos, transport public, mașină sau combinație. Cazarea și orele aproximative de sosire/plecare sunt opționale. Bugetul nu este obligatoriu.
3. Buddy propune direct itinerariul pe zile, cu atracții și prețuri cunoscute; nu cere selectarea prealabilă a fiecărui obiectiv.
4. Cei doi consultă locurile și harta zilnică, elimină sau înlocuiesc activități și adaugă locuri găsite în altă parte prin nume sau link.
5. Pot cere modificări prin mesaje către Buddy. El propune schimbarea și o aplică după confirmarea unei singure persoane, respectând limitele ambilor.
6. Salvează itinerariul pe telefon pentru consultare fără internet. Recomandările noi necesită internet.

## Preferințe și echilibrul dintre cei doi
- Personalizare amplă, cu categorii și subcategorii concrete pentru mâncare, activități, shopping, atracții, relaxare și alte interese; fiecare poate adăuga preferințe lipsă.
- Opțiuni confirmate: „îmi place mult”, „aș încerca”, „nu mă interesează”. Pentru activități se distinge „nu mă interesează, dar pot participa” de „nu vreau deloc”. Refuzul explicit al oricăruia exclude activitatea din planul comun.
- Activitățile sunt împreună; Buddy alternează prioritățile pentru a ține cont de amândoi, fără a propune implicit timp separat.
- Gusturile alimentare, alimentele de evitat, alergiile și intoleranțele sunt informații separate și opționale. Exemplu confirmat: utilizatorul evită pește, sushi și fructe de mare, prietena lui le consumă; acestea nu au fost declarate alergii.
- Restaurantele trebuie să ofere opțiuni pentru amândoi. Nu se exclude un local doar pentru că servește și preparate evitate de unul. Regula gusturilor nu stabilește cum se verifică siguranța pentru alergii și intoleranțe.

## Reguli pentru itinerarii și trasee
- Plan flexibil, fără program impus pe ore. Încărcarea zilelor se adaptează destinației și perioadei, pentru a profita de călătorie păstrând relaxarea; nu există un număr fix aprobat de activități pe zi.
- Buddy ține cont de zilele de închidere și semnalează rezervările necesare. Utilizatorii decid dacă acceptă activități cu oră fixă. Orele opționale de sosire și plecare ajută la adaptarea primei și ultimei zile.
- Opririle sunt ordonate coerent geografic și în funcție de transport, evitând întoarcerile inutile. „Liniar” înseamnă continuitate, nu linie dreaptă.
- Fiecare zi are o hartă cu traseul desenat între opriri; punctele izolate nu satisfac cerința. Prima versiune nu afișează distanțe sau durate estimate între opriri și nu cere trafic live.
- Cazarea este opțională și poate fi completată ulterior. Dacă există, este punctul de plecare și întoarcere al traseului zilnic. Sunt permise mai multe cazări/localități de bază, folosite în perioadele corespunzătoare.
- Fără cazare, punctul implicit este centrul orașului de destinație. Pentru țări sau insule, Buddy propune o localitate de bază modificabilă, folosind centrul ei.
- Adăugarea cazării păstrează locurile alese; Buddy poate reordona opririle și redistribui activitățile între zile. Eliminarea sau înlocuirea unei activități reordonează restul pentru continuitate, fără a elimina ori înlocui celelalte locuri alese.
- Locurile adăugate manual se integrează în ziua și traseul potrivite. Restaurantele și cafenelele rămân sugestii opționale în apropierea traseului, nu opriri obligatorii.

## Informațiile despre locuri
Pentru fiecare recomandare: fotografie, descriere scurtă, preț, link către sursă și explicația potrivirii cu preferințele celor doi. Informațiile vin din surse online; scrapingul a fost o propunere de metodă, nu o alegere tehnică.

Un loc poate fi recomandat cu „preț/program neconfirmat” și link de verificare. Datele lipsă nu se inventează. Recomandările nu trebuie condiționate de cunoașterea unui buget. Tratamentul fotografiilor sau altor date indisponibile rămâne de stabilit după evaluarea surselor.

## Limbi, consultare offline și aspect
- Română, engleză și franceză; româna este selectată inițial. Fiecare cont își alege separat limba interfeței și a descrierilor. Același itinerariu comun poate fi citit în limbi diferite.
- Fără internet se pot consulta pe telefon locurile, ordinea opririlor și informațiile salvate. Hărțile și navigarea offline nu sunt încă cerințe confirmate. Editarea și sincronizarea offline nu au fost cerute.
- Direcție vizuală caldă, relaxată și aventuroasă, cu fotografii ale destinațiilor și ilustrații discrete.
- Buddy este un leneș (sloth) simplu și expresiv, prietenos, potrivit pentru adulți, cu mici accesorii de călătorie, de exemplu rucsac. Este și asistent conversațional. Culorile, fonturile, desenul și amplasarea mascotei rămân pentru design.

## Criterii observabile de reușită
Aceste criterii transpun cerințele confirmate; nu sunt rezultate deja testate.
1. Două conturi distincte accesează aceeași vacanță, iar o persoană din afara lor nu poate citi itinerariul sau preferințele.
2. Preferințele persistă între vizite și vacanțe; ajustările pentru o călătorie pot fi distincte de profilul obișnuit.
3. O vacanță fără cazare sau buget poate primi un itinerariu pe zile, cu bază implicită și transportul ales luate în calcul.
4. Propunerea combină atracții importante și locuri mai puțin turistice în măsura datelor disponibile; nu prezintă informații inventate ca verificate.
5. O activitate refuzată explicit de oricare dintre cei doi nu intră în planul comun; sugestiile alimentare iau în calcul ambele profiluri.
6. Sunt semnalate datele neconfirmate, închiderile cunoscute și rezervările necesare. O activitate cu oră fixă este acceptată explicit.
7. Harta fiecărei zile arată legătura dintre opriri și permite identificarea întoarcerilor inutile. Nu afișează durate sau distanțe între opriri.
8. Adăugarea cazării, inclusiv schimbarea bazei între zile, și eliminarea/înlocuirea unei activități păstrează celelalte locuri alese.
9. Buddy prezintă modificările cerute prin mesaj înainte de aplicare; confirmarea unui singur participant este suficientă.
10. Cele două conturi pot citi același itinerariu în limbi diferite, fără a crea vacanțe separate.
11. După salvarea pe telefon și oprirea internetului, locurile, ordinea și informațiile salvate rămân consultabile. Recomandările noi sunt indicate ca necesitând conexiune.

## În afara primei versiuni
- Grupuri cu mai mult de două persoane și participare opțională la activități — idee pentru viitor.
- Partajare către alte persoane, trafic live, afișarea distanțelor/duratelor între opriri.
- Nu sunt cerințe confirmate: liste de bagaje, rezervări/plăți în aplicație, program strict pe ore sau timp separat implicit.
- În etapa actuală: fără implementarea site-ului, activarea serviciilor sau publicare externă.

## Decizii rămase după cercetare
Nu reluăm întrebările deja închise despre scop, conturi, limbi, acces de oriunde sau direcția vizuală.
- Compromisurile acceptabile dacă limitele gratuite afectează disponibilitatea, confidențialitatea datelor trimise furnizorilor, căutarea, generarea sau transportul public.
- Sursele și metoda de colectare, inclusiv fotografii utilizabile și informații lipsă; linkurile acceptate și identificarea locurilor ambigue.
- Inventarul categoriilor de preferințe, tratarea alergiilor/intoleranțelor și eventuala introducere a unui buget opțional.
- Prezentarea activităților cu oră fixă, asocierea bazelor cu zilele și detaliile fluxurilor de editare comună.
- Eventuala hartă offline, comportamentul la salvare incompletă și limita informațiilor păstrate pe telefon.
- Tehnologiile, serviciile, stocarea și mecanismul de autentificare, după evaluare; apoi designul concret și planul de implementare.


## Completări aprobate — 2026-10-22
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
Utilizatorul cere categorii mai complexe, pentru a înțelege concret ce dorește fiecare în vacanță. La mâncare și băuturi trebuie să poată selecta exact alimentele și preparatele consumate; selectarea unei bucătării naționale sau a unei categorii generale nu este suficientă. Aceasta este o cerință despre produs, nu completarea profilurilor personale. Cele patru răspunsuri alimentare sunt aprobate: „Îmi place mult”, „Mănânc”, „Aș încerca”, „Nu mănânc”. Inventarul alimentar rămâne propunere de lucru. Structurile detaliate „Atracții și cultură” și „Activități și natură”, inclusiv filtrele opționale ale activităților, sunt aprobate în secțiunile de mai jos. Structura „Relaxare”, inclusiv precizările opționale, este de asemenea aprobată. Structura „Shopping”, inclusiv produsele, tipurile de locuri și precizările opționale, este aprobată.

### Propunere de lucru: mâncare și băuturi
Categorii → subcategorii → elemente individuale, cu căutare și posibilitatea adăugării unui element lipsă. Exemplele descriu opțiuni pentru viitoarea aplicație, nu preferințele utilizatorilor.
- Carne: pui, curcan, rață, porc, vită, miel, iepure; organe separat.
- Pește: somon, ton, păstrăv, cod, sardine, doradă, macrou.
- Fructe de mare: creveți, midii, scoici, stridii, calamari, caracatiță, crab, homar.
- Legume: roșii, castraveți, ardei, vinete, dovlecei, broccoli, conopidă, spanac, ceapă, usturoi, ciuperci.
- Leguminoase și alternative vegetale: fasole, năut, linte, mazăre, tofu, tempeh.
- Ouă și lactate: ouă, lapte, iaurt, smântână, unt; brânzeturi proaspete, maturate, albastre și de capră ca elemente distincte.
- Cereale și garnituri: pâine, orez, paste, cartofi, couscous, quinoa.
- Fructe, nuci și semințe: mere, citrice, fructe de pădure, banane, mango, avocado, măsline, alune, nuci, migdale, fistic, susan.
- Preparate: pizza, burgeri, paste, risotto, supe/ciorbe, salate, grătar, tocănițe, sandvișuri, kebab, tacos, curry, ramen, sushi, tartar.
- Deserturi: prăjituri, ciocolată, înghețată, clătite, patiserie, deserturi cu fructe.
- Băuturi fără alcool: apă plată/minerală, sucuri, limonadă, smoothie, ceai, ciocolată caldă; espresso, cafea cu lapte, cappuccino și cafea rece separat.
- Băuturi cu alcool: bere, cidru, vin alb/roșu/rosé, spumant, cocktailuri și băuturi spirtoase.

Ingrediente și preparate sunt informații distincte: consumul unui ingredient nu înseamnă acceptarea tuturor preparatelor care îl conțin. Precizări despre preparare aprobate la 2026-10-22: fiecare aliment poate avea opțional opțiuni rapide și o precizare proprie despre cum este acceptat (de exemplu ceapă gătită, dar nu crudă; roșii în sos, dar nu în salată; carne doar bine făcută). Separat se pot indica toleranța la picant și preferințele pentru prăjit, grătar, cuptor sau fiert. Buddy respectă precizările când informațiile despre preparat sunt disponibile; când lipsesc, indică ce trebuie verificat. Exemplele sunt opțiuni ale produsului, nu preferințe personale declarate. Alte sugestii încă de rafinat includ gusturile dulce-sărat/foarte condimentat și modul de tratare a ingredientelor ascunse în sosuri sau supe. Inventarul exact rămâne extensibil și de rafinat.
Bucătăriile (locală, italiană, franceză, grecească, japoneză, indiană, mexicană etc.) și experiențele (street food, tradițional, brunch, cafenele, degustări, fine dining) sunt filtre suplimentare.

Răspunsuri aprobate la 2026-10-22 pentru un aliment/preparat: „Îmi place mult”, „Mănânc”, „Aș încerca”, „Nu mănânc”. „Nu mănânc” exprimă o evitare alimentară explicită, distinctă de lipsa interesului și de alergie/intoleranță. Regulă aprobată la 2026-10-22 pentru alimentele necompletate: preferință necunoscută, fără a presupune că alimentul este plăcut sau refuzat. Buddy prioritizează preparatele acceptate și respectă alegerile „Nu mănânc”. Cere clarificări dacă informația lipsă este esențială pentru alegerea unui restaurant. Profilul poate fi completat treptat; nu se cere răspuns pentru fiecare aliment de la început.
### Alergii și intoleranțe — reguli aprobate la 2026-10-22
- Fiecare persoană le poate completa opțional într-o secțiune separată, indicând alimentul sau substanța de evitat. Nu se deduc din gusturi sau din opțiunile necompletate.
- Buddy exclude preparatele despre care există informații că includ ingredientul respectiv.
- Când meniul sau informațiile despre preparare sunt incomplete, localul rămâne vizibil separat cu „Necesită confirmare cu localul”, inclusiv pentru posibila contaminare încrucișată.
- Buddy nu prezintă un restaurant drept sigur pentru o alergie doar pe baza meniului online.
- Restaurantele trebuie în continuare să aibă opțiuni pentru ambii; disponibilitatea unui preparat neverificat nu se promite.
Acestea sunt reguli ale produsului, nu declarații de alergii sau intoleranțe ale utilizatorilor.

### Celelalte patru categorii — sinteză; statutul este precizat în secțiunile detaliate
- Atracții și cultură: istorie antică/medievală/modernă; muzee de artă, istorie, știință și tehnică; galerii; arhitectură; castele/palate; lăcașuri religioase; situri arheologice; cartiere istorice; tradiții locale; spectacole și concerte; locuri de fotografie și panorame.
- Activități și natură: plimbări urbane; trasee ușoare/drumeții solicitante; munte/păduri/lacuri/cascade/peșteri; grădini botanice; bicicletă; caiac; snorkeling; scufundări; plimbări cu barca; sporturi și aventură; ateliere de gătit/artizanat; tururi ghidate; observarea animalelor.
- Relaxare: plajă cu nisip/pietriș, amenajată/sălbatică; înot; piscine; spa/saună/masaj; băi termale; parcuri și grădini; picnic; cafenele liniștite; plimbări la apus; odihnă la cazare.
- Shopping: piețe alimentare; produse locale; artizanat; suveniruri; modă; încălțăminte; vintage/second-hand; anticariate; cărți; design/decor; cosmetice/parfumuri; outleturi; malluri.

Pentru activități se păstrează diferența confirmată între lipsa interesului cu acceptul participării și refuzul explicit. Inventarul detaliat și filtrele despre efort, apă, înălțimi, experiență, format și limite sunt aprobate în secțiunea „Activități și natură”. Ritmul și aglomerația sunt aprobate separat în „Relaxare”. Aprobarea câmpurilor nu completează profilurile personale.


### Detaliere „Atracții și cultură” — structură aprobată la 2026-10-22
Fiecare element se poate selecta separat; aprecierea unei grupe nu implică automat aprecierea tuturor elementelor.
| Grupă | Opțiuni propuse |
|---|---|
| Istorie și patrimoniu | Ruine antice, situri arheologice, castele, cetăți, palate, locuri legate de evenimente istorice; interese pentru Antichitate, Evul Mediu, epoca modernă sau contemporană |
| Muzee | Istorie, arheologie, artă clasică, artă modernă/contemporană, știință, istorie naturală, tehnică, transport, muzee tematice |
| Artă | Pictură, sculptură, fotografie, galerii, street art, expoziții temporare |
| Arhitectură și oraș | Clădiri istorice, arhitectură modernă, poduri, piețe, străduțe, cartiere vechi, interioare și clădiri care pot fi vizitate |
| Patrimoniu religios | Biserici, catedrale, mănăstiri, moschei, sinagogi, temple, cimitire istorice |
| Viață locală și tradiții | Cartiere rezidențiale, sate tradiționale, piețe locale, festivaluri, obiceiuri și ateliere de meșteșugari |
| Spectacole | Muzică live, concerte clasice, operă, teatru, dans, spectacole tradiționale |
| Panorame și fotografie | Puncte de belvedere, turnuri/terase, locuri fotogenice, răsărituri și apusuri |
Se păstrează regulile aprobate despre activități împreună și distincția dintre lipsa interesului cu acceptul participării și refuzul explicit. Opțiunile sunt exemple pentru produs, nu profiluri personale.


### Detaliere „Activități și natură” — structură și precizări aprobate la 2026-10-22
Opțiunile se aleg individual. Exemple pentru inventarul produsului, nu preferințe personale declarate:
| Grupă | Opțiuni propuse |
|---|---|
| Plimbări și drumeții | Plimbări urbane, trasee ușoare, drumeții moderate, trasee montane solicitante, plimbări de coastă |
| Peisaje și natură | Păduri, munți, lacuri, cascade, peșteri, vulcani, deșert, parcuri naturale |
| Pe apă | Caiac, canoe, stand-up paddle, rafting, plimbări cu barca, velier, croaziere scurte |
| În apă | Înot, snorkeling, scufundări introductive, scufundări pentru persoane cu experiență, surfing |
| Aventură și înălțime | Tiroliană, parcuri de aventură, escaladă, via ferrata, parapantă, balon cu aer cald, bungee jumping |
| Sport și mișcare | Bicicletă, bicicletă electrică, mountain bike, echitație, tenis, golf |
| Zăpadă | Schi, snowboard, săniuș, plimbări cu rachete de zăpadă |
| Animale și natură vie | Observarea păsărilor, safari, observarea delfinilor/balenelor, acvarii, ferme vizitabile |
| Ateliere și experiențe locale | Gătit, ceramică, pictură, meșteșuguri, vizite la producători locali |
| Distracție și jocuri | Parcuri de distracții, parcuri acvatice, escape rooms, experiențe interactive |

Filtre opționale aprobate, separate de interesul pentru activitate:
- Efort fizic acceptat: redus, moderat, ridicat.
- Confort în apă: ape puțin adânci, ape adânci, mare deschisă; posibilitatea de a declara că nu știe să înoate.
- Confort cu înălțimile: belvederi protejate, telecabine, expunere la înălțime, activități aeriene.
- Experiență: începător sau cu experiență la activitatea aleasă; se pot preciza calificări când sunt relevante.
- Format preferat: pe cont propriu, tur privat, grup mic, grup mare.
- Limite și nevoi: evitarea scărilor, pantelor abrupte, spațiilor înguste sau alte precizări proprii.

Se păstrează distincția confirmată între interes, acceptul de a participa pentru celălalt și refuzul explicit. Limitele explicite ale oricăruia se respectă în planul comun; un filtru necompletat nu dovedește aptitudinea sau calificarea pentru o activitate. Structura și precizările opționale din această secțiune sunt aprobate; nu sunt funcționalități implementate sau profiluri personale completate.


### Detaliere „Relaxare” — structură și precizări aprobate la 2026-10-22
Selectarea individuală a opțiunilor, cu posibilitatea unor precizări proprii:
| Grupă | Opțiuni propuse |
|---|---|
| Plajă | Nisip, pietriș, stânci; plaje amenajate, golfuri retrase, plaje sălbatice |
| Apă și piscine | Băi în mare, lacuri amenajate pentru înot, piscine în aer liber/interioare, piscine cu vedere |
| Spa și wellness | Masaj, saună, hammam, jacuzzi, tratamente spa |
| Ape termale | Băi termale în natură, centre termale, băi tradiționale |
| Verdeață și liniște | Parcuri, grădini botanice, picnic, odihnă lângă lac/râu, locuri umbrite |
| Pauze în oraș | Cafenele liniștite, terase cu vedere, plimbări lente pe faleză, locuri pentru citit |
| Odihnă și stare de bine | Timp la cazare, dormit mai mult, citit, yoga/stretching, meditație, plimbări la apus |

Precizări opționale aprobate:
- Atmosferă: liniște, atmosferă animată, muzică acceptată; toleranță la aglomerație.
- Cadru: natural/retras sau amenajat, cu servicii.
- Confort: umbră, șezlonguri, toalete, dușuri, vestiare, mâncare/băuturi în apropiere.
- Acces: acces ușor, evitarea scărilor sau altă limită proprie, corelată cu limitele deja aprobate.
- Locul relaxării în plan: pauze scurte pe parcurs, perioade mai lungi, alternarea zilelor active cu zile mai lejere; dimineți lente sau seri liniștite.

Structura aprobată nu impune program pe ore și nu introduce implicit timp separat. Buddy păstrează loc pentru odihna dorită și respectă limitele ambilor. Opțiunile sunt pentru viitorul produs, nu preferințe personale deja declarate.


### Detaliere „Shopping” — structură și precizări aprobate la 2026-10-22
Selecții individuale pentru produsele căutate și pentru tipurile de locuri; acestea sunt opțiuni ale produsului, nu preferințe personale declarate.
| Grupă | Opțiuni propuse |
|---|---|
| Produse locale și artizanat | Ceramică, textile, bijuterii lucrate manual, obiecte din lemn/piele, lucrări ale artiștilor locali |
| Suveniruri | Magneți, cărți poștale, obiecte reprezentative, cadouri, obiecte de colecție |
| Produse alimentare de luat acasă | Dulciuri, ciocolată, condimente, ceai, cafea, uleiuri, produse regionale, vinuri/băuturi locale |
| Haine și încălțăminte | Branduri locale, designeri independenți, magazine internaționale, sport/outdoor, vintage, second-hand |
| Accesorii | Genți, portofele, curele, pălării, ochelari, ceasuri, bijuterii |
| Cosmetice și parfumuri | Parfumuri, îngrijire personală, cosmetice locale, produse naturale |
| Casă și decor | Obiecte de design, veselă, decorațiuni, mobilier mic, antichități |
| Cărți, muzică și hobby-uri | Librării, anticariate, benzi desenate/manga, viniluri, jocuri, fotografie, materiale creative |
| Tehnologie | Electronice, gadgeturi, accesorii pentru telefon/calculator |

Tipuri de locuri aprobate, selectate separat: piețe tradiționale, târguri de artizanat, talciocuri, buticuri independente, ateliere/magazine ale producătorilor, străzi comerciale, magazine universale, malluri, outleturi.

Precizări opționale aprobate:
- Intenție: plimbare și descoperire sau cumpărături efective.
- Frecvență: doar dacă este în apropiere, opriri ocazionale sau o perioadă dedicată.
- Produse: local/autentic, branduri cunoscute, vintage/second-hand, exclusivist.
- Nivel de preț preferat: accesibil, mediu, premium; opțional, fără buget numeric obligatoriu.
- Practic: obiecte mici/ușoare pentru bagaj, cadouri sau căutarea unui produs concret.

Un interes pentru piețe alimentare poate exista și fără intenție de cumpărături. Buddy poate integra o piață pentru experiența locală, păstrând interesele distincte. Se păstrează activitățile comune și respectarea refuzurilor ambilor; nu se introduce implicit timp separat.


## Adăugarea locurilor prin nume sau link — flux aprobat la 2026-10-22
Cerința de bază și următorul flux de identificare și integrare sunt aprobate:
1. Utilizatorul introduce numele sau linkul unui loc în vacanța curentă.
2. Buddy încearcă identificarea în contextul destinației și arată numele, localitatea/adresa și fotografia, dacă există.
3. Dacă există mai multe potriviri, arată variantele și utilizatorul alege; nu selectează automat un loc ambiguu.
4. Dacă linkul nu poate fi citit sau locul nu poate fi identificat suficient de clar, cere numele și localitatea/adresa ori un alt link. Nu inventează amplasarea sau datele lipsă.
5. După identificare, Buddy propune ziua și poziția în traseu, respectând o zi indicată de utilizator dacă acesta o precizează. Prezintă rezumatul modificării pentru confirmare înainte de aplicare.
Se păstrează celelalte locuri alese, iar prețul/programul neconfirmat rămân marcate conform regulilor existente. Nu se promite suport universal pentru orice link; sursele și accesul efectiv trebuie evaluate tehnic. Adăugările manuale respectă și regulile deja aprobate despre refuzurile explicite, limitele ambilor și restricțiile alimentare; prezentarea mesajelor aferente se stabilește la design.


## Generarea itinerariului și întreruperile — propunere de comportament, neaprobată
În timpul generării se afișează etapa reală, cu mesaje simple:
1. „Caut locuri potrivite pentru voi.”
2. „Organizez locurile pe zile.”
3. „Verific ordinea opririlor și informațiile disponibile.”
Etapele trebuie să reflecte operațiile efectiv executate. Verificarea folosește datele disponibile și păstrează marcajele de preț/program sau alte informații neconfirmate.

Dacă procesul se întrerupe:
- Ultimul itinerariu confirmat rămâne disponibil și neschimbat.
- Rezultatul parțial recuperabil se păstrează separat și poate fi consultat cu marcajul „Propunere incompletă”, fără să fie prezentat ca plan final sau să înlocuiască planul confirmat.
- La prima generare, dacă nu există încă un itinerariu confirmat, interfața indică explicit acest lucru și arată separat propunerea incompletă disponibilă.
- Se explică motivul cunoscut: conexiune întreruptă, serviciu indisponibil, cotă gratuită epuizată ori cauză încă neclară. Se arată ce lipsește când poate fi determinat.
- Utilizatorul poate apăsa „Reîncearcă” când problema permite. Pentru cotă epuizată, disponibilitatea sau momentul reîncercării se afișează numai dacă sunt cunoscute; se păstrează regula aprobată fără plată automată.
- O propunere incompletă nu înlocuiește copia offline completă existentă. O propunere de modificare recuperată respectă în continuare rezumatul, confirmarea și regulile pentru un plan comun modificat între timp.

Acest comportament este o propunere de produs, nu o capacitate implementată sau probată cu furnizori.
