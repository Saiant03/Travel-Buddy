# Travel Buddy — sistem vizual propus

## Snapshot implementat — Task 2 local, 2026-11-02

Shell-ul demonstrativ folosește Bricolage Grotesque găzduit local cu OFL și proveniență și tokenuri CSS centralizate pentru culoare, focus și suprafețe. Valorile implementate sunt **propuneri ajustabile**, nu aprobări noi. Reviewul browser și contrastele măsurate sunt în [dovada Task 2](evidence/2026-11-02/task-2-ui.md); nu există aprobare umană finală a percepției designului.

**Scop:** contract de design pentru pregătirea implementării. Este o sinteză de lucru, nu o machetă nouă și nu o aprobare implicită a detaliilor care nu au fost confirmate. Machetele descrise în [mockups.md](mockups.md) sunt repere vizuale statice; nu dovedesc funcționarea, lizibilitatea la dimensiuni reale sau accesibilitatea. Fișierele PNG la care se referă notele nu sunt prezente în copia locală inspectată.

## Ce este deja aprobat și ce rămâne propunere

**Aprobat explicit de utilizator:** fontul Bricolage Grotesque; paleta verde pădure, ivoriu/alb cald și auriu; jurnalul de călătorie cu bilete, pașaport și ștampile; Buddy ca leneș prietenos maro și crem, cu rucsac verde; imaginile specifice destinațiilor pe cardurile vacanțelor. Este aprobată direcția de generare „pașaport cu ștampile + atelierul lui Buddy”. Sunt aprobate vizual ecranele descrise în inventarul de mai jos, fiecare cu limitele notate în [mockups.md](mockups.md). Pentru creare este confirmat titlul exact **„Cum explorăm și unde stăm?”**; aprobarea vizuală a scenei a doua și a treia este consemnată, prima scenă nu are confirmare separată.

**Propuneri ale acestui document, încă neaprobate ca valori exacte:** coduri hex, scară tipografică, spațieri, raze, reguli de compoziție responsive, forma tehnică a componentelor și animațiile. Se folosesc ca punct de plecare pentru implementare și se ajustează după verificarea reală. Recomandarea tehnică de planificare este în [architecture.md](architecture.md); nu este activată și probele de fezabilitate rămân neexecutate.

## Direcția și tokenurile propuse

Un carnet de călătorie contemporan: fiecare ecran are o singură metaforă funcțională (bilet pentru destinație, carnet pentru preferințe, itinerar pentru traseu), iar ornamentul de hârtie și ștampilele susține orientarea. În ecranele de lucru, informația și acțiunea rămân în prim plan; Buddy este companion discret, mai vizibil doar în introducere, stări goale și pregătirea itinerariului. Evităm să transformăm fiecare suprafață într-un teanc de carduri identice sau fiecare control într-un obiect ilustrat.

Valorile de mai jos sunt **propuneri**, alese pentru a da nume și puncte de pornire aprobărilor cromatice existente. Contrastul perechilor trebuie măsurat înainte de implementare.

| Rol | Token propus | Valoare propusă | Utilizare |
|---|---|---:|---|
| Cerneală pădure | `forest-900` | `#173B32` | text principal pe ivoriu, navigare și zone forestiere |
| Verde principal | `forest-700` | `#285B49` | acțiuni principale și stări selectate; verificare contrast obligatorie |
| Verde pal | `leaf-100` | `#E5EDE4` | zone secundare și selecții discrete |
| Hârtie ivorie | `paper-100` | `#F7F3E8` | fundal principal, cu suprafețe albe calde pentru formulare |
| Hârtie deschisă | `paper-0` | `#FFFEFA` | panouri de citire și controale pe fundal colorat |
| Auriu ștampilă | `gold-600` | `#A77525` | detalii și accent; niciodată singur pentru text mic dacă nu trece contrastul |
| Cerneală secundară | `ink-700` | `#414A43` | text secundar și descrieri |
| Eroare | `error-700` | `#A23E36` | erori explicate prin text și simbol, nu doar culoare |

