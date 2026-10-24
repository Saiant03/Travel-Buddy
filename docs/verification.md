# Raport de verificare a fundației

## Snapshot integrat local — 2026-10-24

**PASS local:** 111/111 teste în 12 fișiere, `npm run typecheck`, `npm run lint`, 7/7 teste Playwright Chromium și compilare Worker Wrangler cu `--dry-run`. E2E pornește de trei ori shell-urile ca servere pentru scenarii; testele consolei acoperă cinci fluxuri UI cu Firebase simulat. [Logurile complete](evidence/2026-10-24/README.md). Testele, tipurile și lint-ul nu contactează Firebase sau Cloudflare.

Snapshotul adaugă consola server pentru probe: conectare email/parolă prin Firebase REST, tokenuri păstrate numai în memorie, două sesiuni cu UID distinct, trimitere explicită email de verificare, verificări de acces și competiție CAS/idempotency, dispatch CPU fără estimări și SQL fixture insert-only. Răspunsul public de configurare ascunde lipsurile și UI-ul rămâne indisponibil fără configurare reală. SQL-ul de seed este doar generat local; niciun D1 nu a fost populat de acest snapshot.

Reviewul independent gpt-6.1-sol a închis ICR-01–05, iar coordonatorul a integrat corectările. Domeniile reverificate: rezultat CAS cu exact un câștigător și un conflict; invalidarea cererilor și a rezultatelor după sign-out inclusiv în timpul parsării body-ului; respingerea răspunsurilor cacheabile; timeout/headers pentru preluarea configurației; CSP și rutele assets. Logul de dry-run confirmă valorile placeholder pentru proiect, cheie, UID-uri și D1. Nu este deploy.

Firebase Console arată proiectul TravelBuddy (`travel-buddy-b3f48`), Spark și Email/Password activ. Conturile/UID-urile reale aprobate pentru probe, cheia web și D1 nu sunt încă stabilite/verificate în acest snapshot. [Diagnosticul conectării Firebase](evidence/2026-10-24/firebase-connection.md) a confirmat pluginul activ, lipsa unei conexiuni MCP/CLI autentificate și oprirea loginului înainte de OAuth la `auth.firebase.tools/attest`. Nu s-a produs un link de autorizare; nu atribuim testelor simulate statut de autentificare reală.

**Limite:** nu s-au făcut apeluri Firebase, D1 remote sau măsurători CPU Cloudflare; nu s-a publicat consola Worker și nu s-a activat billing. Gate B1 rămâne blocat înainte de Tasks 2+: P-01/P-02/P-09 reale și P12-A Android lipsesc. P12-A iPhone este PASS manual doar cu fixture sintetic. Acest snapshot nu reprezintă acceptarea MVP-ului complet.

## Starea accesului și P12-A — actualizare după publicare
Utilizatorul a autorizat activarea serviciilor gratuite și publicarea necesară proiectului. Autorizarea nu este probă de acces și nu permite billing, card sau upgrade automat. Gate B1 rămâne blocat până la probe Firebase/D1/CPU reale și verificarea Android; rezultatul manual P12-A pe iPhone este limitat la fixture-ul sintetic.

