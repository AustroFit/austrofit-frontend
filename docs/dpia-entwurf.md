# Datenschutz-Folgenabschätzung (DPIA) – AustroFit
**Entwurf zur rechtlichen Überprüfung | Stand: Mai 2026 | Version 1.0**

Verantwortlicher: Johannes Gnong · kontakt@austrofit.at · Sollingergasse 8-12/5/10, 1190 Wien  
Rechtsgrundlage: Art. 35 DSGVO · § 4 DSFA-AV (österr. Blacklist-Verordnung)

---

> **Leseanleitung für den Anwalt**
> - ✅ **TECHNISCH VOLLSTÄNDIG** – Inhalt ist technisch korrekt und kann übernommen werden
> - ⚠️ **RECHTSCHECK ERFORDERLICH** – Dieser Abschnitt benötigt rechtliche Beurteilung
> - 🔲 **ENTSCHEIDUNG OFFEN** – Betreiber/Anwalt müssen hier eine Entscheidung treffen

---

## 1. Anlass und Pflicht zur DPIA

**Warum ist eine DPIA erforderlich?**

AustroFit verarbeitet Gesundheitsdaten im Sinne von Art. 4 Nr. 15 DSGVO
(Schritt- und Bewegungsdaten, Aktivitätsgruppe). Gemäß Art. 35 Abs. 3 lit. b DSGVO
ist eine DPIA bei umfangreicher Verarbeitung besonderer Kategorien (Art. 9) verpflichtend.

> ⚠️ **RECHTSCHECK: Schwellenwert „umfangreich"**
> Die WP248-Leitlinien der Datenschutzbehörden stufen Fitness- und Gesundheits-Apps
> grundsätzlich als DPIA-pflichtig ein, unabhängig von der Nutzerzahl.
> Bitte prüfen: Gilt die DPIA-Pflicht auch für die MVP-Phase mit wenigen Testnutzern,
> oder ist ein Aufschub bis zum ersten echten Produktivbetrieb vertretbar?

> ⚠️ **RECHTSCHECK: Österreichische DSB-Blacklist (§ 4 DSFA-AV)**
> Bitte prüfen, ob AustroFits Verarbeitung auf der österreichischen Blacklist-Liste steht
> (§ 4 DSFA-AV) und damit ohne Ausnahme DPIA-pflichtig ist.

---

## 2. Beschreibung der Verarbeitung ✅

### 2.1 Zweck der Verarbeitung
- Berechnung personalisierter Bewegungsziele basierend auf WHO/FGOE-Empfehlungen
- Gamifizierte Belohnung regelmäßiger körperlicher Aktivität (Punkte-System)
- Motivation zur nachhaltigen Bewegungsförderung (Wellness-Anwendung, kein Medizinprodukt)

### 2.2 Art der Verarbeitung
| Schritt | Beschreibung |
|---|---|
| Erhebung | Native Android Health Connect API auf dem Nutzer-Gerät; Aktivitätsgruppe via Onboarding-Formular |
| Übermittlung | HTTPS-verschlüsselt an AustroFit-API (Vercel-Proxy → Directus/Hetzner) |
| Speicherung | PostgreSQL-Datenbank auf Hetzner-Server (Deutschland, EU) |
| Verarbeitung | Punkte-Berechnung, Streak-Berechnung, Level-Auswertung (serverseitig) |
| Anzeige | Pseudonymisiert im Nutzerprofil innerhalb der App |
| Löschung | Vollständige Kaskaden-Löschung bei Account-Löschung durch Nutzer |

### 2.3 Betroffene Personen
- Registrierte AustroFit-Nutzer (natürliche Personen; Mindestalter 18 Jahre laut AGB, technisch nicht verifiziert)
- Besonders schutzbedürftige Gruppen: Schwangere (`pregnant`), chronisch Erkrankte (`chronic`)

### 2.4 Verarbeitete Datenkategorien

**Gesundheitsdaten (Art. 9 DSGVO):**
| Datenkategorie | Quelle | Speicherort | Zweck |
|---|---|---|---|
| Schrittzahl pro Tag (aggregiert) | Android Health Connect | `points_ledger` (Hetzner) | Punkte-Berechnung |
| Workout-Typ und -Dauer | Android Health Connect | `activity_logs` (Hetzner) | Punkte-Berechnung Cardio |
| Aktivitätsgruppe (adult/senior/pregnant/chronic) | Onboarding-Formular | `user_profiles` (Hetzner) | Personalisierung Wochenziel |

