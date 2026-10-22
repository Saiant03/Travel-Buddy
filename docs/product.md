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
