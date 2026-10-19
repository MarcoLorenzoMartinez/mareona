/**
 * Normalizes all historical match records and rivals geo entries to their canonical names.
 * Run with: node scripts/normalize-historical-rivals.js
 */

const fs = require("fs");
const path = require("path");

const matchesPath = path.resolve(__dirname, "../src/data/historical/matches.json");
const geoPath = path.resolve(__dirname, "../src/data/historical/rivals-geo.json");

const CANONICAL_MAP = {
  // II Republic era (1931-1939) titles without "Real"
  Madrid: "Real Madrid",
  Donostia: "Real Sociedad",
  "Unión Irún": "Real Unión",

  // Filials & historical names
  Castilla: "Real Madrid Castilla",

  // Franco era vs modern Catalan / Galician spellings & mergers
  Gerona: "Girona FC",
  Girona: "Girona FC",
  Tarrasa: "Terrassa FC",
  Terrassa: "Terrassa FC",
  "Gimnástico de Tarragona": "Gimnàstic de Tarragona",
  Orense: "CD Ourense",
  Ourense: "CD Ourense",
  Baracaldo: "Barakaldo CF",
  "Baracaldo Oriamendi": "Barakaldo CF",
  Xerez: "Xerez CD",
  "Xerez Club": "Xerez CD",
  "España Industrial": "CD Condal",
  Condal: "CD Condal",
  "Deportivo Torrelavega": "Gimnástica de Torrelavega",
  Catalunya: "CE Europa",
};

function normalizeName(name) {
  if (!name) return name;
  const trimmed = name.trim();
  return CANONICAL_MAP[trimmed] || trimmed;
}

// 1. Process matches.json
const rawMatches = JSON.parse(fs.readFileSync(matchesPath, "utf8"));
let updatedOpponentsCount = 0;

for (const [seasonId, seasonMatches] of Object.entries(rawMatches)) {
  for (const m of seasonMatches) {
    const oldOpp = m.opponent;
    const newOpp = normalizeName(oldOpp);
    if (oldOpp !== newOpp) {
      m.opponent = newOpp;
      updatedOpponentsCount++;
    }
    if (m.homeTeam !== "Real Sporting") {
      m.homeTeam = normalizeName(m.homeTeam);
    }
    if (m.awayTeam !== "Real Sporting") {
      m.awayTeam = normalizeName(m.awayTeam);
    }
  }
}

fs.writeFileSync(matchesPath, JSON.stringify(rawMatches, null, 2), "utf8");
console.log(`Updated ${updatedOpponentsCount} match records in matches.json.`);

// 2. Process rivals-geo.json
const rawGeo = JSON.parse(fs.readFileSync(geoPath, "utf8"));
const consolidatedGeo = new Map();

for (const item of rawGeo) {
  const canonName = normalizeName(item.name);
  if (!consolidatedGeo.has(canonName.toLowerCase())) {
    consolidatedGeo.set(canonName.toLowerCase(), {
      ...item,
      name: canonName,
    });
  }
}

// Ensure optimal modern crests for unified clubs
const girona = consolidatedGeo.get("girona fc");
if (girona) girona.crestUrl = "https://www.bdfutbol.com/i/eg/78.png";

const terrassa = consolidatedGeo.get("terrassa fc");
if (terrassa) terrassa.crestUrl = "https://www.bdfutbol.com/i/eg/54h.png";

const ourense = consolidatedGeo.get("cd ourense");
if (ourense) ourense.crestUrl = "https://www.bdfutbol.com/i/eg/68b.png";

const barakaldo = consolidatedGeo.get("barakaldo cf");
if (barakaldo) barakaldo.crestUrl = "https://www.bdfutbol.com/i/eg/99.png";

const xerez = consolidatedGeo.get("xerez cd");
if (xerez) xerez.crestUrl = "https://www.bdfutbol.com/i/eg/53.png";

const condal = consolidatedGeo.get("cd condal");
if (condal) condal.crestUrl = "https://www.bdfutbol.com/i/eg/83.png";

const sortedGeo = Array.from(consolidatedGeo.values()).sort((a, b) =>
  a.name.localeCompare(b.name, "es")
);

fs.writeFileSync(geoPath, JSON.stringify(sortedGeo, null, 2), "utf8");
console.log(`Consolidated rivals-geo.json into ${sortedGeo.length} canonical rivals.`);