**Keine Gesundheitsdaten (ergänzend):**
| Datenkategorie | Zweck |
|---|---|
| E-Mail, Benutzername, Passwort-Hash | Konto-Authentifizierung |
| Punkte-Buchungen (Ledger) | Gamification, Gutschein-Einlösung |
| Quiz-Ergebnisse (pseudonymisiert) | Lern-Tracking |

### 2.5 Empfänger der Daten
**Gesundheitsdaten werden an keine Dritten weitergegeben.**

Auftragsverarbeiter (kein Datenzugang zu Gesundheitsdaten im Klartext):
| Auftragsverarbeiter | Funktion | Standort | AVV |
|---|---|---|---|
| Hetzner Online GmbH | Server-Hosting (Datenbank) | Deutschland (EU) | ⚠️ noch abzuschließen |
| Vercel Inc. | Frontend-Hosting (kein DB-Zugriff) | USA (SCC-gesichert) | ⚠️ noch abzuschließen |

PostHog (Analytics): erhält **keine** Gesundheitsdaten – nur pseudonymisierte User-ID
und App-Nutzungsevents (Quiz abgeschlossen, Gutschein eingelöst etc.).

### 2.6 Drittlandtransfer
Gesundheitsdaten verbleiben auf EU-Servern (Hetzner, Deutschland). Kein Drittlandtransfer.

### 2.7 Speicherdauer
- Aktive Konten: unbegrenzt (solange Konto besteht)
- Konto-Löschung: vollständige synchrone Löschung aller Gesundheitsdaten unverzüglich (im selben API-Request)
- Keine gesetzlichen Aufbewahrungspflichten für Gesundheitsdaten bekannt

> ⚠️ **RECHTSCHECK: Speicherdauer**
> Bitte prüfen ob für den vorliegenden Verarbeitungszweck eine konkrete maximale
> Speicherdauer festgelegt werden sollte (z.B. Inaktivität >12 Monate → automatische Löschung).

---

## 3. Notwendigkeit und Verhältnismäßigkeit

### 3.1 Legitimität des Zwecks ✅
Bewegungsförderung ist ein anerkanntes Gesundheitsziel (WHO, FGOE, österr. Gesundheitsziele).
Die Verarbeitung dient einem legitimen Zweck.

### 3.2 Notwendigkeit der Verarbeitung ✅
- **Schrittdaten**: Notwendig für Punkte-Berechnung (Kern-Feature)
- **Workout-Daten**: Notwendig für Cardio-Punkte-Berechnung
- **Aktivitätsgruppe**: Notwendig für gruppenspezifische Wochenziele (adult/senior/pregnant/chronic)

Alternativen ohne Gesundheitsdaten würden den Kernzweck (personalisierte Bewegungsmotivation) unmöglich machen.

### 3.3 Datensparsamkeit ✅
- Keine Standortdaten (GPS) erhoben
- Keine biometrischen Daten (Herzfrequenz etc.) erhoben
- Schrittdaten nur aggregiert gespeichert (Tagessumme, keine Minutengenaue Bewegungsprofile)
- Aktivitätsgruppe: nur 4 Kategorien, keine Diagnosen
- Gesundheitsdaten nicht in Analytics übermittelt

### 3.4 Verhältnismäßigkeit

> ⚠️ **RECHTSCHECK: Verhältnismäßigkeit Aktivitätsgruppe**
> Die Aktivitätsgruppe `pregnant` und `chronic` sind besonders sensible Gesundheitsdaten.
> Bitte prüfen ob die Verarbeitung dieser spezifischen Gruppen durch den Zweck
> (Anpassung des Wochenziels) verhältnismäßig ist, oder ob eine weniger sensitive
> Kategorisierung (z.B. nur Aktivitätslevel statt Gesundheitszustand) ausreicht.

---

## 4. Risikobewertung

Bewertungsschema: Wahrscheinlichkeit (1=selten, 2=möglich, 3=wahrscheinlich) ×
Schwere (1=gering, 2=mittel, 3=schwer) = Risikoscore (1–9)

