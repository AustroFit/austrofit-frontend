---
law: KSchG
title: Konsumentenschutzgesetz
rechtsgrundlage: BGBl. Nr. 140/1979 idgF
source_ref: "BGBl. Nr. 140/1979; Fassung vom 24.05.2026"
source_date: "2026-05-24"
source_file: "KSchG, Fassung vom 24.05.2026.pdf"
aenderungen: "BGBl. I Nr. 110/2025 (letzte Änd., NR GP XXVIII RV 279, in Kraft ab 01.01.2026)"
screened_by: "AI-assisted (Claude Sonnet 4.6), basierend auf PDF Fassung 24.05.2026; bestätigt durch: [Name + Datum]"
screened_date: "2026-05-24"
last_reviewed: "2026-05-24"
version: "1.0-pending-review"
---

# KSchG – Paragraph-Screening (AustroFit)

> **Methodik:** Screening basiert ausschließlich auf dem PDF "KSchG, Fassung vom 24.05.2026.pdf" (24 Seiten, RIS Bundesrecht konsolidiert).
> Letzte Änderung: BGBl. I Nr. 110/2025 (§ 6 Abs. 2 Z 4 Indexierungsanpassung, in Kraft 01.01.2026).

> **Hinweis VGG:** Das Verbrauchergewährleistungsgesetz (BGBl. I Nr. 175/2021, Umsetzung EU 2019/770 + 2019/771) regelt Gewährleistung bei digitalen Leistungen und wird im KSchG mehrfach referenziert (§§ 7d, 9, 9a). VGG ist für AustroFit als Anbieter digitaler Leistungen gesondert zu screenen. → Trigger: `docs/laws/vgg/_screening.md` anlegen (P2, vor Go-Live empfohlen).

---

## Anwendbarkeit — Grundsatzfrage

**§ 1 Abs. 1 — Geltungsbereich:**
> "Dieses Hauptstück gilt für Rechtsgeschäfte, an denen 1. einerseits jemand, für den das Geschäft zum Betrieb seines Unternehmens gehört [...] und 2. andererseits jemand, für den dies nicht zutrifft [...] beteiligt sind."

**AustroFit:**
- AustroFit = Unternehmer (auf Dauer angelegte Organisation selbstständiger wirtschaftlicher Tätigkeit, § 1 Abs. 2)
- App-Nutzer (Anna, Walter, Laura, Thomas) = Verbraucher (kein gewerblicher Zweck)
- Nutzungsvertrag (Registrierung = Vertragsabschluss) → KSchG I. Hauptstück vollumfänglich anwendbar

**→ KSchG ist anwendbar. B2C-Nutzungsvertrag fällt vollständig unter das I. Hauptstück.**

---

## Screening-Legende
- `✅ anwendbar` – Direkte Pflichten für AustroFit
- `⚠️ bedingt` – Anwendbar nur unter bestimmten Bedingungen
- `❌ nicht anwendbar` – Mit Begründung
- `📋 referenz` – Definitionsgrundlage / Hintergrundnorm

---

## I. HAUPTSTÜCK — Verträge zwischen Unternehmern und Verbrauchern

### Abschnitt I — Geltungsbereich

#### § 1 — Geltungsbereich
**Status:** 📋 referenz
AustroFit ist Unternehmer, Nutzer sind Verbraucher. I. Hauptstück anwendbar.

#### § 2 — Unabdingbarkeit
**Status:** ✅ anwendbar
> "Soweit in Vereinbarungen von diesem Hauptstück zum Nachteil des Verbrauchers abgewichen wird, sind sie unwirksam."

**AustroFit-Relevanz:** Alle AGB-Klauseln, die von KSchG-Schutzregeln zum Nachteil des Nutzers abweichen, sind nichtig — unabhängig davon ob der Nutzer zustimmt. Zwingendes Recht. Besonders relevant für § 6 (unzulässige Klauseln) und § 14 (Gerichtsstand).

---

### Abschnitt II — Allgemeine Regeln

#### § 3 — Rücktrittsrecht (Haustürgeschäfte)
**Status:** ❌ nicht anwendbar (aktuell)
Rücktrittsrecht bei Vertragsabschluss außerhalb von Geschäftsräumen (Messen, Haustürbesuche). AustroFit wird ausschließlich online registriert — kein Haustürgeschäft.

**Trigger:** Bei Messe-Registrierungen, Guerrilla-Marketing, Außendienstakquise → § 3 neu prüfen. Dann: 14-tägige Rücktrittsfrist + Belehrungspflicht.

