---
law: DSGVO
article: "35"
title: "Datenschutz-Folgenabschätzung (DPIA)"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-art35-dpia
req_refs: "REQ-R-006"
applicable: true
risk_level: kritisch
last_reviewed: 2026-05-22
reviewed_by: "AI-assisted (Claude Sonnet), zu bestätigen durch: [Name + Datum]"
change_log:
  - date: 2026-05-22
    author: AI-assisted
    change: "Initiale Erstellung. Status: open – DPIA noch nicht erstellt. BLOCKEND vor Go-Live."
---

# Art. 35 – Datenschutz-Folgenabschätzung / DPIA (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Hat eine Form der Verarbeitung, insbesondere bei Verwendung neuer Technologien, aufgrund der Art, des Umfangs, der Umstände und der Zwecke der Verarbeitung voraussichtlich ein **hohes Risiko** für die Rechte und Freiheiten natürlicher Personen zur Folge, so führt der Verantwortliche vorab eine Abschätzung der Folgen der vorgesehenen Verarbeitungsvorgänge für den Schutz personenbezogener Daten durch. Für die Untersuchung mehrerer ähnlicher Verarbeitungsvorgänge mit ähnlich hohen Risiken kann eine einzige Abschätzung vorgenommen werden.
>
> **(2)** Der Verantwortliche holt bei der Durchführung einer Datenschutz-Folgenabschätzung den Rat des Datenschutzbeauftragten, sofern ein solcher benannt wurde, ein.
>
> **(3)** Eine Datenschutz-Folgenabschätzung gemäß Absatz 1 ist insbesondere in folgenden Fällen **erforderlich**:
>
> **(a)** systematische und umfassende Bewertung persönlicher Aspekte natürlicher Personen, die sich auf automatisierte Verarbeitung einschließlich Profiling gründet und die ihrerseits als Grundlage für Entscheidungen dient, die Rechtswirkung gegenüber natürlichen Personen entfalten oder diese in ähnlich erheblicher Weise beeinträchtigen;
>
> **(b) umfangreiche Verarbeitung besonderer Kategorien von personenbezogenen Daten gemäß Artikel 9 Absatz 1** oder von personenbezogenen Daten über strafrechtliche Verurteilungen und Straftaten gemäß Artikel 10 oder
>
> **(c)** systematische umfangreiche Überwachung öffentlich zugänglicher Bereiche.
>
> **(4)** Die Aufsichtsbehörde erstellt eine Liste der Verarbeitungsvorgänge, für die gemäß Absatz 1 eine Datenschutz-Folgenabschätzung durchzuführen ist, und veröffentlicht diese [...]
>
> **(7)** Die Folgenabschätzung enthält zumindest Folgendes:
>
> **(a)** eine **systematische Beschreibung** der geplanten Verarbeitungsvorgänge und der Zwecke der Verarbeitung, gegebenenfalls einschließlich der von dem Verantwortlichen verfolgten berechtigten Interessen;
>
> **(b)** eine **Bewertung der Notwendigkeit und Verhältnismäßigkeit** der Verarbeitungsvorgänge in Bezug auf den Zweck;
>
> **(c)** eine **Bewertung der Risiken** für die Rechte und Freiheiten der betroffenen Personen gemäß Absatz 1 und
>
> **(d)** die zur Bewältigung der Risiken **geplanten Abhilfemaßnahmen**, einschließlich Garantien, Sicherheitsvorkehrungen und Verfahren, durch die der Schutz personenbezogener Daten sichergestellt und der Nachweis dafür erbracht wird, dass diese Verordnung eingehalten wird [...]
>
> **(9)** Der Verantwortliche holt gegebenenfalls den Standpunkt der betroffenen Personen oder ihrer Vertreter zu der beabsichtigten Verarbeitung unbeschadet des Schutzes gewerblicher oder öffentlicher Interessen oder der Sicherheit der Verarbeitungsvorgänge ein.
>
> **(11)** Erforderlichenfalls führt der Verantwortliche eine Überprüfung durch, um zu bewerten, ob die Verarbeitung gemäß der Datenschutz-Folgenabschätzung durchgeführt wird [...]

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 52–54*

---

## AustroFit: Warum ist eine DPIA Pflicht?

### Prüfung der Pflicht-Tatbestände (Art. 35 Abs. 3)

| Tatbestand | Trifft zu? | Begründung |
|---|---|---|
| Abs. 3 lit. (a): Systematisches Profiling mit Rechtswirkung | ⚠️ Phase 2 | Isolation-Forest Fraud-Detection (Phase 2): Falls automatisiertes Sperren → DPIA erforderlich |
| **Abs. 3 lit. (b): Umfangreiche Verarbeitung Art. 9-Daten** | **✅ JA** | **AustroFit verarbeitet Gesundheitsdaten (Schritte, Workouts, Aktivitätsgruppe) von potenziell vielen Nutzern** |
| Abs. 3 lit. (c): Überwachung öffentlicher Bereiche | ❌ Nein | Kein GPS-Tracking, keine Kamera |

**Ergebnis: DPIA ist Pflicht nach Art. 35 Abs. 3 lit. (b).**

