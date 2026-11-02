# Verificarea probelor Alpha/Beta — 2 noiembrie 2026

## Sursa și identificarea buildului

Utilizatorul a furnizat trei rapoarte JSON pentru buildul `032757c940a4cd17c624304bc010d93818cdf15a130bff0eb202fdd20889ce11`. Rapoartele originale conțin identificatori `requestId`; aceștia nu sunt necesari pentru jurnal și nu sunt copiați aici. Rezumatul de mai jos păstrează doar rezultatele aggregate și valorile tehnice relevante.

## Acces și izolare — 10/10

- Itinerariu fără autentificare: 401; autentificare malformată: 401; profil fără autentificare: 401.
- Alpha și Beta și-au citit propriile profiluri: 200 fiecare.
- Citirea profilului celuilalt a fost refuzată: 403 în ambele direcții.
- Ambii au citit vacanța comună: 200 fiecare.
- Beta nu a putut citi vacanța privată a lui Alpha: 403.
- Toate cele zece răspunsuri au `Cache-Control: private, no-store`.

## CAS și retry — 14/14

Ambii membri au citit vacanța la versiunea 7. În cursa concurentă, exact o propunere a fost aplicată cu 200, iar cealaltă a primit 409. Ambii au reîncărcat versiunea 8. Retry-ul fiecărui membru a primit 200 și ambele răspunsuri au aceeași confirmare câștigătoare. Răspunsurile HTTP au avut `private, no-store`.

Această probă a modificat fixture-ul D1 de la versiunea 7 la 8. Nu reseta fixture-ul și nu relua automat CAS; o nouă rundă cere inspectarea stării existente și un scenariu adaptat, fără reset automat.

## CPU — transmisă, fără verdict P-09

Raportul indică `status=sent`, payload de 262144 bytes, 100 cereri solicitate cold și 100 warm, cu 200 de înregistrări și identificatori de cerere unici. Clasificarea raportată este 100 `cold/cold` și 100 `warm/warm`; `isolateColdState` este `not_observed`. Hashul workloadului: `e72a2f1d6b21af68ca1860b9dc6528005721f236ead66eaf0cbd9ebdfdab62d9`.

Nu sunt incluse măsurători ale timpului CPU p50/p95, numărul de erori sau cote Cloudflare. Prin urmare, s-a confirmat trimiterea workloadului, dar nu există verdict de performanță și P-09 rămâne în așteptarea măsurătorilor Cloudflare.

## Offline și acces administrativ

Proba offline desktop trecuse deja și nu a fost rerulată la 2 noiembrie. Utilizatorul a spus că a verificat offline, fără a preciza dispozitivul; nu există dovezi păstrate pentru telefon, deci verificarea pe telefon rămâne nedemonstrată și nu se marchează trecut.

Pentru acces administrativ persistent, la 2026-11-02 autentificarea service account din chatul curent și citirea proiectului Firebase au reușit (HTTP 200) fără modificări. `FIREBASE_SERVICE_ACCOUNT_JSON` este disponibil în mediul folosit de acea verificare; accesul depinde de mediul sesiunii și de valabilitatea credentialului.

Utilizatorul a raportat dintr-un alt chat nou că `CLOUDFLARE_API_TOKEN` și `CLOUDFLARE_ACCOUNT_ID` au fost salvate de el în Environment. În acel chat, verificarea nevidă a variabilelor a reușit, iar apelurile GET au returnat HTTP 200 pentru Worker-ele `travel-buddy-offline-probe`, `travel-buddy-server-probe` și pentru listarea/metadatele D1 `travel-buddy-server-probe`. Acesta este un raport copiat, nu o verificare directă făcută în chatul curent; acesta încă nu a încărcat noile variabile. Nu deduce din acest rezultat că profilul CLI `cf` este autentificat: profilul `default` observat anterior nu era conectat.

La începutul unei sesiuni noi, verifică discret ce acces este efectiv disponibil, fără a afișa sau citi în conversație valorile secretelor și fără a reface automat configurarea. Nu copia, șterge sau roti tokenurile existente. Numele variabilelor sunt repere suficiente. Codul `FIREBASE_AUTH_CODE` a fost consumat și nu se reutilizează. Nu cere parole, coduri sau secrete în chat.

## Limite și următorii pași

1. Păstrează fixture-ul la starea rezultată din CAS; nu îl reseta automat.
2. Obține valorile Cloudflare CPU p50/p95, erorile și cotele aferente workloadului transmis pentru a decide P-09.
3. La următoarea sarcină, verifică discret accesul Cloudflare disponibil în acea sesiune; rezultatul din chatul nou rămâne raportat, nu verificat direct aici.
4. Păstrează telefonul offline nedemonstrat până există o dovadă specifică dispozitivului.
5. Produsul complet nu este implementat; nu a fost autorizată facturarea.
