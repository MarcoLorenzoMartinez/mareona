import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { transformStandingRow, transformFixture } from "../../src/lib/sports-api/types.ts";
import { getSecurityHeaders, buildContentSecurityPolicy } from "../../src/lib/security/headers.ts";

/**
 * Recursively retrieves all files matching given extensions within a directory.
 */
function getSourceFiles(dir: string, extensions: readonly string[]): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
        files.push(...getSourceFiles(fullPath, extensions));
      }
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("Architecture & Code Quality Suite (AGENTS.md & Industry Standards)", () => {
  const srcDir = path.resolve(process.cwd(), "src");

  it("verifies absolute prohibition of font-mono in public UI components and styles", () => {
    const uiFiles = getSourceFiles(srcDir, [".tsx", ".css"]);
    const violations: { file: string; line: number; text: string }[] = [];

    for (const filePath of uiFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((lineText, idx) => {
        // Allow comments explaining the rule or markdown docs
        if (lineText.includes("font-mono") && !lineText.trim().startsWith("//") && !lineText.trim().startsWith("/*")) {
          violations.push({
            file: path.relative(process.cwd(), filePath),
            line: idx + 1,
            text: lineText.trim(),
          });
        }
      });
    }

    assert.strictEqual(
      violations.length,
      0,
      `Detected forbidden font-mono usage in UI files:\n${violations
        .map((v) => ` - ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    );
  });

  it("verifies zero usage of @ts-ignore and @ts-expect-error across entire source tree", () => {
    const allTsFiles = getSourceFiles(srcDir, [".ts", ".tsx"]);
    const violations: string[] = [];

    for (const filePath of allTsFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.includes("@ts-ignore") || content.includes("@ts-expect-error")) {
        violations.push(path.relative(process.cwd(), filePath));
      }
    }

    assert.strictEqual(
      violations.length,
      0,
      `Detected forbidden TypeScript escape hatches in:\n${violations.map((f) => ` - ${f}`).join("\n")}`
    );
  });

  it("verifies canonical team name normalization protocol at sports-api edge", () => {
    // 1. Standings row transformation
    const fakeApiRow = {
      rank: 4,
      team: {
        id: 731,
        name: "Sporting Gijón",
        logo: "https://media.api-sports.io/football/teams/731.png",
      },
      points: 21,
      goalsDiff: 6,
      group: "Segunda División",
      form: "WWDWW",
      status: "same",
      description: "Promotion Play-off",
      all: { played: 11, win: 6, draw: 3, lose: 2, goals: { for: 16, against: 10 } },
      home: { played: 6, win: 4, draw: 1, lose: 1, goals: { for: 10, against: 5 } },
      away: { played: 5, win: 2, draw: 2, lose: 1, goals: { for: 6, against: 5 } },
      update: "2024-10-20T12:00:00+00:00",
    };

    const transformedStanding = transformStandingRow(fakeApiRow);
    assert.strictEqual(transformedStanding.teamName, "Real Sporting");
    assert.strictEqual(transformedStanding.isSporting, true);

    // 2. Fixture transformation
    const fakeFixture = {
      fixture: {
        id: 999999,
        referee: "Árbitro de prueba",
        timezone: "UTC",
        date: "2024-11-20T17:30:00+00:00",
        timestamp: 1732123800,
        periods: { first: null, second: null },
        venue: { id: 1492, name: "El Molinón", city: "Gijón" },
        status: { long: "Not Started", short: "NS", elapsed: null },
      },
      league: {
        id: 141,
        name: "Segunda División",
        country: "Spain",
        logo: "https://media.api-sports.io/football/leagues/141.png",
        flag: "https://media.api-sports.io/flags/es.svg",
        season: 2024,
        round: "Regular Season - 15",
      },
      teams: {
        home: {
          id: 731,
          name: "Sporting de Gijón",
          logo: "https://media.api-sports.io/football/teams/731.png",
          winner: null,
        },
        away: {
          id: 546,
          name: "Real Zaragoza",
          logo: "https://media.api-sports.io/football/teams/546.png",
          winner: null,
        },
      },
      goals: { home: null, away: null },
      score: {
        halftime: { home: null, away: null },
        fulltime: { home: null, away: null },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      },
    };

    const transformedMatch = transformFixture(fakeFixture);
    assert.strictEqual(transformedMatch.homeTeam.name, "Real Sporting");
    assert.strictEqual(transformedMatch.homeTeam.isSporting, true);
  });

  it("verifies that .env.example contains no leaked credentials or production secrets", () => {
    const envExamplePath = path.resolve(process.cwd(), ".env.example");
    assert.strictEqual(fs.existsSync(envExamplePath), true, ".env.example file must exist");

    const envContent = fs.readFileSync(envExamplePath, "utf-8");
    const lines = envContent.split("\n");

    const sensitivePatterns = [
      /eyJh[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/i, // JWT patterns
      /sk_[A-Za-z0-9]{20,}/i,               // Secret keys
      /postgres:\/\/[^:]+:[^@]+@/i,         // Database connection strings with password
    ];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      for (const pattern of sensitivePatterns) {
        assert.strictEqual(
          pattern.test(trimmed),
          false,
          `Detected probable secret leak in .env.example: ${trimmed.slice(0, 15)}...`
        );
      }
    }
  });

  it("verifies mandatory security headers in production configuration", () => {
    const headers = getSecurityHeaders();
    const headersMap = new Map(headers.map((h) => [h.key, h.value]));

    const csp = buildContentSecurityPolicy();
    assert.ok(csp.includes("frame-ancestors 'none'"), "CSP must prevent frame ancestors");
    assert.ok(csp.includes("default-src 'self'"), "CSP must enforce default-src 'self'");

    assert.strictEqual(headersMap.get("X-Frame-Options"), "DENY", "X-Frame-Options must be DENY");
    assert.strictEqual(
      headersMap.get("X-Content-Type-Options"),
      "nosniff",
      "X-Content-Type-Options must be nosniff"
    );
    assert.strictEqual(
      headersMap.get("Referrer-Policy"),
      "strict-origin-when-cross-origin",
      "Referrer-Policy must be strict-origin-when-cross-origin"
    );
    assert.ok(headersMap.has("Strict-Transport-Security"), "HSTS header required");
  });
});
