# Probă locală P12-A

Acesta este un shell PWA de test separat de aplicația din `src/`. Build-ul dedicat se face cu `npm run build:probe`; rezultatul este `dist-probe/`. Utilizatorul a autorizat publicarea necesară a probei gratuite. Pentru fluxul Worker Git din ecranul curent, urmează [ghidul Cloudflare Workers](../../docs/cloudflare-pages-probe.md); manifestul Worker servește numai static assets și nu schimbă politica restricționată a mediului. Nu sunt necesare Firebase, D1 sau secrete pentru proba statică. Nu activa billing. Service worker-ul păstrează doar shell-ul public. Fixture-ul privat este separat în IndexedDB și fotografia fictivă este un fișier JPEG creat local.

Pagina are trei acțiuni: salvarea manuală a fixture-ului, reîncărcarea din IndexedDB și simularea unei actualizări incomplete în care lipsește fotografia obligatorie. Revizia veche trebuie să rămână activă. `sessionGeneration` și owner-ul sunt valori demonstrative; această pagină nu implementează login, logout sau curățarea contului.

## Proba desktop locală

Rulează testul prin configurația Playwright root, care pornește automat build-ul de producție și preview-ul dedicat pe portul `4174`. În mediul Linux/cloud, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` indică Chromium instalat în sistem:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- tests/e2e/offline-probe.spec.ts
```

Testul folosește profil persistent Chromium: salvează fixture-ul, închide complet procesul browserului, redeschide același profil cu rețeaua dezactivată, verifică fixture-ul și fotografia, apoi întrerupe update-ul și confirmă revizia veche. Această simulare verifică un browser desktop Chromium, nu iOS Safari sau Android.

## Checklist de completat pe telefoane reale

Execută separat, pe iPhone cu Safari și pe un Android cu Chrome, după ce primești URL-ul real `workers.dev`. Deschide linkul pe telefon, folosește opțiunea browserului de adăugare pe ecranul principal și lansează iconul instalat. Build-ul local sau dry-run-ul Wrangler nu înseamnă că site-ul a fost publicat ori că verificarea pe telefoane a trecut.

| Pas | iPhone / iOS Safari | Android / Chrome |
| --- | --- | --- |
| Build ID și model/versiune OS | de completat | de completat |
| Shell instalat pornește și afișează service worker activ | de completat | de completat |
| Apasă „Salvează fixture-ul”; notează revizia | de completat | de completat |
| Închide complet Safari/Chrome și lansează shell-ul la rece | de completat | de completat |
| Activează modul avion; reîncarcă fixture-ul și verifică fotografia | de completat | de completat |
| Apasă „Simulează update întrerupt”; confirmă revizia veche | de completat | de completat |
| Rezultat PASS/FAIL/BLOCKED și capturi fără date personale | de completat | de completat |

Rezultatul P12-A pe telefon rămâne **BLOCKED** până când aceste două coloane sunt completate pe dispozitive reale. Testul desktop nu îl substituie.
