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

  it("resolves 1968-1986 Segunda with top 3 direct promotions (no playoff)", () => {
    const season = createMockSeason({ tier: 2, startYear: 1969, totalTeams: 20 });

    assert.equal(resolveHistoricalZone(season, 1, 20), "promotion-direct");
    assert.equal(resolveHistoricalZone(season, 2, 20), "promotion-direct");
    assert.equal(resolveHistoricalZone(season, 3, 20), "promotion-direct");
    assert.equal(resolveHistoricalZone(season, 4, 20), "neutral");
    assert.equal(resolveHistoricalZone(season, 17, 20), "relegation");
  });

  it("resolves 1950-1967 Segunda with group champion direct and runner-up promotion playoff", () => {
    const season = createMockSeason({ tier: 2, startYear: 1966, totalTeams: 16 });

    assert.equal(resolveHistoricalZone(season, 1, 16), "promotion-direct");
    assert.equal(resolveHistoricalZone(season, 2, 16), "promotion-playoff");
    assert.equal(resolveHistoricalZone(season, 3, 16), "neutral");
    assert.equal(resolveHistoricalZone(season, 15, 16), "relegation");
  });

  it("resolves 1929-1932 early Segunda where ONLY position 1 is promoted to Primera", () => {
    const season = createMockSeason({ tier: 2, startYear: 1929, totalTeams: 10 });

    assert.equal(resolveHistoricalZone(season, 1, 10), "promotion-direct");
    assert.equal(resolveHistoricalZone(season, 2, 10), "neutral"); // Sporting subcampeon did NOT promote
    assert.equal(resolveHistoricalZone(season, 3, 10), "neutral");
    assert.equal(resolveHistoricalZone(season, 10, 10), "relegation");
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

    assert.equal(direct.barClass, "bg-[#16a34a]");
    assert.equal(playoff.barClass, "bg-[#2563eb]");
    assert.notEqual(direct.barClass, playoff.barClass);
  });

  it("assigns green to champion and direct promotion", () => {
    const champion = getZoneBadgeStyle("champion");
    const direct = getZoneBadgeStyle("promotion-direct");
    assert.equal(champion.barClass, "bg-[#16a34a]");
    assert.equal(direct.barClass, "bg-[#16a34a]");
  });

  it("assigns blue to Champions League and orange to Europa League / UEFA", () => {
    const ucl = getZoneBadgeStyle("champions-league");
    const uel = getZoneBadgeStyle("europa-league");
    const uefa = getZoneBadgeStyle("uefa");

    assert.equal(ucl.barClass, "bg-[#1d4ed8]");
    assert.equal(uel.barClass, "bg-[#ea580c]");
    assert.equal(uefa.barClass, "bg-[#ea580c]");
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
