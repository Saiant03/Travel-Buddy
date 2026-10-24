# Panou separat pentru probele serverului

Acesta este un instrument tehnic pentru Gate B1, nu aplicația Travel Buddy și nu demonstrează încă izolarea completă a datelor ori funcționarea în telefoane. El folosește Firebase Authentication pentru două conturi aprobate și un Worker/D1 separat. Panoul nu salvează date în browser și nu oferă o rută de administrare.

## Starea configurării

Email/Password este deja activat în Firebase. Valorile Firebase și D1 au fost completate în configurația locală, iar utilizatorul a confirmat că schema D1 este aplicată; captura din fila **Console** la adresa `/tables` afișează șase tabele. La momentul consemnării acestei note, remote-ul GitHub era încă la snapshotul `be7fc56`, iar utilizatorul nu apăsase Deploy. Acest text nu confirmă că remote-ul sau Workerul au fost actualizate.

## Pregătirea conturilor

1. În Firebase Console, deschide proiectul Travel Buddy. Proiectul a fost creat, iar planul gratuit Spark a fost confirmat. ID-ul de proiect observat este `travel-buddy-b3f48`. Nu adăuga un card, nu activa facturarea și nu trece la Blaze.
2. La **Authentication → Sign-in method**, verifică **Email/Password**. Acest provider este deja activat; nu este nevoie să-l activezi din nou.
3. La **Authentication → Users**, verifică cele două conturi aprobate care au fost deja create; nu le recrea. Crearea conturilor nu trimite automat emailul de verificare. După ce autentifici fiecare cont în panoul probei, apasă **Trimite emailul de confirmare** doar când utilizatorul cere acel email; utilizatorul deschide mesajul primit, confirmă adresa, apoi se autentifică din nou.
4. În setările aplicației Web din proiect, identifică `projectId` și cheia web `apiKey`. ID-ul proiectului și UID-urile conturilor sunt identificatori, nu parole; coordonatorul îi poate primi pentru configurare. Cheia web Firebase este configurare publică a aplicației, dar introdu-o în setările Workerului din Dashboard, nu în chat. Nu trimite parole, tokenuri bearer sau chei private de service-account.
5. UID-ul fiecărui cont se vede în **Authentication → Users**. Introdu UID-urile numai în configurarea Workerului; Workerul nu le trimite browserului.

În **Cloudflare Dashboard → Workers & Pages → Worker → Settings → Variables and Secrets**, configurează `FIREBASE_PROJECT_ID`, `ALLOWED_UID_1` și `ALLOWED_UID_2` cu valorile reale. Configurează `FIREBASE_WEB_API_KEY` separat ca **Secret runtime** al Workerului. Nu pune cheia în repository, în `wrangler.console.toml`, în setările de build sau în chat. Până când Secretul runtime este setat, `GET /probe/public-config` răspunde cu 503; Workerul trimite browserului `projectId` și cheia Web numai după configurarea completă.

## Pregătirea Cloudflare