#### § 3a — Rücktrittsrecht bei irreführenden Informationen
**Status:** ⚠️ bedingt
Rücktritt wenn Unternehmer Umstände irreführend dargestellt hat (z.B. falsche Förderungsaussichten). Für AustroFit: Marketing-Aussagen müssen korrekt sein.

**Trigger:** Keine spezifische Aktion nötig. Prophylaktisch: keine irreführenden Health-Claims oder Partnerversprechen in der App.

#### §§ 4–5 — Rechtsfolgen Rücktritt / Kostenvoranschläge
**Status:** ❌ nicht anwendbar
§ 4: Rückabwicklung nach Rücktritt (Geldleistungen). § 5: Kostenvoranschläge. AustroFit ist kostenlos, kein physisches Geschäft.

---

### § 5a — Allgemeine Informationspflichten des Unternehmers ❌ NEUER BLOCKER

**Status:** ✅ anwendbar — **❌ open (P1 Go-Live Blocker)**
**compliance_ref:** kschg-5a-informationspflichten

**Abs. 1 — Vor Vertragsabschluss (= vor Registrierung) muss AustroFit klar und verständlich informieren über:**

| Z | Pflichtangabe | AustroFit-Umsetzung | Status |
|---|---|---|---|
| Z 1 | Wesentliche Eigenschaften der Dienstleistung (für das Kommunikationsmittel angemessen) | Kurztext "Was ist AustroFit?" auf `/registrierung` | ⚠️ zu konkretisieren |
| Z 2 | Name / Firma, Telefonnummer, Anschrift der Niederlassung | `/impressum` | ✅ |
| Z 3 | Gesamtpreis (oder wenn nicht berechenbar: Berechnungsart) | App kostenlos — muss explizit als "kostenlos" kommuniziert sein | ⚠️ ergänzen |
| Z 4 | Zahlungs-, Liefer-, Leistungsbedingungen; Zeitraum; Beschwerdeverfahren | Punkte-System-Beschreibung + Kündigungsmöglichkeit fehlen | ❌ offen |
| Z 5 | Hinweis auf gesetzliches Gewährleistungsrecht für digitale Leistungen (VGG) | Fehlt | ❌ offen |
| Z 6 | Vertragsdauer / Kündigungsbedingungen für unbefristete Verträge | Fehlt (unbefristeter Nutzungsvertrag) | ❌ offen |
| Z 7 | **Funktionalität digitaler Leistungen** einschließlich anwendbarer technischer Schutzmaßnahmen | Fehlt (Capacitor, Health-Permissions, Datenverschlüsselung) | ❌ offen |
| Z 8 | **Kompatibilität und Interoperabilität** (soweit wesentlich und dem Unternehmer bekannt) | Fehlt (Android-Versionsanforderungen, Apple Health n.a.) | ❌ offen |

**Abs. 2 — Ausnahmen:** § 5a gilt nicht für Verträge des täglichen Lebens, dem Fern- und Auswärtsgeschäfte-Gesetz (FAGG) unterliegende Verträge. AustroFit ist keine "tägliche Lebenstransaktion" und fällt primär unter §§ 3 ff. KSchG, nicht unter FAGG.

> **Wichtig Z 7+8:** Für eine App sind Funktionsbeschreibung + technische Schutzmaßnahmen + unterstützte Android-Versionen Pflichtangaben vor der Registrierung. Diese müssen auf der Registrierungsseite oder verlinkten FAQ stehen.

**Strafe bei Verstoß:** Verwaltungsübertretung bis 1.450 EUR (§ 32 Abs. 1 Z 1 lit. a).

---

### § 5b — Telefonische Vertragsabschlüsse mit Gewinnzusagen
**Status:** ❌ nicht anwendbar
AustroFit schließt keine Verträge per Telefon im Zusammenhang mit Gewinnzusagen.

### § 5c — Verbindlichkeit von Gewinnzusagen ⚠️ BEACHTEN
**Status:** ⚠️ bedingt

> "Unternehmer, die Gewinnzusagen oder andere vergleichbare Mitteilungen an bestimmte Verbraucher senden und durch die Gestaltung dieser Zusendungen den Eindruck erwecken, dass der Verbraucher einen bestimmten Preis gewonnen habe, haben dem Verbraucher diesen Preis zu leisten; er kann auch gerichtlich eingefordert werden."

