import { getFlaggedPosts, getBlockedAttempts } from "@/lib/admin/moderation-actions";
import { FlaggedPostsList } from "./flagged-posts-list";
import { BlockedAttemptsList } from "./blocked-attempts-list";

/**
 * Metadata for the administrative moderation module.
 */
export const metadata = {
  title: "Moderación de Contenido | Mareona Admin",
  description: "Revisión de mensajes marcados por IA y registro de bloqueos en Mareona",
};

/**
 * Server page for UGC moderation.
 * Fetches flagged posts awaiting human approval and blocked publication attempts.
 */
export default async function ModerationAdminPage() {
  const [flaggedPosts, blockedAttempts] = await Promise.all([
    getFlaggedPosts(),
    getBlockedAttempts(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Cola de Moderación
          </h1>
          <span className="inline-flex items-center rounded-full bg-[var(--surface)] border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--foreground)] tabular-nums">
            {flaggedPosts.length} pendiente{flaggedPosts.length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Publicaciones marcadas automáticamente por el motor de IA para verificación humana.
        </p>

        <div className="mt-4">
          <FlaggedPostsList posts={flaggedPosts} />
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
            Registro de Bloqueos Automáticos
          </h2>
          <span className="text-xs text-[var(--muted-foreground)] tabular-nums">
            Últimos {blockedAttempts.length} intentos
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Intentos de publicación rechazados en el cliente antes de ser emitidos a la tertulia.
        </p>

        <div className="mt-4">
          <BlockedAttemptsList attempts={blockedAttempts} />
        </div>
      </div>
    </div>
  );
}