**Tipografie propusă:** Bricolage Grotesque pentru titluri și corp, în greutăți moderate și lizibile; sursa Google Fonts și licența OFL 1.1 sunt inventariate mai jos. Fișierul WOFF2 self-hosted nu a fost încă produs sau verificat. Rezervă de sistem sans-serif numai cât să păstreze lizibilitatea în cazul în care fontul nu se încarcă. Folosiți propoziții și majuscule normale, nu etichete cu majuscule răsfirate. Scară de pornire: corp 16–18 px, text secundar minimum 14 px, titluri de pagină 28–36 px pe telefon și 36–48 px pe desktop; aceste dimensiuni sunt propuneri și trebuie verificate cu textul românesc, englez și francez. Rândurile de text curent rămân în general sub 75 de caractere.

**Forme și spațiu propuse:** ritm de 4/8 px; spațiu de lucru pe telefon 16–20 px, pe ecrane mari 24–32 px; borduri de hârtie fine și umbre rezervate obiectelor care se suprapun cu adevărat. Colțuri 8–12 px pentru controale și panouri, colțuri mai organice numai la ilustrații. Ștampilele, perforațiile și liniile de carnet au semnificație (selectat, parcurs, confirmat), nu se aplică decorativ fiecărui rând.

## Componente și contracte reutilizabile

Componentele sunt contracte de interfață, nu cod deja existent. Toate etichetele și stările se traduc separat în română, engleză și franceză; componentele nu conțin texte fixe în română în implementare.

| Componentă propusă | Date afișate și acțiune | Stări de proiectat | Accesibilitate |
|---|---|---|---|
| `AppShell` / navigare | pagina activă, contul curent, acces la Vacanțe și Preferințele mele | autentificat, încărcare, eroare, fără sesiune | elemente native de navigare; titlu de pagină unic; focus vizibil |
| `DestinationArtwork` | destinație, reper/atmosferă, creditul imaginii când e necesar; cardul duce la itinerar | imagine disponibilă, întârziată, lipsă, eroare | text alternativ potrivit rolului; dacă imaginea e decorativă, alt gol; nu transmite singură numele destinației |
| `TripCard` | nume, perioadă/zile, transport, imagine, acțiunea „Deschide itinerariul” | normal, deschis, loading/error | țintă tactilă generoasă; nu face întreg cardul un link imbricat cu butoane |
| `TicketField` | destinație editabilă, perioadă sau număr de zile | neatins, valid, invalid, sugestii, completat | câmpuri cu etichete persistente; autocomplete și erorile legate programatic |
| `TransportChoice` | numai opțiunile aprobate: pe jos, transport public, mașină; selecțiile se pot combina | neales, ales | buton/comutator nativ, multi-select anunțat, activare tastatură; selecția nu depinde de tragere |
| `StaySegment` | una sau mai multe cazări/localități și intervalele lor; ore de sosire/plecare opționale | gol/omis, complet, în editare, invalid | grupuri de câmpuri etichetate; adăugare și ștergere explicite; păstrarea datelor la revenire |
| `PreferenceNotebook` / `PreferenceEntry` | cele cinci categorii, căutare, element concret, un răspuns, notă opțională | necunoscut, selectat, editat, salvat, eroare | controale selectabile cu text; răspunsuri distincte și anunțate; stare necunoscută diferită de refuz; fără semnificație doar prin culoare |
| `PreferenceCategoryProgress` | progresul fiecărui profil prin categoriile aprobate | neînceput, în curs, complet, eroare la salvare | textul stării există fără ștampilă; nu presupune că utilizatorul poate edita profilul partenerului |
| `ItineraryDayNav` | zilele, ziua curentă și navigarea între zile | zi curentă, altă zi, nume lungi/îngust | butoane native, stare selectată anunțată; derulare tastabilă sau alternativă vizibilă |
| `StopList` / `StopItem` | opriri ordonate, fotografie, nume, motiv, preț și program cu starea sursei, link și detalii | încărcare, disponibil, date parțiale/neconfirmate, fără fotografie, eroare | număr și ordine disponibile textual; etichete pentru preț/program; sursa are nume descriptiv |
| `MapListSwitch` / `RouteMap` | aceeași listă de opriri și traseul zilei; comutator Listă/Hartă pe telefon | listă, hartă, online indisponibil, poziție fără hartă | harta are listă echivalentă textuală; culori/numere contrastante; comutarea funcționează cu tastatura |
| `PlaceDetailPanel` | oprire selectată, contextul zilei, sursa, editare/ștergere și revenire | deschis, încărcare, informații incomplete, eroare | dialog/panou cu titlu, focus prins și restaurat dacă modal; buton de închidere numit; focus nu se pierde |
| `BuddyProposal` | mesaj, diferențe (eliminat/păstrat/adăugat), noua ordine și acțiunea explicită de confirmare | compunere, pregătire, propus, plan schimbat/reconfirmare, aplicat, eroare | schimbarea nu se aplică la simpla conversație; rezumat textual înainte de confirmare; statusul nu se bazează pe culoare |
| `GenerationProgress` | numai etape despre care există progres real și mesaje concrete | în așteptare, activ, terminat, blocat, incomplet, eșuat, reîncercabil | actualizări anunțate moderat pentru cititoare de ecran; nu anunță fiecare animație; rezultate parțiale separate |
| `OfflineCopyStatus` | dispozitiv, limbă, data copiei, disponibilitatea actualizării și acțiunile de salvare/deschidere | nesalvat, salvat, actualizare disponibilă, actualizare, eșec cu copie păstrată | starea și data lizibile; salvarea e explicită; un eșec nu raportează fals succes |
| `BuddyIllustration` | companion static sau scenă mică asociată unui moment | static, mișcare activată, mișcare redusă | alt gol dacă decorativ; dacă transmite progres, text echivalent; nu acoperă controale |
| `SourceNotice` | sursă, momentul verificării și indicatorul de incertitudine | confirmat, neconfirmat, lipsă, necesită verificare la local | etichetă verbală completă și link accesibil; incertitudinea nu se ascunde în tooltip |

