---
law: GTelG
title: Gesundheitstelematikgesetz 2012
rechtsgrundlage: BGBl. I Nr. 111/2012 idgF
source_ref: "BGBl. I Nr. 111/2012"
source_date: "2012-08-03"
source_url: https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=20007678
screened_by: "Claude Sonnet 4.6 + Johannes"
screened_date: "2026-05-24"
last_reviewed: "2026-05-24"
version: "1.0"
pdf_fassung: "24.05.2026 (41 Seiten, vollständig gelesen)"
---

# GTelG 2012 – Paragraph-Screening (AustroFit)

## Gesamtbewertung

**applicability: false** — GTelG ist auf AustroFit **aktuell nicht anwendbar**.

**Kernbegründung (§ 1 iVm § 2 Z 2):**
Das GTelG gilt ausschließlich für **Gesundheitsdiensteanbieter** (§ 2 Z 2) — also Verantwortliche oder Auftragsverarbeiter, die regelmäßig Gesundheitsdaten oder genetische Daten in elektronischer Form für folgende Zwecke verarbeiten:
- medizinische Behandlung oder Versorgung,
- pflegerische Betreuung,
- Verrechnung von Gesundheitsdienstleistungen,
- Versicherung von Gesundheitsrisiken,
- Wahrnehmung von Patient/innenrechten, oder
- Unterstützung der grenzüberschreitenden Gesundheitsversorgung.

AustroFit ist **keiner dieser Zwecke** zuzuordnen. AustroFit ist eine Fitness-/Wellness-Consumer-App zur Bewegungsförderung mit Gamification — kein Arzt, keine Apotheke, kein Krankenhaus, keine Pflegeeinrichtung, kein Rettungsdienst.

> **Achtung Abgrenzung zu DSGVO:** AustroFit verarbeitet Schritt- und Aktivitätsdaten, die im DSGVO-Sinne (Art. 4 Z 15) als Gesundheitsdaten eingestuft werden können. Diese Pflichten folgen aus der **DSGVO** (insb. Art. 9), nicht aus dem GTelG. Der bestehende Compliance-Workflow (Art. 9-Consent-Dialog, DPIA) ist der richtige Ansatz — GTelG ist davon unberührt.

---

## Paragraph-Screening (vollständig)

### 1. Abschnitt: Allgemeine Bestimmungen

#### § 1 — Gegenstand
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Gegenstand des Gesetzes ist die Verarbeitung personenbezogener elektronischer Gesundheitsdaten und genetischer Daten durch Gesundheitsdiensteanbieter (§ 2 Z 2). Ziele: Datensicherheit bei Übermittlung (2. Abschnitt), Informationsmanagement/eHVD (3. Abschnitt), ELGA (4. Abschnitt), eHealth-Anwendungen (5. Abschnitt), grenzüberschreitende Gesundheitsversorgung/MyHealth@EU (6. Abschnitt).  
**AustroFit:** Kein Anknüpfungspunkt. AustroFit ist kein Gesundheitsdiensteanbieter.

#### § 2 — Begriffsbestimmungen
**Status:** ❌ nicht anwendbar (Schlüsseldefinitionen, die AustroFit ausschließen)  
**Relevante Definitionen:**
- **Z 1 „Gesundheitsdaten"**: = Art. 4 Z 15 DSGVO. AustroFit verarbeitet Aktivitätsdaten die darunter fallen können — aber das ist eine DSGVO-Frage, nicht GTelG.
- **Z 2 „Gesundheitsdiensteanbieter"**: Ärzte, Apotheken, Krankenhäuser, Pflegeeinrichtungen, Rettungsdienste etc. AustroFit erfüllt diese Definition nicht.
- **Z 6 „ELGA"**: Das Informationssystem für ELGA-Gesundheitsdiensteanbieter und ELGA-Teilnehmer. AustroFit ist weder noch.
- **Z 10 „ELGA-Gesundheitsdiensteanbieter"**: Abschließende Liste (Ärzte, Zahnärzte, Apotheken, Krankenanstalten, Pflegeeinrichtungen, Rettungsdienste, Gesundheitsberatung 1450). AustroFit ist nicht aufgeführt und erfüllt keine der Voraussetzungen.
- **Z 17 „eHealth-Anwendung"**: Verwendung von ELGA-Komponenten durch Bürger/innen und Gesundheitsdiensteanbieter. AustroFit verwendet keine ELGA-Komponenten.

