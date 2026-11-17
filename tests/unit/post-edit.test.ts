import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canEditPost, POST_EDIT_WINDOW_MS } from "../../src/lib/social/format.ts";
import {
  updateCommentInTree,
  removeCommentFromTree,
} from "../../src/lib/match-community/comment-tree-nav.ts";
import type { MatchComment } from "../../src/lib/match-community/types.ts";

describe("Post Edit Window & Comment Tree", () => {
  describe("canEditPost window calculation", () => {
    it("allows editing immediately after creation", () => {
      const now = new Date().toISOString();
      assert.equal(canEditPost(now), true);
    });

    it("allows editing within 14 minutes", () => {
      const fourteenMinAgo = new Date(Date.now() - 14 * 60 * 1000).toISOString();
      assert.equal(canEditPost(fourteenMinAgo), true);
    });

    it("allows editing right at the 15-minute threshold", () => {
      const exactlyFifteenMinAgo = new Date(Date.now() - POST_EDIT_WINDOW_MS).toISOString();
      assert.equal(canEditPost(exactlyFifteenMinAgo), true);
    });

    it("forbids editing after 15 minutes and 1 second", () => {
      const expired = new Date(Date.now() - (POST_EDIT_WINDOW_MS + 1000)).toISOString();
      assert.equal(canEditPost(expired), false);
    });

    it("returns false for invalid date strings", () => {
      assert.equal(canEditPost("invalid-date"), false);
      assert.equal(canEditPost(""), false);
    });
  });

  describe("Match comment tree immutability", () => {
    const MOCK_COMMENTS: readonly MatchComment[] = [
      {
        id: "c1",
        matchId: "m1",
        authorId: "u1",
        authorName: "Aficionado 1",
        authorUsername: "aficionado1",
        body: "Comentario original",
        createdAt: new Date().toISOString(),
        likesCount: 0,
        replies: [
          {
            id: "c1-r1",
            matchId: "m1",
            authorId: "u2",
            authorName: "Aficionado 2",
            authorUsername: "aficionado2",
            body: "Respuesta original",
            createdAt: new Date().toISOString(),
            likesCount: 0,
            parentId: "c1",
            replies: [],
          },
        ],
      },
    ];

    it("updates root comment immutably", () => {
      const updated = updateCommentInTree(MOCK_COMMENTS, "c1", {
        body: "Comentario editado",
        isEdited: true,
      });
      assert.equal(updated[0].body, "Comentario editado");
      assert.equal(updated[0].isEdited, true);
      assert.equal(MOCK_COMMENTS[0].body, "Comentario original");
    });

    it("updates nested reply immutably", () => {
      const updated = updateCommentInTree(MOCK_COMMENTS, "c1-r1", {
        body: "Respuesta editada",
        isEdited: true,
      });
      assert.equal(updated[0].replies?.[0].body, "Respuesta editada");
      assert.equal(updated[0].replies?.[0].isEdited, true);
      assert.equal(MOCK_COMMENTS[0].replies?.[0].body, "Respuesta original");
    });

    it("removes nested reply correctly", () => {
      const updated = removeCommentFromTree(MOCK_COMMENTS, "c1-r1");
      assert.equal(updated[0].replies?.length, 0);
      assert.equal(MOCK_COMMENTS[0].replies?.length, 1);
    });

    it("removes root comment correctly", () => {
      const updated = removeCommentFromTree(MOCK_COMMENTS, "c1");
      assert.equal(updated.length, 0);
    });
  });
});
