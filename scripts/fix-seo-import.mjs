/**
 * Wandelt articles-seo CSV für Directus-Import um:
 * seo.title + seo.description → seo (JSON-Objekt als String)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = resolve(__dirname, '../Directus-JSON-AustroFit');

function parseCSV(content) {
  const rows = [];
  let field = '', inQuotes = false, row = [];
  for (let i = 0; i < content.length; i++) {
    const ch = content[i], next = content[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); field = ''; rows.push(row); row = []; }
      else if (ch !== '\r') field += ch;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function csvField(value) {
  if (value === undefined || value === null || value === '') return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('{')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const content = readFileSync(`${BASE}/articles-seo-20260318.csv`, 'utf8');
const rows = parseCSV(content);
const header = rows[0];

const idIdx = header.indexOf('id');
const seoTitleIdx = header.indexOf('seo.title');
const seoDescIdx = header.indexOf('seo.description');

// Neuer Header: nur id + seo (minimaler Import – Directus merged nur vorhandene Felder)
const newHeader = ['id', 'seo'];
const outputRows = [newHeader];

let filled = 0, skipped = 0;

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const id = r[idIdx]?.trim();
  const seoTitle = r[seoTitleIdx]?.trim() ?? '';
  const seoDesc = r[seoDescIdx]?.trim() ?? '';

  if (!id) { skipped++; continue; }

  if (!seoTitle && !seoDesc) { skipped++; continue; }

  const seoJson = JSON.stringify({ title: seoTitle, meta_description: seoDesc });
  outputRows.push([id, seoJson]);
  filled++;
}

const outputPath = `${BASE}/articles-seo-import.csv`;
const outputContent = outputRows.map(row => row.map(csvField).join(',')).join('\n');
writeFileSync(outputPath, outputContent, 'utf8');

console.log(`✓ ${filled} Artikel mit SEO-Daten`);
console.log(`  Übersprungen: ${skipped}`);
console.log(`\nGespeichert: articles-seo-import.csv`);
console.log('\nBeispiel:');
console.log(outputRows[1]?.map(csvField).join(','));
