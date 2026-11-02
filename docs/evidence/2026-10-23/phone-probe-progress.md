# Progresul publicării și al probei pe telefon — 2026-10-23

Notă de sinteză după capturile furnizate de utilizator. Capturile brute nu sunt salvate în repository; nu consemnăm detalii de cont sau tokenuri.

## Publicarea observată

- După push-ul commitului `c85e075ccb171dbcdc71bb3e8990563dada27b69` pe `codex/implementation-foundation`, dashboard-ul Cloudflare afișează primul rând cu textul vizibil „Record saved Work...”, ramura `codex/implementation-foundation`, starea `Ready` după 48 secunde și version ID `ec7c9c50`.
- Build-ul inițial #c132a584 pornit din `main` a fost marcat failed; logul și cauza nu sunt disponibile. Nu atribuim eșecul unei anumite setări.
- Cardul Active deployment afișează aceeași versiune. Același card arată trafic `0%` și o bară `100%`; valorile se contrazic vizual, deci nu deducem procentul de trafic efectiv.
- Alte intrări `Manually Ready` sunt mai vechi și nu le atribuim commitului de mai sus.
- Utilizatorul a apăsat Visit și a furnizat [URL-ul probei](https://travel-buddy-offline-probe.saiuantonio.workers.dev/). Unealta web a coordonatorului a răspuns „URL not accessible via this tool”; nu există verificare independentă remote, iar răspunsul uneltei nu arată că site-ul a eșuat.

După capturile de deploy, documentația a fost împinsă prin commitul `596503a49f619ad7b7b9bcc83af9d0a9de885cea`; coordonatorul raportează că acel commit nu schimbă codul sau asset-urile aplicației și urmează să reverifice remote-ul. Nu susținem că SHA-ul complet al buildului a fost inspectat în browser; corelarea de mai sus folosește numai starea observată în dashboard.

## Ce arată browserul utilizatorului

Captura inițială din Windows Chrome arată pagina „Proba locală P12-A”, service worker activ și browser online, fără copie locală salvată și cu fotografia indisponibilă. Aceasta a fost înaintea probei pe iPhone.

## Probă manuală pe iPhone

Utilizatorul a raportat un iPhone 14 Pro Max cu iOS 27.0.1. Înaintea probei offline a confirmat că a închis complet aplicațiile din ecranul aplicațiilor recente și a redeschis proba din iconul de pe ecranul principal. Capturile arată:

| Ora din captură | Rețea și stare | Rezultat afișat |
| --- | --- | --- |
| 11:37 | Online | „Fixture salvată local și verificată: revizia 1”; fotografia sintetică vizibilă, 7641 bytes citiți din IndexedDB. |
| 11:40 | Mod avion, fără simbol Wi-Fi, browser offline, service worker activ | „Copie locală verificată: revizia 1, salvată 2026-10-22T00:00:00Z”; fotografia de 7641 bytes vizibilă. Timestampul este fix în fixture și nu reprezintă ora salvării reale. |
| 11:42 | Mod avion, browser offline, service worker activ | „Update întrerupt (Required photo asset blob is missing or unexpected); revizia 1 rămâne activă”; fotografia de 7641 bytes vizibilă. |

**Rezultat: PASS MANUAL USER — P12-A pe iPhone, fixture sintetic.** Este o verificare manuală bazată pe capturile utilizatorului, nu automatizată sau independentă. Nu validează aplicația privată Travel Buddy și nu reprezintă testul complet Task 11.

## Rămâne de verificat

Android nu a fost confirmat disponibil, iar proba pe Android/Chrome nu a fost făcută. Gate B1 rămâne blocat până la Android și probele reale Firebase (P-01), D1 (P-02) și CPU (P-09). Capturile nu sunt loguri brute și nu se păstrează ca fișiere în repository.

## Limitele rezultatului

Nu s-au executat probe autentice Firebase, D1 sau CPU; Gate B1 rămâne blocat. Captura Cloudflare și cea din browserul utilizatorului nu sunt loguri brute sau verificare independentă a endpointului. Pagina publică este o mini-probă sintetică, nu aplicația privată Travel Buddy.
