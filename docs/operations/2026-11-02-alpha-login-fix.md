# Corecția conectării Alpha — 2 noiembrie 2026

## Stare finală și următorul pas

Corecția este aplicată pe [panoul server](https://travel-buddy-server-probe.saiuantonio.workers.dev/). Ambele conturi Firebase au acum adresele confirmate. Utilizatorul trebuie să reîncarce pagina și să încerce autentificarea Alpha, apoi Beta. Alpha este contul Firebase creat primul, Beta al doilea; ordinea este aceeași ca în fixture-ul D1.

Autentificarea efectivă cu parolele reale și testele de acces pozitiv/CAS nu sunt încă demonstrate. Sesiunea administrativă a agentului nu este sesiunea celor două conturi din browser. Nu solicita parole sau tokenuri în chat și nu reseta conturi ori fixture-ul pentru a obține rezultate verzi.

## Defect și corecție

Clientul salva funcția nativă `fetch` într-un membru al clasei, apoi o apela cu instanța clasei drept receptor. Chromium arunca `Illegal invocation` înaintea cererii Firebase; pagina ascundea această eroare sub mesajul generic raportat de utilizator.

Corecția este o singură înlocuire: `this.#b=e.fetcher??fetch` devine `this.#b=e.fetcher??fetch.bind(globalThis)`. Ramura unui fetcher injectat rămâne neschimbată. Nu au fost modificate parole, conturi, verificarea adreselor sau regulile de acces.

Sursa TypeScript originală a clientului nu este în Git, iar bundle-ul public nu expune un source map. Pentru această remediere limitată folosim [patcherul cu verificare SHA și marker unic](../../tools/probe-recovery/patch-fetch-binding.mjs), plus [regresia în browser](../../tools/probe-recovery/login-browser-regression.py). Nu păstrăm bundle-uri generate în Git. La recuperarea sursei reale, corecția trebuie portată acolo înaintea următorului build al clientului; nu trata acest patch ca înlocuitor al sursei.

Bundle original păstrat: `/assets/index-CYvPOVoA.js`, SHA-256 `fb0afab75e7a8567ced5ec81208bac16bdbe04ac002489f589084d3d4a4e49de`.
Bundle activ: `/assets/index-8b032a5e84f7.js`, SHA-256 `8b032a5e84f770bb6bd1ef909af6334881657c08b03af2821cb4aebf8e8a677d`.

## Verificări efectuate

- RED: bundle-ul original eșuează exact pentru că zero cereri de conectare ajung la stub; nu este un exit artificial.
- GREEN: bundle-ul corectat trece scenariile sintetice de refuz al datelor și conectare cu email confirmat/neconfirmat, inclusiv activarea corectă a butoanelor. Toate răspunsurile Firebase din aceste regresii sunt interceptate local; nicio parolă reală nu este folosită.
- Review independent: corecția, testul și scriptul de aplicare au fost verificate. Calculul hash-urilor de assets a fost aliniat la BLAKE3 din utilitarul Cloudflare înainte de upload.
- Candidatul a fost verificat înainte de activare: modulele backend, bindings, configurația runtime și configurația assets au rămas neschimbate. HTML-ul trimite către un nume JS nou, pentru evitarea cache-ului vechi; CSS și vechiul JS sunt păstrate. Manifestul conține cele patru fișiere cunoscute, referite de pagina actuală. API-ul nu oferă enumerarea vechiului manifest, deci nu pretindem conservarea unor fișiere vechi necunoscute/nefolosite.
- După activarea la 100%, toate cele patru fișiere au trecut verificarea conținutului. Versiune: `7c5c90cc-070d-461a-9196-eb4f2e61b682`; deployment: `54d521c5-6df7-4ca5-9757-869d845bb817`.
- Verificare reală în browser: formularul a trimis cererea către Firebase, fără eroare de transport. Pentru un cont fictiv inexistent, Firebase a returnat HTTP 400 `INVALID_LOGIN_CREDENTIALS`, comportamentul negativ așteptat. Nu a fost încercată parola vreunui utilizator real.
- Metadatele Firebase, verificate separat după aplicare: două conturi, Alpha confirmat și Beta confirmat. Acest rezultat nu este dovadă de autentificare a utilizatorilor.

Mesajul generic al interfeței încă apare pentru unele refuzuri Firebase. Dacă utilizatorul îl raportează din nou, verifică răspunsul cererii fără a colecta parole sau jurnale brute; nu presupune automat că defectul `fetch` a revenit. Nu este demonstrată o problemă de restricții ale cheii API și nu am schimbat acele setări.

## Continuitate

Contextul și limitele probei sunt în [recuperarea inițială](2026-11-01-probe-recovery.md). Datele sintetice D1 sunt pregătite; nu au fost schimbate de această corecție. Testul CAS schimbă intenționat versiunea 7 și nu trebuie repetat prin resetarea automată a bazei. Produsul complet, benchmarkul CPU și verificările pe telefoane nu sunt validate prin această remediere.

În chatul nou se citesc `AGENTS.md`, `docs/memory.md` și acest document. Se verifică întâi sesiunile administrative deja configurate; nu se reface onboardingul și nu se cer coduri OAuth noi fără o eroare concretă. Folosește `NODE_USE_ENV_PROXY=1` pentru comenzile Node care accesează rețeaua din acest mediu.
