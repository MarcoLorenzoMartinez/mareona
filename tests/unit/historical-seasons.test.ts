import test from "node:test";
import assert from "node:assert/strict";
import {
  getAllSeasons,
  getSeasonById,
  getHistoricalChartPoints,
  getStandings,
  getHistoricalDecades,
} from "../../src/lib/historical/service.ts";
import { getHistoricalCrestUrl } from "../../src/lib/historical/crests.ts";

test("getAllSeasons returns complete catalog spanning from 1928 to present", () => {
  const seasons = getAllSeasons();
  assert.ok(seasons.length >= 60, "Must contain at least 60 official seasons");

  const season1928 = seasons.find((s) => s.id === "1928-29");
  assert.ok(season1928, "Inaugural season 1928-29 must exist");
  assert.equal(season1928.tier, 2);
  assert.equal(season1928.coach, "Manuel Meana");

  const season2025 = seasons.find((s) => s.id === "2025-26");
  assert.ok(season2025, "Season 2025-26 must exist in catalog");
  assert.equal(season2025.label, "2025-26");
  assert.equal(season2025.position, 10);
  assert.equal(season2025.points, 61);
  assert.equal(season2025.coach, "Borja Jiménez");
  assert.ok(season2025.topScorer.includes("Dubasin"));
});

test("Historical landmark season 1978-79 has subcampeonato data", () => {
  const season = getSeasonById("1978-79");
  assert.ok(season);
  assert.equal(season.tier, 1);
  assert.equal(season.position, 2);
  assert.equal(season.points, 43);
  assert.equal(season.pointsSystem, 2);
  assert.ok(season.topScorer.includes("Quini"));
  assert.ok(season.milestone?.includes("SUBCAMPEÓN"));
});

test("Promotions of 2007-08 (Preciado) and 2014-15 (Abelardo) are recorded accurately", () => {
  const s2008 = getSeasonById("2007-08");
  assert.ok(s2008);
  assert.equal(s2008.tier, 2);
  assert.equal(s2008.position, 3);
  assert.equal(s2008.coach, "Manolo Preciado");

  const s2015 = getSeasonById("2014-15");
  assert.ok(s2015);
  assert.equal(s2015.tier, 2);
  assert.equal(s2015.position, 2);
  assert.equal(s2015.lost, 2, "Abelardo Guajes season had only 2 defeats");
  assert.equal(s2015.coach, "Abelardo Fernández");
});

test("Points system transitions from 2 pts to 3 pts accurately starting 1995-96", () => {
  const s1994 = getSeasonById("1994-95");
  assert.ok(s1994);
  assert.equal(s1994.pointsSystem, 2);

  const s1995 = getSeasonById("1995-96");
  assert.ok(s1995);
  assert.equal(s1995.pointsSystem, 3);
});

test("getHistoricalChartPoints maps positions chronologically and cleanly separates tiers", () => {
  const points = getHistoricalChartPoints();
  assert.ok(points.length > 50);

  // Must be ascending chronologically
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (prev && curr) {
      assert.ok(curr.year >= prev.year, "Points must be sorted ascending by year");
    }
  }

  // Check 1978-79 effective rank is 2 (Tier 1)
  const p1978 = points.find((p) => p.seasonLabel === "1978-79");
  assert.ok(p1978);
  assert.equal(p1978.effectiveRank, 2);
  assert.equal(p1978.isMilestone, true);

  // Check 2014-15 effective rank is 22 (20 + 2 in Tier 2)
  const p2014 = points.find((p) => p.seasonLabel === "2014-15");
  assert.ok(p2014);
  assert.equal(p2014.effectiveRank, 22);
});

test("getStandings for 1978-79 returns official table with Real Sporting highlighted", () => {
  const season = getSeasonById("1978-79");
  assert.ok(season);
  const rows = getStandings(season);
  assert.equal(rows.length, 18, "1978-79 had 18 teams");

  const sportingRow = rows.find((r) => r.isSporting);
  assert.ok(sportingRow);
  assert.equal(sportingRow.teamName, "Real Sporting");
  assert.equal(sportingRow.position, 2);
  assert.equal(sportingRow.points, 43);

  const championRow = rows[0];
  assert.ok(championRow);
  assert.equal(championRow.position, 1);
  assert.equal(championRow.teamName, "Real Madrid");
});

