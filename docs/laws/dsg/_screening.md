---
law: DSG
title: Datenschutzgesetz (Österreich)
rechtsgrundlage: "BGBl. I Nr. 165/1999 idF BGBl. I Nr. 50/2025"
source_ref: "RIS – Gesamte Rechtsvorschrift, Fassung vom 23.05.2026"
source_date: "2026-05-23"
source_url: https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10001597
screened_by: "Claude Sonnet 4.6 / Johannes"
screened_date: "2026-05-24"
last_reviewed: "2026-05-24"
version: "1.0"
paragraphs_total: 70
paragraphs_screened: 70
---

# DSG – Paragraph-Screening (AustroFit)

> **Status:** Vollständig gescreent (v1.0, 2026-05-24). Basis: RIS-PDF, Fassung 23.05.2026 (38 Seiten, letzte Änderung BGBl. I Nr. 50/2025, in Kraft ab 01.09.2025).

**Applicability:** `true` — Das DSG ergänzt die DSGVO national und ist für jeden österreichischen Verantwortlichen direkt anwendbar.

## Screening-Legende
- `✅ anwendbar` – Direkte Pflichten für AustroFit
- `⚠️ bedingt` – Anwendbar nur unter bestimmten Bedingungen
- `❌ nicht anwendbar` – Mit Begründung
- `📋 referenz` – Definitionsgrundlage / Behördenstruktur ohne eigene Handlungspflichten

---

## Artikel 1 – Verfassungsbestimmung

### § 1 – Grundrecht auf Datenschutz
**Status:** 📋 referenz  
**Kurzinhalt:** Verfassungsrechtliches Grundrecht auf Geheimhaltung personenbezogener Daten; Beschränkungen nur bei überwiegenden berechtigten Interessen (Abs. 2); Recht auf Auskunft, Richtigstellung und Löschung (Abs. 3).  
**AustroFit-Relevanz:** Verfassungsrechtliche Grundlage aller Datenschutzpflichten. Verstöße können bei der DSB bekämpft werden (→ § 24). Keine eigene Handlungspflicht über DSGVO hinaus.

---

## Artikel 2 – 1. Hauptstück: Durchführung der DSGVO

### 1. Abschnitt – Allgemeine Bestimmungen

#### § 4 – Anwendungsbereich und Durchführungsbestimmung
**Status (Abs. 4):** ✅ anwendbar — **Handlungsbedarf**  
**compliance_ref:** dsg-mindestalter  
**Kurzinhalt (Abs. 4):** Bei Diensten der Informationsgesellschaft, die sich direkt an Kinder richten, ist die Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) eines Kindes **ab 14 Jahren** rechtmäßig (statt 16 Jahre gemäß DSGVO Art. 8). Unter 14 Jahren ist Eltern-/Vormund-Einwilligung nötig.  
**AustroFit-Relevanz:** AustroFit ist ein Dienst der Informationsgesellschaft. Kinder unter 14 können sich aktuell ohne Altersverifikation registrieren. Aktion nötig:
- **Option A (einfach):** AGB + Registrierungsprozess auf Mindestalter 14 festlegen (Checkbox + Hinweis), keine aktive Verifikation.
- **Option B (sicherer):** Altersabfrage in der Registrierung, Weiterleitung bei Alter < 14.
- AGB fehlen noch (Go-Live-Blocker) → dort Altersgrenze verankern.  
**Volltext-Datei:** —

**Status (Abs. 2):** ⚠️ bedingt  
**Kurzinhalt (Abs. 2):** Kann Berichtigung/Löschung nur zu bestimmten Zeitpunkten erfolgen (wirtschaftliche/technische Gründe), ist bis dahin Art. 18 Abs. 2 DSGVO-Einschränkung vorzunehmen.  
**AustroFit-Relevanz:** Theoretisch relevant wenn z.B. Batch-Löschung implementiert wird; aktuell kein konkreter Handlungsbedarf (Directus-Löschung ist sofort möglich).

**Status (Abs. 3):** ❌ nicht anwendbar  
AustroFit verarbeitet keine Daten über Straftaten oder strafrechtliche Verurteilungen.

**Status (Abs. 5–6):** ❌ nicht anwendbar  
Einschränkungen des Auskunftsrechts gegenüber hoheitlich tätigen Verantwortlichen oder zum Schutz von Geschäftsgeheimnissen. AustroFit handelt nicht hoheitlich.

---

