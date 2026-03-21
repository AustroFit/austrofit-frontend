# AustroFit – Screen Flow

Stand: 2026-03-15

## Gesamtübersicht (Mermaid-Diagramm)

> In VS Code mit der Erweiterung "Markdown Preview Mermaid Support" (Ctrl+Shift+V) oder auf GitHub rendern lassen.

```mermaid
flowchart TD
    %% ─── Einstiegspunkte ───────────────────────────────────────────────────
    START([Nutzer öffnet App/Website])
    START --> HOME

    %% ─── PUBLIC SEITEN ─────────────────────────────────────────────────────
    HOME["🏠 / (Startseite)"]
    GW["📚 /gesundheitswegweiser"]
    GW_SLUG["📄 /gesundheitswegweiser/[slug]\n(Artikel + Quiz)"]
    BELOHNUNG["🎁 /belohnung\n(Reward-Marketplace)"]
    PARTNER_WERDEN["🤝 /partner-werden"]
    UEBER_UNS["ℹ️ /ueber-uns"]
    DATENSCHUTZ["🔒 /datenschutz"]
    IMPRESSUM["📋 /impressum"]

    %% ─── AUTH SEITEN ───────────────────────────────────────────────────────
    LOGIN["🔑 /login"]
    REG["📝 /registrierung"]
    REG_LEGACY["📝 /register (Legacy)"]

    %% ─── PROTECTED SEITEN ──────────────────────────────────────────────────
    DASHBOARD["📊 /dashboard\n🔒 Auth required"]
    PROFIL["👤 /profil\n🔒 Auth required"]
    PROFIL_PUNKTE["⭐ /profil/punkte\n🔒 Auth required"]
    PROFIL_GUTSCHEINE["🎟️ /profil/gutscheine\n🔒 Auth required"]

    %% ─── SPEZIAL ───────────────────────────────────────────────────────────
    ONBOARD["🎟️ /onboard/events/[token]"]
    EINSTELLUNGEN["⚙️ /profil/einstellungen\n→ redirect"]

    %% ─── NAVBAR (immer sichtbar) ────────────────────────────────────────────
    subgraph NAVBAR ["🧭 Haupt-Navigation (immer sichtbar)"]
        direction LR
        N_HOME["/ (Logo)"]
        N_GW["/gesundheitswegweiser"]
        N_BEL["/belohnung"]
        N_DASH["/dashboard 🔒"]
        N_PROFIL["/profil 🔒"]
        N_LOGIN["/login"]
        N_REG["/registrierung"]
    end

    %% ─── FOOTER (immer sichtbar) ────────────────────────────────────────────
    subgraph FOOTER ["📎 Footer (immer sichtbar)"]
        direction LR
        F_IMP["/impressum"]
        F_DS["/datenschutz"]
        F_UE["/ueber-uns"]
    end

    %% ─── HOME Verlinkungen ──────────────────────────────────────────────────
    HOME -->|"Jetzt starten (3× CTA)"| REG
    HOME -->|"#wie-es-funktioniert"| HOME

    %% ─── AUTH Flow ──────────────────────────────────────────────────────────
    REG -->|"Schon registriert?"| LOGIN
    REG -->|"Datenschutz"| DATENSCHUTZ
    REG -->|"✅ Erfolg → ?next= oder"| DASHBOARD
    LOGIN -->|"Noch kein Account?"| REG
    LOGIN -->|"✅ Erfolg → ?next= oder"| DASHBOARD
    REG_LEGACY -->|"Schon registriert?"| LOGIN
    REG_LEGACY -->|"✅ Erfolg"| HOME

    %% ─── DASHBOARD Verlinkungen ─────────────────────────────────────────────
    DASHBOARD -->|"Avatar-Button"| PROFIL
    DASHBOARD -->|"Punkte-Detail & Badges"| PROFIL_PUNKTE
    DASHBOARD -->|"Alle Belohnungen"| BELOHNUNG
    DASHBOARD -->|"Artikel lesen"| GW
    DASHBOARD -->|"Quiz-Links (dynamisch)"| GW_SLUG
    DASHBOARD -->|"🔒 kein Token"| LOGIN

    %% ─── PROFIL Verlinkungen ────────────────────────────────────────────────
    PROFIL -->|"← Dashboard"| DASHBOARD
    PROFIL -->|"Punkte & Badges"| PROFIL_PUNKTE
    PROFIL -->|"Meine Gutscheine"| PROFIL_GUTSCHEINE
    PROFIL -->|"Datenschutz"| DATENSCHUTZ
    PROFIL -->|"🔒 kein Token"| LOGIN
    PROFIL -->|"🗑️ Konto gelöscht"| HOME

    %% ─── PROFIL PUNKTE ──────────────────────────────────────────────────────
    PROFIL_PUNKTE -->|"← Dashboard"| DASHBOARD
    PROFIL_PUNKTE -->|"🔒 kein Token"| LOGIN

    %% ─── PROFIL GUTSCHEINE ──────────────────────────────────────────────────
    PROFIL_GUTSCHEINE -->|"← Profil"| PROFIL
    PROFIL_GUTSCHEINE -->|"Mehr Gutscheine"| BELOHNUNG
    PROFIL_GUTSCHEINE -->|"🔒 kein Token"| LOGIN

    %% ─── EINSTELLUNGEN Redirect ─────────────────────────────────────────────
    EINSTELLUNGEN -->|"redirect"| PROFIL

    %% ─── GESUNDHEITSWEGWEISER ───────────────────────────────────────────────
    GW -->|"Artikel-Karte"| GW_SLUG
    GW_SLUG -->|"← Zurück (mit Filter)"| GW
    GW_SLUG -->|"Quiz-CTA (nicht eingeloggt)"| REG

    %% ─── BELOHNUNG ──────────────────────────────────────────────────────────
    BELOHNUNG -->|"Anmelden & Punkte (nicht eingeloggt)"| REG
    BELOHNUNG -->|"Jetzt Partner werden"| PARTNER_WERDEN

    %% ─── DATENSCHUTZ ────────────────────────────────────────────────────────
    DATENSCHUTZ -->|"Konto löschen (referenz)"| PROFIL

    %% ─── Styles ─────────────────────────────────────────────────────────────
    classDef protected fill:#fff3e0,stroke:#f59e0b,color:#000
    classDef auth fill:#e3f2fd,stroke:#1565c0,color:#000
    classDef public fill:#e8f5e9,stroke:#2e7d32,color:#000
    classDef legal fill:#f3e5f5,stroke:#7b1fa2,color:#000
    classDef redirect fill:#fce4ec,stroke:#c62828,color:#000,stroke-dasharray: 5 5

    class DASHBOARD,PROFIL,PROFIL_PUNKTE,PROFIL_GUTSCHEINE protected
    class LOGIN,REG,REG_LEGACY auth
    class HOME,GW,GW_SLUG,BELOHNUNG,PARTNER_WERDEN,UEBER_UNS public
    class DATENSCHUTZ,IMPRESSUM legal
    class EINSTELLUNGEN redirect
```

