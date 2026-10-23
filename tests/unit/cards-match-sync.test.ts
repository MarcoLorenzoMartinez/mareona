import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isOfficialCompetition,
  extractParticipatingPlayers,
  computeMatchSyncUpdates,
  applySyncToMemoryCatalog,
} from "../../src/lib/cards/sync-matches.ts";
import { resolveCardSlugForPlayer } from "../../src/lib/cards/match-card-resolver.ts";
import type { DomainMatchDetail, DomainLineupPlayer } from "../../src/lib/sports-api/types.ts";
import type { Card } from "../../src/lib/cards/types.ts";

describe("Cards Finished Matches Sync Suite", () => {
  it("recognizes official competitions (Segunda & Copa del Rey) and filters out friendlies", () => {
    assert.equal(isOfficialCompetition("LALIGA HYPERMOTION"), true);
    assert.equal(isOfficialCompetition("Segunda División"), true);
    assert.equal(isOfficialCompetition("LaLiga 2"), true);
    assert.equal(isOfficialCompetition("Copa del Rey"), true);
    assert.equal(isOfficialCompetition("Copa de S.M. El Rey"), true);

    assert.equal(isOfficialCompetition("Amistoso"), false);
    assert.equal(isOfficialCompetition("Club Friendly"), false);
    assert.equal(isOfficialCompetition("Trofeo Villa de Gijón"), false);
    assert.equal(isOfficialCompetition("Trofeo Ramón Losada"), false);
  });

  it("extracts only participating players (starters and subbed-in, excluding bench without minutes)", () => {
    const starterPlayer: DomainLineupPlayer = {
      id: "p1",
      name: "Guille Rosas",
      shortName: "G. Rosas",
      jersey: 2,
      position: "defender",
      positionLabel: "Lateral",
      formationPlace: 2,
      isStarter: true,
      subbedIn: false,
      subbedOut: false,
    };

    const subbedInPlayer: DomainLineupPlayer = {
      id: "p2",
      name: "César Gelabert",
      shortName: "Gelabert",
      jersey: 22,
      position: "midfielder",
      positionLabel: "Centrocampista",
      formationPlace: null,
      isStarter: false,
      subbedIn: true,
      subbedOut: false,
    };

    const unusedSubPlayer: DomainLineupPlayer = {
      id: "p3",
      name: "Christian Joel",
      shortName: "C. Joel",
      jersey: 13,
      position: "goalkeeper",
      positionLabel: "Portero",
      formationPlace: null,
      isStarter: false,
      subbedIn: false,
      subbedOut: false,
    };

    const mockMatch: DomainMatchDetail = {
      externalId: "match-101",
      competition: "LALIGA HYPERMOTION",
      season: "2024-25",
      matchday: 12,
      kickoffAt: "2024-11-01T15:15:00Z",
      status: "finished",
      isTimeConfirmed: true,
      venue: { name: "El Molinón", city: "Gijón" },
      attendance: 21500,
      homeTeam: {
        externalId: "9869",
        name: "Real Sporting",
        crestUrl: null,
        isSporting: true,
      },
      awayTeam: {
        externalId: "1002",
        name: "Cádiz CF",
        crestUrl: null,
        isSporting: false,
      },
      homeScore: 2,
      awayScore: 0,
      events: [],
      statGroups: [],
      homeLineup: {
        teamId: "9869",
        teamName: "Real Sporting",
        isSporting: true,
        formation: "4-2-3-1",
        starters: [starterPlayer],
        substitutes: [subbedInPlayer, unusedSubPlayer],
      },
      awayLineup: null,
    };

    const participants = extractParticipatingPlayers(mockMatch);
    assert.equal(participants.length, 2);
    assert.equal(participants.some((p) => p.name === "Guille Rosas"), true);
    assert.equal(participants.some((p) => p.name === "César Gelabert"), true);
    assert.equal(participants.some((p) => p.name === "Christian Joel"), false);
  });

  it("resolves active Sporting players to their canonical card slugs", () => {
    assert.equal(resolveCardSlugForPlayer({ name: "Guillermo Rosas Alonso", jersey: 2 }), "guille-rosas-2019");
    assert.equal(resolveCardSlugForPlayer({ name: "César Gelabert Piña", jersey: 22 }), "cesar-gelabert-2024");
    assert.equal(resolveCardSlugForPlayer({ name: "José Ángel Valdés", jersey: 3 }), "cote-2008");
    assert.equal(resolveCardSlugForPlayer({ name: "Nacho Méndez", jersey: 10 }), "nacho-mendez-2017");
    assert.equal(resolveCardSlugForPlayer({ name: "Nacho Martín", jersey: 6 }), "nacho-martin-2021");
    assert.equal(resolveCardSlugForPlayer({ name: "Gaspar Campos", jersey: 7 }), "gaspar-campos-2019");
    assert.equal(resolveCardSlugForPlayer({ name: "Rubén Yáñez", jersey: 1 }), "ruben-yanez-2023");
    assert.equal(resolveCardSlugForPlayer({ name: "Desconocido Sin Ficha", jersey: 99 }), null);
  });

  it("enforces strict idempotency: skips already processed matches", () => {
    const mockMatch: DomainMatchDetail = {
      externalId: "match-already-synced",
      competition: "LALIGA HYPERMOTION",
      season: "2024-25",
      matchday: 10,
      kickoffAt: "2024-10-20T17:30:00Z",
      status: "finished",
      isTimeConfirmed: true,
      venue: null,
      attendance: null,
      homeTeam: { externalId: "9869", name: "Real Sporting", crestUrl: null, isSporting: true },
      awayTeam: { externalId: "9999", name: "SD Huesca", crestUrl: null, isSporting: false },
      homeScore: 2,
      awayScore: 1,
      events: [],
      statGroups: [],
      homeLineup: {
        teamId: "9869",
        teamName: "Real Sporting",
        isSporting: true,
        formation: "4-3-3",
        starters: [{
          id: "p1",
          name: "Guille Rosas",
          shortName: "G. Rosas",
          jersey: 2,
          position: "defender",
          positionLabel: "Lateral",
          formationPlace: 2,
          isStarter: true,
        }],
        substitutes: [],
      },
      awayLineup: null,
    };

    const syncedSet = new Set(["match-already-synced"]);
    const updateResult = computeMatchSyncUpdates(mockMatch, syncedSet);
    assert.equal(updateResult.skipped, true);
    assert.equal(updateResult.reason, "already_synced");
    assert.equal(updateResult.updatedSlugs.length, 0);
  });

  it("increments PJ in memory cards while preserving OVR, ATQ and DEF balance", () => {
    const mockCard: Card = {
      id: "card-guille-uuid",
      slug: "guille-rosas-2019",
      fullName: "Guillermo Rosas Alonso",
      knownAs: "Guille Rosas",
      decade: "2020s",
      eraLabel: "2019 - 2027",
      position: "defender",
      matchesPlayed: 202,
      defensePower: 84,
      attackPower: 78,
      ovr: 85,
      photoUrl: "/images/cards/historical/bdf-22624.jpg",
      historicalCrestUrl: null,
      historicalCrestEra: "modern",
      bioSnippet: "Lateral derecho titular indiscutible.",
      year: 2019,
      isActive: true,
    };

    const updates = [
      {
        matchId: "match-new-1",
        competition: "LALIGA HYPERMOTION",
        skipped: false as const,
        updatedSlugs: ["guille-rosas-2019"],
        playerMatchesDelta: { "guille-rosas-2019": 1 },
      },
    ];

    const [updatedCard] = applySyncToMemoryCatalog([mockCard], updates);
    assert.ok(updatedCard);
    assert.equal(updatedCard.matchesPlayed, 203);
    assert.equal(updatedCard.ovr, 85);
    assert.equal(updatedCard.defensePower, 84);
    assert.equal(updatedCard.attackPower, 78);
  });
});