#### § 5 – Datenschutzbeauftragter (DSG-Bestimmungen)
**Status:** ⚠️ bedingt  
**Kurzinhalt:** §5 regelt primär DSB für öffentliche Stellen (Weisungsfreiheit, Verschwiegenheit). Abs. 1–3 gelten für alle Datenschutzbeauftragten (inkl. privater Unternehmen): DSB und Mitarbeiter sind zur Geheimhaltung verpflichtet und haben ein Aussageverweigerungsrecht.  
**AustroFit-Relevanz:** Wenn AustroFit einen DSB bestellt (nach DSGVO Art. 37 Abs. 1 lit. c bei umfangreicher Art.-9-Verarbeitung), gelten §5 Abs. 1–2 für diese Person. **Wichtiger Hinweis:** Die bestehende Notiz in compliance.yaml ist zu prüfen — AustroFit verarbeitet **systematisch** Gesundheitsdaten (Schritte, Cardio = Art. 9 Abs. 1 DSGVO "Gesundheitsdaten"). Bei Wachstum über Kleinstunternehmensgrenzen hinaus kann DSGVO Art. 37 Abs. 1 lit. c eine DSB-Pflicht auslösen.  
**Empfehlung:** Externen DSB-Dienstleister beauftragen (Kosten: ~500–1.500€/Jahr für Kleinstunternehmen).  
**Volltext-Datei:** —

---

#### § 6 – Datengeheimnis
**Status:** ✅ anwendbar  
**compliance_ref:** dsg-datengeheimnis  
**Kurzinhalt:** Verantwortliche, Auftragsverarbeiter und deren **Mitarbeiter** (Arbeitnehmer + arbeitnehmerähnliche Verhältnisse) müssen personenbezogene Daten geheim halten. Verpflichtungen:
- Mitarbeiter dürfen Daten nur auf **ausdrückliche Anordnung** des Arbeitgebers übermitteln (Abs. 2).
- **Vertragliche Verpflichtung** der Mitarbeiter ist Pflicht, sofern keine gesetzliche Schweigepflicht besteht (Abs. 2 S. 2).
- Mitarbeiter sind über Übermittlungsanordnungen und Konsequenzen einer Verletzung zu **belehren** (Abs. 3).
- Gilt auch nach Ende des Arbeitsverhältnisses (Abs. 2).

**AustroFit-Relevanz:**
- Aktuell: Johannes (Einzelunternehmer/Gründer) → Selbstverpflichtung, keine Drittanforderung nötig.
- Bei ersten Freelancern / Mitarbeitern: Datengeheimnis-Klausel in Vertrag aufnehmen + schriftliche Belehrung durchführen.
- Dokumentationspflicht: Belehrungsnachweis archivieren (z.B. signiertes Dokument).
- **Trigger:** Vor Einstellung erster bezahlter Mitarbeiter oder Beauftragung von Freelancern mit Datenzugang.  
**Volltext-Datei:** —

---

### 2. Abschnitt – Datenverarbeitungen zu spezifischen Zwecken

#### § 7 – Verarbeitung für Archivzwecke, Forschung, Statistik
**Status:** ❌ nicht anwendbar  
AustroFit betreibt keine wissenschaftliche Forschung oder öffentliche Archivierung. PostHog-Analytics fällt unter ePrivacy/TKG (→ compliance.yaml eprivacy), nicht § 7 DSG.

#### § 8 – Adressdaten zur Benachrichtigung/Befragung
**Status:** ❌ nicht anwendbar  
AustroFit übermittelt keine Adressdaten an Dritte für Befragungs- oder Benachrichtigungszwecke.

#### § 9 – Freiheit der Meinungsäußerung (Medienrecht)
**Status:** ❌ nicht anwendbar  
AustroFit ist kein Medienunternehmen im Sinne des MedienG.

#### § 10 – Verarbeitung im Katastrophenfall
**Status:** ❌ nicht anwendbar

#### § 11 – Verwarnung durch die Datenschutzbehörde
**Status:** 📋 referenz  
**Kurzinhalt:** DSB wendet Verhältnismäßigkeit an; bei erstmaligen Verstößen wird i.d.R. eine Verwarnung statt Bußgeld verhängt (Art. 83 DSGVO, Art. 58 Abs. 2 DSGVO).  
**AustroFit-Relevanz:** Risiko-relevant: Bei einem Erstverstoß (z.B. fehlender Art.-9-Consent-Dialog zum Go-Live) ist eher eine Verwarnung als eine Maximalstrafe zu erwarten — aber kein Freifahrtschein; Abhilfemaßnahmen müssen sofort eingeleitet werden. Kein Handlungsbedarf über Go-Live-Blocker hinaus.

