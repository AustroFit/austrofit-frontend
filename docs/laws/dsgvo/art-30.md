---
law: DSGVO
article: "30"
title: "Verzeichnis von Verarbeitungstätigkeiten (VVT)"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-art30-vvt
req_refs: "REQ-R-026 (zu vergeben)"
applicable: true
risk_level: hoch
last_reviewed: 2026-05-23
reviewed_by: "AI-assisted (Claude Sonnet), bestätigt durch: [Name + Datum]"
change_log:
  - date: 2026-05-23
    author: AI-assisted
    change: "Initiale Erstellung. Status: open – VVT-Dokument noch nicht schriftlich fertiggestellt. KMU-Ausnahme greift nicht (Art. 9-Daten)."
---

# Art. 30 – Verzeichnis von Verarbeitungstätigkeiten (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Jeder Verantwortliche und gegebenenfalls sein Vertreter führen ein Verzeichnis aller Verarbeitungstätigkeiten, die ihrer Zuständigkeit unterliegen. Dieses Verzeichnis enthält sämtliche folgenden Angaben:
>
> **(a)** den Namen und die Kontaktdaten des Verantwortlichen und gegebenenfalls des gemeinsam mit ihm Verantwortlichen, des Vertreters des Verantwortlichen sowie eines etwaigen Datenschutzbeauftragten;
>
> **(b)** die Zwecke der Verarbeitung;
>
> **(c)** eine Beschreibung der Kategorien betroffener Personen und der Kategorien personenbezogener Daten;
>
> **(d)** die Kategorien von Empfängern, gegenüber denen die personenbezogenen Daten offengelegt worden sind oder noch offengelegt werden, einschließlich Empfänger in Drittländern oder internationalen Organisationen;
>
> **(e)** gegebenenfalls Übermittlungen von personenbezogenen Daten an ein Drittland oder an eine internationale Organisation, einschließlich der Angabe des betreffenden Drittlands oder der betreffenden internationalen Organisation, sowie bei den in Artikel 49 Absatz 1 Unterabsatz 2 genannten Datenübermittlungen die Dokumentierung geeigneter Garantien;
>
> **(f)** wenn möglich, die vorgesehenen Fristen für die Löschung der verschiedenen Datenkategorien;
>
> **(g)** wenn möglich, eine allgemeine Beschreibung der technischen und organisatorischen Maßnahmen gemäß Artikel 32 Absatz 1.
>
> **(2)** Jeder Auftragsverarbeiter und gegebenenfalls sein Vertreter führen ein Verzeichnis aller Kategorien von im Auftrag eines Verantwortlichen durchgeführten Tätigkeiten der Verarbeitung, das Folgendes enthält:
>
> **(a)** den Namen und die Kontaktdaten des Auftragsverarbeiters oder der Auftragsverarbeiter und jedes Verantwortlichen, in dessen Auftrag der Auftragsverarbeiter tätig ist, sowie gegebenenfalls des Vertreters des Verantwortlichen oder des Auftragsverarbeiters und eines etwaigen Datenschutzbeauftragten;
>
> **(b)** die Kategorien von Verarbeitungen, die im Auftrag jedes Verantwortlichen durchgeführt werden;
>
> **(c)** gegebenenfalls Übermittlungen von personenbezogenen Daten an ein Drittland oder an eine internationale Organisation;
>
> **(d)** wenn möglich, eine allgemeine Beschreibung der technischen und organisatorischen Maßnahmen gemäß Artikel 32 Absatz 1.
>
> **(3)** Das in den Absätzen 1 und 2 genannte Verzeichnis ist **schriftlich** zu führen, was auch in einem elektronischen Format erfolgen kann.
>
> **(4)** Der Verantwortliche oder der Auftragsverarbeiter stellt der Aufsichtsbehörde das Verzeichnis auf Anfrage zur Verfügung.
>
> **(5)** Die in den Absätzen 1 und 2 genannten Pflichten gelten **nicht** für Unternehmen oder Einrichtungen, die weniger als 250 Mitarbeiter beschäftigen, **sofern** die von ihnen vorgenommene Verarbeitung kein Risiko für die Rechte und Freiheiten der betroffenen Personen birgt, die Verarbeitung nicht gelegentlich erfolgt oder die Verarbeitung **nicht besondere Datenkategorien gemäß Artikel 9 Absatz 1** oder gemäß Artikel 10 umfasst.

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 57*

---

## Anwendbarkeitsanalyse

### KMU-Ausnahme (Art. 30 Abs. 5) greift NICHT

Die Ausnahme für Unternehmen mit < 250 Mitarbeiter entfällt, wenn **mindestens eine** der folgenden Bedingungen erfüllt ist:

