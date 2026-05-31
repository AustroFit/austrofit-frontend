---
law: DSGVO
article: "25"
title: "Datenschutz durch Technikgestaltung und datenschutzfreundliche Voreinstellungen"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-art25-privacy-by-design
req_refs: "REQ-R-008"
applicable: true
risk_level: mittel
last_reviewed: 2026-05-23
reviewed_by: "AI-assisted (Claude Sonnet), bestätigt durch: [Name + Datum]"
change_log:
  - date: 2026-05-23
    author: AI-assisted
    change: "Initiale Erstellung. Status: partial – gute Datenminimierung; JWT-localStorage und fehlendes Consent-Logging als Lücken dokumentiert."
---

# Art. 25 – Privacy by Design / Privacy by Default (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Unter Berücksichtigung des Stands der Technik, der Implementierungskosten und der Art, des Umfangs, der Umstände und der Zwecke der Verarbeitung sowie der unterschiedlichen Eintrittswahrscheinlichkeit und Schwere der mit der Verarbeitung verbundenen Risiken für die Rechte und Freiheiten natürlicher Personen trifft der Verantwortliche sowohl zum Zeitpunkt der Festlegung der Mittel für die Verarbeitung als auch zum Zeitpunkt der eigentlichen Verarbeitung geeignete technische und organisatorische Maßnahmen — wie z.B. Pseudonymisierung — trifft, die dafür ausgelegt sind, die Datenschutzgrundsätze wie etwa Datenminimierung wirksam umzusetzen und die notwendigen Garantien in die Verarbeitung aufzunehmen, um den Anforderungen dieser Verordnung zu genügen und die Rechte der betroffenen Personen zu schützen. (**Privacy by Design**)
>
> **(2)** Der Verantwortliche trifft geeignete technische und organisatorische Maßnahmen, die sicherstellen, dass durch Voreinstellung grundsätzlich nur personenbezogene Daten, deren Verarbeitung für den jeweiligen bestimmten Verarbeitungszweck erforderlich ist, verarbeitet werden. Diese Verpflichtung gilt für die Menge der erhobenen personenbezogenen Daten, den Umfang ihrer Verarbeitung, ihre Speicherfrist und ihre Zugänglichkeit. Solche Maßnahmen müssen insbesondere sicherstellen, dass personenbezogene Daten durch Voreinstellung nicht ohne Eingreifen der Person einer unbestimmten Zahl von natürlichen Personen zugänglich gemacht werden. (**Privacy by Default**)

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 53*

---

## AustroFit — Privacy by Design Bewertung

### Positive Umsetzungen (Design-Entscheidungen mit Datenschutz-Vorteil)

| Entscheidung | Datenschutz-Vorteil | Status |
|---|---|---|
| Kein Standort-Tracking | Keine Bewegungsprofile der Nutzer | ✅ |
| Kein Herzfrequenz- / Schlaf-Tracking | Minimierung besonderer Kategorien | ✅ |
| Anonymous-ID für Quiz-Attempts | Keine Nutzerverknüpfung vor Einwilligung (Claim) | ✅ |
| Analytics opt-out by default (Consent-Banner) | Privacy by Default für nicht-essenzielle Verarbeitung | ✅ |
| Pseudonymisierung in PostHog (User-ID statt E-Mail) | Datenminimierung bei Analytics | ✅ |
| Least-Privilege API-Tokens | Zugriffsminimierung serverseitig | ✅ |
| API-Proxy-Pattern (kein direkter Directus-Zugriff) | Kontrolle über Datenpfade | ✅ |
| Punkte-Ledger append-only (keine Mutation) | Audit-Trail, Datenintegrität | ✅ |

### Lücken (Verbesserungsbedarf)

| Lücke | Risiko | Priorität |
|---|---|---|
| JWT in localStorage (kein httpOnly-Cookie) | XSS-Angriff könnte Token stehlen → Zugriff auf alle Nutzerdaten | P2 (in DPIA begründen) |
| Kein Consent-Logging (Art. 9) | Einwilligungsnachweis nicht möglich | P1 (vor Go-Live) |
| Health Connect Permission = eine Permission für alle Typen | Granularitätsverlust — Nutzer kann nicht einzelne Datentypen ablehnen | P2 |
| Kein automatischer Session-Timeout | Langlebige JWTs erhöhen Kompromittierungsrisiko | P2 |
| CSP-Header fehlen | XSS-Prävention nicht vollständig | P2 |

---

## AustroFit-Mapping

### Anforderungen aus Art. 25

| # | Anforderung | Status | Evidence |
|---|---|---|---|
| 1 | **Privacy by Design** — Datenschutz ab Systemgestaltung (Abs. 1) | ⚠️ partial | Gute Datenminimierung ✅; JWT-localStorage ist Designentscheidung die in DPIA begründet werden muss |
| 2 | **Privacy by Default** — nur notwendige Daten per Voreinstellung (Abs. 2) | ✅ | Analytics opt-out by default ✅; Health-Daten nur nach Einwilligung (technisch: nach Permission) ✅ |
| 3 | Datenminimierung als Gestaltungsprinzip | ✅ | Kein Standort, keine Biometrie außer Schritte/Workouts; anonymous_id für Quiz |
| 4 | Pseudonymisierung wo möglich | ✅ | Analytics; Quiz-Attempts |
| 5 | Dokumentation der Design-Entscheidungen | ⚠️ partial | Dieses Dokument; DPIA wird JWT-Entscheidung formal begründen |
| 6 | Pre-Implementation Datenschutz-Check (neue Features) | ⚠️ partial | Kein formaler Prozess; informell via compliance.yaml und features.yaml |

### Offene Punkte

- [ ] **JWT-localStorage in DPIA begründen** — Risiko (XSS) vs. Nutzen (kein SSR, Capacitor-Kompatibilität, Performance) formal abwägen; Gegemaßnahmen dokumentieren (CSP, Rate-Limiting, kurze Token-Laufzeit)
- [ ] **Consent-Logging** implementieren — `consent_log` Collection: Einwilligungen mit Zeitstempel speichern (→ art-07.md)
- [ ] **Session-Timeout** prüfen — JWT-Ablaufzeit konfigurieren (Directus: `ACCESS_TOKEN_TTL`); IEC 82304-2 §3.2.7 verweist auf Session-Management
- [ ] **CSP-Header** setzen — Teil der Privacy-by-Design-Maßnahmen (→ art-32.md)
- [ ] **Pre-Implementation-Datenschutz-Check** formalisieren — bei neuen Features: Art. 25-Check als Schritt in `docs/features.yaml` Status-Übergang `to-discuss → in-progress`

---

## Audit-Nachweis

**Umsetzungsstand:** ⚠️ partial — Privacy by Default gut umgesetzt; Privacy by Design Lücken bei JWT und Consent-Logging

**Bestätigt durch:** — (ausstehend — JWT-Begründung erfordert DPIA)  
**Nächste Review:** Mit DPIA (Art. 35); bei neuen System-Design-Entscheidungen
