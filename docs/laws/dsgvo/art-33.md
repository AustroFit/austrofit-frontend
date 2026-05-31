---
law: DSGVO
article: "33"
title: "Meldung von Verletzungen des Schutzes personenbezogener Daten an die Aufsichtsbehörde"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-art32-tom
req_refs: "REQ-R-009"
applicable: true
risk_level: mittel
last_reviewed: 2026-05-23
reviewed_by: "AI-assisted (Claude Sonnet), bestätigt durch: [Name + Datum]"
change_log:
  - date: 2026-05-23
    author: AI-assisted
    change: "Initiale Erstellung. Status: open – Incident-Response-Prozess (72h-SOP) noch nicht erstellt."
---

# Art. 33 – Meldung von Datenschutzverletzungen an die Aufsichtsbehörde (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Im Falle einer Verletzung des Schutzes personenbezogener Daten meldet der Verantwortliche unverzüglich und möglichst binnen **72 Stunden**, nachdem ihm die Verletzung bekannt wurde, diese der gemäß Artikel 55 zuständigen Aufsichtsbehörde, es sei denn, dass die Verletzung des Schutzes personenbezogener Daten voraussichtlich **nicht zu einem Risiko** für die Rechte und Freiheiten natürlicher Personen führt. Erfolgt die Meldung an die Aufsichtsbehörde nicht binnen 72 Stunden, so ist ihr eine Begründung für die Verzögerung beizufügen.
>
> **(2)** Der Auftragsverarbeiter meldet eine Verletzung des Schutzes personenbezogener Daten nach deren Feststellung unverzüglich dem Verantwortlichen.
>
> **(3)** Die Meldung gemäß Absatz 1 muss zumindest Folgendes enthalten:
>
> **(a)** eine Beschreibung der Art der Verletzung des Schutzes personenbezogener Daten, soweit möglich mit Angabe der Kategorien und der ungefähren Zahl der betroffenen Personen und der betroffenen Datensätze;
>
> **(b)** den Namen und die Kontaktdaten des Datenschutzbeauftragten oder einer sonstigen Anlaufstelle für weitere Informationen;
>
> **(c)** eine Beschreibung der wahrscheinlichen Folgen der Verletzung des Schutzes personenbezogener Daten;
>
> **(d)** eine Beschreibung der von dem Verantwortlichen ergriffenen oder vorgeschlagenen Maßnahmen zur Behebung der Verletzung des Schutzes personenbezogener Daten und gegebenenfalls Maßnahmen zur Abmilderung ihrer möglichen nachteiligen Auswirkungen.
>
> **(4)** Wenn und soweit die Informationen nicht zur gleichen Zeit bereitgestellt werden können, können die Informationen ohne weitere unzumutbare Verzögerung schrittweise zur Verfügung gestellt werden.
>
> **(5)** Der Verantwortliche dokumentiert Verletzungen des Schutzes personenbezogener Daten einschließlich aller damit zusammenhängenden Fakten, ihrer Auswirkungen und der ergriffenen Abhilfemaßnahmen. Diese Dokumentation muss es der Aufsichtsbehörde ermöglichen, die Einhaltung der Anforderungen dieses Artikels zu überprüfen.

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 58*

---

## Zuständige Aufsichtsbehörde

**Datenschutzbehörde (DSB) Wien**  
Barichgasse 40–42, 1030 Wien  
E-Mail: dsb@dsb.gv.at  
Telefon: +43 1 531 15-202525  
Online-Meldung: https://www.dsb.gv.at/  

Frist: **72 Stunden** ab Kenntnisnahme durch AustroFit (Betreiber).

---

## Risikobewertungs-Framework

### Meldepflicht ja/nein — Entscheidungsbaum

```
Datenschutzverletzung festgestellt
→ Führt sie voraussichtlich zu KEINEM Risiko für Betroffene?
   → JA: Keine Meldepflicht, aber intern dokumentieren (Abs. 5)
   → NEIN / UNKLAR: Meldung binnen 72h (Abs. 1)
      → Hohes Risiko für Betroffene?
         → JA: Zusätzlich Betroffene benachrichtigen (Art. 34)
         → NEIN: Nur DSB-Meldung
```

### Risikobewertung für typische AustroFit-Szenarien

| Szenario | Betroffene Daten | Risiko | Meldepflicht |
|---|---|---|---|
| Hetzner-Server-Kompromittierung | Alle Nutzerdaten inkl. Gesundheitsdaten | **Hoch** | ✅ Meldung + Art. 34 Benachrichtigung |
| Vercel-Sicherheitslücke (API-Logs) | Request-Daten mit User-IDs | Mittel | ✅ Meldung |
| Einzelner Account kompromittiert (Phishing) | 1 Nutzer, alle seine Daten | Mittel (begrenzt) | ⚠️ prüfen (1 Person → meist Meldung) |
| Öffentlichwerden von Punkte-Daten (ohne Personenbezug) | Aggregierte Statistiken | Gering | ❌ keine Meldung (kein Personenbezug) |
| PostHog-Breach (EU-Cloud) | Pseudonymisierte Events | Gering-Mittel | ⚠️ prüfen (Pseudonymisierung bewertet) |
| Unbeabsichtigt falsche Punkte-Buchung | Punkte-Ledger | Kein Risiko | ❌ kein Datenschutzverstehen |
| Verlust Backup-Daten (ohne Fremdzugriff) | Intern, kein Fremdzugriff | Gering | ❌ intern dokumentieren |

