# Travel Buddy — handoff pentru Claude Code

Lucrează în română, cu explicații simple și pași mici. Utilizatorul nu are experiență IT; spune ce să apese și ce rezultat să caute. Nu cere parole, Firebase API key sau tokenuri în chat. Nu cere din nou acordul pentru activare/publicare gratuită; acest acord există. Oprește-te înainte de orice plată, card, billing sau upgrade.

## Context și surse de adevăr

- Repository-ul GitHub verificat este `Saiant03/Travel-Buddy`. Branch-ul activ pentru această etapă este `codex/implementation-foundation`; verifică mereu head-ul curent și fișierele remote înainte să presupui că un snapshot local este sincronizat.
- `/workspace/travel-buddy-current` poate fi un snapshot parțial, nu un checkout Git complet. Nu folosi copia veche `/workspace/Travel-Buddy` ca sursă curentă.
- Citește `AGENTS.md`, apoi `docs/memory.md`, `docs/plan.md`, `docs/process.md` și documentele relevante din `docs/`. Pentru panoul server: `docs/contracts-probe-console.md`, `probes/server-console/README.md`, `probes/server/wrangler.console.toml` și dovezile din `docs/evidence/`.
- README-ul panoului și contractul definesc interfețele și limitele. `docs/memory.md` și `docs/plan.md` țin starea actualizată; pasajele istorice nu înlocuiesc starea curentă.

## Obiectiv imediat: compilarea Workerului din branch-ul corect

Workerul Cloudflare `travel-buddy-server-probe` a fost creat și conectat la repository-ul GitHub. Utilizatorul a schimbat Production branch la `codex/implementation-foundation`. Setările de build sunt:

- Build command: `npm run build:server-probe`
- Deploy command: `npx wrangler deploy --config probes/server/wrangler.console.toml`
- Preview command: `npx wrangler preview` (formularul l-a cerut obligatoriu)
- Root directory: `/`
- Builds for Preview branches: dezactivat în captura utilizatorului.

Captura Deployments din 2026-10-25 arată o încercare eșuată pe branch-ul `main` și o versiune instalată manual din Dashboard (`c182577a`); nu arată încă o compilare pornită de pe `codex/implementation-foundation`. Eșecul de pe `main` este de așteptat: acea ramură nu conține configurația și comenzile pentru acest Worker. Nu considera versiunea instalată manual drept build Git și nu relansa vechea compilare `main`.

Cloudflare Workers Builds pornește o compilare când este împins un commit nou pe Production branch. Schimbarea ramurii singură nu a produs încă o compilare vizibilă. Acest commit de actualizare al handoff-ului este pe branch-ul configurat și ar trebui să declanșeze următoarea compilare. În Deployments, verifică dacă apare o compilare cu branch-ul `codex/implementation-foundation`. Apoi verifică logul complet; succesul buildului singur nu confirmă că aplicația funcționează.

Repository-ul are și Workerul existent `travel-buddy-offline-probe`, conectat la același branch. Un push pe branch poate declanșa și buildul lui; ultimul build văzut anterior pentru proba offline a trecut. Nu schimba configurația probei offline pentru a repara Workerul server.

## Pașii de după un build reușit

1. Verifică în Cloudflare că planul este Free și nu accepta pași cu plată, card, billing sau upgrade. Interfața a arătat 4 din 3.000 minute de build, dar planul nu a fost confirmat separat.
2. În Cloudflare Dashboard, adaugă `FIREBASE_WEB_API_KEY` ca Secret runtime al Workerului. Nu o salva în repository, `[vars]`, build environment sau chat. Până atunci `/probe/public-config` trebuie să răspundă `503` cu `no-store`.
3. Verifică în Firebase că aplicația Web aparține proiectului `travel-buddy-b3f48`; configurația Web nu a fost reconfirmată independent. Utilizatorul introduce cheia direct în Cloudflare Dashboard.
4. Verifică URL-ul HTTPS, `/probe/public-config` și headerele reale după setarea Secretului. Nu declara succes doar din build sau dry-run.
5. Autentifică cele două conturi deja create. Cere utilizatorului să solicite mesajele de verificare doar dacă dorește asta; confirmă ambele adrese și autentifică din nou.
6. Din panoul publicat, descarcă seed-ul și aplică-l o singură dată în baza D1 dedicată. Nu reseta și nu reaplica seed-ul.
7. Rulează probele reale în ordinea acces → CAS → dispatch CPU. Pentru P-09 cere exportul CPU Cloudflare și corelarea independentă; timpul din browser nu este măsurătoare CPU.

## Starea tehnică și limite

- Firebase `travel-buddy-b3f48` este pe Spark, iar Email/Password este activat. Cele două conturi au fost create și UID-urile distincte sunt deja configurate în branch; nu duplica UID-uri în acest fișier, chat sau loguri.
- D1 `travel-buddy-server-probe` are ID-ul `b6deb718-ad18-43f8-8649-95e3ed861aaf`. Captura utilizatorului din Console `/tables` arată cele șase tabele. Legarea D1 la Worker și setarea Secretului runtime nu sunt confirmate.
- Configurația din TOML exclude API key-ul; cheia trebuie injectată doar ca Secret runtime. Configurarea incompletă întoarce `503/no-store`.
- În această sesiune: buildul consolei, 36/36 teste de consolă și Wrangler dry-run au trecut; proba locală fără cheie a dat 503/no-store. Istoric, baseline-ul integrat a avut 111/111 teste, typecheck, lint și 7/7 E2E Chromium. Nu s-au rerulat typecheck/lint/suita completă/E2E după modificările acestei sesiuni.
- Nu există încă build Git reușit pentru Workerul server, autentificare Firebase reală, seed aplicat, probă D1 CAS/rollback sau export CPU real. P-01/P-02/P-09 reale și verificarea Android sunt neexecutate. iPhone PASS se referă numai la fixture-ul sintetic P12-A.
- Gate B1 rămâne blocat; nu începe Tasks 2+ până nu sunt îndeplinite criteriile reale din plan. Prietenii sunt o posibilitate viitoare; V1 rămâne pentru două persoane. Extinderea cere proiectarea tenant-urilor, invitațiilor și permisiunilor și nu este implementată acum.

## Reguli pentru continuarea lucrului

- Păstrează direcția de produs și vizuală documentată; nu relua brief-ul sau explorarea deja aprobate.
- Nu modifica aplicația privată sau mini-proba offline pentru a publica panoul server. Nu inventa rezultate din capturi, teste locale sau dry-run.
- Pentru orice editare, respectă limitele fișierelor din sarcină, citește skill-ul relevant dacă ajută, apoi raportează verificările executate și cele rămase.
- Nu publica issues sau PR-uri automat. După terminarea probei și Gate B1, urmează planul din repository; utilizatorul va decide separat dacă extinderea la prieteni intră în scop.
