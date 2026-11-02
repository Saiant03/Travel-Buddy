# Publicarea mini-probei P12-A prin Cloudflare Workers

Acest ghid arată cum publici shell-ul de test P12-A ca site web de probă public, cu fixture și fotografie sintetice, fără date personale. Astfel îl poți verifica pe iPhone/Safari și Android/Chrome. Aplicația privată Travel Buddy nu se publică prin acest flux.

## Ecranul Worker Git din captură

Proiectul Worker `travel-buddy-offline-probe` există deja. Site-ul P12-A este complet static și este configurat prin [`probes/offline/wrangler.toml`](../probes/offline/wrangler.toml), fără script Worker propriu, baze de date sau chei. Wizardul inițial nu a arătat selectorul branch-ului; configurarea se continuă din pagina proiectului.

1. Deschide proiectul din Cloudflare Dashboard și intră în **Settings** → **Builds**.
2. La **Production branch**, alege `codex/implementation-foundation` și apasă **Save changes**. Utilizatorul a salvat deja această alegere; aici poți verifica valoarea afișată.
3. Dacă mesajul **Configured API token unavailable** încă apare, folosește **Create new token**, apoi selectează și salvează tokenul oferit de Cloudflare pentru Worker Builds. Utilizatorul a raportat deja că a salvat selecția. Nu copia și nu trimite cheia în chat. Salvarea selecției nu dovedește singură că tokenul are drepturi API suficiente.
4. Verifică valorile proiectului:

   | Câmp | Valoare |
   | --- | --- |
   | Project name (Worker) | `travel-buddy-offline-probe` |
   | Production branch | `codex/implementation-foundation` |
   | Root directory | rădăcina repository-ului |
   | Build command | `npm ci --ignore-scripts --no-audit --no-fund && npm run build:probe` |
   | Deploy command | `npx wrangler deploy --config probes/offline/wrangler.toml` |
   | Preview command | `npx wrangler versions upload --config probes/offline/wrangler.toml` |

   Build-ul scrie `dist-probe`; fișierul TOML îl leagă ca static assets. Alege configurație personalizată/manuală dacă wizardul oferă framework preset, plugin sau generarea automată de cod. Nu adăuga framework/plugin, Workers KV, D1, R2, variabile, secrets sau routes.

5. Dacă există o opțiune pentru preview builds, dezactiveaz-o; păstrează comanda Preview de mai sus pentru cazul în care wizardul o solicită. Nu adăuga secrete sau environment variables.
6. Nu folosi **Retry** pentru build-ul vechi care a pornit din `main`. După publicarea unei noi actualizări pe `codex/implementation-foundation`, verifică în **Deployments** dacă apare un build nou și trimite coordonatorului starea/URL-ul. Cauza eșecului build-ului anterior nu este cunoscută; nu presupune că schimbarea branch-ului sau tokenului a rezolvat-o.
7. Dacă apare o cerință de card, billing sau upgrade, oprește-te și anunță coordonatorul.

