# Recuperarea probelor autentificate — 1 noiembrie 2026

## Stare și scop

Acest document păstrează dovezile și pașii de recuperare pentru probele tehnice deja publicate. Verificarea inițială a confirmat că paginile de probă răspund, dar probele pozitive cu cele două conturi nu au fost executate. Faptele necesare reluării sunt consemnate aici, fără dependență de fișierele temporare ale sesiunii.

**Autorizare:** sunt autorizate corectarea listei de utilizatori acceptați de server, aplicarea configurației necesare probei și pregătirea unui fixture sintetic în baza D1 dedicată probelor. Utilizatorul a cerut explicit și consemnarea în GitHub. Această autorizare nu acoperă dezvoltarea sau publicarea produsului complet, schimbarea arhitecturii, activarea facturării/upgrade-urilor sau modificări de date reale de călătorie.

Înainte de această actualizare, documentația Git/main descria starea din 23 octombrie, deși serviciile de probă aveau versiuni publicate la 25 octombrie. Secțiunile recente din memorie, plan și verificări au prioritate față de acel istoric.

## Resurse și instrumente

- Server probe: [travel-buddy-server-probe](https://travel-buddy-server-probe.saiuantonio.workers.dev/)
- Offline probe: [travel-buddy-offline-probe](https://travel-buddy-offline-probe.saiuantonio.workers.dev/)
- Proiect Firebase (ID neconfidențial): `travel-buddy-b3f48`
- Baza D1 dedicată: `travel-buddy-server-probe`; nu folosi o bază de produs pentru fixture-uri.
- Firebase CLI observat: `15.34.2`; apelurile de rețea din acest mediu folosesc `NODE_USE_ENV_PROXY=1`.
- CLI-urile Cloudflare și Firebase trebuie să folosească sesiunile lor administrative deja configurate; nu copia și nu afișa tokenuri de sesiune.

Nu salva parole, coduri de autentificare, UID-uri, adrese de email, chei API sau tokenuri în acest document, în rezultate sau în loguri. Nu afișa acești identificatori în capturi ori rapoarte. Nu exporta utilizatorii Firebase; exportul poate include hash-uri de parole. Folosește numai verificări de metadate strict necesare, fără câmpurile de identitate.

## Baza verificată înainte de remediere

- Proiectul Firebase `travel-buddy-b3f48` și aplicația sa web sunt active. Autentificarea email/parolă este activată și necesită parolă.
- Există două conturi pentru probe. Ambele sunt activate (`disabled=false`), dar ambele au emailul neconfirmat (`emailVerified=false`).
- Confirmarea emailului trebuie făcută de proprietarul real al căsuței respective, urmând mesajul pe care îl primește acesta. Persoana care se conectează administrativ la Firebase/Cloudflare nu devine automat utilizatorul aplicației. Conectarea de administrator și conectarea utilizatorului final sunt fluxuri diferite.
- Nu sări peste confirmare prin schimbarea manuală a stării `emailVerified`, prin editarea datelor utilizatorului sau prin emiterea unui token de substituție.
- Lista domeniilor Firebase autorizate conține domeniile implicite `localhost`, `travel-buddy-b3f48.firebaseapp.com` și `travel-buddy-b3f48.web.app`; nu conține domeniul `workers.dev`. Interfața de probă folosește autentificarea REST cu email și parolă, fără redirect OAuth sau `continueUrl`. Absența `workers.dev` nu demonstrează un blocaj pentru loginul REST actual; nu schimba lista domeniilor fără o eroare reprodusă care să ceară asta.
- Serverul probei este accesibil în Chromium. Cererile negative fără autentificare și cu token malformat au primit `401 UNAUTHENTICATED` și `Cache-Control: private, no-store`.
- Cele două valori din lista serverului nu corespundeau niciunuia dintre cele două conturi Firebase, în versiunea care deservea 100% din trafic. Acest blocaj a fost corectat ulterior, conform rezultatelor de mai jos.
- D1 dedicată probei are schema aplicației, însă tabelele aplicației sunt goale. Lipsesc datele sintetice așteptate de probe (vacanță, membri, profiluri și propuneri).
- Proba offline a trecut în Chromium desktop pentru fixture-ul sintetic: salvare și reîncărcare din IndexedDB, păstrarea reviziei complete după simularea unei actualizări întrerupte și redeschidere fără internet. Aceasta nu verifică telefonul real, instalarea PWA pe iOS/Android, pornirea la rece, evacuarea stocării sau întregul comportament offline al produsului. Proba pe telefon rămâne neexecutată.

## Pași de recuperare — rezultat și continuare

1. **Confirmarea emailurilor de către proprietari — AȘTEAPTĂ.** Proprietarii reali verifică fiecare căsuță și finalizează confirmarea dacă mesajul a fost primit. Nu trimite mesaje fără autorizarea și acțiunea explicită a proprietarilor. Dacă mesajul lipsește sau linkul nu mai funcționează, raportează blocajul și stabilește următorul pas împreună cu coordonatorul; nu modifica starea de confirmare manual. Dovada finală va conține doar numărul conturilor confirmate, fără adrese.
2. **Alinierea allowlist-ului Worker — VERIFICAT.** Au fost corectate numai `ALLOWED_UID_1`/`ALLOWED_UID_2`, cu identificatorii privați ai celor două conturi existente, în ordinea creării lor. Candidatul a fost verificat înainte de activarea la 100%; codul, fișierele, cheia client Firebase și celelalte bindings au fost moștenite. Comparația după aplicare a confirmat exact două conturi și două potriviri. Nu s-a relaxat controlul de acces și nu s-au modificat conturi Firebase.
3. **Fixture-ul D1 sintetic — VERIFICAT.** Au fost inserate atomic, o singură dată, 14 rânduri sintetice în baza dedicată: 2 utilizatori activați pentru probă, 2 profiluri Alpha/Beta, 3 vacanțe la versiunea 7, 5 legături de apartenență și 2 propuneri. Tabela de confirmări/idempotency a rămas goală. Reluarea verificării recunoaște fixture-ul exact fără scrieri; verificarea cheilor externe nu a găsit încălcări. Nu s-au șters date, schimbat schema sau modificat conturi Firebase.
4. **Reexecutarea verificărilor — PARȚIAL.** După aplicare au trecut verificarea configurației publice, încărcarea paginii în Chromium și cele trei cereri negative de acces (401, `private, no-store`). Verificarea pozitivă a accesului și probele de concurență/idempotency rămân neexecutate până la confirmarea emailurilor și existența sesiunilor reale în panou. Accesul administrativ nu oferă automat aceste sesiuni și nu autorizează emiterea unor tokenuri de substituție. Nu descrie lipsa parolelor ca defect de configurare și nu le cere în chat. Benchmarkul rămâne neexecutat; nu activa billing și nu epuiza cotele pentru el.
5. **Review și limitări — EFECTUAT pentru remediere.** Reviewul independent a verificat SQL-ul, etapele de creare/activare a candidatului și limitele concluziilor. Coordonatorul a făcut verificarea integrată după aplicare. Aceste dovezi nu închid planul complet P-01/P-02/P-09/P-12 și nu echivalează cu validarea produsului.

### Rezultate finale

- Confirmarea făcută de proprietarii inboxurilor: **ÎN AȘTEPTARE** — ultima verificare: zero emailuri confirmate din două; ambele conturi nedesactivate.
- Allowlist-ul privat al Workerului comparat și corectat: **TRECUT** — exact două intrări, ambele corespund celor două conturi Firebase, în versiunea activă la 100%.
- Fixture-ul D1 sintetic pregătit și verificat: **TRECUT** — cardinalități, versiunea 7, legături și reluare fără dublare verificate.
- Probe autentificate: **NEEXECUTATE** — necesită confirmările și sesiunile reale ale utilizatorilor. Reviewul remedierii și verificările fără sesiune sunt efectuate.
- Proba offline pe telefon: **NEEXECUTATĂ** — nu este înlocuită de rezultatul desktop.

Completează aceste stări numai după ce există rezultate verificate; păstrează documentul fără secrete și fără identificatori de cont.

### Aplicarea configurației și dovezile păstrării

A fost folosit endpointul Cloudflare GA de JSON Merge Patch pentru versiunile Worker, cu codul și assets omise și cu moștenire explicită din versiunea inițială pentru celelalte patru bindings. Nu a fost folosită o înlocuire incompletă a configurației, care ar fi putut pierde cheia Firebase. Candidatul a fost creat fără mutarea traficului, verificat și apoi activat explicit la 100%.

Versiunea activată: `01bf8ce8-d2d3-4e87-8514-999ce12102b6`; deployment: `224f6c5f-497b-4bd7-a110-f782a05b6b91`. Codul și source map-ul au fost comparate înainte/după și sunt identice byte cu byte. Diferența bindings conține numai cele două variabile de allowlist; restul setărilor sunt păstrate. Configurația publică Firebase a fost comparată în privat cu configurația aplicației web înregistrate și corespunde. Backup-urile brute cu identificatori privați rămân în afara Git; raportul consemnează numai rezultatele.

## Reluare de către utilizatori

1. Deschideți [panoul server](https://travel-buddy-server-probe.saiuantonio.workers.dev/). Folosiți în Alpha contul creat primul în Firebase, iar în Beta contul creat al doilea.
2. Autentificați contul în panou. Dacă nu există un mesaj de confirmare valid, butonul „Trimite emailul de confirmare” devine disponibil după autentificare; proprietarul contului îl poate folosi pentru propria adresă.
3. Fiecare proprietar confirmă linkul în propria căsuță. Reautentificați apoi contul în panou, pentru ca sesiunea să reflecte confirmarea. Nu transmiteți parolele, codurile sau tokenurile în chat.
4. Rulați „Verifică accesul privat”. După succes se poate continua cu „Verifică confirmarea propunerii”, o singură dată pe fixture-ul inițial de versiune 7. Acesta este un test care schimbă date sintetice; nu reinițializați baza pentru a ascunde un eșec.
5. Păstrați rezultatele sanitizate ale panoului pentru review. Un rezultat verde al acestor scenarii nu închide automat toate probele mai ample din plan.

Instrumentele administrative pot verifica metadatele și baza după aceste acțiuni, dar nu preiau automat sesiunile deschise în browserul utilizatorilor. Pentru reluări viitoare, verificați mai întâi sesiunile administrative existente și starea fixture-ului; nu reinstalați instrumentele și nu cereți coduri OAuth noi fără o eroare concretă.

## Ordinea conturilor și fixture-ul sintetic

**Alpha este contul creat primul în Firebase; Beta este contul creat al doilea.** Aceeași ordine este folosită de configurația serverului și de fixture. Nu inversa sloturile în panoul de probe: vacanța privată aparține numai lui Alpha, iar testul verifică refuzul pentru Beta. Data creării se poate consulta în Firebase Authentication fără să fie copiată în Git.

Fixture-ul corespunde generatorului SQL al interfeței deja publicate: `trip-1` versiunea 7, profiluri cu reviziile 4 și 9, `proposal-a`/`proposal-b`, plus vacanțele fictive pentru testul privat și proba CPU. Nu sunt vacanțe, preferințe sau rezervări reale. Identificatorii conturilor sunt rezolvați privat prin metadatele Firebase și apar numai în configurația privată și în baza dedicată; nu se încorporează în documentație.

Înaintea inserării au trecut verificări SQLite locale asupra SQL-ului efectiv: parametri, valori, relații, ordinea conturilor, reluare fără dublare, refuzul unei stări neașteptate și rollback. Un review independent a verificat corespondența cu generatorul frontend. Scriptul a verificat schema exactă și că tabelele aplicației erau goale înaintea singurului batch de inserare. Verificările ulterioare au raportat zero rânduri scrise.

**Nu reinițializa fixture-ul după testul de concurență.** Acest test modifică intenționat versiunea 7 și creează confirmări. La o reluare cu date existente, inspectează rezultatul înainte de orice schimbare; nu șterge și nu reseta automat baza pentru a obține un rezultat verde.

## Limitele reviewului existent

Raportul curent documentează rezultate reale, dar limitate la paginile și harness-urile de probă. A trecut doar verificarea offline pe desktop. Nu au fost testate conectarea pozitivă cu parolele reale, accesul pozitiv la date, izolarea celor două sesiuni reale, expirarea tokenurilor, confirmarea emailului la backend, concurența completă sau telefonul. A fost notată și o posibilă etichetă de conectare rămasă veche după o încercare eșuată; observația nu a fost reprodusă cu parole reale și nu constituie defect confirmat. Verificările negative și offline nu reprezintă validarea completă a aplicației.
