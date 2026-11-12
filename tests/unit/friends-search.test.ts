import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeSearchQuery, filterFriendsList } from "../../src/lib/social/friends-search-utils.ts";
import type { FriendSummary } from "../../src/lib/social/friendship-schemas.ts";

const MOCK_PROFILES: readonly FriendSummary[] = [
  {
    id: "user-1",
    friendshipId: "",
    username: "pelayo_gijon",
    displayName: "Pelayo Álvarez",
    avatarUrl: "https://www.bdfutbol.com/i/j/3268f.jpg",
  },
  {
    id: "user-2",
    friendshipId: "",
    username: "nacho_sporting",
    displayName: "Nacho RSG",
    avatarUrl: "/images/historical/el-molinon-uefa.jpg",
  },
  {
    id: "user-3",
    friendshipId: "",
    username: "cova_molinon",
    displayName: "Covadonga",
    avatarUrl: "/images/historical/quini-trofeo.jpg",
  },
];

describe("Friends Search Utils", () => {
  it("strips leading @ symbol and trims whitespace", () => {
    assert.equal(normalizeSearchQuery("  @pelayo  "), "pelayo");
    assert.equal(normalizeSearchQuery("@@nacho"), "nacho");
    assert.equal(normalizeSearchQuery("@pelayo_gijon"), "pelayo_gijon");
    assert.equal(normalizeSearchQuery("Pelayo"), "pelayo");
  });

  it("filters profiles correctly with leading @ symbol in query", () => {
    const results = filterFriendsList(MOCK_PROFILES, "@pelayo", "current-user-id");
    assert.equal(results.length, 1);
    assert.equal(results[0].username, "pelayo_gijon");
  });

  it("filters profiles by display name regardless of casing and accents", () => {
    // Search with accent for name with accent
    const results1 = filterFriendsList(MOCK_PROFILES, "álvarez", "current-user-id");
    assert.equal(results1.length, 1);
    assert.equal(results1[0].username, "pelayo_gijon");

    // Search without accent for name with accent (Álvarez)
    const results2 = filterFriendsList(MOCK_PROFILES, "alvarez", "current-user-id");
    assert.equal(results2.length, 1);
    assert.equal(results2[0].username, "pelayo_gijon");
  });

  it("excludes the current logged-in user from the results", () => {
    const results = filterFriendsList(MOCK_PROFILES, "pelayo", "user-1");
    assert.equal(results.length, 0);
  });

  it("returns empty list if search query is shorter than 2 characters", () => {
    assert.deepEqual(filterFriendsList(MOCK_PROFILES, "@", "current-user-id"), []);
    assert.deepEqual(filterFriendsList(MOCK_PROFILES, "p", "current-user-id"), []);
    assert.deepEqual(filterFriendsList(MOCK_PROFILES, "   ", "current-user-id"), []);
  });
});
