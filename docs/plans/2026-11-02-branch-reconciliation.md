# Reconciliere branchului implementation-foundation — 2 noiembrie 2026

> **Execuție:** numai agenți gpt-6-luna pentru corectări și verificări delimitate. Coordonatorul definește contractul, face review și verificarea integrată. Planul curent este numai pentru corectări și verificări, fără mutații sau publicare. După trecerea testelor, integrarea în main este autorizată de utilizator; publicarea rămâne o acțiune separată.

**Scop:** Pregătirea integrării selective peste main după remedierea a două probleme P1 și alinierea documentelor la dovezile curente.

**Context:** Compare GitHub indică branch divergent, 13 commituri înainte și 9 în urmă. Reviewul a găsit (1) fallback fetch nativ nelegat în probes/server-console/controller.ts, cu risc de Illegal invocation, și (2) UID-uri vechi în probes/server/wrangler.console.toml. Valorile private nu se repetă aici.

## BR01 — Fetch

Fișiere: probes/server-console/controller.ts; tests/probes/console-controller.test.ts; tests/e2e/server-console.spec.ts.

- [ ] Adaugă regresie cu fetch nativ fără wrapper window.fetch și verifică reproducerea defectului înainte de fix.
- [ ] Aplică fallback fetch.bind(globalThis), păstrând fetcherul injectat; testează ambele căi și fluxul relevant.
- [ ] Rulează testele țintite, typecheck, lint, build și E2E disponibil. Dacă npm/proxy blochează, declară comenzile neexecutate cu eroarea exactă fără secrete.
- [ ] Review independent; coordonatorul verifică fixul și rezultatele.

## BR02 — Configurație UID privată

Fișiere: probes/server/wrangler.console.toml; probes/server-console/README.md; docs/cloud-access.md.

- [ ] Elimină valorile vechi din fișierul urmărit; păstrează numele variabilelor și bindings necesare.
- [ ] Compară numai în citire configurația versionată cu starea/documentația privată existentă, fără a afișa valori. JSON Merge Patch din D010 este procedura istorică de păstrare a bindings; documenteaz-o pentru continuitate, dar nu o aplica în această corectare și nu modifica servicii.
- [ ] Verifică read-only că configurația nu contrazice allowlist-ul privat și că diff-ul/logurile nu conțin identități. Zero mutații Cloudflare/Firebase/D1 în această etapă. Dacă metoda de livrare ulterioară nu păstrează valorile private, ridică întrebarea înaintea execuției.
- [ ] Review independent al TOML-ului și instrucțiunilor.

## BR03 — Documente, stare offline și costuri

Fișiere: docs/verification.md; docs/memory.md; docs/plan.md; docs/plans/2026-10-23-technical-probes.md; docs/cloud-access.md și docs/cloudflare-pages-probe.md după verificarea provenienței.

- [ ] Marchează P12-A drept PASS MANUAL USER pe iPhone, fixture sintetic, pe baza docs/evidence/2026-10-23/phone-probe-progress.md și a confirmării utilizatorului. Păstrează limitele dovezii și rezultatul Chromium desktop separat; nu cere repetarea iPhone-ului și nu descrie testul ca validare a produsului privat.
- [ ] Android este neconfirmat; clarifică dacă rămâne gate pentru continuarea produsului. Offline/iPhone nu blochează merge-ul Git.
- [ ] P-09: workload-ul de 200 de cereri a fost trimis, dar metricile și verdictul lipsesc. Recuperează întâi metricile existente; orice test nou necesită decizie ulterioară și nu se face ca parte a acestor corectări.
- [ ] Reconcilează documentele: docs/cloudflare-pages-probe.md descrie Worker static și Pages ca alternativă; utilizatorul confirmă că pagina există, însă captura istorică Ready nu confirmă starea live. O singură cerere GET publică a eșuat la proxy:8080 (HTTP 000), iar cf workers get a eșuat cu fetch failed. environment_status a raportat policy unrestricted/enforced și variabile ready, fără a dovedi accesul remote. Nu ocoli proxy-ul și nu declara pagina inaccesibilă.
- [ ] Păstrează cost zero și fără billing/upgrade; documentează separat tarifele din surse și starea contului, nereconfirmată prin API. Review documentar pentru stări, legături și lipsa datelor private.

## Gate de merge

- [ ] După remediere, recitește capetele remote și integrează selectiv peste main actual; nu suprascrie main cu branch-ul divergent.
- [ ] Rulează npm ci, test, typecheck, lint, build, build:probe, build:server-probe și E2E disponibil. Nu marca verificările blocate de rețea ca trecute.
- [ ] Review independent și verificare integrată a coordonatorului. Integrarea cere BR01/BR02 și toate verificările relevante trecute. Dacă proxy-ul, instalarea sau alt blocaj împiedică verificările necesare, amână integrarea până la remedierea blocajului și repetarea lor. Nu trata verificările rulate parțial ca gate trecut. Recuperarea metricilor P-09 se face înainte de orice workload nou; verdictul CPU se evaluează separat. Fără deploy sau publicare.

**Constrângeri:** Nu modifica Firebase, D1, emailVerified sau fixture-ul și nu relua CAS. Nu introduce valori private în Git/loguri. Fără facturare și furnizori noi. Numai gpt-6-luna execută; un model mai costisitor necesită acordul utilizatorului.

