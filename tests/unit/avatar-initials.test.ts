import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAvatarInitials } from "../../src/lib/auth/initials.ts";

describe("getAvatarInitials", () => {
  it("derives initials from two-word display names", () => {
    assert.equal(getAvatarInitials("Pelayo Álvarez"), "PA");
    assert.equal(getAvatarInitials("Enrique Castro"), "EC");
  });

  it("derives initials from single-word names", () => {
    assert.equal(getAvatarInitials("Quini"), "QU");
    assert.equal(getAvatarInitials("Mareona"), "MA");
  });

  it("derives initials from multi-part email addresses", () => {
    assert.equal(getAvatarInitials("pelayo.sporting@gmail.com"), "PS");
    assert.equal(getAvatarInitials("marcos_rsg@hotmail.com"), "MR");
    assert.equal(getAvatarInitials("juan-carlos@correo.es"), "JC");
  });

  it("derives initials from single-word email addresses", () => {
    assert.equal(getAvatarInitials("pelayo@gmail.com"), "PE");
    assert.equal(getAvatarInitials("quini@sporting.es"), "QU");
  });

  it("handles short, empty or null inputs gracefully with fallback", () => {
    assert.equal(getAvatarInitials(""), "RS");
    assert.equal(getAvatarInitials(null), "RS");
    assert.equal(getAvatarInitials(undefined), "RS");
    assert.equal(getAvatarInitials("a"), "AS");
  });
});
