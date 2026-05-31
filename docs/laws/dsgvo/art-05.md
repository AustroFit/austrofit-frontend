---
law: DSGVO
article: "5"
title: "Grundsätze für die Verarbeitung personenbezogener Daten"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-art25-privacy-by-design
req_refs: "REQ-R-003"
applicable: true
risk_level: hoch
last_reviewed: 2026-05-23
reviewed_by: "AI-assisted (Claude Sonnet), bestätigt durch: [Name + Datum]"
change_log:
  - date: 2026-05-23
    author: AI-assisted
    change: "Initiale Erstellung. Alle 7 Grundsätze für AustroFit bewertet. Status: partial – Rechenschaftspflicht (Nachweis) noch nicht vollständig."
---

# Art. 5 – Grundsätze für die Verarbeitung personenbezogener Daten (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Personenbezogene Daten müssen
>
> **(a)** auf rechtmäßige Weise, nach Treu und Glauben und in einer für die betroffene Person nachvollziehbaren Weise verarbeitet werden (**Rechtmäßigkeit, Verarbeitung nach Treu und Glauben, Transparenz**);
>
> **(b)** für festgelegte, eindeutige und legitime Zwecke erhoben werden und dürfen nicht in einer mit diesen Zwecken nicht zu vereinbarenden Weise weiterverarbeitet werden (**Zweckbindung**);
>
> **(c)** dem Zweck angemessen und erheblich sowie auf das für die Zwecke der Verarbeitung notwendige Maß beschränkt sein (**Datenminimierung**);
>
> **(d)** sachlich richtig und erforderlichenfalls auf dem neuesten Stand sein; es sind alle angemessenen Maßnahmen zu treffen, damit personenbezogene Daten, die im Hinblick auf die Zwecke ihrer Verarbeitung unrichtig sind, unverzüglich gelöscht oder berichtigt werden (**Richtigkeit**);
>
> **(e)** in einer Form gespeichert werden, die die Identifizierung der betroffenen Personen nur so lange ermöglicht, wie es für die Zwecke, für die sie verarbeitet werden, erforderlich ist (**Speicherbegrenzung**);
>
> **(f)** in einer Weise verarbeitet werden, die eine angemessene Sicherheit der personenbezogenen Daten gewährleistet, einschließlich Schutz vor unbefugter oder unrechtmäßiger Verarbeitung und vor unbeabsichtigtem Verlust, unbeabsichtigter Vernichtung oder unbeabsichtigter Schädigung durch geeignete technische und organisatorische Maßnahmen (**Integrität und Vertraulichkeit**);
>
> **(2)** Der Verantwortliche ist für die Einhaltung des Absatzes 1 verantwortlich und muss dessen Einhaltung nachweisen können (**Rechenschaftspflicht**).

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 35*

---

## AustroFit-Mapping

### Bewertung aller 7 Grundsätze

| # | Grundsatz | Status | AustroFit-Umsetzung | Lücken |
|---|---|---|---|---|
| 1 | **Rechtmäßigkeit / Transparenz** (lit. a) | ⚠️ partial | DSE vorhanden ✅; Rechtsgrundlagen dokumentiert ✅ | Art. 9-Consent fehlt → Schritte/Workouts ohne gültige Einwilligung |
| 2 | **Zweckbindung** (lit. b) | ✅ | Zwecke in DSE und VVT festgelegt; keine Zweckänderung ohne neue Rechtsgrundlage | — |
| 3 | **Datenminimierung** (lit. c) | ✅ | Kein Standort-Tracking; keine Herzfrequenz; keine Schlaf-Daten; Anonymous-ID für Quiz; nur Aggregat-Schritte (keine GPS-Route) | — |
| 4 | **Richtigkeit** (lit. d) | ✅ | Profilbearbeitung möglich (Name, E-Mail, Aktivitätsgruppe); Health-Daten von OS-Quelle (Health Connect) — Nutzer kontrolliert Quelle | — |
| 5 | **Speicherbegrenzung** (lit. e) | ⚠️ partial | Kontolöschung mit Kaskade ✅; Löschfristen für einzelne Datentypen noch nicht schriftlich festgelegt (→ VVT offen) | Aufbewahrungsfristen in VVT präzisieren |
| 6 | **Integrität und Vertraulichkeit** (lit. f) | ⚠️ partial | HTTPS ✅; CORS ✅; Rate-Limiting ✅; Input-Validierung ✅; Backup-Konzept offen (→ tom.yaml) | Backup-Konzept schriftlich fertigstellen |
| 7 | **Rechenschaftspflicht** (Abs. 2) | ⚠️ partial | `docs/laws/`, `docs/tom.yaml`, `docs/compliance.yaml` als Nachweis-Dokumentation ✅; VVT Entwurf ✅; AVV fehlen noch | AVV abschließen; VVT unterzeichnen; DPIA erstellen |

### Rechenschaftspflicht — Nachweis-Übersicht

Die Rechenschaftspflicht (Art. 5 Abs. 2) erfordert aktiven Nachweis. Folgende Dokumente decken dies ab:

| Dokument | Nachweis für | Status |
|---|---|---|
| `docs/compliance.yaml` | Gesamtüberblick Regulierungen | ✅ |
| `docs/tom.yaml` | Technische und organisatorische Maßnahmen (Art. 32) | ⚠️ partial (Backup offen) |
| `docs/laws/dsgvo/art-30.md` | Verarbeitungsverzeichnis (Art. 30) | ⚠️ Entwurf, nicht unterzeichnet |
| `docs/laws/dsgvo/` | Artikel-Screening, Volltext-Analyse | ✅ (laufend) |
| `docs/avv/` (zu erstellen) | AVV mit Auftragsverarbeitern | ❌ leer |
| DPIA (zu erstellen) | Datenschutz-Folgenabschätzung (Art. 35) | ❌ nicht erstellt |
| Datenschutzerklärung | Transparenz gegenüber Nutzern | ✅ Mai 2026 |

### Offene Punkte

- [ ] **Art. 9-Consent** implementieren — sonst verletzt jede Schritt-/Workout-Synchronisation Grundsatz 1 (Rechtmäßigkeit)
- [ ] **Aufbewahrungsfristen** präzisieren — in `art-30.md` (VVT) Spalte "Löschfrist" für alle Datentypen konkret ausfüllen
- [ ] **Backup-Konzept** schriftlich fertigstellen — `docs/tom.yaml` offener Punkt → Grundsatz 6 (Integrität) nachweisen
- [ ] **AVV abschließen** (Hetzner + Vercel) — Grundsatz 6 und Rechenschaftspflicht
- [ ] **DPIA** erstellen — Rechenschaftspflicht für Hochrisiko-Verarbeitung (Art. 9-Daten)

---

## Audit-Nachweis

**Umsetzungsstand:** ⚠️ partial

**Stärken:**
- Datenminimierung: konsequent umgesetzt (kein Standort, keine Biometrie außer Schritte/Workouts)
- Zweckbindung: klare Zwecke, keine Datenweitergabe an Werbetreibende
- Transparenz: DSE vollständig

**Hauptlücken (Go-Live relevant):**
- Rechtmäßigkeit für Art. 9-Daten (kein gültiger Consent)
- Rechenschaftspflicht: AVV fehlen, DPIA fehlt, VVT nicht unterzeichnet

**Bestätigt durch:** — (ausstehend)  
**Nächste Review:** Nach AVV-Abschluss + DPIA-Erstellung
