# Task 4A — preferințe locale demonstrative, 2026-11-02

Implementare delegată: Sol medium pentru model, Luna medium pentru catalog și remedierea modelului, Terra high pentru UI; coordonatorul a definit contractele, citit difful, verificat integrarea și coordonat remedierile. Primul agent Terra medium s-a oprit fără editări pe scopul complet; coordonatorul nu a preluat implementarea. Reviewul independent al modelului a fost Luna, iar al UI Sol. Punctul de pornire verificat a fost `main`/`origin/main` la `55c2c11`, fără modificări locale existente și fără reset/force.

## Comportament verificat

Ruta `/preferences` oferă cinci carnete, cu grupe și elemente independente, căutare fără diacritice, răspuns exclusiv, ștergere la necunoscut, note opționale și progres derivat din cinci categorii. „Nu am preferințe speciale aici” înlocuiește selecțiile categoriei, iar o selecție nouă înlocuiește această stare. Refuzul și participarea fără interes au etichete distincte. O alegere parcurge categoria, fără a pretinde răspuns pentru fiecare element.

Food are Alimente/Preparate/Băuturi; o căutare caută în toate filele. Cele patru răspunsuri aprobate sunt păstrate, inclusiv pentru precizările structurate ale exemplelor Ceapă și Roșii. Celelalte elemente alimentare pot avea note proprii; nu afișăm „Crud” pentru Espresso. Pentru cele patru categorii non-food, precizările din acest slice sunt note pe element, nu implementarea tuturor filtrelor structurate aprobate pentru produsul complet. Adăugarea unui exemplu local validează denumirea și duplicatele; denumirea introdusă rămâne conținut propriu în toate limbile.

Alergiile, intoleranțele și lista alimentelor de evitat au exemple fictive prestabilite, separat de gusturi. Nu există formular care cere date reale de sănătate, recomandare de restaurant sau promisiune de siguranță alimentară. Textul cere confirmare cu localul inclusiv pentru contaminare. Inventarul alimentar este marcat vizibil drept demonstrativ, extensibil și de rafinat; valorile exacte ale designului rămân propuneri ajustabile.

Starea este numai în memoria aplicației: selecțiile, notele, restricțiile fictive și exemplele adăugate rezistă navigării locale și schimbării limbii, apoi se resetează la reîncărcare. Limba revine la RO. Nu există salvare server/browser, autentificare, sincronizare sau ajustări per vacanță.

## Dovezi TDD și review

- Înaintea UI, testul Playwright a eșuat pe aserțiunea că headingul „Preferințele mele” trebuie să existe; nu a fost eroare de import. Logul inițial: `/tmp/travel-buddy-task4a-ui-red.log`.
- Modelul a început cu teste și stuburi. Prima rulare a avut nouă eșecuri: opt aserțiuni și un TypeError al fixture-ului inițial, nu nouă eșecuri comportamentale curate. Logul inițial a fost ulterior suprascris de remedierea notei; acest fapt limitează portabilitatea dovezii. Eșecurile comportamentale au fost citite direct de coordonator în sesiune.
- Integrarea catalogului a reprodus respingerea cheilor vizuale `label/group/foodTab` de schema strictă; modelul extrage acum numai identitatea elementului. Testul rămâne în suita modelului. Log: `/tmp/travel-buddy-task4a-model-red-catalog.log`.
- Reviewul a găsit pierderea notei unui qualifier când se schimba numai răspunsul. Noul test a eșuat pe nota absentă, apoi a trecut după remediere; modelul are 12/12 teste. Loguri curente: `/tmp/travel-buddy-task4a-model-{red,green}.log`.
- Căutarea între file a eșuat pe `[]` fără `espresso`; adăugarea unui exemplu a eșuat pe denumire absentă înaintea implementării. Loguri: `/tmp/travel-buddy-task4a-search-{red,green}.log` și `/tmp/travel-buddy-task4a-custom-{red,green}.log`.
- Espresso fără grup „Crud”, revenirea focusului după ștergerea răspunsului și după ștergerea precizării au fiecare RED pe aserțiune înainte de fix, apoi GREEN în verificarea finală. Loguri RED: `/tmp/travel-buddy-task4a-ui-u7-red.log`, `...-u7-u8-red.log`, `...-u11-red.log`.
- Coordonatorul a inversat temporar condiția readiness; testul pentru cele cinci categorii a eșuat pe aserțiune. Fișierul a fost restaurat, iar suita a trecut ulterior. Log: `/tmp/travel-buddy-task4a-model-mutation.log`.
- Numele fictiv de 80 de caractere fără spații a produs scrollWidth 950 la viewport 320; după fix scrollWidth este 320. În FR, la viewport 1280 și zoom CSS 200%, antetul depășea până la 1295; după încadrarea pe rânduri scrollWidth este 1280. Nu s-au scris teste artificiale pentru proprietăți CSS sau documentație.

