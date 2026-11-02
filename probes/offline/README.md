# Probă locală P12-A

Acesta este un shell PWA de test separat de aplicația din `src/`. Build-ul dedicat se face cu `npm run build:probe`; rezultatul este `dist-probe/`. Utilizatorul a autorizat publicarea necesară a probei gratuite. Pentru fluxul Worker Git din ecranul curent, urmează [ghidul Cloudflare Workers](../../docs/cloudflare-pages-probe.md); manifestul Worker servește numai static assets și nu schimbă politica restricționată a mediului. Nu sunt necesare Firebase, D1 sau secrete pentru proba statică. Nu activa billing. Service worker-ul păstrează doar shell-ul public. Fixture-ul privat este separat în IndexedDB și fotografia fictivă este un fișier JPEG creat local.

Pagina are trei acțiuni: salvarea manuală a fixture-ului, reîncărcarea din IndexedDB și simularea unei actualizări incomplete în care lipsește fotografia obligatorie. Revizia veche trebuie să rămână activă. `sessionGeneration` și owner-ul sunt valori demonstrative; această pagină nu implementează login, logout sau curățarea contului.

## Proba desktop locală

Rulează testul prin configurația Playwright root, care pornește automat build-ul de producție și preview-ul dedicat pe portul `4174`. În mediul Linux/cloud, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` indică Chromium instalat în sistem:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- tests/e2e/offline-probe.spec.ts
```

Testul folosește profil persistent Chromium: salvează fixture-ul, închide complet procesul browserului, redeschide același profil cu rețeaua dezactivată, verifică fixture-ul și fotografia, apoi întrerupe update-ul și confirmă revizia veche. Această simulare verifică un browser desktop Chromium, nu iOS Safari sau Android.

## Checklist pentru telefoane reale

URL-ul public observat: [travel-buddy-offline-probe.saiuantonio.workers.dev](https://travel-buddy-offline-probe.saiuantonio.workers.dev/). Pe iPhone, utilizatorul a completat manual fluxul cu fixture-ul sintetic după adăugarea probei pe ecranul principal. Capturile și limitele rezultatului sunt în [nota de progres](../../docs/evidence/2026-10-23/phone-probe-progress.md). Rezultatul iPhone este manual, raportat de utilizator; nu este automatizat sau verificat independent și nu validează aplicația privată ori Task 11 complet.

| Pas | iPhone / iOS Safari | Android / Chrome |
| --- | --- | --- |
| Build ID și model/versiune OS | versiunea observată `ec7c9c50`; iPhone 14 Pro Max / iOS 27.0.1 raportat | de completat |
| Shell pornește și service worker activ | PASS manual, captură offline | de completat |
| Salvează fixture și verifică fotografia | PASS manual, online 11:37; revizia 1, imagine 7641 bytes din IndexedDB | de completat |
| Închide complet și redeschide din icon | PASS manual, utilizatorul confirmă închiderea din aplicațiile recente înaintea probei offline | de completat |
| Mod avion; redeschide și citește fixture/fotografie | PASS manual, 11:40; revizia 1 și imagine vizibile. Timestampul afișat este fix în fixture, nu ora reală a salvării | de completat |
| Simulează update întrerupt; verifică revizia veche | PASS manual, 11:42; eroarea a fost afișată, revizia 1 și fotografia au rămas vizibile | de completat |
| Rezultat și tip de verificare | **PASS MANUAL USER — P12-A sintetică**; nu automatizat/independent, nu aplicația privată sau Task 11 complet | Neexecutat; disponibilitatea telefonului nu este confirmată |

Partea iPhone a verificării P12-A este trecută manual. Gate-ul general rămâne deschis până la verificarea Android și celelalte condiții B1. Testul desktop nu înlocuiește probele pe telefoane.
