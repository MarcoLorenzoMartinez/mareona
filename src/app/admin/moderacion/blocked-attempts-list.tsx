import type { BlockedAttemptItem } from "@/lib/admin/moderation-actions";

interface BlockedAttemptsListProps {
  readonly attempts: readonly BlockedAttemptItem[];
}

/**
 * Audit table displaying rejected publication attempts blocked automatically by moderation filters.
 * Tabular, compact layout without decorative clutter.
 */
export function BlockedAttemptsList({ attempts }: BlockedAttemptsListProps) {
  if (attempts.length === 0) {
    return (
      <div
        className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted-foreground)]"
        role="status"
      >
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Sin bloqueos recientes
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white shadow-xs">
      <table className="w-full text-left text-sm text-[var(--foreground)]">
        <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--muted-foreground)]">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Fecha</th>
            <th scope="col" className="px-4 py-3 font-semibold">Usuario</th>
            <th scope="col" className="px-4 py-3 font-semibold">Motivo</th>
            <th scope="col" className="px-4 py-3 font-semibold">Texto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {attempts.map((attempt) => (
            <tr key={attempt.id} className="hover:bg-[var(--surface)] transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-xs text-[var(--muted-foreground)] tabular-nums">
                {new Date(attempt.createdAt).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-semibold text-xs">{attempt.author.displayName || attempt.author.username}</span>
                <span className="ml-1 text-xs text-[var(--muted-foreground)]">@{attempt.author.username}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-xs font-medium text-rose-800">
                  {attempt.reason || "Filtro tóxico"}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-[var(--foreground)] break-words leading-relaxed max-w-lg">
                <span>{attempt.body}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