---

### 3. Abschnitt – Bildverarbeitung

#### § 12 – Zulässigkeit der Bildaufnahme
**Status:** ❌ nicht anwendbar  
AustroFit nimmt keine Bilder oder Videos auf.

#### § 13 – Besondere Datensicherheitsmaßnahmen (Bildverarbeitung)
**Status:** ❌ nicht anwendbar

---

## 2. Hauptstück – Organe

### 1. Abschnitt – Datenschutzrat (§§ 14–17)
**Status:** 📋 referenz  
Datenschutzrat beim BMJ = beratendes Organ; keine direkten Pflichten für private Unternehmen. Datenschutzrat kann Empfehlungen und Gutachten herausgeben, die für die Praxis relevant sein können.

### 2. Abschnitt – Datenschutzbehörde (§§ 18–23)
**Status:** 📋 referenz  
**§ 18:** DSB Wien = nationale Aufsichtsbehörde gemäß Art. 51 DSGVO.  
**§ 21:** DSB veröffentlicht DPIA-Pflichtlisten (Art. 35 Abs. 4/5 DSGVO) via Verordnung → auf Aktualisierungen achten.  
**§ 22:** DSB hat Einschaurecht in Datenverarbeitungen; Verantwortliche müssen Unterstützung leisten und DSB Zugang zu Räumen und Systemen gewähren.  
**§ 23:** DSB veröffentlicht Tätigkeitsbericht und grundsätzliche Entscheidungen.  
**AustroFit-Relevanz:** DSB Wien in Impressum + Datenschutzerklärung als Beschwerdeinstanz anzugeben ✅ (bereits in compliance.yaml `dsg-dsb` als compliant markiert).

### 3. Abschnitt – Rechtsbehelfe, Haftung und Sanktionen (§§ 24–30)
**Status:** 📋 referenz  

**§ 24 – Beschwerde an die DSB:** Betroffene Personen können innerhalb von 1 Jahr (max. 3 Jahre) Beschwerde bei der DSB einlegen. DSB muss binnen 3 Monaten über Stand informieren.  
**§ 28 – Verbandsklage:** Betroffene können Vereine (z.B. noyb) mit Beschwerdeeinreichung beauftragen → reales Risiko für App-Betreiber.  
**§ 29 – Schadenersatz:** Materieller + immaterieller Schaden nach Art. 82 DSGVO; Klage beim Landesgericht des Klägerorts.  
**§ 30 – Geldbußen:** Juristische Personen haften auch für Fehler von Mitarbeitern in Führungspositionen.  
**AustroFit-Relevanz:** Alle Betroffenenrechte (Art. 15–22 DSGVO) müssen ausübbar sein. Datenschutzerklärung muss DSB-Kontakt + Beschwerderecht enthalten. Kein Handlungsbedarf über DSGVO-Compliance hinaus.

### 4. Abschnitt – Aufsichtsbehörde nach RL 2016/680 (§§ 31–34)
**Status:** ❌ nicht anwendbar  
Gilt nur für Strafverfolgungsbehörden.

### 5. Abschnitt – Besondere Befugnisse (§ 35)
**Status:** 📋 referenz

### 6. Abschnitt – Parlamentarisches Datenschutzkomitee (§§ 35a–35h)
**Status:** ❌ nicht anwendbar  
Zuständig nur für Parlaments-/Rechnungshofverarbeitungen.

### 7. Abschnitt – Vertretung im EDSA (§§ 35i–35j)
**Status:** 📋 referenz

---

## 3. Hauptstück – Strafverfolgung und nationale Sicherheit (§§ 36–59)
**Status:** ❌ nicht anwendbar  
Gilt ausschließlich für zuständige Behörden (Polizei, Staatsanwaltschaft, Militär). AustroFit ist kein staatlicher Akteur.  
_Hinweis: §§ 36–59 enthalten detaillierte Bestimmungen zur Auftragsverarbeitung, Protokollierung und DPIA für Behörden — diese spiegeln DSGVO-analoge Pflichten, sind für AustroFit über DSGVO bereits abgedeckt._

---

## 4. Hauptstück – Besondere Strafbestimmungen

