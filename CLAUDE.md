# Travel Buddy — handoff pentru Claude Code

Lucrează în română, cu explicații simple și pași mici. Utilizatorul nu are experiență IT; spune ce să apese și ce rezultat să caute. Nu cere parole, Firebase API key sau tokenuri în chat. Nu cere din nou acordul pentru activare/publicare gratuită; acest acord există. Oprește-te înainte de orice plată, card, billing sau upgrade.

## Context și surse de adevăr

- Repository-ul GitHub verificat este `Saiant03/Travel-Buddy`. Commitul de configurare verificat pentru branch-ul `codex/implementation-foundation` este `62dd83d880f823ae981866e6f0b42241d809cec0`; `main` a fost verificat la `11e72f96bc93c84ecf0e8c85f26d3fb0c965361e`. Handoff-ul se adaugă ulterior pe această bază. La citire, verifică head-ul curent și fișierele remote. Formularul Cloudflare trebuie legat de branch-ul de lucru, nu de `main`.
- `/workspace/travel-buddy-current` poate fi un snapshot parțial, nu un checkout Git complet. Verifică remote-ul și fișierele branch-ului înainte să presupui că modificările locale sunt sincronizate. Nu folosi copia veche `/workspace/Travel-Buddy` ca sursă curentă.
- Citește `AGENTS.md`, apoi `docs/memory.md`, `docs/plan.md`, `docs/process.md` și documentele relevante din `docs/`. Pentru panoul server: `docs/contracts-probe-console.md`, `probes/server-console/README.md`, `probes/server/wrangler.console.toml` și dovezile din `docs/evidence/2026-10-24/`.
- README-ul panoului și contractul definesc interfețele și limitele. `docs/memory.md` și `docs/plan.md` țin starea actualizată; pasajele istorice de mai jos în documente nu înlocuiesc starea curentă.

## Obiectiv imediat: publicarea Workerului de probe

Utilizatorul este în formularul Cloudflare Workers & Pages pentru `Saiant03/Travel-Buddy`. În formular, pune:

- Project name: `travel-buddy-server-probe`
- Production branch: `codex/implementation-foundation`
- Build command: `npm run build:server-probe`
- Deploy command: `npx wrangler deploy --config probes/server/wrangler.console.toml`
- Preview command-ul este precompletat acum cu `npx wrangler preview`: șterge valoarea și lasă câmpul gol dacă formularul permite. Dacă nu permite câmp gol, oprește-te și cere o captură a formularului înainte de Deploy, ca să fie identificată opțiunea corectă. Nu înlocui valoarea cu `npm run preview:server-probe` sau cu o comandă `wrangler deploy`.

Înainte de Deploy, verifică Production branch și oprește builds/deploys automate pentru alte branch-uri sau preview-uri dacă formularul oferă acele opțiuni. Dacă setările nu sunt vizibile ori neclare, oprește-te și cere captură cu partea de jos a formularului; nu ghici. Verifică planul Cloudflare Free. O captură disponibilă nu a dovedit încă planul; nu continua dacă apare plată, card, billing sau upgrade.

Commitul de configurare de mai sus este baza verificată, nu head-ul garantat după adăugarea handoff-ului. La continuare, verifică head-ul curent și fișierele remote; nu presupune că proiectul Cloudflare a fost configurat sau că Workerul a fost publicat. Nu crea automat PR. Publicarea Workerului este un pas separat de proba offline existentă.

După publicare:

1. În Cloudflare Dashboard, adaugă `FIREBASE_WEB_API_KEY` ca Secret runtime al Workerului. Nu o salva în repository, `[vars]`, build environment sau chat. Până atunci `/probe/public-config` trebuie să răspundă `503` cu `no-store`.
2. Verifică în Firebase că aplicația Web aparține proiectului `travel-buddy-b3f48`; ecranul Web a fost deschis, dar configurația nu a fost reconfirmată independent. Utilizatorul introduce cheia direct în Cloudflare Dashboard.
3. Verifică URL-ul HTTPS, `/probe/public-config` și headerele reale după setarea Secretului. Nu declara succes doar din build sau dry-run.
4. Autentifică cele două conturi deja create. Solicită emailul de verificare numai când utilizatorul spune că dorește mesajul; confirmă ambele adrese și autentifică din nou.
5. Din panoul publicat, descarcă seed-ul și aplică-l o singură dată în baza D1 dedicată. Nu reseta și nu reaplica seed-ul.
6. Rulează probele reale în ordinea acces → CAS → dispatch CPU. Pentru P-09 cere exportul CPU Cloudflare și corelarea independentă; timpul din browser nu este măsurătoare CPU.

## Starea tehnică și limite

- Firebase `travel-buddy-b3f48` este pe Spark, iar Email/Password este activat. Cele două conturi au fost create și UID-urile distincte sunt deja configurate în branch; nu duplica UID-uri în acest fișier, chat sau loguri.
- D1 `travel-buddy-server-probe` are ID-ul `b6deb718-ad18-43f8-8649-95e3ed861aaf`. Captura utilizatorului din Console `/tables` arată cele șase tabele. Planul Free încă trebuie verificat înainte de publicare. Bindingul D1 în Cloudflare, Workerul și Secretul runtime nu sunt confirmate ca publicate/configurate.
- Configurația locală exclude API key-ul din TOML; ea trebuie injectată doar ca Secret runtime. Configurarea incompletă întoarce `503/no-store`.
- În această sesiune: buildul consolei, 36/36 teste de consolă și Wrangler dry-run au trecut; proba locală fără cheie a dat 503/no-store. Istoric, baseline-ul integrat a avut 111/111 teste, typecheck, lint și 7/7 E2E Chromium. Nu s-au rerulat typecheck/lint/suita completă/E2E după modificările acestei sesiuni.
- Nu există Worker server publicat, autentificare Firebase reală, seed aplicat, probă D1 CAS/rollback sau export CPU real. P-01/P-02/P-09 reale și verificarea Android sunt neexecutate. iPhone PASS se referă numai la fixture-ul sintetic P12-A.
- Gate B1 rămâne blocat; nu începe Tasks 2+ până nu sunt îndeplinite criteriile reale din plan. Prietenii sunt o posibilitate viitoare; V1 rămâne pentru două persoane. Extinderea cere proiectarea tenant-urilor, invitațiilor și permisiunilor și nu este implementată acum.

## Reguli pentru continuarea lucrului

- Păstrează direcția de produs și vizuală documentată; nu relua brief-ul sau explorarea deja aprobate.
- Nu modifica aplicația privată sau mini-proba offline pentru a publica panoul server. Nu inventa rezultate din capturi, teste locale sau dry-run.
- Pentru orice editare, respectă limitele fișierelor din sarcină, citește skill-ul relevant dacă ajută, apoi raportează verificările executate și cele rămase.
- Nu publica issues sau PR-uri automat. După terminarea probei și Gate B1, urmează planul din repository; utilizatorul va decide separat dacă extinderea la prieteni intră în scop.
