# Fezabilitate cu costuri zero — Travel Buddy

## Actualizare de statut — 2026-10-23
Cele patru compromisuri discutate în raportul istoric sunt deja aprobate în `product.md`: oprire la cote fără plată automată, lipsa fotografiei indicată după căutare, transport public neconfirmat marcat cu sursă și plan offline cu hartă online. Nu se rediscută. Recomandarea tehnică actuală este în [architecture.md](architecture.md); ofertele rămân condiționate de probele planificate și de cotele conturilor la activare. Textul de mai jos păstrează cercetarea inițială, inclusiv stările istorice de aprobare.

Evaluare documentară la **22 octombrie 2026**, pentru două persoane. Coordonatorul a integrat trei cercetări delimitate efectuate de agenți `gpt-6-luna` și a reverificat sursele decisive. Nu au fost create conturi, chei, servicii sau aplicații. O ofertă publică nu dovedește încă funcționarea integrată; cotele și condițiile trebuie reverificate înainte de activare.

## Concluzie
O versiune personală fără abonamente este plauzibilă: acces online privat, căutare în limite lunare, generare cu un model gratuit în limitele sale, hartă cu traseu și consultarea planului salvat fără internet. **Nu este demonstrată încă îndeplinirea întregului brief, în orice destinație, fără întreruperi și cu toate informațiile complete.**

Cost zero înseamnă aici fără facturi pentru serviciile aplicației, în limitele planurilor gratuite, folosind telefonul/calculatorul și conexiunea deja disponibile. Nu include cumpărarea unui domeniu propriu, echipamente sau date mobile. Nu presupune că ofertele rămân gratuite pentru totdeauna.

| Cerință | Evaluare | Limita importantă |
| --- | --- | --- |
| Acces online, două conturi, vacanțe comune private | Fezabil documentar | Trebuie construite și verificate permisiunile; cotele pot opri accesul |
| Căutare de informații actuale | Fezabilă cu plafon | O vacanță consumă mai multe căutări; nu toate site-urile oferă date accesibile |
| Generare și conversație cu Buddy | Candidat gratuit identificat | Calitatea în trei limbi și respectarea tuturor regulilor necesită probe |
| Hartă cu traseu pe jos/auto | Fezabilă documentar | Serviciu de calcul separat de fundalul hărții; cote și atribuire |
| Transport public și combinații | Posibil, condiționat de destinație | Unele rute sunt bazate pe modele aproximative; nu promitem acoperire uniformă |
| Consultarea planului salvat offline | Fezabilă documentar | Salvare înainte de plecare; datele browserului pot fi șterse |
| Hartă completă/navigare offline integrată | Neconfirmată; nici cerută definitiv | Furnizorul hărții trebuie să permită descărcarea; nu rezultă automat din gratuitate |

## 1. Acces online și păstrarea datelor

