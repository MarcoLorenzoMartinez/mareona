import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFotMobPlayerProfile } from "../../src/lib/sports-api/fotmob-player-profile-parser.ts";

test("parseFotMobPlayerProfile maps biometrics, positions, heatmap, and recent matches correctly", () => {
  const sampleData = {
    id: 1120109,
    name: "Guille Rosas",
    birthDate: { utcTime: "2000-05-17T00:00:00.000Z" },
    playerInformation: [
      { title: "Height", value: { fallback: "175 cm" } },
      { title: "Shirt", value: { fallback: 2 } },
      { title: "Age", value: { fallback: "26" } },
      { title: "Preferred foot", value: { key: "right", fallback: "Right" } },
      { title: "Country", value: { fallback: "Spain" }, countryCode: "ESP" },
      { title: "Market value", value: { fallback: "€1.7m" } },
      { title: "Contract end", value: { fallback: { utcTime: "2028-06-30T00:00:00.000Z" } } },
    ],
    positionDescription: {
      primaryPosition: { label: "Right Back", key: "rightback" },
      positions: [
        {
          strPos: { label: "Right Back" },
          strPosShort: { label: "RB" },
          occurences: 33,
          isMainPosition: true,
          pitchPositionData: { right: 0.83, top: 0.74 },
        },
      ],
    },
    firstSeasonStats: {
      heatmap: {
        coordinates: [
          { x: 24.09, y: 58.03 },
          { x: 83.61, y: 24.7 },
        ],
      },
      statsSection: {
        items: [
          {
            title: "Defending",
            items: [
              { title: "Tackles", statValue: "31", per90: 3.52, percentileRank: 97.5 },
            ],
          },
        ],
      },
    },
    recentMatches: [
      {
        id: 5868484,
        matchDate: { utcTime: "2026-10-11T19:00:00.000Z" },
        opponentTeamName: "Cádiz",
        opponentTeamId: 8385,
        isHomeTeam: false,
        homeScore: 0,
        awayScore: 1,
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        ratingProps: { rating: "7.7", isTopRating: false },
        playedInMatch: true,
      },
      {
        id: 4837604,
        matchDate: { utcTime: "2025-10-19T14:15:00.000Z" },
        opponentTeamName: "Real Valladolid",
        opponentTeamId: 10281,
        isHomeTeam: false,
        homeScore: 2,
        awayScore: 3,
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        ratingProps: { rating: "7.4", isTopRating: false },
        playedInMatch: true,
      },
    ],
  };

  const parsed = parseFotMobPlayerProfile(sampleData);

  assert.equal(parsed.fotmobId, 1120109);
  assert.equal(parsed.name, "Guille Rosas");
  assert.equal(parsed.shirtNumber, 2);
  assert.equal(parsed.biometrics.preferredFoot, "Diestro");
  assert.equal(parsed.biometrics.height, "175 cm");
  assert.equal(parsed.biometrics.age, 26);
  assert.equal(parsed.biometrics.country, "España");
  assert.equal(parsed.biometrics.countryCode, "ESP");
  assert.equal(parsed.biometrics.contractEnd, "Hasta 2028");

  assert.equal(parsed.positions.primaryPosition, "Lateral Derecho");
  assert.equal(parsed.positions.allPositions.length, 1);
  assert.equal(parsed.positions.allPositions[0]?.isMain, true);
  assert.equal(parsed.positions.allPositions[0]?.shortLabel, "LD");
  assert.equal(parsed.positions.allPositions[0]?.pitchCoordinates?.xPercent, 83);
  assert.equal(parsed.positions.allPositions[0]?.pitchCoordinates?.yPercent, 74);

  assert.equal(parsed.heatmap.length, 2);
  assert.equal(parsed.statsGroups.length, 1);
  assert.equal(parsed.statsGroups[0]?.title, "Defensa");
  assert.equal(parsed.statsGroups[0]?.items[0]?.title, "Entradas con éxito");

  assert.equal(parsed.recentMatches.length, 1);
  assert.equal(parsed.recentMatches[0]?.opponentName, "Cádiz");
  assert.equal(parsed.recentMatches[0]?.result, "W");
  assert.equal(parsed.recentMatches[0]?.rating, 7.7);
});

