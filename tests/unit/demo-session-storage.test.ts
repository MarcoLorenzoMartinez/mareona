import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_STORAGE_KEY,
  getStoredDemoSession,
  saveDemoSession,
  clearStoredDemoSession,
  updateStoredDemoProfile,
} from "../../src/lib/auth/demo-session-storage.ts";
import { DEMO_CREDENTIALS, createMockUser } from "../../src/lib/auth/demo-credentials.ts";

describe("Demo Session Storage Suite", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    // Simulate browser window & localStorage
    (globalThis as unknown as { window: { localStorage: Storage } }).window = {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, String(value)),
        removeItem: (key: string) => {
          store.delete(key);
        },
        clear: () => store.clear(),
        key: () => null,
        length: store.size,
      },
    };
  });

  it("returns null when no demo session is stored", () => {
    assert.strictEqual(getStoredDemoSession(), null);
  });

  it("saves and retrieves a demo session accurately", () => {
    const demoUser = createMockUser(
      DEMO_CREDENTIALS.login.profile.id,
      DEMO_CREDENTIALS.login.email
    );
    const demoProfile = DEMO_CREDENTIALS.login.profile;

    saveDemoSession(demoUser, demoProfile);

    const retrieved = getStoredDemoSession();
    assert.ok(retrieved !== null);
    assert.strictEqual(retrieved.user.id, demoUser.id);
    assert.strictEqual(retrieved.user.email, demoUser.email);
    assert.strictEqual(retrieved.profile.username, "quini_1905");
    assert.strictEqual(retrieved.profile.points, 125);
  });

  it("handles corrupted or invalid JSON in storage gracefully", () => {
    store.set(DEMO_STORAGE_KEY, "invalid-json{}}");
    assert.strictEqual(getStoredDemoSession(), null);
  });

  it("clears stored demo session completely", () => {
    const demoUser = createMockUser(
      DEMO_CREDENTIALS.login.profile.id,
      DEMO_CREDENTIALS.login.email
    );
    saveDemoSession(demoUser, DEMO_CREDENTIALS.login.profile);
    assert.ok(getStoredDemoSession() !== null);

    clearStoredDemoSession();
    assert.strictEqual(getStoredDemoSession(), null);
    assert.strictEqual(store.has(DEMO_STORAGE_KEY), false);
  });

  it("updates demo user profile fields while keeping user intact", () => {
    const demoUser = createMockUser(
      DEMO_CREDENTIALS.login.profile.id,
      DEMO_CREDENTIALS.login.email
    );
    saveDemoSession(demoUser, DEMO_CREDENTIALS.login.profile);

    const updated = updateStoredDemoProfile({
      points: 250,
      display_name: "Pelayo El Brujo",
    });

    assert.ok(updated !== null);
    assert.strictEqual(updated.points, 250);
    assert.strictEqual(updated.display_name, "Pelayo El Brujo");

    const retrieved = getStoredDemoSession();
    assert.ok(retrieved !== null);
    assert.strictEqual(retrieved.profile.points, 250);
    assert.strictEqual(retrieved.profile.display_name, "Pelayo El Brujo");
    assert.strictEqual(retrieved.user.id, demoUser.id);
  });
});