- Commitul `c85e075ccb171dbcdc71bb3e8990563dada27b69` a fost împins pe `codex/implementation-foundation`.
- Mediul: `observations_current:true`; rețea `restricted/enforced`; `network_policy.allowed_hosts=[]`; zero secrete, variabile runtime și identități externe. `api.cloudflare.com` lipsește din politica permisă; accesul la hostul refuzat nu a fost încercat.
- Utilizatorul a confirmat că a creat contul Cloudflare. Nu este confirmată verificarea emailului sau planul gratuit. Wrangler 4.152.0 `whoami` a ieșit cu cod 0 și mesajul explicit „You are not authenticated”; sesiunea/API nu este autentificată.
- Pluginul oficial Firebase este instalat, iar catalogul afișează skill-uri Firebase. Nu este disponibilă nicio unealtă Firebase apelabilă în `ALL_TOOLS`; pluginul și skill-urile nu dovedesc autentificarea.
- Diagnostic Firebase CLI izolat: `firebase-tools` 15.34.1 instalat numai în `/tmp` cu `--ignore-scripts`. `login:list --non-interactive` a ieșit cu cod 0 și „No authorized accounts”; varianta `--json` a returnat numai `{status:success}`, fără conturi. `projects:list --non-interactive --json` a ieșit cu cod 1 și „Failed to authenticate, have you run firebase login?”. CLI este neautentificat. Politica de rețea enforced nu permite hosturile Firebase; acesta este un blocaj separat, fără apel Firebase API reușit demonstrat. Fără login interactiv/deploy/billing și fără citire de chei.
- Utilizatorul a raportat încheierea pașilor de creare a contului Cloudflare; nu se mai cere crearea contului. Verificarea emailului și planul gratuit rămân neconfirmate. Referințe oficiale: [creare cont](https://developers.cloudflare.com/fundamentals/account/create-account/) și [înscriere](https://dash.cloudflare.com/sign-up). Planul Firebase Spark: https://firebase.google.com/pricing.
- Dashboard-ul arată versiunea `ec7c9c50` Ready după 48 secunde și aceeași versiune ca Active deployment. Cardul arată simultan trafic 0% și bară 100%; nu tragem concluzie despre distribuția traficului. Intrările Ready vechi marcate manual nu sunt atribuite acestui commit.
- Utilizatorul a deschis URL-ul [P12-A](https://travel-buddy-offline-probe.saiuantonio.workers.dev/) în browserul său desktop Windows Chrome. Captura arată titlul „Proba locală P12-A”, service worker activ, browser online, lipsa unei copii locale salvate și fotografia indisponibilă; aceasta a precedat verificarea de pe iPhone.
- **PASS MANUAL USER — P12-A pe iPhone, fixture sintetic:** utilizatorul a raportat iPhone 14 Pro Max / iOS 27.0.1. Capturile 11:37, 11:40 și 11:42 arată salvarea online a reviziei 1 cu fotografia sintetică (7641 bytes citiți din IndexedDB), apoi redeschiderea offline cu service worker activ și aceeași revizie/fotografie, apoi simularea update-ului întrerupt cu revizia 1 încă activă. Utilizatorul a confirmat închiderea completă din aplicațiile recente și redeschiderea din icon înaintea probei offline. Ora `2026-10-22T00:00:00Z` din mesajul de stare este fixture fix, nu timpul real salvării. Capturile sunt manuale, nu automatizate/independente și nu acoperă aplicația privată sau Task 11 complet; detaliile sunt în [phone-probe-progress.md](evidence/2026-10-23/phone-probe-progress.md).
- Unealta web a coordonatorului a returnat „URL not accessible via this tool”. Nu avem verificare remote independentă; răspunsul uneltei nu dovedește eșecul site-ului. Capturile și limitele lor sunt consemnate în [phone-probe-progress.md](evidence/2026-10-23/phone-probe-progress.md).
- Mediul local rămâne `restricted/enforced`, fără secrete/runtime variables; Wrangler CLI nu este autentificat automat prin setările browserului. Nu s-au făcut probe reale Firebase, D1 sau CPU. P12-A pe Android rămâne neexecutată, iar Android nu este confirmat disponibil. Gate B1 rămâne blocat. Starea de deploy de mai jos din snapshoturile anterioare este istorică și înlocuită de această actualizare.
- Nu s-au repetat cele 75 teste sau 2 E2E desktop pentru această actualizare. Manifestul istoric este păstrat: 66/68 hashuri identice; diferențele sunt numai `probes/README-server.md` și `probes/offline/README.md`, actualizate documentar. Codul și testele sunt neschimbate; `.node-version` nou a fost verificat prin build. Nu s-au rulat teste de aplicație, creat conturi de către agenți, autentificat servicii sau activat servicii. Deploy-ul observat a fost făcut din contul utilizatorului, nu de agenți.

Vezi [detaliile de acces](cloud-access.md) și [dovezile de stare](evidence/2026-10-23/access-status.md). Raportul local existent mai jos păstrează contextul snapshotului său; referințele de hash din el sunt istorice și nu trebuie citite drept verificarea curentă a branch-ului.

### Reviewul documentar — snapshotul anterior

Reviewul documentar anterior a confirmat `git diff --check` și 62 de legături locale valide în cele 8 fișiere Markdown schimbate în acel snapshot; nu au rămas defecte blocante în scope-ul său. Două sarcini gpt-6-luna au fost separate atunci: diagnosticarea CLI în `/tmp` și actualizarea documentației. Limitele reale de acces și blocarea Gate B1 persistă.

### Reviewul documentar — snapshotul anterior de pregătire Pages

Acest snapshot consemnează ruta Pages pregătită atunci; configurația curentă pentru wizardul Worker și dovada locală sunt descrise mai sus. Publicarea și verificările reale pe telefoane rămân neexecutate.

## Execuție Tasks 0–1b — snapshot anterior, 2026-10-23

GitHub `main` verificat prin integrarea GitHub și `git fetch`/`ls-remote`: `11e72f96bc93c84ecf0e8c85f26d3fb0c965361e`. Workspace-ul era la `34df3db`; fast-forward fără schimbări locale de suprascris. Lucrul este pe `codex/implementation-foundation`, fără modificarea fișierelor skill-urilor instalate. Inventarul cloud/executor și `docs/skills.md` au fost consultate; cele 24 de skill-uri locale nu au fost reinstalate.

### Task 0 și Task 1 — verificate local

- Implementare și remedieri delegate efectiv către gpt-6-luna, pe fișiere distincte; review independent gpt-6.1-sol și verificarea coordonatorului. Skill-uri aplicate: `travel-buddy-engineering`, `test-driven-development` pentru comportamente, `travel-buddy-review`, `code-review-and-quality`, `webapp-testing` pentru browser. Cloud runtime a ghidat accesul/rețeaua; nu au fost folosite skill-uri vizuale pentru o nouă explorare.
- Task 0: React/TypeScript strict/Vite, Vitest/ESLint/Playwright, manifest și icoane originale, service worker care precachează numai resursele shell-ului public. Cache-ul este versionat după conținut; query/Authorization/API sunt excluse. Build și enumerarea E2E au trecut. La inițializare au trecut și comenzile cu zero teste; după adăugarea contractelor au existat eșecuri temporare declarate, până la implementarea lor.
- `npm run test -- tests/unit/contracts`: **32/32 PASS**, inclusiv execuția migrației SQL cu `node:sqlite`, fără a o prezenta drept D1 real. Root wire strict: versionare, validare, două conturi/membership, vocabularul preferințelor, job, propunere/receipt, manifest complet și snapshot cu owner/limbă/calendar/baze.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- tests/e2e/shell.spec.ts`: **1/1 PASS** la autor și independent. Prima vizită online → SW activ/control → pagină nouă fără rețea, fără reîncărcare online intermediară; testul verifică și excluderile cache. Este browser Chromium desktop real, nu telefon și nu aplicația privată completă.
- Test de regresie demonstrat: eliminarea temporară a bundle-ului din precache a făcut testul shell offline să eșueze; restaurarea byte-exact a configurației și build-ul complet au readus PASS. Configurația mutată nu a rămas în repository. `ignoreVary` rezolvă `Vary: Origin` al preview-ului numai în cache-ul exact al shell-ului public.

| ID | Constatare și remediere reverificată |
|---|---|
| CR-01–CR-03 | Manifest explicit pentru fiecare loc, date/baze corelate cu Trip, conținutul și serializarea checksumului definite înainte de parser. Închise documentar de reviewer. |
| F-01–F-05 | Precache complet la prima instalare, build+preview E2E, discovery probes, cache namespace/await claim, test fără încălzire prin reload online. Reverificate independent prin citire și browser. |
| D-01–D-04 | Trip complet persistent; itinerariu absent permis la creare; SQL respinge schemaVersion lipsă/null; răspunsuri de preferințe tipizate. Teste contractuale și SQLite trecute. |
| DRev-01–DRev-02 | Nota de rezervare acceptă text; geometria nu moștenește plafonul textului utilizatorului de 4.000 caractere. Testele au fost RED înainte de remediere și apoi GREEN, repetate independent. |

O primă instalare npm a rulat înaintea adăugării `.npmrc`, cu lifecycle scripts implicit permise; output-ul nu dovedește ce hooks au rulat. Coordonatorul a verificat ulterior instalarea curată cu `npm ci --ignore-scripts` și cache temporar, fără modificarea lockfile-ului. Auditul final raportează zero vulnerabilități.

### Task 1b și verificarea integrată finală

**PASS local:** typecheck, lint inclusiv sursele probelor, **75/75 teste**, build-ul shell-ului, build-ul separat al mini-probei offline, **2/2 E2E Chromium** și compilarea Worker prin `wrangler --dry-run`. [Comenzile, versiunile, hashurile surselor și logurile](evidence/2026-10-23/README.md) sunt păstrate în repository. Dry-run nu a publicat Worker-ul. Instalarea curată nu a activat scripturile lifecycle ale dependențelor. Avertismentele Rollup și problemele de directoare temporare ale mediului sunt consemnate în dovezi, fără a le prezenta drept PASS înainte de remediere.

Probele server folosesc chei RSA/X.509 generate local și SQL executat în SQLite printr-un adaptor D1 asincron; concurența și erorile sunt simulate controlat. Confirmarea strictă respinge patch/UID din client, păstrează membership înaintea receipt-ului și întoarce același receipt pentru retry. O aserțiune în batch forțează rollback pentru UPDATE reușit fără receipt; aserțiunea este condiționată de nonce/versiune, astfel încât un UPDATE pierdut într-o cursă să producă 409, nu 500. Modificarea preferințelor este verificată și prin reviziile curente ale profilurilor.

Mini-proba offline salvează fixture-ul și fotografia sintetică în IndexedDB. E2E închide complet Chromium și repornește același profil fără rețea; fotografia este citită local și un update incomplet păstrează revizia veche. Nu sunt validate Safari/iOS sau Android. P-09 are dispatcher bounded, corelare prin request IDs și evaluator de date sintetice; nu a fost măsurat CPU real și nu s-a apelat un endpoint extern.

Reviewul final gpt-6.1-sol a închis **BRev-01** (cursa CAS trebuia 409, nu 500) și **BRev-02** (instrucțiunea probei trebuia build+preview). Autorii gpt-6-luna au corectat, reviewerul a repetat verificările și coordonatorul a rulat verificarea integrată. Mutația controlată a protecției `tripId` a fost detectată de test, iar fișierul restaurat exact. Fără defecte blocante locale rămase în scope; fără acceptare funcțională a MVP-ului complet.

### Gate B1 — încă BLOCAT

P-01 cu Firebase real, P-02 pe D1 API real, P-09 cu CPU măsurat de Cloudflare Workers Free și P-12-A pe iOS/Safari + Android nu au fost executate în acel snapshot. Autorizarea gratuită/publicării a fost dată ulterior; starea curentă de acces este la începutul acestui raport. Nu există p50/p95 CPU real și nu se deduce din timpul local. Tasks 2+ rămân oprite la gate; fotografiile exacte Lisabona rămân de recuperat.

**Data:** 2026-10-22

## Dovezi pentru fundația inițială (4 skill-uri)

- Skill-ul Impeccable instalat la commit `8644175285360c166e57b1e35ecadfbc85ff5209`; inventarul conține 64 de fișiere, inclusiv `LICENSE` și `NOTICE.md`.
- Skill-ul Taste instalat la commit `6010f91a9935f1c167dfc500fb1a475681892e6b`; inventarul conține 39 de fișiere, inclusiv `LICENSE`.
- Au fost instalate două skill-uri proprii, câte un fișier fiecare.
- `skills-lock.json` a fost generat. Hash-urile SHA256 au fost recalculate pentru toate cele 105 fișiere din inventarul celor patru skill-uri (103 upstream și 2 proprii).
- Profilele `.codex/agents/tb-implementer.toml` (`gpt-6-luna`, efort `medium`) și `.codex/agents/tb-reviewer.toml` (`gpt-6.1-sol`, efort `high`) au fost parsate cu Python `tomllib`; câmpurile obligatorii au fost verificate.
- Frontmatter-ul celor patru skill-uri a fost verificat pentru delimitatori, `name`, `description` și codare UTF-8. Nu s-a folosit un parser YAML complet.

## Validator și review

- Validatorul oficial `quick_validate.py` a fost încercat, dar nu a rulat cu succes: `ModuleNotFoundError: yaml` (PyYAML lipsește). Verificările alternative din biblioteca standard nu sunt echivalente cu validarea YAML completă.
- Un review independent a raportat la un snapshot intermediar R1: lipsea `skills-lock.json`, și R2: lipsea `docs/verification.md`.
- R1 a fost remediat de coordonator; manifestul există și a fost verificat. Acest raport remediază R2.
- Reverificarea independentă confirmă că R1 și R2 sunt rezolvate; inventarul și toate cele 105 hashuri au fost verificate și prin PowerShell `Get-FileHash`, fără nepotriviri. Nu au rămas constatări acționabile în documentele reverificate.
- Coordonatorul a recitit documentele și rolurile și a verificat final existența celor 10 documente/manifest, cele patru skill-uri, inventarul complet, toate hashurile și parsarea celor două profiluri TOML. Verificările structurale au trecut; acceptarea utilizatorului rămâne deschisă.

## Limite cunoscute

- Nu s-au rulat build-ul aplicației sau teste în browser; aplicația încă nu există.
- Utilitarele upstream și hook-urile nu au rulat.
- Descoperirea rolurilor într-o sesiune nouă nu a fost verificată.
- Nu s-a efectuat audit de securitate pentru proiectele upstream.
- Profilele de agent sunt salvate local; acest lucru nu confirmă o configurare globală și nu schimbă modelul principal.

## Extinderile solicitate — inventarul curent (2026-10-22)

- **24 de skill-uri, 237 de fișiere** în `.agents/skills/`, inventariate în `skills-lock.json`. Toate hashurile SHA256 și inventarul complet au fost recalculate și verificate după instalare și adaptare.
- Cele 105 fișiere ale celor patru skill-uri inițiale au fost comparate cu manifestul anterior: niciunul nu a fost schimbat. Impeccable nu a fost duplicat sau actualizat.
- Au fost instalate Anthropic Frontend Design, UI/UX Pro Max, Vercel Web Design Guidelines, toate cele opt module GSAP, Grill Me, Writing PRD, Improve Codebase Architecture, Writing Plans, TDD, Webapp Testing, Code Review and Quality și Using Git Worktrees, plus Caveman.
- Pentru toate cele 24 de manifeste au fost verificate delimitarea frontmatter-ului, câmpurile `name`/`description`, identitatea numelui și citirea UTF-8. Verificările nu constituie o validare YAML completă; limita PyYAML de mai sus rămâne valabilă.
- Pentru cele zece manifeste adaptate este păstrat `SKILL.upstream.md`. Sursele, commiturile fixe și adaptările sunt înregistrate în manifest. Licențele disponibile au fost păstrate; Vercel nu avea fișier separat de licență în directoarele verificate.
- Checklisturile de securitate și performanță folosite de review au fost incluse din același commit upstream, iar legăturile locale au fost adaptate.
- UI/UX Pro Max: căutarea locală `keyboard focus --domain ux --json` a trecut și a returnat trei rezultate. Generarea `travel planning --design-system --json` a trecut; rezultatul nu a fost salvat și nu reprezintă o direcție de design aprobată.
- Webapp Testing: comanda `with_server.py --help` a trecut. Pythonul verificat nu are modulul Playwright. Nu s-au instalat Playwright sau browsere și nu s-au rulat teste de browser; aplicația încă nu există. Instalarea runtime-ului rămâne pentru etapa în care este necesară testarea site-ului.
- Cele două profiluri de agenți au fost parsate din nou cu `tomllib`.
- Preferința explicită pentru explicații simple în română este salvată în `AGENTS.md`, `docs/memory.md` și `docs/process.md`. Caveman este limitat local la comunicarea tehnică dintre agenți.
- Nu au fost pornite hooks, proxy-uri, servicii sau worktrees și nu au fost publicate issues ori PR-uri prin această instalare. Nu s-a inițializat Git.
- Reviewul independent al extinderilor a confirmat 24 de directoare/skill-uri și 237 de fișiere, fără fișiere lipsă/suplimentare și fără hashuri nepotrivite. Nu a identificat constatări acționabile în instrucțiunile și documentele revizuite. Verificarea a acoperit explicit Caveman, documentele locale, delegarea și verificările proporționale; nu reprezintă audit complet upstream sau testarea unei aplicații.
- Coordonatorul a verificat și cele 16 căi explicite către skill-uri din `AGENTS.md`, linkurile locale necesare reviewului/arhitecturii, eliminarea comenzilor de publicare din manifestele adaptate și înlocuirea dependențelor Superpowers de execuție cu procesul local. Toate aceste verificări au trecut.

## Brief și fezabilitate — 2026-10-22
- Coordonatorul a citit AGENTS.md, memory.md inclusiv predările, product.md, plan.md, process.md și decisions.md. A aplicat write-a-prd doar pentru consolidare, fără reluarea interviului.
- Trei agenți gpt-6-luna au cercetat separat hosting/date, căutare/generare și hărți/offline. Fișierele au fost editate numai de coordonator.
- product.md a fost verificat față de lista inițială: păstrează cele două conturi, trei limbi, personalizarea detaliată, refuzul explicit, regulile alimentare, bazele multiple, orele opționale, itinerariul flexibil, confirmarea schimbărilor, harta cu traseu, offline și limitele primei versiuni. Întrebările depășite au fost înlocuite cu deciziile realmente deschise.
- feasibility.md documentează surse oficiale actuale și separă oferte, concluzii și propuneri. Coordonatorul a reverificat direct condițiile decisive Tavily, Groq, Cloudflare, Firebase, Supabase, Gemini, Geoapify, OSM, HeiGIT, MDN și WebKit.
- Corecții în urma verificării: cifrele vechi ORS nu sunt prezentate ca actuale; termenii Gemini pentru utilizatorii SEE sunt incluși; transportul public rămâne candidat fezabil prin Geoapify, cu acoperire neuniformă. Aceste corecții au fost retrimise agenților și reverificate înainte de integrare.
- Au fost sincronizate planul, memoria și deciziile. Ultima predare de la finalul memory.md o înlocuiește pe cea istorică.
- Neexecutate: crearea de conturi/chei, apeluri API autentificate, teste de calitate/consum, site, browser/telefon, verificare de securitate a unei aplicații. Nu există implementare testată și nu s-au activat servicii.
- Probleme/decizii rămase: cotele efective pe conturi, calitatea surselor și traducerilor, fotografii lipsă, rute de transport public în destinațiile reale, eventualele hărți offline și acceptarea compromisurilor. Nu sunt blocaje pentru predarea cercetării; împiedică promisiunea funcționării complete.

## Buddy — verificări planificate în site-ul funcțional (2026-10-22)
**Stare: neexecutate.** Utilizatorul a aprobat aspectul machetei conversației și a cerut evaluarea clarității în etapa de verificare, când site-ul este funcțional. Aprobarea vizuală nu este dovadă de funcționare sau utilizabilitate.

Scenarii de urmărit în browser, inclusiv pe telefon și cu cele două conturi:
1. La o cerere de eliminare/înlocuire, utilizatorul poate identifica din rezumat ce se schimbă, ce se păstrează și ordinea propusă. Planul confirmat rămâne neschimbat până la confirmare.
2. Confirmarea unei singure persoane aplică numai modificările din rezumat, păstrând celelalte locuri alese. Continuarea conversației pentru ajustări nu aplică implicit propunerea.
3. Dacă celălalt cont modifică planul înainte de aplicare, propunerea veche nu suprascrie planul actual. Se păstrează cererea neaplicată, se afișează „Planul a fost modificat între timp” și se prezintă rezumatul adaptat pentru reconfirmare.
4. Modificarea făcută de celălalt rămâne în propunerea adaptată; reconfirmarea aplică cererea pe planul actual. Actualitatea se verifică și la aplicare, conform regulii existente.
5. În evaluarea cu utilizatorul, se verifică dacă diferența dintre „propus”, „necesită reconfirmare” și „aplicat” este înțeleasă, iar mesajele și butoanele se ajustează după observații.

Rezultatele și dovezile se consemnează după executare. Nu s-a implementat sau publicat site-ul prin această actualizare.

## Copia offline — verificări planificate în site-ul funcțional (2026-10-22)
**Stare: neexecutate.** Macheta arată trei stări de design; funcționarea și claritatea se verifică pe telefoane reale, după implementare.
1. Salvarea manuală produce o copie completă pe telefonul respectiv, în limba aleasă în cont, cu data reală a salvării. Celălalt telefon își salvează separat propria copie.
2. Cu internetul oprit se pot consulta toate zilele, ordinea locurilor și informațiile salvate, inclusiv imaginile disponibile, cazările și sugestiile păstrate. Harta, linkurile externe și recomandările/conversațiile noi indică necesitatea internetului.
3. O schimbare detectată online în planul comun arată actualizarea disponibilă. Copia salvată nu este înlocuită până la actualizarea manuală reușită; datele afișate corespund copiei efectiv disponibile.
4. Întreruperea unei actualizări păstrează ultima copie completă, cu data și conținutul ei, fără amestec cu o salvare parțială. Planul salvat rămâne accesibil; reîncercarea depinde de disponibilitatea conexiunii.
5. Dacă prima salvare eșuează și nu există o copie completă anterioară, interfața nu declară fals „Plan salvat”. Se verifică și eșecurile de stocare, nu numai întreruperea rețelei.
6. Schimbarea limbii salvate necesită internet și actualizarea copiei, conform regulii aprobate. Verificarea pe dispozitive include limitele reale ale stocării browserului.

Rezultatele și dovezile se adaugă după executare; nu există încă o implementare offline testată.

## Crearea vacanței — verificări planificate în site-ul funcțional (2026-10-23)
**Stare: neexecutate.** Macheta este statică; se verifică ulterior pe telefon și în browser:
1. Destinația poate fi combinată cu o perioadă sau doar cu numărul de zile, conform cerinței. Intervalul și numărul de zile sunt consecvente; se resping datele finale anterioare celor inițiale.
2. Se pot combina modurile de transport, iar rezumatul și generarea primesc exact selecțiile făcute.
3. Cazarea și orele de sosire/plecare sunt opționale; lipsa lor sau a bugetului nu blochează generarea. Cazările multiple și bazele pe perioade rămân posibile, fără pierderea datelor introduse.
4. Revenirea între pași păstrează valorile introduse. Rezumatul reflectă valorile curente și permite corectarea lor înainte de generare.
5. Generarea respectă condiția deja aprobată pentru preferințele fiecăruia: toate cele cinci categorii parcurse, cu o preferință sau „Nu am preferințe speciale aici”. Alergiile și intoleranțele rămân opționale. Starea ambelor profiluri este reală.
6. Ajustările de preferințe pentru o vacanță sunt distincte de profilul obișnuit, iar fiecare cont își ajustează propriile preferințe.
7. Generarea pornește din butonul final și trece în ecranul de progres aprobat; parcursul și mesajele sunt evaluate cu utilizatorul în site-ul funcțional.

## Conceptul „Bilet, bagaj, pașaport” — verificări ulterioare (2026-10-23)
**Stare: neexecutate; scenele a doua și a treia aprobate vizual; noul titlu al scenei a doua aprobat explicit.** Scenariile de creare deja planificate rămân valabile.
- Se verifică dacă orașul/datele editabile și selecția jetoanelor sunt descoperite și înțelese pe telefon.
- Selectarea și deselectarea fiecărui mod de transport funcționează prin atingere și prin controale accesibile, cu stare perceptibilă și fără tragere obligatorie.
- Elementele decorative și mișcarea nu împiedică citirea rezumatului, completarea opționalelor sau revenirea la alegeri.
- Varianta cu mișcare redusă păstrează toate acțiunile și stările. Nicio animație nu pornește generarea înainte de acțiunea explicită finală.
- Pentru etapa transport/cazare se verifică înțelegerea titlului „Cum explorăm și unde stăm?” și a jetoanelor; experiența nu trebuie confundată cu o listă de bagaje, observație ridicată de utilizator pe prima formulare.

## Preferințe alimentare — verificări ulterioare (2026-10-23)
**Stare: neexecutate; carnetul de gusturi aprobat vizual.**
1. Căutarea și grupele permit alegerea alimentelor, preparatelor și băuturilor exacte; inventarul poate fi extins fără confundarea unui ingredient cu toate preparatele sale.
2. Fiecare element are cel mult unul dintre cele patru răspunsuri aprobate. Trecerea între răspunsuri și salvarea/reîncărcarea păstrează alegerea corectă.
3. Un element necompletat rămâne necunoscut; nu este transformat automat în preferință sau refuz. Completarea poate fi graduală.
4. Precizările crud/gătit și textul propriu rămân asociate alimentului corect. Excepțiile explicite sunt respectate când există informații despre preparat; informațiile lipsă se marchează de verificat.
5. Gusturile, alimentele refuzate și alergiile/intoleranțele sunt distincte; răspunsul „Nu mănânc” nu creează o alergie.
6. Fiecare cont își editează propriile preferințe. Ajustarea pentru o vacanță este distinctă de profilul obișnuit, conform regulii aprobate.
7. „Nu am preferințe speciale aici” este o alegere explicită pentru categoria curentă; nu declară toate alimentele acceptate. Condiția inițială de parcurgere a celor cinci categorii nu cere evaluarea fiecărui aliment.
8. Se verifică pe telefon lizibilitatea ștampilelor, atingerea și navigarea accesibilă; informația nu depinde numai de culoare, gesturi speciale sau simboluri.

## Preferințe „Atracții și cultură” — verificări ulterioare (2026-10-23)
**Stare: neexecutate; machetă vizuală neaprobată.**
1. Grupele, căutarea și subtipurile permit alegeri individuale; aprecierea unui tip de muzeu nu marchează automat toate muzeele ca preferate.
2. Cele patru răspunsuri sunt exclusive pentru elementul ales și se păstrează la salvare/reîncărcare. Disponibilitatea fără interes propriu rămâne distinctă de refuz.
3. „Nu vreau deloc” declarat de oricare persoană exclude activitatea din planul comun, inclusiv când celălalt o preferă. Nu se propune implicit timp separat.
4. Participarea fără interes permite recomandarea pentru interesul celuilalt, respectând alternarea priorităților și celelalte limite aprobate.
5. Precizarea opțională se păstrează la elementul corect, fiecare cont își editează propriile preferințe, iar profilul și ajustările pentru vacanță rămân distincte.
6. „Nu am preferințe speciale aici” și stările necompletate nu sunt confundate cu refuzuri explicite; condiția parcurgerii celor cinci categorii rămâne cea aprobată.
7. Se verifică pe telefon lizibilitatea etichetelor lungi, selectarea prin atingere/controale accesibile și înțelegerea diferenței dintre interes, participare și refuz.

## Pregătirea implementării — 2026-10-23

### Verificări documentare efectuate
- Coordonatorul a citit cele zece documente cerute și inventarul skill-urilor. Copia inițială din workspace era mai veche; cele zece fișiere au fost recuperate prin conexiunea GitHub și hash-urile lor au fost comparate cu arborele `10eee6b80325ec7867796bca49b267ee59396131`: toate corespund aceleiași versiuni remote.
- Arborele GitHub conține cele 16 PNG-uri din galeria machetelor. Ele nu sunt prezente în copia locală; nu s-a pretins inspecție vizuală a PNG-urilor și nu au fost produse machete suplimentare.
- Au fost folosiți efectiv patru agenți `gpt-6-luna` pentru design/componente/imagini, arhitectură, probe și planul execuției, pe fișiere distincte. Reviewul independent dificil este realizat de un agent `gpt-6.1-sol`; remedierea aparține autorilor. Coordonatorul păstrează verificarea integrată finală.
- Skill-uri aplicate prin citire și execuția instrucțiunilor relevante: `writing-plans` (structură, interfețe, pași, self-review), `travel-buddy-engineering` (granițe/date/persistență), `travel-buddy-review` și `code-review-and-quality` (coerență, defecte, reverificare), `design-taste-frontend`, `frontend-design` și `impeccable` (reguli/componente/accesibilitate), `webapp-testing` numai pentru proiectarea verificărilor viitoare. Skill-ul cloud runtime a fost aplicat pentru politica rețelei și acces; nu a fost rulat un browser.
- Metadatele și licența Bricolage Grotesque au fost verificate în repository-ul oficial Google Fonts: SIL OFL 1.1 și Latin/Latin-ext. Nu s-a distribuit fontul și nu s-au verificat încă fișierul WOFF2, caracterele după subsetare sau randarea în browser.
- Condițiile tehnice decisive au fost recitite în documentația oficială: identitate Firebase/JWT, Worker CPU și cote, D1 batch și limitele pe bază/cont, stocare care cere facturare. R2 și Firebase Storage cu Blaze au fost excluse din recomandarea strict gratuită. URL-urile surselor sunt în `architecture.md` și `design-system.md`.

### Verificări neexecutate și limite
Toate probele P-01–P-12 sunt planificate, neexecutate. Nu există aplicație, build de produs, teste de API cu chei, benchmark CPU, verificare SQL concurentă pe D1 real, browser/telefon sau rezultat offline demonstrat. Nu au fost create conturi/chei, activate servicii sau publicat site-ul. Gratuitatea practică și calitatea informațiilor/AI sunt condiționate de probe. Referințele exacte ale celor două fotografii Lisabona pentru introducere rămân nerecuperate; nu se inventează și nu blochează celelalte module.

### Review independent, corectări și reverificare finală
Toate observațiile **IR-01–IR-08 sunt închise documentar**, după remediere delegată către autorii gpt-6-luna și recitire de către reviewerul gpt-6.1-sol. Nu au rămas defecte blocante în cele patru livrabile revizuite; acest verdict nu înseamnă că probele tehnice au trecut.

| ID | Corecție reverificată |
|---|---|
| IR-01 | Logout/purge local separat de valabilitatea tokenului Firebase deja emis; UID dezactivat este respins online. |
| IR-02 | Gate CPU P-09 real, minimum 100 cereri cold și 100 warm, p95 ≤7 ms, zero terminări CPU, request maxim 256 KiB. |
| IR-03 | Matricea folosește ID-urile canonice ale probelor, fără confuzia surse/rutare/offline. |
| IR-04 | Harness și comenzi înaintea testelor contractelor, fără importuri din fișiere viitoare sau opțiuni CLI inventate. |
| IR-05 | IntroPage are un singur proprietar, Task 9. |
| IR-06 | Propunere Buddy imuabilă, patch server-side, versiune/preferințe validate și receipt atomic unic. |
| IR-07 | Token de claim/lease verificat la fiecare scriere; rezultat întârziat respins, apel extern duplicat contabilizat conservator. |
| IR-08 | Spike Task 1b înaintea fundației, P-12-A timpuriu pe telefon și P-12-B după implementarea offline, fără dependența circulară. |

Coordonatorul a recitit integrarea și a verificat cele 12 documente noi/actualizate: legături documentare locale existente, blocuri de cod închise, toate trimiterile la probe definite și 14 sarcini viitoare cu contracte. `git diff --check` a trecut. Nu există directoare/fișiere de aplicație create (`src`, `tests`, `migrations`, `public`, `probes`, `package.json`). P-12 este împărțită în P-12-A (mini-spike, fără verdict MVP) și P-12-B (conținutul offline complet); ambele rămân neexecutate.
