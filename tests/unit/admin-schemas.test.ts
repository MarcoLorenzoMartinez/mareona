import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  banUserSchema,
  moderatePostActionSchema,
  systemAnnouncementSchema,
} from "../../src/lib/admin/schemas.ts";

describe("Admin Schemas Suite", () => {
  describe("banUserSchema", () => {
    it("accepts valid ban input with reason and duration", () => {
      const valid = banUserSchema.parse({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        reason: "Spam recurrente en hilos de partido",
        durationDays: 7,
      });

      assert.equal(valid.userId, "550e8400-e29b-41d4-a716-446655440000");
      assert.equal(valid.durationDays, 7);
    });

    it("accepts permanent ban with null duration", () => {
      const valid = banUserSchema.parse({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        reason: "Comportamiento reiterado grave",
        durationDays: null,
      });

      assert.equal(valid.durationDays, null);
    });

    it("rejects non-uuid userId", () => {
      assert.throws(() => {
        banUserSchema.parse({
          userId: "not-a-uuid",
          reason: "Motivo valido",
        });
      });
    });

    it("rejects short or empty reason", () => {
      assert.throws(() => {
        banUserSchema.parse({
          userId: "550e8400-e29b-41d4-a716-446655440000",
          reason: "ab",
        });
      });
    });
  });

  describe("moderatePostActionSchema", () => {
    it("accepts valid actions: approve, delete, restore", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";

      const approved = moderatePostActionSchema.parse({ postId: uuid, action: "approve" });
      assert.equal(approved.action, "approve");

      const deleted = moderatePostActionSchema.parse({
        postId: uuid,
        action: "delete",
        reason: "Contenido ofensivo",
      });
      assert.equal(deleted.action, "delete");

      const restored = moderatePostActionSchema.parse({ postId: uuid, action: "restore" });
      assert.equal(restored.action, "restore");
    });

    it("rejects invalid actions", () => {
      assert.throws(() => {
        moderatePostActionSchema.parse({
          postId: "550e8400-e29b-41d4-a716-446655440000",
          action: "unknown_action",
        });
      });
    });
  });

  describe("systemAnnouncementSchema", () => {
    it("validates announcement message and default types", () => {
      const announcement = systemAnnouncementSchema.parse({
        message: "Mantenimiento programado durante la noche",
      });

      assert.equal(announcement.type, "info");
      assert.equal(announcement.isActive, true);
      assert.equal(announcement.readOnlyWall, false);
    });

    it("rejects messages exceeding 300 characters", () => {
      assert.throws(() => {
        systemAnnouncementSchema.parse({
          message: "a".repeat(301),
        });
      });
    });
  });
});
