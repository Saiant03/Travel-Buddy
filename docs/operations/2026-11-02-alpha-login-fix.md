# Corecția conectării Alpha — 2 noiembrie 2026

## Stare și continuare — actualizare 2 noiembrie

Corecția este aplicată pe [panoul server](https://travel-buddy-server-probe.saiuantonio.workers.dev/). Ulterior, utilizatorul a furnizat rezultate: accesul autentificat Alpha/Beta a trecut 10/10, iar CAS/idempotency 14/14; proba CPU a fost trimisă, dar măsurătorile Cloudflare pentru verdictul P-09 lipsesc. Offline desktop este deja trecut; verificarea telefonului rămâne nedemonstrată. Vezi [jurnalul Alpha/Beta](2026-11-02-alpha-beta-verification.md) pentru rezultate și pașii următori.

Ambele adrese Firebase au fost confirmate. Nu cere parole sau tokenuri în chat și nu reseta fixture-ul ori relua CAS automat. Raportul de probe nu este validarea produsului complet.

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

Contextul inițial și limitele operaționale sunt în [jurnalul de recuperare](2026-11-01-probe-recovery.md), iar rezultatele noi în [jurnalul Alpha/Beta](2026-11-02-alpha-beta-verification.md). CAS a mutat fixture-ul D1 de la versiunea 7 la 8; nu îl reseta și nu relua testul automat. Proba CPU nu are încă măsurătorile Cloudflare pentru verdictul P-09.

Utilizatorul a raportat acces Firebase reutilizabil în sesiunile care folosesc mediul Travel-Buddy, cu credential valid. Acea verificare aparține sesiunii noi, nu acestui checkout. Persistența Cloudflare rămâne de verificat. Nu reface onboardingul, nu reutiliza `FIREBASE_AUTH_CODE` și nu cere coduri, parole ori secrete în chat.
