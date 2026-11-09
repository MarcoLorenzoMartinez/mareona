import type { FlaggedPostItem } from "@/lib/admin/moderation-actions";
import { ModerationActionButtons } from "./moderation-action-buttons";

interface FlaggedPostsListProps {
  readonly posts: readonly FlaggedPostItem[];
}

/**
 * Server component rendering the list of flagged posts pending administrative decision.
 * Strictly adheres to AGENTS.md: zero mono fonts, tabular numbers, clean card hierarchy.
 */
export function FlaggedPostsList({ posts }: FlaggedPostsListProps) {
  if (posts.length === 0) {
    return (
      <div
        className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted-foreground)]"
        role="status"
      >
        <p className="text-sm font-semibold text-[var(--foreground)]">
          No hay publicaciones pendientes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="feed" aria-label="Publicaciones pendientes de revisión">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--foreground)] text-sm">
                {post.author.displayName || post.author.username}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                @{post.author.username}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {post.moderationReason || "Marcado para revisión"}
              </span>
              <time
                dateTime={post.createdAt}
                className="text-xs text-[var(--muted-foreground)] tabular-nums"
              >
                {new Date(post.createdAt).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </time>
            </div>
          </div>

          <p className="mt-3 text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
            {post.body}
          </p>

          <ModerationActionButtons postId={post.id} />
        </article>
      ))}
    </div>
  );
}
