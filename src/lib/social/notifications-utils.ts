export interface NotificationCountsInput {
  readonly unreadMessagesCount: number;
  readonly pendingFriendRequestsCount: number;
}

/**
 * Computes the total unread social notifications, ensuring counts are non-negative.
 *
 * @param input - The breakdown of unread messages and friend requests.
 * @returns Total sanitized count of pending items.
 */
export function computeTotalUnreadNotifications(input: NotificationCountsInput): number {
  const dms = Math.max(0, input.unreadMessagesCount || 0);
  const requests = Math.max(0, input.pendingFriendRequestsCount || 0);
  return dms + requests;
}
