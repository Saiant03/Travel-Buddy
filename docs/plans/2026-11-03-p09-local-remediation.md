# Plan local pentru diagnoza și remedierea P-09

> **Pentru agenți:** Urmați `docs/process.md`: implementare delegată, review, remediere și verificare finală de către coordonator, task cu task. Bifați pașii (`- [ ]`) numai după ce există dovezi.

**Scop:** Diagnosticarea locală a căii P-09 cu cache de chei gol, aplicarea unei remedieri strict delimitate dacă dovezile o susțin și pregătirea unui plan verificabil pentru o eventuală măsurare live ulterioară.

**Arhitectură:** Păstrăm separat proba de autentificare/profilare Worker și instrumentele de captură CPU. Responsabilul autentificare/profilare investighează calea cu cache de chei gol și o îmbunătățește fără să schimbe verificările JWT; responsabilul capturii întărește atribuirea fiecărui eveniment. Profilarea locală a confirmat import repetat X509 pe calea warm înaintea patchului. Profilarea Node măsoară CPU local pentru verificator rece la 0,295 ms înainte și 0,302 ms după; pentru cel cald, 0,150 ms și 0,072 ms. Profilarea workerd locală arată numai timp de perete. Niciuna nu explică și nu prezice CPU Cloudflare. Un rezultat local bun verifică doar codul și instrumentele, nu schimbă P-09 live FAIL și nu deblochează B1.

**Tehnologii:** Proba existentă TypeScript/Cloudflare Worker, Vitest, instrumentele Wrangler de captură, verificarea cheilor publice/JWK Firebase și metadata CPU/tail Cloudflare. Nu adăuga dependențe de produs fără reviewul coordonatorului.

**Specificație:** `docs/plans/2026-10-23-technical-probes.md` §P-09; `docs/plans/2026-10-23-implementation.md` §Task 1b și Gate B1; `docs/operations/2026-11-02-cpu-rerun.md`; contractele auth și P-09 din `docs/contracts-v1.md`.

## Constrângeri generale

- Păstrează pragurile: cel puțin 100 de cereri cu cache de chei gol și 100 cu cache valid, payload de cel mult 256 KiB, p95 CPU de cel mult 7 ms pe ambele căi și zero terminări CPU.
- „Rece” înseamnă cache gol al cheilor publice; nu înseamnă isolate rece. Nu pretinde acoperirea pornirii la rece a isolate-ului.
- Nu slăbi RS256, verificările claim-urilor Firebase, allowlist-ul, apartenența, tratarea erorilor sau regulile produsului pentru a reduce CPU-ul.
- Păstrează schimbările locale și numai în fișierele atribuite; nu face deploy și nu porni workload live în baza acestui plan.
- Nu repeta probele CAS, acces conturi sau telefon; nu reseta fixture-uri și nu expune secrete ori identificatori reali.
- Benchmarkul local, simularea, timpul de perete sau captura tail parțială nu pot demonstra PASS P-09.
- Marchează pașii numai după ce există dovezi efective și verificarea coordonatorului.

## Aspecte de review

- Import repetat de certificat sau conversia ASN.1 în cheie la cereri cu cache gol; testează calea cu aceleași claim-uri JWT și aceeași verificare de semnătură.
- `kid` necunoscut, malformat sau rotit și eșecul preluării cheii publice; păstrează actualizarea limitată, refuzul implicit și lipsa retry-urilor nelimitate.
- Payload malformat/supradimensionat și claim-uri de autentificare lipsă ori invalide; păstrează respingerile curente și nu adăuga lucru costisitor înaintea respingerii.
- Întreruperea capturii, timeout tail, JSON malformat/parțial și evenimente lipsă; păstrează starea incompletă și nu deduce valorile CPU lipsă.
- Neconcordanțe de identitate raport/eveniment, ID-uri duplicate, primer și evenimente tail în altă ordine; acceptă numai legarea strictă după ID și păstrează `scriptVersionId` separat de `buildHash`.

---

### Task 1: Diagnoză și remediere locală a căii auth/profile cu cache rece

**Responsabil:** Terra (implementare). **Review independent:** Sol, numai citire după implementare. **Coordonator:** verifică integrarea și dovezile.

**Fișiere:**
- Responsabilitate exclusivă: `probes/auth-worker.ts`, `tests/probes/auth-worker.test.ts`, `tools/probe-recovery/auth-profile*`, `docs/evidence/2026-11-03/p09-local/auth-*`.
- Nu modifica fișierele de captură CPU ale Task 2.

