import type { FlaggedPostItem } from "@/lib/admin/moderation-actions";
import { ModerationActionButtons } from "./moderation-action-buttons";

interface FlaggedPostsListProps {
  readonly posts: readonly FlaggedPostItem[];
}

/**
 * Server component rendering the list of flagged posts pending administrative decision.
 * Strict adherence to AGENTS.md: zero mono fonts, tabular numbers, sober card hierarchy.
 */
export function FlaggedPostsList({ posts }: FlaggedPostsListProps) {
  if (posts.length === 0) {
    return (
      <div
        className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted-foreground)]"
        role="status"
      >
        <p className="text-base font-semibold text-[var(--foreground)]">
          Bandeja de moderación limpia
        </p>
        <p className="mt-1 text-sm">
          No hay publicaciones pendientes de revisión en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="feed" aria-label="Publicaciones pendientes de revisión">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm"
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
              <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                Alerta IA: {post.moderationReason || "Contenido sospechoso"}
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
