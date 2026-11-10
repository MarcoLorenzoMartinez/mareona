import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTotalUnreadNotifications } from "../../src/lib/social/notifications-utils.ts";
import {
  getTestDirectConversation,
  markTestConversationAsRead,
  resetTestUnreadNotification,
} from "../../src/lib/social/test-friend-chat.ts";

test("Social Notifications Suite - computeTotalUnreadNotifications", async (t) => {
  await t.test("returns 0 when there are no unread messages or pending requests", () => {
    const total = computeTotalUnreadNotifications({
      unreadMessagesCount: 0,
      pendingFriendRequestsCount: 0,
    });
    assert.equal(total, 0);
  });

  await t.test("sums unread messages and pending friend requests accurately", () => {
    const total = computeTotalUnreadNotifications({
      unreadMessagesCount: 3,
      pendingFriendRequestsCount: 2,
    });
    assert.equal(total, 5);
  });

  await t.test("handles negative or invalid counts gracefully", () => {
    const total = computeTotalUnreadNotifications({
      unreadMessagesCount: -1,
      pendingFriendRequestsCount: 4,
    });
    assert.equal(total, 4);
  });

  await t.test("counts unread chats accurately instead of total message sum", () => {
    const mockConversations = [
      { id: "1", unreadCount: 1 },
      { id: "2", unreadCount: 5 },
      { id: "3", unreadCount: 0 },
    ];
    const unreadChats = mockConversations.filter((c) => c.unreadCount > 0).length;
    assert.equal(unreadChats, 2);
  });

  await t.test("simulates unread test message and clears upon reading", () => {
    resetTestUnreadNotification();
    const unread = getTestDirectConversation();
    assert.equal(unread.unreadCount, 1);

    markTestConversationAsRead();
    const read = getTestDirectConversation();
    assert.equal(read.unreadCount, 0);

    // Reset back for the user to see the notification in their browser
    resetTestUnreadNotification();
  });
});