### Österreichische DSB-Blacklist (§ 4 DSFA-AV)
Die österreichische Datenschutzbehörde hat eine Liste von Verarbeitungen veröffentlicht, für die immer eine DPIA erforderlich ist. Zu prüfen vor DPIA-Erstellung:
- Verarbeitung von Gesundheitsdaten zu Bewertungszwecken: **wahrscheinlich zutreffend**
- Profiling anhand sensibler Daten: **prüfen**
- *Aktuelle Liste:* https://www.dsb.gv.at/

---

## AustroFit-Mapping

### Was muss die DPIA enthalten? (Art. 35 Abs. 7)

| Pflichtbestandteil | Inhalt für AustroFit | Status |
|---|---|---|
| (a) Systematische Beschreibung der Verarbeitungsvorgänge | Flowchart: Registrierung → Health Connect → Punktevergabe → Dashboard. Alle Datenflüsse mit Empfängern. | ❌ zu erstellen |
| (a) Zwecke der Verarbeitung | Motivation zu Bewegung; Gamification; Punktevergabe; Community. | ❌ zu formalisieren |
| (b) Bewertung Notwendigkeit & Verhältnismäßigkeit | Warum sind Gesundheitsdaten für den Zweck notwendig? Gibt es weniger eingriffsintensive Alternativen? | ❌ zu erstellen |
| (c) Risikobewertung | Identifikation und Bewertung aller Risiken für Nutzerrechte (Vertraulichkeit, Integrität, Missbrauch, Disclosure) | ❌ zu erstellen |
| (d) Abhilfemaßnahmen | TOM (docs/tom.yaml), AVV, Consent-Konzept, Löschkonzept, Backup-Konzept | ⚠️ teilweise vorhanden |

### Risikofelder für AustroFit-DPIA

Die folgenden Risiken müssen in der DPIA bewertet werden:

| Risiko | Wahrscheinlichkeit | Schwere | Aktueller Schutz |
|---|---|---|---|
| Unbefugter Zugriff auf Gesundheitsdaten | mittel | hoch | HTTPS, Auth, CORS ✅ |
| Datenpanne bei Hetzner (PostgreSQL) | niedrig | hoch | AVV offen ⚠️ |
| Missbrauch von Aktivitätsdaten durch Arbeitgeber/Versicherungen | niedrig | sehr hoch | Kein Datenaustausch mit Dritten ✅; AGB-Klausel zu ergänzen |
| Re-Identifizierung anonymer Quiznutzer | sehr niedrig | mittel | anonymous_id-Mechanismus ✅ |
| Fehlerhafte Aktivitätsgruppen-Daten (z.B. falsch "chronic" gewählt) | mittel | mittel | Editierbarkeit im Profil (zu prüfen) |
| JWT in localStorage (Session-Hijacking) | niedrig | hoch | Bewusste Entscheidung für Capacitor → in DPIA begründen |
| Weitergabe Health-Connect-Daten an Google | niedrig | hoch | Health Connect ist lokal; keine Weitergabe von AustroFit-Seite |

### Offene Punkte (vor Go-Live)
- [ ] **DPIA erstellen** – Empfohlenes Vorgehen: WKO-Erstberatung + CNIL-DPIA-Tool (Open Source) oder österreichisches DSB-Formular verwenden
- [ ] **Vorherige Konsultation prüfen** (Art. 36): Falls DPIA hohes Restrisiko ergibt → DSB konsultieren
- [ ] **JWT-localStorage-Entscheidung** formal in DPIA begründen (Capacitor-Kompatibilität vs. httpOnly Cookie)
- [ ] **Backup-Konzept schriftlich** fertigstellen (Voraussetzung für TOM-Vollständigkeit in DPIA)
- [ ] **AVV Hetzner + Vercel Pro** vor DPIA-Abschluss erledigen (Abhilfemaßnahme in DPIA referenziert)

### Zeitplan

| Schritt | Priorität | Wann |
|---|---|---|
| AVV Hetzner abschließen | P1 | Sofort (5 Min) |
| Vercel Pro + DPA | P1 | Vor Go-Live |
| Art. 9-Consent implementieren | P1 | Vor Go-Live |
| DPIA erstellen | P1 | Vor erstem echten Nutzer |
| DPIA extern reviewed (Rechtsberatung) | P2 | Vor Go-Live oder kurz danach |

---

## Audit-Nachweis

**Umsetzungsstand:** ❌ open – BLOCKEND vor Go-Live

**Wenn DPIA erstellt:**
- Ablageort: `docs/compliance/dpia-austrofit-v1.pdf` (oder .docx)
- Versionierungsschema: `dpia-austrofit-vX.X-YYYY-MM.pdf`
- Bei wesentlichen Systemänderungen: neue DPIA-Version

**Referenz-Tools:**
- CNIL Open Source DPIA-Software: https://www.cnil.fr/en/open-source-pia-software-helps-carry-out-data-protection-impact-assessment
- DSB Österreich Leitfaden: https://www.dsb.gv.at/

**Bestätigt durch:** — (ausstehend)  
**Nächste Review:** Nach DPIA-Erstellung; bei neuen umfangreichen Verarbeitungen (z.B. Vorsorge-Integration, ML-Scoring)
