# AustroFit Farbpalette

**Aktive Palette:** Frisch & Hell (A)
**Stand:** März 2026
**Single Source of Truth:** [`src/styles/tokens.css`](src/styles/tokens.css)

---

## Primärfarben

| Rolle | Name | Hex | Tailwind-Klasse | Verwendung |
|---|---|---|---|---|
| Primär | AustroFit Grün | `#4CAF50` | `bg-primary` / `text-primary` / `border-primary` | Buttons, CTAs, Links, aktive Zustände |
| Primär Dunkel | Waldgrün | `#2E7D32` | `bg-primary-dark` / `text-primary-dark` | Hover-States, gedrückte Buttons |
| Primär Hell | Mintgrün | `#C8E6C9` | `bg-primary-light` | Chips, Badges, helle Highlights |

## Sekundärfarbe / Gamification

| Rolle | Name | Hex | Tailwind-Klasse | Verwendung |
|---|---|---|---|---|
| Gold | Goldgelb | `#F59E0B` | `bg-secondary` / `bg-gold` / `text-secondary` | Punkte-Anzeigen, Level-Badges, Streak-Highlights |

## Semantische Farben

| Rolle | Name | Hex | Tailwind-Klasse | Verwendung |
|---|---|---|---|---|
| Fehler | AustroFit Rot | `#E8272A` | `bg-error` / `text-error` | Error-States, Validierungsfehler, Warnmeldungen – **kein CTA-Einsatz** |

## Typografie

| Rolle | Hex | Tailwind-Klasse | Verwendung |
|---|---|---|---|
| Überschriften | `#0F1F0F` | `text-heading` | h1–h6 |
| Fließtext | `#3D5A3E` | `text-body` | p, li, span |
| Taglines | `#0F1F0F` | `text-tagline` | Kategorie-Labels, Taglines |
| Text auf dunklen Blöcken | `#0F1F0F` | `text-dark-kvb-blue` | Fließtext auf hellen Hintergründen |

## Hintergründe

| Rolle | Hex | Tailwind-Klasse | Verwendung |
|---|---|---|---|
| Weiß | `#FFFFFF` | `bg-light-white` | Reine weiße Flächen |
| Karten-BG | `#F0FBF1` | `bg-card-bg` | Cards, Sektionen, leichte Flächen |
| Schwarz | `#000000` | `bg-dark-black` | Selten, Overlays |

---

## Directus Block-System

Werden in Directus als `background_color_dark` / `background_color_light` Slugs vergeben.
Der Slug wird direkt als CSS-Klasse verwendet: `bg-{slug}`.

### Dunkle Hintergründe (`background = dark`)

| Directus-Slug | Hex | Klasse | Aussehen |
|---|---|---|---|
| `darkblue` | `#0D2E18` | `bg-darkblue` | Tiefes Waldgrün – Hero, Footer |
| `dark-green` | `#0D2E18` | `bg-dark-green` | = darkblue (Alias) |

Textfarbe auf dunklen Blöcken: automatisch **Weiß** (`text-white`)

### Helle Hintergründe (`background = light`)

| Directus-Slug | Hex | Klasse | Aussehen |
|---|---|---|---|
| `light-grey` | `#F0FBF1` | `bg-light-grey` | Mintgrün-getöntes Hell – Standard |
| `light-green` | `#C8E6C9` | `bg-light-green` | Grüner Hellton |
| `light-blue-1` | `#C8E6C9` | `bg-light-blue-1` | = light-green (Alias) |
| `beige` | `#F5F0E4` | `bg-beige` | Warmer Beigeton |

Textfarbe auf hellen Blöcken: automatisch `text-dark-kvb-blue` (`#0F1F0F`)

---

## Utility-Buttons (Design System)

Aus [`src/lib/design-system/classes.js`](src/lib/design-system/classes.js):

| Stil | Klassen | Aussehen |
|---|---|---|
| `primary` | `bg-primary border-primary text-white hover:bg-primary-dark` | Grüner Vollbutton |
| `green` | `bg-dark-green-1 border-dark-green-1 text-white` | Dunkelgrüner Vollbutton |
| `green_outline` | `border-dark-green-1 text-dark-green-1 hover:bg-dark-green-1` | Grüner Outline-Button |
| `pink` / `red` | `bg-dark-pink-1 text-white` | Nur für Error-Actions |

---

## Legacy-Tokens (Rückwärtskompatibilität)

Ältere Komponenten verwenden noch `dark-blue-1`/`dark-blue-2` – die Werte zeigen jetzt Grüntöne:

| Token | Aktueller Wert | Entspricht |
|---|---|---|
| `--color-dark-blue-1` | `#0D2E18` | = `darkblue` / tiefes Waldgrün |
| `--color-dark-blue-2` | `#2E7D32` | = `primary-dark` |

---

## Änderungen vornehmen

**Einzige Datei:** [`src/styles/tokens.css`](src/styles/tokens.css)

```css
/* Beispiel: Primärfarbe ändern */
--color-primary: #4CAF50;  /* ← nur hier anpassen */
```

Alle `bg-primary`, `text-primary`, `border-primary`-Klassen in der gesamten App
(Website + PWA) übernehmen die Änderung automatisch beim nächsten Build.
