import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("H2HMetricsStrip Component & Clean Layout Standards", () => {
  const componentPath = path.resolve(process.cwd(), "src/components/sports/h2h-metrics-strip.tsx");

  it("verifies h2h-metrics-strip.tsx exists and obeys line-count threshold", () => {
    assert.ok(fs.existsSync(componentPath), "Component file must exist");
    const content = fs.readFileSync(componentPath, "utf-8");
    const lineCount = content.split("\n").length;
    assert.ok(lineCount <= 180, `Must be <= 180 lines, got ${lineCount}`);
  });

  it("enforces 4-column layout on mobile (< sm) and 5-column layout on desktop (>= sm)", () => {
    const content = fs.readFileSync(componentPath, "utf-8");
    // Mobile 4-column row for PJ, V, E, D
    assert.match(content, /grid-cols-4/, "Mobile row must use grid-cols-4 for PJ, V, E, D");
    // Desktop 5-column row
    assert.match(content, /sm:grid-cols-5/, "Desktop must use sm:grid-cols-5");
  });

  it("strictly prohibits font-mono and enforces font-sans tabular-nums per AGENTS.md rule 5", () => {
    const content = fs.readFileSync(componentPath, "utf-8");
    assert.ok(!content.includes("font-mono"), "font-mono is strictly forbidden");
    assert.match(content, /font-sans/, "Must declare font-sans for numbers");
    assert.match(content, /tabular-nums/, "Must declare tabular-nums for proportional alignment");
  });

  it("verifies integration in match-h2h-preview, rival-detail-header, and region-detail-view", () => {
    const consumers = [
      "src/app/(main)/temporada/partidos/[id]/match-h2h-preview.tsx",
      "src/app/(main)/historico/rivales/rival-detail-header.tsx",
      "src/app/(main)/historico/rivales/region-detail-view.tsx",
    ];

    for (const rel of consumers) {
      const full = path.resolve(process.cwd(), rel);
      const code = fs.readFileSync(full, "utf-8");
      assert.match(
        code,
        /H2HMetricsStrip/,
        `${rel} must use the unified H2HMetricsStrip component`
      );
      assert.ok(
        !code.includes("grid-cols-2 sm:grid-cols-5"),
        `${rel} must not use obsolete 2x2 grid-cols-2 sm:grid-cols-5 layout`
      );
    }
  });
});
