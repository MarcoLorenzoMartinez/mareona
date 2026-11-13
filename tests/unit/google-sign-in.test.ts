import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  signInWithGoogleCredential,
  type IdTokenAuthClient,
} from "../../src/lib/auth/google-sign-in.ts";
import { googleCredentialSchema } from "../../src/lib/auth/schemas.ts";

const VALID_JWT = "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjMifQ.c2lnbmF0dXJl";
const NONCE = "a".repeat(64);

interface Call {
  readonly provider: "google";
  readonly token: string;
  readonly nonce: string;
}

function fakeClient(
  response: Awaited<ReturnType<IdTokenAuthClient["signInWithIdToken"]>>,
  calls: Call[] = []
): IdTokenAuthClient {
  return {
    async signInWithIdToken(params) {
      calls.push(params);
      return response;
    },
  };
}

describe("signInWithGoogleCredential", () => {
  it("forwards the token and the raw nonce to Supabase", async () => {
    const calls: Call[] = [];
    const created = new Date().toISOString();
    const client = fakeClient({ data: { user: { created_at: created } }, error: null }, calls);

    const result = await signInWithGoogleCredential(client, VALID_JWT, NONCE);

    assert.equal(result.success, true);
    assert.deepEqual(calls, [{ provider: "google", token: VALID_JWT, nonce: NONCE }]);
  });

  it("reports freshly created accounts so onboarding can start", async () => {
    const client = fakeClient({
      data: { user: { created_at: new Date().toISOString() } },
      error: null,
    });
    const result = await signInWithGoogleCredential(client, VALID_JWT, NONCE);

    assert.equal(result.data?.isNewUser, true);
  });

  it("reports returning accounts as not new", async () => {
    const client = fakeClient({
      data: { user: { created_at: "2025-01-01T00:00:00Z" } },
      error: null,
    });
    const result = await signInWithGoogleCredential(client, VALID_JWT, NONCE);

    assert.equal(result.success, true);
    assert.equal(result.data?.isNewUser, false);
  });

  it("returns a friendly error when Supabase rejects the token", async () => {
    const client = fakeClient({
      data: { user: null },
      error: { message: "Unacceptable audience in id_token" },
    });
    const result = await signInWithGoogleCredential(client, VALID_JWT, NONCE);

    assert.equal(result.success, false);
    assert.equal(result.error?.includes("audience"), false);
  });

  it("returns an error instead of throwing when the network fails", async () => {
    const client: IdTokenAuthClient = {
      async signInWithIdToken() {
        throw new Error("network down");
      },
    };
    const result = await signInWithGoogleCredential(client, VALID_JWT, NONCE);

    assert.equal(result.success, false);
  });

  it("never calls Supabase with a malformed credential", async () => {
    const calls: Call[] = [];
    const client = fakeClient({ data: { user: null }, error: null }, calls);

    for (const credential of [undefined, "", "not-a-jwt", "a.b"]) {
      const result = await signInWithGoogleCredential(client, credential, NONCE);
      assert.equal(result.success, false);
    }
    assert.equal(calls.length, 0);
  });
});

describe("googleCredentialSchema", () => {
  it("rejects short nonces and oversized tokens", () => {
    assert.equal(googleCredentialSchema.safeParse({ credential: VALID_JWT, nonce: "x" }).success, false);
    const huge = `${"a".repeat(4100)}.b.c`;
    assert.equal(googleCredentialSchema.safeParse({ credential: huge, nonce: NONCE }).success, false);
  });
});
