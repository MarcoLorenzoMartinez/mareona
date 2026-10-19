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

  it("loads all 151 verified historical rivals in alphabetical order", () => {
    assert.equal(allRivals.length, 151);
    assert.equal(allRivals[0]?.name, "AD Ceuta FC");
    assert.equal(allRivals[allRivals.length - 1]?.name, "Zamora");
  });

  it("canonicalizes duplicate clubs and historical names into unified identities", () => {
    // Real Madrid absorbs 1932-33 II Republic "Madrid" matches
    const realMadrid = allRivals.find((r) => r.name === "Real Madrid");
    assert.ok(realMadrid);
    assert.equal(realMadrid.played, 107);
    assert.equal(realMadrid.won, 18);
    assert.equal(realMadrid.drawn, 28);
    assert.equal(realMadrid.lost, 61);
    assert.equal(realMadrid.goalsFor, 103);
    assert.equal(realMadrid.goalsAgainst, 226);

    // Real Sociedad absorbs 1932-33 II Republic "Donostia" matches
    const realSociedad = allRivals.find((r) => r.name === "Real Sociedad");
    assert.ok(realSociedad);
    assert.equal(realSociedad.played, 102);

    // Girona FC unifies Gerona and Girona
    const girona = allRivals.find((r) => r.name === "Girona FC");
    assert.ok(girona);
    assert.equal(girona.played, 21);
    assert.equal(girona.won, 11);
    assert.equal(girona.drawn, 5);
    assert.equal(girona.lost, 5);

    // Terrassa FC unifies Tarrasa and Terrassa
    const terrassa = allRivals.find((r) => r.name === "Terrassa FC");
    assert.ok(terrassa);
    assert.equal(terrassa.played, 16);
    assert.equal(terrassa.won, 7);

    // Gimnàstic de Tarragona unifies Gimnástico and Gimnàstic
    const nastic = allRivals.find((r) => r.name === "Gimnàstic de Tarragona");
    assert.ok(nastic);
    assert.equal(nastic.played, 18);
    assert.equal(nastic.won, 7);

    // Barakaldo CF unifies Baracaldo and Baracaldo Oriamendi
    const barakaldo = allRivals.find((r) => r.name === "Barakaldo CF");
    assert.ok(barakaldo);
    assert.equal(barakaldo.played, 34);

    // CD Ourense unifies Orense and Ourense
    const ourense = allRivals.find((r) => r.name === "CD Ourense");
    assert.ok(ourense);
    assert.equal(ourense.played, 18);

    // Unmerged duplicate names must no longer exist as standalone entries
    const duplicateNames = ["Madrid", "Donostia", "Gerona", "Tarrasa", "Gimnástico de Tarragona", "Baracaldo", "Orense", "Castilla"];
    for (const dup of duplicateNames) {
      assert.equal(allRivals.find((r) => r.name === dup), undefined, `${dup} must not exist as standalone rival`);
    }
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
    assert.ok(madridRivals.length >= 6, "Should match Real Madrid, Atlético, Rayo, Leganés, etc.");

    const uefaRivals = filterRivals(allRivals, "", "uefa");
    assert.equal(uefaRivals.length, 8, "Should find exactly 8 European rivals across 16 UEFA matches");
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
    assert.equal(spain.totalRivals, 141);

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

  it("contextually recalculates stats when filtering by Primera División", () => {
    const primeraRivals = filterRivals(allRivals, "Real Oviedo", "primera");
    assert.equal(primeraRivals.length, 1);
    const oviedo = primeraRivals[0]!;
    assert.equal(oviedo.played, 40, "Should only count 40 matches in Primera");
    assert.equal(oviedo.won, 8);
    assert.equal(oviedo.drawn, 13);
    assert.equal(oviedo.lost, 19);
    assert.equal(oviedo.goalsFor, 31);
    assert.equal(oviedo.goalsAgainst, 42);
    assert.equal(oviedo.goalDiff, -11);
    assert.equal(oviedo.winPercentage, 20);
    assert.equal(oviedo.matches.length, 40);
    assert.equal(oviedo.allMatches?.length, 105, "Preserves all 105 matches in allMatches");

    // Rivals who never played in Primera are excluded
    const torinoInPrimera = filterRivals(allRivals, "Torino", "primera");
    assert.equal(torinoInPrimera.length, 0);
  });

  it("contextually recalculates stats when filtering by Segunda División", () => {
    const segundaRivals = filterRivals(allRivals, "Real Oviedo", "segunda");
    assert.equal(segundaRivals.length, 1);
    const oviedo = segundaRivals[0]!;
    assert.equal(oviedo.played, 50, "Should only count 50 matches in Segunda");
    assert.equal(oviedo.won, 21);
    assert.equal(oviedo.drawn, 13);
    assert.equal(oviedo.lost, 16);
    assert.equal(oviedo.goalsFor, 75);
    assert.equal(oviedo.goalsAgainst, 66);
    assert.equal(oviedo.goalDiff, 9);
    assert.equal(oviedo.winPercentage, 42);
    assert.equal(oviedo.matches.length, 50);
  });

  it("contextually recalculates stats when filtering by Copa del Rey", () => {
    const copaRivals = filterRivals(allRivals, "Real Oviedo", "copa");
    assert.equal(copaRivals.length, 1);
    const oviedo = copaRivals[0]!;
    assert.equal(oviedo.played, 15, "14 Copa del Rey + 1 Copa Federación");
    assert.equal(oviedo.won, 7);
    assert.equal(oviedo.drawn, 1);
    assert.equal(oviedo.lost, 7);
    assert.equal(oviedo.goalsFor, 31);
    assert.equal(oviedo.goalsAgainst, 25);
  });
});
