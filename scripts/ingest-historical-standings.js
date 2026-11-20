/**
 * @file Ingests official complete standings from BDFutbol for all historical seasons of Real Sporting.
 * Run with: node --use-system-ca scripts/ingest-historical-standings.js
 */

const https = require("https");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const { HISTORICAL_SEASONS } = require("../src/lib/historical/seasons-data.ts");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return resolve({ status: res.statusCode, data: "" });
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: 200, data }));
    }).on("error", (err) => resolve({ status: 500, error: err.message, data: "" }));
  });
}

function cleanTeamName(raw) {
  if (/uni[oó]n sporting/i.test(raw)) return "Unión Sporting Club";
  if (/sporting|gij[oó]n/i.test(raw)) return "Real Sporting";
  if (/oviedo/i.test(raw)) return "Real Oviedo";
  if (/athletic de madrid|atl[eé]tico de madrid|atl[eé]tico madrid|atl[eé]tico aviaci[oó]n/i.test(raw)) return "Atlético de Madrid";
  if (/athletic club|athletic de bilbao|bilbao/i.test(raw)) return "Athletic Club";
  if (/barcelona b|barcelona atl/i.test(raw)) return "FC Barcelona Atlètic";
  if (/barcelona/i.test(raw)) return "FC Barcelona";
  if (/plus ultra|real madrid castilla/i.test(raw)) return "Real Madrid Castilla";
  if (/real madrid/i.test(raw)) return "Real Madrid";
  if (/betis/i.test(raw)) return "Real Betis";
  if (/sevilla.*atl[eé]tico/i.test(raw)) return "Sevilla Atlético";
  if (/sevilla/i.test(raw)) return "Sevilla FC";
  if (/valencia.*mestalla|mestalla/i.test(raw)) return "Valencia Mestalla";
  if (/valencia/i.test(raw)) return "Valencia CF";
  if (/espanyol|español/i.test(raw)) return "RCD Espanyol";
  if (/celta/i.test(raw)) return "RC Celta";
  if (/deportivo.*coru[ñn]a/i.test(raw)) return "RC Deportivo";
  if (/san sebasti[aá]n|real sociedad b/i.test(raw)) return "Real Sociedad B";
  if (/real sociedad/i.test(raw)) return "Real Sociedad";
  if (/zaragoza|iberia/i.test(raw)) return "Real Zaragoza";
  if (/valladolid/i.test(raw)) return "Real Valladolid";
  if (/santander|racing de santander/i.test(raw)) return "Racing de Santander";
  if (/mallorca/i.test(raw)) return "RCD Mallorca";
  if (/osasuna/i.test(raw)) return "CA Osasuna";
  if (/alav[eé]s/i.test(raw)) return "Deportivo Alavés";
  if (/las palmas/i.test(raw)) return "UD Las Palmas";
  if (/rayo/i.test(raw)) return "Rayo Vallecano";
  if (/granada/i.test(raw) && !/74/i.test(raw)) return "Granada CF";
  if (/tenerife/i.test(raw)) return "CD Tenerife";
  if (/legan[eé]s/i.test(raw)) return "CD Leganés";
  if (/eibar/i.test(raw)) return "SD Eibar";
  if (/huesca/i.test(raw)) return "SD Huesca";
  if (/levante/i.test(raw)) return "Levante UD";
  if (/ilicitano/i.test(raw)) return "Elche Ilicitano";
  if (/elche/i.test(raw)) return "Elche CF";
  if (/girona|gerona/i.test(raw)) return "Girona FC";
  if (/c[aá]diz/i.test(raw)) return "Cádiz CF";
  if (/albacete/i.test(raw)) return "Albacete Balompié";
  if (/almer[ií]a/i.test(raw)) return "UD Almería";
  if (/c[oó]rdoba/i.test(raw)) return "Córdoba CF";
  if (/m[aá]laga/i.test(raw)) return "Málaga CF";
  if (/castell[oó]n/i.test(raw)) return "CD Castellón";
  if (/ferrol/i.test(raw)) return "Racing de Ferrol";
  if (/salamanca/i.test(raw)) return "UD Salamanca";
  if (/sabadell/i.test(raw)) return "CE Sabadell";
  if (/mirand[eé]s/i.test(raw)) return "CD Mirandés";
  if (/burgos/i.test(raw)) return "Burgos CF";
  if (/ponferradina/i.test(raw)) return "SD Ponferradina";
  if (/lugo|lucense/i.test(raw)) return "CD Lugo";
  if (/numancia/i.test(raw)) return "CD Numancia";
  if (/alcorc[oó]n/i.test(raw)) return "AD Alcorcón";
  if (/cartagena/i.test(raw)) return "FC Cartagena";
  if (/amurrio|amorebieta/i.test(raw)) return "SD Amorebieta";
  if (/andorra/i.test(raw)) return "FC Andorra";
  if (/villarreal.*b/i.test(raw)) return "Villarreal CF B";
  if (/villarreal/i.test(raw)) return "Villarreal CF";
  if (/h[eé]rcules/i.test(raw)) return "Hércules CF";
  if (/recreativo/i.test(raw)) return "Recreativo de Huelva";
  if (/logro[ñn][eé]s/i.test(raw)) return "CD Logroñés";
  if (/pontevedra/i.test(raw)) return "Pontevedra CF";
  if (/arenas/i.test(raw)) return "Arenas Club";
  if (/real uni[oó]n|uni[oó]n ir[uú]n/i.test(raw)) return "Real Unión Club";
  if (/baracaldo|barakaldo/i.test(raw)) return "Barakaldo CF";
  if (/cultural/i.test(raw)) return "Cultural Leonesa";
  if (/badajoz/i.test(raw)) return "CD Badajoz";
  if (/ja[eé]n/i.test(raw)) return "Real Jaén";
  if (/compostela/i.test(raw)) return "SD Compostela";
  if (/m[eé]rida/i.test(raw)) return "CP Mérida";
  if (/extremadura/i.test(raw)) return "CF Extremadura";
  if (/toledo/i.test(raw)) return "CD Toledo";
  if (/gimn[aàá]stic.*tarragona/i.test(raw)) return "Gimnàstic de Tarragona";
  if (/xerez/i.test(raw)) return "Xerez CD";
  if (/ourense|orensana|orense/i.test(raw)) return "CD Ourense";
  if (/lleida|l[eé]rida/i.test(raw)) return "UE Lleida";
  if (/terrassa|tarrasa/i.test(raw)) return "Terrassa FC";
  if (/avil[eé]s|stadium avilesino/i.test(raw)) return "Real Avilés";
  if (/langreo|la felguera/i.test(raw)) return "UP Langreo";
  if (/caudal/i.test(raw)) return "Caudal Deportivo";
  if (/torrelavega/i.test(raw)) return "RS Gimnástica de Torrelavega";
  if (/badalona/i.test(raw)) return "CF Badalona";
  if (/san andr[eé]s|sant andreu/i.test(raw)) return "UE Sant Andreu";
  if (/indau[tx]chu/i.test(raw)) return "SD Indautxu";
  if (/alcoyano/i.test(raw)) return "CD Alcoyano";
  if (/sestao/i.test(raw)) return "Sestao Sport Club";
  if (/polideportivo ejido|poli ejido/i.test(raw)) return "Polideportivo Ejido";
  if (/ciudad de murcia/i.test(raw)) return "CF Ciudad de Murcia";
  if (/murcia/i.test(raw)) return "Real Murcia";
  if (/algeciras/i.test(raw)) return "Algeciras CF";
  if (/guadalajara/i.test(raw)) return "CD Guadalajara";
  if (/basconia|baskonia/i.test(raw)) return "CD Basconia";
  if (/hospitalet/i.test(raw)) return "CE L'Hospitalet";
  if (/constancia|const[aà]ncia/i.test(raw)) return "CD Constància";
  if (/atl[eé]tico baleares/i.test(raw)) return "CD Atlético Baleares";
  if (/europa/i.test(raw)) return "CE Europa";
  if (/condal|espa[ñn]a industrial/i.test(raw)) return "CD Condal";
  if (/reus/i.test(raw)) return "CF Reus Deportiu";
  if (/getafe/i.test(raw)) return "Getafe CF";
  return raw;
}