---

### 2. Abschnitt: Datensicherheit bei elektronischer Übermittlung von Gesundheitsdaten (Art. 4 Z 15 und Z 13 DSGVO)

**Vorbemerkung:** Dieser Abschnitt richtet sich an Gesundheitsdiensteanbieter (§ 3 Abs. 1 iVm § 2 Z 2) bei der elektronischen Übermittlung von Gesundheitsdaten und genetischen Daten. AustroFit übermittelt keine Gesundheitsdaten an andere Gesundheitsdiensteanbieter.

#### § 3 — Grundsätze der Datensicherheit
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Gesundheitsdiensteanbieter müssen bei Übermittlung von Gesundheitsdaten Identität (§ 4), Rolle (§ 5), Vertraulichkeit (§ 6) und Integrität (§ 7) sicherstellen; Verarbeitung nur in zulässigen Rollen.

#### § 4 — Identität
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Identitätsfeststellung der übermittelnden/empfangenden Personen und Gesundheitsdiensteanbieter via E-ID, e-card-System oder elektronische Signaturen.

#### § 4a — Identität von Behörden des Öffentlichen Gesundheitsdienstes
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Behörden müssen Zugriffsberechtigungen für eHealth-Anwendungen individuell festlegen und dokumentieren.

#### § 5 — Rolle
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Nachweis und Prüfung der Rolle von Gesundheitsdiensteanbieter.

#### § 6 — Vertraulichkeit
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Vertraulichkeit bei elektronischer Übermittlung durch Stand-der-Technik-Netzwerksicherheit oder Vollverschlüsselung. Bei Cloud Computing: Gesundheitsdaten müssen State-of-the-Art verschlüsselt sein.  
**Hinweis für spätere Phase:** Wenn AustroFit je Gesundheitsdaten an andere überträgt und dabei als Gesundheitsdiensteanbieter gilt, wären diese Anforderungen relevant. Derzeit deckt Art. 32 DSGVO die Verschlüsselungspflicht ab.

#### § 7 — Integrität
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Integrität elektronischer Gesundheitsdaten durch qualifizierte elektronische Signaturen oder Siegel (eIDAS-Verordnung).

#### § 8 — IT-Sicherheitskonzept
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Gesundheitsdiensteanbieter müssen alle Art. 32 DSGVO-Maßnahmen in einem IT-Sicherheitskonzept dokumentieren. AustroFit hat die Art. 32-Pflicht direkt aus der DSGVO (→ TOM-Dokument, `docs/tom.yaml`).

#### § 8a — Austrian Health CERT
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Sektorspezifisches CERT für Gesundheitsdiensteanbieter, die „wesentliche Dienste" iSd NISG betreiben. AustroFit ist kein Betreiber wesentlicher Dienste im Sinne NISG (NIS2-Schwellenwert nicht erreicht, bereits in `docs/compliance.yaml` dokumentiert).

---

### 3. Abschnitt: Informationsmanagement

#### § 9 — eHealth-Verzeichnisdienst (eHVD)
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Bundesminister betreibt eHVD-Verzeichnis aller Gesundheitsdiensteanbieter. Eingetragen werden Ärzte, Apotheken etc. über Registrierungsstellen.  
**AustroFit:** Keine Pflicht und kein Recht zur Eintragung.

#### § 10 — Daten des eHealth-Verzeichnisdienstes
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Dateninhalt des eHVD (Name, Rolle, OID, etc.).

