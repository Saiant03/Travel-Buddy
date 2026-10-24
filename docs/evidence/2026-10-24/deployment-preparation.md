# Pregătirea publicării consolei server

Configurație pentru Workerul separat `travel-buddy-server-probe`, Firebase `travel-buddy-b3f48`, cele două UID-uri furnizate și D1 `b6deb718-ad18-43f8-8649-95e3ed861aaf`. Schema D1 este confirmată în captura Console `/tables`; bindingul Worker, autentificarea Firebase și CPU nu sunt încă probate.

Cheia Web se introduce ulterior direct în Dashboard ca Secret runtime `FIREBASE_WEB_API_KEY`. Linia goală a fost eliminată din `[vars]`, pentru a nu declara o variabilă cu același nume la deploy. Fără cheie, răspunsul de configurare este 503/no-store; nu se cere cheia în chat, în repository sau în mediul de build.

## Execuție și review

Autor gpt-6-luna, review independent gpt-6.1-sol, corectare delegată și reverificare, apoi verificarea integrată a coordonatorului. [Raportul independent](deployment-config-review.md) închide DCR-01; DCR-02/03 au corectat repetarea creării conturilor și atribuirea dovezii D1/planului Free. Nu s-au modificat sursele Workerului, schema sau comportamentul produsului.

Coordonatorul a recuperat sursele text necesare din snapshotul GitHub exact `be7fc5640b6d0537cd48b3d4a575a5145e0d5c3d`, fără rescrierea checkoutului vechi și fără a pretinde un clone Git complet. Node 24.19.0 și npm 11.9.0 corespund runtime-ului proiectului. Accesul inițial npm din sandbox a eșuat EPERM la proxy; instalarea cu permisiunea de rețea a comenzii, prin același proxy, a reușit. Fără autentificare CLI sau acces API Firebase/Cloudflare.

| Verificare nouă | Rezultat |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` (cache separat în /tmp, fără scripturi) | PASS, 198 pachete |
| `npm run build:server-probe` | PASS, Vite 7.3.7, 7 module |
| `vitest run` pentru console-worker, console-controller, console-seed | PASS, 36/36 în 3 fișiere |
| `wrangler deploy --config probes/server/wrangler.console.toml --dry-run` | PASS, Wrangler 4.152.0, fără upload |
| Importul Workerului compilat și cerere locală `/probe/public-config`, cu proiect/UID reale și cheia absentă | PASS: 503, no-store, `{configured:false}` |
| Parsare TOML/JSON și compararea valorilor/bindingurilor/rutelor | PASS |

Dry-run-ul a necesitat `XDG_CONFIG_HOME` într-un director separat /tmp, deoarece locația implicită nu era accesibilă. Nu s-a copiat/citit o configurație de autentificare existentă. Telemetria a fost dezactivată. Dimensiunea Workerului compilat este 841.94 KiB (gzip 138.03 KiB), cu 5 fișiere statice identificate; acestea nu sunt valori CPU sau dovada unui deploy.

Nu s-au rerulat typecheck/lint, suita completă ori E2E în acest snapshot parțial. Rezultatele istorice 111/111 și 7/7 rămân distincte de cele 36 teste noi. Nu există încă deploy pentru consola server, token Firebase real, seed sau rezultat CAS/rollback/CPU remote. Gate B1 rămâne blocat, Tasks 2+ nu încep.

## Formularul Cloudflare

Project name `travel-buddy-server-probe`; Production branch `codex/implementation-foundation`; Build command `npm run build:server-probe`; Deploy command `npx wrangler deploy --config probes/server/wrangler.console.toml`. Preview command se lasă gol dacă formularul permite, iar builds/deploys automate pentru alte branch-uri se dezactivează. Dacă setările de ramură nu sunt vizibile, captura zonei inferioare a formularului este necesară pentru identificarea lor înainte de Deploy. Planul gratuit trebuie confirmat; fără card/billing/upgrade. Autorizarea gratuită există deja, captura privește informații UI lipsă, nu un acord nou.
