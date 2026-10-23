# Travel Buddy

Proiect personal pentru doi utilizatori. Implementarea a început cu fundația locală, contractele de date și probe tehnice izolate. Fluxurile aplicației private așteaptă Gate B1; shell-ul actual este tehnic, fără vacanțe sau conturi reale. Nu sunt activate servicii și nu este publicat un site.

## Lucru local

Mediu verificat: Node.js 24 și npm 11. Instalează versiunile fixate în lockfile cu `npm ci --ignore-scripts`. Proiectul blochează implicit scripturile lifecycle ale dependențelor prin `.npmrc`.

```sh
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright cere un browser instalat. Pentru Chromium-ul existent în mediul cloud: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Emularea dimensiunii unui telefon în browser nu validează un telefon real.

## Gate B1

[Contractele v1](docs/contracts-v1.md) sunt sursa comună pentru UI, API și probe. [Planul probelor](docs/plans/2026-10-23-technical-probes.md) separă rezultatele locale de D1/Worker/Firebase reale și de telefoane. Testele locale nu închid acest gate. Activarea serviciilor și publicarea necesită acord separat; fără card, billing sau upgrade automat.

Tasks 0–1 și probele locale Task 1b au trecut verificarea: 75 teste, tipuri, lint, build și 2 E2E Chromium. [Dovezi și limite](docs/evidence/2026-10-23/README.md). [Proba server](probes/README-server.md) pregătește accesul privat, confirmarea concurentă și măsurarea CPU; [mini-proba offline](probes/offline/README.md) are propriul build `npm run build:probe`. Serviciile reale și telefoanele rămân nevalidate.

## Harta proiectului
- `AGENTS.md`: punctul de intrare pentru agenți.
- `docs/memory.md`: context durabil, stare și următorul pas.
- `docs/product.md`: cerințe și aprobări de produs.
- `docs/process.md`: delegare, review, corectare și predare.
- `docs/plan.md`: etape și progres.
- `docs/decisions.md`: decizii și motive.
- `docs/skills.md`: skill-uri, versiuni, utilizare și limite.
- `docs/verification.md`: dovezi și limite ale verificărilor.
- `.agents/skills/`: skill-uri locale, inclusiv resursele upstream.
- `.codex/agents/`: roluri reutilizabile pentru agenți.

Fotografiile exacte Lisabona pentru introducere rămân de recuperat. Machetele aprobate sunt păstrate în `docs/mockups/`; nu sunt fotografii de producție sau probe de funcționare.
