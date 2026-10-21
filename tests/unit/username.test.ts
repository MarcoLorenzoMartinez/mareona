import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateUsernameFromEmail,
  resolveUsernameCollision,
} from "../../src/lib/auth/username.ts";

describe("generateUsernameFromEmail", () => {
  it("converts standard email to lowercase clean username", () => {
    assert.equal(generateUsernameFromEmail("Pelayo@gmail.com"), "pelayo");
  });

  it("replaces dots, dashes and symbols with underscores", () => {
    assert.equal(
      generateUsernameFromEmail("marcos.gijon-rsg@hotmail.com"),
      "marcos_gijon_rsg"
    );
  });

  it("ignores plus addressing / tags", () => {
    assert.equal(
      generateUsernameFromEmail("quini+sporting1905@mareona.com"),
      "quini"
    );
  });

  it("pads short handles to reach minimum 3 characters", () => {
    assert.equal(generateUsernameFromEmail("al@domain.com"), "al_rsg");
  });

  it("truncates usernames longer than 20 characters", () => {
    const long = generateUsernameFromEmail("verylongusernamethatexceedstwenty@test.com");
    assert.ok(long.length <= 20);
    assert.equal(long, "verylongusernamethat");
  });

  it("handles fallback when input is empty or invalid", () => {
    assert.equal(generateUsernameFromEmail(""), "sportinguista");
    assert.equal(generateUsernameFromEmail("...@domain.com"), "sportinguista");
  });
});

describe("resolveUsernameCollision", () => {
  it("returns base username when not taken", () => {
    const taken = new Set(["pelayo", "quini"]);
    assert.equal(resolveUsernameCollision("covadonga", taken), "covadonga");
  });

  it("appends _1 when base username is taken", () => {
    const taken = new Set(["pelayo"]);
    assert.equal(resolveUsernameCollision("pelayo", taken), "pelayo_1");
  });

  it("increments suffix when _1 is also taken", () => {
    const taken = new Set(["pelayo", "pelayo_1", "pelayo_2"]);
    assert.equal(resolveUsernameCollision("pelayo", taken), "pelayo_3");
  });

  it("truncates base username so suffix fits within 20 characters", () => {
    const longBase = "supercalifragilistic"; // 20 chars
    const taken = new Set([longBase]);
    const resolved = resolveUsernameCollision(longBase, taken);
    assert.ok(resolved.length <= 20);
    assert.equal(resolved, "supercalifragilist_1");
  });
});
