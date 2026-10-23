# Acces la serviciile cloud

Stare verificată la 2026-10-23. Activarea serviciilor gratuite și publicarea necesară proiectului sunt autorizate. Autorizarea nu confirmă existența unui cont, autentificarea sau accesul din mediul curent. Crearea contului Cloudflare și confirmarea emailului îi revin utilizatorului; configurarea gratuită continuă după verificarea accesului. Nu activa billing și nu cere din nou acordul pentru pașii gratuiți deja autorizați.

## Firebase

Pluginul oficial Firebase este instalat. Confirmarea instalării și căutarea cu `installed:true` au găsit pluginul, însă nici coordonatorul, nici agentul independent nu găsesc o unealtă Firebase care să poată fi apelată în `ALL_TOOLS`. Aceasta descrie disponibilitatea instrumentelor din sesiune; nu dovedește autentificarea la Firebase. Nu s-a confirmat un proiect conectat sau acces autentificat.

Un diagnostic separat al Firebase CLI a instalat `firebase-tools` 15.34.1 numai în `/tmp` cu `--ignore-scripts`. `login:list --non-interactive` a ieșit cu cod 0 și mesajul „No authorized accounts”; CLI nu are cont autorizat. Varianta `--json` a ieșit cu cod 0, dar a returnat numai `{status:success}`, fără conturi. `projects:list --non-interactive --json` a ieșit cu cod 1 și eroarea de autentificare „Failed to authenticate, have you run firebase login?”. Firebase CLI este neautentificat; pluginul instalat nu schimbă acest rezultat. Separat, politica de rețea enforced nu permite hosturile Firebase; nu s-a demonstrat niciun apel Firebase API reușit. Fără login interactiv, deploy sau billing. Pentru planul gratuit: [Firebase Spark](https://firebase.google.com/pricing). Nu asocia un card, nu trece la Blaze și nu activa facturarea.

## Cloudflare

Utilizatorul a confirmat că nu are cont Cloudflare. Pașii oficiali de creare sunt [aici](https://developers.cloudflare.com/fundamentals/account/create-account/) și [formularul de înscriere](https://dash.cloudflare.com/sign-up):

1. Deschide formularul de înscriere și introdu adresa ta de email și parola pe care vrei să le folosești.
2. Apasă **Create Account**.
3. Deschide emailul de confirmare primit de la Cloudflare și confirmă adresa.
4. Nu cumpăra un domeniu, nu selecta un plan plătit și nu introduce un card. Dacă apare un pas obligatoriu cu plată sau card, oprește-te și spune coordonatorului.
5. După confirmare, spune doar că ai terminat. Nu trimite parola, coduri de autentificare sau chei în chat.

După ce utilizatorul confirmă crearea contului, configurarea gratuită continuă după verificarea accesului. Nu solicita parola sau coduri în chat.

La ultima observație runtime, `observations_current:true`, politica rețelei este `restricted/enforced`, iar mediul nu are secrete, variabile runtime sau identități externe configurate. `api.cloudflare.com` nu este permis. O cerere `curl` anterioară a fost refuzată cu `CONNECT 403`, fără răspuns HTTP de la Cloudflare, iar `wrangler whoami` a indicat că sesiunea nu este autentificată. Acestea sunt stări separate: o autorizare de proiect nu creează cont sau credențiale și nu schimbă politica de rețea.

## Gate B1 și verificări

Gate B1 rămâne blocat până la probe reale cu Firebase, D1 și măsurarea CPU pe Workers Free, precum și verificarea probei HTTPS pe un iPhone/Safari și un telefon Android. Testele locale deja salvate (75 teste și 2 E2E desktop) nu demonstrează aceste condiții și nu au fost repetate în această actualizare. Diagnosticul CLI nu a demonstrat accesul la Firebase.

Pentru probe se folosesc doar planurile gratuite autorizate, fără card, billing sau upgrade automat. Dacă un pas cere plată sau facturare, se oprește înainte de acel pas. Detaliile verificărilor locale sunt în [raportul de verificare](verification.md), iar dovezile noi privind starea accesului în [nota de stare](evidence/2026-10-23/access-status.md).
