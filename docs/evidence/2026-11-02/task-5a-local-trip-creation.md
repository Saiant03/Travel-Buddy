# Task 5A — creare demonstrativă locală, 2026-11-02

Implementare și remedieri delegate unui singur agent `gpt-6.1-terra` high. Coordonatorul a stabilit contractul, citit modificările, reprodus defectele și verificat integrarea/browserul; nu a preluat implementarea. Review independent static: `gpt-6-sol` medium, verdict final APPROVE după închiderea R1. Reviewerul a citit codul și testele și a rulat `git diff --check`; nu a rulat teste, build sau browser. Aceste verificări au fost executate separat de coordonator.

Punct de pornire: arbore curat pe `work` la `a2f8272`. Fetch a confirmat `origin/main` la `4306f8d`, iar ramura locală `main` a fost deschisă urmărind remote-ul, fără force/reset. Reperele Task 2 și Task 4A (`c4ffb7d`, confirmare `4306f8d`) au fost păstrate. Fetch înaintea livrării a confirmat divergență `0 / 0`; nu existau modificări locale preexistente de recuperat.

## Comportament verificat

Ruta `/trip-creation`, accesibilă din pagina principală, oferă trei momente succesive: biletul destinației și perioadei, bagajul transportului/cazărilor, pașaportul cu rezumat. Titlul scenei a doua este „Cum explorăm și unde stăm?”. Scenele 2 și 3 au aprobare vizuală istorică; prima scenă și detaliile exacte ale implementării rămân propuneri, fără acceptare umană finală a percepției designului. A fost inspectată macheta PNG existentă, fără explorare sau serie nouă de variante. Fontul, navigarea, componentele și tokenurile existente sunt reutilizate. Pictogramele transportului sunt SVG originale inline, fără surse externe.

- Destinație fictivă obligatorie; perioadă calendaristică reală și ordonată, calculată incluziv, sau număr întreg pozitiv sigur de zile. Fără plafon arbitrar al duratei. Schimbarea modului păstrează ambele seturi de valori, iar rezumatul folosește numai modul activ.
- Transportul permite orice combinație din pe jos, transport public și mașină, cu minimum o alegere.
- Cazări/baze opționale și repetabile, cu nume fictiv și zile incluzive de la 1, în durata vacanței. Suprapunerea inclusiv la ziua de graniță este respinsă; golurile sunt permise și semnalate în rezumat. Micșorarea vacanței nu șterge sau trunchiază cazări; cere corectare.
- Ore aproximative de sosire/plecare opționale, `HH:mm`; nu se cere buget. Rezumatul exprimă explicit datele/opționalele lipsă și faptul că preferințele reale ale celor doi nu sunt verificate aici.
- Starea aparține aplicației și rezistă revenirii între pași, navigării locale și schimbării limbii. Reîncărcarea resetează draftul, pasul și limba la RO; explicația este vizibilă. RO/EN/FR au catalog dedicat în fundația i18n, tipuri și verificare de paritate; datele calendaristice și numărul zilelor sunt localizate.
- Erorile sunt asociate programatic câmpurilor, anunțate și duc focusul la prima problemă. După prima încercare de continuare, corectarea/ștergerea recalculează validarea; o eroare nu migrează la cazarea vecină. Adăugarea și ștergerea au destinații de focus explicite.
- Modelul produce o reprezentare demonstrativă validată prin `parseTrip`, cu ID-uri/membri și coordonate sintetice; nu certifică locuri reale, identitate, geocodare sau membership. UI-ul se oprește la rezumat, fără itinerariu, generare ori progres simulat.

## Dovezi TDD și remedieri

- Două aserțiuni inițiale au eșuat pe lipsa erorilor pentru destinație/durată și transport: `/tmp/travel-buddy-task5a-model-behavior-red.log`.
- Extinderea inițială a modelului a avut **6/6 eșecuri pe aserțiuni**, incluzând calendar imposibil/inversat, durată fracționară/nesigură, baze suprapuse și rezultat absent: `...-model-full-behavior-red.log`. Ulterior au trecut. Cele două teste suplimentare de detaliu ale rezultatului (ore, trei transporturi, omiterea câmpurilor, goluri și micșorare) au fost adăugate după implementarea inițială; nu pretindem RED inițial pentru aceste teste. Paritatea traducerilor a fost verificată GREEN, fără dovadă RED.
- UI a eșuat întâi pe headingul absent „Unde mergem?”, fără eroare de import: `...-ui-assertion-red.log`. Cele două scenarii extinse au fost scrise înaintea scenelor și au eșuat pe heading/câmpuri inexistente: `...-ui-full-red.log`.
- U1 a avut RED pe `aria-invalid` absent înaintea asocierii accesibile a erorilor: `...-accessibility-red.log`. U9 a avut RED pe lipsa textului „Casă: zilele 1–2” înaintea clarificării intervalelor și golurilor: `...-gaps-assertion-red.log`.
- Reviewul independent a identificat R1: după ștergerea unei baze invalide, mesajul ei rămânea pe baza validă care îi prelua indexul. Coordonatorul a reprodus `Bază validă / aria-invalid=true / Adaugă un nume`. Două teste noi au eșuat separat pe `aria-invalid` persistent la corectare și la ștergere (`...-r1-red.log`, `...-r1-delete-red.log`), apoi au trecut după fix. Reproducerea independentă finală arată `Bază validă / aria-invalid absent / fără alerte` în `...-r1-reverified.log`.
- Agentul a inversat temporar comparația suprapunerii la ziua de graniță; testul a eșuat pe aserțiune (`...-overlap-mutation.log`). Restaurarea a fost comparată byte cu byte și suita modelului a trecut 8/8 (`...-overlap-restored.log`).
- Corecțiile de prezentare au acoperit tokenurile, formatarea localizată, etichetele clare ale zilelor și țintele tactile. Captura reală a descoperit butonul de revenire greu vizibil pe bagaj; după corectarea delegată, culorile rezolvate în browser dau **11,56:1** secundar și **6,12:1** primar, respectiv **9,89:1** / **12,60:1** la hover, cu înălțime de 48,19 px. Nu s-au scris teste artificiale CSS/documentație.

