import type { BlockedAttemptItem } from "@/lib/admin/moderation-actions";

interface BlockedAttemptsListProps {
  readonly attempts: readonly BlockedAttemptItem[];
}

/**
 * Audit table displaying rejected publication attempts blocked automatically by the AI filter.
 * Helps administrators identify repeat offenders and potential filter bypass attempts.
 */
export function BlockedAttemptsList({ attempts }: BlockedAttemptsListProps) {
  if (attempts.length === 0) {
    return (
      <div
        className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted-foreground)]"
        role="status"
      >
        <p className="text-base font-semibold text-[var(--foreground)]">
          Sin infracciones automáticas registradas
        </p>
        <p className="mt-1 text-sm">
          No hay intentos de publicación bloqueados por el filtro de IA recientemente.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white shadow-xs">
      <table className="w-full text-left text-sm text-[var(--foreground)]">
        <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
          <tr>
            <th scope="col" className="px-4 py-3">Fecha</th>
            <th scope="col" className="px-4 py-3">Usuario</th>
            <th scope="col" className="px-4 py-3">Motivo Detección</th>
            <th scope="col" className="px-4 py-3">Texto Rechazado</th>
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
                <span className="font-semibold">{attempt.author.displayName || attempt.author.username}</span>
                <span className="ml-1 text-xs text-[var(--muted-foreground)]">@{attempt.author.username}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-xs font-semibold text-rose-800">
                  {attempt.reason || "Filtro tóxico"}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-[var(--muted-foreground)] max-w-md truncate">
                <span title={attempt.body}>{attempt.body}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
