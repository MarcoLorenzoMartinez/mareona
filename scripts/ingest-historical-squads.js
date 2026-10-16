/**
 * @file Ingests official squad and coach data for all 95 historical seasons of Real Sporting from BDFutbol.
 * Run with: node --use-system-ca scripts/ingest-historical-squads.js
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const seasons = require("../src/data/historical/seasons.json");

function fetchPage(seasonId) {
  return new Promise((resolve) => {
    const url = `https://www.bdfutbol.com/es/t/t${seasonId}34.html`;
    https.get(url, (res) => {
      if (res.statusCode !== 200) return resolve(null);
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    }).on("error", () => resolve(null));
  });
}

function parseSquadHtml(html, season) {
  if (!html) return null;

  // 1. Coaches
  const coachesMatch = html.match(/<table id="taulaentrenadors"[\s\S]*?<\/table>/i);
  const coaches = [];
  if (coachesMatch) {
    const trs = coachesMatch[0].match(/<tr[\s\S]*?<\/tr>/gi) || [];
    for (let i = 1; i < trs.length; i++) {
      const tr = trs[i];
      if (tr.includes("<th")) continue;
      const nameMatch = tr.match(/<span class="font-weight-bold mr-2 float-left">([^<]+)<\/span>(?:<span class="d-none d-md-block float-left">([^<]+)<\/span>)?/i);
      const cells = (tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map((td) => td.replace(/<[^>]+>/g, "").trim());
      if (nameMatch) {
        const alias = nameMatch[1].trim();
        const fullName = nameMatch[2]?.trim() || alias;
        const matchesDirected = parseInt(cells[cells.length - 3], 10) || undefined;
        coaches.push({ alias, fullName, matches: matchesDirected });
      }
    }
  }

  // Fallback to coach in seasons.json if table not found
  if (coaches.length === 0 && season.coach) {
    const names = season.coach.split("/").map((s) => s.trim());
    names.forEach((n) => coaches.push({ alias: n, fullName: n }));
  }

  // 2. Squad / Plantilla
  const squadMatch = html.match(/<table id="taulaplantilla"[\s\S]*?<\/table>/i);
  const players = [];
  if (squadMatch) {
    const trs = squadMatch[0].match(/<tr[\s\S]*?<\/tr>/gi) || [];
    for (let i = 1; i < trs.length; i++) {
      const tr = trs[i];
      if (tr.includes("<th")) continue;

      const dorsalMatch = tr.match(/<td[^>]*class="fit text-right[^"]*">(\d+)<\/td>/i);
      const dorsal = dorsalMatch ? parseInt(dorsalMatch[1], 10) : null;

      const nameMatch =
        tr.match(/<span class='font-weight-bold mr-2 float-left'>([^<]+)<\/span>(?:<span class='d-none d-md-block float-left'>([^<]+)<\/span>)?/i) ||
        tr.match(/<span class="font-weight-bold mr-2 float-left">([^<]+)<\/span>(?:<span class="d-none d-md-block float-left">([^<]+)<\/span>)?/i);
      if (!nameMatch) continue;
      const alias = nameMatch[1].trim();
      const fullName = nameMatch[2]?.trim() || alias;

      let position = "Centrocampista";
      if (/class="[^"]*\bpor\b[^"]*"/.test(tr)) position = "Portero";
      else if (/class="[^"]*\b(def|cen|ltd|lti)\b[^"]*"/.test(tr)) position = "Defensa";
      else if (/class="[^"]*\b(mig|piv|mp)\b[^"]*"/.test(tr)) position = "Centrocampista";
      else if (/class="[^"]*\b(dav|ext|del)\b[^"]*"/.test(tr)) position = "Delantero";

      const cells = (tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map((td) => td.replace(/<[^>]+>/g, "").trim());
      const goalsCell = cells[cells.length - 1];
      let goals = parseInt(goalsCell, 10);
      if (isNaN(goals) || (position === "Portero" && goals < 0)) goals = 0;

      // PJ is usually 9th from end or found in cell
      let played = 0;
      let minutes = 0;
      for (let c = 5; c < cells.length; c++) {
        const val = parseInt(cells[c], 10);
        if (!isNaN(val) && val > 0 && val <= 46) {
          played = val;
          break;
        }
      }
      // Minutes is cell with > 100 or matching
      for (let c = cells.length - 5; c < cells.length - 1; c++) {
        const val = parseInt(cells[c], 10);
        if (!isNaN(val) && val >= 50) {
          minutes = val;
          break;
        }
      }

      players.push({
        dorsal,
        alias,
        fullName,
        position,
        played,
        minutes,
        goals,
      });
    }
  }

  // Calculate top scorers
  const scorers = players
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.played - a.played);

  return {
    coaches,
    topScorers: scorers.slice(0, 5).map((p) => ({
      name: p.alias,
      fullName: p.fullName,
      goals: p.goals,
      played: p.played,
    })),
    players,
  };
}

async function run() {
  console.log(`Ingesting squads for ${seasons.length} seasons...`);
  const result = {};
  let successCount = 0;

  for (let i = 0; i < seasons.length; i++) {
    const s = seasons[i];
    process.stdout.write(`[${i + 1}/${seasons.length}] ${s.id}... `);
    const html = await fetchPage(s.id);
    const parsed = parseSquadHtml(html, s);

    if (parsed && parsed.players.length > 0) {
      result[s.id] = parsed;
      successCount++;
      console.log(`OK (${parsed.players.length} players, ${parsed.coaches.length} coaches)`);
    } else {
      console.log("NO DATA");
    }

    // Small delay to be polite to the server
    await new Promise((r) => setTimeout(r, 200));
  }

  const outPath = path.join(__dirname, "../src/data/historical/squads.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`\nDone! Saved ${successCount} seasons to ${outPath}`);
}

run().catch(console.error);