Worker-ul static va fi disponibil la o adresă `workers.dev`. După ce Cloudflare afișează URL-ul real, trimite-l coordonatorului; nu există încă URL confirmat. Apoi urmează [checklist-ul real pentru iPhone/Safari și Android/Chrome](../probes/offline/README.md#checklist-de-completat-pe-telefoane-reale).

Costuri și limite oficiale:

- [Billing și limite pentru Static Assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/): cererile către fișiere statice sunt gratuite și nelimitate, fără cost suplimentar de stocare pentru asset-uri.
- [Prețuri și limite pentru Worker Builds](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/): planul Free include 3.000 de minute de build pe lună, un build concurent și maximum 20 de minute pentru fiecare build.
- [Configurarea Worker Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), inclusiv setarea branch-ului de producție.
- [Static Assets](https://developers.cloudflare.com/workers/static-assets/binding/): lipsa unui `main` și configurarea `assets.directory` produc un Worker cu numai asset-uri statice.

Această rută folosește contul utilizatorului prin Git integration; nu schimbă și nu ocolește politica rețelei mediului de lucru, care rămâne restricționată. Configurarea din dashboard și deploy-ul nu au fost executate de agent.

## Alternativă: Cloudflare Pages

Ecranul din captura curentă este pentru Workers, deci urmează pașii de mai sus. Secțiunea Pages de mai jos rămâne doar alternativă documentară.

Acest flux publică același shell de test P12-A ca site public, separat de aplicația privată Travel Buddy. Nu sunt necesare chei, secrete, Firebase sau D1. `.node-version` fixează Node 24.19.0. Dacă apare un pas care cere card, billing sau trecerea la un plan plătit, oprește-te.

### Conectarea la GitHub în Pages

1. Deschide [dash.cloudflare.com](https://dash.cloudflare.com/) și selectează contul Cloudflare pe care tocmai l-ai creat.
2. Deschide **Workers & Pages**, apoi apasă **Create application** → **Pages** → **Connect to Git**.
3. Alege **GitHub**. Când GitHub cere permisiuni, alege **Only select repositories**, bifează `Saiant03/Travel-Buddy`, apoi apasă **Install & Authorize**.
4. Alege repository-ul `Travel-Buddy` și apasă **Begin setup**. Nu trimite tokenuri sau parole în chat.
5. Completează setările proiectului astfel:

   | Câmp | Valoare |
   | --- | --- |
   | Project name | `travel-buddy-offline-probe` (numele recomandat; disponibilitatea nu este confirmată, așa că alege alt nume dacă Pages spune că este ocupat) |
   | Production branch | `codex/implementation-foundation` |
   | Framework preset | **None** |
   | Root directory | lasă valoarea implicită, rădăcina repository-ului |
   | Build command | `npm ci --ignore-scripts --no-audit --no-fund && npm run build:probe` |
   | Build output directory | `dist-probe` |

6. Dacă apare setarea pentru preview deployments, dezactiveaz-o. Nu adăuga variabile de mediu sau secrete.
7. Apasă **Save and Deploy** și așteaptă să se încheie instalarea și build-ul. Nu face push-uri repetate cât timp setup-ul sau build-ul este în curs.

Cloudflare Pages publică tot ce se află în `dist-probe` la o adresă publică `*.pages.dev`. Numele recomandat nu este garantat disponibil. După publicare, trimite coordonatorului adresa exactă `pages.dev` afișată de Cloudflare. Nu completa checklist-ul pentru telefon înainte ca pagina reală să fie disponibilă.

## Verificare după publicare

După ce primești URL-ul real `workers.dev` sau `pages.dev`, în funcție de flux, urmează [checklist-ul real pentru iPhone/Safari și Android/Chrome](../probes/offline/README.md#checklist-de-completat-pe-telefoane-reale). Publicarea sau testul Chromium desktop nu înseamnă că P12-A a trecut: rezultatul rămâne **BLOCKED** până când ambele telefoane reale au fost verificate.

Costurile și limitele documentate oficial pentru această rută:

- [Tarife Pages Functions](https://developers.cloudflare.com/pages/functions/pricing/): fișierele statice sunt gratuite și nelimitate; build-ul folosește numai fișiere statice.
- [Limitele platformei Pages](https://developers.cloudflare.com/pages/platform/limits/): planul Free permite 500 de build-uri pe lună, cu maximum 20 de minute pentru fiecare build.
- [Configurarea build-ului](https://developers.cloudflare.com/pages/configuration/build-configuration/).
- [Versiunea Node și build image](https://developers.cloudflare.com/pages/configuration/build-image/): Pages acceptă `.node-version` și variabila `NODE_VERSION`; valoarea implicită documentată este 22.16. Proiectul fixează explicit 24.19.0.

Conectarea repository-ului, alegerea proiectului și rularea build-ului se fac în contul Cloudflare/GitHub al utilizatorului. Ghidul nu este dovadă că integrarea a fost conectată sau că s-a făcut deploy.
