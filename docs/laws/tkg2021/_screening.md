---
law: TKG2021
title: Telekommunikationsgesetz 2021
rechtsgrundlage: BGBl. I Nr. 190/2021
source_ref: "BGBl. I Nr. 190/2021; Fassung vom 24.05.2026"
source_date: "2021-11-19"
source_file: "TKG 2021, Fassung vom 24.05.2026.pdf"
screened_by: "AI-assisted (Claude Sonnet), basierend auf PDF Fassung 24.05.2026; bestätigt durch: [Name + Datum]"
screened_date: "2026-05-24"
last_reviewed: "2026-05-24"
version: "1.0-pending-review"
---

# TKG 2021 – Paragraph-Screening (AustroFit)

> **Methodik:** Screening basiert ausschließlich auf dem PDF "TKG 2021, Fassung vom 24.05.2026.pdf".
> Fassung enthält alle Änderungen bis 24.05.2026.

---

## Anwendbarkeit — Grundsatzfrage

Das TKG 2021 regelt primär **Betreiber öffentlicher Kommunikationsdienste** (Telefonnetzbetreiber, ISPs, SMS-Anbieter).

**AustroFit ist KEIN Betreiber eines öffentlichen Kommunikationsnetzes/-dienstes** im Sinne des TKG 2021.

→ Abschnitt 14 (§§ 160–174) gilt direkt nur für Telekommunikationsanbieter.

→ **ABER:** § 165 Abs. 3 und § 174 gelten ausdrücklich auch für **"Anbieter eines Dienstes der Informationsgesellschaft im Sinne des § 3 Z 1 E-Commerce-Gesetz"** — das trifft AustroFit als kommerziellen App-Betreiber.

---

## Screening-Legende
- `✅ anwendbar` – Direkte Pflichten für AustroFit
- `⚠️ bedingt` – Anwendbar unter bestimmten Bedingungen / bei zukünftigen Features
- `❌ nicht anwendbar` – Mit Begründung
- `📋 referenz` – Definitionsgrundlage

---

## 14. Abschnitt — Kommunikationsgeheimnis, Datenschutz (§§ 160–174)

### § 160 — Allgemeines / Anwendungsbereich
**Status:** 📋 referenz

**Inhalt (Abs. 1):** Bestimmungen des 14. Abschnitts gelten für die Verarbeitung personenbezogener Daten "in Verbindung mit der Bereitstellung öffentlicher Kommunikationsdienste in öffentlichen Kommunikationsnetzen".

**Abs. 3 — Begriffsbestimmungen:**
- "Anbieter" = Betreiber von öffentlichen Kommunikationsdiensten
- "Stammdaten" = Daten für die Rechtsbeziehung Nutzer↔Anbieter (Name, Adresse, Vertrag etc.)

**AustroFit:** Nicht direkt anwendbar (kein TK-Anbieter). Relevanz nur über § 165 Abs. 3 (Informationsgesellschaftsdienst).

---

### § 161 — Kommunikationsgeheimnis
**Status:** ❌ nicht anwendbar

**Inhalt:** Inhaltsdaten, Verkehrsdaten und Standortdaten unterliegen dem Kommunikationsgeheimnis. Pflicht gilt für "Betreiber oder Anbieter eines öffentlichen Kommunikationsnetzes oder -dienstes".

**AustroFit:** Kein TK-Betreiber. Relevant wird § 161 erst bei einem In-App-Chat-Feature — in diesem Fall wären übermittelte Nachrichten Inhaltsdaten (§ 168) und Kommunikationsgeheimnis wäre zu beachten.

---

### § 162–163 — Technische Einrichtungen / Datensicherheitsmaßnahmen
**Status:** ❌ nicht anwendbar

Gilt für TK-Betreiber. Entsprechende Datensicherheitspflichten ergeben sich für AustroFit aus Art. 32 DSGVO (dokumentiert in `docs/tom.yaml`).

---

