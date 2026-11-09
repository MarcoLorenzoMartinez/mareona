import { getFlaggedPosts, getBlockedAttempts } from "@/lib/admin/moderation-actions";
import { FlaggedPostsList } from "./flagged-posts-list";
import { BlockedAttemptsList } from "./blocked-attempts-list";

export const metadata = {
  title: "Moderación | Mareona Admin",
  description: "Revisión y control disciplinario de publicaciones",
};

/**
 * Server page for UGC moderation.
 * Direct inspection without verbose AI copy or decorative capsule clutter.
 */
export default async function ModerationAdminPage() {
  const [flaggedPosts, blockedAttempts] = await Promise.all([
    getFlaggedPosts(),
    getBlockedAttempts(),
  ]);

  return (
    <div className="space-y-10 py-2">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
            Pendientes de revisión
          </h1>
          <span className="text-xs font-medium text-[var(--muted-foreground)] tabular-nums">
            {flaggedPosts.length} pendiente{flaggedPosts.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4">
          <FlaggedPostsList posts={flaggedPosts} />
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">
            Bloqueos automáticos
          </h2>
          <span className="text-xs font-medium text-[var(--muted-foreground)] tabular-nums">
            {blockedAttempts.length} registro{blockedAttempts.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4">
          <BlockedAttemptsList attempts={blockedAttempts} />
        </div>
      </div>
    </div>
  );
}
