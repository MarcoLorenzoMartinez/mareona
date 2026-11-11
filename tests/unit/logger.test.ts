import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createLogger,
  normalizeError,
  sanitizeLogData,
  serializeJsonLog,
  formatPrettyLog,
} from "../../src/lib/logger/core.ts";
import type { LogEntry } from "../../src/lib/logger/types.ts";

describe("Structured Logger Suite", () => {
  describe("Error Normalization", () => {
    it("extracts name, message and stack from Error instances", () => {
      const err = new Error("Database connection timed out");
      const normalized = normalizeError(err);

      assert.ok(normalized);
      assert.equal(normalized.name, "Error");
      assert.equal(normalized.message, "Database connection timed out");
      assert.ok(typeof normalized.stack === "string");
    });

    it("handles non-Error objects safely without throwing", () => {
      const normalized = normalizeError("Unexpected string failure");

      assert.ok(normalized);
      assert.equal(normalized.name, "UnknownError");
      assert.equal(normalized.message, "Unexpected string failure");
    });

    it("returns undefined when no error is provided", () => {
      assert.equal(normalizeError(null), undefined);
      assert.equal(normalizeError(undefined), undefined);
    });
  });

  describe("Sensitive Data Sanitization & Circular Protection", () => {
    it("redacts credentials, passwords, tokens and api keys", () => {
      const raw = {
        userId: "usr_123",
        password: "super-secret-password",
        apiKey: "sk_live_99999",
        nested: {
          token: "bearer_xyz",
          safeParam: "allowed-value",
        },
      };

      const sanitized = sanitizeLogData(raw);

      assert.equal(sanitized.userId, "usr_123");
      assert.equal(sanitized.password, "[REDACTED]");
      assert.equal(sanitized.apiKey, "[REDACTED]");
      const nested = sanitized.nested as Record<string, unknown>;
      assert.equal(nested.token, "[REDACTED]");
      assert.equal(nested.safeParam, "allowed-value");
    });

    it("prevents infinite loops and stack overflow on circular references", () => {
      interface CircularNode {
        name: string;
        self?: CircularNode;
      }

      const node: CircularNode = { name: "Root" };
      node.self = node;

      const sanitized = sanitizeLogData(node as unknown as Record<string, unknown>);
      assert.equal(sanitized.name, "Root");
      assert.equal(sanitized.self, "[Circular]");
    });
  });

  describe("JSON Serialization & Dev Formatting", () => {
    it("serializes log entry to valid single-line ndJSON string", () => {
      const entry: LogEntry = {
        timestamp: "2026-11-11T16:00:00.000Z",
        level: "info",
        message: "Match sync completed",
        context: "sports-api",
        data: { matchesCount: 10 },
      };

      const json = serializeJsonLog(entry);
      assert.equal(json.includes("\n"), false);

      const parsed = JSON.parse(json);
      assert.equal(parsed.level, "info");
      assert.equal(parsed.message, "Match sync completed");
      assert.equal(parsed.context, "sports-api");
      assert.equal(parsed.data.matchesCount, 10);
    });

    it("formats readable output for development terminal", () => {
      const entry: LogEntry = {
        timestamp: "2026-11-11T16:00:00.000Z",
        level: "error",
        message: "Failed to fetch live score",
        context: "live-worker",
        error: { name: "FetchError", message: "ECONNRESET" },
      };

      const pretty = formatPrettyLog(entry);
      assert.ok(pretty.includes("ERROR"));
      assert.ok(pretty.includes("[live-worker]"));
      assert.ok(pretty.includes("FetchError: ECONNRESET"));
    });
  });

  describe("Child Logger & Context Tagging", () => {
    it("inherits and chains context names correctly", () => {
      const parent = createLogger({ context: "cron", isProduction: true, minLevel: "debug" });
      const child = parent.child("matches");

      assert.equal(child.context, "cron:matches");
    });

    it("respects log level filtering", () => {
      const logs: string[] = [];
      const originalInfo = console.info;

      try {
        console.info = (msg?: unknown) => {
          if (typeof msg === "string") logs.push(msg);
        };

        const testLogger = createLogger({
          isProduction: true,
          minLevel: "warn", // debug and info should be ignored
        });

        testLogger.debug("Debug should be omitted");
        testLogger.info("Info should be omitted");

        assert.equal(logs.length, 0);
      } finally {
        console.info = originalInfo;
      }
    });
  });
});
