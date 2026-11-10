// Client: Línea de tiempo de publicaciones con compositor y lista de tarjetas
"use client";

import { PostComposer } from "./post-composer";
import { PostCard } from "./post-card";
import type { SocialPost } from "@/lib/social/types";
import type { SocialFeedTab } from "./feed-tab-selector";

interface SocialTimelineProps {
  readonly posts: readonly SocialPost[];
  readonly activeTab: SocialFeedTab;
  readonly isPendingFilter: boolean;
  readonly onPostCreated: (post: SocialPost) => void;
  readonly onPushThread: (postId: string) => void;
  readonly onOpenProfile: (userId: string) => void;
  readonly onDeletePost: (postId: string) => void;
}

export function SocialTimeline({
  posts,
  activeTab,
  isPendingFilter,
  onPostCreated,
  onPushThread,
  onOpenProfile,
  onDeletePost,
}: SocialTimelineProps) {
  return (
    <>
      <PostComposer onPosted={onPostCreated} className="hidden sm:flex" />

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
              onOpenThread={onPushThread}
              onOpenProfile={onOpenProfile}
              onDelete={onDeletePost}
            />
          ))
        )}
      </section>
    </>
  );
}
