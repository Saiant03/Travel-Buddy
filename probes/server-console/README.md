# Panou separat pentru probele serverului

Acesta este un instrument tehnic pentru Gate B1, nu aplicația Travel Buddy și nu demonstrează încă izolarea completă a datelor ori funcționarea în telefoane. El folosește Firebase Authentication pentru două conturi aprobate și un Worker/D1 separat. Panoul nu salvează date în browser și nu oferă o rută de administrare.

## Pregătirea conturilor

1. În Firebase Console, deschide proiectul Travel Buddy. Proiectul a fost creat, iar planul gratuit Spark a fost confirmat. ID-ul de proiect observat este `travel-buddy-b3f48`. Nu adăuga un card, nu activa facturarea și nu trece la Blaze.
2. La **Authentication → Sign-in method**, activează **Email/Password**.
3. La **Authentication → Users**, creează manual exact cele două conturi aprobate. Crearea conturilor nu trimite automat emailul de verificare. După ce autentifici fiecare cont în panoul probei, apasă **Trimite emailul de confirmare** doar când utilizatorul cere acel email; utilizatorul deschide mesajul primit, confirmă adresa, apoi se autentifică din nou.
4. În setările aplicației Web din proiect, identifică `projectId` și cheia web `apiKey`. ID-ul proiectului și UID-urile conturilor sunt identificatori, nu parole; coordonatorul îi poate primi pentru configurare. Cheia web Firebase este configurare publică a aplicației, dar introdu-o în setările Workerului din Dashboard, nu în chat. Nu trimite parole, tokenuri bearer sau chei private de service-account.
5. UID-ul fiecărui cont se vede în **Authentication → Users**. Introdu UID-urile numai în configurarea Workerului; Workerul nu le trimite browserului.

În **Cloudflare Dashboard → Workers & Pages → Worker → Settings → Variables and Secrets**, configurează `FIREBASE_PROJECT_ID`, `FIREBASE_WEB_API_KEY`, `ALLOWED_UID_1` și `ALLOWED_UID_2`. Configurația lipsă, demonstrativă, invalidă sau cu UID-uri identice rămâne închisă și răspunde cu 503. Workerul trimite browserului numai `projectId` și cheia web.

## Pregătirea Cloudflare

1. În Cloudflare Dashboard, deschide **Storage & databases → D1 SQL Database** și creează o bază nouă dedicată acestei probe, pe planul Free. Numele și ID-ul bazei sunt valori de configurare, nu parole; transmite numele și ID-ul coordonatorului ca să înlocuiască placeholder-ul din `probes/server/wrangler.console.toml`. Nu folosi o bază cu date existente.
2. Creează Workerul separat `travel-buddy-server-probe`. În **Settings → Variables and Secrets**, configurează cele patru valori Firebase de mai sus. Nu crea sau păstra chei private de service-account.
3. În Dashboard, deschide baza D1 dedicată și fila **Console**. Copiază conținutul `probes/migrations/0001_probe.sql` în editor și rulează-l o singură dată pentru a crea schema. Apoi, după autentificarea și confirmarea celor două conturi, descarcă SQL-ul demonstrativ din panou, revino în aceeași filă **Console**, lipește-l și rulează-l o singură dată. Inserțiile demonstrative nu se pot reaplica; nu le rula pe o bază existentă și nu folosi o rută de resetare.
4. Din branch-ul de implementare `codex/implementation-foundation`, folosește comanda de build `npm run build:server-probe` și configurația Worker `probes/server/wrangler.console.toml`. Publicarea și verificarea URL-ului se fac numai după ce coordonatorul a completat ID-ul bazei și valorile reale din configurarea Workerului.

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
