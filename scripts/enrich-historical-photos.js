/**
 * @file Enriches historical player photos with chronological gallery portraits from BDFutbol.
 * Matches each season to the player's authentic contemporary photo from their career stages.
 * Run with: node --use-system-ca scripts/enrich-historical-photos.js
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const squadsPath = path.join(__dirname, "../src/data/historical/squads.json");
const cachePath = path.join(__dirname, ".cache-player-galleries.json");

const agent = new https.Agent({ keepAlive: true, maxSockets: 10 });

function fetchPlayerPage(id) {
  return new Promise((resolve) => {
    https.get(`https://www.bdfutbol.com/es/j/j${id}.html`, { agent, rejectUnauthorized: false }, (res) => {
      if (res.statusCode !== 200) return resolve(null);
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    }).on("error", () => resolve(null));
  });
}

function parsePhotosFromHtml(html) {
  if (!html) return [];
  const carouselMatch = html.match(/<div id="carousel"[\s\S]*?<\/div>\s*<\/div>/i);
  if (!carouselMatch) return [];

  const photos = [];
  const imgMatches = [...carouselMatch[0].matchAll(/src=['"](\.\.\/\.\.\/i\/j\/[^'"]+)['"]/gi)];
  for (const m of imgMatches) {
    const fullUrl = m[1];
    const vMatch = fullUrl.match(/\?v=(\d+)/);
    const timestamp = vMatch ? parseInt(vMatch[1], 10) : 0;
    const cleanFile = fullUrl.split("?")[0].replace("../../i/j/", "");
    const photoUrl = `https://www.bdfutbol.com/i/j/${cleanFile}`;
    const date = timestamp ? new Date(timestamp * 1000).toISOString().slice(0, 10) : null;

    let seasonYear = null;
    if (date) {
      const [yStr, mStr] = date.split("-");
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      seasonYear = m >= 7 ? y : y - 1;
    }
    photos.push({ file: cleanFile, photoUrl, timestamp, date, seasonYear });
  }

  // Sort chronologically by timestamp
  return photos.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Group seasons into contiguous career stages
 */
function getStages(seasonYears) {
  const sorted = [...new Set(seasonYears)].sort((a, b) => a - b);
  const stages = [];
  let currentStage = [];
  for (const y of sorted) {
    if (currentStage.length === 0 || y === currentStage[currentStage.length - 1] + 1) {
      currentStage.push(y);
    } else {
      stages.push(currentStage);
      currentStage = [y];
    }
  }
  if (currentStage.length > 0) stages.push(currentStage);
  return stages;
}

/**
 * Pick the authentic contemporary photo for a given season year
 */
function pickStagePhoto(photos, targetYear, allSportingYears) {
  if (!photos || photos.length === 0) return null;
  if (photos.length === 1) return photos[0].photoUrl;

  const stages = getStages(allSportingYears);
  const currentStage = stages.find((st) => st.includes(targetYear)) || [targetYear];
  const stageStart = currentStage[0];
  const stageEnd = currentStage[currentStage.length - 1];

  // 1. Photos taken inside this Sporting stage
  const stagePhotos = photos.filter((p) => p.seasonYear !== null && p.seasonYear >= stageStart && p.seasonYear <= stageEnd + 1);
  const candidatePool = stagePhotos.length > 0 ? stagePhotos : photos;

  // 2. From candidate pool, pick closest match for targetYear
  let best = candidatePool[0];
  let minDiff = Infinity;
  for (const p of candidatePool) {
    const year = p.seasonYear ?? targetYear;
    const diff = targetYear - year;
    let score;
    if (diff >= 0) {
      score = diff;
    } else {
      score = Math.abs(diff) * 1.5;
    }
    if (score < minDiff) {
      minDiff = score;
      best = p;
    }
  }
  return best.photoUrl;
}

async function main() {
  console.log("Loading squads.json...");
  const squads = JSON.parse(fs.readFileSync(squadsPath, "utf-8"));

  // Collect player IDs and their Sporting seasons
  const playerSeasonMap = new Map();
  for (const [season, data] of Object.entries(squads)) {
    const seasonYear = parseInt(season.split("-")[0], 10);
    const all = [...(data.players || []), ...(data.topScorers || [])];
    for (const item of all) {
      if (!item.photoUrl) continue;
      const m = item.photoUrl.match(/\/i\/m\/(\d+)\.png/) || item.photoUrl.match(/\/i\/j\/(\d+)/);
      if (m) {
        const id = m[1];
        if (!playerSeasonMap.has(id)) playerSeasonMap.set(id, new Set());
        playerSeasonMap.get(id).add(seasonYear);
      }
    }
  }

  console.log(`Found ${playerSeasonMap.size} unique players with photos in squads.json.`);

  // Load cache if exists
  let cache = {};
  if (fs.existsSync(cachePath)) {
    try {
      cache = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      console.log(`Loaded ${Object.keys(cache).length} cached player galleries.`);
    } catch {
      cache = {};
    }
  }

  // Fetch galleries for uncached players
  const playerIds = Array.from(playerSeasonMap.keys());
  const uncachedIds = playerIds.filter((id) => !cache[id]);
  console.log(`Need to fetch ${uncachedIds.length} players from BDFutbol...`);

  const BATCH_SIZE = 10;
  for (let i = 0; i < uncachedIds.length; i += BATCH_SIZE) {
    const batch = uncachedIds.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (id) => {
        const html = await fetchPlayerPage(id);
        const photos = parsePhotosFromHtml(html);
        return { id, photos };
      })
    );
    for (const r of results) {
      cache[r.id] = r.photos;
    }

    if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= uncachedIds.length) {
      console.log(`Progress: ${Math.min(i + BATCH_SIZE, uncachedIds.length)} / ${uncachedIds.length}`);
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf-8");
    }
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf-8");

  // Enrich squads.json
  console.log("Enriching squads.json with chronological photos...");
  let enrichedCount = 0;

  for (const [season, data] of Object.entries(squads)) {
    const seasonYear = parseInt(season.split("-")[0], 10);

    const updateItem = (item) => {
      if (!item.photoUrl) return;
      const m = item.photoUrl.match(/\/i\/m\/(\d+)\.png/) || item.photoUrl.match(/\/i\/j\/(\d+)/);
      if (!m) return;
      const id = m[1];
      const photos = cache[id];
      if (!photos || photos.length === 0) return;

      const sportingYears = Array.from(playerSeasonMap.get(id) || [seasonYear]);
      const newPhotoUrl = pickStagePhoto(photos, seasonYear, sportingYears);
      if (newPhotoUrl && newPhotoUrl !== item.photoUrl) {
        item.photoUrl = newPhotoUrl;
        enrichedCount++;
      }
    };

    (data.players || []).forEach(updateItem);
    (data.topScorers || []).forEach(updateItem);
  }

  console.log(`Writing enriched data to squads.json (${enrichedCount} photo updates applied)...`);
  fs.writeFileSync(squadsPath, JSON.stringify(squads, null, 2), "utf-8");
  console.log("Enrichment complete!");
}

main().catch(console.error);