---

## Screen-Übersicht nach Bereich

### 🌐 Öffentliche Seiten (kein Login nötig)

| Screen | Route | Erreichbar über |
|--------|-------|-----------------|
| Startseite | `/` | Navbar (Logo), direkt |
| Gesundheitswegweiser | `/gesundheitswegweiser` | Navbar, Dashboard |
| Artikel-Detail + Quiz | `/gesundheitswegweiser/[slug]` | Artikel-Karte, Dashboard-Quiz-Link |
| Belohnungen | `/belohnung` | Navbar, Dashboard, Gutscheine |
| Partner werden | `/partner-werden` | Belohnungen-Seite |
| Über uns | `/ueber-uns` | Footer |
| Datenschutz | `/datenschutz` | Footer, Registrierung, Profil |
| Impressum | `/impressum` | Footer |

### 🔑 Auth-Seiten

| Screen | Route | Erreichbar über |
|--------|-------|-----------------|
| Login | `/login` | Navbar, Registrierung, Auth-Guard-Redirect |
| Registrierung | `/registrierung` | Navbar, Startseite, Login, Quiz-CTA, Belohnungen |
| Registrierung (Legacy) | `/register` | (nur direkt/alt) |

### 🔒 Geschützte Seiten (Login erforderlich)

| Screen | Route | Erreichbar über | Auth-Guard-Ziel |
|--------|-------|-----------------|-----------------|
| Dashboard | `/dashboard` | Navbar, nach Login/Register | `/login` |
| Profil (Einstellungen) | `/profil` | Navbar, Dashboard, `/profil/einstellungen` | `/login?next=/profil` |
| Punkte & Badges | `/profil/punkte` | Dashboard, Profil | `/login?next=/profil/punkte` |
| Meine Gutscheine | `/profil/gutscheine` | Profil | `/login?next=/profil/gutscheine` |
| Einstellungen (Redirect) | `/profil/einstellungen` | – | → `/profil` |

