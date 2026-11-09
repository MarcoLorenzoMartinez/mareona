import type { AdminAuditLog } from "@/lib/admin/types";

interface AuditLogsTableProps {
  readonly logs: readonly AdminAuditLog[];
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  ban_user: { label: "Sanción de usuario", color: "bg-rose-50 text-rose-800 border-rose-200" },
  unban_user: { label: "Levantar sanción", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  reset_avatar: { label: "Restablecer avatar", color: "bg-amber-50 text-amber-800 border-amber-200" },
  approve_post: { label: "Aprobar publicación", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  soft_delete_post: { label: "Retirar publicación", color: "bg-rose-50 text-rose-800 border-rose-200" },
  restore_post: { label: "Restaurar publicación", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  update_announcement: { label: "Emitir aviso global", color: "bg-neutral-100 text-neutral-800 border-neutral-300" },
  toggle_announcement: { label: "Alternar aviso", color: "bg-neutral-100 text-neutral-800 border-neutral-300" },
  purge_sports_cache: { label: "Purgar caché deportiva", color: "bg-neutral-100 text-neutral-800 border-neutral-300" },
};

/**
 * Immutable administrative audit trail for accountability and compliance.
 */
export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div
        className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted-foreground)]"
        role="status"
      >
        <p className="text-base font-semibold text-[var(--foreground)]">
          Pista de auditoría limpia
        </p>
        <p className="mt-1 text-sm">
          Aún no se han ejecutado acciones administrativas en la plataforma.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white shadow-xs">
      <table className="w-full text-left text-sm text-[var(--foreground)]">
        <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
          <tr>
            <th scope="col" className="px-4 py-3">Fecha y Hora</th>
            <th scope="col" className="px-4 py-3">Acción</th>
            <th scope="col" className="px-4 py-3">Objetivo</th>
            <th scope="col" className="px-4 py-3">Detalles</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {logs.map((log) => {
            const actionConfig = ACTION_LABELS[log.action] ?? {
              label: log.action,
              color: "bg-neutral-100 text-neutral-800 border-neutral-300",
            };
            const metaString = Object.entries(log.metadata)
              .map(([k, v]) => `${k}: ${String(v)}`)
              .join(" | ");

            return (
              <tr key={log.id} className="hover:bg-[var(--surface)] transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-xs text-[var(--muted-foreground)] tabular-nums">
                  {new Date(log.createdAt).toLocaleString("es-ES", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${actionConfig.color}`}>
                    {actionConfig.label}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-[var(--foreground)]">
                  {log.targetType}: <span className="text-[var(--muted-foreground)] tabular-nums">{log.targetId.slice(0, 16)}</span>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--muted-foreground)] max-w-sm truncate">
                  <span title={metaString}>{metaString || "Sin metadatos adicionales"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
