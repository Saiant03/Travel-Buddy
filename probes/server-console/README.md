# Panou separat pentru probele serverului

Acesta este un instrument tehnic pentru Gate B1, nu aplicația Travel Buddy și nu demonstrează încă izolarea completă a datelor ori funcționarea în telefoane. El folosește Firebase Authentication pentru două conturi aprobate și un Worker/D1 separat. Panoul nu salvează date în browser și nu oferă o rută de administrare.

## Stare curentă — 2 noiembrie 2026

Emailurile Alpha și Beta sunt confirmate. Proba autentificată de acces a trecut **10/10**, iar CAS și retry au trecut **14/14**. Fixture-ul D1 a fost modificat de proba CAS de la versiunea 7 la versiunea 8. **Nu reseta fixture-ul, nu aplica din nou seed-ul SQL și nu relua automat accesul/CAS pe această stare.** Rezultatele, limitele și pașii rămași sunt în [jurnalul Alpha/Beta din 2 noiembrie](../../docs/operations/2026-11-02-alpha-beta-verification.md) și [remedierea loginului Alpha](../../docs/operations/2026-11-02-alpha-login-fix.md).

Pașii de setup de mai jos sunt notițe istorice, nu instrucțiuni curente. Pentru starea operațională folosește jurnalele legate mai sus. Raportul CPU a fost trimis, dar P-09 încă așteaptă metricile Cloudflare.

## Starea configurării

Email/Password este deja activat în Firebase. Configurația urmărită nu conține UID-urile aprobate sau alte valori private Firebase. Utilizatorul a confirmat că schema D1 este aplicată; captura din fila **Console** la adresa `/tables` afișează șase tabele. Nota istorică despre configurarea locală nu înseamnă că repo-ul actual conține configurația privată completă și nu confirmă starea remote-ului ori a Workerului.

## Pregătirea conturilor — notă istorică, nu relua

Pașii din această secțiune descriu setup-ul inițial. Conturile există deja și emailurile sunt confirmate; nu recrea conturi și nu trimite din nou emailuri de confirmare.

1. În Firebase Console, deschide proiectul Travel Buddy. Proiectul a fost creat, iar planul gratuit Spark a fost confirmat. ID-ul de proiect observat este `travel-buddy-b3f48`. Nu adăuga un card, nu activa facturarea și nu trece la Blaze.
2. La **Authentication → Sign-in method**, verifică **Email/Password**. Acest provider este deja activat; nu este nevoie să-l activezi din nou.
3. La **Authentication → Users**, verifică cele două conturi aprobate care au fost deja create; nu le recrea. Crearea conturilor nu trimite automat emailul de verificare. După ce autentifici fiecare cont în panoul probei, apasă **Trimite emailul de confirmare** doar când utilizatorul cere acel email; utilizatorul deschide mesajul primit, confirmă adresa, apoi se autentifică din nou.
4. În setările aplicației Web din proiect, identifică `projectId` și cheia web `apiKey`. ID-ul proiectului și UID-urile conturilor sunt identificatori, nu parole; coordonatorul îi poate primi pentru configurare. Cheia web Firebase este configurare publică a aplicației, dar introdu-o în setările Workerului din Dashboard, nu în chat. Nu trimite parole, tokenuri bearer sau chei private de service-account.
5. UID-ul fiecărui cont se vede în **Authentication → Users**. Introdu UID-urile numai în configurarea Workerului; Workerul nu le trimite browserului.

Furnizează `FIREBASE_PROJECT_ID`, `ALLOWED_UID_1` și `ALLOWED_UID_2` numai în **Cloudflare Dashboard → Workers & Pages → Worker → Settings → Variables and Secrets**, în mediul Workerului țintă. Setează `FIREBASE_WEB_API_KEY` separat ca **Secret runtime**. Nu pune aceste valori în repository, `wrangler.console.toml`, setările de build sau chat. Configurația din repository este incompletă intenționat: **nu rula `wrangler deploy` cu ea**. Un deploy este permis numai după ce configurația privată completă și toate bindings au fost furnizate și verificate pentru mediul țintă; dacă nu există o cale sigură de a păstra valorile prin deploy, oprește-te și cere coordonatorului o metodă aprobată. Până la configurarea completă, `GET /probe/public-config` trebuie să răspundă cu 503.

### Procedură istorică de păstrare a bindings

La o operațiune anterioară s-a folosit JSON Merge Patch pentru a crea o versiune Worker păstrând explicit bindings din versiunea inițială, cu codul și assets omise. Procedura este consemnată doar pentru continuitatea istoricului; nu se execută în această corectare și nu constituie aprobare pentru o nouă mutație Cloudflare. Orice deploy viitor trebuie să păstreze configurația privată existentă și bindings verificate; configurația incompletă din repo nu este suficientă.

