# Conectarea serviciilor gratuite

Stare la 2026-10-23: activarea și publicarea gratuite sunt autorizate. Nu mai este necesar un acord de principiu; lipsesc conturile/conexiunile efective. Nu s-a făcut nicio plată sau activare billing.

## Primul pas: contul Cloudflare

Utilizatorul a confirmat că nu are încă un cont Cloudflare. Crearea contului cere adresa proprie și confirmarea emailului, deci această parte se face de către utilizator:

1. Deschide [pagina oficială de creare a contului](https://dash.cloudflare.com/sign-up).
2. Creează contul și confirmă adresa de email din mesajul primit.
3. Nu cumpăra un domeniu, nu selecta un plan plătit și nu introduce un card. Dacă apare un pas obligatoriu cu plată sau card, oprește-te și anunță coordonatorul.
4. Confirmă doar că ai terminat. Nu trimite parola, coduri de autentificare sau chei în chat.

După crearea contului, coordonatorul verifică planul gratuit și stabilește conectarea sigură pentru Worker/D1 și publicarea probei HTTPS. Un cont creat nu este automat accesibil din această sesiune. Dacă este necesar un token, acesta se adaugă în setările de secrete ale mediului, nu în repository sau chat; se folosesc permisiuni limitate la operațiile necesare.

## Firebase

Integrarea oficială Firebase a fost găsită și sugerată pentru instalare/conectare. Starea confirmată la verificare: neinstalată/neconectată. După conectare se verifică proiectul și planul Spark, fără trecere la Blaze sau asocierea facturării. Nu se consideră că acordul pentru gratuit autorizează billing.

## Accesul mediului

Mediul curent nu are credențiale configurate. CLI Cloudflare a confirmat lipsa autentificării. Accesul read-only la `api.cloudflare.com` a fost refuzat de proxy (`CONNECT 403`), deci va fi necesară și permiterea domeniului în configurarea rețelei mediului. Nu se modifică direct politica locală și nu se ocolește proxy-ul. Alte domenii strict necesare se identifică după configurarea conturilor.

Varianta Wrangler `--temporary` a fost inspectată local: suportă tehnic Worker/D1, dar help-ul și codul instalat nu confirmă condițiile de cost și durata exactă. Nu s-a creat un cont temporar sau declanșat deploy pe această cale.

Gate B1 rămâne BLOCAT până la probele reale de acces, D1 și CPU, plus verificarea pe iPhone/Safari și Android. Rezultatele locale și instrucțiunile sunt în [raportul de dovezi](evidence/2026-10-23/README.md).
