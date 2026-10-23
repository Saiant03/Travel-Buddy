# Acces la serviciile cloud

Stare actualizată la 2026-10-23. Activarea serviciilor gratuite și publicarea necesară proiectului sunt autorizate. Utilizatorul confirmă că a creat un cont Cloudflare. Aceasta nu confirmă verificarea adresei de email, planul gratuit sau autentificarea din mediul curent. Pașii de înscriere de mai jos sunt păstrați ca referință și au fost raportați ca încheiați; nu mai cere crearea contului. Nu activa billing și nu cere din nou acordul pentru pașii gratuiți deja autorizați.

Utilizatorul nu găsește setările Environment/Network/Secrets ale mediului de lucru. Pentru P12-A este pregătit un flux Worker Git cu static assets, independent de acele setări. [Ghidul](cloudflare-pages-probe.md) urmărește ecranul Workers din captură și include Pages doar ca alternativă documentară. Captura arată `Saiant03/Travel-Buddy` selectat în wizard; ruta dashboard/GitHub nu schimbă și nu ocolește politica rețelei sesiunii, care rămâne restricționată. Nu există încă deploy, URL `workers.dev` sau build remote confirmat; s-a verificat numai build și dry-run local.

## Firebase

Pluginul oficial Firebase este instalat, iar catalogul afișează acum și skill-uri Firebase. Nici coordonatorul, nici agentul independent nu găsesc o unealtă Firebase care să poată fi apelată în `ALL_TOOLS`. Aceasta descrie disponibilitatea instrumentelor din sesiune; nu dovedește autentificarea la Firebase. Nu s-a confirmat un proiect conectat sau acces autentificat.

Un diagnostic separat al Firebase CLI a instalat `firebase-tools` 15.34.1 numai în `/tmp` cu `--ignore-scripts`. `login:list --non-interactive` a ieșit cu cod 0 și mesajul „No authorized accounts”; CLI nu are cont autorizat. Varianta `--json` a ieșit cu cod 0, dar a returnat numai `{status:success}`, fără conturi. `projects:list --non-interactive --json` a ieșit cu cod 1 și eroarea de autentificare „Failed to authenticate, have you run firebase login?”. Firebase CLI este neautentificat; pluginul instalat nu schimbă acest rezultat. Separat, politica de rețea enforced nu permite hosturile Firebase; nu s-a demonstrat niciun apel Firebase API reușit. Fără login interactiv, deploy sau billing. Pentru planul gratuit: [Firebase Spark](https://firebase.google.com/pricing). Nu asocia un card, nu trece la Blaze și nu activa facturarea.

## Cloudflare

Utilizatorul a confirmat că a creat contul Cloudflare. Următorii pași de înscriere sunt păstrați ca referință și au fost raportați ca încheiați. Pagina oficială de creare este [aici](https://developers.cloudflare.com/fundamentals/account/create-account/) și formularul [aici](https://dash.cloudflare.com/sign-up):

1. Deschide formularul de înscriere și introdu adresa ta de email și parola pe care vrei să le folosești.
2. Apasă **Create Account**.
3. Deschide emailul de confirmare primit de la Cloudflare și confirmă adresa.
4. Nu cumpăra un domeniu, nu selecta un plan plătit și nu introduce un card. Dacă apare un pas obligatoriu cu plată sau card, oprește-te și spune coordonatorului.
5. După confirmare, spune doar că ai terminat. Nu trimite parola, coduri de autentificare sau chei în chat.

Nu știm încă dacă adresa de email a fost confirmată sau dacă este selectat planul gratuit. Configurarea continuă după verificarea accesului; nu solicita parola sau coduri în chat.

La observația runtime curentă, `observations_current:true`, politica rețelei este `restricted/enforced`, `network_policy.allowed_hosts=[]`, iar mediul nu are secrete, variabile runtime sau identități externe configurate. `api.cloudflare.com` lipsește din politica permisă. Nu s-a încercat accesarea unui host refuzat. Wrangler 4.152.0 `whoami` a ieșit cu cod 0, dar a afișat explicit „You are not authenticated”; sesiunea nu este autentificată. Crearea contului confirmată de utilizator nu dovedește verificarea emailului, planul Free sau acces API.

## Gate B1 și verificări

Gate B1 rămâne blocat până la probe reale cu Firebase, D1 și măsurarea CPU pe Workers Free, precum și verificarea probei HTTPS pe un iPhone/Safari și un telefon Android. Testele locale deja salvate (75 teste și 2 E2E desktop) nu demonstrează aceste condiții și nu au fost repetate în această actualizare. Diagnosticul CLI nu a demonstrat accesul la Firebase.

Pentru probe se folosesc doar planurile gratuite autorizate, fără card, billing sau upgrade automat. Dacă un pas cere plată sau facturare, se oprește înainte de acel pas. Detaliile verificărilor locale sunt în [raportul de verificare](verification.md), iar dovezile noi privind starea accesului în [nota de stare](evidence/2026-10-23/access-status.md).
