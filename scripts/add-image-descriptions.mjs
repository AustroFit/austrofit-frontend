/**
 * Fügt SEO-Beschreibungen zu Directus-Bildern hinzu.
 * Matching: filename_download (ohne Extension) → Artikel-slug
 * Quelle: seo.description aus articles-seo CSV
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = resolve(__dirname, '../Directus-JSON-AustroFit');

// ── Einfacher CSV-Parser (quoted fields mit Newlines) ────────────────────────
function parseCSV(content) {
  const rows = [];
  let field = '';
  let inQuotes = false;
  let row = [];

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') {
        row.push(field); field = '';
        rows.push(row); row = [];
      } else if (ch === '\r') { /* skip */ }
      else { field += ch; }
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function csvField(value) {
  if (value === undefined || value === null || value === '') return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ── Manuell gepflegte UI-Bilder (kein Artikel-Match) ─────────────────────────
const UI_IMAGE_DESCRIPTIONS = {
  'landingpage-hero': 'AustroFit – Die Gesundheits-App für Österreich. Wissen aufbauen, Punkte sammeln und fit bleiben.',
  'rewards-hero': 'AustroFit Belohnungen – Punkte einlösen bei österreichischen Gesundheitspartnern.',
  'dashboard-hero': 'AustroFit Dashboard – Dein täglicher Überblick über Schritte, Punkte und Gesundheitsziele.',
  'partner-hero': 'AustroFit Partner – Regionale Gesundheitspartner aus Fitness, Ernährung und Wellness.',
  'quiz-hero': 'AustroFit Quiz – Gesundheitswissen testen und Punkte verdienen.',
  'onboarding-hero': 'AustroFit Onboarding – Starte deinen persönlichen Gesundheitsweg.',
  'gesundheitswegweiser-hero': 'AustroFit Gesundheitswegweiser – Verlässliche Gesundheitsinformationen für Österreich.',
  'bewegung': 'Bewegung und Sport – So bleibst du aktiv und gesund im Alltag.',
  'website-icon': 'AustroFit App-Icon – Deine Gesundheits-App für Österreich.',
  'af-icon': 'AustroFit App-Icon – Deine Gesundheits-App für Österreich.',
  'logo': 'AustroFit Logo – Österreichische Gesundheits-App.',
  'logo-big': 'AustroFit Logo – Österreichische Gesundheits-App.',
};

// ── CSVs einlesen ─────────────────────────────────────────────────────────────
console.log('Lese images CSV...');
const imgContent = readFileSync(`${BASE}/images 20260319-144227.csv`, 'utf8');
const imgRows = parseCSV(imgContent);
const imgHeader = imgRows[0];
console.log(`  Header (${imgHeader.length} Spalten):`, imgHeader.slice(0, 5).join(', '), '...');

const descIdx = imgHeader.indexOf('description');
const filenameIdx = imgHeader.indexOf('filename_download');
console.log(`  description col: ${descIdx}, filename_download col: ${filenameIdx}`);

console.log('\nLese articles-seo CSV...');
const artContent = readFileSync(`${BASE}/articles-seo-20260318.csv`, 'utf8');
const artRows = parseCSV(artContent);
const artHeader = artRows[0];
console.log(`  Artikel-Zeilen: ${artRows.length - 1}`);

const slugIdx = artHeader.indexOf('slug');
const seoDescIdx = artHeader.indexOf('seo.description');
console.log(`  slug col: ${slugIdx}, seo.description col: ${seoDescIdx}`);

// ── Artikel-Lookup aufbauen: slug → seo.description ──────────────────────────
const slugToDesc = new Map();
for (let i = 1; i < artRows.length; i++) {
  const row = artRows[i];
  const slug = row[slugIdx]?.trim();
  const desc = row[seoDescIdx]?.trim();
  if (slug && desc) slugToDesc.set(slug, desc);
}
console.log(`\nArtikel mit seo.description: ${slugToDesc.size}`);

// ── Bilder mit Descriptions anreichern ───────────────────────────────────────
let matched = 0, manual = 0, unmatched = 0;
const unmatchedImages = [];

const outputRows = [imgHeader];

for (let i = 1; i < imgRows.length; i++) {
  const row = [...imgRows[i]];
  const filename = row[filenameIdx]?.trim() ?? '';

  // Slug aus Dateiname extrahieren (Extension entfernen)
  const slug = filename.replace(/\.[^/.]+$/, '');

  let description = '';

  if (slugToDesc.has(slug)) {
    description = slugToDesc.get(slug);
    matched++;
  } else {
    // UI-Bild-Lookup (lowercase, normalisiert)
    const slugLower = slug.toLowerCase();
    const uiKey = Object.keys(UI_IMAGE_DESCRIPTIONS).find(k => slugLower.includes(k));
    if (uiKey) {
      description = UI_IMAGE_DESCRIPTIONS[uiKey];
      manual++;
    } else {
      unmatched++;
      unmatchedImages.push({ title: row[1], filename });
    }
  }

  row[descIdx] = description;
  outputRows.push(row);
}

console.log(`\nErgebnis:`);
console.log(`  ✓ Artikel-Match:  ${matched}`);
console.log(`  ✓ UI-Bild manuell: ${manual}`);
console.log(`  ✗ Kein Match:     ${unmatched}`);

if (unmatchedImages.length > 0) {
  console.log(`\nBilder ohne Description:`);
  unmatchedImages.forEach(({ title, filename }) => console.log(`  - ${title || filename}`));
}

// ── Output schreiben ──────────────────────────────────────────────────────────
const outputPath = `${BASE}/images-with-descriptions.csv`;
const outputContent = outputRows
  .map(row => row.map(csvField).join(','))
  .join('\n');

writeFileSync(outputPath, outputContent, 'utf8');
console.log(`\nGespeichert: ${outputPath}`);