| Bedingung | AustroFit | Ergebnis |
|---|---|---|
| Verarbeitung birgt Risiko für Rechte und Freiheiten | Gesundheitsdaten (Schritte, Workouts) | ✅ trifft zu |
| Verarbeitung erfolgt nicht gelegentlich | Täglich via Health Connect Sync | ✅ trifft zu |
| **Verarbeitung umfasst besondere Kategorien (Art. 9)** | **Gesundheitsdaten: Schritte, Workouts, Aktivitätsgruppe pregnant/chronic** | **✅ trifft zu** |

**Fazit: VVT ist für AustroFit Pflicht, unabhängig von der Mitarbeiterzahl.**

---

## Verzeichnis der Verarbeitungstätigkeiten (AustroFit)

**Verantwortlicher:** Johannes Gnong, AustroFit  
**Kontakt:** johannes.gnong@austrofit.at  
**Datenschutzbeauftragter:** — (nicht bestellt, kein DSB-Pflicht als Kleinstunternehmen sofern kein hauptberufliches Monitoring)  
**Stand:** 2026-05-23 (Entwurf — noch nicht schriftlich unterzeichnet)

---

### VVT-01: Nutzerregistrierung und Kontoverwaltung

| Feld | Inhalt |
|---|---|
| **Zweck** | Kontoerstellung, Authentifizierung, Vertragsdurchführung |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b (Vertragserfüllung) |
| **Kategorien betroffener Personen** | Registrierte Nutzer (Konsumenten, 14+) |
| **Kategorien personenbezogener Daten** | E-Mail-Adresse, Vorname, Passwort-Hash (bcrypt), Registrierungsdatum, Account-Status |
| **Besondere Kategorien (Art. 9)** | Nein |
| **Empfänger / Auftragsverarbeiter** | Directus GmbH / Hetzner Online GmbH (AT/DE, AVV: **offen** — vor Go-Live abzuschließen) |
| **Drittlandübermittlung** | Vercel Inc. (US) — DPA: **offen** (Vercel Pro erforderlich) |
| **Löschfrist** | Bei Kontolöschung (Art. 17); sofortige Kaskade in `user_profiles`, `points_ledger`, `activity_logs` |
| **TOM-Referenz** | `docs/tom.yaml` |

---

### VVT-02: Aktivitätstracking — Schritte

| Feld | Inhalt |
|---|---|
| **Zweck** | Gamification (Punktevergabe für Schrittziele), Streak-Berechnung, Motivationsförderung |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. a + **Art. 9 Abs. 2 lit. a** (ausdrückliche Einwilligung für Gesundheitsdaten) |
| **Kategorien betroffener Personen** | Eingeloggte Nutzer mit verbundener Health-App (Android Health Connect) |
| **Kategorien personenbezogener Daten** | Schrittzahl pro Tag, Quelle (Health Connect), Synchronisierungszeitpunkt |
| **Besondere Kategorien (Art. 9)** | **Ja** — körperliche Aktivitätsdaten (Gesundheitsdaten) |
| **Empfänger / Auftragsverarbeiter** | Hetzner Online GmbH (Directus/PostgreSQL, AVV: **offen**) |
| **Drittlandübermittlung** | Vercel Inc. (US) für API-Proxy — DPA: **offen** |
| **Löschfrist** | Bei Kontolöschung; `points_ledger`-Einträge mit source_type='schritte' |
| **TOM-Referenz** | `docs/tom.yaml`; Health Connect Permission nur nach explizitem Consent |

---

### VVT-03: Aktivitätstracking — Workouts (Cardio)

| Feld | Inhalt |
|---|---|
| **Zweck** | Gamification (Punkte für Ausdauertraining), Wochenziel-Tracking, Cardio-Streak |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. a + **Art. 9 Abs. 2 lit. a** (ausdrückliche Einwilligung) |
| **Kategorien betroffener Personen** | Eingeloggte Nutzer mit Android Health Connect |
| **Kategorien personenbezogener Daten** | Workout-Typ, Dauer (Sekunden), Datum, Startzeit (ISO 8601), Äquivalenzminuten, Quelle |
| **Besondere Kategorien (Art. 9)** | **Ja** — körperliche Fitness- und Aktivitätsdaten |
| **Empfänger / Auftragsverarbeiter** | Hetzner Online GmbH (AVV: **offen**) |
| **Drittlandübermittlung** | Vercel Inc. (US) — DPA: **offen** |
| **Löschfrist** | Bei Kontolöschung; `activity_logs` + `points_ledger` (source_type='cardio') |
| **TOM-Referenz** | `docs/tom.yaml`; Daten verbleiben auf EU-Servern (Hetzner AT/DE) |

