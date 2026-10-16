import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveHistoricalZone,
  getZoneBadgeStyle,
  getZoneLegendItems,
} from "../../src/lib/historical/standings-zones.ts";
import type { HistoricalSeason } from "../../src/lib/historical/types.ts";

function createMockSeason(overrides: Partial<HistoricalSeason>): HistoricalSeason {
  return {
    id: "mock",
    label: "mock",
    startYear: 2023,
    endYear: 2024,
    tier: 2,
    tierName: "2.ª División",
    position: 5,
    totalTeams: 22,
    points: 65,
    pointsSystem: 3,
    played: 42,
    won: 18,
    drawn: 11,
    lost: 13,
    goalsFor: 51,
    goalsAgainst: 42,
    coach: "Miguel Ángel Ramírez",
    topScorer: "Gaspar Campos (10)",
    ...overrides,
  };
}

describe("resolveHistoricalZone", () => {
  it("resolves modern Segunda División (2010+) with direct promotion and playoff", () => {
    const season = createMockSeason({ tier: 2, startYear: 2023, totalTeams: 22 });

    assert.equal(resolveHistoricalZone(season, 1, 22), "promotion-direct");
    assert.equal(resolveHistoricalZone(season, 2, 22), "promotion-direct");
    assert.equal(resolveHistoricalZone(season, 3, 22), "promotion-playoff");
    assert.equal(resolveHistoricalZone(season, 5, 22), "promotion-playoff");
    assert.equal(resolveHistoricalZone(season, 6, 22), "promotion-playoff");
    assert.equal(resolveHistoricalZone(season, 7, 22), "neutral");
    assert.equal(resolveHistoricalZone(season, 18, 22), "neutral");
    assert.equal(resolveHistoricalZone(season, 19, 22), "relegation");
    assert.equal(resolveHistoricalZone(season, 22, 22), "relegation");
  });

  it("resolves 1999-2009 Segunda with top 3 direct promotion without playoff", () => {
    const season = createMockSeason({ tier: 2, startYear: 2007, totalTeams: 22 });

    assert.equal(resolveHistoricalZone(season, 1, 22), "promotion-direct");
    assert.equal(resolveHistoricalZone(season, 3, 22), "promotion-direct");
    assert.equal(resolveHistoricalZone(season, 4, 22), "neutral");
    assert.equal(resolveHistoricalZone(season, 19, 22), "relegation");
  });

  it("resolves 1987-1998 Segunda with top 2 direct and 3-4 promotion playoff", () => {
    const season = createMockSeason({ tier: 2, startYear: 1990, totalTeams: 20 });

    assert.equal(resolveHistoricalZone(season, 1, 20), "promotion-direct");
    assert.equal(resolveHistoricalZone(season, 2, 20), "promotion-direct");
    assert.equal(resolveHistoricalZone(season, 3, 20), "promotion-playoff");
    assert.equal(resolveHistoricalZone(season, 4, 20), "promotion-playoff");
    assert.equal(resolveHistoricalZone(season, 5, 20), "neutral");
    assert.equal(resolveHistoricalZone(season, 17, 20), "relegation");
  });

  it("resolves modern Primera División (2021+) with Champions, Europa, and Conference", () => {
    const season = createMockSeason({ tier: 1, startYear: 2022, totalTeams: 20, tierName: "1.ª División" });

    assert.equal(resolveHistoricalZone(season, 1, 20), "champion");
    assert.equal(resolveHistoricalZone(season, 2, 20), "champions-league");
    assert.equal(resolveHistoricalZone(season, 4, 20), "champions-league");
    assert.equal(resolveHistoricalZone(season, 5, 20), "europa-league");
    assert.equal(resolveHistoricalZone(season, 6, 20), "europa-league");
    assert.equal(resolveHistoricalZone(season, 7, 20), "conference-league");
    assert.equal(resolveHistoricalZone(season, 8, 20), "neutral");
    assert.equal(resolveHistoricalZone(season, 18, 20), "relegation");
    assert.equal(resolveHistoricalZone(season, 20, 20), "relegation");
  });

  it("resolves 1978-79 Primera with Sporting runner-up in UEFA Cup spot", () => {
    const season = createMockSeason({ tier: 1, startYear: 1978, totalTeams: 18, tierName: "1.ª División" });

    assert.equal(resolveHistoricalZone(season, 1, 18), "champion");
    assert.equal(resolveHistoricalZone(season, 2, 18), "uefa");
    assert.equal(resolveHistoricalZone(season, 4, 18), "uefa");
    assert.equal(resolveHistoricalZone(season, 5, 18), "neutral");
    assert.equal(resolveHistoricalZone(season, 16, 18), "relegation");
  });
});

describe("getZoneBadgeStyle", () => {
  it("assigns distinct colors for direct promotion vs playoff", () => {
    const direct = getZoneBadgeStyle("promotion-direct");
    const playoff = getZoneBadgeStyle("promotion-playoff");

    assert.match(direct.badgeClass, /bg-emerald-600/);
    assert.match(playoff.badgeClass, /bg-emerald-100/);
    assert.match(playoff.badgeClass, /text-emerald-900/);
    assert.notEqual(direct.badgeClass, playoff.badgeClass);
  });

  it("assigns blue to Champions League and orange to Europa League / UEFA", () => {
    const ucl = getZoneBadgeStyle("champions-league");
    const uel = getZoneBadgeStyle("europa-league");
    const uefa = getZoneBadgeStyle("uefa");

    assert.match(ucl.badgeClass, /bg-blue-600/);
    assert.match(uel.badgeClass, /bg-orange-600/);
    assert.match(uefa.badgeClass, /bg-orange-600/);
  });
});

describe("getZoneLegendItems", () => {
  it("generates promotion, playoff, and relegation for modern Segunda", () => {
    const season = createMockSeason({ tier: 2, startYear: 2023 });
    const items = getZoneLegendItems(season);

    assert.deepEqual(
      items.map((i) => i.label),
      ["Ascenso directo", "Playoff de ascenso", "Descenso"]
    );
  });

  it("generates European spots legend for modern Primera", () => {
    const season = createMockSeason({ tier: 1, startYear: 2023, tierName: "1.ª División" });
    const items = getZoneLegendItems(season);

    assert.ok(items.some((i) => i.label === "Champions League"));
    assert.ok(items.some((i) => i.label === "Europa League"));
    assert.ok(items.some((i) => i.label === "Conference League"));
    assert.ok(items.some((i) => i.label === "Descenso"));
  });
});