Nu se desenează un control nou doar pentru a arăta „ca biletul”: intrările, selecțiile, butoanele și linkurile păstrează forma și comportamentul previzibil. Înlocuirea/eliminarea unei opriri cere un rezumat al efectului și păstrează restul planului conform cerințelor din [product.md](product.md).

## Maparea ecranelor

### Pagina introductivă: șase momente conectate

Ordinea aprobărilor din produs este fixă: **1. introducere → 2. preferințele celor doi → 3. destinația devine itinerar → 4. cerere către Buddy, rezumat și confirmare → 5. planul salvat offline → 6. conectare**. Compoziția aprobata folosește o demonstrație evolutivă a planului, cu un traseu grafic care continuă prin pagină și leagă secțiunile în timpul derulării. Pe măsură ce utilizatorul parcurge momentele, aceeași destinație se transformă vizual în zile și opriri, apoi într-o modificare confirmată și o copie disponibilă offline. Traseul este un fir editorial, nu hartă geografică sau informație de rută.

Propunere de execuție: pe telefon demonstrația rămâne într-o coloană, cu scene verticale și progresul lizibil fără animație; pe desktop firul poate traversa compoziția pe lățime, iar textul fiecărui moment rămâne într-o coloană de lectură. Două fotografii autentice Lisabona apar ca momente vizuale, cu sursele recuperate și atribuite înainte de folosire. Mișcarea calmă legată de scroll este aprobată ca idee pentru pagina introductivă; păstrați conținutul și în varianta `prefers-reduced-motion`, fără a depinde de scroll ca singura metodă de progres. Buddy este mic și nu întrerupe demonstrația. Acțiunea de conectare conduce la formularul privat, fără înregistrare publică sau asociere de conturi vizitatori.

