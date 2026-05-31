---
law: DSGVO
article: "32"
title: "Sicherheit der Verarbeitung (TOM)"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-art32-tom
req_refs: "REQ-R-007"
applicable: true
risk_level: hoch
last_reviewed: 2026-05-23
reviewed_by: "AI-assisted (Claude Sonnet), bestätigt durch: [Name + Datum]"
change_log:
  - date: 2026-05-23
    author: AI-assisted
    change: "Initiale Erstellung. Status: partial – TOM-Dokument (tom.yaml) vorhanden; Backup-Konzept und CSP-Header offen."
---

# Art. 32 – Sicherheit der Verarbeitung / TOM (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Unter Berücksichtigung des Stands der Technik, der Implementierungskosten und der Art, des Umfangs, der Umstände und der Zwecke der Verarbeitung sowie der unterschiedlichen Eintrittswahrscheinlichkeit und Schwere des Risikos für die Rechte und Freiheiten natürlicher Personen treffen der Verantwortliche und der Auftragsverarbeiter geeignete technische und organisatorische Maßnahmen, um ein dem Risiko angemessenes Schutzniveau zu gewährleisten; diese Maßnahmen schließen gegebenenfalls unter anderem Folgendes ein:
>
> **(a)** die Pseudonymisierung und Verschlüsselung personenbezogener Daten;
>
> **(b)** die Fähigkeit, die Vertraulichkeit, Integrität, Verfügbarkeit und Belastbarkeit der Systeme und Dienste im Zusammenhang mit der Verarbeitung auf Dauer sicherzustellen;
>
> **(c)** die Fähigkeit, die Verfügbarkeit der personenbezogenen Daten und den Zugang zu ihnen bei einem physischen oder technischen Zwischenfall rasch wiederherzustellen;
>
> **(d)** ein Verfahren zur regelmäßigen Überprüfung, Bewertung und Evaluierung der Wirksamkeit der technischen und organisatorischen Maßnahmen zur Gewährleistung der Sicherheit der Verarbeitung.
>
> **(2)** Bei der Beurteilung des angemessenen Schutzniveaus sind insbesondere die Risiken zu berücksichtigen, die mit der Verarbeitung verbunden sind, insbesondere durch — ob unbeabsichtigt oder unrechtmäßig — Vernichtung, Verlust, Veränderung oder unbefugte Offenlegung von beziehungsweise unbefugten Zugang zu personenbezogenen Daten, die übermittelt, gespeichert oder auf sonstige Weise verarbeitet wurden.
>
> **(3)** Die Einhaltung genehmigter Verhaltensregeln [...] oder eines genehmigten Zertifizierungsverfahrens [...] kann als Gesichtspunkt herangezogen werden, um die Anforderungen des Absatzes 1 nachzuweisen.
>
> **(4)** Der Verantwortliche und der Auftragsverarbeiter unternehmen Schritte, um sicherzustellen, dass ihnen unterstellte natürliche Personen, die Zugang zu personenbezogenen Daten haben, diese nur auf Anweisung des Verantwortlichen verarbeiten [...].

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 57*

---

## AustroFit TOM-Übersicht

**Maschinenlesbares TOM-Dokument:** `docs/tom.yaml`  
Dieses Artikel-Mapping verweist auf `docs/tom.yaml` als primäre Quelle. Die Tabellen hier fassen die Umsetzung kompakt zusammen.

### Art. 32 Abs. 1 lit. a — Pseudonymisierung und Verschlüsselung

| Maßnahme | Status | Details |
|---|---|---|
| HTTPS (TLS 1.2+) | ✅ | Vercel + Hetzner — alle API-Calls verschlüsselt in Transit |
| Passwort-Hashing (bcrypt) | ✅ | Directus-Standard; kein Klartext-Passwort gespeichert |
| Pseudonymisierung Analytics | ✅ | PostHog: User-ID statt E-Mail (identifyUser via userId, nicht E-Mail) |
| Anonymous-ID für Quiz | ✅ | Quiz-Attempts vor Claim mit anonymous_id (UUID) |
| DB-Verschlüsselung at rest | ⚠️ | Hetzner-VPS: keine explizite at-rest Encryption konfiguriert; Hetzner-Rechenzentrum physisch gesichert |
| JWT in localStorage | ⚠️ | Nicht httpOnly-Cookie (XSS-Risiko); in DPIA zu begründen (Performance-Trade-off, kein SSR) |

### Art. 32 Abs. 1 lit. b — Vertraulichkeit, Integrität, Verfügbarkeit, Belastbarkeit