---

### VVT-04: Aktivitätsgruppe (Gesundheitsgruppe)

| Feld | Inhalt |
|---|---|
| **Zweck** | Personalisierung der Bewegungsziele (Schwangere, Chronisch Kranke, Senioren erhalten adaptierte Cardio-Ziele) |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. a + **Art. 9 Abs. 2 lit. a** für Kategorien `pregnant` und `chronic` |
| **Kategorien betroffener Personen** | Registrierte Nutzer, die Kategorie `pregnant` oder `chronic` wählen |
| **Kategorien personenbezogener Daten** | Aktivitätsgruppe: `adult` / `senior` / `pregnant` / `chronic` |
| **Besondere Kategorien (Art. 9)** | **Ja** für `pregnant` (Schwangerschaft) und `chronic` (chronische Erkrankung) |
| **Empfänger / Auftragsverarbeiter** | Hetzner Online GmbH (AVV: **offen**) |
| **Drittlandübermittlung** | Vercel Inc. (US) — DPA: **offen** |
| **Löschfrist** | Bei Kontolöschung; gespeichert in `user_profiles.activity_group` |
| **TOM-Referenz** | `docs/tom.yaml`; keine Weitergabe an Dritte |

---

### VVT-05: Gamification — Punkte, Ledger, Badges

| Feld | Inhalt |
|---|---|
| **Zweck** | Motivationssystem; Abbildung von Nutzerfortschritt und Belohnungen |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b (Vertragserfüllung — Punkte sind Teil des Produktversprechens) |
| **Kategorien betroffener Personen** | Alle eingeloggten Nutzer |
| **Kategorien personenbezogener Daten** | Punkte-Buchungen (delta, Quelle, Zeitstempel, Referenz), Badge-Vergaben, Level-Stand |
| **Besondere Kategorien (Art. 9)** | Indirekt (Buchungen referenzieren Schritt-/Cardio-Aktivitäten; keine direkten Gesundheitsdaten) |
| **Empfänger / Auftragsverarbeiter** | Hetzner Online GmbH (AVV: **offen**) |
| **Drittlandübermittlung** | Vercel Inc. (US) — DPA: **offen** |
| **Löschfrist** | Bei Kontolöschung; `points_ledger`-Kaskade |
| **TOM-Referenz** | `docs/tom.yaml` |

---

### VVT-06: Quiz und Bildungsinhalte

| Feld | Inhalt |
|---|---|
| **Zweck** | Gesundheitsbildung, Quiz-Gamification (Punkte für richtiges Antworten) |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b (Vertragserfüllung) |
| **Kategorien betroffener Personen** | Nutzer (anonym vor Claim; identifiziert nach Claim) |
| **Kategorien personenbezogener Daten** | Anonymous-ID, Score, Zeitstempel; nach Claim: User-ID + Quiz-Verknüpfung |
| **Besondere Kategorien (Art. 9)** | Nein (Quizinhalte über Gesundheit ≠ Gesundheitsdaten der Person) |
| **Empfänger / Auftragsverarbeiter** | Hetzner Online GmbH (AVV: **offen**) |
| **Drittlandübermittlung** | Vercel Inc. (US) — DPA: **offen** |
| **Löschfrist** | Bei Kontolöschung; `quiz_attempts` mit User-Verknüpfung |
| **TOM-Referenz** | `docs/tom.yaml` |

---

### VVT-07: Analytics (PostHog)

| Feld | Inhalt |
|---|---|
| **Zweck** | Produktverbesserung, Nutzerverhalten-Analyse |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. a (Einwilligung via Consent-Banner) |
| **Kategorien betroffener Personen** | Nutzer mit erteiler Analytics-Einwilligung |
| **Kategorien personenbezogener Daten** | Pseudonymisierte User-ID, App-Events (Seitenaufrufe, Feature-Nutzung), Gerätemetadaten |
| **Besondere Kategorien (Art. 9)** | Nein (Events enthalten keine Gesundheitsdaten; source_type nicht übertragen) |
| **Empfänger / Auftragsverarbeiter** | PostHog Inc. / PostHog EU Cloud (Frankfurt, EU-Server, DPA vorhanden) |
| **Drittlandübermittlung** | Nein (EU-Server Frankfurt) |
| **Löschfrist** | Konfigurierbar in PostHog (Standard: 7 Jahre → auf max. 2 Jahre reduzieren) |
| **TOM-Referenz** | `docs/tom.yaml`; nur nach Einwilligung initialisiert (`austrofit_analytics_consent`) |

