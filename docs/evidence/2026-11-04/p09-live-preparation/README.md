# Dovezi pentru pregătirea rundei P-09 live

Acest index separă pregătirea autorizată de orice deploy sau măsurare live. La actualizarea curentă, mediul de autentificare Alpha lipsește din sesiunea operatorului; nu s-a făcut login real, deploy sau invocare Worker.

## Mandat și preflight

Utilizatorul a autorizat Workerul de probă existent și o singură rundă de maximum 203 invocări Worker: primer explicit + 100 cold + 100 warm și cel mult două GET-uri de diagnostic. A confirmat manual Workers Free și cel puțin 203 cereri disponibile pentru ziua verificării.

Preflight-ul read-only din 2026-11-04 a primit HTTP 200 la citirea listei Workerelor și setărilor contului Cloudflare, metadata D1, grantului OAuth Google și configurației aplicației web Firebase. Workerul este prezent; bindingurile D1 și Assets corespund configurației depozitului; UID-urile aprobate sunt distincte și corespund proiectului Firebase al service account. Aceste verificări nu au modificat servicii.

GET-ul subscriptions a răspuns 403, iar `usage_model=standard` nu confirmă planul Workers Free sau cota. Planul și bugetul au fost confirmați direct de utilizator. Nu păstra aici configurația Firebase, cheia API, project ID, UID-uri, credentiale sau conținutul preflight-ului privat.

## Blocajul mediului operatorului

Starea mediului efectiv inspectată conține doar variabilele vechi de runtime. Bindingurile necesare sesiunii Alpha/Beta lipsesc. Utilizatorul a pregătit loginurile private; lipsa locală nu înseamnă că acesta a greșit parola. Nu solicita refacerea configurării și nu testa contul înainte ca mediul corect să fie încărcat.

Nu s-a făcut login real Alpha/Beta, deploy sau workload Worker. Toate cele 203 invocări rămân nefolosite. Nu s-a efectuat login cu custom token și nu s-a creat niciun cont.

## Helper local pentru login Alpha

`tools/probe-recovery/cpu-alpha-session.mjs` izolează loginul normal existent Firebase prin `accounts:signInWithPassword` și transmite tokenul direct în memoria runnerului. Helperul interzice crearea conturilor, filtrează mediul copilului ca să nu scurgă secrete fără legătură, validează răspunsurile și oprește fără retry la eșec. Tokenul nu se scrie pe disc sau în log.

Verificările locale inițiale au trecut 5/5 teste, iar lintul helperului a trecut. Reviewul final Sol a aprobat helperul, iar ALPHA01 este închis. Verificarea coordonatorului a trecut 5/5 teste helper și lint global. Bundle-ul curent are 10778 bytes și SHA-256 `72240cdf3ffe38ccc0cdeed1053a6dfb714abc5218dc53d20424c70f2189f6b2`; cele 12 hashuri de surse corespund snapshotului examinat la `9546e02`. RED-urile observate înainte de corecții au acoperit numai fluxul stub de succes (0 față de 1), symlink-ul raportului și least privilege. Celelalte teste negative și verificările de permisiuni/configurație au fost adăugate după primul GREEN; TDD integral nu este demonstrat. Logurile:

- `alpha-red.log.txt`, `alpha-green.log.txt`, `alpha-green-initial.log.txt`, `alpha-green-final.log.txt`
- `alpha-least-privilege-red.log.txt`, `alpha-least-privilege-green.log.txt`
- `alpha-report-symlink-red.log.txt`
- `coordinator-alpha-final.log.txt`, `coordinator-lint-final.log.txt`, `coordinator-preparation.json`, `coordinator-runner-bundle.log.txt` (rezultate finale); `coordinator-alpha.log.txt`, `coordinator-lint.log.txt` (istoric)

`alpha-report-symlink-red.log.txt` este RED observat înaintea remedierii; nu îl rescrie. Rezultatul curent și reviewul sunt aprobate și închise la 2026-11-04.

## P-09 și pașii următori

Verdictul P-09 live rămâne **FAIL** din runda anterioară: 10/100 cereri cold-key-cache peste 7 ms, p95 exact necunoscut și captură incompletă. Cold înseamnă cache de chei gol, nu isolate rece. Pragurile sunt p95 CPU ≤7 ms pentru ambele căi, payload 262144 bytes și zero terminări.

După încărcarea mediului cu bindingurile necesare, continuă numai cu [runbookul autorizat](../../../operations/2026-11-04-cpu-authorized-run.md): verificări pre-deploy fără login, deploy-ul probei existente, manifest independent și captură sănătoasă, apoi helperul face un singur login normal și pornește workloadul. Runda are 201 invocări, dintre care un primer necuantificat și 200 cereri măsurate; sunt permise cel mult două GET-uri de diagnostic. Orice eroare, invaliditate sau captură incompletă oprește execuția. Până există dovezi reale și review, P-09 rămâne FAIL și B1/Task 3 blocate.
