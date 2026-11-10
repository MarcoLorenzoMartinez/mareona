export interface DirectMessage {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly senderUsername: string;
  readonly senderAvatar: string | null;
  readonly body: string;
  readonly createdAt: string;
  readonly isMine: boolean;
}

export interface DirectConversationSummary {
  readonly id: string;
  readonly otherUserId: string;
  readonly otherUserName: string;
  readonly otherUserUsername: string;
  readonly otherUserAvatar: string | null;
  readonly lastMessageBody: string | null;
  readonly lastMessageCreatedAt: string | null;
  readonly unreadCount: number;
}