**Interfețe:**
- Păstrează contractele existente de cerere/răspuns Worker și autentificare. Orice helper nou rămâne în proba locală, cu interfață tipată restrânsă descrisă în dovezi.
- Dovezile notează exact calea inspectată, ipoteza, metoda de măsurare locală înainte/după și comenzile/rezultatele; fără credentiale, UID-uri ori tokenuri reale.

- [x] **Pasul 1: Adaugă teste care eșuează pentru comportamentul identificat.** Testul original de cache a avut RED înainte de patch.
- [x] **Pasul 2: Rulează testele vizate și salvează rezultatul RED real** în dovezile `docs/evidence/2026-11-03/p09-local/auth-*`.
- [x] **Pasul 3: Inspectează și profilează calea rece locală.** Testele Node și workerd local rămân profilări locale separate; nicio măsurare nu stabilește cauza sau valoarea CPU Cloudflare. Profilarea a confirmat import repetat X509 pe calea warm local, dar nu a măsurat aceeași cale pe Cloudflare. Profilarea workerd folosește un hash alternativ, nu workloadul canonic. JWK a fost comparat local, dar efectul redus nu a justificat alegerea lui ca patch.
- [x] **Pasul 4: Aplică cea mai mică îmbunătățire susținută de dovezi** în fișierele auth/profile atribuite, păstrând verificarea semnăturii, claim-urile, allowlist-ul/apartenența și actualizarea limitată a cheilor.
- [x] **Pasul 5: Rulează testele vizate și verificările locale relevante de tipuri/lint/build; păstrează rezultatul GREEN** și măsurătorile în `docs/evidence/2026-11-03/p09-local/auth-*`. Rezultatele locale nu schimbă starea P-09 live.

**Stare:** pașii 1–5 încheiați. Testul inițial de cache a avut RED real, apoi 11/11 GREEN; reviewul de regresii a trecut 13/13, iar cel de securitate 16/16. Cinci teste noi pentru securitate au fost scrise după patch și au trecut; acestea nu dovedesc retrospectiv TDD pentru fiecare caz. Sol a închis reviewul auth fără defecte confirmate deschise.

### Task 2: Completarea și întărirea capturii și corelării CPU

**Responsabil:** Terra (implementare). **Review independent:** Sol, numai citire după implementare. **Coordonator:** verifică integrarea și dovezile.

**Fișiere:**
- Responsabilitate exclusivă: `probes/cpu-runner.ts`, `probes/server/run-cpu.ts`, `tests/probes/cpu-runner.test.ts`, `tools/probe-recovery/cpu-capture*`, `tools/probe-recovery/cpu-correlate*`, `docs/evidence/2026-11-03/p09-local/capture-*`.
- Nu modifica fișierele auth/profile ale Task 1.

**Interfețe:**
- Raportul identifică separat primerul și cele 200 de ID-uri măsurate; corelează numai prin ID unic exact. Cere câte un eveniment CPU potrivit pentru fiecare dintre cele 201 invocări (primer + 100 cold + 100 warm) înainte de a evalua completitudinea.
- Ordinea evenimentelor tail nu dovedește ordinea cererilor. Nu completa CPU lipsă, nu calcula p95-ul întregului set dintr-un subgrup și nu deduce cauza evenimentelor absente.
- Păstrează `scriptVersionId` drept câmp independent al evenimentului Worker; nu îl echivala cu `buildHash` din raport.

- [x] **Pasul 1: Adaugă teste pentru comportamentele de captură și corelare**: primer, join strict după ID, ID-uri duplicate/lipsă/neprevăzute, evenimente în altă ordine, nepotriviri, timeout și ieșire parțială/malformată. CAP06 acoperă `outcome` necunoscut și oprirea în lipsa unei valori cunoscute.
- [x] **Pasul 2: Rulează testele vizate și păstrează rezultatele RED observate** în `docs/evidence/2026-11-03/p09-local/capture-*`. RED-ul inițial al corelatorului nu a fost comportamental; limita este descrisă mai jos.
- [x] **Pasul 3: Inspectează comportamentul Wrangler/tail și metricile/indicatorii disponibili.** Preflight-ul read-only a avut loc la 2026-11-03. Valorile `observability=null` și `tailConsumers=0` sunt observații, nu cauză demonstrată pentru evenimentele lipsă.
- [x] **Pasul 4: Implementează captură și corelare stricte**, astfel încât o rulare incompletă sau ambiguă să rămână `NOT_EVALUATED`, cu diagnostic util și fără p95 ori afirmație falsă de zero terminări.
- [x] **Pasul 5: Rulează testele vizate și verificările locale relevante; păstrează rezultatul GREEN** și regulile de completitudine în `docs/evidence/2026-11-03/p09-local/capture-*`.