test("Club crest resolver returns verified CDN and local assets without cross-team collisions", () => {
  const rsgCrest = getHistoricalCrestUrl("real-sporting");
  assert.ok(rsgCrest && rsgCrest.includes("3788.png"));

  const oviedoCrest = getHistoricalCrestUrl("real-oviedo");
  assert.ok(oviedoCrest && oviedoCrest.includes("92.png"));

  const racingCrest = getHistoricalCrestUrl("racing-santander");
  assert.ok(racingCrest && racingCrest.includes("87.png"), "Racing Santander must be ID 87, never Oviedo 92");

  const lasPalmasCrest = getHistoricalCrestUrl("ud-las-palmas");
  assert.ok(lasPalmasCrest && lasPalmasCrest.includes("98.png"), "Las Palmas must be ID 98, never Alavés 96");

  const alavesCrest = getHistoricalCrestUrl("deportivo-alaves");
  assert.ok(alavesCrest && alavesCrest.includes("96.png"), "Alavés must be ID 96");

  const salamancaCrest = getHistoricalCrestUrl("ud-salamanca");
  assert.equal(salamancaCrest, "/crests/ud-salamanca.svg");

  const herculesCrest = getHistoricalCrestUrl("hercules-cf");
  assert.equal(herculesCrest, "/crests/hercules-cf.svg");

  const recreativoCrest = getHistoricalCrestUrl("recreativo-huelva");
  assert.equal(recreativoCrest, "/crests/recreativo-huelva.png");

  const burgosCrest = getHistoricalCrestUrl("burgos-cf");
  assert.ok(burgosCrest && burgosCrest.includes("12597.png"));

  const unknownCrest = getHistoricalCrestUrl("club-inexistente");
  assert.equal(unknownCrest, null);
});

test("getHistoricalDecades provides clean decade groups for UI navigation", () => {
  const decades = getHistoricalDecades();
  assert.ok(decades.length >= 8);
  assert.equal(decades[0]?.label, "2020s");
  assert.equal(decades[decades.length - 1]?.label, "Orígenes");
});

test("all historical seasons have complete official standings tables with all rivals", () => {
  const seasons = getAllSeasons();
  assert.equal(seasons.length, 95, "Total of 95 seasons must be present");

  for (const s of seasons) {
    const table = getStandings(s);
    assert.ok(table.length >= 8, `Season ${s.id} must have a multi-team standings table (got ${table.length})`);
    const sporting = table.find((r) => r.isSporting);
    assert.ok(sporting, `Season ${s.id} table must contain Real Sporting`);
    assert.equal(sporting.teamName, "Real Sporting");
    assert.equal(sporting.position, s.position, `Position in table (${sporting.position}) must match season position (${s.position}) for ${s.id}`);
  }

  // Check specific modern season 2023-24
  const s2023 = getSeasonById("2023-24");
  assert.ok(s2023);
  const table2023 = getStandings(s2023);
  assert.equal(table2023.length, 22, "2023-24 Segunda División had 22 teams");
  assert.equal(table2023[0]?.teamName, "CD Leganés");
  assert.equal(table2023[0]?.position, 1);
  const rsg2023 = table2023.find((r) => r.isSporting);
  assert.ok(rsg2023);
  assert.equal(rsg2023.position, 5);
  assert.equal(rsg2023.points, 65);
});

test("Season 1950-51 achieves 100% full official crest coverage across all rivals", () => {
  const s1950 = getSeasonById("1950-51");
  assert.ok(s1950);
  const table = getStandings(s1950);
  assert.equal(table.length, 17, "1950-51 Group 1 had 17 teams");

  for (const row of table) {
    assert.ok(row.crestUrl, `Team ${row.teamName} (${row.teamSlug}) must have a valid crest URL`);
  }

  const santAndreu = table.find((r) => r.teamSlug === "san-andres");
  assert.ok(santAndreu?.crestUrl?.includes("san-andres.svg"));

  const torrelavega = table.find((r) => r.teamSlug === "gimnastica-de-torrelavega");
  assert.ok(torrelavega?.crestUrl?.includes("gimnastica-de-torrelavega.svg"));

  const ourense = table.find((r) => r.teamSlug === "ourense");
  assert.ok(ourense?.crestUrl?.includes("ourense.png"));

  const nastic = table.find((r) => r.teamSlug === "gimnastic-de-tarragona");
  assert.ok(nastic?.crestUrl?.includes("4492.png"));

  const girona = table.find((r) => r.teamSlug === "girona-fc");
  assert.ok(girona?.crestUrl?.includes("9812.png"));
});

