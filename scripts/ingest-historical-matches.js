/**
 * @file Ingests official match history for all 95 seasons of Real Sporting from BDFutbol.
 * Run with: node --use-system-ca scripts/ingest-historical-matches.js
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const seasons = require("../src/data/historical/seasons.json");

function fetchUrl(url) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) return resolve({ status: res.statusCode, data: "" });
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: 200, data }));
      })
      .on("error", (err) => resolve({ status: 500, error: err.message, data: "" }));
  });
}

function cleanTeamName(raw) {
  const t = raw.trim();
  if (/uni[oó]n sporting/i.test(t)) return "Unión Sporting Club";
  if (/sporting|gij[oó]n/i.test(t)) return "Real Sporting";
  if (/oviedo/i.test(t)) return "Real Oviedo";
  if (/athletic de madrid|atl[eé]tico de madrid|atl[eé]tico madrid|atl[eé]tico aviaci[oó]n/i.test(t)) return "Atlético de Madrid";
  if (/athletic club|athletic de bilbao|bilbao/i.test(t)) return "Athletic Club";
  if (/barcelona b|barcelona atl/i.test(t)) return "FC Barcelona Atlètic";
  if (/barcelona/i.test(t)) return "FC Barcelona";
  if (/plus ultra|real madrid castilla/i.test(t)) return "Real Madrid Castilla";
  if (/real madrid/i.test(t)) return "Real Madrid";
  if (/betis/i.test(t)) return "Real Betis";
  if (/sevilla.*atl[eé]tico/i.test(t)) return "Sevilla Atlético";
  if (/sevilla/i.test(t)) return "Sevilla FC";
  if (/valencia.*mestalla|mestalla/i.test(t)) return "Valencia Mestalla";
  if (/valencia/i.test(t)) return "Valencia CF";
  if (/espanyol|español/i.test(t)) return "RCD Espanyol";
  if (/celta/i.test(t)) return "RC Celta";
  if (/deportivo.*coru[ñn]a/i.test(t)) return "RC Deportivo";
  if (/san sebasti[aá]n|real sociedad b/i.test(t)) return "Real Sociedad B";
  if (/real sociedad/i.test(t)) return "Real Sociedad";
  if (/zaragoza|iberia/i.test(t)) return "Real Zaragoza";
  if (/valladolid/i.test(t)) return "Real Valladolid";
  if (/santander|racing de santander/i.test(t)) return "Racing de Santander";
  if (/racing de ferrol|ferrol/i.test(t)) return "Racing de Ferrol";
  if (/mallorca/i.test(t)) return "RCD Mallorca";
  if (/osasuna/i.test(t)) return "CA Osasuna";
  if (/alav[eé]s/i.test(t)) return "Deportivo Alavés";
  if (/las palmas/i.test(t)) return "UD Las Palmas";
  if (/rayo/i.test(t)) return "Rayo Vallecano";
  if (/granada.*74/i.test(t)) return "Granada 74";
  if (/granada/i.test(t)) return "Granada CF";
  if (/tenerife/i.test(t)) return "CD Tenerife";
  if (/legan[eé]s/i.test(t)) return "CD Leganés";
  if (/eibar/i.test(t)) return "SD Eibar";
  if (/huesca/i.test(t)) return "SD Huesca";
  if (/levante/i.test(t)) return "Levante UD";
  if (/elche.*ilicitano/i.test(t)) return "Elche Ilicitano";
  if (/elche/i.test(t)) return "Elche CF";
  if (/castell[oó]n/i.test(t)) return "CD Castellón";
  if (/m[aá]laga.*b|atl[eé]tico malague[ñn]o/i.test(t)) return "Atlético Malagueño";
  if (/m[aá]laga|cd m[aá]laga/i.test(t)) return "Málaga CF";
  if (/c[aá]diz/i.test(t)) return "Cádiz CF";
  if (/albacete/i.test(t)) return "Albacete Balompié";
  if (/almer[ií]a/i.test(t)) return "UD Almería";
  if (/c[oó]rdoba/i.test(t)) return "Córdoba CF";
  if (/burgos/i.test(t)) return "Burgos CF";
  if (/mirand[eé]s/i.test(t)) return "CD Mirandés";
  if (/ponferradina/i.test(t)) return "SD Ponferradina";
  if (/cartagena/i.test(t)) return "FC Cartagena";
  if (/amurrio/i.test(t)) return "Amurrio Club";
  if (/andorra/i.test(t)) return "FC Andorra";
  if (/villarreal.*b/i.test(t)) return "Villarreal CF B";
  if (/villarreal/i.test(t)) return "Villarreal CF";
  if (/getafe/i.test(t)) return "Getafe CF";
  if (/sabadell/i.test(t)) return "CE Sabadell";
  if (/h[eé]rcules/i.test(t)) return "Hércules CF";
  if (/salamanca/i.test(t)) return "UD Salamanca";
  if (/logro[ñn][eé]s/i.test(t)) return "CD Logroñés";
  if (/recreativo/i.test(t)) return "Recreativo de Huelva";
  if (/badajoz/i.test(t)) return "CD Badajoz";
  if (/m[eé]rida/i.test(t)) return "CP Mérida";
  if (/toledo/i.test(t)) return "CD Toledo";
  if (/lleida|l[eé]rida/i.test(t)) return "UE Lleida";
  if (/langreo/i.test(t)) return "UP Langreo";
  if (/avil[eé]s/i.test(t)) return "Real Avilés";
  if (/caudal/i.test(t)) return "Caudal Deportivo";
  if (/sestao/i.test(t)) return "Sestao Sport";
  if (/barakaldo/i.test(t)) return "Barakaldo CF";
  if (/arenas/i.test(t)) return "Arenas Club";
  if (/real uni[oó]n/i.test(t)) return "Real Unión";
  if (/europa/i.test(t)) return "CE Europa";
  return t;
}

function parseMatchesHtml(html, seasonId) {
  if (!html) return [];
  const tableMatch = html.match(/<table[^>]*id=['"]taula-resultats-plantilla['"][\s\S]*?<\/table>/i);
  if (!tableMatch) return [];

  const trs = tableMatch[0].match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const matches = [];

  for (let i = 1; i < trs.length; i++) {
    const tr = trs[i];
    if (tr.includes("<th")) continue;

    const dateMatch = tr.match(/<td[^>]*class="fit"[^>]*><a[^>]*>(\d{2}\/\d{2}\/\d{4})<\/a><\/td>/i);
    const date = dateMatch ? dateMatch[1] : "";
    if (!date) continue;

    const cells = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length < 8) continue;

    const rawComp = cells[1].replace(/<[^>]+>/g, "").trim();
    let competition = rawComp;
    if (/liga/i.test(rawComp)) competition = "Liga";
    else if (/copa del rey|copa del general[ií]simo|copa presidente|copa de la rep/i.test(rawComp)) competition = "Copa del Rey";
    else if (/copa uefa|uefa/i.test(rawComp)) competition = "Copa UEFA";
    else if (/promoci[oó]n/i.test(rawComp)) competition = "Promoción";

    const round = cells[2].replace(/<[^>]+>/g, "").trim();
    const rawHome = cells[3].replace(/<[^>]+>/g, "").trim();
    const rawAway = cells[7].replace(/<[^>]+>/g, "").trim();

    const scoreCell = cells[5];
    const scoreDivs = scoreCell.match(/<div class=['"]resultat-gols[^'"]*['"][^>]*>(\d+)<\/div>/gi);
    if (!scoreDivs || scoreDivs.length < 2) continue;
    const homeScore = parseInt(scoreDivs[0].replace(/<[^>]+>/g, "").trim(), 10);
    const awayScore = parseInt(scoreDivs[1].replace(/<[^>]+>/g, "").trim(), 10);

    const venue = cells[8] ? cells[8].replace(/<[^>]+>/g, "").trim() : "";

    const homeImgRaw = cells[4]?.match(/src=['"]([^'"]+)['"]/i)?.[1];
    const awayImgRaw = cells[6]?.match(/src=['"]([^'"]+)['"]/i)?.[1];
    const bdfHomeCrest = homeImgRaw ? homeImgRaw.replace(/^(\.\.\/)+/, "https://www.bdfutbol.com/") : undefined;
    const bdfAwayCrest = awayImgRaw ? awayImgRaw.replace(/^(\.\.\/)+/, "https://www.bdfutbol.com/") : undefined;

    const isSportingHome = /sporting|gij[oó]n/i.test(rawHome) && !/uni[oó]n sporting/i.test(rawHome);

    const homeTeam = isSportingHome ? "Real Sporting" : cleanTeamName(rawHome);
    const awayTeam = isSportingHome ? cleanTeamName(rawAway) : "Real Sporting";

    let outcome = "D";
    if (homeScore === awayScore) {
      outcome = "E";
    } else if (isSportingHome) {
      outcome = homeScore > awayScore ? "V" : "D";
    } else {
      outcome = awayScore > homeScore ? "V" : "D";
    }

    const opponent = isSportingHome ? awayTeam : homeTeam;

    matches.push({
      id: `${seasonId}-${i}`,
      date,
      competition,
      round,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      isHome: isSportingHome,
      outcome,
      opponent,
      venue: venue || (isSportingHome ? "El Molinón" : undefined),
      bdfHomeCrest,
      bdfAwayCrest,
    });
  }

  return matches;
}

async function main() {
  console.log(`Starting matches ingestion for ${seasons.length} seasons...`);
  const allMatches = {};
  let totalCount = 0;

  const BATCH_SIZE = 6;
  for (let i = 0; i < seasons.length; i += BATCH_SIZE) {
    const batch = seasons.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (season) => {
        const url = `https://www.bdfutbol.com/es/t/t${season.id}34.html?tab=partits`;
        const res = await fetchUrl(url);
        const matches = parseMatchesHtml(res.data, season.id);
        allMatches[season.id] = matches;
        totalCount += matches.length;
        process.stdout.write(` ${season.id} (${matches.length}) |`);
      })
    );
  }

  console.log(`\n\nIngestion complete! Total matches recorded: ${totalCount}`);
  const targetPath = path.resolve(__dirname, "../src/data/historical/matches.json");
  fs.writeFileSync(targetPath, JSON.stringify(allMatches, null, 2), "utf-8");
  console.log(`Saved to ${targetPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