#### § 62 – Verwaltungsstrafbestimmung
**Status:** ⚠️ bedingt  
**Kurzinhalt:** Geldstrafe bis 50.000 € für:
1. Widerrechtlicher Zugang zu Datenverarbeitungen (vorsätzlich)
2. Verstoß gegen Datengeheimnis § 6 (vorsätzliche unzulässige Übermittlung)
3. Erschleichung von Daten durch falsche Tatsachen (Katastrophenfall § 10)
4. Unzulässige Bildverarbeitung (§§ 12–13)
5. Verweigerung der DSB-Einschau (§ 22 Abs. 2)

**AustroFit-Relevanz:**
- Z 2: Relevant wenn Mitarbeiter/Freelancer Daten unrechtmäßig weitergeben → Datengeheimnis-Klausel in Verträgen (§ 6) schützt AustroFit als Unternehmen.
- Z 5: Sollte die DSB eine Kontrolle durchführen, muss AustroFit kooperieren.
- Z 1, 3, 4: Aktuell nicht relevant (keine Bildverarbeitung, kein Katastrophenfall-Kontext).

#### § 63 – Datenverarbeitung in Gewinn- oder Schädigungsabsicht
**Status:** ⚠️ bedingt  
**Kurzinhalt:** Freiheitsstrafe bis 1 Jahr oder bis zu 720 Tagessätze bei vorsätzlicher Bereicherung / Schädigung durch widerrechtliche Datenweitergabe (berufsbedingt anvertraute Daten).  
**AustroFit-Relevanz:** Strafrechtliche Insider-Bedrohung. Bei künftigen Mitarbeitern mit Datenbankzugang relevant. Zugangskontrollen + Datengeheimnis-Verträge (§ 6) reduzieren Risiko.

---

## 5. Hauptstück – Schlussbestimmungen (§§ 64–70)
**Status:** 📋 referenz  
Umsetzungs- und Übergangsbestimmungen, keine eigenen Pflichten.

---

## Zusammenfassung: AustroFit-relevante Pflichten

| § | Thema | Status | Aktion |
|---|-------|--------|--------|
| § 4 Abs. 4 | Mindestalter 14 Jahre für Einwilligung | ✅ anwendbar | AGB + Registrierung auf 14+ einschränken (zusammen mit AGB-Erstellung) |
| § 5 Abs. 1–3 | DSB-Geheimhaltungspflicht | ⚠️ bedingt | Wenn DSB bestellt wird: §5-Anforderungen beachten; DSB-Bestellung bei Wachstum prüfen |
| § 6 | Datengeheimnis | ✅ anwendbar | Datengeheimnis-Klausel + Belehrungsnachweis vor jedem Mitarbeiter-/Freelancer-Einsatz |
| § 11 | Verhältnismäßigkeit DSB-Sanktionen | 📋 referenz | Kein Handlungsbedarf; Risk Assessment |
| §§ 18, 24 | DSB Wien als Aufsichtsbehörde + Beschwerderecht | 📋 referenz | DSB-Kontakt in DSE ✅ bereits compliant |
| § 62 Z 5 | Kooperationspflicht bei DSB-Einschau | ⚠️ bedingt | Systemzugang für DSB-Kontrolle sicherstellen |
| § 63 | Strafrechtliche Insider-Haftung | ⚠️ bedingt | Zugangskontrolle + § 6-Verträge |

### Kein Handlungsbedarf (❌ nicht anwendbar)
§§ 7–10 (Forschung/Katastrophe/Medien), §§ 12–13 (Bildverarbeitung), §§ 31–59 (Strafverfolgungsbehörden)

### Wichtiger Hinweis: compliance.yaml-Korrekturbedarf
Die bestehende Notiz zu `dsg-dsb` in `compliance.yaml` lautet: _"Keine eigene nationale Pflicht zum Datenschutzbeauftragten für Kleinstunternehmen ohne systematische Art.-9-Verarbeitung"_ — dies ist **potenziell falsch**: AustroFit verarbeitet **systematisch Gesundheitsdaten** (Schritte, Cardio = Art. 9 Abs. 1 DSGVO / § 36 Abs. 2 Z 14 DSG). Bei wachsender Nutzerbasis kann DSGVO Art. 37 Abs. 1 lit. c eine DSB-Pflicht auslösen. Empfehlung: Externen DSB als Vorsichtsmaßnahme bestellen.