## Pregătirea Cloudflare — notă istorică, nu relua

Instrucțiunile de mai jos documentează setup-ul inițial și sunt înlocuite de starea curentă și jurnalele operaționale de mai sus. Nu le folosi pentru a reface baza, seed-ul sau deploy-ul.

1. În Cloudflare Dashboard, deschide **Storage & databases → D1 SQL Database** și folosește baza nouă `travel-buddy-server-probe`, ID `b6deb718-ad18-43f8-8649-95e3ed861aaf`, dedicată acestei probe. Utilizatorul a confirmat schema aplicată; captura din fila **Console** la adresa `/tables` afișează șase tabele. Verifică în Dashboard că baza este pe planul Free înainte de publicare; captura disponibilă nu confirmă planul. Nu continua dacă alegerea cere plată sau poate activa billing. Nu rula migrarea din nou și nu folosi o bază cu date existente.
2. Înaintea oricărui deploy, verifică în Dashboard configurația privată completă și bindings pentru mediul țintă. Repo-ul singur nu conține valorile Firebase necesare: **nu folosi comanda `wrangler deploy --config probes/server/wrangler.console.toml` până când coordonatorul nu a verificat o metodă sigură care păstrează toate valorile private și bindings**. Dacă verificarea nu este posibilă, nu publica. Dacă deploy-ul va fi configurat ulterior în Workers Builds, verifică branch-ul și setările de preview înainte de a-l activa; comanda de deploy nu se copiază ca instrucțiune executabilă pentru configurația incompletă.
3. În **Workers & Pages → Worker → Settings → Variables and Secrets**, verifică `FIREBASE_PROJECT_ID`, `ALLOWED_UID_1` și `ALLOWED_UID_2` în mediul țintă și adaugă `FIREBASE_WEB_API_KEY` ca Secret runtime. Nu este nevoie de `accountId` în configurația locală. Nu crea sau păstra chei private de service-account.
4. Istoric, după setup, seed-ul SQL demonstrativ se aplica o singură dată. Acest pas a fost deja efectuat, iar proba CAS a avansat fixture-ul la versiunea 8. **Nu descărca și nu rula din nou seed-ul, nu reseta baza și nu relua testele care modifică fixture-ul.**

Orice publicare viitoare rămâne condiționată de verificarea planurilor gratuite și a metodei sigure de păstrare a configurației private. Testele locale nu validează Firebase/D1 real; rezultatele probelor reale Alpha/Beta și limitele lor sunt documentate în jurnalul din 2 noiembrie.

## Header-uri și identificatorul buildului

Buildul produce `dist-server-probe/_headers`, pe care Cloudflare Static Assets îl folosește pentru răspunsurile fișierelor publice. Acesta setează Content Security Policy și `X-Content-Type-Options: nosniff`. Ruta `/probe/*` rămâne trimisă Workerului prin `run_worker_first`, iar configurarea publică și API-urile păstrează propriile răspunsuri fără cache.

`vite preview` nu aplică regulile Cloudflare din `_headers`; testele locale ale interfeței nu confirmă header-ele HTTP ale găzduirii. După publicare, verificarea header-elor trebuie făcută pe răspunsul HTTPS real. Afirmația din nota inițială că Workerul nu fusese publicat descrie numai starea de atunci; vezi jurnalul curent Alpha/Beta pentru rezultate operaționale recente.

Hash-ul din interfață și raport este un identificator al buildului calculat din codul consolei și al probei, schema SQL, configurația Worker/Vite, manifestul și lockfile-ul npm, setările TypeScript și toate fișierele TypeScript din `src/shared/contracts`. Nu este o dovadă de origine a exportului CPU sau a platformei Cloudflare și nu include documentația ori testele.

## Utilizare — fluxul inițial, nu executa pe starea actuală

Pașii de mai jos descriu fluxul inițial și sunt păstrați ca referință. Conturile au fost confirmate, iar fixture-ul este la versiunea 8 după CAS. Nu relua probele pe acest fixture și nu reaplica SQL-ul demonstrativ.

Raportul JSON cuprinde hash-ul sursei, rezultatele verificărilor și identificatorii de cereri furnizați de verificări. Nu ar trebui să conțină emailuri, UID-uri, parole, tokenuri sau corpuri de răspuns.

## Limite

E2E-ul local simulează răspunsurile Firebase și Worker prin rutare Playwright; nu validează serviciile reale. Pentru rezultatele reale Alpha/Beta, consultă jurnalul din 2 noiembrie. P-09 rămâne fără verdict până la recuperarea metricilor Cloudflare; verificările de rollback, telefon și testele mai ample ale produsului au propriile condiții și nu sunt închise de probele 10/10 și 14/14.