### Risiko 1: Unbefugter Zugriff auf Gesundheitsdaten ✅
- **Beschreibung**: Dritte erhalten Zugriff auf Schritt-/Workout-Daten oder Aktivitätsgruppe
- **Wahrscheinlichkeit**: 1 (selten) – JWT-Authentifizierung, Least-Privilege-Tokens, HTTPS
- **Schwere**: 3 (schwer) – Gesundheitsdaten, Art. 9
- **Risikoscore**: 3 (gering)
- **Maßnahmen**: JWT Bearer Token, 3 separate API-Tokens (Least Privilege), API-Proxy, kein Direktzugriff auf Directus vom Client, HTTPS/TLS erzwungen
- **Residualrisiko**: gering

### Risiko 2: Datenverlust durch technischen Ausfall ✅
- **Beschreibung**: Hetzner-Server-Ausfall, Datenverlust ohne Backup
- **Wahrscheinlichkeit**: 1 (selten) – Hetzner SLA
- **Schwere**: 2 (mittel) – Aktivitätsdaten verloren, Punkte verloren
- **Risikoscore**: 2 (gering)
- **Maßnahmen**: Hetzner-Hosting (professionell, Deutschland, EU); automatisiertes Backup noch zu konfigurieren (→ TOM op-2)
- **Residualrisiko**: mittel bis gering (sinkt nach Backup-Konfiguration)

### Risiko 3: Zweckentfremdung / Missbrauch durch Betreiber ✅
- **Beschreibung**: Betreiber nutzt Gesundheitsdaten über den deklarierten Zweck hinaus
- **Wahrscheinlichkeit**: 1 (sehr selten) – Einzelpersonenbetrieb, kein wirtschaftlicher Anreiz
- **Schwere**: 3 (schwer) – Vertrauensbruch, DSGVO-Verstoß
- **Risikoscore**: 3 (gering)
- **Maßnahmen**: Klare Zweckbindung in DSE, TOM-Dokument, minimale Datenerhebung
- **Residualrisiko**: gering

### Risiko 4: Unzureichende Rechtsgrundlage für Gesundheitsdaten ⚠️
- **Beschreibung**: Art.-9-Einwilligung im Onboarding ist rechtlich nicht ausreichend
- **Wahrscheinlichkeit**: 2 (möglich) – wird durch diese Session adressiert (separater Consent)
- **Schwere**: 3 (schwer) – Verarbeitung ohne gültige Rechtsgrundlage = Verstoß
- **Risikoscore**: 6 (mittel–hoch)
- **Maßnahmen**: Separater Art.-9-Consent-Schritt im Onboarding implementiert (Mai 2026, s. Anhang)
- **Residualrisiko nach Maßnahme**: gering

> ⚠️ **RECHTSCHECK: Rechtliche Bewertung Risiko 4**
> Bitte prüfen ob der implementierte Consent-Schritt (separates Häkchen mit
> Zweckangabe in Onboarding-Step 2) die Anforderungen von Art. 9 Abs. 2 lit. a DSGVO
> vollständig erfüllt. Insbesondere:
> - Ist der Consent-Text hinreichend spezifisch?
> - Ist die Einwilligung freiwillig (Nutzer kann App nicht ohne Consent nutzen)?
> - Ist der Widerruf hinreichend einfach möglich?

### Risiko 5: Diskriminierung aufgrund der Aktivitätsgruppe ✅
- **Beschreibung**: Aktivitätsgruppe (z.B. `chronic`) wird für Benachteiligung genutzt
- **Wahrscheinlichkeit**: 1 (sehr selten) – keine Weitergabe, nur intern für Zielberechnung
- **Schwere**: 3 (schwer) – Diskriminierung aufgrund Gesundheitszustand
- **Risikoscore**: 3 (gering)
- **Maßnahmen**: Gesundheitsdaten nicht an Dritte weitergegeben, nur für Wochenziel-Berechnung
- **Residualrisiko**: sehr gering

