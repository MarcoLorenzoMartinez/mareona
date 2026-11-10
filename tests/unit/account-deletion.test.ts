import { describe, it } from "node:test";
import assert from "node:assert/strict";

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
});