**AustroFit-Relevanz:** Push-Notifications und In-App-Meldungen ("Du hast 500 Punkte erhalten!") dürfen nicht den Eindruck erwecken, dass ein Geldpreis gewonnen wurde. Der Unterschied zwischen Gamification-Feedback (Punkte = interne Währung) und einer verbindlichen Gewinnzusage (einforderbarer Geldwert) muss in Kommunikation und AGB klar sein.

**Trigger:** Neue Notification-Texte, Promotions, Challenges mit Preisversprechen.

---

### § 6 — Unzulässige Vertragsklauseln ❌ BLOCKER
**Status:** ✅ anwendbar — **❌ open (P1 Go-Live Blocker)**
**compliance_ref:** kschg-agb-§6-konformitaet

**§ 6 enthält zwei Listen unzulässiger AGB-Klauseln** (Abs. 1 = immer unzulässig, Abs. 2 = unzulässig sofern nicht individuell ausgehandelt). Für AustroFit kritische Klauseltypen:

**Abs. 1 — Immer unzulässig:**

| Z | Verbot | AustroFit-Relevanz |
|---|---|---|
| Z 3 | Einseitige Entgeltserhöhung ohne sachliche Rechtfertigung und Verbraucher-Zumutbarkeit | Bei zukünftigem Abo-Modell: Preiserhöhung nur mit Sachgrund + Rücktrittsrecht |
| **Z 9** | **Haftungsausschluss für Personenschäden durch Vorsatz oder grobe Fahrlässigkeit** | **KRITISCH für Fitness-App:** Haftungsausschluss für körperliche Schäden durch fehlerhafte Trainingstipps etc. ist unzulässig. Der bestehende Disclaimer (MDR-Abgrenzung) muss diesen Vorbehalt respektieren. |
| Z 14 | Irrtumsrecht ausgeschlossen | Bei Punkte-Fehlbuchungen darf AustroFit Irrtum des Nutzers nicht ausschließen |

**Abs. 2 — Unzulässig sofern nicht individuell ausgehandelt:**

| Z | Verbot | AustroFit-Relevanz |
|---|---|---|
| Z 3 | Einseitige Leistungsänderung ohne sachliche Rechtfertigung und Verbraucher-Zumutbarkeit | Punktesystem-Änderungen, Reward-Änderungen müssen Nutzer zumutbar sein |
| Z 6 | Leistungsverweigerungsrecht (§ 1052 ABGB) ausschließen | AustroFit darf Nutzern nicht per AGB das Recht nehmen, Gegenleistung zu verweigern |

**Abs. 3 — Klarheitsgebot:**
> "Eine in Allgemeinen Geschäftsbedingungen oder Vertragsformblättern enthaltene Vertragsbestimmung ist unwirksam, wenn sie unklar oder unverständlich abgefasst ist."

**→ AGB müssen für die Walter-Persona (55+, niedrige Digitalkompetenz) verständlich sein.**

---

### § 6a — Erfüllung einer Geldschuld
**Status:** ❌ nicht anwendbar (aktuell)
Betrifft Banküberweisung als Erfüllung. AustroFit ist kostenlos. **Trigger:** Bei Premium-Abo.

### § 6b — Kosten telefonischer Kontaktaufnahme
**Status:** ⚠️ bedingt
Falls AustroFit eine Support-Hotline einrichtet: Kein Mehrpreis über normale Verbindungskosten hinaus.

### § 6c — Zusätzliche Zahlungen
**Status:** ⚠️ bedingt
Zusätzliche Zahlungen (z.B. In-App-Käufe) nur mit ausdrücklicher Einwilligung. Keine voreingestellten Kaufoptionen.
**Trigger:** Bei In-App-Käufen, Premium-Features.

### § 7 — Angeld und Reugeld
**Status:** ❌ nicht anwendbar

---

### §§ 7a–7b — Leistungs- und Gefahrenübergang bei Waren
**Status:** ❌ nicht anwendbar (keine physischen Waren)

---

### § 7c — Verzug
**Status:** ⚠️ bedingt
Gilt für Dienstleistungen allgemein. Wenn AustroFit zugesagte Features nicht liefert (z.B. Feature auf Roadmap angekündigt): Nachfrist + Rücktrittsrecht des Nutzers.

**Trigger:** Explizite Feature-Versprechen in Marketing. Grundsatz: Keine verbindlichen Lieferzusagen für neue Features machen.

---

### § 7d — Verzug bei der Bereitstellung digitaler Leistungen ✅ RELEVANT
**Status:** ✅ anwendbar
**compliance_ref:** kschg-7d-bereitstellungspflicht

