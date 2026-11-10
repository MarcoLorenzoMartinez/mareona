import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildOAuthCallbackUrl,
  isRunningInStandaloneMode,
} from "../../src/lib/auth/oauth-redirect.ts";

describe("OAuth PWA Redirect & Standalone Protocol", () => {
  it("builds clean callback URL for standard browser tab", () => {
    const url = buildOAuthCallbackUrl("https://mareona.es", "/temporada", false);
    const parsed = new URL(url);

    assert.equal(parsed.origin, "https://mareona.es");
    assert.equal(parsed.pathname, "/auth/callback");
    assert.equal(parsed.searchParams.get("next"), "/temporada");
    assert.equal(parsed.searchParams.get("pwa"), null);
  });

  it("appends pwa indicators when initiated from standalone mode", () => {
    const url = buildOAuthCallbackUrl("https://mareona.es", "/juegos/wordle", true);
    const parsed = new URL(url);

    assert.equal(parsed.origin, "https://mareona.es");
    assert.equal(parsed.pathname, "/auth/callback");
    assert.equal(parsed.searchParams.get("next"), "/juegos/wordle?source=pwa");
    assert.equal(parsed.searchParams.get("pwa"), "1");
  });

  it("does not duplicate source=pwa parameter if already in return path", () => {
    const url = buildOAuthCallbackUrl("https://mareona.es", "/perfil?source=pwa", true);
    const parsed = new URL(url);

    assert.equal(parsed.searchParams.get("next"), "/perfil?source=pwa");
    assert.equal(parsed.searchParams.get("pwa"), "1");
  });

  it("sanitizes relative return paths safely", () => {
    const url = buildOAuthCallbackUrl("https://mareona.es", "social", false);
    const parsed = new URL(url);

    assert.equal(parsed.searchParams.get("next"), "/social");
  });

  it("evaluates standalone mode as false in non-browser environment", () => {
    assert.equal(isRunningInStandaloneMode(), false);
  });
});