### 🎟️ Spezial-Routen

| Screen | Route | Beschreibung |
|--------|-------|--------------|
| Event-Onboarding | `/onboard/events/[token]` | Token-basierter Einstieg (Veranstaltungen) |

---

## Auth-Logik im Überblick

```
Kein Token vorhanden
       ↓
Auth-Guard schlägt an
       ↓
→ /login?next=<ursprüngliche-url>
       ↓
Login erfolgreich
       ↓
→ ?next= Param (oder /dashboard als Fallback)
```

```
Registrierung erfolgreich
       ↓
Auto-Login
       ↓
Init-Onboarding API (Willkommens-Punkte)
       ↓
→ ?next= Param (oder /dashboard als Fallback)
```

---

## Komponenten-Modals (kein eigener Screen)

| Komponente | Ort | Öffnet sich bei |
|------------|-----|-----------------|
| `GutscheinDetailModal` | `/profil/gutscheine` | Klick auf Gutschein-Karte |
| `EinloesungsModal` | `/belohnung` | "Einlösen"-Button auf Angebot-Karte |
| `GutscheinScreen` | innerhalb EinloesungsModal | Nach erfolgreichem Einlösen |
| `HealthPermissionPrompt` | Dashboard | Erste Sitzung ohne Health-Permission |
| `PWAInstallBanner` | Dashboard | Browser PWA-Install-Event verfügbar |
| `SyncToast` | Dashboard | Nach Schritt-Synchronisierung |

---

## API-Routen (kein eigener Screen, nur Datenfluss)

```
/api/auth/login          ← /login, /registrierung
/api/auth/register       ← /registrierung
/api/auth/init-onboarding ← /registrierung (nach Register)
/api/auth/refresh        ← automatisch

/api/me                  ← Dashboard, Login (Analytics)
/api/profile             ← /profil
/api/profile/delete      ← /profil (Konto löschen)

/api/ledger-total        ← Dashboard, /belohnung
/api/ledger-entries      ← /profil/punkte

/api/steps/sync          ← Dashboard (SchrittSyncButton)
/api/steps/manual        ← Dashboard (ManuelleSchrittEingabe)

/api/gutscheine          ← /profil/gutscheine
/api/redeem              ← /belohnung (EinloesungsModal)

/api/awin/programs       ← /belohnung
/api/awin/my-unlocks     ← /profil/gutscheine
/api/awin/webhook        ← extern (AWIN)

/api/badges-summary      ← Dashboard, /profil/punkte
/api/quizzes             ← Dashboard
/api/quiz-status         ← /gesundheitswegweiser
/api/quiz-attempts       ← /gesundheitswegweiser/[slug] (anon)
/api/claim               ← /registrierung, /login (nach anon Quiz)

/api/partner             ← /belohnung (lokale Partner)
```
