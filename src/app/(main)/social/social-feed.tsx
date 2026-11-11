// Client: Feed reactivo de la tertulia con mensajes directos, hilos y gestión comunitaria
"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/context/auth-context";
import { ThreadView } from "./thread-view";
import { SocialFeedHeader } from "./social-feed-header";
import { UserProfileModal } from "./user-profile-modal";
import { SocialTimeline } from "./social-timeline";
import { DirectMessagesInbox } from "./direct-messages-inbox";
import { DirectChatView } from "./direct-chat-view";
import { SocialMobileComposerSection } from "./social-mobile-composer-section";
import { useSocialThreadNavigation } from "./use-social-thread-navigation";
import { getSocialPosts, deleteSocialPost } from "@/lib/social/actions";
import { getOrCreateConversationWithFriend } from "@/lib/social/direct-messages-actions";
import {
  useSocialNotifications,
  refreshSocialNotifications,
} from "@/components/layout/use-social-notifications";
import { addReplyToTree, removePostFromTree } from "@/lib/social/post-tree";
import type { SocialFeedTab } from "./feed-tab-selector";
import type { SocialPost } from "@/lib/social/types";

interface SocialFeedProps {
  readonly initialPosts: readonly SocialPost[];
}

export function SocialFeed({ initialPosts }: SocialFeedProps) {
  const { user, openAuthModal } = useAuth();
  const socialNotifications = useSocialNotifications();
  const [activeTab, setActiveTab] = useState<SocialFeedTab>("all");
  const [posts, setPosts] = useState<readonly SocialPost[]>(initialPosts);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isPendingFilter, startTransition] = useTransition();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<{
    readonly id: string;
    readonly name: string;
    readonly username: string;
    readonly avatarUrl: string | null;
  } | null>(null);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [friendsModalTab, setFriendsModalTab] = useState<"friends" | "search">("friends");

  const {
    focusedPost,
    parentPost,
    handlePushThread,
    handlePopThread,
    removePostFromStack,
  } = useSocialThreadNavigation(posts, initialPosts);

  const handleTabChange = (tab: SocialFeedTab) => {
    if ((tab === "friends" || tab === "messages") && !user) {
      openAuthModal("signin");
      return;
    }
    setActiveTab(tab);
    setActiveConversationId(null);
    if (tab !== "messages") {
      startTransition(async () => {
        const filtered = await getSocialPosts(tab);
        setPosts(filtered);
      });
    }
  };

  const handleStartChatWithUser = async (targetUser: {
    readonly id: string;
    readonly name: string;
    readonly username: string;
    readonly avatarUrl: string | null;
  }) => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    const res = await getOrCreateConversationWithFriend({ targetUserId: targetUser.id });
    if (res.success && res.data) {
      setActiveTab("messages");
      setActiveConversationId(res.data.conversationId);
      setActiveChatUser(targetUser);
    }
  };

  const handlePostCreated = (newPost: SocialPost) => setPosts((prev) => [newPost, ...prev]);
  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => removePostFromTree(prev, postId));
    removePostFromStack(postId);
    await deleteSocialPost({ postId });
  };

  return (
    <div className="w-full rounded-2xl border border-[var(--border)] bg-white overflow-hidden shadow-2xs">
      {focusedPost ? (
        <ThreadView
          post={focusedPost}
          parentPost={parentPost}
          onBack={handlePopThread}
          onDrillDown={handlePushThread}
          onAddReply={(parentId, reply) => setPosts((prev) => addReplyToTree(prev, parentId, reply))}
          onOpenProfile={(id) => setViewingProfileId(id)}
          onDeletePost={handleDeletePost}
        />
      ) : (
        <>
          <SocialFeedHeader
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onOpenProfile={(id) => setViewingProfileId(id)}
            unreadMessagesCount={socialNotifications.unreadMessagesCount}
            isFriendsOpen={isFriendsOpen}
            onFriendsOpenChange={setIsFriendsOpen}
            friendsModalTab={friendsModalTab}
            onStartChat={(f) => handleStartChatWithUser({ id: f.id, name: f.displayName || f.username, username: f.username, avatarUrl: f.avatarUrl })}
          />

          {activeTab === "messages" ? (
            activeConversationId && activeChatUser ? (
              <DirectChatView
                conversationId={activeConversationId}
                otherUser={activeChatUser}
                onBack={() => { setActiveConversationId(null); setActiveChatUser(null); void refreshSocialNotifications(); }}
                onOpenProfile={(id) => setViewingProfileId(id)}
              />
            ) : (
              <DirectMessagesInbox
                onOpenConversation={(convId, other) => { setActiveConversationId(convId); setActiveChatUser(other); }}
                onOpenFriends={() => {
                  if (!user) { openAuthModal("signin"); return; }
                  setFriendsModalTab("friends");
                  setIsFriendsOpen(true);
                }}
              />
            )
          ) : (
            <SocialTimeline
              posts={posts}
              activeTab={activeTab}
              isPendingFilter={isPendingFilter}
              onPostCreated={handlePostCreated}
              onPushThread={handlePushThread}
              onOpenProfile={(id) => setViewingProfileId(id)}
              onDeletePost={handleDeletePost}
            />
          )}
        </>
      )}

      <UserProfileModal
        userId={viewingProfileId}
        onClose={() => setViewingProfileId(null)}
        onOpenThread={handlePushThread}
        onStartChat={handleStartChatWithUser}
      />

      {activeTab !== "messages" && (
        <SocialMobileComposerSection
          onPosted={handlePostCreated}
          onOpenAuth={() => openAuthModal("signin")}
          isAuthenticated={Boolean(user)}
        />
      )}
    </div>
  );
}