**Abs. 1 (Volltext aus PDF):**
> "Hat der Unternehmer eine digitale Leistung (§ 2 Z 1 bis 3, § 16 VGG) trotz Fälligkeit nicht bereitgestellt, so kann ihn der Verbraucher ohne Fristsetzung zur Bereitstellung auffordern. Stellt der Unternehmer die digitale Leistung nicht unverzüglich nach Aufforderung oder innerhalb einer allenfalls ausdrücklich vereinbarten Nachfrist bereit, so kann der Verbraucher vom Vertrag zurückzutreten."

**AustroFit-Relevanz:**
- Die App ist eine "digitale Leistung" i.S.d. VGG → § 7d anwendbar
- Dauerhafte App-Ausfälle (Wartung, Serverprobleme) die nicht unverzüglich behoben werden → Nutzer kann theoretisch vom Nutzungsvertrag zurücktreten (Vertragsbeendigung = Account-Löschung)
- Praktische Auswirkung: Angemessene Uptime und Monitoring sind implizite Hauptleistungspflicht

**→ AGB sollten Wartungsfenster transparent kommunizieren und Ausfall-Handling regeln.**

---

### § 8 — Gewährleistung
**Status:** ⚠️ bedingt
Abs.: "beim Kauf von Waren sowie bei der Bereitstellung digitaler Leistungen ist das Verbrauchergewährleistungsgesetz zu beachten."

**→ VGG ist das speziellere Gesetz für digitale Leistungen. Getrennte VGG-Prüfung erforderlich.** Kernaussage: Mängelbeseitigung bei digitalen Leistungen ist primärer Anspruch des Verbrauchers.

### § 9 — Gewährleistungsausschluss
**Status:** ✅ anwendbar
> "Gewährleistungsrechte des Verbrauchers können vor Kenntnis des Mangels nicht ausgeschlossen oder eingeschränkt werden; beim Kauf von Waren sowie bei der Bereitstellung digitaler Leistungen ist das Verbrauchergewährleistungsgesetz zu beachten."

**AustroFit-Relevanz:** AGB dürfen Gewährleistungsrechte (Mängelbeseitigung bei digitalen Leistungen) nicht im Voraus ausschließen. Betrifft insbesondere: App-Bugs, fehlerhafte Punkte-Berechnungen, Sync-Fehler. **→ AGB: Kein pauschaler Gewährleistungsausschluss für digitale Leistungen.**

### § 9a — Vertragliche Garantien
**Status:** ⚠️ bedingt
Gilt wenn AustroFit gegenüber Nutzern Garantien gewährt (z.B. "100% Datensicherheit garantiert" in Marketing). Garantieerklärungen sind inhaltlich bindend.
**Trigger:** Marketingaussagen mit "garantiert" / "sicher" im Zusammenhang mit Datenschutz oder App-Leistung.

---

### §§ 10–12 — Vollmacht, mündliche Zusagen, Wechsel, Gehaltsabtretung
**Status:** ❌ nicht anwendbar (kein Handelsvertreter-Modell, kein Kredit)

---

### § 13a — Verbraucherverträge mit Auslandsbezug
**Status:** 📋 referenz
§ 6 KSchG und §§ 864a/879 Abs. 3 ABGB (Schutz vor unzulässigen AGB) gelten unabhängig vom gewählten Vertragsrecht, wenn AustroFit in Österreich tätig ist. Rechtswahl "Deutsches Recht" in AGB würde § 6-Schutz nicht aufheben.

---

### § 14 — Gerichtsstand ✅ RELEVANT für AGB
**Status:** ✅ anwendbar
**compliance_ref:** kschg-agb-§6-konformitaet (Teil der AGB-Anforderungen)

> "Hat der Verbraucher im Inland seinen Wohnsitz oder seinen gewöhnlichen Aufenthalt oder ist er im Inland beschäftigt, so kann für eine Klage gegen ihn nach den §§ 88, 89, 93 Abs. 2 und 104 Abs. 1 JN nur die Zuständigkeit des Gerichtes begründet werden, in dessen Sprengel der Wohnsitz, der gewöhnliche Aufenthalt oder der Ort der Beschäftigung liegt."

> **§ 14 Abs. 3:** "Eine Vereinbarung, mit der für eine Klage des Verbrauchers gegen den Unternehmer ein nach dem Gesetz gegebener Gerichtsstand ausgeschlossen wird, ist dem Verbraucher gegenüber rechtsunwirksam."

