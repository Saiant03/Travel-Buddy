# Skill-uri locale

| Skill | Rol | Origine |
|---|---|---|
| `design-taste-frontend` | Explorare și direcție vizuală după brief | [Taste](https://github.com/Leonxlnx/taste-skill), `skills/taste-skill`, commit `6010f91a9935f1c167dfc500fb1a475681892e6b` |
| `impeccable` | Audit UI, accesibilitate, responsive și finisare | [Impeccable](https://github.com/pbakaus/impeccable), `.agents/skills/impeccable`, commit `8644175285360c166e57b1e35ecadfbc85ff5209` |
| `travel-buddy-engineering` | Structură, contracte, date și verificări de cod | Propriu proiectului |
| `travel-buddy-review` | Review cu dovezi și reverificarea remedierilor | Propriu proiectului |
| `frontend-design` | Bază oficială Anthropic pentru compoziție, tipografie și identitate vizuală | [Anthropic](https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design), `skills/frontend-design`, commit `dbd4588f9e1033efb41dad4bef2f7947c8993d44` |
| `ui-ux-pro-max` | Bază de date locală pentru stiluri, palete, UX și recomandări de implementare | [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), `.claude/skills/ui-ux-pro-max`, commit `623a9a9037d006ea727f8213f084d02a6b6f11b5` |
| `web-design-guidelines` | Review de cod UI după regulile Vercel | [Vercel](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/web-design-guidelines), `skills/web-design-guidelines`, commit `063bee94c3f4df8453406c830b0a7df0f2860278` |
| `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-utils`, `gsap-react`, `gsap-frameworks`, `gsap-performance` | Pachetul oficial GSAP: API, secvențe, scroll, pluginuri, utilitare, integrare și performanță | [GreenSock](https://github.com/greensock/gsap-skills), directoarele omonime din `skills/`, commit `aed9cfd3277740755f6bfc1155c7aa645403b760` |
| `grill-me` | Clarificarea ideii prin întrebări individuale și recomandări | [Matt Pocock](https://github.com/mattpocock/skills/tree/a77fa6e7a6726f687aa36455b27ed8b7d09afdff/grill-me), `grill-me`, commit `a77fa6e7a6726f687aa36455b27ed8b7d09afdff` |
| `write-a-prd` | Documentul cu problema, funcțiile, limitele și criteriile de reușită | [Matt Pocock](https://github.com/mattpocock/skills/tree/a77fa6e7a6726f687aa36455b27ed8b7d09afdff/write-a-prd), `write-a-prd`, același commit |
| `improve-codebase-architecture` | Îmbunătățirea organizării și verificabilității codului existent | [Matt Pocock](https://github.com/mattpocock/skills/tree/a77fa6e7a6726f687aa36455b27ed8b7d09afdff/improve-codebase-architecture), `improve-codebase-architecture`, același commit |
| `writing-plans` | Sarcini mici, cu fișiere, contracte și pași de verificare | [Superpowers](https://github.com/obra/superpowers/tree/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/writing-plans), `skills/writing-plans`, commit `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b` |
| `test-driven-development` | Test eșuat → implementare → test trecut → curățarea codului | [Superpowers](https://github.com/obra/superpowers/tree/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/test-driven-development), `skills/test-driven-development`, același commit |
| `using-git-worktrees` | O copie separată de lucru când este necesară izolarea | [Superpowers](https://github.com/obra/superpowers/tree/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/using-git-worktrees), `skills/using-git-worktrees`, același commit |
| `webapp-testing` | Verificarea comportamentului site-ului cu Playwright | [Anthropic](https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/webapp-testing), `skills/webapp-testing`, commit `dbd4588f9e1033efb41dad4bef2f7947c8993d44` |
| `code-review-and-quality` | Review al comportamentului, clarității, structurii, securității și performanței | [Addy Osmani](https://github.com/addyosmani/agent-skills/tree/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/code-review-and-quality), `skills/code-review-and-quality`, commit `aeac41d4d005999432bb7312f7ff06383a91d59d` |
| `caveman` | Comprimarea mesajelor tehnice între agenți | [Julius Brussee](https://github.com/JuliusBrussee/caveman/tree/bad48a0e1df55e05e3f52249afa35ecc1909ee76/skills/caveman), `skills/caveman`, commit `bad48a0e1df55e05e3f52249afa35ecc1909ee76` |

Versiunile upstream includ fișierele suport, nu doar `SKILL.md`. Licențele și notificările se păstrează în directoarele respective. `skills-lock.json` înregistrează sursele și hashurile fișierelor instalate.

## Utilizare
Se încarcă doar skill-ul relevant. Nu combinăm automat toate regulile estetice: coordonatorul documentează direcția aleasă după brief și rezolvă contradicțiile în favoarea cerințelor utilizatorului.
Anthropic și Taste susțin direcția aleasă; UI/UX Pro Max oferă cercetare și opțiuni. Impeccable și Vercel verifică aspecte complementare. Modulele GSAP se încarcă în funcție de animație și framework; instalarea lor nu a adăugat GSAP ca dependență a aplicației.
Instalarea este locală proiectului. Skill-urile vor fi disponibile pentru descoperire la următoarea tură; dacă nu apar, redeschide sesiunea. Până atunci, fișierele pot fi citite explicit.

## Limitele verificării inițiale
Au fost inspectate manifestele și resursele instalate. Aceasta nu este o certificare de securitate a întregului cod upstream.
Instalarea nu activează hooks și nu rulează automat utilitarele furnizorilor.
Launcherul Impeccable poate descărca un executabil la prima utilizare. Taste include scripturi Node pentru asseturi și verificare în browser. Aceste fluxuri se verifică atunci când sunt folosite; succesul instalării nu dovedește funcționarea lor.

## Particularități ale extinderii din 2026-10-22
- Prima extindere a dus inventarul la 15 skill-uri: cele patru inițiale plus trei skill-uri noi și opt module GSAP. Impeccable a fost păstrat fără duplicare sau actualizare.
- UI/UX Pro Max include datele CSV, referințele și scripturile. Manifestul sursă utiliza `${CLAUDE_PLUGIN_ROOT}`; comenzile din `SKILL.md` au fost adaptate la calea absolută a acestui proiect. Originalul este păstrat în `SKILL.upstream.md`. La mutarea proiectului trebuie actualizate aceste căi.
- Căutarea UI/UX Pro Max se execută cu Pythonul funcțional al sesiunii; aliasul Windows `python` nu este presupus funcțional. Testul de căutare locală `keyboard focus --domain ux --json` a returnat trei rezultate.
- Vercel cere descărcarea regulilor actuale din `vercel-labs/web-interface-guidelines/main/command.md` înainte de fiecare review. Skill-ul nu este un scanner automat pornit permanent și numărul regulilor poate varia; commitul fix al manifestului nu fixează și regulile remote.
- Licența Anthropic este inclusă în `frontend-design/LICENSE.txt`; licențele UI/UX Pro Max și GSAP sunt păstrate în directoarele lor. În directorul Vercel și la rădăcina repository-ului verificat nu a fost identificat un fișier de licență separat.

## Extinderea pentru planificare, cod și verificare
Inventarul curent are **24 de skill-uri**. Sunt instalate cele nouă adăugate mai sus; Impeccable cerut din nou este aceeași instalare existentă. Alternativele „Interview Me” și „Code Judo” sunt acoperite de variantele alese `grill-me` și `code-review-and-quality`.

Cele trei skill-uri Matt Pocock sunt fixate la versiunea istorică care conține exact comenzile autonome cerute. La verificare, versiunea curentă mutase/înlocuise `write-a-prd`, iar `grill-me` era un alias către un alt skill. Versiunea istorică este aleasă explicit și nu este prezentată drept cea mai nouă.

Adaptările locale sunt înregistrate în `skills-lock.json`, iar manifestele originale sunt păstrate în `SKILL.upstream.md`:
- PRD-ul se scrie în `docs/product.md`. Propunerile de arhitectură rămân locale; instrucțiunile upstream pentru publicare pe GitHub au fost înlocuite.
- `docs/plan.md` rămâne harta proiectului; planurile detaliate se salvează în `docs/plans/` când avem o funcționalitate definită. Delegarea folosește `docs/process.md`, fără a cere skill-uri Superpowers de execuție neinstalate.
- Interviul vine cu o recomandare și un exemplu simplu, o întrebare pe rând. Alegerea detaliilor tehnice revine coordonatorului.
- TDD se aplică comportamentelor testabile și regresiilor; instalarea skill-urilor și documentația nu cer teste artificiale. Nu ștergem munca existentă pentru a aplica retroactiv regula „testul înainte”.
- Caveman are domeniu limitat la mesajele dintre agenți. Nu comprimă explicațiile adresate utilizatorului și nu activează un mod persistent pentru conversație. Nu am instalat proxy, hooks sau serviciile Caveman.
- Exemplele de worktree se traduc în PowerShell și în uneltele native disponibile. Nu s-a creat niciun worktree și nu s-a inițializat Git în această etapă.
- Checklisturile externe de securitate și performanță ale skill-ului de review sunt incluse în propriul director `references/`, iar căile au fost corectate.
- Webapp Testing este instalat cu exemple și helper. Motorul Playwright, browserele și aplicația sunt lucruri separate; nu declarăm teste de browser executate doar pentru că skill-ul există.

Explicațiile simple în română sunt o preferință durabilă în `AGENTS.md` și `memory.md`, aplicabilă tuturor skill-urilor.

## Surse pentru structură
- [Documentația OpenAI pentru skill-uri locale](https://learn.chatgpt.com/docs/build-skills)
- [Documentația OpenAI pentru subagenți și modele](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Convenții opționale pentru context și proces](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex)
