// Client: Feed reactivo de la tertulia con navegación en hilo, encuestas, compartir y borrado propio
"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { PostComposer } from "./post-composer";
import { MobilePostComposerModal, MobilePostComposerFab } from "./mobile-post-composer";
import { PostCard } from "./post-card";
import { ThreadView } from "./thread-view";
import { FriendsModal } from "./friends-modal";
import { UserProfileModal } from "./user-profile-modal";
import { FeedTabSelector, type SocialFeedTab } from "./feed-tab-selector";
import { getSocialPosts, deleteSocialPost } from "@/lib/social/actions";
import {
  findPostInTree,
  findParentInTree,
  addReplyToTree,
  removePostFromTree,
} from "@/lib/social/post-tree";
import type { SocialPost } from "@/lib/social/types";

interface SocialFeedProps {
  readonly initialPosts: readonly SocialPost[];
}

export function SocialFeed({ initialPosts }: SocialFeedProps) {
  const { user, openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SocialFeedTab>("all");
  const [posts, setPosts] = useState<readonly SocialPost[]>(initialPosts);
  const [navigationStack, setNavigationStack] = useState<readonly string[]>(() => {
    const sharedPostId = searchParams.get("post");
    if (sharedPostId && findPostInTree(initialPosts, sharedPostId)) {
      return [sharedPostId];
    }
    return [];
  });
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isMobileComposerOpen, setIsMobileComposerOpen] = useState(false);
  const [isPendingFilter, startTransition] = useTransition();

  const handleTabChange = (tab: SocialFeedTab) => {
    if (tab === "friends" && !user) {
      openAuthModal("signin");
      return;
    }

    setActiveTab(tab);
    startTransition(async () => {
      const filtered = await getSocialPosts(tab);
      setPosts(filtered);
    });
  };

  const handlePostCreated = (newPost: SocialPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => removePostFromTree(prev, postId));
    if (navigationStack.includes(postId)) {
      setNavigationStack((prev) => prev.filter((id) => id !== postId));
    }
    await deleteSocialPost({ postId });
  };

  const handlePushThread = (postId: string) => {
    setNavigationStack((prev) => [...prev, postId]);
  };

  const handlePopThread = () => {
    setNavigationStack((prev) => prev.slice(0, -1));
  };

  const handleAddReply = (parentId: string, newReply: SocialPost) => {
    setPosts((prev) => addReplyToTree(prev, parentId, newReply));
  };

  useEffect(() => {
    if (navigationStack.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlePopThread();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigationStack.length]);

  const activePostId = navigationStack[navigationStack.length - 1];
  const focusedPost = activePostId ? findPostInTree(posts, activePostId) : null;
  const parentPost = activePostId ? findParentInTree(posts, activePostId) : null;

  return (
    <div className="w-full rounded-2xl border border-[var(--border)] bg-white overflow-hidden shadow-2xs">
      {focusedPost ? (
        <ThreadView
          post={focusedPost}
          parentPost={parentPost}
          onBack={handlePopThread}
          onDrillDown={handlePushThread}
          onAddReply={handleAddReply}
          onOpenProfile={(id) => setViewingProfileId(id)}
          onDeletePost={handleDeletePost}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-white px-4 py-2">
            <FeedTabSelector activeTab={activeTab} onTabChange={handleTabChange} />
            <FriendsModal onOpenProfile={(id) => setViewingProfileId(id)} />
          </div>

          <PostComposer onPosted={handlePostCreated} className="hidden sm:flex" />

          <section
            aria-label="Publicaciones de la tertulia"
            aria-busy={isPendingFilter}
            className={`transition-opacity duration-150 ${
              isPendingFilter ? "pointer-events-none opacity-50" : "opacity-100"
            }`}
          >
            {posts.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm font-semibold text-neutral-600">
                {activeTab === "friends"
                  ? "Tus amigos aún no han publicado"
                  : "Aún no hay publicaciones"}
              </p>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenThread={handlePushThread}
                  onOpenProfile={(id) => setViewingProfileId(id)}
                  onDelete={handleDeletePost}
                />
              ))
            )}
          </section>
        </>
      )}

      <UserProfileModal
        userId={viewingProfileId}
        onClose={() => setViewingProfileId(null)}
        onOpenThread={handlePushThread}
      />

      <MobilePostComposerFab
        onClick={() => {
          if (!user) {
            openAuthModal("signin");
            return;
          }
          setIsMobileComposerOpen(true);
        }}
      />
      <MobilePostComposerModal
        isOpen={isMobileComposerOpen}
        onClose={() => setIsMobileComposerOpen(false)}
        onPosted={handlePostCreated}
      />
    </div>
  );
}