| Ecran / suprafață | Structură recomandată | Referință și statut |
|---|---|---|
| Introducere publică | povestea în șase momente: (1) introducere, (2) preferințele celor doi, (3) destinația devenind itinerar, (4) modificare prin conversație și confirmare, (5) plan salvat offline, (6) conectare. O demonstrație evolutivă și o linie/traseu scroll leagă momentele; funcțiile domină, Buddy este discret | compoziția evolutivă și traseul scroll sunt aprobate în [product.md](product.md); două fotografii Lisabona cerute, referințele exacte nerecuperate. Animațiile calme explică transformarea |
| Conectare | ecran de login email și parolă Firebase pentru cele două conturi private precreate, cu resetarea parolei prin Firebase | fără înscriere publică, signup sau flux public de asociere; recomandarea este Firebase Authentication și allowlist server-side cu exact cele două UID-uri aprobate de administrator, conform [architecture.md](architecture.md) |
| Vacanțele noastre | listă cu imagini specifice destinației, acțiune pentru vacanță nouă; stare înaintea primei călătorii | aprobată vizual conform descrierii din `mockups.md`; PNG local absent |
| Creare — biletul destinației | un singur moment pe ecran: destinație și perioadă sau număr de zile, ilustrație specifică | flux în trei momente este cerință; prima scenă din concept nu are aprobare vizuală separată |
| Creare — „Cum explorăm și unde stăm?” | jetoane de transport selectabile, cazări/baze opționale și repetabile, ore opționale | titlul și scena a doua aprobate vizual; orice mișcare rămâne propunere |
| Creare — pașaport și rezumat | verificarea valorilor și stării ambelor profiluri, ajustarea profilului propriu la vacanță, acțiunea finală explicită | scena a treia aprobată vizual; datele și rezervările din exemplu nu sunt reale |
| Generare | etapă activă vizibilă, mesaje legate de progres real, Buddy în atelier, rezultate parțiale separate | direcția vizuală aprobată; ecranul trebuie să reflecte etapele reale, nu procente inventate |
| Preferințe | carnet reutilizat pentru cele cinci categorii; căutare, grupuri exacte, starea fiecărui profil, alergii separat | carnetul alimentar și cel „Atracții și cultură” aprobate vizual; categoriile rămase reutilizează același tipar, nu machete noi obligatorii |
| Itinerar zilnic | navigare pe zile, listă și hartă alăturate pe desktop; comutator Listă/Hartă pe telefon, ordinea opririlor, sugestii alimentare opționale | harta online este aprobată; harta, navigarea și recomandările noi necesită internet. Numărul de opriri din exemplu nu este limită |
| Detalii loc | panou care păstrează contextul zilei, fotografie, motiv, preț/program cu incertitudine și sursă | aprobat vizual; conținutul fotografic al machetei este ilustrativ |
| Conversație Buddy | cerere și rezumat de diferențe; confirmare sau reconfirmare înainte de aplicare | aprobată vizual; claritatea interacțiunii se evaluează în browser |
| Copie offline | starea copiei pe acest telefon, limbă și dată, salvare/actualizare, ultima copie completă | aprobată vizual; macheta nu dovedește stocarea offline |

Referințele și statutul aprobărilor sunt descrise în [mockups.md](mockups.md), [product.md](product.md) și [verification.md](verification.md). Legăturile către imagini din `docs/mockups/` sunt căi notate în documente, dar fișierele respective lipsesc din copia locală inspectată; nu sunt legături către imagini disponibile acum.

## Telefon și desktop

**Telefon (prioritatea inițială de verificare):** o coloană, spațiu lateral confortabil, butoane ușor de atins, câmpuri cu etichete persistente și acțiunea principală la îndemână. Fluxul de creare prezintă un singur moment odată, cu revenire care păstrează valorile. Itinerarul comută între listă și hartă, nu le micșorează pe amândouă în aceeași vedere. Un panou de detalii folosește ecranul disponibil și permite revenirea la aceeași zi/poziție. Preferințele sunt listă filtrabilă; nu cere gesturi de tragere sau ținte precise.

**Desktop:** aceeași ordine și aceleași funcții, într-un container de citire cu lățime controlată. Navigarea și sumarul vacanței pot ocupa o coloană laterală; conținutul principal rămâne dominant. În itinerar se pot afișa lista și harta alături numai dacă lățimea le permite fără comprimarea textului; altfel se păstrează comutatorul. Formularele nu se întind pe toată lățimea ecranului. Dialogurile și panourile laterale nu ascund permanent contextul.

Rupturile responsive se decid după conținut și spațiul minim de citire, nu după un singur model de telefon. Verificările planificate pe telefon/desktop și notele despre stări sunt în [verification.md](verification.md); până acum nu există randare în browser evaluată.

## Mișcare și `prefers-reduced-motion`

Mișcarea este propunere, nu aprobare suplimentară. Dacă se implementează: jetoanele pot intra vizual în bagaj după selectare; pașaportul poate prelua rezumatul; Buddy poate avea o mișcare scurtă în ecranul de pregătire. Fiecare animație pornește ca răspuns la o acțiune sau la progres real, are durată scurtă, nu ascunde textul și nu pornește generarea înaintea butonului explicit. Nu se animă decorul în buclă și nu se mută automat atenția.

