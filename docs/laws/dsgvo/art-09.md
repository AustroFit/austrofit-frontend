---
law: DSGVO
article: "9"
title: "Verarbeitung besonderer Kategorien personenbezogener Daten (Gesundheitsdaten)"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-art9-consent
req_refs: "REQ-R-001"
applicable: true
risk_level: kritisch
last_reviewed: 2026-05-22
reviewed_by: "AI-assisted (Claude Sonnet), zu bestätigen durch: [Name + Datum]"
change_log:
  - date: 2026-05-22
    author: AI-assisted
    change: "Initiale Erstellung aus PDF-Quelle (CELEX:32016R0679). Status: partial – separater Art. 9-Consent-Schritt fehlt im Onboarding."
---

# Art. 9 – Verarbeitung besonderer Kategorien personenbezogener Daten (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Die Verarbeitung personenbezogener Daten, aus denen die rassische und ethnische Herkunft, politische Meinungen, religiöse oder weltanschauliche Überzeugungen oder die Gewerkschaftszugehörigkeit hervorgehen, sowie die Verarbeitung von genetischen Daten, biometrischen Daten zur eindeutigen Identifizierung einer natürlichen Person, **Gesundheitsdaten** oder Daten zum Sexualleben oder der sexuellen Orientierung einer natürlichen Person ist **untersagt**.
>
> **(2)** Absatz 1 gilt nicht in folgenden Fällen:
>
> **(a)** Die betroffene Person hat in die Verarbeitung der genannten personenbezogenen Daten für einen oder mehrere festgelegte Zwecke **ausdrücklich eingewilligt**, es sei denn, nach Unionsrecht oder dem Recht der Mitgliedstaaten kann das Verbot nach Absatz 1 durch die Einwilligung der betroffenen Person nicht aufgehoben werden,
>
> **(b)** die Verarbeitung ist erforderlich, damit der Verantwortliche oder die betroffene Person die ihm bzw. ihr aus dem Arbeitsrecht und dem Recht der sozialen Sicherheit und des Sozialschutzes erwachsenden Rechte ausüben und seinen bzw. ihren diesbezüglichen Pflichten nachkommen kann [...],
>
> **(c)** die Verarbeitung ist zum Schutz lebenswichtiger Interessen der betroffenen Person oder einer anderen natürlichen Person erforderlich und die betroffene Person ist aus körperlichen oder rechtlichen Gründen außerstande, ihre Einwilligung zu geben,
>
> **(d)** die Verarbeitung erfolgt auf der Grundlage geeigneter Garantien durch eine politisch, weltanschaulich, religiös oder gewerkschaftlich ausgerichtete Stiftung [...],
>
> **(e)** die Verarbeitung bezieht sich auf personenbezogene Daten, die die betroffene Person offensichtlich öffentlich gemacht hat,
>
> **(f)** die Verarbeitung ist zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen oder bei Handlungen der Gerichte im Rahmen ihrer justiziellen Tätigkeit erforderlich,
>
> **(g)** die Verarbeitung ist aus Gründen eines erheblichen öffentlichen Interesses erforderlich [...],
>
> **(h)** die Verarbeitung ist für Zwecke der Gesundheitsvorsorge oder der Arbeitsmedizin [...] auf der Grundlage des Unionsrechts oder des Rechts eines Mitgliedstaats [...] erforderlich,
>
> **(i)** die Verarbeitung ist aus Gründen des öffentlichen Interesses im Bereich der öffentlichen Gesundheit [...] erforderlich,
>
> **(j)** die Verarbeitung ist [...] für im öffentlichen Interesse liegende Archivzwecke, für wissenschaftliche oder historische Forschungszwecke oder für statistische Zwecke [...] erforderlich.
>
> **(3)** Die in Absatz 1 genannten personenbezogenen Daten dürfen zu den in Absatz 2 Buchstabe h genannten Zwecken verarbeitet werden, wenn diese Daten von Fachpersonal oder unter dessen Verantwortung verarbeitet werden und dieses Fachpersonal [...] dem Berufsgeheimnis unterliegt [...]
>
> **(4)** Die Mitgliedstaaten können zusätzliche Bedingungen, einschließlich Beschränkungen, einführen oder aufrechterhalten, soweit die Verarbeitung von genetischen, biometrischen oder Gesundheitsdaten betroffen ist.

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 38–39*

---

## AustroFit-Klassifikation der Gesundheitsdaten

### Welche AustroFit-Daten sind Gesundheitsdaten nach Art. 4 Nr. 15 DSGVO?

| Datentyp | Gesundheitsdatum? | Begründung |
|---|---|---|
| Schritte (via Health Connect) | ✅ Ja | Körperliche Aktivitätsdaten; Rückschlüsse auf Gesundheitszustand |
| Workouts (via Health Connect) | ✅ Ja | Körperliche Aktivität und Fitness |
| Aktivitätsgruppe "chronic" | ✅ Ja | Expliziter Hinweis auf chronische Erkrankung |
| Aktivitätsgruppe "pregnant" | ✅ Ja | Schwangerschaft ist körperlicher Gesundheitszustand |
| Aktivitätsgruppe "senior" | ⚠️ Graubereich | Alter + Aktivitätsniveau, kein direkter Krankheitsbezug |
| Aktivitätsgruppe "adult" | ❌ Nein | Keine Gesundheitsinformation |
| E-Mail-Adresse | ❌ Nein | Kontaktdatum |
| Punkte/Gamification-Daten | ❌ Nein | Verhaltens-, nicht Gesundheitsdaten |
| Quiz-Ergebnisse (anonym) | ❌ Nein | Anonym erhoben (anonymous_id) |
| Vorsorge-Nachweise (Phase 2) | ✅ Ja | Medizinische Maßnahmen (Impfungen, Untersuchungen) |

