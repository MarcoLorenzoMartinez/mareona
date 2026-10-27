// Client: Feed reactivo de la tertulia con navegación en hilo estilo Twitter / muñeca rusa y panel de amigos
"use client";

import { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/context/auth-context";
import { PostComposer } from "./post-composer";
import { PostCard } from "./post-card";
import { ThreadView } from "./thread-view";
import { FriendsModal } from "./friends-modal";
import { UserProfileModal } from "./user-profile-modal";
import { FeedTabSelector, type SocialFeedTab } from "./feed-tab-selector";
import { getSocialPosts } from "@/lib/social/actions";
import {
  findPostInTree,
  findParentInTree,
  addReplyToTree,
} from "@/lib/social/post-tree";
import type { SocialPost } from "@/lib/social/types";

interface SocialFeedProps {
  readonly initialPosts: readonly SocialPost[];
}

export function SocialFeed({ initialPosts }: SocialFeedProps) {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<SocialFeedTab>("all");
  const [posts, setPosts] = useState<readonly SocialPost[]>(initialPosts);
  const [navigationStack, setNavigationStack] = useState<readonly string[]>([]);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
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

  const handlePushThread = (postId: string) => {
    setNavigationStack((prev) => [...prev, postId]);
  };

  const handlePopThread = () => {
    setNavigationStack((prev) => prev.slice(0, -1));
  };

  const handleAddReply = (parentId: string, newReply: SocialPost) => {
    setPosts((prev) => addReplyToTree(prev, parentId, newReply));
  };

  // Tecla Escape para volver al nivel anterior en la muñeca rusa
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
    <div className="space-y-6">
      {focusedPost ? (
        <ThreadView
          post={focusedPost}
          parentPost={parentPost}
          onBack={handlePopThread}
          onDrillDown={handlePushThread}
          onAddReply={handleAddReply}
          onOpenProfile={(id) => setViewingProfileId(id)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <FeedTabSelector activeTab={activeTab} onTabChange={handleTabChange} />

            <div className="flex items-center gap-2">
              <FriendsModal onOpenProfile={(id) => setViewingProfileId(id)} />
              <PostComposer onPostCreated={handlePostCreated} />
            </div>
          </div>

          <section
            aria-label="Temas de la tertulia"
            className={`space-y-3.5 transition-opacity duration-150 ${
              isPendingFilter ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center bg-white">
                <p className="text-sm font-semibold text-neutral-600">
                  {activeTab === "friends"
                    ? "Tus amigos aún no han publicado temas en la tertulia."
                    : "Aún no hay temas en la tertulia."}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  {activeTab === "friends"
                    ? "Conecta con otros aficionados del Sporting desde el botón Amigos o en la pestaña Todos."
                    : "¡Sé el primer aficionado en abrir la conversación!"}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenThread={handlePushThread}
                  onOpenProfile={(id) => setViewingProfileId(id)}
                />
              ))
            )}
          </section>
        </>
      )}

      {/* Modal de perfil al hacer click en cualquier aficionado */}
      <UserProfileModal
        userId={viewingProfileId}
        onClose={() => setViewingProfileId(null)}
        onOpenThread={handlePushThread}
      />
    </div>
  );
}
