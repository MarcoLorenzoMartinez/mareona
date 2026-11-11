import {
  getAdminProductMetrics,
  getAdminPlatformAnalytics,
  getAdminAuditLogs,
} from "@/lib/admin/stats-actions";
import { StatsKpiCards } from "./stats-kpi-cards";
import { TrafficAreaChart } from "./traffic-area-chart";
import { HourlyTrafficChart } from "./hourly-traffic-chart";
import { SectionUsageBars } from "./section-usage-bars";
import { DeviceDonutChart } from "./device-donut-chart";
import { GeographicOriginBars } from "./geographic-origin-bars";
import { SessionQualityCard } from "./session-quality-card";
import { TopPagesCard } from "./top-pages-card";
import { AuditLogsTable } from "./audit-logs-table";

export const metadata = {
  title: "Métricas | Mareona Admin",
  description: "Indicadores de tráfico, actividad y registro de auditoría",
};

/**
 * Server page for platform metrics, visual analytics charts, and administrative audit logs.
 */
export default async function StatsAdminPage() {
  const [metrics, analytics, logs] = await Promise.all([
    getAdminProductMetrics(),
    getAdminPlatformAnalytics(),
    getAdminAuditLogs(40),
  ]);

  return (
    <div className="space-y-8 py-2">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
          Métricas
        </h1>

        <div className="mt-4">
          <StatsKpiCards metrics={metrics} />
        </div>
      </div>

      {/* Main Traffic Area Chart */}
      <div>
        <TrafficAreaChart points={analytics.dailyTraffic} />
      </div>

      {/* Visual Analytics Grid: 3x2 Symmetrical Cards (6 modules) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
        <HourlyTrafficChart hours={analytics.hourlyTraffic} />
        <SectionUsageBars sections={analytics.sectionUsage} />
        <GeographicOriginBars
          provinces={analytics.geographicProvinces}
          countries={analytics.geographicCountries}
        />
        <DeviceDonutChart
          devices={analytics.deviceUsage}
          accessModes={analytics.accessModes}
          matchDayMultiplier={analytics.matchDayMultiplier}
        />
        <SessionQualityCard
          avgSessionMinutes={analytics.avgSessionMinutes}
          bounceRatePercentage={analytics.bounceRatePercentage}
          pagesPerSession={analytics.pagesPerSession}
        />
        <TopPagesCard pages={analytics.topPages} />
      </div>

      {/* Audit Log Table */}
      <div className="border-t border-[var(--border)] pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">
            Registro de auditoría
          </h2>
          <span className="text-xs font-medium text-[var(--muted-foreground)] tabular-nums">
            {logs.length} registros
          </span>
        </div>

        <div className="mt-4">
          <AuditLogsTable logs={logs} />
        </div>
      </div>
    </div>
  );
}
