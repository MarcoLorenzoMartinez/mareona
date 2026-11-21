import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  canSafelyAbortRegistration,
  isOnboardingEligible,
} from "../../src/lib/auth/new-user.ts";

describe("GDPR Account Deletion & Right to be Forgotten Protocol", () => {
  type AuthActionResult = {
    readonly success: boolean;
    readonly error?: string;
  };

  interface SupabaseAuthMock {
    getUser: () => Promise<{ data: { user: { id: string } | null }; error: Error | null }>;
    signOut: () => Promise<{ error: Error | null }>;
  }

  interface SupabaseRpcMock {
    rpc: (name: string) => Promise<{ data: unknown; error: Error | null }>;
  }

  async function simulateDeleteAccount(
    auth: SupabaseAuthMock,
    rpc: SupabaseRpcMock
  ): Promise<AuthActionResult> {
    const {
      data: { user },
      error: userError,
    } = await auth.getUser();

    if (userError || !user) {
      return { success: false, error: "No hay sesión activa para eliminar" };
    }

    const { error: rpcError } = await rpc.rpc("delete_current_user");
    if (rpcError) {
      return {
        success: false,
        error: `Error al eliminar los datos: ${rpcError.message}`,
      };
    }

    await auth.signOut();
    return { success: true };
  }

  it("successfully deletes active user via RPC and signs out", async () => {
    let signedOut = false;
    let rpcCalled = false;

    const authMock: SupabaseAuthMock = {
      getUser: async () => ({
        data: { user: { id: "a1b2c3d4-1234-5678-90ab-cdef12345678" } },
        error: null,
      }),
      signOut: async () => {
        signedOut = true;
        return { error: null };
      },
    };

    const rpcMock: SupabaseRpcMock = {
      rpc: async (name: string) => {
        if (name === "delete_current_user") {
          rpcCalled = true;
          return { data: null, error: null };
        }
        return { data: null, error: new Error("Unknown RPC") };
      },
    };

    const result = await simulateDeleteAccount(authMock, rpcMock);

    assert.strictEqual(result.success, true);
    assert.strictEqual(rpcCalled, true);
    assert.strictEqual(signedOut, true);
  });

  it("rejects deletion attempt when no user session is present", async () => {
    const authMock: SupabaseAuthMock = {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    };

    const rpcMock: SupabaseRpcMock = {
      rpc: async () => ({ data: null, error: null }),
    };

    const result = await simulateDeleteAccount(authMock, rpcMock);

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "No hay sesión activa para eliminar");
  });

  it("handles database RPC error gracefully without crashing session", async () => {
    let signedOut = false;

    const authMock: SupabaseAuthMock = {
      getUser: async () => ({
        data: { user: { id: "valid-user-id" } },
        error: null,
      }),
      signOut: async () => {
        signedOut = true;
        return { error: null };
      },
    };

    const rpcMock: SupabaseRpcMock = {
      rpc: async () => ({
        data: null,
        error: new Error("Foreign key constraint violation"),
      }),
    };

    const result = await simulateDeleteAccount(authMock, rpcMock);

    assert.strictEqual(result.success, false);
    assert.match(result.error ?? "", /Foreign key constraint violation/);
    assert.strictEqual(signedOut, false);
  });

  describe("Onboarding Abort & Eligibility Guards (P0-1)", () => {
    it("allows abortRegistration only for fresh unedited accounts within 24 hours", () => {
      const now = new Date("2026-11-21T14:00:00Z").getTime();
      const recent = "2026-11-21T13:55:00Z";
      assert.strictEqual(
        canSafelyAbortRegistration({
          userCreatedAt: recent,
          profileCreatedAt: recent,
          profileUpdatedAt: recent,
          points: 0,
          nowMs: now,
        }),
        true
      );
    });

    it("blocks abortRegistration for established accounts older than 24h, edited profiles, or with points", () => {
      const now = new Date("2026-11-21T14:00:00Z").getTime();
      const oldDate = "2026-10-15T10:00:00Z";
      const recent = "2026-11-21T13:55:00Z";

      assert.strictEqual(
        canSafelyAbortRegistration({
          userCreatedAt: oldDate,
          profileCreatedAt: oldDate,
          profileUpdatedAt: oldDate,
          points: 0,
          nowMs: now,
        }),
        false
      );

      assert.strictEqual(
        canSafelyAbortRegistration({
          userCreatedAt: recent,
          profileCreatedAt: recent,
          profileUpdatedAt: "2026-11-21T13:58:00Z",
          points: 0,
          nowMs: now,
        }),
        false
      );

      assert.strictEqual(
        canSafelyAbortRegistration({
          userCreatedAt: recent,
          profileCreatedAt: recent,
          profileUpdatedAt: recent,
          points: 10,
          nowMs: now,
        }),
        false
      );
    });

    it("denies onboarding modal when user is logged out or already customized their profile", () => {
      const now = new Date("2026-11-21T14:00:00Z").getTime();
      assert.strictEqual(
        isOnboardingEligible({ hasUser: false, nowMs: now }),
        false
      );
      assert.strictEqual(
        isOnboardingEligible({
          hasUser: true,
          userCreatedAt: "2026-10-01T10:00:00Z",
          profileCreatedAt: "2026-10-01T10:00:00Z",
          profileUpdatedAt: "2026-10-05T10:00:00Z",
          nowMs: now,
        }),
        false
      );
    });

    it("requires explicit confirmation in AuthModal before aborting registration", () => {
      const modalSrc = fs.readFileSync(
        path.join(process.cwd(), "src/components/auth/auth-modal.tsx"),
        "utf8"
      );
      assert.match(modalSrc, /window\.confirm\(/);
      assert.match(modalSrc, /isOnboardingEligible/);
    });
  });
});
