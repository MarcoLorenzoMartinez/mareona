import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Accessibility & WCAG 2.2 AA Modal Dialog Standards", () => {
  const modalFiles = [
    "src/components/auth/auth-modal.tsx",
    "src/components/games/game-archive-modal.tsx",
    "src/components/lineup-builder/custom-player-modal.tsx",
    "src/components/lineup-builder/roster-modal.tsx",
    "src/components/lineup-builder/share-lineup-modal.tsx",
    "src/app/(main)/juegos/album/pack-opening-modal.tsx",
    "src/app/(main)/juegos/mayor-menor/higher-lower-game-over-modal.tsx",
    "src/app/(main)/juegos/pregunta-del-dia/trivia-result-modal.tsx",
    "src/app/(main)/juegos/quien-es/who-are-ya-stats-modal.tsx",
    "src/app/(main)/juegos/wordle/wordle-stats-modal.tsx",
    "src/app/(main)/social/friends-modal.tsx",
    "src/app/(main)/social/user-profile-modal.tsx",
    "src/app/(main)/social/user-report-modal.tsx",
    "src/app/admin/usuarios/ban-user-modal.tsx",
  ];

  it("verifies all dialog components declare role='dialog'", () => {
    for (const relPath of modalFiles) {
      const fullPath = path.resolve(process.cwd(), relPath);
      assert.ok(fs.existsSync(fullPath), `Modal file must exist: ${relPath}`);
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.match(
        content,
        /role=["']dialog["']/,
        `${relPath} must specify role="dialog" for assistive tech`
      );
    }
  });

  it("verifies all dialog components declare aria-modal='true'", () => {
    for (const relPath of modalFiles) {
      const fullPath = path.resolve(process.cwd(), relPath);
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.match(
        content,
        /aria-modal=["']true["']/,
        `${relPath} must declare aria-modal="true" for screen readers`
      );
    }
  });

  it("verifies all dialog components declare accessible name (aria-labelledby or aria-label)", () => {
    for (const relPath of modalFiles) {
      const fullPath = path.resolve(process.cwd(), relPath);
      const content = fs.readFileSync(fullPath, "utf-8");
      const hasAriaLabel = /aria-label=/.test(content);
      const hasAriaLabelledby = /aria-labelledby=/.test(content);
      assert.ok(
        hasAriaLabel || hasAriaLabelledby,
        `${relPath} must provide an accessible name via aria-label or aria-labelledby`
      );
    }
  });

  it("verifies pack opening modal auto-saves cards on immediate dismiss", () => {
    const packModalPath = path.resolve(
      process.cwd(),
      "src/app/(main)/juegos/album/pack-opening-modal.tsx"
    );
    const content = fs.readFileSync(packModalPath, "utf-8");
    assert.match(
      content,
      /handleDismiss/,
      "Pack opening modal must implement handleDismiss"
    );
    assert.match(
      content,
      /onSaveCards/,
      "Pack opening modal must ensure cards are saved on dismiss"
    );
  });
});