Respectați `prefers-reduced-motion: reduce`: eliminați deplasarea, parallax-ul și mișcările decorative; păstrați schimbarea de stare instantaneu sau cu fade foarte scurt, iar toate funcțiile trebuie să rămână disponibile. Butoanele/atingerea sunt echivalente cu orice gest vizual. Indicatorul de generare trebuie să aibă text de stare și progres semnificativ; animația singură nu poate indica activitatea. Dacă tabul devine ascuns, nu continuați animații decorative intensive. GSAP nu este cerut; recomandarea tehnică și probarea dependențelor urmează [architecture.md](architecture.md).

## Inventarul imaginilor și drepturile de utilizare

Licența și atribuirea se verifică pentru **fiecare fișier**, înainte de includere. Manifestul planificat `src/assets/manifest.json` va conține cel puțin: destinație/subiect, URL de origine, autor, licență și URL-ul licenței, textul atribuirii, data descărcării, dimensiuni, variante decupate, rol în produs și stare de verificare. Nu folosiți capturi ori imaginile din machete ca fotografii ale locurilor. Dacă după căutare nu se găsește o fotografie utilizabilă pentru un loc recomandat, compromisul aprobat permite păstrarea locului ca recomandare de rezervă, cu lipsa fotografiei indicată explicit și link pentru verificare.

