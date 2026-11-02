# Travel Buddy

Proiect personal pentru doi utilizatori. Aplicația completă nu este încă implementată. Există două probe tehnice Cloudflare, cu Firebase Authentication și o bază D1 dedicată probei server.

## Stare actuală — 2 noiembrie 2026

Probele autentificate Alpha/Beta au trecut accesul 10/10 și CAS/idempotency 14/14. Proba CPU a fost trimisă, dar măsurătorile Cloudflare necesare verdictului P-09 lipsesc. Offline desktop este trecut; telefonul nu este demonstrat de dovezile păstrate. [Jurnalul Alpha/Beta](docs/operations/2026-11-02-alpha-beta-verification.md) păstrează rezultatele și limitele. Accesul administrativ Firebase a fost raportat funcțional într-o sesiune nouă cu mediul Travel-Buddy; accesul Cloudflare persistent rămâne de verificat.

Aplicația completă nu este implementată, iar facturarea nu este autorizată. Machetele și planul produsului rămân repere; probele tehnice nu demonstrează funcționarea produsului complet.

## Harta proiectului
- `AGENTS.md`: punctul de intrare pentru agenți.
- `docs/memory.md`: context durabil, stare și următorul pas.
- `docs/product.md`: brief și întrebări deschise.
- `docs/process.md`: delegare, review, corectare și predare.
- `docs/plan.md`: etape și progres.
- `docs/decisions.md`: decizii și motive.
- `docs/skills.md`: skill-uri, versiuni, utilizare și limite.
- `docs/verification.md`: dovezi pentru pregătirea inițială.
- `docs/operations/2026-11-01-probe-recovery.md`: continuitatea verificărilor reale Cloudflare/Firebase și următorii pași.
- `.agents/skills/`: skill-uri locale, inclusiv resursele upstream.
- `.codex/agents/`: roluri reutilizabile pentru agenți.

Următorul pas operațional se stabilește din jurnalul de recuperare; nu reluăm definirea inițială a produsului. Nu există încă o comandă de pornire a aplicației complete.