**AustroFit-Relevanz:** AGB dürfen keinen exklusiven Gerichtsstand bei AustroFits Sitz festlegen. Verbraucher können AustroFit an ihrem Wohnsitz klagen. **→ Rechtsberatung für AGB-Gerichtsstandklausel.**

---

### § 15 — Verträge über wiederkehrende Leistungen
**Status:** ❌ nicht anwendbar (aktuell)
§ 15 gilt für Verträge mit wiederholten Lieferungen und Geldzahlungspflichten auf unbestimmte Zeit. AustroFit ist kostenlos und ohne Zahlungsverpflichtung.

**Trigger:** Bei Abo-Modell (Premium) → § 15: Kündigungsfrist maximal 2 Monate, halbjährlich kündbar nach Ablauf des ersten Jahres.

---

### §§ 25a–25d — Kreditgeschäfte, Bürgschaft, Mäßigungsrecht
**Status:** ❌ nicht anwendbar (kein Kreditgeschäft)

---

### §§ 26d–27i — Wohnungsverbesserung, Vorauszahlungskäufe, Werkvertrag, Heimverträge
**Status:** ❌ nicht anwendbar

---

## II. HAUPTSTÜCK — Verbandsklage

### § 28 — Unterlassungsanspruch bei unzulässigen AGB
**Status:** 📋 referenz (Sanktionsrisiko)
Verbände (VKI, Wirtschaftskammer, Bundesarbeiterkammer) können bei unzulässigen AGB auf Unterlassung klagen. Besonders aktiv: Verein für Konsumenteninformation (VKI). Dieses Klagerisiko motiviert zur sorgfältigen KSchG-konformen AGB-Gestaltung.

### § 28a — Verbandsklage (erweitert)
**Status:** 📋 referenz
Erweiterter Unterlassungsanspruch bei Verstößen gegen § 5a Informationspflichten, §§ 7a–7d (digitale Leistungen), § 9a (Garantien), § 6c (Zusatzzahlungen). → AustroFit ist als App-Anbieter exponiert, wenn Registrierungsflow die § 5a-Pflichten nicht erfüllt.

### § 29 — Klageberechtigung
**Status:** 📋 referenz
Klageberechtigt sind: WKO, BAK, VKI, Österreichischer Seniorenrat u.a.

---

## III. HAUPTSTÜCK — Strafbestimmungen

### § 32 — Verwaltungsstrafen
**Status:** 📋 referenz (Sanktionsrahmen)

| Verstoß | Max. Geldstrafe |
|---|---|
| § 5a Abs. 1 — Informationspflichten nicht erfüllt | 1.450 EUR |
| § 5a + Verbandsklage (§ 28a) | unbegrenzt (Unterlassung + Schadenersatz) |
| Bei koordinierter Durchsetzung (VO (EU) 2017/2394) | bis 4% des Jahresumsatzes / min. 2 Mio. EUR |

---

## Gesamtergebnis

| § | Titel | Status | Detail |
|---|---|---|---|
| § 1–2 | Geltungsbereich / Unabdingbarkeit | 📋 referenz | KSchG gilt zwingend |
| § 3 | Haustür-Rücktritt | ❌ n.a. (aktuell) | Trigger: Messen, Außendienst |
| § 3a | Rücktritt bei Irreführung | ⚠️ bedingt | Korrekte Marketing-Aussagen |
| **§ 5a** | **Informationspflichten digitale Leistungen** | **❌ open** | **P1 Blocker: Z 7+8 Funktionalität/Kompatibilität fehlen** |
| § 5c | Gewinnzusagen | ⚠️ bedingt | Push-Texte dürfen keine Gewinnzusagen suggerieren |
| **§ 6 Abs. 1 Z 9** | **Haftungsausschluss Körperschäden** | **❌ open** | **P1: In Gesundheits-App unzulässig — AGB-Prüfung** |
| § 6 Abs. 2 Z 3 | Einseitige Leistungsänderung | ⚠️ partial | Bei Punkte-Regeländerungen beachten |
| § 6 Abs. 3 | Klarheitsgebot AGB | ⚠️ partial | AGB müssen für 55+-Nutzer verständlich sein |
| § 6b | Telefonhotline | ⚠️ bedingt | Trigger: Support-Telefon |
| § 6c | Zusatzzahlungen | ⚠️ bedingt | Trigger: In-App-Käufe |
| § 7d | Bereitstellungspflicht digitale Leistungen | ✅ anwendbar | App-Verfügbarkeit als Hauptpflicht; Wartungsfenster in AGB |
| § 9 | Kein Gewährleistungsausschluss | ✅ anwendbar | Kein Pauschalausschluss in AGB; VGG separat prüfen |
| § 9a | Garantien | ⚠️ bedingt | Keine übertriebenen Sicherheitsversprechen in Marketing |
| **§ 14** | **Verbraucher-Gerichtsstand** | **✅ anwendbar** | Kein exklusiver AustroFit-Gerichtsstand in AGB |
| § 15 | Wiederkehrende Leistungen | ❌ n.a. (aktuell) | Trigger: Abo-Modell |
| §§ 28–29 | Verbandsklage | 📋 referenz | Klagerisiko VKI bei § 5a / § 6-Verstößen |
| § 32 | Verwaltungsstrafen | 📋 referenz | bis 1.450 EUR + Verbandsklage |

