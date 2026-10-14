import test from "node:test";
import assert from "node:assert/strict";
import {
  espnRosterResponseSchema,
  transformEspnAthlete,
} from "../../src/lib/sports-api/espn.ts";
import {
  mapEspnPosition,
  mapPositionToLabel,
  mapPositionToShort,
  groupSquadByPosition,
  type DomainPlayer,
} from "../../src/lib/sports-api/types.ts";

test("mapEspnPosition maps positions correctly", () => {
  assert.equal(mapEspnPosition("Goalkeeper"), "goalkeeper");
  assert.equal(mapEspnPosition("G"), "goalkeeper");
  assert.equal(mapEspnPosition("Defender"), "defender");
  assert.equal(mapEspnPosition("Center Back"), "defender");
  assert.equal(mapEspnPosition("Midfielder"), "midfielder");
  assert.equal(mapEspnPosition("Attacking Midfielder"), "midfielder");
  assert.equal(mapEspnPosition("Forward"), "forward");
  assert.equal(mapEspnPosition("Striker"), "forward");
  assert.equal(mapEspnPosition(null), "midfielder");
});

test("mapPositionToLabel and mapPositionToShort return canonical Spanish labels and acronyms", () => {
  assert.equal(mapPositionToLabel("goalkeeper"), "Portero");
  assert.equal(mapPositionToShort("goalkeeper"), "POR");

  assert.equal(mapPositionToLabel("defender"), "Defensa");
  assert.equal(mapPositionToShort("defender"), "DEF");

  assert.equal(mapPositionToLabel("midfielder"), "Centrocampista");
  assert.equal(mapPositionToShort("midfielder"), "MED");

  assert.equal(mapPositionToLabel("forward"), "Delantero");
  assert.equal(mapPositionToShort("forward"), "DEL");
});

test("espnRosterResponseSchema parses valid ESPN roster sample", () => {
  const samplePayload = {
    status: "success",
    athletes: [
      {
        id: "192718",
        fullName: "Rubén Yáñez",
        displayName: "Rubén Yáñez",
        shortName: "R. Yáñez",
        jersey: "1",
        age: 33,
        dateOfBirth: "1993-10-12T07:00Z",
        citizenship: "Spain",
        flag: {
          href: "https://a.espncdn.com/i/teamlogos/countries/500/esp.png",
          alt: "Spain",
        },
        position: {
          id: "1",
          name: "Goalkeeper",
          displayName: "Goalkeeper",
          abbreviation: "G",
        },
        statistics: {
          splits: {
            categories: [
              {
                name: "general",
                stats: [
                  { name: "appearances", value: 9 },
                  { name: "yellowCards", value: 1 },
                  { name: "redCards", value: 0 },
                ],
              },
            ],
          },
        },
      },
    ],
  };

  const parsed = espnRosterResponseSchema.safeParse(samplePayload);
  assert.equal(parsed.success, true);

  if (parsed.success) {
    const player = transformEspnAthlete(parsed.data.athletes[0]);
    assert.equal(player.externalId, "192718");
    assert.equal(player.fullName, "Rubén Yáñez");
    assert.equal(player.shirtNumber, 1);
    assert.equal(player.position, "goalkeeper");
    assert.equal(player.positionLabel, "Portero");
    assert.equal(player.positionShort, "POR");
    assert.equal(player.age, 33);
    assert.equal(player.nationality, "Spain");
    assert.equal(player.stats.appearances, 9);
    assert.equal(player.photoUrl, "/images/players/1.png");
  }
});

test("groupSquadByPosition categorizes players into tactical sections ordered by dorsal", () => {
  const players: DomainPlayer[] = [
    {
      id: "p13",
      externalId: "13",
      fullName: "Egoitz Arana",
      displayName: "E. Arana",
      shortName: "E. Arana",
      shirtNumber: 13,
      position: "goalkeeper",
      positionLabel: "Portero",
      positionShort: "POR",
      age: 23,
      birthDate: null,
      nationality: "Spain",
      flagUrl: null,
      photoUrl: null,
      height: null,
      weight: null,
      stats: { appearances: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
    },
    {
      id: "p1",
      externalId: "1",
      fullName: "Rubén Yáñez",
      displayName: "Rubén Yáñez",
      shortName: "R. Yáñez",
      shirtNumber: 1,
      position: "goalkeeper",
      positionLabel: "Portero",
      positionShort: "POR",
      age: 33,
      birthDate: null,
      nationality: "Spain",
      flagUrl: null,
      photoUrl: null,
      height: null,
      weight: null,
      stats: { appearances: 9, goals: 0, assists: 0, yellowCards: 1, redCards: 0 },
    },
    {
      id: "p2",
      externalId: "2",
      fullName: "Guillermo Rosas",
      displayName: "Guille Rosas",
      shortName: "G. Rosas",
      shirtNumber: 2,
      position: "defender",
      positionLabel: "Defensa",
      positionShort: "DEF",
      age: 24,
      birthDate: null,
      nationality: "Spain",
      flagUrl: null,
      photoUrl: null,
      height: null,
      weight: null,
      stats: { appearances: 9, goals: 1, assists: 1, yellowCards: 2, redCards: 0 },
    },
    {
      id: "p9",
      externalId: "9",
      fullName: "Andrés Ferrari",
      displayName: "Ferrari",
      shortName: "Ferrari",
      shirtNumber: 9,
      position: "forward",
      positionLabel: "Delantero",
      positionShort: "DEL",
      age: 22,
      birthDate: null,
      nationality: "Uruguay",
      flagUrl: null,
      photoUrl: null,
      height: null,
      weight: null,
      stats: { appearances: 8, goals: 2, assists: 0, yellowCards: 0, redCards: 0 },
    },
  ];

  const grouped = groupSquadByPosition(players);

  assert.equal(grouped.goalkeepers.length, 2);
  assert.equal(grouped.goalkeepers[0].shirtNumber, 1);
  assert.equal(grouped.goalkeepers[1].shirtNumber, 13);

  assert.equal(grouped.defenders.length, 1);
  assert.equal(grouped.defenders[0].shirtNumber, 2);

  assert.equal(grouped.midfielders.length, 0);

  assert.equal(grouped.forwards.length, 1);
  assert.equal(grouped.forwards[0].shirtNumber, 9);
});

test("transformEspnAthlete applies canonical overrides for jersey 6 Nacho Martín", () => {
  const flawedEspnPayload = {
    id: "311586",
    fullName: "Nacho Martínez",
    displayName: "Nacho Martínez",
    shortName: "N. Martínez",
    jersey: "6",
    age: 36,
    dateOfBirth: "1989-03-07T08:00Z",
    citizenship: "Spain",
    position: {
      id: "19",
      name: "Forward",
      displayName: "Forward",
      abbreviation: "F",
    },
    statistics: {
      splits: {
        categories: [],
      },
    },
  };

  const player = transformEspnAthlete(flawedEspnPayload);
  assert.equal(player.shirtNumber, 6);
  assert.equal(player.fullName, "Nacho Martín");
  assert.equal(player.displayName, "Nacho Martín");
  assert.equal(player.position, "midfielder");
  assert.equal(player.positionLabel, "Centrocampista");
  assert.equal(player.positionShort, "MED");
  assert.equal(player.age, 24);
  assert.equal(player.birthDate, "2002-03-19");
});