Logurile din `/tmp` descriu sesiunea curentă și nu sunt artefacte versionate portabile. Testele comportamentale sunt versionate. Niciun defect confirmat de review nu a rămas deschis în acest scope; nu există acceptare umană finală a percepției designului.

## Verificarea finală a coordonatorului

- `npm run test`: **130/130**, 17 fișiere, după ultima remediere. Include simulări și fixture-uri locale ale probelor existente; nu sunt reluări CPU/CAS reale.
- `npm run typecheck`, `npm run lint`, `git diff --check`: **PASS**.
- `npm run build`: **PASS**; configurația Playwright a refăcut cu succes buildul produsului și cele două builduri locale de probe după ultima remediere.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- --project=preferences --project=shell`: **9/9 PASS** (7 preferințe, 2 regresii shell), pe buildul local. Nu s-au executat proiectele E2E `server-console` sau `offline-probe` în această rundă. Avertismentele Rollup/Zod `@PURE` și `NO_COLOR` sunt neblocante.
- Browser Chromium independent pe server local: toate cele cinci categorii în RO/EN/FR la 1440, 768, 390 și 320 px fără overflow; `html.lang` corect. Fontul Bricolage este încărcat. Zero `pageerror` și zero cereri externe în captura acestei verificări.
- Tastatură: navigare, Enter pe categorie, Space pe checkbox/radio, săgeți între răspunsuri, ștergere cu revenirea focusului, progres 5/5 apoi 4/5. Preparare crud/gătit și nota au fost verificate independent. Reduced motion activ, zero animații active.
- Zoom **CSS 200%**, la viewport 1280 și 640, pentru toate cele cinci categorii și toate cele trei limbi, fără overflow. Este o aproximare de reflow; zoomul nativ al browserului nu a fost demonstrat. Încercările de control nativ în Chromium headless nu au furnizat o măsurare validă. Nu declarăm PASS pentru zoom nativ.
- Capturi reale inspectate: [mobil RO 390 px](task-4a-mobile-390.png), [desktop FR 1440 px](task-4a-desktop-fr-1440.png). Scriptul și logul matricei sunt `/tmp/travel-buddy-task4a-browser-review.py` și `.log`.

Agentul UI nu a putut relansa browserul final: auto-review a raportat limita de utilizare și imposibilitatea evaluării automate, fără verdict de siguranță. Coordonatorul a executat verificările independente de mai sus. Safari/WebKit, telefon fizic, cititor de ecran și zoom nativ nu sunt verificate în această rundă. Proba iPhone anterioară nu s-a repetat.

## Gate și livrare

Task 4A nu finalizează Task 4 și nu elimină dependența Task 4 de Task 3. P-09 rămâne **FAIL**: zece cereri cold distincte din 100 peste 7 ms; p95 exact necunoscut. Gate B1, Task 3, backendul real și acceptarea online rămân blocate. Nu s-au repetat CPU/CAS/iPhone, resetat fixture-uri reale, modificat Firebase/Cloudflare/D1, activat furnizori/costuri, publicat/deploy sau creat PR. Implementarea a fost livrată prin `c4ffb7d63c23cd8c39d7b798d1bd8f32a16b6d8e` pe `main`; push-ul fără force a fost confirmat, iar HEAD și `origin/main` au fost identice la verificare. Arborele era curat după livrare. Această confirmare documentară se salvează separat; nu este deploy.