test("Season 1935-36 has single Real Sporting and official Unión Sporting Club with valid crests", () => {
  const s1935 = getSeasonById("1935-36");
  assert.ok(s1935);
  const table = getStandings(s1935);
  assert.equal(table.length, 8, "1935-36 Group 1 had 8 teams");

  const sportings = table.filter((r) => r.isSporting || r.teamName === "Real Sporting");
  assert.equal(sportings.length, 1, "There must be exactly one Real Sporting in 1935-36");
  assert.equal(sportings[0]?.position, 3);
  assert.equal(sportings[0]?.points, 16);

  const unionSporting = table.find((r) => r.position === 8);
  assert.ok(unionSporting);
  assert.equal(unionSporting.teamName, "Unión Sporting Club");
  assert.equal(unionSporting.teamSlug, "union-sporting-club");
  assert.equal(unionSporting.isSporting, false);
  assert.ok(unionSporting.crestUrl?.includes("union-sporting-club.png"));

  const nacional = table.find((r) => r.teamSlug === "nacional-de-madrid");
  assert.ok(nacional);
  assert.equal(nacional.position, 6);
  assert.ok(nacional.crestUrl?.includes("nacional-de-madrid.jpg"));
});

test("100% full crest coverage is achieved across every team row in all 95 seasons", () => {
  const seasons = getAllSeasons();
  let totalRows = 0;
  let missingCrests = 0;

  for (const s of seasons) {
    const table = getStandings(s);
    for (const row of table) {
      totalRows++;
      if (!row.crestUrl) {
        missingCrests++;
      }
    }
  }

  assert.equal(totalRows, 1679, "Total team rows across 95 seasons must be 1,679");
  assert.equal(missingCrests, 0, "Zero rows can have missing crests (100.00% coverage)");
});

test("Chronological step-by-step navigation correctly resolves adjacent seasons and boundaries", () => {
  const seasons = getAllSeasons();
  const chronological = [...seasons].sort((a, b) => a.startYear - b.startYear);

  assert.equal(chronological[0]?.id, "1928-29");
  assert.equal(chronological[chronological.length - 1]?.id, "2025-26");

  // Oldest season boundary check (1928-29)
  const idx1928 = chronological.findIndex((s) => s.id === "1928-29");
  const prev1928 = idx1928 > 0 ? chronological[idx1928 - 1] : null;
  const next1928 = idx1928 < chronological.length - 1 ? chronological[idx1928 + 1] : null;
  assert.equal(prev1928, null, "1928-29 has no previous season");
  assert.equal(next1928?.id, "1929-30");

  // Newest season boundary check (2025-26)
  const idx2025 = chronological.findIndex((s) => s.id === "2025-26");
  const prev2025 = idx2025 > 0 ? chronological[idx2025 - 1] : null;
  const next2025 = idx2025 < chronological.length - 1 ? chronological[idx2025 + 1] : null;
  assert.equal(prev2025?.id, "2024-25");
  assert.equal(next2025, null, "2025-26 has no next season");

  // Civil War jump check (1935-36 -> 1939-40)
  const idx1935 = chronological.findIndex((s) => s.id === "1935-36");
  const next1935 = chronological[idx1935 + 1];
  assert.equal(next1935?.id, "1939-40", "Next official season after 1935-36 must be 1939-40");

  // 1978-79 subcampeonato neighbors check
  const idx1978 = chronological.findIndex((s) => s.id === "1978-79");
  assert.equal(chronological[idx1978 - 1]?.id, "1977-78");
  assert.equal(chronological[idx1978 + 1]?.id, "1979-80");
});