### Anwendbare Rechtsgrundlage

Für AustroFit kommt nur **Art. 9 Abs. 2 lit. (a)** in Frage:
> Explizite Einwilligung der betroffenen Person für festgelegte Zwecke

Warum nicht andere Buchstaben:
- (b): Kein Arbeits- oder Sozialrecht-Kontext
- (c): Kein Notfall, Nutzer ist handlungsfähig
- (g)/(h)/(i): AustroFit ist kein öffentlicher Gesundheitsakteur und kein Medizinprodukt
- (j): Kein Forschungszweck im primären Betrieb

---

## AustroFit-Mapping

### Anforderungen aus Art. 9

| # | Anforderung | Status | Evidence | REQ-Ref |
|---|---|---|---|---|
| 1 | Expliziter, separater Consent-Schritt für Gesundheitsdaten im Onboarding | ⚠️ partial | Kein separater Art. 9-Consent-Schritt. Health Connect Permission informiert, aber DSGVO-Art. 9-Einwilligung nicht sauber getrennt. | REQ-R-001 |
| 2 | Consent-Text nennt explizit: Zweck, verarbeitete Daten (Schritte, Workouts, Aktivitätsgruppe), Widerrufsmöglichkeit | ⚠️ partial | Health Connect Permission deckt Zweck technisch ab. DSGVO-spezifischer Text fehlt. | REQ-R-001 |
| 3 | Einwilligung für jeden festgelegten Zweck separat (Zweckbindung) | ⚠️ partial | Aktuell nicht granular aufgeteilt (Bewegungstracking ≠ Aktivitätsgruppenverarbeitung). | REQ-R-001 |
| 4 | Nachweisbarkeit der Einwilligung (Art. 7 Abs. 1) | ❌ open | Kein Consent-Log in der Datenbank für Art. 9-Einwilligung. | REQ-R-001 |
| 5 | Widerruf ebenso einfach wie Erteilung (Art. 7 Abs. 3) | ⚠️ partial | Health Connect Permission widerrufbar über OS-Einstellungen. Direkte In-App-Widerrufsmöglichkeit fehlt. | REQ-R-001 |
| 6 | Österreichisches DSG § 4: keine zusätzlichen nationalen Einschränkungen für App-Kontext | ✅ compliant | Österreich hat keine strengeren Regelungen für Fitness-Apps eingeführt. | — |

### Offene Punkte (vor Go-Live)
- [ ] **Separater Consent-Dialog** für Gesundheitsdaten im Onboarding (nach Schritt 1 "Registrierung", vor Health Connect Permission) – sprachlich klar: "AustroFit möchte deine Aktivitätsdaten (Schritte, Workouts) und Gesundheitsgruppe für [Zweck X] verarbeiten. Einwilligung freiwillig und jederzeit widerrufbar."
- [ ] **Consent-Logging** in Datenbank: Tabelle `consent_log` mit `user_id`, `consent_type: 'health_data_art9'`, `granted_at`, `ip_hash`, `revoked_at`
- [ ] **In-App-Widerruf** für Gesundheitsdaten-Consent (Profilseite → Datenschutz-Einstellungen)
- [ ] **Rechtsberatung**: Art. 9-Tauglichkeit des entworfenen Consent-Textes bestätigen lassen (WKO-Erstberatung)
- [ ] **DSE-Update** nach Consent-Implementierung: Consent-Text in DSE spiegeln

### Abgrenzung
- AustroFit **diagnostiziert, behandelt oder überwacht keine Krankheiten** → kein Medizinprodukt (MDR-Disclaimer implementiert ✅)
- Die Verarbeitung erfolgt ausschließlich zur **Motivation und Gamification** (Punktevergabe für Aktivität)
- **Keine Weitergabe** der Gesundheitsdaten an Dritte (weder an Partner noch an Werbetreibende)

---

## Audit-Nachweis

**Umsetzungsstand:** ⚠️ partial – BLOCKEND vor Go-Live  

**Primärer Code-Nachweis:**
- `src/routes/registrierung/+page.svelte` – Onboarding-Flow
- `src/routes/api/auth/register/+server.ts` – Registrierungslogik
- `src/routes/datenschutz/+page.svelte` – DSE, Section Gesundheitsdaten

**Offene Implementierung:**
- Consent-Dialog Komponente: `src/lib/components/consent/HealthDataConsent.svelte` (zu erstellen)
- Consent-Logging: DB-Migration für `consent_log` Tabelle (zu erstellen)

**Externes Dokument:**
- Datenschutzerklärung (Mai 2026): Gesundheitsdaten mit Art. 9 Abs. 2 lit. a dokumentiert ✅

**Bestätigt durch:** — (ausstehend)  
**Nächste Review:** Nach Implementierung des Consent-Dialogs; bei Änderung der Health-Connect-Integration