Logurile și scripturile `/tmp` sunt dovezi ale sesiunii, fără garanție de portabilitate. Primele încercări oprite la `vitest not found`, pornirea serverului sau `EPERM` nu sunt dovezi RED comportamentale. Agentul a rulat inițial regresia offline shell pe serverul dev, unde service worker-ul nu se activează; acel eșec nu este acceptare validă. Rularea finală a coordonatorului folosește buildul de producție local și a trecut.

## Verificarea finală a coordonatorului

După ultima remediere:

- `npm run test`: **139/139 PASS, 18 fișiere**; include simulările locale ale probelor existente, fără workload CPU/CAS real.
- `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`: **PASS**. Buildul produsului și cele două builduri de probe pornite de configurația Playwright au trecut. Avertismentele Rollup/Zod `@PURE` și `NO_COLOR` sunt neblocante.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- --project=trip-creation --project=preferences --project=shell`: **14/14 PASS** pe build local (5 creare, 7 regresii preferințe, 2 shell). Log: `/tmp/travel-buddy-task5a-final-integrated-e2e.log`. Proiectele E2E `server-console` și `offline-probe` nu s-au executat în această rundă.
- Browser independent Chromium pe serverul local: **3 scene × RO/EN/FR × 1440/768/390/320 px**, fără overflow; Bricolage încărcat, `html.lang` corect, zero `pageerror` și zero cereri externe în captura acestei verificări. Sunt viewporturi emulate, fără test pe telefon fizic.
- Zoom **CSS 200%** pentru toate scenele și limbile la viewport 1280 și 640; fără overflow. Este o aproximare de reflow, **nu zoom nativ al browserului**. Destinație de 4.000 de caractere fără spații verificată în rezumat la 320 px în fiecare limbă, fără depășirea lățimii.
- Tastatură: Tab, Enter pentru continuare, Space pentru transport combinat, focus pe heading după pas și pe primul câmp invalid. Revenire, date păstrate, cazări multiple cu goluri, adăugare/ștergere cu focus și reset verificate în testele de flux. Reduced motion activ în matrice, zero animații active.
- Verificare independentă suplimentară RO/EN/FR: calendar inversat respins cu focus/eroare, 12–16 mai numărat ca 5 zile și afișat localizat, mașina ca singur transport și opționale omise. `localStorage`, `sessionStorage` și lista bazelor IndexedDB au rămas goale în contextul dev inspectat; shell-ul public PWA existent își păstrează separat cache-ul de fișiere statice în build.
- Capturi finale inspectate: [bagaj mobil RO 390 px](task-5a-mobile-luggage-390.png), [pașaport desktop FR 1440 px](task-5a-desktop-passport-fr-1440.png). Scripturi/loguri: `/tmp/travel-buddy-task5a-browser-review.{py,log}`, `...-calendar-review.{py,log}` și `...-r1-repro.py`.

Safari/WebKit, dispozitiv fizic, cititor de ecran și zoom nativ nu sunt verificate în această rundă. Nu se declară certificare WCAG exhaustivă sau acceptare umană a designului. Launcherul Impeccable a răspuns `Permission denied`; contextul și regulile au fost citite direct, fără rularea detectorului. Regulile Vercel actuale au fost descărcate pentru review. Nu s-au reinstalat skill-uri sau reluat explorarea vizuală.

## Limite și gate-uri

Task 5A local este verificat; **Task 5 complet nu este finalizat** și păstrează dependențele Tasks 1–4, autentificare/membership real, API, persistență, idempotency, salvare/reluare și tranziția reală spre generare. Task 4 complet rămâne nefinalizat și dependent de Task 3; ajustările per vacanță sunt excluse din 5A.

**P-09 rămâne FAIL:** zece cereri cold distincte din 100 au depășit 7 ms; p95 exact rămâne necunoscut. Gate B1, Task 3, backendul real și acceptarea online rămân blocate. Task 5A nu rezolvă și nu validează serverul.

Nu s-au repetat CPU/CAS/iPhone, modificat/resetat fixture-uri reale, modificat Firebase/Cloudflare/D1, activat furnizori/costuri, autentificare/API/persistență/sincronizare/căutare/hărți/generare, făcut deploy/publicare sau creat PR. Implementarea și dovezile au fost livrate în `0695cd2a973e635d9534813fc75b8880cb2f4ee5` prin push fără force pe `main`; HEAD și `origin/main` identice și arbore curat au fost confirmate după push. Această confirmare documentară se salvează separat; nu este deploy.