**Cloudflare** este un candidat pentru paginile site-ului și operațiunile din spate. Pages oferă adresă de forma `nume.pages.dev`, deci nu trebuie cumpărat domeniu. Workers Free permite 100.000 cereri/zi și 10 ms timp de procesor pe cerere; așteptarea răspunsului unui serviciu extern nu se numără în acest timp. Limita poate conta pentru operațiuni complexe, inclusiv autentificare. [Adresă Pages](https://developers.cloudflare.com/pages/get-started/direct-upload/), [limite Workers](https://developers.cloudflare.com/workers/platform/limits/).

D1 Free, pentru datele structurate, include 5 milioane rânduri citite/zi, 100.000 scrise/zi și 5 GB total. La atingerea limitelor gratuite apar erori/restricții, nu capacitate nelimitată. Acest volum pare suficient pentru doi oameni, ca estimare, nu ca test. Conturile și drepturile asupra vacanțelor nu vin gata rezolvate de baza de date. [Preț și comportament D1](https://developers.cloudflare.com/d1/platform/pricing/).

**Firebase Spark** este o alternativă fără informații de plată, cu autentificare și stocare de date în cote gratuite. Hosting oferă 10 GB stocare și 10 GB transfer/lună; după depășirea transferului și o perioadă de grație, site-ul poate fi oprit până luna următoare. Funcțiile server Cloud Functions necesită planul Blaze; pentru apelarea sigură a serviciilor de căutare/AI ar trebui evaluată o componentă gratuită separată. Nu trebuie confundate Firebase Hosting, App Hosting și Cloud Storage: nu au aceleași condiții. [Planuri Firebase](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [limite Hosting](https://firebase.google.com/docs/hosting/usage-quotas-pricing).

**Supabase Free** simplifică asocierea conturilor cu datele: include autentificare, 500 MB bază de date, 5 GB transfer și 50.000 utilizatori activi lunar. Dezavantaj important pentru vacanțe ocazionale: proiectele gratuite sunt puse în pauză după o săptămână de inactivitate. Interfața site-ului necesită găzduire separată. Nu recomand această variantă ca primă opțiune dacă dorim acces spontan după luni de neutilizare. [Oferta Supabase](https://supabase.com/pricing).

**Concluzia coordonatorului:** accesul de oriunde nu obligă la abonament, dar datele sincronizate vor ajunge pe infrastructura unui furnizor. „Privat pentru două conturi” trebuie realizat prin reguli de acces, nu printr-un link greu de ghicit. Cheile secrete de căutare/AI trebuie păstrate în componenta protejată a aplicației. Nu alegem încă frameworkul, baza de date sau mecanismul de conturi.

## 2. Căutare, informații și fotografii

**Tavily Free** oferă 1.000 credite/lună, fără card. Creditele se resetează în prima zi a lunii; când sunt consumate, cererile se opresc până la resetare sau upgrade. Căutarea, extragerea textului și analiza mai amplă consumă diferit, deci 1.000 credite nu înseamnă 1.000 vacanțe. Este candidatul principal pentru o probă ulterioară de căutare cu plafon strict. [Preț și FAQ Tavily](https://www.tavily.com/pricing).

Exemplu pur ilustrativ: dacă documentarea unei vacanțe ar consuma 40 credite, 1.000 ar acoperi 25 astfel de documentări, înainte de mesajele ulterioare. Costul real se măsoară după stabilirea fluxului, nu se promite din această împărțire.

**Metoda propusă:** căutăm locuri și surse; verificăm prețul/programul pe pagina oficială când este accesibilă; salvăm informația, sursa și data verificării; Buddy folosește aceste rezultate pentru recomandare. Un model de limbaj nu înlocuiește verificarea informațiilor recente. Nu există în cercetarea aceasta un furnizor gratuit demonstrat care să livreze pentru orice loc fotografie, preț, program, meniu și date complete.

Scrapingul — extragerea automată a textului din pagini — rămâne o unealtă posibilă pentru surse evaluate individual. Nu recomand un sistem care presupune că poate citi orice site: paginile se schimbă, unele cer autentificare sau blochează automatizarea, iar disponibilitatea textului nu echivalează cu permisiunea de a-l republica. Pentru sursele blocate folosim alte surse accesibile ori un link și marcajul neconfirmat; nu ocolim barierele.

Pentru fotografii, **Wikimedia Commons** este o sursă posibilă, cu respectarea licenței fiecărui fișier și a atribuirii autorului. Nu garantează o fotografie a fiecărui restaurant sau loc ascuns. [Reguli Commons](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia). Propunere de compromis, încă neaprobată: când nu există o fotografie utilizabilă, afișăm explicit lipsa fotografiei, fără imagine inventată prezentată drept fotografie reală a locului.

Identificarea după nume/adresă poate folosi **Nominatim** public doar la volum moderat: maximum o cerere/secundă pentru întreaga aplicație, identificarea aplicației, atribuire și reutilizarea rezultatelor. Nu permite autocomplete sau colectarea sistematică a tuturor obiectivelor. Nu este motor de căutare web și nu furnizează toate prețurile/programul. [Politica Nominatim](https://operations.osmfoundation.org/policies/nominatim/).

## 3. Generarea itinerariilor și conversația cu Buddy

**Groq Free** este candidat pentru redactare, personalizare și traducere. Exemplu de limită publicată pentru `openai/gpt-oss-120b`: 30 cereri/minut, 1.000/zi, 8.000 unități de text/minut și 200.000/zi. O solicitare lungă poate atinge limita de text înainte de cea de cereri. Limitele sunt pe organizație/model, iar depășirea returnează eroare 429; cotele efective trebuie verificate pe cont. Calitatea în română, engleză și franceză nu a fost testată. [Limite Groq](https://console.groq.com/docs/rate-limits).

Groq declară că nu reține implicit cererile obișnuite de inferență, dar există excepții pentru fiabilitate/abuz, cu păstrare până la 30 zile, și opțiune Zero Data Retention. Setarea trebuie verificată înainte de folosire. Asta nu înseamnă că datele nu părăsesc telefonul: furnizorul trebuie să primească materialul pentru a genera răspunsul. [Politica datelor Groq](https://console.groq.com/docs/your-data). Propun să trimitem numai preferințele relevante, fără nume, emailuri sau detalii inutile; gestionarea informațiilor despre alergii rămâne de definit.

**Cloudflare Workers AI** este o alternativă: 10.000 „neuroni”/zi gratuit, unitate de consum care diferă după model și cantitatea de text. Pe Free, depășirea produce erori; mai mult consum cere upgrade. Nu se poate converti cinstit această cotă într-un număr fix de itinerarii înainte de măsurare. [Preț Workers AI](https://developers.cloudflare.com/workers-ai/platform/pricing/).

**Gemini API nu este recomandat în configurația gratuită a acestui proiect.** Termenii actuali limitează utilizarea la scopuri profesionale/de afaceri și cer Paid Services când un API Client este oferit utilizatorilor din SEE, inclusiv România. Tabelele unor modele conțin cote gratuite, dar acestea nu anulează condițiile de utilizare. Aceasta este lectura termenilor pentru selecția furnizorilor, nu o activare sau o soluție contractuală. [Termeni Gemini](https://ai.google.dev/gemini-api/terms).

**Concluzia coordonatorului:** automatizarea gratuită este plauzibilă, fără a depinde de un model cu plată. Regulile esențiale — refuz explicit, păstrarea opririlor, confirmarea înainte de schimbare — trebuie verificate de aplicație; nu lăsate doar la bunăvoința modelului. Căutarea și generarea sunt consumuri diferite. La atingerea cotei propun păstrarea accesului la itinerariile deja salvate și amânarea recomandărilor noi, fără upgrade automat.

## 4. Hărți și trasee

Trebuie separate fundalul hărții, coordonatele locurilor și calculul drumului dintre opriri. O linie dreaptă între puncte nu dovedește un traseu realizabil. Serviciul poate returna distanțe/durate intern fără ca interfața să le afișeze; cerința utilizatorului se păstrează.

**Geoapify Free** este candidatul cel mai promițător identificat pentru evaluarea integrată: 3.000 credite/zi, fără card, până la 5 cereri/secundă. Cere cont, cheie și atribuirea furnizorului/surselor. Cotele sunt „soft”: depășirile repetate pot duce la solicitare de upgrade și blocarea contului, deci propun plafon și în aplicație. Creditele se împart între serviciile utilizate, nu sunt alocate separat fiecărei funcții. [Planuri Geoapify](https://www.geoapify.com/pricing/).

Routing oferă geometrie de traseu pentru mers, mașină și transport public, cu opriri multiple. Costul de bază este un credit pe segment, cu suplimente pentru lungime/opțiuni. Rezultatele pot fi stocate. Pentru transport public, furnizorul folosește date oficiale unde există și modele aproximative în alte zone. Prin urmare, nu putem promite un traseu precis de autobuz/metrou în orice destinație. Combinațiile de transport și comportamentul în funcție de ora plecării trebuie probate; planul fără ore fixe poate oferi orientare, nu promisiunea unei anumite conexiuni. [Routing și acoperire Geoapify](https://www.geoapify.com/routing-api/), [documentație](https://apidocs.geoapify.com/docs/routing/).

**Openrouteservice / HeiGIT** rămâne alternativă pentru mers/auto. Comunicatul oficial din 29 septembrie 2026 descrie API-ul public ca gratuit după înregistrare. Totuși pagina veche de planuri nu mai este disponibilă, iar portalul actual nu a expus cotele prin instrumentul de cercetare; **nu confirmăm cifrele vechi 2.000/zi și 40/minut**. API-ul vechi este în retragere, în favoarea `api.heigit.org`. [Comunicat oficial](https://heigit.org/openrouteservice-10-0-0-amalthea-release/), [migrare](https://ask.openrouteservice.org/t/reducing-the-quota-of-deprecated-api-api-openrouteservice-org/8013), [portal planuri](https://account.heigit.org/info/plans). Nu bazăm soluția de transport public pe acest serviciu.

**OpenStreetMap** oferă date deschise, dar serverul standard de imagini ale hărții are reguli proprii: atribuire, cache corect, fără garanție de disponibilitate și fără descărcare anticipată pentru offline. Nu echivalăm date gratuite cu server nelimitat. [Politica hărților OSM](https://operations.osmfoundation.org/policies/tiles/).

Compromis propus, nu adoptat: unde transportul public nu este verificabil, marcăm traseul ca neconfirmat și oferim verificarea în sursa operatorului/aplicația de transport. Nu înlocuim pe ascuns traseul cu o linie dreaptă și nu declarăm cerința complet realizată doar fiindcă am deschis o altă aplicație.

## 5. Consultare fără internet

Este posibil ca un site să păstreze pe telefon interfața și datele necesare pentru consultarea offline. Trebuie salvate efectiv locurile, ordinea, descrierile în limba dorită și celelalte informații permise, nu doar linkurile către ele. [Documentație MDN pentru offline](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation).

Salvarea în browser are limite: sistemul poate elimina date la lipsă de spațiu sau inactivitate, iar utilizatorul le poate șterge. WebKit permite solicitarea stocării persistente, dar acordarea depinde de condiții; nu promitem păstrarea veșnică. [Politica WebKit](https://webkit.org/blog/14403/updates-to-storage-policy/).

Propun un indicator „salvat pe acest telefon”, data ultimei salvări și o probă în modul avion înainte de plecare. O copie exportată ca fișier ar putea fi rezervă opțională, încă neaprobată. Offline nu poate vedea modificările făcute între timp de celălalt cont. Schimbarea limbii fără internet necesită ca acea variantă să fi fost salvată. Expirarea sesiunii și deconectarea trebuie proiectate astfel încât să nu compromită nici consultarea, nici confidențialitatea.

Harta offline este altă problemă: geometria unui traseu salvat nu include străzile și etichetele fundalului. Nu s-a confirmat permisiunea pentru pachete offline Geoapify, iar serverul standard OSM o interzice. Nu este demonstrată o hartă completă offline integrată la cost zero; aceasta rămâne opțională și separată de planul offline obligatoriu. Recalcularea traseelor și recomandările noi ar necesita conexiune în varianta propusă.

## Recomandare și ce urmează

Recomand continuarea cu o variantă limitată explicit la ofertele gratuite, oprire la plafon și reutilizarea informațiilor deja verificate. Lista scurtă de evaluat este: Cloudflare sau Firebase pentru acces/date, Tavily pentru căutare, Groq ori Workers AI pentru generare și Geoapify pentru hartă/trasee. Acestea sunt **opțiuni cercetate, nu un stack aprobat**; combinația exactă depinde de autentificare, gestionarea cheilor și probele funcționale.

Înainte de implementare trebuie discutate compromisurile care schimbă experiența: așteptarea la atingerea cotelor, fotografie indisponibilă, transport public neconfirmat în unele destinații și consultare offline a planului fără promisiunea hărții complete. Marcarea prețului/programului neconfirmat este deja acceptată și nu se redeschide.

Probe ulterioare, numai în etapa autorizată: un oraș bine documentat și o destinație cu puține date; vacanță cu mai multe baze; reguli opuse ale celor doi; mesaje RO/EN/FR; cote epuizate; două conturi și acces neautorizat; salvare pe telefoanele reale și pornire în modul avion. Se măsoară consumul pe itinerariu și calitatea surselor înainte de promisiunea gratuității practice.

## Verificări și limite ale raportului
- Trecute: consolidarea cerințelor, separarea cerințelor de propuneri, cercetare în surse oficiale, verificarea coordonatorului pentru ofertele și restricțiile decisive.
- Corectate la review: cifre ORS vechi eliminate din recomandare; restricțiile Gemini pentru România incluse; transport public nu este declarat imposibil gratuit, deoarece Geoapify oferă un candidat condiționat de acoperire.
- Neexecutate: conturi, apeluri API cu chei, probe de calitate, implementare, teste pe telefon, audit de securitate sau măsurarea consumului. Nu există rezultat integrat testat.
- Rămase: cotele efective ale conturilor, acoperirea reală a destinațiilor, calitatea în trei limbi, fotografii și date complete, permisiunea pentru eventuale hărți offline și acceptarea compromisurilor de către utilizator.
