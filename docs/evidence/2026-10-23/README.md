# Dovezi locale — 23 octombrie 2026

Baseline GitHub: `11e72f96bc93c84ecf0e8c85f26d3fb0c965361e`. Branch de lucru: `codex/implementation-foundation`. [source-sha256.txt](source-sha256.txt) identifică exact cele 68 de fișiere de cod, teste, probe, asseturi și configurație verificate; [versions.txt](versions.txt) păstrează versiunile instalate. Data documentului folosește Europe/Bucharest; orele brute din Vitest sunt cele ale mediului de execuție.

| Comandă executată de coordonator | Rezultat | Dovadă |
|---|---|---|
| `npm ci --ignore-scripts --no-audit --cache /tmp/travel-buddy-npm-cache` | PASS, instalare curată, 198 pachete | [install.txt](install.txt) |
| `npm run typecheck` | PASS | [typecheck.txt](typecheck.txt) |
| `npm run lint` | PASS, inclusiv sursele `probes/` | [lint.txt](lint.txt) |
| `npm test` | PASS, 75 teste în 9 suite | [tests.txt](tests.txt) |
| `npm run build` | PASS, shell static | [build.txt](build.txt) |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` | PASS, 2 teste; build și preview pentru shell și mini-proba offline | [e2e.txt](e2e.txt) |
| `npm audit --cache /tmp/travel-buddy-npm-cache` | PASS, 0 vulnerabilități raportate | [audit.txt](audit.txt) |
| `XDG_CONFIG_HOME=/tmp/travel-buddy-xdg WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=/tmp/travel-buddy-wrangler.log ./node_modules/.bin/wrangler deploy --dry-run --config probes/server/wrangler.toml --outdir /tmp/travel-buddy-worker` | PASS, numai compilare locală; fără upload/deploy | [worker-build.txt](worker-build.txt) |

Prima încercare de instalare curată a eșuat fiindcă npm nu putea scrie în cache-ul implicit `/home/agent/.npm`. Cache-ul dedicat din `/tmp` a rezolvat problema, fără schimbarea lockfile-ului. La fel, prima compilare Wrangler nu găsea directorul implicit de configurare; folosirea unui director temporar prin `XDG_CONFIG_HOME` a permis dry-run fără cont sau credențiale. Nu s-a schimbat `HOME` și nu s-au activat servicii. Avertismentele Rollup despre comentarii Zod și cele privind culorile consolei sunt păstrate în loguri; comenzile au ieșit cu 0.

Reviewul independent gpt-6.1-sol a repetat 75/75 teste, typecheck, lint și ambele E2E. A verificat suplimentar semnătură JWT alterată, claims viitoare, outsider și refresh concurent bounded. BRev-01 (conflict CAS raportat ca 500) și BRev-02 (comanda README folosea dev) au fost corectate de autori gpt-6-luna și reverificate. O mutație controlată a comparației `tripId` a făcut testul de izolare să eșueze; sursa a fost restaurată byte-exact. Helperul upstream de server a lăsat procese preview orfane; au fost oprite numai procesele identificate ale acestui task, iar instrucțiunea finală folosește managerul Playwright.

## Ce demonstrează și ce nu demonstrează

- P-01: verificare criptografică reală pe chei/tokenuri generate local, cu fetch Google injectat în teste; nu Firebase real.
- P-02: SQL executat în SQLite real, cu adaptor D1 asincron și scenarii concurente simulate; nu D1 API real. Batch-ul include și o aserțiune de receipt condiționată de nonce/versiune, astfel încât UPDATE reușit fără receipt să fie anulat, iar UPDATE cu zero rânduri să rămână conflict 409.
- P-09: workload de 256 KiB, dispatcher limitat la 100 cold-key-cache + 100 warm-key-cache observat și un warm-up necontorizat; evaluator testat pe date sintetice. Nu există CPU măsurat de Cloudflare, p50/p95 real sau dovadă de cold isolate. Dispatcherul nu a fost executat contra unui serviciu real.
- P-12-A: IndexedDB simulat în testele unitare și Chromium desktop real cu profil persistent, închidere completă, repornire fără rețea, fotografie locală și update nereușit cu ultima copie păstrată. Nu iPhone/Safari sau Android real, nu offline complet Task 11.

**Gate B1: BLOCAT.** Nicio activare de cont/serviciu, publicare, facturare sau probă pe telefon nu a fost executată. Sunt necesare acordul separat și accesul pentru probele reale. Instrucțiunile concrete sunt în [proba server](../../../probes/README-server.md) și [mini-proba offline](../../../probes/offline/README.md).