function toSlug(cleanName) {
  const map = {
    "Real Sporting": "real-sporting",
    "Real Oviedo": "real-oviedo",
    "Atlético de Madrid": "atletico-madrid",
    "Athletic Club": "athletic-club",
    "FC Barcelona": "fc-barcelona",
    "FC Barcelona Atlètic": "fc-barcelona",
    "Real Madrid": "real-madrid",
    "Real Madrid Castilla": "real-madrid",
    "Real Betis": "real-betis",
    "Sevilla FC": "sevilla-fc",
    "Sevilla Atlético": "sevilla-atletico",
    "Valencia CF": "valencia-cf",
    "Valencia Mestalla": "valencia-cf",
    "RCD Espanyol": "rcd-espanyol",
    "RC Celta": "rc-celta",
    "RC Deportivo": "rc-deportivo",
    "Real Sociedad": "real-sociedad",
    "Real Sociedad B": "real-sociedad",
    "Real Zaragoza": "real-zaragoza",
    "Real Valladolid": "real-valladolid",
    "Racing de Santander": "racing-santander",
    "RCD Mallorca": "rcd-mallorca",
    "CA Osasuna": "ca-osasuna",
    "Deportivo Alavés": "deportivo-alaves",
    "UD Las Palmas": "ud-las-palmas",
    "Rayo Vallecano": "rayo-vallecano",
    "Granada CF": "granada-cf",
    "CD Tenerife": "cd-tenerife",
    "CD Leganés": "cd-leganes",
    "SD Eibar": "sd-eibar",
    "SD Huesca": "sd-huesca",
    "Levante UD": "levante-ud",
    "Elche CF": "elche-cf",
    "Elche Ilicitano": "elche-cf",
    "Girona FC": "girona-fc",
    "Cádiz CF": "cadiz-cf",
    "Albacete Balompié": "albacete-bp",
    "UD Almería": "ud-almeria",
    "Córdoba CF": "cordoba-cf",
    "Málaga CF": "malaga-cf",
    "CD Castellón": "cd-castellon",
    "Racing de Ferrol": "racing-ferrol",
    "UD Salamanca": "ud-salamanca",
    "CE Sabadell": "ce-sabadell",
    "CD Mirandés": "cd-mirandes",
    "Burgos CF": "burgos-cf",
    "SD Ponferradina": "ponferradina",
    "CD Lugo": "cd-lugo",
    "CD Numancia": "cd-numancia",
    "AD Alcorcón": "alcorcon",
    "FC Cartagena": "fc-cartagena",
    "SD Amorebieta": "sd-amorebieta",
    "FC Andorra": "fc-andorra",
    "Villarreal CF": "villarreal-cf",
    "Villarreal CF B": "villarreal-b",
    "Hércules CF": "hercules-cf",
    "Recreativo de Huelva": "recreativo-huelva",
    "CD Logroñés": "cd-logrones",
    "Pontevedra CF": "pontevedra-cf",
    "Arenas Club": "arenas-club",
    "Real Unión Club": "real-union",
    "Barakaldo CF": "barakaldo-cf",
    "Cultural Leonesa": "cultural-leonesa",
    "CD Badajoz": "cd-badajoz",
    "Real Jaén": "real-jaen",
    "SD Compostela": "sd-compostela",
    "CP Mérida": "cp-merida",
    "CF Extremadura": "cf-extremadura",
    "CD Toledo": "cd-toledo",
    "Gimnàstic de Tarragona": "gimnastic-de-tarragona",
    "Xerez CD": "xerez",
    "CD Ourense": "ourense",
    "UE Lleida": "lleida",
    "Terrassa FC": "terrassa",
    "Real Avilés": "aviles",
    "UP Langreo": "langreo",
    "Caudal Deportivo": "caudal",
    "RS Gimnástica de Torrelavega": "gimnastica-de-torrelavega",
    "CF Badalona": "badalona",
    "UE Sant Andreu": "san-andres",
    "SD Indautxu": "indauchu",
    "CD Alcoyano": "alcoyano",
    "Sestao Sport Club": "sestao",
    "Polideportivo Ejido": "polideportivo-ejido",
    "CF Ciudad de Murcia": "ciudad-de-murcia",
    "Real Murcia": "real-murcia",
    "Algeciras CF": "algeciras",
    "CD Guadalajara": "guadalajara",
    "CD Basconia": "basconia",
    "CE L'Hospitalet": "hospitalet",
    "CD Constància": "constancia",
    "CD Atlético Baleares": "atletico-baleares",
    "CE Europa": "europa",
    "CD Condal": "condal",
    "CF Reus Deportiu": "reus",
    "Getafe CF": "getafe-cf",
    "Unión Sporting Club": "union-sporting-club",
  };

  if (map[cleanName]) return map[cleanName];

  return cleanName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getBdfutbolUrl(season) {
  const { id, tier } = season;
  if (tier === 1) {
    return `https://www.bdfutbol.com/es/t/t${id}.html`;
  }

  const multiGroup1Seasons = [
    "1967-68", "1966-67", "1965-66", "1964-65", "1963-64", "1962-63", "1961-62", "1960-61",
    "1959-60", "1956-57", "1955-56", "1954-55", "1950-51", "1949-50",
    "1942-43", "1941-42", "1940-41", "1939-40", "1935-36", "1934-35", "1928-29",
  ];

  if (multiGroup1Seasons.includes(id)) {
    return `https://www.bdfutbol.com/es/t/t${id}2a1.html`;
  }

  return `https://www.bdfutbol.com/es/t/t${id}2a.html`;
}

function assignZone(pos, totalTeams, tier, startYear) {
  if (pos === 1) return "champion";

  if (tier === 1) {
    if (startYear >= 1999) {
      if (pos <= 4) return "uefa";
      if (pos >= totalTeams - 2) return "relegation";
    } else {
      if (pos <= (totalTeams >= 18 ? 4 : 2)) return "uefa";
      if (pos >= totalTeams - 1) return "relegation";
    }
    return "neutral";
  }

  if (startYear >= 2010) {
    if (pos === 2) return "promotion";
    if (pos <= 6) return "promotion";
    if (pos >= totalTeams - 3) return "relegation";
  } else if (startYear >= 1999) {
    if (pos <= 3) return "promotion";
    if (pos >= totalTeams - 3) return "relegation";
  } else {
    if (pos <= 2) return "promotion";
    if (pos >= totalTeams - 2) return "relegation";
  }

  return "neutral";
}

async function parseSeasonPage(season) {
  const url = getBdfutbolUrl(season);
  const res = await fetchUrl(url);
  if (res.status !== 200) {
    return null;
  }

  const match = res.data.match(/SE=\[\];[\s\S]*?<\/script>/);
  if (!match) {
    return null;
  }

  const js = match[0].replace("</script>", "");
  const sandbox = vm.createContext(
    { SE: [], SP: [] },
    { codeGeneration: { strings: false, wasm: false } }
  );
  try {
    vm.runInContext(js, sandbox, { timeout: 1000 });
  } catch {
    return null;
  }
  const SE = Array.isArray(sandbox.SE) ? sandbox.SE : [];
  const SP = sandbox.SP && typeof sandbox.SP === "object" ? sandbox.SP : {};

  const teams = {};
  for (const s of SE) {
    const [id, rawName] = s.split("|");
    const name = cleanTeamName(rawName);
    const slug = toSlug(name);
    teams[id] = {
      id,
      name,
      slug,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      pts: 0,
    };
  }

  const directMatches = {};
  const matchdayKeys = Object.keys(SP);
  for (const k of matchdayKeys) {
    for (const m of SP[k] || []) {
      const t1 = teams[m.a1];
      const t2 = teams[m.a2];
      if (!t1 || !t2) continue;
      const g1 = parseInt(m.g1, 10);
      const g2 = parseInt(m.g2, 10);
      if (isNaN(g1) || isNaN(g2)) continue;

      t1.pj++;
      t2.pj++;
      t1.gf += g1;
      t1.gc += g2;
      t2.gf += g2;
      t2.gc += g1;

      if (g1 > g2) {
        t1.pg++;
        t1.pts += season.pointsSystem;
        t2.pp++;
      } else if (g1 === g2) {
        t1.pe++;
        t1.pts += 1;
        t2.pe++;
        t2.pts += 1;
      } else {
        t2.pg++;
        t2.pts += season.pointsSystem;
        t1.pp++;
      }
      if (!directMatches[m.a1]) directMatches[m.a1] = {};
      if (!directMatches[m.a2]) directMatches[m.a2] = {};
      if (!directMatches[m.a1][m.a2]) directMatches[m.a1][m.a2] = [];
      if (!directMatches[m.a2][m.a1]) directMatches[m.a2][m.a1] = [];

      directMatches[m.a1][m.a2].push({ gf: g1, gc: g2 });
      directMatches[m.a2][m.a1].push({ gf: g2, gc: g1 });
    }
  }

  function compareTied(a, b, tiedGroup) {
    const ptsWin = season.pointsSystem;
    if (tiedGroup.length === 2) {
      const matchesAB = directMatches[a.id]?.[b.id] || [];
      if (matchesAB.length > 0) {
        let ptsA = 0, ptsB = 0, gfA = 0, gfB = 0;
        for (const m of matchesAB) {
          gfA += m.gf;
          gfB += m.gc;
          if (m.gf > m.gc) ptsA += ptsWin;
          else if (m.gf === m.gc) { ptsA += 1; ptsB += 1; }
          else ptsB += ptsWin;
        }
        if (ptsA !== ptsB) return ptsB - ptsA;
        if (gfA !== gfB) return gfB - gfA;
      }
    } else {
      const getMiniStats = (t) => {
        let pts = 0, gf = 0, gc = 0;
        for (const other of tiedGroup) {
          if (other.id === t.id) continue;
          const matches = directMatches[t.id]?.[other.id] || [];
          for (const m of matches) {
            gf += m.gf;
            gc += m.gc;
            if (m.gf > m.gc) pts += ptsWin;
            else if (m.gf === m.gc) pts += 1;
          }
        }
        return { pts, gd: gf - gc, gf };
      };

      const statsA = getMiniStats(a);
      const statsB = getMiniStats(b);

      if (statsA.pts !== statsB.pts) return statsB.pts - statsA.pts;
      if (statsA.gd !== statsB.gd) return statsB.gd - statsA.gd;
      if (statsA.gf !== statsB.gf) return statsB.gf - statsA.gf;
    }

    const gdA = a.gf - a.gc;
    const gdB = b.gf - b.gc;
    if (gdA !== gdB) return gdB - gdA;
    return b.gf - a.gf;
  }

  const pointsMap = new Map();
  for (const t of Object.values(teams)) {
    if (!pointsMap.has(t.pts)) pointsMap.set(t.pts, []);
    pointsMap.get(t.pts).push(t);
  }

  const sorted = [];
  const sortedPoints = [...pointsMap.keys()].sort((a, b) => b - a);
  for (const pts of sortedPoints) {
    const group = pointsMap.get(pts);
    if (group.length === 1) {
      sorted.push(group[0]);
    } else {
      group.sort((a, b) => compareTied(a, b, group));
      sorted.push(...group);
    }
  }

  const totalTeams = sorted.length;
  return sorted.map((t, idx) => {
    const position = idx + 1;
    const isSporting = t.slug === "real-sporting";
    const zone = assignZone(position, totalTeams, season.tier, season.startYear);

    return {
      position,
      teamSlug: t.slug,
      teamName: t.name,
      points: t.pts,
      played: t.pj,
      won: t.pg,
      drawn: t.pe,
      lost: t.pp,
      goalsFor: t.gf,
      goalsAgainst: t.gc,
      isSporting,
      zone,
    };
  });
}

async function main() {
  console.log(`Starting historical standings ingestion for ${HISTORICAL_SEASONS.length} seasons...`);

  const outDir = path.join(__dirname, "../src/data/historical");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const allStandings = {};
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < HISTORICAL_SEASONS.length; i++) {
    const season = HISTORICAL_SEASONS[i];
    process.stdout.write(`[${i + 1}/${HISTORICAL_SEASONS.length}] Ingesting ${season.id}... `);

    try {
      const rows = await parseSeasonPage(season);
      if (rows && rows.length > 0) {
        allStandings[season.id] = rows;
        const sporting = rows.find((r) => r.isSporting);
        if (sporting) {
          season.position = sporting.position;
          season.played = sporting.played;
          season.won = sporting.won;
          season.drawn = sporting.drawn;
          season.lost = sporting.lost;
          season.goalsFor = sporting.goalsFor;
          season.goalsAgainst = sporting.goalsAgainst;
          season.points = sporting.points;
          season.totalTeams = rows.length;
        }
        successCount++;
        console.log(`OK (${rows.length} teams, Sporting #${sporting?.position ?? "?"})`);
      } else {
        failCount++;
        console.log("FAILED");
      }
    } catch (err) {
      failCount++;
      console.log(`ERROR: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, 40));
  }

  console.log(`\nIngestion complete! Success: ${successCount}, Failed: ${failCount}`);

  const standingsPath = path.join(outDir, "standings.json");
  fs.writeFileSync(standingsPath, JSON.stringify(allStandings, null, 2), "utf8");
  console.log(`Saved standings dataset to: ${standingsPath} (${(fs.statSync(standingsPath).size / 1024).toFixed(1)} KB)`);

  const seasonsPath = path.join(outDir, "seasons.json");
  fs.writeFileSync(seasonsPath, JSON.stringify(HISTORICAL_SEASONS, null, 2), "utf8");
  console.log(`Saved seasons dataset to: ${seasonsPath} (${(fs.statSync(seasonsPath).size / 1024).toFixed(1)} KB)`);
}

main();