### § 164 — Sicherheitsverletzungen
**Status:** ❌ nicht anwendbar (als primäre Adressatin)

**Inhalt:** Betreiber öffentlicher Kommunikationsdienste müssen Datenverletzungen unverzüglich der Datenschutzbehörde melden.

**AustroFit:** Meldepflicht bei Datenpannen ergibt sich aus Art. 33 DSGVO (72h-Frist). TKG § 164 ist für AustroFit nicht der primäre Rechtsrahmen.

---

### § 165 — Datenschutz – Allgemeines ✅ KERNPARAGRAPH FÜR AUSTROFIT

**Status Abs. 3:** ✅ anwendbar (explizit für Informationsgesellschaftsdienste)

**Volltext Abs. 3 (aus PDF):**
> "Betreiber öffentlicher Kommunikationsdienste **und Anbieter eines Dienstes der Informationsgesellschaft** im Sinne des § 3 Z 1 E-Commerce-Gesetz, BGBl. I Nr. 152/2001, sind verpflichtet, den Nutzer oder Benutzer darüber zu informieren, welche personenbezogenen Daten er verarbeiten wird, auf welcher Rechtsgrundlage und für welche Zwecke dies erfolgt und für wie lange die Daten gespeichert werden. Eine Ermittlung dieser Daten ist nur zulässig, wenn der Nutzer oder Benutzer seine Einwilligung dazu **aktiv** und auf Grundlage von **klaren und umfassenden Informationen** erteilt hat. Dies steht einer technischen Speicherung oder dem Zugang nicht entgegen, wenn der alleinige Zweck die Durchführung der Übertragung einer Nachricht über ein Kommunikationsnetz ist oder, wenn dies **unbedingt erforderlich** ist, damit der Anbieter eines Dienstes der Informationsgesellschaft, der vom Nutzer oder Benutzer ausdrücklich gewünscht wurde, diesen Dienst zur Verfügung stellen kann."

**Was § 165 Abs. 3 für AustroFit bedeutet:**

| Anforderung | Anforderungstext | AustroFit-Umsetzung | Status |
|---|---|---|---|
| **Information über Datenverarbeitung** | Welche Daten, Rechtsgrundlage, Zweck, Speicherdauer | Datenschutzerklärung (`/datenschutz`) | ✅ |
| **Aktive Einwilligung für Analytics** | Einwilligung muss "aktiv" erteilt werden (kein pre-checked) | `ConsentBanner.svelte`: PostHog wird nur bei `consent === 'true'` initialisiert; Ablehnen ist default | ✅ |
| **Klare & umfassende Information vor Einwilligung** | Nutzer muss wissen, wofür er einwilligt | ConsentBanner informiert über PostHog-Analytics | ✅ |
| **Ausnahme: technisch notwendige Speicherung** | Kein Consent nötig wenn "unbedingt erforderlich" für den ausdrücklich gewünschten Dienst | `austrofit_access_token`, `austrofit_anonymous_id`, Sync-Timestamps: für App-Funktionsfähigkeit unbedingt erforderlich | ✅ |

**localStorage-Key-Klassifikation:**

| localStorage-Key | Kategorie | Consent nötig? | Begründung |
|---|---|---|---|
| `austrofit_access_token` | Technisch notwendig | ❌ nein | Auth ohne Token unmöglich |
| `austrofit_anonymous_id` | Technisch notwendig | ❌ nein | Quiz-Dedup ohne Anonymous-ID nicht möglich |
| `austrofit_last_sync` / `_last_cardio_sync` | Technisch notwendig | ❌ nein | Sync-Throttle, Core-Funktionalität |
| `austrofit_analytics_consent` | Notwendig für Consent-Mgmt | ❌ nein | Speichert Einwilligungsentscheidung selbst |
| `austrofit_dev_native` / `_test_mode` | Dev-only | ❌ nein | Nur im Browser sichtbar (kein Prod-Nutzer) |
| **PostHog-Tracking** | Analytics | **✅ ja** | Initialisierung nur wenn `consent === 'true'` ✅ |