**Stare:** reviewul Sol a remediat și reverificat CAP01–CAP06, fără defecte confirmate deschise. Runnerul a trecut 20/20 teste, iar capturarea/corelarea 21/21. Toate cele 100 de cereri cold sunt acum seriale; limita de concurență implicită a scăzut de la 16 la 1. Aceasta controlează burstul și nu dovedește o remediere CPU Cloudflare. Verificarea finală a coordonatorului a trecut.

**Limită TDD:** nu s-a demonstrat un test RED comportamental pentru fiecare caz nou din corelator. `capture-red-correlate.log.txt` eșuează la aserțiunea că funcția strictă de corelare exista, deoarece fișierul lipsea; acesta nu dovedește singur o regresie funcțională a join-ului sau percentilelor. RED-uri comportamentale reale există pentru remedieri ulterioare, inclusiv CAP01/CAP02 în `capture-red-review.log.txt`, endpoint, guard, outcome și evenimente târzii. Păstrează aceste loguri fără reinterpretare retrospectivă.

### Task 3: Review independent și verificare de către coordonator

**Fișiere:** Review numai pentru diff-urile atribuite, dovezi și secțiuni relevante din contract; coordonatorul deține modificările de integrare și raportul final.

- [x] **Pasul 1: Sol a revizuit cele două taskuri numai în citire** pentru echivalența autentificării, actualizarea cheilor, validitatea măsurătorii și regresii P-09. Reviewul auth este curat. Pentru captură, CAP01–CAP06 au fost remediate și închise la reverificare.
- [x] **Pasul 2: Responsabilii au rezolvat constatările atribuite; Sol a reverificat numai în citire.** Dovezile și rezultatele sunt în `docs/evidence/2026-11-03/p09-local/README.md`.
- [x] **Pasul 3: Coordonatorul a repetat verificările locale finale** după ultimele remedieri și a raportat separat acceptarea locală și starea P-09. Rezultatele apar în jurnalul operațional și indexul dovezilor.
- [x] **Pasul 4: Coordonatorul a pregătit propunerea concretă pentru o măsurare live limitată.** Orice rulare necesită o singură aprobare separată după patchul testat. Buget: cel mult 201 invocări (primer explicit + 100 cold + 100 warm), payload 262144 bytes, cel mult două cereri GET de diagnostic separate și, numai dacă sunt aprobate, maximum 203 invocări Worker în total. Fără billing/upgrade, schimbări CAS/conturi/fixture sau rerulări automate. Orice terminare/eroare, stare cache invalidă, metrică lipsă ori problemă de captură oprește imediat măsurarea. Planul nu autorizează deploy sau rerulare.

## Dovezi curente și limita acceptării

Ultimul rezultat live consemnat pentru P-09 este **FAIL**: 10 cereri cold distincte au depășit 7 ms; p95 exact cold/warm, celelalte 179 de observații CPU și zero terminări pentru întregul set sunt necunoscute. Cererile capturate au avut `outcome=ok`; asta nu stabilește de ce au lipsit celelalte evenimente. Eticheta `cold` din runda anterioară se referă la cache de chei gol, nu la isolate rece.

Preflight-ul administrativ numai în citire din 2026-11-03 a primit HTTP 200 pentru lista/setările Worker-elor Cloudflare, metadata D1 și configurația Firebase OAuth/Auth; Worker-ul este prezent. S-au observat și `settings observability=null` și `tailConsumers=0`. Fetch-ul Git din 2026-11-04 a confirmat că `main` rămâne la `5b785c8`; nu s-a făcut API probe Cloudflare/Firebase azi. Preflight-ul anterior nu dovedește cauza capturii incomplete și nu autorizează modificări ale serviciilor.

Acceptarea locală cere teste și verificări atribuite trecute, dovezi reale RED/GREEN, review independent numai în citire cu observații închise sau raportate explicit și verificarea coordonatorului. Aceasta **nu** înseamnă P-09 PASS, Gate B1 PASS sau autorizare pentru deploy/rerulare live. Acceptarea P-09 live cere în continuare o măsurare reală, completă și aprobată separat, care îndeplinește toate pragurile contractului.