---

## Standard-Operating-Procedure (SOP) — 72h-Prozess

**Status:** ❌ noch nicht formalisiert — zu erstellen vor Go-Live

### Entwurf SOP (zu bestätigen)

**Phase 1 — Erkennung (0–2h)**
1. Hinweis auf Verletzung (Monitoring, Nutzerhinweis, Hetzner-Benachrichtigung, Vercel-Alert)
2. Sofortmaßnahme: betroffenen Dienst isolieren / Zugriffspasswörter rotieren wenn nötig
3. Eskalation an Betreiber (Johannes Gnong): johannes.gnong@austrofit.at

**Phase 2 — Bewertung (2–12h)**
4. Art der Verletzung klären: Was war kompromittiert? Welche Nutzerdaten? Wie viele Personen?
5. Risikobewertung anhand obiger Tabelle: Meldepflicht ja/nein?
6. Temporäre Dokumentation anlegen: `docs/incidents/YYYY-MM-DD-[kurzbeschreibung].md`

**Phase 3 — Meldung (bis 72h)**
7. DSB-Meldung: https://www.dsb.gv.at/ (Online-Formular)  
   Inhalt: Art der Verletzung, Kategorien/Anzahl Betroffene, Kontaktstelle, wahrscheinliche Folgen, ergriffene Maßnahmen (Abs. 3 lit. a–d)
8. Falls hohes Risiko: Nutzer-Benachrichtigung (Art. 34) — In-App-Banner oder E-Mail
9. Behörde über Verzögerung informieren falls 72h nicht haltbar (Begründung beilegen)

**Phase 4 — Nachbearbeitung**
10. Incident-Dokumentation finalisieren (`docs/incidents/`)
11. Post-Mortem: Wie konnte die Verletzung entstehen? Welche TOM-Anpassung verhindert Wiederholung?
12. TOM-Dokument (`docs/tom.yaml`) und Compliance-Status aktualisieren

---

## AustroFit-Mapping

### Anforderungen aus Art. 33

| # | Anforderung | Status | Evidence |
|---|---|---|---|
| 1 | 72h-Meldepflicht kennen und umsetzen können | ⚠️ partial | Wissen vorhanden; Prozess nicht formalisiert |
| 2 | Kontakt DSB Wien bekannt | ✅ | Oben dokumentiert |
| 3 | Inhalt der Meldung (Abs. 3 lit. a–d) vorbereitet | ⚠️ partial | Template-Checkliste oben vorhanden (Entwurf) |
| 4 | Auftragsverarbeiter-Meldepflicht (Abs. 2) — Hetzner/Vercel melden an AustroFit | ⚠️ partial | Formal erst nach AVV-Abschluss geregelt; Hetzner und Vercel haben eigene Incident-Prozesse |
| 5 | Interne Dokumentation aller Verletzungen (Abs. 5) | ❌ open | `docs/incidents/` Verzeichnis noch nicht angelegt; kein Prozess |

### Offene Punkte (vor Go-Live)

- [ ] **SOP formalisieren** — diesen Entwurf als `docs/incidents/SOP-datenschutzverletzung.md` abspeichern; von Betreiber bestätigen lassen
- [ ] **`docs/incidents/`** Verzeichnis anlegen — für künftige Incident-Dokumentation (Abs. 5)
- [ ] **Monitoring-Alerts** einrichten — Hetzner-Server-Alerts (CPU/Memory-Anomalien als Intrusion-Signal); Vercel-Error-Monitoring (ungewöhnliche Error-Rates)
- [ ] **Auftragsverarbeiter-Meldekette** in AVV regeln — Hetzner/Vercel müssen bei eigenen Incidents AustroFit binnen angemessener Frist informieren (in AVV festlegen, Art. 28 Abs. 3 lit. f)

---

## Audit-Nachweis

**Umsetzungsstand:** ❌ open — SOP nicht formalisiert; kein Incident-Register

**Wichtig:** Ein nicht gemeldeter meldepflichtiger Vorfall kann Bußgelder nach Art. 83 DSGVO nach sich ziehen (bis 10 Mio. EUR oder 2% Jahresumsatz).

**Nächste Schritte:**
1. SOP als Markdown-Dokument finalisieren (`docs/incidents/SOP-datenschutzverletzung.md`)
2. `docs/incidents/` anlegen
3. Nach AVV-Abschluss: Meldekette mit Hetzner/Vercel im AVV verankern

**Bestätigt durch:** — (ausstehend)  
**Nächste Review:** Nach AVV-Abschluss + SOP-Formalisierung