1. În Cloudflare Dashboard, deschide **Storage & databases → D1 SQL Database** și folosește baza nouă `travel-buddy-server-probe`, ID `b6deb718-ad18-43f8-8649-95e3ed861aaf`, dedicată acestei probe. Utilizatorul a confirmat schema aplicată; captura din fila **Console** la adresa `/tables` afișează șase tabele. Verifică în Dashboard că baza este pe planul Free înainte de publicare; captura disponibilă nu confirmă planul. Nu continua dacă alegerea cere plată sau poate activa billing. Nu rula migrarea din nou și nu folosi o bază cu date existente.
2. În branch-ul `codex/implementation-foundation`, configurează Cloudflare Workers Builds cu proiectul separat `travel-buddy-server-probe`. Înainte de publicare, verifică în formular că **Production branch** este `codex/implementation-foundation`. Dezactivează builds pentru branch-uri nonproduction și preview deployments automate, dacă aceste opțiuni sunt afișate. Dacă Production branch sau aceste opțiuni nu sunt clare, nu continua și trimite coordonatorului o captură a zonei de jos a formularului, ca să identifice setările înainte de publicare. Folosește Build command `npm run build:server-probe` și Deploy command `npx wrangler deploy --config probes/server/wrangler.console.toml`. Configurația conține numele Workerului, bindingul D1 `DB`, bindingul static assets `ASSETS` și rutarea `/probe/*`. Nu presupune că aceste modificări au fost deja trimise către GitHub: verifică mai întâi că branch-ul selectat conține commitul cu această configurație. Preview command-ul nu este definit pentru această configurare; lasă-l gol dacă permite formularul. Nu pune acolo `npm run preview:server-probe` sau comanda `wrangler deploy`.
3. După publicare, în **Workers & Pages → Worker → Settings → Variables and Secrets**, verifică variabilele `FIREBASE_PROJECT_ID`, `ALLOWED_UID_1` și `ALLOWED_UID_2` din configurație și adaugă `FIREBASE_WEB_API_KEY` ca Secret runtime. Nu este nevoie de `accountId` în configurația locală. Nu crea sau păstra chei private de service-account.
4. După ce cheia Web este setată ca Secret runtime, verifică URL-ul HTTPS al Workerului. Apoi, după autentificarea și confirmarea celor două conturi, descarcă SQL-ul demonstrativ din panou, deschide fila **Console** a aceleiași baze D1, lipește-l și rulează-l o singură dată. Inserțiile demonstrative nu se pot reaplica; nu le rula pe o altă bază și nu folosi o rută de resetare.

Înaintea oricărei publicări reale, verifică explicit că proiectele rămân pe planurile gratuite și că niciun pas nu cere card, facturare sau upgrade. Probele locale nu confirmă încă funcționarea reală a Firebase, D1 ori a Workerului publicat.

## Header-uri și identificatorul buildului

Buildul produce `dist-server-probe/_headers`, pe care Cloudflare Static Assets îl folosește pentru răspunsurile fișierelor publice. Acesta setează Content Security Policy și `X-Content-Type-Options: nosniff`. Ruta `/probe/*` rămâne trimisă Workerului prin `run_worker_first`, iar configurarea publică și API-urile păstrează propriile răspunsuri fără cache.

`vite preview` nu aplică regulile Cloudflare din `_headers`; testele locale ale interfeței nu confirmă header-ele HTTP ale găzduirii. După publicare, verificarea header-elor trebuie făcută pe răspunsul HTTPS real. Niciun Worker nu a fost publicat în această livrare.

Hash-ul din interfață și raport este un identificator al buildului calculat din codul consolei și al probei, schema SQL, configurația Worker/Vite, manifestul și lockfile-ul npm, setările TypeScript și toate fișierele TypeScript din `src/shared/contracts`. Nu este o dovadă de origine a exportului CPU sau a platformei Cloudflare și nu include documentația ori testele.

## Utilizare

Deschide URL-ul HTTPS al Workerului, autentifică pe rând cele două conturi și folosește **Trimite emailul de confirmare** numai când utilizatorul cere acel email. Firebase Console nu trimite automat emailul la crearea contului. După confirmarea adresei, autentifică din nou contul pentru a reîmprospăta starea. Apoi rulează verificările din panou. Descarcă și aplică SQL-ul demonstrativ numai în baza D1 nouă, după rularea schemei.

Raportul JSON cuprinde hash-ul sursei, rezultatele verificărilor și identificatorii de cereri furnizați de verificări. Nu ar trebui să conțină emailuri, UID-uri, parole, tokenuri sau corpuri de răspuns.

## Limite

E2E-ul local simulează răspunsurile Firebase și Worker prin rutare Playwright. Nu validează Firebase, Cloudflare, D1 real, Android sau Safari. P-01/P-02/P-09 și verificările reale de rollback, publicare și telefon rămân blocate până există configurația și accesul operatorului. Acest panou nu dovedește încă testele complete P1/P2/P9.

