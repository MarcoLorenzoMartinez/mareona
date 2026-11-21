import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseHistoricalMatchDetail } from "../../src/lib/historical/match-detail-parser.ts";

const SAMPLE_MATCH_HTML = `
<!doctype html>
<html>
<body>
  <div class="f14">Estadio</div>
  <div class="f13 font-weight-bold"><a href="../s/34.html">El Molinón (Gijón)</a></div>
  
  <div class="font-blanc f13">
    <a href="../r/r600138.html"><img src="../../i/am/600138.png">Ausocúa Sanz</a>
  </div>

  <div class="text-right">
    <div class="text-blanc"><span>1-1</span> <a href="../j/j5126.html">Rezza</a> 46'</div>
    <div class="text-blanc"><span>2-1</span> <a href="../j/j5001.html">Quini</a> 50' (penalti)</div>
    <div class="text-blanc"><span>3-1</span> <a href="../j/j43018.html">Queipo</a> 90+8'</div>
  </div>
  <div class="text-left">
    <div class="text-blanc"><span>0-1</span> <a href="../j/j5053.html">Marcial</a> 11'</div>
  </div>

  <!-- Table 0: Home Starters -->
  <table class="taula_estil">
    <tr>
      <td><img src="../../i/m/3665.png"></td>
      <td><a href="../j/j3665.html">Castro</a></td>
    </tr>
    <tr>
      <td><img src="../../i/m/3577.png"></td>
      <td><a href="../j/j3577.html">Redondo</a></td>
      <td><div class="cosa"><div class="Surt"></div> 75</div></td>
      <td><div class="cosa"><div class="TG"></div> 40</div></td>
    </tr>
  </table>

  <!-- Table 1: Away Starters -->
  <table class="taula_estil">
    <tr>
      <td><img src="../../i/m/5055.png"></td>
      <td><a href="../j/j5055.html">Reina</a></td>
    </tr>
  </table>

  <!-- Table 2: Home Bench -->
  <table class="taula_estil">
    <tr>
      <td><img src="../../i/m/3746.png"></td>
      <td><a href="../j/j3746.html">Ciriaco</a></td>
      <td><div class="cosa"><div class="Entra"></div> 75</div></td>
    </tr>
  </table>

  <!-- Table 3: Away Bench -->
  <table class="taula_estil">
    <tr>
      <td><img src="../../i/m/9999.png"></td>
      <td><a href="../j/j9999.html">Suplente Rival</a></td>
    </tr>
  </table>

  <!-- Table 4: Home Coach -->
  <table class="taula_estil">
    <tr class="entren">
      <td><img src="../../i/lm/6064.png"></td>
      <td><a href="../l/l6064.html">Miera</a></td>
    </tr>
  </table>

  <!-- Table 5: Away Coach -->
  <table class="taula_estil">
    <tr class="entren">
      <td><img src="../../i/lm/7841.png"></td>
      <td><a href="../l/l7841.html">Héctor Núñez</a></td>
    </tr>
  </table>
</body>
</html>
`;

