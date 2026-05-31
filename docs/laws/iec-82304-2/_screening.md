---
law: IEC-82304-2
title: "IEC 82304-2: Health and Wellness Apps – Quality Requirements and Evaluation"
rechtsgrundlage: "IEC 82304-2:2021 – kostenpflichtiger Standard"
source_ref: "IEC 82304-2:2021"
source_date: "—"
source_url: "kostenpflichtig – kein öffentlicher Volltext. Bezug über: https://www.austrian-standards.at"
screened_by: "ausstehend"
screened_date: "—"
last_reviewed: "—"
version: "0.1-draft"
---

# IEC 82304-2 – Screening (AustroFit)

> **WICHTIG:** Dieser Standard ist kostenpflichtig. Der Volltext ist NICHT öffentlich zugänglich.
> Normtext kaufen (ca. CHF 200–300) bevor Screening durchgeführt wird.
> Bekannte Informationen basieren ausschließlich auf Abschnitt 3.2 (Begriffsdefinitionen), der dem Projekt vorliegt.

**Bekannte Applicability (aus compliance.yaml):** `applicability: true`
AustroFit qualifiziert als "health app" (3.2.3): App zur Verwaltung, Erhaltung oder Verbesserung der Gesundheit.
Kein Widerspruch zu MDR-Nicht-Anwendbarkeit: MDR = diagnostisch/therapeutisch; IEC 82304-2 = Wellness/Health Management.

## Bereits identifizierte Lücken (aus Abschnitt 3.2)

### 3.2.3 – health app Definition
**Status:** ✅ anwendbar (Standard gilt für AustroFit)
**Kurzinhalt:** App zur Verwaltung, Erhaltung oder Verbesserung der Gesundheit.
**AustroFit-Relevanz:** Schritt-Tracking, Workout-Tracking, Aktivitätsgruppen = health app ✅.

### 3.2.7 – Session Management
**Status:** ⚠️ potenzielle Lücke (Anforderungen unbekannt ohne Volltext)
**Kurzinhalt:** Sicherung des wiederholten Zugangs nach Authentifizierung; Beispiel: automatischer Logout nach Inaktivität.
**AustroFit-Relevanz:** AustroFit hat kein Session-Timeout (JWT unbegrenzt in localStorage). Ob Standard dies fordert: erst nach Kauf bekannt.

### 3.2.8/3.2.9 – Validation/Verification
**Status:** ⚠️ potenzielle Lücke (Anforderungen unbekannt ohne Volltext)
**Kurzinhalt:** Objektive Evidenz für Anforderungserfüllung.
**AustroFit-Relevanz:** Kein Test-Suite konfiguriert, kein formaler QA-Prozess dokumentiert.

## Bekannte Kategorien des Standards (unvollständig, ohne Normtext)

1. App-Transparenz (Beschreibung, Zweck, Hersteller)
2. Datenschutz & Sicherheit (DSGVO-Konformität, Session Management)
3. Inhaltsqualität (Evidenzbasis Gesundheitsinhalte, Aktualisierungsprozess)
4. Technische Qualität (Testing, Validierung, Zuverlässigkeit)

---

*Vollständiges Screening erst nach Kauf des Normtexts möglich.*
*Nächste Schritte (Phase 2): Standard kaufen → Gap-Analyse → Self-Assessment oder Third-Party-Review.*
