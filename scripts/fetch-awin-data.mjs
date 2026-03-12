/**
 * AWIN Partner Data Fetcher für AustroFit
 *
 * Was dieses Script tut:
 *  1. Holt ALLE verfügbaren AWIN-Programme in einem API-Call
 *  2. Sucht unsere 52 relevanten Advertiser darin
 *  3. Liest zusätzliche Kennzahlen aus dem CSV-Export (EPC, approvalRate etc.)
 *  4. Gibt einen strukturierten JSON-Report + Beitritts-Checkliste aus
 *
 * Wichtig: Promotions/Gutschein-Codes sind erst nach dem JOIN verfügbar.
 * Nach dem Beitritt → Script erneut ausführen → Gutscheincodes werden abgerufen.
 *
 * Usage: node scripts/fetch-awin-data.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));

// --- .env einlesen ---
const envPath = resolve(__dir, "../.env");
const envVars = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const PUBLISHER_ID = envVars.AWIN_PUBLISHER_ID;
const TOKEN = envVars.AWIN_API_TOKEN;

if (!PUBLISHER_ID || !TOKEN) {
  console.error("❌  AWIN_PUBLISHER_ID oder AWIN_API_TOKEN fehlen in .env");
  process.exit(1);
}

const BASE = "https://api.awin.com";
const HEADERS = { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" };

// --- AustroFit-relevante Advertiser ---
const RELEVANT_ADVERTISERS = [
  // Sportgeräte / Fitnessgeräte
  [23711, "Sportstech AT", "Sportgeräte"],
  [29905, "PAKAMA Athletics DE/AT", "Sportgeräte"],
  [19230, "Kintex DE & AT", "Sportgeräte"],
  [118181, "Plankpad DE/AT", "Sportgeräte"],
  [69428, "Ultrahuman Healthcare", "Sportgeräte"],
  [47981, "LEDAP AT (Padel)", "Sportgeräte"],

  // Sportbekleidung
  [76998, "adidas AT", "Sportbekleidung"],
  [16340, "Nike AT", "Sportbekleidung"],
  [29221, "Decathlon AT", "Sportbekleidung"],
  [13792, "Hervis AT", "Sportbekleidung"],
  [14464, "Gigasport AT/DE", "Sportbekleidung"],
  [20372, "shop4runners DE/AT", "Sportbekleidung"],
  [24291, "Sportwerk DE/AT", "Sportbekleidung"],
  [27181, "icaniwill DE/AT", "Sportbekleidung"],
  [16003, "ODLO AT", "Sportbekleidung"],
  [18277, "JD Sports AT", "Sportbekleidung"],
  [63704, "AktivWinter.at AT", "Sportbekleidung"],
  [124268, "On.com AT", "Sportbekleidung"],
  [72301, "Hey Honey (Yoga)", "Sportbekleidung"],

  // Private Sportangebote
  [72499, "Freeletics EU", "Private Sportangebote"],
  [17148, "Outdooractive AT", "Private Sportangebote"],
  [11717, "Jochen Schweizer DE/AT", "Private Sportangebote"],

  // Wellness & Sauna
  [115411, "Wellness Point DE/AT", "Wellness & Therme"],
  [108150, "Via Nordica DE (Sauna)", "Wellness & Therme"],
  [22750, "GartenHaus AT (Sauna)", "Wellness & Therme"],

  // Apotheken
  [14339, "Shop Apotheke AT", "Apotheke"],
  [28601, "apotheke.at", "Apotheke"],

  // Nahrungsergänzungsmittel
  [120485, "JOY NATURALS AT", "Nahrungsergänzung"],
  [20427, "Nicapur DE/AT", "Nahrungsergänzung"],
  [10423, "Myprotein International", "Nahrungsergänzung"],
  [14411, "Bärbel Drexel DACH", "Nahrungsergänzung"],
  [120345, "Polleo Sport AT", "Nahrungsergänzung"],
  [118943, "Herbano DE", "Nahrungsergänzung"],
  [18539, "Bulk AT", "Nahrungsergänzung"],
  [76734, "iHerb EUR", "Nahrungsergänzung"],
  [22246, "NatuRise DE/AT", "Nahrungsergänzung"],
  [123640, "hiPURE DE", "Nahrungsergänzung"],
  [33149, "KetoMix AT", "Nahrungsergänzung"],

  // BIO-Lebensmittel
  [105807, "ZAGLER MÜSLIBÄR AT", "BIO-Lebensmittel"],
  [15106, "mymuesli DE/AT", "BIO-Lebensmittel"],
  [103075, "myfruits DE", "BIO-Lebensmittel"],
  [14396, "Zotter Schokolade AT", "BIO-Lebensmittel"],
  [123124, "PURE BIO Energy AT", "BIO-Lebensmittel"],

  // Pflegeprodukte
  [108144, "Wild EU (Natural Deo)", "Pflegeprodukte"],
  [78282, "Yves Rocher AT", "Pflegeprodukte"],
  [13991, "100percentpure DE/AT", "Pflegeprodukte"],
  [101761, "Asambeauty AT", "Pflegeprodukte"],
  [84333, "Parfumdreams AT", "Pflegeprodukte"],
  [12460, "Douglas AT", "Pflegeprodukte"],
  [50791, "Marionnaud AT", "Pflegeprodukte"],
  [16975, "Babor AT", "Pflegeprodukte"],
  [119665, "mamaforest EU", "Pflegeprodukte"],
];

// --- CSV einlesen für Zusatz-Kennzahlen ---
function parseCsv(csvPath) {
  const lines = readFileSync(csvPath, "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith('"advertiserId"'));

  const index = {};
  for (const line of lines) {
    // Semikolon-getrennt, Felder in Anführungszeichen
    const fields = line.match(/"([^"]*)"/g)?.map((f) => f.slice(1, -1)) ?? [];
    if (fields.length < 5) continue;
    const [
      advertiserId, programmeName, conversionRate, approvalRate, epc,
      launchDate, paymentStatus, paymentRiskLevel, awinIndex, feedEnabled,
      productReporting, commissionMin, commissionMax, leadMin, leadMax,
      cookieLength, parentSectors, subSectors, primarySector, avgPaymentTime,
      primaryRegion, descriptionShort, logoUrl, displayUrl,
    ] = fields;

    const id = parseInt(advertiserId, 10);
    if (!isNaN(id)) {
      index[id] = {
        conversionRate: parseFloat(conversionRate) || 0,
        approvalRate: parseFloat(approvalRate) || 0,
        epc: parseFloat(epc) || 0,
        paymentStatus,
        paymentRiskLevel,
        awinIndex: parseFloat(awinIndex) || 0,
        feedEnabled: feedEnabled === "yes",
        commissionMin: parseFloat(commissionMin) || 0,
        commissionMax: parseFloat(commissionMax) || 0,
        cookieLength: parseInt(cookieLength, 10) || 30,
        primaryRegion,
        descriptionShort,
      };
    }
  }
  return index;
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Promotions für gejoinede Programme (falls vorhanden) ---
async function getPromotions(advertiserId) {
  await sleep(3500);
  const r = await fetch(
    `${BASE}/publishers/${PUBLISHER_ID}/promotions?advertiserId=${advertiserId}`,
    { headers: HEADERS }
  );
  if (r.status === 404 || r.status === 401) return [];
  if (!r.ok) return [];
  return r.json().catch(() => []);
}

// --- Main ---
async function main() {
  console.log(`\n🚀 AWIN Data Fetcher für Publisher ${PUBLISHER_ID}\n`);

  // Schritt 1: CSV für Zusatz-Daten
  const csvPath = resolve(__dir, "../Directus-JSON-AustroFit/advertiser-directory.csv");
  let csvIndex = {};
  try {
    csvIndex = parseCsv(csvPath);
    console.log(`📄 CSV geladen: ${Object.keys(csvIndex).length} Einträge`);
  } catch (e) {
    console.warn(`⚠️  CSV konnte nicht geladen werden: ${e.message}`);
  }

  // Schritt 2: Alle AWIN-Programme in einem Call (21.000+)
  console.log("📡 Lade alle AWIN-Programme (1 API-Call)...");
  const allProgrammes = await fetchJSON(
    `${BASE}/publishers/${PUBLISHER_ID}/programmes?relationship=joined`
  );
  const joinedIds = new Set((allProgrammes ?? []).map((p) => p.id));
  console.log(`   → ${joinedIds.size} gejoinede Programme\n`);

  // Schritt 3: Alle verfügbaren Programme (für ID-Lookup)
  await sleep(3500);
  console.log("📡 Lade alle verfügbaren Programme (notjoined)...");
  const notJoined = await fetchJSON(
    `${BASE}/publishers/${PUBLISHER_ID}/programmes?relationship=notjoined`
  );
  const availableById = Object.fromEntries(
    [...allProgrammes, ...(notJoined ?? [])].map((p) => [p.id, p])
  );
  console.log(`   → ${Object.keys(availableById).length} Programme total im System\n`);

  // Schritt 4: Unsere Advertiser filtern & anreichern
  const results = [];
  const notFound = [];

  for (const [id, label, kategorie] of RELEVANT_ADVERTISERS) {
    const prog = availableById[id];
    const csv = csvIndex[id] ?? {};

    if (!prog) {
      notFound.push({ id, label, kategorie });
      continue;
    }

    const isJoined = joinedIds.has(id);

    // Promotions nur für gejoinede Programme abrufen
    let promotions = [];
    if (isJoined) {
      console.log(`  🔍 Hole Promotions für ${label}...`);
      promotions = await getPromotions(id);
    }

    const activePromos = promotions.filter(
      (p) => !p.endDate || new Date(p.endDate) > new Date()
    );

    results.push({
      advertiserId: id,
      programmeName: prog.name ?? label,
      kategorie,
      // Aus API
      membershipStatus: isJoined ? "joined" : "notjoined",
      displayUrl: prog.displayUrl,
      logoUrl: prog.logoUrl,
      clickThroughUrl: prog.clickThroughUrl,
      primarySector: prog.primarySector,
      primaryRegion: prog.primaryRegion?.countryCode ?? csv.primaryRegion ?? "?",
      // Aus CSV (reichere Kennzahlen)
      conversionRate: csv.conversionRate ?? 0,
      approvalRate: csv.approvalRate ?? 0,
      epc: csv.epc ?? 0,
      awinIndex: csv.awinIndex ?? 0,
      paymentStatus: csv.paymentStatus ?? "unknown",
      paymentRiskLevel: csv.paymentRiskLevel ?? "unknown",
      feedEnabled: csv.feedEnabled ?? false,
      commissionMin: csv.commissionMin ?? 0,
      commissionMax: csv.commissionMax ?? 0,
      cookieLength: csv.cookieLength ?? 30,
      descriptionShort: csv.descriptionShort ?? prog.description?.slice(0, 200) ?? "",
      // Promotions (nur nach Join)
      activePromotions: activePromos.length,
      promotions: activePromos.map((p) => ({
        type: p.type,
        code: p.voucherCode ?? null,
        description: p.description,
        startDate: p.startDate,
        endDate: p.endDate,
        url: p.clickThroughUrl ?? p.url,
      })),
      // Beitritts-URL für AWIN UI
      applyUrl: `https://ui.awin.com/merchant-programme/${id}/overview`,
    });
  }

  // --- Ausgabe: Konsole ---
  console.log("\n" + "=".repeat(60));
  console.log("📊 ERGEBNIS");
  console.log("=".repeat(60));

  const byKat = results.reduce((acc, r) => {
    (acc[r.kategorie] ??= []).push(r);
    return acc;
  }, {});

  for (const [kat, items] of Object.entries(byKat)) {
    console.log(`\n🏷  ${kat} (${items.length})`);
    for (const r of items.sort((a, b) => b.awinIndex - a.awinIndex)) {
      const status = r.membershipStatus === "joined" ? "🟢 JOINED" : "⚪ beitreten";
      const comm = r.commissionMax > 0 ? `💰 ${r.commissionMin}–${r.commissionMax}%` : "";
      const vouchers =
        r.activePromotions > 0
          ? `🎟 ${r.activePromotions} Gutschein(e)`
          : r.membershipStatus === "joined"
          ? "(keine Gutscheine)"
          : "→ nach Join";
      const pay =
        r.paymentStatus === "green" ? "🟢" : r.paymentStatus === "amber" ? "🟡" : "❓";
      console.log(
        `   ${status} ${pay} ${r.programmeName}  ${comm}  EPC:${r.epc}  CR:${r.conversionRate}%  ${vouchers}`
      );
    }
  }

  if (notFound.length > 0) {
    console.log(`\n⚠️  ${notFound.length} Advertiser nicht im AWIN-System gefunden:`);
    notFound.forEach((n) => console.log(`   - ${n.label} (ID: ${n.id})`));
  }

  // --- Ausgabe: JSON-Datei ---
  const output = {
    generatedAt: new Date().toISOString(),
    publisherId: PUBLISHER_ID,
    summary: {
      total: results.length,
      joined: results.filter((r) => r.membershipStatus === "joined").length,
      notjoined: results.filter((r) => r.membershipStatus === "notjoined").length,
      withVouchers: results.filter((r) => r.activePromotions > 0).length,
      notFoundInAwin: notFound.length,
    },
    nextStep:
      "Für Gutschein-Codes: Zuerst 'applyUrl' in AWIN UI besuchen und dem Programm beitreten. Dann Script erneut ausführen.",
    byKategorie: byKat,
    advertisers: results,
    notFoundInAwin: notFound,
  };

  const outPath = resolve(__dir, "../Directus-JSON-AustroFit/awin-partner-data.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");

  console.log("\n" + "=".repeat(60));
  console.log(`✅ ${results.length} Partner verarbeitet`);
  console.log(`🟢 ${output.summary.joined} bereits joined`);
  console.log(`⚪ ${output.summary.notjoined} müssen noch beitreten`);
  console.log(`🎟  ${output.summary.withVouchers} haben aktive Gutschein-Codes`);
  console.log(`📄 Gespeichert: Directus-JSON-AustroFit/awin-partner-data.json`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