describe("Historical Match Detail Parser", () => {
  it("parses stadium and referee with photo", async () => {
    const detail = await parseHistoricalMatchDetail(SAMPLE_MATCH_HTML, "12001");
    assert.equal(detail.bdfMatchId, "12001");
    assert.equal(detail.venue, "El Molinón (Gijón)");
    assert.ok(detail.referee);
    assert.equal(detail.referee.name, "Ausocúa Sanz");
    assert.equal(detail.referee.photoUrl, "https://www.bdfutbol.com/i/am/600138.png");
  });

  it("parses goals chronologically with isHome, penalties, and injury time", async () => {
    const detail = await parseHistoricalMatchDetail(SAMPLE_MATCH_HTML, "12001");
    assert.equal(detail.goals.length, 4);
    assert.deepEqual(detail.goals[0], {
      score: "0-1",
      scorer: "Marcial",
      minute: 11,
      minuteDisplay: "11",
      isHome: false,
      isPenalty: false,
      isOwnGoal: false,
    });
    assert.deepEqual(detail.goals[1], {
      score: "1-1",
      scorer: "Rezza",
      minute: 46,
      minuteDisplay: "46",
      isHome: true,
      isPenalty: false,
      isOwnGoal: false,
    });
    assert.deepEqual(detail.goals[2], {
      score: "2-1",
      scorer: "Quini",
      minute: 50,
      minuteDisplay: "50",
      isHome: true,
      isPenalty: true,
      isOwnGoal: false,
    });
    assert.deepEqual(detail.goals[3], {
      score: "3-1",
      scorer: "Queipo",
      minute: 98,
      minuteDisplay: "90+8",
      isHome: true,
      isPenalty: false,
      isOwnGoal: false,
    });
  });

  it("parses lineups, subs, cards, and coaches", async () => {
    const detail = await parseHistoricalMatchDetail(SAMPLE_MATCH_HTML, "12001");

    // Home Starters
    assert.equal(detail.homeStarters.length, 2);
    assert.equal(detail.homeStarters[0].name, "Castro");
    assert.equal(detail.homeStarters[0].photoUrl, "https://www.bdfutbol.com/i/m/3665.png");
    assert.equal(detail.homeStarters[1].name, "Redondo");
    assert.equal(detail.homeStarters[1].subOut, 75);
    assert.equal(detail.homeStarters[1].yellowCard, 40);

    // Away Starters
    assert.equal(detail.awayStarters.length, 1);
    assert.equal(detail.awayStarters[0].name, "Reina");

    // Home Bench
    assert.equal(detail.homeBench.length, 1);
    assert.equal(detail.homeBench[0].name, "Ciriaco");
    assert.equal(detail.homeBench[0].subIn, 75);

    // Coaches
    assert.ok(detail.homeCoach);
    assert.equal(detail.homeCoach.name, "Miera");
    assert.equal(detail.homeCoach.photoUrl, "https://www.bdfutbol.com/i/lm/6064.png");

    assert.ok(detail.awayCoach);
    assert.equal(detail.awayCoach.name, "Héctor Núñez");
    assert.equal(detail.awayCoach.photoUrl, "https://www.bdfutbol.com/i/lm/7841.png");
  });

  it("enriches player photos with contemporary season photos from squads data", async () => {
    // Without season: retains original debut thumbnail from HTML (3665.png)
    const rawDetail = await parseHistoricalMatchDetail(SAMPLE_MATCH_HTML, "12001");
    assert.equal(rawDetail.homeStarters[0].photoUrl, "https://www.bdfutbol.com/i/m/3665.png");

    // With season: upgrades to 1977-78 contemporary stage photo from squads.json (3665f.jpg)
    const enrichedDetail = await parseHistoricalMatchDetail(SAMPLE_MATCH_HTML, "12001", "1977-78");
    assert.equal(enrichedDetail.homeStarters[0].photoUrl, "https://www.bdfutbol.com/i/j/3665f.jpg");
  });

  it("resolves positions for rival players and falls back to tactical inference", async () => {
    const detail = await parseHistoricalMatchDetail(SAMPLE_MATCH_HTML, "12001", "1977-78", true);
    // Reina (id 5055) is in the rival starting XI and resolved as Portero
    assert.equal(detail.awayStarters.length, 1);
    assert.equal(detail.awayStarters[0].name, "Reina");
    assert.equal(detail.awayStarters[0].position, "Portero");
  });

  it("correctly parses historical approximate minutes with question mark without dropping goals", async () => {
    const historicalHtml = `
      <div class="text-right">
        <div class="text-blanc"><span>1-0</span> <a href="../j/j40063.html">Rubiera</a> 4'</div>
        <div class="text-blanc"><span>2-0</span> <a href="../j/j40066.html">Pujol</a> 20?'</div>
        <div class="text-blanc"><span>3-0</span> <a href="../j/j40063.html">Rubiera</a> 34'</div>
      </div>
    `;
    const detail = await parseHistoricalMatchDetail(historicalHtml, "153692");
    assert.equal(detail.goals.length, 3);
    assert.equal(detail.goals[0].score, "1-0");
    assert.equal(detail.goals[0].minute, 4);
    assert.equal(detail.goals[1].score, "2-0");
    assert.equal(detail.goals[1].scorer, "Pujol");
    assert.equal(detail.goals[1].minute, 20);
    assert.equal(detail.goals[2].score, "3-0");
    assert.equal(detail.goals[2].minute, 34);
  });

  it("disambiguates identical player aliases and guarantees goalkeeper at index 0", async () => {
    const doubleEmilioHtml = `
      <table class="taula_estil">
        <tr><td><a href="../j/j671.html">Emilio</a></td></tr>
        <tr><td><a href="../j/j289.html">Arturo</a></td></tr>
        <tr><td><a href="../j/j670.html">Emilio</a></td></tr>
      </table>
    `;
    const detail = await parseHistoricalMatchDetail(doubleEmilioHtml, "18272", "1991-92", true);
    assert.equal(detail.homeStarters.length, 3);
    // Starter 0: Emilio Isierte (Goalkeeper)
    assert.equal(detail.homeStarters[0].name, "Emilio Isierte");
    assert.equal(detail.homeStarters[0].position, "Portero");
    assert.equal(detail.homeStarters[0].photoUrl, "https://www.bdfutbol.com/i/j/671f.jpg");

    // Starter 2: Emilio Gutiérrez (Midfielder)
    assert.equal(detail.homeStarters[2].name, "Emilio Gutiérrez");
    assert.equal(detail.homeStarters[2].position, "Centrocampista");
    assert.equal(detail.homeStarters[2].photoUrl, "https://www.bdfutbol.com/i/j/670b.jpg");
  });

  it("handles empty or sparse HTML gracefully", async () => {
    const detail = await parseHistoricalMatchDetail("<html><body></body></html>", "99999");
    assert.equal(detail.bdfMatchId, "99999");
    assert.equal(detail.venue, undefined);
    assert.equal(detail.referee, null);
    assert.deepEqual(detail.goals, []);
    assert.deepEqual(detail.homeStarters, []);
    assert.deepEqual(detail.awayStarters, []);
    assert.deepEqual(detail.homeBench, []);
    assert.deepEqual(detail.awayBench, []);
    assert.equal(detail.homeCoach, null);
    assert.equal(detail.awayCoach, null);
  });
});
