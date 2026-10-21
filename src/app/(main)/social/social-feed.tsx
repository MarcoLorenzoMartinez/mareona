// Client: Feed reactivo de la tertulia con navegación en hilo estilo Twitter / muñeca rusa
"use client";

import { useState, useEffect } from "react";
import { PostComposer } from "./post-composer";
import { PostCard } from "./post-card";
import { ThreadView } from "./thread-view";
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
  const [posts, setPosts] = useState<readonly SocialPost[]>(initialPosts);
  const [navigationStack, setNavigationStack] = useState<readonly string[]>([]);

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
        />
      ) : (
        <>
          <PostComposer onPostCreated={handlePostCreated} />

          <section aria-label="Temas de la tertulia" className="space-y-3.5">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center bg-white">
                <p className="text-sm font-semibold text-neutral-600">
                  Aún no hay temas en la tertulia.
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  ¡Sé el primer aficionado en abrir la conversación!
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenThread={handlePushThread}
                />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
