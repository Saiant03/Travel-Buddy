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
