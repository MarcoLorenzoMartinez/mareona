import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isRoleAdmin, isRoleStaff } from "../../src/lib/admin/roles.ts";

describe("Admin Roles Logic Suite", () => {
  it("recognizes 'admin' as authorized administrative role", () => {
    assert.equal(isRoleAdmin("admin"), true);
    assert.equal(isRoleStaff("admin"), true);
  });

  it("recognizes 'moderator' as staff member but not full admin", () => {
    assert.equal(isRoleAdmin("moderator"), false);
    assert.equal(isRoleStaff("moderator"), true);
  });

  it("rejects non-admin roles and invalid values", () => {
    assert.equal(isRoleAdmin("user"), false);
    assert.equal(isRoleAdmin("aficionado"), false);
    assert.equal(isRoleAdmin(null), false);
    assert.equal(isRoleAdmin(undefined), false);
    assert.equal(isRoleAdmin(""), false);
    assert.equal(isRoleStaff("aficionado"), false);
  });
});