**Compliance-Status (Stand 05/2026): ⚠️ partial**

**Kritische offene Punkte:**
1. **§ 5a** — Vorvertragliche Informationspflichten (digitale Leistungen): Funktionalität, Kompatibilität, Kündigungsbedingungen, "kostenlos" explizit kommunizieren — **P1 Blocker**
2. **§ 6 Abs. 1 Z 9** — AGB-Haftungsausschluss für Körperschäden: In Fitness-App nicht zulässig — **P1 (bei AGB-Erstellung Rechtsberatung zwingend)**
3. **§ 7d + § 9 + VGG** — Gewährleistung bei digitalen Leistungen: VGG-Screening fehlt — **P2**

---

## Offene Punkte (priorisiert)

| Priorität | § | Was fehlt | Aufwand | Verantwortlich |
|---|---|---|---|---|
| **P1** | § 5a Z 1–8 | Vor Registrierung: Dienstbeschreibung, Kostenlosigkeit, Funktionalität (Capacitor, Permissions), Kompatibilität (Android ≥ X), Kündigungsbedingungen kommunizieren | gering (Registrierungsseite + FAQ) | Entwicklung + Betreiber |
| **P1** | § 6 | AGB KSchG-konform erstellen (insb. Z 9: kein Haftungsausschluss Körperschäden, Z 3: Punkteregeln-Änderungsvorbehalt, § 14: kein exklusiver Gerichtsstand) | hoch | Rechtsberatung |
| **P1** | §§ 6–14 + AGB | Alle bestehenden KSchG-Pflichten in AGB abbilden (Transparenz Punkte, Kündigung, Gewährleistung) | Teil der AGB-Erstellung | Rechtsberatung |
| **P2** | § 7d + § 9 | VGG screening anlegen (`docs/laws/vgg/_screening.md`) — Gewährleistung digitale Leistungen | mittel | AI-assisted + Review |
| **P2** | § 7d | AGB-Klausel zu Wartungsfenstern und Verfügbarkeit | gering (Teil der AGB) | Rechtsberatung |

---

## Trigger — Neu prüfen wenn:

1. **AGB erstellt** → §§ 5a, 6, 9, 14 abprüfen; Registrierungsflow um Informationspflichten erweitern
2. **Abo-Modell / Premium** → § 6a (Preisangaben), § 6c (Zusatzzahlungen), § 15 (Kündigungsfristen)
3. **Support-Hotline** → § 6b: Kein Mehrpreis
4. **Messen / Guerrilla-Marketing** → § 3: 14-tägige Rücktrittsfrist + Belehrungspflicht
5. **Gewinnspiele / Challenges mit Preisversprechen** → § 5c (Verbindlichkeit), § 5j KSchG + GSpG neu prüfen
6. **Neue Marketing-Aussagen mit "sicher", "garantiert"** → § 9a: Garantiebindung
7. **Community-Features (Phase 2+)** → §§ 28–28a Verbandsklagerisiko bei UGC-Moderation

---

## Volltext-Dateien

| Datei | Inhalt | Status |
|---|---|---|
| `_screening.md` (diese Datei) | Vollständiges Paragraph-Screening | ✅ erstellt (v1.0-pending-review) |
| `../vgg/_screening.md` | VGG Verbrauchergewährleistungsgesetz digitale Leistungen | ❌ zu erstellen (P2) |

---

*Rechtsstand: KSchG Fassung 24.05.2026 (BGBl. I Nr. 110/2025 — § 6 Abs. 2 Z 4 Indexierungsanpassung eingearbeitet).*
*Dieses Screening ist AI-assisted und muss von Johannes oder einem Rechtsanwalt inhaltlich bestätigt werden.*