test("mergePlayerSeasonMatches merges unplayed fixtures and sorts ascending", async () => {
  const { mergePlayerSeasonMatches } = await import(
    "../../src/lib/sports-api/fotmob-player-fixtures-merger.ts"
  );

  const teamFixtures = [
    {
      id: 5868484,
      status: { utcTime: "2026-10-11T19:00:00.000Z", finished: true },
      tournament: { name: "LaLiga2" },
      home: { id: 8385, name: "Cádiz", score: 0 },
      away: { id: 9869, name: "Sporting Gijón", score: 1 },
    },
    {
      id: 5868403,
      status: { utcTime: "2026-08-17T17:00:00.000Z", finished: true },
      tournament: { name: "LaLiga2" },
      home: { id: 9869, name: "Sporting Gijón", score: 0 },
      away: { id: 2024, name: "Sabadell", score: 0 },
    },
    {
      // Amistoso: debe ser ignorado
      id: 5960990,
      status: { utcTime: "2026-07-25T17:00:00.000Z", finished: true },
      tournament: { name: "Club Friendlies" },
      home: { id: 9869, name: "Sporting Gijón", score: 0 },
      away: { id: 8385, name: "Celta Vigo", score: 1 },
    },
  ];

  const playerMatches = [
    {
      matchId: 5868484,
      date: "2026-10-11T19:00:00.000Z",
      opponentName: "Cádiz",
      opponentTeamId: 8385,
      isHome: false,
      homeScore: 0,
      awayScore: 1,
      result: "W" as const,
      minutesPlayed: 80,
      goals: 1,
      assists: 1,
      yellowCards: 0,
      redCards: 0,
      rating: 7.8,
      isTopRating: false,
      onBench: false,
      playedInMatch: true,
    },
  ];

  const merged = mergePlayerSeasonMatches(teamFixtures, playerMatches);

  // Amistoso excluido, quedan los 2 partidos oficiales
  assert.equal(merged.length, 2);

  // Orden cronológico ascendente: 17 de agosto antes que 11 de octubre
  assert.equal(merged[0]?.matchId, 5868403);
  assert.equal(merged[0]?.opponentName, "Sabadell");
  assert.equal(merged[0]?.playedInMatch, false);
  assert.equal(merged[0]?.rating, null);
  assert.equal(merged[0]?.minutesPlayed, 0);

  // Segundo partido jugado con sus estadísticas intactas
  assert.equal(merged[1]?.matchId, 5868484);
  assert.equal(merged[1]?.opponentName, "Cádiz");
  assert.equal(merged[1]?.playedInMatch, true);
  assert.equal(merged[1]?.rating, 7.8);
  assert.equal(merged[1]?.goals, 1);
  assert.equal(merged[1]?.assists, 1);
});

test("mergePlayerSeasonMatches matches by date when IDs differ", async () => {
  const { mergePlayerSeasonMatches } = await import(
    "../../src/lib/sports-api/fotmob-player-fixtures-merger.ts"
  );

  const teamFixtures = [
    {
      id: 999999,
      status: { utcTime: "2026-10-11T19:00:00.000Z", finished: true },
      tournament: { name: "LaLiga2" },
      home: { id: 8385, name: "Cádiz", score: 0 },
      away: { id: 9869, name: "Sporting Gijón", score: 1 },
    },
  ];

  const playerMatches = [
    {
      matchId: 5868484,
      date: "2026-10-11T19:00:00.000Z",
      opponentName: "Cádiz",
      opponentTeamId: 8385,
      isHome: false,
      homeScore: 0,
      awayScore: 1,
      result: "W" as const,
      minutesPlayed: 80,
      goals: 1,
      assists: 1,
      yellowCards: 0,
      redCards: 0,
      rating: 7.8,
      isTopRating: false,
      onBench: false,
      playedInMatch: true,
    },
  ];

  const merged = mergePlayerSeasonMatches(teamFixtures, playerMatches);
  assert.equal(merged.length, 1);
  assert.equal(merged[0]?.matchId, 5868484);
  assert.equal(merged[0]?.playedInMatch, true);
  assert.equal(merged[0]?.minutesPlayed, 80);
});

