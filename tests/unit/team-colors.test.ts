import test from "node:test";
import assert from "node:assert/strict";
import { getTeamPrimaryColor } from "../../src/lib/sports-api/team-colors.ts";

test("getTeamPrimaryColor returns Sporting red for isSporting = true", () => {
  const color = getTeamPrimaryColor({ isSporting: true });
  assert.equal(color, "#e2001a");
});

test("getTeamPrimaryColor resolves Cádiz yellow by ID and name", () => {
  const byId = getTeamPrimaryColor({ teamExternalId: "3842" });
  assert.equal(byId, "#eab308");

  const byName = getTeamPrimaryColor({ teamName: "Cádiz CF" });
  assert.equal(byName, "#eab308");

  const byNameWithoutAccent = getTeamPrimaryColor({ teamName: "Cadiz" });
  assert.equal(byNameWithoutAccent, "#eab308");
});

test("getTeamPrimaryColor resolves Oviedo blue and Albacete burgundy", () => {
  const oviedo = getTeamPrimaryColor({ teamExternalId: "92" });
  assert.equal(oviedo, "#004b93");

  const albacete = getTeamPrimaryColor({ teamName: "Albacete Balompié" });
  assert.equal(albacete, "#7a1b28");
});

test("getTeamPrimaryColor falls back to neutral color for unmapped teams", () => {
  const fallback = getTeamPrimaryColor({ teamExternalId: "unknown-9999", teamName: "Unknown Team" });
  assert.equal(fallback, "#475569");
});
