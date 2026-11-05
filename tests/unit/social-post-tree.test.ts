import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  findPostInTree,
  findParentInTree,
  addReplyToTree,
  removePostFromTree,
} from "../../src/lib/social/post-tree.ts";
import type { SocialPost } from "../../src/lib/social/types.ts";

const MOCK_TREE: readonly SocialPost[] = [
  {
    id: "p1",
    userId: "u1",
    authorName: "Pelayo",
    authorUsername: "pelayo",
    authorAvatar: null,
    body: "Post principal 1",
    createdAt: "2026-10-20T10:00:00Z",
    likesCount: 10,
    repliesCount: 2,
    replies: [
      {
        id: "p1-r1",
        userId: "u2",
        authorName: "Nacho",
        authorUsername: "nacho",
        authorAvatar: null,
        body: "Respuesta nivel 1",
        createdAt: "2026-10-20T10:10:00Z",
        likesCount: 2,
        repliesCount: 1,
        replies: [
          {
            id: "p1-r1-sub1",
            userId: "u3",
            authorName: "Covadonga",
            authorUsername: "cova",
            authorAvatar: null,
            body: "Respuesta nivel 2 (muñeca rusa)",
            createdAt: "2026-10-20T10:20:00Z",
            likesCount: 1,
            repliesCount: 0,
            replies: [],
          },
        ],
      },
    ],
  },
];

describe("Social Post Tree Helper Functions", () => {
  it("finds top-level post by ID", () => {
    const post = findPostInTree(MOCK_TREE, "p1");
    assert.ok(post);
    assert.equal(post.id, "p1");
  });

  it("finds nested reply at depth 1", () => {
    const post = findPostInTree(MOCK_TREE, "p1-r1");
    assert.ok(post);
    assert.equal(post.authorUsername, "nacho");
  });

  it("finds deep reply at depth 2 (muñeca rusa)", () => {
    const post = findPostInTree(MOCK_TREE, "p1-r1-sub1");
    assert.ok(post);
    assert.equal(post.authorUsername, "cova");
  });

  it("finds immediate parent of a nested post", () => {
    const parent1 = findParentInTree(MOCK_TREE, "p1-r1");
    assert.equal(parent1?.id, "p1");

    const parent2 = findParentInTree(MOCK_TREE, "p1-r1-sub1");
    assert.equal(parent2?.id, "p1-r1");
  });

  it("adds reply to nested reply immutably", () => {
    const newReply: SocialPost = {
      id: "p1-r1-sub1-reply1",
      userId: "u4",
      authorName: "Quini",
      authorUsername: "quini",
      authorAvatar: null,
      body: "Respuesta nivel 3",
      createdAt: "2026-10-20T10:30:00Z",
      likesCount: 0,
      repliesCount: 0,
      replies: [],
    };

    const updated = addReplyToTree(MOCK_TREE, "p1-r1-sub1", newReply);
    const target = findPostInTree(updated, "p1-r1-sub1");
    assert.ok(target);
    assert.equal(target.repliesCount, 1);
    assert.equal(target.replies?.length, 1);
    assert.equal(target.replies[0].id, "p1-r1-sub1-reply1");
  });

  it("removes nested reply and updates parent replies count", () => {
    const updated = removePostFromTree(MOCK_TREE, "p1-r1-sub1");
    assert.equal(findPostInTree(updated, "p1-r1-sub1"), null);
    const parent = findPostInTree(updated, "p1-r1");
    assert.ok(parent);
    assert.equal(parent.repliesCount, 0);
    assert.equal(parent.replies?.length, 0);
  });

  it("removes top-level post completely", () => {
    const updated = removePostFromTree(MOCK_TREE, "p1");
    assert.equal(updated.length, 0);
  });
});