**Gesamtstatus § 165:** ✅ **compliant**

---

### § 166 — Stammdaten
**Status:** ❌ nicht anwendbar

Gilt für TK-Anbieter: Stammdaten dürfen nur für Vertrag, Verrechnung, Nutzerverzeichnis und Notdienste verarbeitet werden. AustroFit-Nutzerdaten (Name, E-Mail) sind keine "Stammdaten" im TKG-Sinne, sondern personenbezogene Daten nach DSGVO.

---

### § 167 — Verkehrsdaten
**Status:** ❌ nicht anwendbar

"Verkehrsdaten" = Daten, die bei der Nutzung von Kommunikationsdiensten entstehen (Anrufmetadaten, IP-Verbindungsdaten beim ISP). AustroFit ist kein TK-Betreiber und verarbeitet keine Verkehrsdaten im TKG-Sinne. API-Request-Logs auf Vercel-Seite sind nicht Gegenstand dieses Paragraphen.

---

### § 168 — Inhaltsdaten
**Status:** ❌ nicht anwendbar

"Inhaltsdaten" = Inhalt der Kommunikation (Sprache, Text einer Nachricht). AustroFit hat keine Kommunikationsfunktion zwischen Nutzern. Relevant werden würde § 168 bei einem In-App-Chat.

---

### § 169 — Andere Standortdaten als Verkehrsdaten
**Status:** ❌ nicht anwendbar

AustroFit verarbeitet keine Standortdaten. Schritte werden von Health Connect (Android) bereitgestellt — das sind aggregierte Bewegungsdaten, keine GPS-Standortdaten. Falls je GPS-basierte Features eingeführt werden (z.B. Lauf-Tracking mit Karte), ist § 169 zu prüfen: Einwilligung oder Anonymisierung erforderlich.

---

### § 170–172 — Datensicherheit / Durchlaufstelle
**Status:** ❌ nicht anwendbar (nur TK-Betreiber; Infrastruktur für Behördenauskunft)

---

### § 173 — Nutzerverzeichnis
**Status:** ❌ nicht anwendbar

Betrifft TK-Nutzerverzeichnisse (Telefonbuch). AustroFit führt kein öffentlich zugängliches Nutzerverzeichnis.

---

### § 174 — Unerbetene Nachrichten ✅ RELEVANT FÜR AUSTROFIT

**Status:** ✅ anwendbar (E-Mail-Direktwerbung)

**Volltext Abs. 3 (aus PDF):**
> "Die Zusendung einer elektronischen Post — einschließlich SMS — ist ohne vorherige Einwilligung des Empfängers unzulässig, wenn die Zusendung zu Zwecken der **Direktwerbung** erfolgt."

**Ausnahme Abs. 4** (Bestandskunden-Ausnahme, alle 4 Bedingungen müssen kumulativ erfüllt sein):
> 1. Absender hat Kontaktinformation im Zusammenhang mit dem Verkauf/einer Dienstleistung erhalten
> 2. Nachricht dient Direktwerbung für **eigene ähnliche** Produkte oder Dienstleistungen
> 3. Empfänger hatte klare Möglichkeit, Nutzung der Kontaktdaten bei Erhebung und bei jeder Übertragung kostenfrei abzulehnen
> 4. Empfänger hat die Zusendung nicht von vornherein abgelehnt

**Abs. 5** — Jedenfalls unzulässig wenn: Absenderidentität verschleiert, keine authentische Rücksende-Adresse, Aufforderung zum Besuch gesetzeswidriger Websites.

**AustroFit-Bewertung:**

| Kommunikationskanal | Zweck | Status |
|---|---|---|
| Magic Link E-Mail (`/api/auth/magic-link`) | Transaktional (Login) — KEINE Direktwerbung | ✅ kein Verstoß |
| E-Mail bei Registrierung | Transaktional (Bestätigung) | ✅ kein Verstoß |
| **Marketing-Newsletter / Promotions** | Direktwerbung → **Opt-in Pflicht** | ✅ nicht implementiert (kein Risiko) |
| Push-Notifications (Android) | Native OS-Benachrichtigungen | ⚠️ Graubereich — OS-Permission ≠ Marketing-Einwilligung nach § 174 |

