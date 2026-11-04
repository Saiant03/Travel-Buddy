# Runbook pentru runda CPU autorizată la 2026-11-04

Utilizatorul a autorizat deploy-ul Workerului de probă existent și o singură rundă de cel mult 203 invocări Worker. Bugetul include 201 invocări: un primer necuantificat și 200 de cereri măsurate, plus cel mult două GET-uri de diagnostic. Utilizatorul a confirmat Workers Free și cel puțin 203 cereri disponibile astăzi. Acest runbook consemnează pașii și starea pregătirii, nu dovedește că runda a pornit.

P-09 rămâne **FAIL** din proba anterioară: 10 din 100 cereri cold-key-cache au depășit 7 ms. P95-urile exacte și terminările CPU complete sunt necunoscute. „Cold” înseamnă cache de chei gol, nu isolate rece. Pragurile rămân p95 CPU ≤7 ms pentru ambele căi, payload 256 KiB și zero terminări; B1 și Task 3 rămân blocate până la o captură completă și review.

## Starea pregătirii la 2026-11-04

Coordonatorul a verificat numai în citire lista Worker-elor și setările contului Cloudflare, precum și metadata D1; endpointurile au răspuns HTTP 200. Workerul existent este prezent, iar numele și UUID-ul bazei D1 corespund configurației depozitului. Bindingul Assets corespunde proiectului. UID-urile aprobate sunt distincte și folosesc proiectul Firebase al service account. Aceste verificări nu au citit utilizatori Firebase și nu au făcut deploy sau invocări Worker.

Endpointul subscriptions a răspuns 403, iar câmpul `usage_model=standard` nu identifică planul. Nu folosim aceste răspunsuri ca dovadă de plan sau cotă. Planul Workers Free și limita de cel puțin 203 cereri pentru ziua curentă sunt confirmări directe ale utilizatorului.

OAuth Google și configurația aplicației web Firebase au fost citite cu succes. Coordonatorul a salvat preflight-ul privat și amprentele metadatelor într-un director local cu permisiuni restrânse. Nu includem conținutul configurației, cheia publică, project ID, UID-uri sau credentiale în acest jurnal.

Utilizatorul a pregătit loginurile Alpha și Beta. Însă starea efectivă a mediului din sesiunea curentă conține numai variabilele vechi de runtime; bindingurile Alpha și Beta lipsesc; pentru această rundă este necesar numai Alpha, iar Beta este opțional. Aceasta nu indică o parolă greșită și nu cere refacerea configurării. Înaintea încărcării bindingurilor, niciun login real, deploy sau invocare Worker nu a avut loc în acest mandat. Toate cele 203 invocări rămân nefolosite, iar autorizarea se păstrează.

## Pași înainte de a porni

1. Așteaptă ca proprietarul să încarce mediul cu bindingurile Alpha `EMAIL` și `PASSWORD`; Beta este opțional și nu blochează runda. Verifică numai prezența numelor de variabile necesare, nu valorile. Nu solicita parole, tokenuri sau coduri în chat și nu expune valorile în terminale, jurnale ori fișiere.
2. Înainte de deploy, verifică allowlist-ul/configurația aprobată, helperul Alpha revizuit și provenance-ul sursei/bundle-ului față de commitul examinat. Nu încerca login încă: helperul cere o captură și un manifest sănătoase înainte să autentifice sesiunea.
3. Confirmarea utilizatorului privind Workers Free și cota de cel puțin 203 cereri este pentru 2026-11-04. Dacă execuția începe după schimbarea zilei UTC, verifică mai întâi cota zilei curente și oprește-te dacă aceasta nu este confirmată; autorizarea de maximum 203 invocări rămâne nefolosită. Publică numai Workerul de probă existent, păstrând variabilele:

```bash
WRANGLER_SEND_METRICS=false NODE_USE_ENV_PROXY=1 ./node_modules/.bin/wrangler deploy --config probes/server/wrangler.console.toml --keep-vars
```

4. Citește independent metadata deploymentului pentru `scriptVersionId`; apoi pregătește manifestul care leagă endpointul HTTPS aprobat, versiunea, hashul commitului/buildului, hashul workloadului canonic și payloadul de 262144 bytes. Păstrează câmpurile distincte.
5. Pornește collectorul cu căile private din [instrucțiunile capturii](../../tools/probe-recovery/README.md#cpu-capture-and-offline-correlation). Folosește un singur GET public de diagnostic pentru readiness și confirmă că versiunea corespunde manifestului. Acesta intră în plafonul de 203 invocări.
6. Lansează helperul Alpha. Acesta verifică starea sănătoasă a capturii și manifestului, apoi cere o singură autentificare normală Firebase prin `accounts:signInWithPassword` și pornește imediat procesul copil cu tokenul în memorie. Nu folosi custom token, nu crea/modifica conturi și nu transmite tokenul în argumente, fișiere sau loguri. Beta nu este necesar.
7. Helperul pornește o singură rundă: un primer explicit, apoi 100 cold-key-cache și 100 warm-key-cache, fiecare cu payload de 262144 bytes. Toate cele 100 cold se trimit serial, cel mult una simultan. Setul conține 201 ID-uri de invocare, dar numai 200 de cereri măsurate. Nu deduce ordinea din evenimentele tail. Limita capturii este 10 minute, iar timeout-ul per cerere este 30 secunde.
8. Corelează local numai după ID. Evaluează percentilele doar dacă captura include primerul și toate cele 200 cereri măsurate cu exact un eveniment CPU per ID, și trece verificările de integritate. Reviewul independent și coordonatorul stabilesc verdictul P-09.

Al doilea GET diagnostic este permis numai dacă este necesar după benchmark și rămâne în plafonul total 203. Dacă loginul eșuează după deploy, Workerul rămâne actualizat, dar helperul nu lansează workload; oprește-te fără retry sau login alternativ. Acest eșec lasă neconsumate cererile benchmark din cele 201; readiness GET-ul diagnostic poate fi deja consumat ca una dintre cele maximum 203 invocări. Nu reîncepe loginul și nu relansa runda.

## Oprire și limite

Oprește imediat la orice eșec auth, răspuns HTTP neașteptat, cache invalid, eroare sau terminare CPU, metrică lipsă, timeout, eroare de parsare, reconectare/overload tail, nepotrivire manifest/version/hash, problemă de billing ori incertitudine despre plan/cotă. Nu reîncerca loginul sau cererile, nu relansa runda și nu continua cu o captură incompletă. Marchează rezultatul incomplet `NOT_EVALUATED`; nu calcula percentile parțiale și nu afirma zero terminări.

Nu efectua mutații de conturi, migrații, seed/reset fixture, CAS, probe pe telefon, activarea altor servicii sau furnizori, billing, deploy de produs ori publicare. Dacă o captură completă confirmă din nou depășirea pragului cold, păstrează FAIL și prezintă separat opțiunile de profilare sau reconsiderare arhitecturală. Nu reduce securitatea și nu schimba automat planul sau furnizorul.

## Dovezi locale asociate

Commitul local `9546e02` a trecut verificările codului și capturării consemnate în [dovezile P-09 locale din 3 noiembrie](../evidence/2026-11-03/p09-local/README.md). Acestea nu sunt rezultate ale rundei autorizate. Starea pregătirii, limitele loginului și testele helperului Alpha sunt în [indexul de dovezi pentru pregătirea live](../evidence/2026-11-04/p09-live-preparation/README.md).
