// Client: Sección de mensajería directa (bandeja o chat activo) en el feed social
"use client";

import { DirectMessagesInbox } from "./direct-messages-inbox";
import { DirectChatView } from "./direct-chat-view";

export interface ChatUserPreview {
  readonly id: string;
  readonly name: string;
  readonly username: string;
  readonly avatarUrl: string | null;
}

interface SocialMessagesSectionProps {
  readonly activeConversationId: string | null;
  readonly activeChatUser: ChatUserPreview | null;
  readonly onBackFromChat: () => void;
  readonly onOpenConversation: (conversationId: string, otherUser: ChatUserPreview) => void;
  readonly onOpenProfile: (userId: string) => void;
  readonly onOpenFriends: () => void;
}

export function SocialMessagesSection({
  activeConversationId,
  activeChatUser,
  onBackFromChat,
  onOpenConversation,
  onOpenProfile,
  onOpenFriends,
}: SocialMessagesSectionProps) {
  if (activeConversationId && activeChatUser) {
    return (
      <DirectChatView
        conversationId={activeConversationId}
        otherUser={activeChatUser}
        onBack={onBackFromChat}
        onOpenProfile={onOpenProfile}
      />
    );
  }

  return (
    <DirectMessagesInbox
      onOpenConversation={onOpenConversation}
      onOpenFriends={onOpenFriends}
    />
  );
}
