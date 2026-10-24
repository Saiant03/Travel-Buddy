# Contractul consolei de probe server — 2026-10-24

Increment strict în Task 1b, separat de aplicația privată și de mini-proba P12-A publicată. Nu pornește Tasks 2+. Scopul este să rulăm cereri de probă din browser fără parole sau ID tokens trimise în chat și fără acces CLI la serviciile externe din acest mediu.

## Limite și configurare

- Worker separat: `travel-buddy-server-probe`, configurat prin `probes/server/wrangler.console.toml` și build separat `dist-server-probe`.
- Pagina publică nu conține date personale. Nu folosește service worker, localStorage, sessionStorage sau IndexedDB. Cele două sesiuni sunt păstrate numai în memoria paginii și se pierd la închidere/reîncărcare/deconectare.
- `GET /probe/public-config` returnează numai `firebaseProjectId` și `firebaseWebApiKey`, configurație web publică. Nu returnează UID-uri, secrete sau alte variabile. Configurarea absentă ori demonstrativă produce 503; răspunsul nu se cachează.
- Celelalte rute `/probe/*` ajung la verifierul și probele existente; asset-urile nu trebuie să înlocuiască un răspuns API cu HTML.
- DB este o bază D1 dedicată exclusiv fixture-urilor sintetice. Proiectul Firebase, cele două UID-uri aprobate, cheia web publică și bindingul D1 reale nu sunt încă demonstrate prin această implementare.
- Fără signup public, endpoint administrativ SQL, reset automat de bază, conturi create din cod, biblioteci noi, card, billing sau activare de servicii plătite.

## Sesiuni și operații

Controllerul fără DOM este `ProbeConsole`. Interfața comună folosește sloturile `alpha | beta`, `AuthSummary { signedIn, emailVerified }` și `ProbeCheck { name, expected, actual, pass, cacheControl? }`.

Metode: `signIn`, `sendVerification`, `signOut`, `hasSession`, `isVerified`, `runAccessChecks`, `runCasChecks`, `runCpuChecks`, `createSeedSql`. Configurarea constructorului este `{ apiKey, projectId, origin, buildHash, fetcher? }`. Nu se expun sesiuni sau tokens prin interfața publică ori serializarea controllerului.

Autentificarea trimite emailul/parola direct către endpointul HTTPS oficial Firebase Identity Toolkit. ID tokenul se folosește numai pentru cereri către aceeași origine a consolei; refresh tokenul nu se persistă. Verificarea emailului se cere numai prin acțiunea explicită a utilizatorului. Cele două sloturi trebuie să corespundă unor UID-uri distincte și verificate pentru probele comune.

Toate cererile folosesc `cache: no-store`, `credentials: omit`, `redirect: error`, limită de timp și semnal de anulare. Deconectarea anulează operațiile și invalidează răspunsurile întârziate. Parola se golește din formular imediat la trimitere. Nu se redau corpuri brute ori mesaje externe în rapoarte; nu se loghează credențiale sau identificatori personali.

## Probe și dovezi

- Acces: cereri fără autentificare sau cu autentificare malformată, profil propriu, refuzul citirii profilului celuilalt în ambele sensuri, vacanță comună și refuz pentru fixture fără apartenență. Se verifică și `private, no-store`. Orice succes neașteptat la o citire neautorizată oprește proba.
- Concurență: ambele sesiuni citesc v7; confirmă propuneri diferite pe aceeași versiune; se așteaptă un succes și un conflict. Ambele reîncarcă v8 cu patchul propunerii câștigătoare. Reîncercările păstrează receiptul inițial. Metadatele din raport trebuie să corespundă valorilor efectiv comparate.
- CPU: se reutilizează dispatcherul bounded existent, cu 100 cereri cold-key-cache și 100 warm-key-cache plus primer. Consola exportă identificatori de corelare și hashul surselor, fără a estima CPU din timpul browserului. Hashul buildului local nu dovedește singur proveniența unui export Cloudflare.
- Seed: exportul SQL conține numai INSERT-uri pentru schema de probă existentă și UID-urile celor două sesiuni. UID-urile sunt identificatori necesari configurării, nu credențiale. SQL-ul nu include parole/tokens și nu se trimite în chat. Se aplică numai într-o bază de probă nouă; nu șterge și nu resetează date existente.

Consola nu încheie singură P-01: modificarea profilului, un outsider Firebase autentic, dezactivarea allowlist și curățarea copiei private a produsului necesită probele lor. Pentru P-02 lipsesc încă dovezile reale D1 ale rollbackului și ale fault injection. Pentru P-09 lipsesc CPU per cerere și corelarea independentă cu exportul platformei. Verificările locale cu rețea simulată se raportează separat de Firebase/D1/CPU reale. Gate B1 rămâne blocat până la toate criteriile aplicabile, inclusiv proba Android.
