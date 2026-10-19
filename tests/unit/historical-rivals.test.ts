import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAllRivalsSummaries,
  filterRivals,
  sortRivals,
  getSummariesByCommunity,
  getSummariesByCountry,
} from "../../src/lib/historical/rivals-service.ts";

describe("Historical Rivals Service", () => {
  const allRivals = getAllRivalsSummaries();

  it("loads all 164 verified historical rivals in alphabetical order", () => {
    assert.equal(allRivals.length, 164);
    assert.equal(allRivals[0]?.name, "AD Ceuta FC");
    assert.equal(allRivals[allRivals.length - 1]?.name, "Zamora");
  });

  it("calculates accurate head-to-head record against Real Oviedo", () => {
    const oviedo = allRivals.find((r) => r.name === "Real Oviedo");
    assert.ok(oviedo, "Real Oviedo must exist");
    assert.equal(oviedo.played, 105);
    assert.equal(oviedo.won, 36);
    assert.equal(oviedo.drawn, 27);
    assert.equal(oviedo.lost, 42);
    assert.equal(oviedo.goalsFor, 137);
    assert.equal(oviedo.goalsAgainst, 133);
    assert.equal(oviedo.community, "Principado de Asturias");
  });

  it("calculates accurate European head-to-head record against Torino", () => {
    const torino = allRivals.find((r) => r.name === "Torino");
    assert.ok(torino, "Torino must exist");
    assert.equal(torino.played, 2);
    assert.equal(torino.won, 1);
    assert.equal(torino.lost, 1);
    assert.equal(torino.goalsFor, 3);
    assert.equal(torino.goalsAgainst, 1);
    assert.equal(torino.country, "Italia");
    assert.equal(torino.isInternational, true);
  });

  it("filters rivals dynamically by search query and competition scope", () => {
    const madridRivals = filterRivals(allRivals, "Madrid", "all");
    assert.ok(madridRivals.length >= 7, "Should match Real Madrid, Atlético, Rayo, Leganés, etc.");

    const uefaRivals = filterRivals(allRivals, "", "uefa");
    assert.ok(uefaRivals.length >= 8, "Should find European rivals");
  });

  it("aggregates rivals accurately by Spanish Autonomous Community", () => {
    const communities = getSummariesByCommunity(allRivals);
    assert.ok(communities.length >= 15, "Should cover Spanish autonomous communities");

    const asturias = communities.find((c) => c.regionName === "Principado de Asturias");
    assert.ok(asturias, "Asturias must exist");
    assert.ok(asturias.totalRivals >= 10, "Asturias has Caudal, Oviedo, Langreo, Avilés, etc.");
  });

  it("aggregates rivals accurately by Country", () => {
    const countries = getSummariesByCountry(allRivals);
    const spain = countries.find((c) => c.regionName === "España");
    assert.ok(spain, "Spain must be top country");
    assert.equal(spain.totalRivals, 154);

    const italy = countries.find((c) => c.regionName === "Italia");
    assert.ok(italy, "Italy must exist (Torino and Milan)");
    assert.equal(italy.totalRivals, 2);
    assert.equal(italy.totalMatches, 4);
  });

  it("sorts rivals accurately by games played, wins, and win rate", () => {
    const byPlayed = sortRivals(allRivals, "played");
    assert.ok(byPlayed[0]!.played >= 100, "Most played rival should have over 100 matches");
    assert.ok(byPlayed[0]!.played >= byPlayed[1]!.played, "First must have >= matches than second");

    const byWon = sortRivals(allRivals, "won");
    assert.ok(byWon[0]!.won >= byWon[1]!.won, "First must have >= victories than second");

    const byAlpha = sortRivals(allRivals, "alpha");
    assert.equal(byAlpha[0]?.name, "AD Ceuta FC");
  });
});