test("parseFotMobPlayerProfile applies default coordinates for secondary positions when pitchPositionData is null", async () => {
  const { parseFotMobPlayerProfile } = await import(
    "../../src/lib/sports-api/fotmob-player-profile-parser.ts"
  );

  const raw = {
    id: 1091369,
    name: "Pablo García",
    positionDescription: {
      primaryPosition: { label: "Left Midfielder" },
      positions: [
        {
          strPos: { label: "Left Midfielder" },
          isMainPosition: true,
          pitchPositionData: { right: 0.17, top: 0.42 },
        },
        {
          strPos: { label: "Left Back" },
          isMainPosition: false,
          pitchPositionData: null,
        },
      ],
    },
  };

  const parsed = parseFotMobPlayerProfile(raw as unknown as import("../../src/lib/sports-api/fotmob-player-profile-types.ts").FotMobRawPlayerData);

  // Posición principal en banda izquierda
  assert.equal(parsed.positions.allPositions[0]?.shortLabel, "MI");
  assert.equal(parsed.positions.allPositions[0]?.pitchCoordinates?.xPercent, 17);
  assert.equal(parsed.positions.allPositions[0]?.pitchCoordinates?.yPercent, 42);

  // Posición secundaria con fallback táctico en banda izquierda
  assert.equal(parsed.positions.allPositions[1]?.shortLabel, "LI");
  assert.equal(parsed.positions.allPositions[1]?.isMain, false);
  assert.equal(parsed.positions.allPositions[1]?.pitchCoordinates?.xPercent, 17);
  assert.equal(parsed.positions.allPositions[1]?.pitchCoordinates?.yPercent, 74);
});

