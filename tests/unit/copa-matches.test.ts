import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mapFotMobCopaFixtureToDomain,
  type FotMobTeamFixtureItem,
} from "../../src/lib/sports-api/copa.ts";

describe("Copa del Rey Match Mapping", () => {
  it("maps scheduled away Copa match to canonical DomainMatchSummary", () => {
    const rawFixture: FotMobTeamFixtureItem = {
      id: 4567890,
      home: { id: 2840, name: "CD Guijuelo" },
      away: { id: 9869, name: "Sporting Gijon" },
      tournament: { name: "Copa del Rey", leagueId: 138 },
      status: {
        utcTime: "2026-10-29T19:00:00.000Z",
        started: false,
        finished: false,
      },
    };

    const domain = mapFotMobCopaFixtureToDomain(rawFixture);

    assert.equal(domain.externalId, "4567890");
    assert.equal(domain.competition, "Copa del Rey");
    assert.equal(domain.matchday, null);
    assert.equal(domain.status, "scheduled");
    assert.equal(domain.homeScore, null);
    assert.equal(domain.awayScore, null);
    assert.equal(domain.isTimeConfirmed, true);

    // Away team Sporting is normalized
    assert.equal(domain.awayTeam.name, "Real Sporting");
    assert.equal(domain.awayTeam.isSporting, true);
    assert.equal(domain.homeTeam.name, "CD Guijuelo");
    assert.equal(domain.homeTeam.isSporting, false);
  });

  it("maps live and finished Copa matches with scores properly", () => {
    const liveFixture: FotMobTeamFixtureItem = {
      id: 4567891,
      home: { id: 9869, name: "Real Sporting", score: 2 },
      away: { id: 2840, name: "CD Guijuelo", score: 1 },
      tournament: { name: "Copa del Rey", leagueId: 138 },
      status: {
        utcTime: "2026-10-29T19:00:00.000Z",
        started: true,
        finished: false,
      },
    };

    const liveDomain = mapFotMobCopaFixtureToDomain(liveFixture);
    assert.equal(liveDomain.status, "live");
    assert.equal(liveDomain.homeScore, 2);
    assert.equal(liveDomain.awayScore, 1);
    assert.equal(liveDomain.homeTeam.isSporting, true);

    const finishedFixture: FotMobTeamFixtureItem = {
      ...liveFixture,
      status: {
        utcTime: "2026-10-29T19:00:00.000Z",
        started: true,
        finished: true,
      },
    };

    const finishedDomain = mapFotMobCopaFixtureToDomain(finishedFixture);
    assert.equal(finishedDomain.status, "finished");
    assert.equal(finishedDomain.homeScore, 2);
    assert.equal(finishedDomain.awayScore, 1);
  });
});