| Asset / rol | Sursă și licență | Atribuire | Stare și variante |
|---|---|---|---|
| Font Bricolage Grotesque | Google Fonts, `google/fonts`, `ofl/bricolagegrotesque`; metadatele declară SIL Open Font License 1.1, subseturile `latin` și `latin-ext`, axele variabile wght 200–800, wdth 75–100, opsz 12–96. Surse verificate: [METADATA.pb](https://github.com/google/fonts/blob/main/ofl/bricolagegrotesque/METADATA.pb), [OFL.txt](https://github.com/google/fonts/blob/main/ofl/bricolagegrotesque/OFL.txt) | păstrați `OFL.txt` alături de fișierul fontului distribuit; copyright-ul menționează Bricolage Grotesque Project Authors și proiectul ateliertriay | alegerea aprobată. Propunere: self-host WOFF2 variabil, subset Latin-ext pentru română/franceză și semnele folosite de engleză; transformați sursa TTF oficială și verificați cmap/accente, apoi păstrați subsetul și licența în `public/assets/font/`, conform [planului de execuție](plans/2026-10-23-implementation.md). Fișierul real se adaugă la execuție, nu este descărcat în acest document |
| Două fotografii pentru introducerea Lisabona | referințele exacte nu au fost recuperate; candidatele trebuie să vină din sursă cu licență clară, de ex. Commons per fișier, fără presupunerea că orice conținut Commons are aceeași licență | obligatorie după fișier și licență; câmpurile sunt încă necunoscute | **nerecuperate**; două fotografii cerute în notele proiectului. Nu sunt presupuse local și nu sunt înlocuite aici |
| Ilustrație Lisabona pentru cardul destinației | descriere recuperată din GitHub în `product.md`/`mockups.md`; fișierul machetei lipsește local. Creatorul și licența ilustrației originale nu sunt consemnate aici | atribuire necunoscută până la recuperarea fișierului/sursei | referință vizuală acceptată pentru stilul destinațiilor, nu asset de producție verificat; se poate reface ca ilustrație vectorială proprie cu elemente recognoscibile |
| Ilustrație Madeira pentru cardul destinației | aceeași limită: descriere GitHub, PNG local absent, autor/licență originală necunoscute | atribuire necunoscută până la recuperare ori refacere originală | referință vizuală acceptată pentru stil; nu fotografie verificată și nu fișier disponibil |
| Fotografiile locurilor recomandate | Commons este o sursă posibilă conform [feasibility.md](feasibility.md); control pe licența fișierului individual | stocați autorul, linkul sursei și licența per imagine | compromis deja acceptat: căutați o fotografie utilizabilă; dacă nu există, locul poate rămâne recomandare de rezervă cu lipsa fotografiei indicată explicit și link pentru verificare. Copia offline păstrează local numai fotografiile permise de drepturile/condițiile respective; fără generare API obligatorie |
| Buddy și ilustrații editoriale | mascotă originală desenată pentru produs; sursa desenului și atribuirea/licența internă se notează la creare | licența internă a asset-urilor produsului se consemnează în manifest | IDs propuși: `buddy.idle.v1` (repaus, 256×256), `buddy.organize.v1` (aranjează bilete/fișe, 512×512), `buddy.success.v1` (plan gata, 256×256), `buddy.error.v1` (ajută la reluare, 256×256). SVG static, viewBox pătrat; aceeași siluetă/culori, variații mici de postură. Rezoluția de randare propusă, se poate exporta PNG pentru compatibilitate |
| Icoane tematice | desen original în proiect, stil linie/umplere coerentă, 24×24 px cu canvas SVG de 24; surse externe/licențe nu sunt necesare dacă sunt create intern | fișierele proprii se înregistrează cu autor și licență de proiect | IDs propuși: `transport.walk.v1`, `transport.transit.v1`, `transport.car.v1`; `preference.food.v1`, `preference.culture.v1`, `preference.nature.v1`, `preference.relaxation.v1`, `preference.shopping.v1`; ID-uri de stare `stamp.pending.v1`, `stamp.active.v1`, `stamp.done.v1`, `stamp.warning.v1` |
| Texturi de hârtie | pattern-uri SVG originale, fără raster extern | asset intern, licență proiect | IDs propuși: `texture.paper-grain.v1`, `texture.ticket-perforation.v1`, `texture.passport-lines.v1`, `texture.stamp-ink.v1`; folosiți doar pe suprafețe mari și foarte discret, fără să scadă contrastul |
| Ilustrații de țară/oraș pentru destinații noi | **soluție propusă, zero cost și fără generare API:** vector propriu din forme simple și catalog manual de repere recognoscibile; alternativ fotografie cu licență deschisă și atribuire pentru card | asset propriu sau atribuire per fotografie; nu creați impresia de aprobare oficială a reperelor | schema de înregistrare: `destination.lisbon.card.v1`, `destination.madeira.card.v1` și pentru noi `destination.<slug>.card.v1`; câmpuri `place`, `landmark`, `source`, `license`, `credit`, `variants`. Variante propuse 4:3 card (1200×900), 16:9 introducere (1600×900), pătrat (800×800), miniatură offline (480×360). Card tipografic cu numele destinației la lipsa unui asset; fără apel API |
| Hărți și schițe de traseu | machetele descriu hartă ilustrativă, nu date cartografice verificate; orice hartă reală are furnizor, atribuire și condiții proprii | vizibil conform furnizorului; verificat înainte de folosire | harta online și traseul zilnic sunt cerințe aprobate; furnizorul și integrarea încă nu au probe funcționale. Harta offline nu face parte din V1; copia offline conține planul și fotografiile permise, iar harta necesită internet |

Pentru orice destinație nouă, recomandarea realistă este un **catalog gradual de asset-uri**: șablon card tipografic valabil pentru orice loc, apoi ilustrații proprii pentru destinațiile prioritare și fotografii licențiate când se găsesc. Păstrați aceeași ramă editorială și schimbați reperul, accentul local și decupajul. Astfel nu există cost API de generare obligatoriu și o destinație nouă are totuși un card funcțional.

Manifestul planificat pentru implementare este `src/assets/manifest.json` (cale planificată, nu fișier existent). Fiecare intrare are `id`, `path`, `role`, `sourceUrl`, `author`, `license`, `licenseUrl`, `credit`, `createdAt`, `variants`, `width`, `height`, `format`, `offlineAllowed` și `status`. Pentru asset-uri fără sursă externă, `sourceUrl` poate fi null, dar autorul/licența de proiect și starea trebuie completate. Clientul offline copiază numai asset-urile marcate `offlineAllowed: true`; condițiile fiecărei licențe rămân decisive. Fotografiile introducerii Lisabona au ID-uri provizorii `intro.lisbon.photo-01` și `intro.lisbon.photo-02`, dar sursele, URL-urile și atribuirea lor lipsesc încă. Acestea sunt sloturi de inventar, nu imagini recuperate.

## Limite cunoscute

Nu s-a văzut sau comparat niciun PNG local; descrierile și aprobările provin din documentația recuperată din GitHub. Licența OFL 1.1 și metadatele Bricolage Grotesque au fost verificate documentar în Google Fonts, însă fontul nu a fost distribuit, iar conversia WOFF2, acoperirea cmap, randarea în browser și licențele ilustrațiilor nu au fost verificate. Nu s-au măsurat culori/contrast sau dimensiuni în browser. Nu există cod de interfață, asset-uri validate, animații sau test pe telefon. Acest document pregătește implementarea și păstrează separat faptele aprobate, propunerile și golurile de material.