| Maßnahme | Status | Details |
|---|---|---|
| CORS-Konfiguration | ✅ | `vercel.json` + `hooks.server.ts`: nur erlaubte Origins |
| Rate-Limiting | ✅ | `src/lib/server/rateLimit.ts`: Login, Registrierung, API-Endpunkte |
| Input-Validierung | ✅ | Server-seitig in allen API-Routes; kein Client-Trust |
| Least-Privilege API-Tokens | ✅ | `DIRECTUS_READ_TOKEN` (nur lesen) / `PRIVATE_CMS_STATIC_TOKEN` (custom collections) / `DIRECTUS_ADMIN_TOKEN` (nur OAuth) |
| SQL-Injection-Schutz | ✅ | Directus ORM — kein Raw-SQL |
| XSS-Schutz | ⚠️ | SvelteKit escapet Output; CSP-Header noch nicht gesetzt → in `vercel.json` ergänzen |
| Security-Headers (HSTS, X-Frame) | ⚠️ | Teilweise via Vercel; CSP fehlt noch |

### Art. 32 Abs. 1 lit. c — Wiederherstellbarkeit

| Maßnahme | Status | Details |
|---|---|---|
| Datenbank-Backup | ⚠️ offen | Hetzner-VPS: kein automatisches Backup konfiguriert — manuell oder via Hetzner Backup-Addon |
| Backup-Konzept schriftlich | ❌ offen | `docs/tom.yaml` offener Punkt: Backup-Konzept nicht fertiggestellt |
| Recovery-Prozess (RTO/RPO) | ❌ offen | Kein dokumentierter Recovery-Plan |

### Art. 32 Abs. 1 lit. d — Regelmäßige Überprüfung

| Maßnahme | Status | Details |
|---|---|---|
| TOM-Review-Prozess | ⚠️ partial | `docs/tom.yaml` vorhanden; kein formaler Review-Rhythmus definiert |
| Security-Review | ✅ | Security-Review Mai 2026 durchgeführt (7 Fixes dokumentiert in `project_security_review.md`) |
| Dependency-Updates | ⚠️ | Kein automatisierter Dependency-Scan (Dependabot, npm audit) |

---

## AustroFit-Mapping

### Anforderungen aus Art. 32

| # | Anforderung | Status | Evidence |
|---|---|---|---|
| 1 | Risikoangemessene TOM (Abs. 1) | ⚠️ partial | `docs/tom.yaml` dokumentiert 20 Maßnahmen in 9 Kategorien; Backup + CSP offen |
| 2 | Pseudonymisierung (Abs. 1 lit. a) | ✅ | Analytics pseudonymisiert; Quiz anonym; Passwörter gehasht |
| 3 | Verschlüsselung in Transit (Abs. 1 lit. a) | ✅ | HTTPS auf allen Endpunkten |
| 4 | Vertraulichkeit/Integrität (Abs. 1 lit. b) | ✅ | CORS, Rate-Limiting, Input-Validierung, Least-Privilege |
| 5 | Verfügbarkeit/Belastbarkeit (Abs. 1 lit. b) | ⚠️ partial | Vercel: hochverfügbar ✅; Directus/Hetzner: kein SLA, kein Backup |
| 6 | Wiederherstellbarkeit (Abs. 1 lit. c) | ❌ open | Backup-Konzept fehlt |
| 7 | Regelmäßige Überprüfung (Abs. 1 lit. d) | ⚠️ partial | Security-Review Mai 2026 ✅; kein Rhythmus definiert |
| 8 | Auftragsverarbeiter TOM-Verpflichtung (Abs. 4) | ⚠️ partial | Hetzner: ISO 27001 ✅; formal erst nach AVV-Abschluss bindend |

### Offene Punkte (vor Go-Live)

- [ ] **Backup-Konzept** schriftlich fertigstellen — Hetzner Backup-Addon aktivieren oder cron-basiertes PostgreSQL-Dump; in `docs/tom.yaml` dokumentieren (RTO/RPO angeben)
- [ ] **CSP-Header** (Content-Security-Policy) — in `vercel.json` und/oder `hooks.server.ts` ergänzen: `default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' eu.i.posthog.com [PUBLIC_CMSURL]`
- [ ] **HSTS + weitere Security-Headers** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` in `vercel.json` setzen
- [ ] **TOM-Review-Rhythmus** — halbjährlicher Review dokumentieren; bei jeder neuen Systemkomponente TOM-Update

---

## Audit-Nachweis

**Umsetzungsstand:** ⚠️ partial — Kern-TOM implementiert; Backup und Security-Headers offen

**Primäre Nachweise:**
- `docs/tom.yaml` — vollständiges TOM-Dokument
- `src/lib/server/rateLimit.ts` — Rate-Limiting
- `src/hooks.server.ts` — CORS, OPTIONS-Handler
- `vercel.json` — CORS-Header
- Projekt-Security-Review Mai 2026 (7 Fixes)

**Bestätigt durch:** — (ausstehend)  
**Nächste Review:** Nach Backup-Konzept-Fertigstellung + CSP-Header-Implementation