### Risiko 6: Nutzerprofiling über Health-Daten ✅
- **Beschreibung**: Aus Schritt-/Workout-Daten werden Gesundheitsprofile erstellt
- **Wahrscheinlichkeit**: 1 (kein Profiling geplant)
- **Schwere**: 3 (schwer)
- **Risikoscore**: 3 (gering)
- **Maßnahmen**: Daten werden ausschließlich für Punkte-Berechnung verwendet, kein ML-Scoring (Phase 2: separat zu bewerten)
- **Residualrisiko**: gering

---

## 5. Maßnahmen zur Risikoreduzierung ✅

Vollständige Dokumentation aller technischen und organisatorischen Maßnahmen:
→ **`docs/tom.yaml`** (9 Kategorien, 20 Maßnahmen, Mai 2026)

Relevante Maßnahmen im Überblick:
- HTTPS/TLS auf allen Übertragungen (zk-1)
- JWT-Authentifizierung + Least-Privilege-Tokens (zkk-1, zkk-2)
- API-Proxy: kein Direktzugriff auf Datenbank vom Client (zkk-3)
- Pseudonymisierung: nur UUIDs in allen Systemen (ps-1)
- Vollständige Löschung bei Account-Löschung (vk-3)
- Kein Drittland-Transfer für Gesundheitsdaten (wk-1)
- Datensparsamkeit: keine GPS, keine Biometrie (om-1)

---

## 6. Ergebnis und Residualrisiko

> ⚠️ **RECHTSCHECK: Gesamtbewertung des Residualrisikos**
> Bitte bewerten:
> 1. Ist das Gesamtrisiko nach Umsetzung aller Maßnahmen (insb. Art.-9-Consent,
>    Backup-Konzept) als akzeptabel einzustufen?
> 2. Ist eine vorherige Konsultation der österreichischen DSB erforderlich
>    (Art. 36 DSGVO – nur bei verbleibendem hohem Risiko)?
> 3. Empfehlung: DPIA vor Go-Live oder kann die Plattform mit Testnutzern starten?

> 🔲 **ENTSCHEIDUNG OFFEN: Überprüfungsintervall**
> Wann wird die DPIA das nächste Mal überprüft? Empfehlung: bei wesentlichen
> Änderungen der Verarbeitung (neues Feature mit Gesundheitsdaten, neue Auftragsverarbeiter)
> oder spätestens nach 2 Jahren.

---

## 7. Checkliste Anwalt

| Punkt | Status | Hinweis |
|---|---|---|
| DPIA-Pflicht bestätigen (§ 4 DSFA-AV Blacklist) | ⚠️ offen | |
| Rechtsgrundlage Art. 9 Abs. 2 lit. a geprüft | ⚠️ offen | Consent-Text im Anhang |
| Verhältnismäßigkeit Aktivitätsgruppen `pregnant`/`chronic` | ⚠️ offen | |
| Speicherdauer festlegen | ⚠️ offen | |
| Residualrisiko akzeptabel? | ⚠️ offen | |
| DSB-Konsultation erforderlich? (Art. 36) | ⚠️ offen | |
| AVV Hetzner abschließen | ⚠️ offen | Hetzner AVV-Formular abrufen |
| AVV Vercel abschließen | ⚠️ offen | Vercel DPA unter vercel.com/legal/dpa |
| Backup-Konzept schriftlich | ⚠️ zu ergänzen | TOM op-2 |
| DPIA-Überprüfungsintervall festlegen | 🔲 Entscheidung nötig | |

---

## Anhang: Implementierter Art.-9-Consent (Onboarding)

Der folgende Text ist seit Mai 2026 als Pflicht-Checkbox in Onboarding-Step 2
(Gruppenauswahl) implementiert. Bitte auf Art.-9-Tauglichkeit prüfen:

> *„Ich willige ausdrücklich ein (Art. 9 Abs. 2 lit. a DSGVO), dass AustroFit meine
> Gesundheits- und Aktivitätsdaten – Schritt- und Bewegungsdaten sowie meine
> Aktivitätsgruppe – verarbeitet, um mein persönliches Bewegungsziel zu berechnen
> und meine Aktivität zu belohnen. Diese Einwilligung ist freiwillig und kann jederzeit
> in den App-Einstellungen (Profil → Datenschutz) widerrufen werden."*

Technische Referenz: `src/routes/registrierung/+page.svelte`, Onboarding Step 2
