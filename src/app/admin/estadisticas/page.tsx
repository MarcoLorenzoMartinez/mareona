import { getAdminProductMetrics, getAdminAuditLogs } from "@/lib/admin/stats-actions";
import { StatsKpiCards } from "./stats-kpi-cards";
import { AuditLogsTable } from "./audit-logs-table";

export const metadata = {
  title: "Métricas y Salud | Mareona Admin",
  description: "Telemetría de producto y registro inmutable de auditoría en Mareona",
};

/**
 * Server page for platform engagement metrics and administrative audit logs.
 */
export default async function StatsAdminPage() {
  const [metrics, logs] = await Promise.all([
    getAdminProductMetrics(),
    getAdminAuditLogs(40),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          Métricas de Plataforma y Salud
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Indicadores en tiempo real sin cookies de terceros y registro de trazabilidad interna.
        </p>

        <div className="mt-4">
          <StatsKpiCards metrics={metrics} />
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
            Pista Inmutable de Auditoría
          </h2>
          <span className="text-xs text-[var(--muted-foreground)] tabular-nums">
            Últimas {logs.length} acciones registradas
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Registro de seguridad con todas las operaciones ejecutadas por administradores.
        </p>

        <div className="mt-4">
          <AuditLogsTable logs={logs} />
        </div>
      </div>
    </div>
  );
}
