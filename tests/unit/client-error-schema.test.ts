import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clientErrorReportSchema,
  formatClientErrorForLog,
} from "../../src/lib/telemetry/client-error-schema.ts";

describe("Client Error Reporting Schema & Formatting Suite", () => {
  it("validates well-formed client error report payload", () => {
    const valid = clientErrorReportSchema.safeParse({
      name: "TypeError",
      message: "Cannot read properties of undefined (reading 'split')",
      digest: "12345678",
      route: "/temporada/partidos/123",
      timestamp: new Date().toISOString(),
    });

    assert.strictEqual(valid.success, true);
    if (valid.success) {
      assert.strictEqual(valid.data.name, "TypeError");
      assert.strictEqual(valid.data.route, "/temporada/partidos/123");
    }
  });

  it("handles optional digest and route safely", () => {
    const minimal = clientErrorReportSchema.safeParse({
      name: "Error",
      message: "Network request failed",
    });

    assert.strictEqual(minimal.success, true);
    if (minimal.success) {
      assert.strictEqual(minimal.data.digest, undefined);
      assert.strictEqual(minimal.data.route, undefined);
    }
  });

  it("truncates or rejects overly long messages to avoid log spam", () => {
    const excessive = clientErrorReportSchema.safeParse({
      name: "BigError",
      message: "x".repeat(3001),
    });

    assert.strictEqual(excessive.success, false);
  });

  it("formats client error into sanitized metadata for server structured logger", () => {
    const formatted = formatClientErrorForLog({
      name: "ChunkLoadError",
      message: "Loading chunk failed for app-shell",
      digest: "next_digest_abc",
      route: "/juegos/porra",
    });

    assert.strictEqual(formatted.errorName, "ChunkLoadError");
    assert.strictEqual(formatted.digest, "next_digest_abc");
    assert.strictEqual(formatted.route, "/juegos/porra");
    assert.ok(formatted.message.includes("app-shell"));
  });
});
