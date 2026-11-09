import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("OAuth Callback Route - Path Sanitization Logic", () => {
  function sanitizeNextPath(rawNext: string | null): string {
    if (rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")) {
      return rawNext;
    }
    return "/temporada";
  }

  it("preserves legitimate relative paths", () => {
    assert.strictEqual(sanitizeNextPath("/temporada"), "/temporada");
    assert.strictEqual(sanitizeNextPath("/social"), "/social");
    assert.strictEqual(sanitizeNextPath("/juegos/porra"), "/juegos/porra");
  });

  it("falls back to /temporada when next is null or empty", () => {
    assert.strictEqual(sanitizeNextPath(null), "/temporada");
    assert.strictEqual(sanitizeNextPath(""), "/temporada");
  });

  it("blocks open redirect attempts to external protocols or double slashes", () => {
    assert.strictEqual(sanitizeNextPath("//attacker.com"), "/temporada");
    assert.strictEqual(sanitizeNextPath("https://attacker.com"), "/temporada");
    assert.strictEqual(sanitizeNextPath("javascript:alert(1)"), "/temporada");
  });
});