test("translatePlayerStatTitle and translatePlayerStatGroupTitle localize metrics into Spanish", async () => {
  const { translatePlayerStatTitle, translatePlayerStatGroupTitle } = await import(
    "../../src/lib/sports-api/fotmob-player-stats-translations.ts"
  );

  // Categorías
  assert.equal(translatePlayerStatGroupTitle("shooting"), "Remates");
  assert.equal(translatePlayerStatGroupTitle("passing"), "Pases");
  assert.equal(translatePlayerStatGroupTitle("possession"), "Posesión");
  assert.equal(translatePlayerStatGroupTitle("defending"), "Defensa");
  assert.equal(translatePlayerStatGroupTitle("discipline"), "Disciplina");
  assert.equal(translatePlayerStatGroupTitle("goalkeeping"), "Portería");

  // Métricas de remate
  assert.equal(translatePlayerStatTitle("Goals"), "Goles");
  assert.equal(translatePlayerStatTitle("xG"), "Goles esperados (xG)");
  assert.equal(translatePlayerStatTitle("xGOT"), "xG a puerta (xGOT)");
  assert.equal(translatePlayerStatTitle("xG excl. penalty"), "xG sin penaltis");
  assert.equal(translatePlayerStatTitle("Shots"), "Tiros totales");
  assert.equal(translatePlayerStatTitle("Shots on target"), "Tiros a puerta");

  // Métricas de pase
  assert.equal(translatePlayerStatTitle("Assists"), "Asistencias");
  assert.equal(translatePlayerStatTitle("xA"), "Asistencias esperadas (xA)");
  assert.equal(translatePlayerStatTitle("Accurate passes"), "Pases precisos");
  assert.equal(translatePlayerStatTitle("Pass accuracy"), "Precisión de pases (%)");
  assert.equal(translatePlayerStatTitle("Accurate long balls"), "Balones largos precisos");
  assert.equal(translatePlayerStatTitle("Line-breaking passes"), "Pases entre líneas");
  assert.equal(translatePlayerStatTitle("Chances created"), "Ocasiones creadas");
  assert.equal(translatePlayerStatTitle("Big chances created"), "Grandes ocasiones creadas");
  assert.equal(translatePlayerStatTitle("Successful crosses"), "Centros completados");

  // Métricas de posesión
  assert.equal(translatePlayerStatTitle("Dribbles"), "Regates");
  assert.equal(translatePlayerStatTitle("Dribbles success rate"), "Éxito en regates (%)");
  assert.equal(translatePlayerStatTitle("Duels won"), "Duelos ganados");
  assert.equal(translatePlayerStatTitle("Duels won %"), "Duelos ganados (%)");
  assert.equal(translatePlayerStatTitle("Aerials won"), "Duelos aéreos ganados");
  assert.equal(translatePlayerStatTitle("Touches"), "Toques");
  assert.equal(translatePlayerStatTitle("Touches in opposition box"), "Toques en área rival");
  assert.equal(translatePlayerStatTitle("Dispossessed"), "Pérdidas de balón");
  assert.equal(translatePlayerStatTitle("Fouls won"), "Faltas recibidas");

  // Métricas defensivas y disciplina
  assert.equal(translatePlayerStatTitle("Defensive actions"), "Acciones defensivas");
  assert.equal(translatePlayerStatTitle("Tackles"), "Entradas con éxito");
  assert.equal(translatePlayerStatTitle("Interceptions"), "Intercepciones");
  assert.equal(translatePlayerStatTitle("Fouls committed"), "Faltas cometidas");
  assert.equal(translatePlayerStatTitle("Recoveries"), "Recuperaciones");
  assert.equal(translatePlayerStatTitle("Possession won final 3rd"), "Recuperaciones en 3/4");
  assert.equal(translatePlayerStatTitle("Dribbled past"), "Regateado");
  assert.equal(translatePlayerStatTitle("Clearances"), "Despejes");
  assert.equal(translatePlayerStatTitle("Clean sheets"), "Porterías a cero");
  assert.equal(translatePlayerStatTitle("Goals conceded while on pitch"), "Goles encajados en el campo");
  assert.equal(translatePlayerStatTitle("xG against while on pitch"), "xG en contra en el campo");
  assert.equal(translatePlayerStatTitle("Yellow cards"), "Tarjetas amarillas");
  assert.equal(translatePlayerStatTitle("Red cards"), "Tarjetas rojas");

  // Fallback si no existe
  assert.equal(translatePlayerStatTitle("Métrica desconocida"), "Métrica desconocida");
});

test("translateCountryName normalizes country names into Spanish", async () => {
  const { translateCountryName } = await import(
    "../../src/lib/sports-api/fotmob-player-stats-translations.ts"
  );

  assert.equal(translateCountryName("Spain"), "España");
  assert.equal(translateCountryName("ESP"), "España");
  assert.equal(translateCountryName("France"), "Francia");
  assert.equal(translateCountryName("Russia"), "Rusia");
  assert.equal(translateCountryName("Uruguay"), "Uruguay");
  assert.equal(translateCountryName("United States"), "Estados Unidos");
  assert.equal(translateCountryName("USA"), "Estados Unidos");
  assert.equal(translateCountryName("Senegal"), "Senegal");
  assert.equal(translateCountryName("Argentina"), "Argentina");
  assert.equal(translateCountryName("Colombia"), "Colombia");
  assert.equal(translateCountryName("Montenegro"), "Montenegro");
  assert.equal(translateCountryName("Cote d'Ivoire"), "Costa de Marfil");
  assert.equal(translateCountryName(null), null);
});