---

### VVT-08: Belohnungen und Gutscheineinlösung

| Feld | Inhalt |
|---|---|
| **Zweck** | Einlösung von Punkten gegen Partnerangebote (Gutscheincodes) |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b (Vertragserfüllung — Einlösung als Teil des Produktversprechens) |
| **Kategorien betroffener Personen** | Nutzer, die Belohnungen einlösen |
| **Kategorien personenbezogener Daten** | User-ID, Reward-ID, Einlösezeitpunkt, Gutscheincode (temporär), Status |
| **Besondere Kategorien (Art. 9)** | Nein |
| **Empfänger / Auftragsverarbeiter** | Hetzner Online GmbH (AVV: **offen**); AWIN GmbH (Affiliate-Partner, eigene Datenschutzerklärung) |
| **Drittlandübermittlung** | AWIN (DE/UK) — Standardvertragsklauseln prüfen |
| **Löschfrist** | Bei Kontolöschung; `reward_redemptions`-Kaskade |
| **TOM-Referenz** | `docs/tom.yaml` |

---

## AustroFit-Mapping

### Anforderungen aus Art. 30

| # | Anforderung | Status | Evidence | REQ-Ref |
|---|---|---|---|---|
| 1 | VVT schriftlich führen (elektronisch zulässig) | ❌ open | Dieses Dokument ist Entwurf — noch nicht als unterzeichnetes Dokument vorhanden | REQ-R-026 |
| 2 | VVT enthält alle Pflichtangaben (lit. a–g) | ⚠️ partial | Alle 8 Verarbeitungstätigkeiten oben erfasst; Löschfristen z.T. unspezifisch | REQ-R-026 |
| 3 | KMU-Ausnahme korrekt ausgeschlossen | ✅ documented | Art. 9-Daten (Schritte, Workouts, pregnant/chronic) → Ausnahme greift nicht | — |
| 4 | VVT auf Anfrage der DSB verfügbar | ❌ open | Kein finalisiertes Dokument vorhanden; Datenschutzbehörde Wien ist zuständig | REQ-R-026 |
| 5 | Auftragsverarbeiter-Verzeichnis (Art. 30 Abs. 2) | ⚠️ partial | Hetzner und Vercel als Auftragsverarbeiter identifiziert; AVV fehlen noch | REQ-R-026 |
| 6 | Drittlandübermittlungen dokumentiert | ⚠️ partial | Vercel (US) als Drittlandübermittlung identifiziert; Garantien (DPA) noch nicht aktiv | REQ-R-026 |

### Offene Punkte (vor Go-Live)

- [ ] **VVT finalisieren und unterzeichnen** — Dieses Dokument als PDF exportieren (oder separates `docs/vvt-signed.pdf`) → vom Verantwortlichen (Johannes Gnong) unterzeichnen
- [ ] **Hetzner AVV abschließen** — Kundencenter → Datenschutz → AV-Vertrag (kostenlos, ~5 Min.) — danach VVT-01 bis VVT-06 und VVT-08 als "AVV vorhanden" markieren
- [ ] **Vercel Pro upgraden** — DPA gilt dann automatisch; Drittlandübermittlung in VVT-01/02/03/04/05/06 aktualisieren
- [ ] **Löschfristen präzisieren** — PostHog-Retention auf max. 2 Jahre setzen; AWIN-Verarbeitung genauer dokumentieren
- [ ] **AWIN-Garantien prüfen** — Standardvertragsklauseln oder EU-UK Adequacy Decision für UK-Übermittlung bestätigen

---

## Audit-Nachweis

**Umsetzungsstand:** ❌ open — BLOCKEND vor Go-Live

**Begründung:** Das VVT ist als schriftliches Dokument (Art. 30 Abs. 3) Pflicht. Dieser Entwurf ist noch nicht unterzeichnet und noch nicht offiziell finalisiert.

**Primäre Referenzen:**
- `docs/tom.yaml` — TOM-Dokument (Art. 32), wird im VVT referenziert
- `docs/laws/dsgvo/art-09.md` — Gesundheitsdaten-Klassifikation
- `docs/laws/dsgvo/art-28.md` — AVV-Anforderungen (zu erstellen)
- `docs/compliance.yaml` — Requirement: `dsgvo-art30-vvt`

**Bestätigt durch:** — (ausstehend — muss vom Verantwortlichen Johannes Gnong unterzeichnet werden)  
**Nächste Review:** Nach Abschluss Hetzner AVV + Vercel Pro Upgrade; bei jeder neuen Verarbeitungstätigkeit
