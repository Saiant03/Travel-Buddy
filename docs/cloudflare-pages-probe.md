# Publicarea mini-probei P12-A prin Cloudflare Pages

Acest ghid arată cum publici shell-ul de test P12-A ca site web de probă public, cu fixture și fotografie sintetice, fără date personale. Astfel îl poți verifica pe iPhone/Safari și Android/Chrome. Aplicația privată Travel Buddy nu se publică prin acest flux.

Nu sunt necesare chei, secrete, Firebase sau D1 pentru acest shell. `.node-version` fixează Node 24.19.0, aceeași versiune folosită la verificarea build-ului. Dacă apare un pas care cere card, billing sau trecerea la un plan plătit, oprește-te.

## Conectarea la GitHub

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

După ce primești adresa `pages.dev`, urmează [checklist-ul real pentru iPhone/Safari și Android/Chrome](../probes/offline/README.md#checklist-de-completat-pe-telefoane-reale). Publicarea sau testul Chromium desktop nu înseamnă că P12-A a trecut: rezultatul rămâne **BLOCKED** până când ambele telefoane reale au fost verificate.

Costurile și limitele documentate oficial pentru această rută:

- [Tarife Pages Functions](https://developers.cloudflare.com/pages/functions/pricing/): fișierele statice sunt gratuite și nelimitate; build-ul folosește numai fișiere statice.
- [Limitele platformei Pages](https://developers.cloudflare.com/pages/platform/limits/): planul Free permite 500 de build-uri pe lună, cu maximum 20 de minute pentru fiecare build.
- [Configurarea build-ului](https://developers.cloudflare.com/pages/configuration/build-configuration/).
- [Versiunea Node și build image](https://developers.cloudflare.com/pages/configuration/build-image/): Pages acceptă `.node-version` și variabila `NODE_VERSION`; valoarea implicită documentată este 22.16. Proiectul fixează explicit 24.19.0.

Conectarea repository-ului, alegerea proiectului și rularea build-ului se fac în contul Cloudflare/GitHub al utilizatorului. Ghidul nu este dovadă că integrarea a fost conectată sau că s-a făcut deploy.
