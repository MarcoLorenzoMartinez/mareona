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

      const imgMatch = tr.match(/src=['"]([^'"]*(?:\/lm\/|\/l\/)[^'"]+)['"]/i);
      let photoUrl = null;
      if (imgMatch && !imgMatch[1].includes("no-foto") && !imgMatch[1].includes("sense-foto")) {
        photoUrl = imgMatch[1].replace(/^(\.\.\/)+/, "https://www.bdfutbol.com/");
      }

      const nameMatch = tr.match(/<span class="font-weight-bold mr-2 float-left">([^<]+)<\/span>(?:<span class="d-none d-md-block float-left">([^<]+)<\/span>)?/i);
      const cells = (tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map((td) => td.replace(/<[^>]+>/g, "").trim());
      if (nameMatch) {
        const alias = nameMatch[1].trim();
        const fullName = nameMatch[2]?.trim() || alias;
        const matchesDirected = parseInt(cells[cells.length - 3], 10) || undefined;
        coaches.push({ alias, fullName, matches: matchesDirected, photoUrl });
      }
    }
  }

  // Fallback to coach in seasons.json if table not found
  if (coaches.length === 0 && season.coach) {
    const names = season.coach.split("/").map((s) => s.trim());
    names.forEach((n) => coaches.push({ alias: n, fullName: n, photoUrl: null }));
  }

  // 2. Squad / Plantilla
  const squadMatch = html.match(/<table id="taulaplantilla"[\s\S]*?<\/table>/i);
  const players = [];
  if (squadMatch) {
    const trs = squadMatch[0].match(/<tr[\s\S]*?<\/tr>/gi) || [];
    const ths = (trs[0]?.match(/<th[^>]*>([\s\S]*?)<\/th>/gi) || []).map((th) => th.replace(/<[^>]+>/g, "").trim());
    const pjIdx = ths.findIndex((h) => h === "PJ");
    const minIdx = ths.findIndex((h) => h === "Min");
    const goalsIdx = ths.findIndex((h) => h === "G");

    for (let i = 1; i < trs.length; i++) {
      const tr = trs[i];
      if (tr.includes("<th")) continue;

      const imgMatch = tr.match(/src=['"]([^'"]*(?:\/m\/|\/j\/)[^'"]+)['"]/i);
      let photoUrl = null;
      if (imgMatch && !imgMatch[1].includes("no-foto") && !imgMatch[1].includes("sense-foto")) {
        photoUrl = imgMatch[1].replace(/^(\.\.\/)+/, "https://www.bdfutbol.com/");
      }

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
      else if (/class="[^"]*\b(dav|ext|del|dac)\b[^"]*"/.test(tr)) position = "Delantero";

      const cells = (tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map((td) => td.replace(/<[^>]+>/g, "").trim());
      
      const played = pjIdx !== -1 && cells[pjIdx] ? parseInt(cells[pjIdx], 10) || 0 : 0;
      const minutesValue = minIdx !== -1 && cells[minIdx] ? parseInt(cells[minIdx], 10) : NaN;
      const minutes = Number.isFinite(minutesValue) ? minutesValue : null;
      let goals = goalsIdx !== -1 && cells[goalsIdx] ? parseInt(cells[goalsIdx], 10) || 0 : 0;
      if (isNaN(goals) || (position === "Portero" && goals < 0)) goals = 0;

      players.push({
        dorsal,
        alias,
        fullName,
        position,
        played,
        minutes,
        goals,
        photoUrl,
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
      photoUrl: p.photoUrl,
    })),
    players,
  };
}

async function run() {
  console.log(`Ingesting squads for ${seasons.length} seasons with photographs...`);
  const result = {};
  let successCount = 0;
  const BATCH_SIZE = 6;

  for (let i = 0; i < seasons.length; i += BATCH_SIZE) {
    const batch = seasons.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (s) => {
        const html = await fetchPage(s.id);
        const parsed = parseSquadHtml(html, s);

        if (parsed && parsed.players.length > 0) {
          result[s.id] = parsed;
          successCount++;
          const withPhoto = parsed.players.filter((p) => p.photoUrl).length;
          process.stdout.write(` ${s.id} (${withPhoto}/${parsed.players.length}📷) |`);
        }
      })
    );
  }

  const outPath = path.join(__dirname, "../src/data/historical/squads.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`\n\nDone! Saved ${successCount} seasons to ${outPath}`);
}

run().catch(console.error);
