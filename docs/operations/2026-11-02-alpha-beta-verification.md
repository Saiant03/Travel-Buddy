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

Pentru acces administrativ persistent, utilizatorul a raportat că a creat un cont de serviciu dedicat proiectului și i-a atribuit rolul recomandat Firebase Authentication Admin; rolul nu a fost verificat independent aici. După publicarea configurației mediului și pornirea unei sesiuni noi, acea sesiune a raportat că `FIREBASE_SERVICE_ACCOUNT_JSON` era disponibil și nevid, autentificarea a reușit, iar citirea proiectului a întors HTTP 200 fără modificări. Acest rezultat aparține sesiunii noi și nu a fost măsurat în acest checkout. Accesul este reutilizabil în sesiunile care folosesc mediul Travel-Buddy cât timp credentialul este valid; nu este acces global tuturor chaturilor.

Persistența Cloudflare rămâne de configurat/verificat în sesiunea nouă. Nu pretinde că este conectată. Numele variabilei `FIREBASE_SERVICE_ACCOUNT_JSON` este păstrat ca reper; nu se salvează emailul contului de serviciu sau ID-ul cheii. Codul `FIREBASE_AUTH_CODE` a fost consumat și nu se reutilizează. Nu cere parole, coduri sau secrete în chat.

## Limite și următorii pași

1. Păstrează fixture-ul la starea rezultată din CAS; nu îl reseta automat.
2. Obține valorile Cloudflare CPU p50/p95, erorile și cotele aferente workloadului transmis pentru a decide P-09.
3. Verifică separat accesul persistent Cloudflare în sesiunea nouă.
4. Păstrează telefonul offline nedemonstrat până există o dovadă specifică dispozitivului.
5. Produsul complet nu este implementat; nu a fost autorizată facturarea.
