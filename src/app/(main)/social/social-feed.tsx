// Client: Feed reactivo de la tertulia comunitaria con gestión optimista de mensajes
"use client";

import { useState } from "react";
import { PostComposer } from "./post-composer";
import { PostCard } from "./post-card";
import type { SocialPost } from "@/lib/social/types";

interface SocialFeedProps {
  readonly initialPosts: readonly SocialPost[];
}

export function SocialFeed({ initialPosts }: SocialFeedProps) {
  const [posts, setPosts] = useState<readonly SocialPost[]>(initialPosts);

  const handlePostCreated = (newPost: SocialPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleAddReply = (parentId: string, newReply: SocialPost) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === parentId) {
          const currentReplies = p.replies ?? [];
          return {
            ...p,
            repliesCount: p.repliesCount + 1,
            replies: [...currentReplies, newReply],
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-6">
      <PostComposer onPostCreated={handlePostCreated} />

      <section aria-label="Temas de la tertulia" className="space-y-4">
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
              onAddReply={handleAddReply}
            />
          ))
        )}
      </section>
    </div>
  );
}
