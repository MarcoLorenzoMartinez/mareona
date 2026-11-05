/**
 * @file Ingests and caches official BDFutbol match reports offline.
 * Extracts starting lineups, bench, goals, referee, and coach for historical matches.
 * Uses the exact same parser as match-detail-server.ts to ensure 100% data fidelity.
 *
 * Usage:
 *   node scripts/ingest-historical-match-details.js --season 1961-62
 *   node scripts/ingest-historical-match-details.js --all
 */

const fs = require("fs");
const path = require("path");

async function main() {
  const { getHistoricalMatchDetail, clearHistoricalMatchDetailCache } = await import("../src/lib/historical/match-detail-server.ts");
  const matchesData = require("../src/data/historical/matches.json");

  const args = process.argv.slice(2);
  const seasonArgIdx = args.indexOf("--season");
  const targetSeason = seasonArgIdx !== -1 ? args[seasonArgIdx + 1] : null;
  const isAll = args.includes("--all");

  const seasonsToProcess = targetSeason
    ? [targetSeason]
    : isAll
    ? Object.keys(matchesData)
    : ["1961-62"]; // Default to user's test season

  const outputDir = path.join(__dirname, "../src/data/historical/match-details");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const season of seasonsToProcess) {
    const seasonMatches = matchesData[season] || [];
    const validMatches = seasonMatches.filter((m) => m.bdfMatchId && /^\d+$/.test(m.bdfMatchId));

    if (validMatches.length === 0) {
      console.log(`[${season}] No matches with bdfMatchId found.`);
      continue;
    }

    const filePath = path.join(outputDir, `${season}.json`);
    let seasonStore = {};
    if (fs.existsSync(filePath)) {
      try {
        seasonStore = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch {
        seasonStore = {};
      }
    }

    console.log(`\n========================================`);
    console.log(`Processing season ${season} (${validMatches.length} matches)...`);
    console.log(`========================================`);

    let ingestedCount = 0;
    for (const match of validMatches) {
      const matchId = match.bdfMatchId;
      if (seasonStore[matchId]) {
        continue; // Already processed and verified
      }

      process.stdout.write(`Fetching match ${match.date} (${match.homeTeam} vs ${match.awayTeam}) [ID: ${matchId}]... `);

      try {
        const detail = await getHistoricalMatchDetail(matchId, season, match.isHome);
        if (detail) {
          seasonStore[matchId] = detail;
          ingestedCount++;
          console.log(`OK (Starters: ${detail.homeStarters.length} + ${detail.awayStarters.length}, Goals: ${detail.goals.length})`);
        } else {
          console.log(`FAILED (null response)`);
        }
      } catch (err) {
        console.log(`ERROR: ${err.message}`);
      }

    // Respectful delay between BDFutbol requests to protect IP reputation
    await new Promise((r) => setTimeout(r, 350));
    }

    fs.writeFileSync(filePath, JSON.stringify(seasonStore, null, 2), "utf8");
    console.log(`Saved ${Object.keys(seasonStore).length} matches to ${filePath} (${ingestedCount} newly ingested).`);
    if (clearHistoricalMatchDetailCache) {
      clearHistoricalMatchDetailCache();
    }
  }
}

main().catch(console.error);
