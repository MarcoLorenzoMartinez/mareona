import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  signInSchema,
  signUpSchema,
  profileUpdateSchema,
  USERNAME_REGEX,
  SPORTING_AVATAR_PRESETS,
} from "../../src/lib/auth/schemas.ts";

describe("Auth Schemas", () => {
  describe("signInSchema & signUpSchema", () => {
    it("accepts valid email and password with at least 6 characters", () => {
      const valid = { email: "aficionado@mareona.com", password: "sporting1905" };
      const parsedSignIn = signInSchema.safeParse(valid);
      const parsedSignUp = signUpSchema.safeParse(valid);

      assert.equal(parsedSignIn.success, true);
      assert.equal(parsedSignUp.success, true);
    });

    it("rejects invalid email formats", () => {
      const invalid = { email: "not-an-email", password: "sporting1905" };
      const res = signInSchema.safeParse(invalid);
      assert.equal(res.success, false);
      if (!res.success) {
        assert.match(res.error.issues[0].message, /Introduce un correo electrónico válido/);
      }
    });

    it("rejects password shorter than 6 characters", () => {
      const invalid = { email: "aficionado@mareona.com", password: "123" };
      const res = signUpSchema.safeParse(invalid);
      assert.equal(res.success, false);
      if (!res.success) {
        assert.match(res.error.issues[0].message, /al menos 6 caracteres/);
      }
    });
  });

  describe("profileUpdateSchema & USERNAME_REGEX", () => {
    it("validates username conforming to PostgreSQL citext constraint", () => {
      assert.equal(USERNAME_REGEX.test("pelayo_1905"), true);
      assert.equal(USERNAME_REGEX.test("sporting_fan"), true);
      assert.equal(USERNAME_REGEX.test("rsg"), true);
      assert.equal(USERNAME_REGEX.test("ab"), false, "Must be at least 3 chars");
      assert.equal(
        USERNAME_REGEX.test("this_username_is_way_too_long_for_db"),
        false,
        "Must be max 20 chars"
      );
      assert.equal(
        USERNAME_REGEX.test("pelayo sporting"),
        false,
        "No spaces allowed"
      );
      assert.equal(
        USERNAME_REGEX.test("pelayo@sporting"),
        false,
        "No special symbols allowed"
      );
    });

    it("accepts valid profile updates with optional fields", () => {
      const res = profileUpdateSchema.safeParse({
        username: "pelayo_gijon",
        displayName: "Pelayo de El Molinón",
        avatarUrl: "/avatars/presets/quini.svg",
      });
      assert.equal(res.success, true);
    });

    it("rejects displayName longer than 40 characters", () => {
      const res = profileUpdateSchema.safeParse({
        displayName: "Este nombre visible es extraordinariamente largo y supera el límite de cuarenta",
      });
      assert.equal(res.success, false);
      if (!res.success) {
        assert.match(res.error.issues[0].message, /no puede superar los 40 caracteres/);
      }
    });
  });

  describe("SPORTING_AVATAR_PRESETS", () => {
    it("provides the canonical set of 4 Sporting avatar presets", () => {
      assert.equal(SPORTING_AVATAR_PRESETS.length, 4);
      assert.deepEqual(
        SPORTING_AVATAR_PRESETS.map((p) => p.id),
        ["molinon", "rayas", "bufanda", "quini"]
      );
    });
  });

  describe("DEMO_CREDENTIALS & evaluateDemoAuth", () => {
    it("recognizes demo-login account and returns pre-populated sporting profile", async () => {
      const { evaluateDemoAuth } = await import("../../src/lib/auth/demo-credentials.ts");
      const res = evaluateDemoAuth("demo-login@mareona.com", "sporting1905", "signin");
      assert.equal(res.isDemo, true);
      assert.equal(res.isNewUser, false);
      assert.equal(res.profile?.username, "quini_1905");
      assert.equal(res.profile?.points, 125);
    });

    it("recognizes demo-registro account and sets isNewUser flag for onboarding", async () => {
      const { evaluateDemoAuth } = await import("../../src/lib/auth/demo-credentials.ts");
      const res = evaluateDemoAuth("demo-registro@mareona.com", "sporting1905", "signup");
      assert.equal(res.isDemo, true);
      assert.equal(res.isNewUser, true);
      assert.equal(res.profile?.username, "aficionado_nuevo");
    });

    it("rejects invalid password for demo accounts", async () => {
      const { evaluateDemoAuth } = await import("../../src/lib/auth/demo-credentials.ts");
      const res = evaluateDemoAuth("demo-login@mareona.com", "wrongpass", "signin");
      assert.equal(res.isDemo, true);
      assert.match(res.error ?? "", /Contraseña incorrecta/);
    });
  });
});
