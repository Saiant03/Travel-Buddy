# Progresul publicării și al probei pe telefon — 2026-10-23

Notă de sinteză după capturile furnizate de utilizator. Capturile brute nu sunt salvate în repository; nu consemnăm detalii de cont, tokenuri, versiuni de sistem sau modele de telefon care nu au fost furnizate.

## Publicarea observată

- După push-ul commitului `c85e075ccb171dbcdc71bb3e8990563dada27b69` pe `codex/implementation-foundation`, dashboard-ul Cloudflare afișează primul rând cu textul vizibil „Record saved Work...”, ramura `codex/implementation-foundation`, starea `Ready` după 48 secunde și version ID `ec7c9c50`.
- Build-ul inițial #c132a584 pornit din `main` a fost marcat failed; logul și cauza nu sunt disponibile. Nu atribuim eșecul unei anumite setări.
- Cardul Active deployment afișează aceeași versiune. Același card arată trafic `0%` și o bară `100%`; valorile se contrazic vizual, deci nu deducem procentul de trafic efectiv.
- Alte intrări `Manually Ready` sunt mai vechi și nu le atribuim commitului de mai sus.
- Utilizatorul a apăsat Visit și a furnizat [URL-ul probei](https://travel-buddy-offline-probe.saiuantonio.workers.dev/). Unealta web a coordonatorului a răspuns „URL not accessible via this tool”; nu există verificare independentă remote, iar răspunsul uneltei nu arată că site-ul a eșuat.

## Ce arată browserul utilizatorului

Captura din Windows Chrome arată pagina „Proba locală P12-A”, starea service worker activ și browser online. Pagina spune că nu există încă o copie locală salvată și fotografia este indisponibilă. Așadar pagina a fost accesibilă în browserul utilizatorului, dar salvarea offline și recuperarea fotografiei nu au fost încă testate.

## Pașii următori — iPhone

Utilizatorul a spus că are iPhone la îndemână. Următorul pas este să deschidă URL-ul în Safari, să folosească **Adaugă pe ecran principal**, apoi să pornească proba din icon. În pagină, apasă **Salvează fixture-ul** și verifică dacă apare copia locală și fotografia. Aceste acțiuni nu sunt încă executate.

După salvarea cu succes, verificările rămase sunt repornirea paginii, mod avion și actualizare întreruptă, confirmând că copia anterioară rămâne disponibilă. Nu declarăm PASS înaintea observațiilor reale. Android nu a fost confirmat disponibil și verificarea pe el rămâne separată.

## Limitele rezultatului

Nu s-au executat probe autentice Firebase, D1 sau CPU; Gate B1 rămâne blocat. Captura Cloudflare și cea din browserul utilizatorului nu sunt loguri brute sau verificare independentă a endpointului. Pagina publică este o mini-probă sintetică, nu aplicația privată Travel Buddy.