#### § 11 — Monitoring
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Bundesweite Berichte über Einsatz von IKT im Gesundheitswesen; Auskunftspflicht für Gesundheitsdiensteanbieter.

#### § 12a — Öffentliches Gesundheitsportal Österreichs
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Öffentliches Portal für Zugang zu ELGA, eImpfpass, eHVD-Webservice, MyHealth@EU.

#### § 12b — Plattform für Gesundheitsdiensteanbieter
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Plattform für gesetzliche Verpflichtungen der Gesundheitsdiensteanbieter (zentrales Impfregister, Sterbeverfügungsregister, etc.).

---

### 4. Abschnitt: Elektronische Gesundheitsakte (ELGA)

**Vorbemerkung:** Der gesamte 4. Abschnitt (§§ 13–24) betrifft ausschließlich ELGA-Gesundheitsdiensteanbieter (§ 2 Z 10) und ELGA-Teilnehmer/innen. AustroFit ist weder noch.

#### § 13 — Allgemeine Bestimmungen zur ELGA
**Status:** ❌ nicht anwendbar

#### § 14 — Grundsätze der Datenverarbeitung (ELGA)
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** ELGA-Gesundheitsdaten dürfen nur verarbeitet werden, wenn Teilnehmer/innen identifiziert sind, Gesundheitsdiensteanbieter identifiziert sind, und Zugriffsberechtigungen vorliegen. Verarbeitung ausschließlich für Art. 9 Abs. 2 lit. h DSGVO-Zwecke.

#### § 15 — Grundsätze der ELGA-Teilnahme
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Opt-out von ELGA jederzeit möglich.

#### § 16 — Rechte der ELGA-Teilnehmer/innen
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Einsichtsrecht, individuelle Zugriffsberechtigungen über Zugangsportal.

#### § 17 — ELGA- und eHealth-Supporteinrichtung
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Ombudsstelle, Servicestelle, Widerspruchstelle für ELGA.

#### § 18 — Überprüfung der Identität von ELGA-Teilnehmer/inne/n
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Patient/inn/enindex; Identifikation via e-card, E-ID, Sozialversicherungsnummer.

#### § 19 — Überprüfung der Identität von ELGA-Gesundheitsdiensteanbietern
**Status:** ❌ nicht anwendbar

#### § 20 — Speicherung von ELGA-Gesundheitsdaten
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** 30-jährige dezentrale Speicherung von ELGA-Gesundheitsdaten; EU-Datenspeicher.

#### § 20a — eMedikation
**Status:** ❌ nicht anwendbar

#### § 21 — Berechtigungssystem
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Zugriffsberechtigungen für ELGA; generelle Berechtigungen für Ärzte, Zahnärzte, Apotheken, Krankenanstalten, Pflegeeinrichtungen, Rettungsdienste, Gesundheitsberatung 1450.

#### § 22 — Protokollierungssystem
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Jede ELGA-Verarbeitung muss Art. 32 DSGVO-konform protokolliert werden (Datum, Transaktionsnummer, Art des Vorgangs, Identität des Gesundheitsdienstanbieters etc.).

#### § 23 — Zugangsportal
**Status:** ❌ nicht anwendbar

#### § 24 — Nutzungsrechte an ELGA
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Nutzung der ELGA-Komponenten zur Erhebung der ELGA-Gesundheitsdaten ist unentgeltlich.

---

### 5. Abschnitt: eHealth-Anwendungen

#### § 24a — Primärversorgung
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Primärversorgungseinheiten (PrimVG) dürfen ELGA-Komponenten nutzen.

#### §§ 24b–24h — Elektronischer Impfpass (eImpfpass)
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Zentrales Impfregister, eImpfpass-Anwendung für eImpf-Gesundheitsdiensteanbieter (Ärzte, Apotheken). AustroFit ist kein eImpf-Gesundheitsdiensteanbieter.  
**Hinweis für DiGA-Phase (REQ-P-042, ab 2027):** Falls AustroFit je verschreibbar wird und Impfstatus abfragen muss, wäre eine Anbindung an den eImpfpass über eine ELGA-Zulassung zu prüfen.

