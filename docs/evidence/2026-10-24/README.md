# Dovezi locale — 2026-10-24

[Reluare manuală și starea raportată a conturilor Firebase](manual-continuation.md): notă locală ulterioară snapshotului de teste de mai jos, fără probe cloud noi sau publicare.

Acest snapshot verifică local Task 1b, inclusiv consola de probe client/server. Testele simulează autentificarea Firebase și folosesc fixtures locale; niciun rezultat de aici nu este o probă Firebase, D1 sau CPU reală. Workerul consolei a fost compilat numai cu `--dry-run`, nu publicat.

| Verificare | Rezultat | Dovadă |
|---|---:|---|
| Suite Vitest | 111/111 în 12 fișiere | [tests.txt](tests.txt) |
| TypeScript strict | PASS | [typecheck.txt](typecheck.txt) |
| ESLint | PASS | [lint.txt](lint.txt) |
| Playwright Chromium | 7/7 | [e2e.txt](e2e.txt) |
| Wrangler pentru server console | build dry-run PASS | [worker-build.txt](worker-build.txt) |

Cele șapte E2E includ shell-ul offline, cinci scenarii pentru consola server cu Firebase simulat (configurație lipsă/invalidă/lentă, ieșire în timpul conectării și viewport mobil) și proba offline cu restart Chromium. Cele trei shell-uri sunt pornite ca servere în timpul suitei E2E; nu există un deploy rezultat din acele builduri.

Reviewul independent gpt-6.1-sol a închis ICR-01–05: cardinale CAS, anulare la sign-out în timpul citirii body-ului, politici private/no-store, preluare de configurare limitată și CSP/rutare assets. Corectările au fost reverificate cu teste și verificări locale; nu s-a apelat un endpoint cloud.

Dry-run-ul a folosit `probes/server/wrangler.console.toml` cu project ID placeholder, API key goală, UID-uri sintetice și binding D1 local placeholder. Nu demonstrează existența sau activarea Workerului/D1 reale și nu a făcut upload.

Firebase Console, conform capturii utilizatorului, arată proiectul Travel Buddy cu ID public `travel-buddy-b3f48`, plan Spark și providerul Email/Password activ. Conturile/UID-urile pentru probă, cheia web și binding-ul D1 nu sunt stabilite aici. [Încercarea de conectare a pluginului/CLI](firebase-connection.md) s-a oprit înainte de OAuth: serviciul `auth.firebase.tools/attest` nu a putut fi contactat din mediul restricționat; nu s-a produs un link de autorizare. Nu includem parole, tokenuri, chei private ori emailuri.

Gate B1 rămâne blocat. P-01 (Firebase real), P-02 (D1 real), P-09 (CPU din export Cloudflare) și P12-A pe Android nu au fost demonstrate. P12-A pe iPhone rămâne PASS manual pentru fixture sintetic, conform [notei de progres](../2026-10-23/phone-probe-progress.md). Nu s-au executat Tasks 2+, billing, activare de plată sau deploy al server console.

Manifestele pentru hashurile surselor, versiunile și raportul reviewului independent sunt păstrate separat de acest README: [source-sha256.txt](source-sha256.txt), [versions.txt](versions.txt), [independent-review.md](independent-review.md).

Logurile capturate au doar whitespace-ul final normalizat; conținutul rezultatelor a rămas neschimbat.