**Push-Notifications:** § 174 bezieht sich auf "elektronische Post einschließlich SMS". Native App-Push-Notifications sind keine "elektronische Post" im klassischen Sinne — sie fallen eher unter DSGVO Art. 6 (Rechtsgrundlage). Bei Marketing-Pushes ist eine ausdrückliche DSGVO-Einwilligung empfehlenswert (und auch aus UX-Sicht sinnvoll), auch wenn § 174 nicht direkt greift.

**Gesamtstatus § 174:** ✅ **compliant** (keine Marketing-E-Mails implementiert)

---

## Gesamtergebnis

| § | Titel | AustroFit-Status | Begründung |
|---|---|---|---|
| § 160 | Allgemeines / Anwendungsbereich | 📋 referenz | Einstieg über § 165 Abs. 3 |
| § 161 | Kommunikationsgeheimnis | ❌ n.a. | Nur TK-Betreiber; bei In-App-Chat: prüfen |
| § 162–163 | Technische Einrichtungen / Datensicherheit | ❌ n.a. | Nur TK-Betreiber; DSGVO Art. 32 gilt |
| § 164 | Sicherheitsverletzungen | ❌ n.a. | Nur TK-Betreiber; DSGVO Art. 33 gilt |
| **§ 165 Abs. 3** | **Datenschutz Allgemeines (ePrivacy/Cookies)** | **✅ compliant** | ConsentBanner + technisch-notwendig-Ausnahme korrekt implementiert |
| § 166 | Stammdaten | ❌ n.a. | Nur TK-Betreiber |
| § 167 | Verkehrsdaten | ❌ n.a. | Nur TK-Betreiber |
| § 168 | Inhaltsdaten | ❌ n.a. | Kein In-App-Chat |
| § 169 | Standortdaten | ❌ n.a. | Keine GPS-/Standortdaten |
| § 170–172 | Datensicherheit / Durchlaufstelle | ❌ n.a. | Nur TK-Betreiber |
| § 173 | Nutzerverzeichnis | ❌ n.a. | Kein öffentliches Verzeichnis |
| **§ 174 Abs. 3** | **Unerbetene Nachrichten (E-Mail/SMS-Werbung)** | **✅ compliant** | Keine Marketing-E-Mails; Opt-in bei Implementierung Pflicht |

**Compliance-Status (Stand 05/2026): ✅ compliant**

---

## Trigger — Neu prüfen wenn:

1. **Marketing-Newsletter oder Promotions-E-Mails** → § 174 Abs. 3: Opt-in vor erster Zusendung; Abs. 5 beachten (authentische Absenderadresse, Abmeldemöglichkeit)
2. **In-App-Chat / Messaging zwischen Nutzern** → § 161 (Kommunikationsgeheimnis), § 168 (Inhaltsdaten)
3. **GPS-/Standort-Tracking** (z.B. Lauf-Tracking) → § 169: Einwilligung oder Anonymisierung
4. **Push-Notification Marketing** → DSGVO Art. 6 Einwilligung empfohlen; § 174 Abs. 3 direkt n.a., aber Einwilligungslogik analog anwenden

---

## Volltext-Dateien

| Datei | Inhalt | Status |
|---|---|---|
| `_screening.md` (diese Datei) | Vollständiges Paragraph-Screening | ✅ erstellt (v1.0-pending-review) |
| `paragraph-165.md` | § 165 Abs. 3 Volltext + Detailanalyse | zu erstellen wenn nötig |
| `paragraph-174.md` | § 174 Volltext + Detailanalyse | zu erstellen wenn nötig |

*Volltext-Dateien werden erstellt wenn tiefere Analyse oder Auditnachweis benötigt wird.*