---

### 6. Abschnitt: Grenzüberschreitende Gesundheitsversorgung

#### §§ 24i–24u — MyHealth@EU, EU-Rezept, EU-Patientenkurzakte
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Infrastruktur für grenzüberschreitende Gesundheitsversorgung; gilt für Österreich als Herkunfts- und Behandlungsmitgliedstaat. Nur für Gesundheitsdiensteanbieter und die Nationale Kontaktstelle.

---

### 7. Abschnitt: Schlussbestimmungen

#### § 25 — Verwaltungsstrafbestimmungen
**Status:** ❌ nicht anwendbar  
**Kurzinhalt:** Geldstrafe bis zu € 10.000 für Gesundheitsdiensteanbieter, die Datensicherheitspflichten (§§ 3–7) verletzen oder ELGA-Daten unberechtigt verarbeiten. AustroFit ist kein Gesundheitsdiensteanbieter → nicht strafbar nach GTelG.

#### §§ 26–32 — Inkrafttreten, Übergangsbestimmungen, Verordnungsermächtigungen
**Status:** ❌ nicht anwendbar

---

## Trigger für zukünftige Anwendbarkeit

GTelG wird relevant, wenn AustroFit **einen oder mehrere der folgenden Schritte** unternimmt:

| Trigger | Phase | REQ-Referenz |
|---|---|---|
| **ELGA-Anbindung**: AustroFit sendet/empfängt Gesundheitsdaten über ELGA (z. B. Aktivitätsdaten → elektronische Gesundheitsakte) | Phase 3+ | REQ-P-042 |
| **DiGA-Zertifizierung** (ab 2027): AustroFit wird als digitale Gesundheitsanwendung verschreibbar → Klassifizierung als „eHealth-Anwendung" iSd § 24a ff möglich | Jahr 3+ | REQ-P-042 |
| **SVS Gesundheitshunderter** (REQ-P-043): Wenn Aktivitätsnachweise direkt an Sozialversicherungsträger übermittelt werden (nicht nur exportierbar), könnte eine Anbindung an eHVD erforderlich sein | Phase 3 | REQ-P-043 |
| **Kooperation mit Gesundheitsdiensteanbieter**: AustroFit übermittelt elektronisch Gesundheitsdaten an Arzt/Krankenhaus/etc. → § 3–7 (Datensicherheit bei Übermittlung) wird direkt relevant | Beliebig | — |

**Im DiGA/ELGA-Fall:** Vor Implementierung Zulassungsverfahren beim ELGA GmbH / BMG einplanen. Ansprechpartner: ELGA GmbH (https://www.elga.gv.at/kontakt/).

---

## Abgrenzung: GTelG vs. DSGVO für AustroFit

| Thema | Regelung | Für AustroFit |
|---|---|---|
| Verarbeitung von Schritt-/Aktivitätsdaten (Art. 9 DSGVO Gesundheitsdaten) | DSGVO Art. 9, Art. 32 | **Anwendbar** → Art. 9-Consent-Dialog (Go-Live-Blocker) |
| Datensicherheit bei Übermittlung von Gesundheitsdaten zwischen Gesundheitsdiensteanbieter | GTelG §§ 3–8 | **Nicht anwendbar** |
| TOM-Dokumentation (IT-Sicherheitskonzept) | DSGVO Art. 32 (direkt) | **Anwendbar** → `docs/tom.yaml` |
| ELGA-Anbindung | GTelG §§ 13–24 | **Nicht anwendbar** (aktuell) |
| eImpfpass | GTelG §§ 24b–24h | **Nicht anwendbar** (aktuell) |

---

*Vollständiges Screening durchgeführt (41/41 Seiten). Kein Handlungsbedarf vor Phase 3+. Nächste Review: vor DiGA-Zertifizierungsplanung oder bei ELGA-Anbindung.*
