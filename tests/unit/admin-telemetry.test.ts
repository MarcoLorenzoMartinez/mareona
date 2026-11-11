import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveProvinceName, resolveCountryName } from "../../src/lib/telemetry/geolocation.ts";
import { computePlatformAnalytics } from "../../src/lib/telemetry/analytics-calculator.ts";
import type { Database } from "../../src/types/database.types.ts";

type SiteVisitRow = Database["public"]["Tables"]["site_visits"]["Row"];

describe("Telemetry & Cookieless Analytics Suite", () => {
  describe("Geolocation Resolution", () => {
    it("maps regional codes and Asturian cities to canonical names", () => {
      assert.equal(resolveProvinceName("AS", null), "Asturias");
      assert.equal(resolveProvinceName(null, "Gijón"), "Asturias");
      assert.equal(resolveProvinceName(null, "gijon"), "Asturias");
      assert.equal(resolveProvinceName(null, "Oviedo"), "Asturias");
      assert.equal(resolveProvinceName("MD", "Madrid"), "Madrid");
      assert.equal(resolveProvinceName("LE", "Ponferrada"), "León");
      assert.equal(resolveProvinceName(null, null), "Asturias");
    });

    it("maps country codes to Spanish localized names", () => {
      assert.equal(resolveCountryName("ES"), "España");
      assert.equal(resolveCountryName("es"), "España");
      assert.equal(resolveCountryName("MX"), "México");
      assert.equal(resolveCountryName("FR"), "Francia");
      assert.equal(resolveCountryName("GB"), "Reino Unido");
      assert.equal(resolveCountryName(null), "España");
      assert.equal(resolveCountryName("XX"), "Otros");
    });
  });

  describe("Analytics Aggregation Engine", () => {
    it("handles empty database state safely without NaN or division by zero", () => {
      const analytics = computePlatformAnalytics([]);

      assert.equal(analytics.dailyTraffic.length, 14);
      assert.equal(analytics.hourlyTraffic.length, 24);
      assert.equal(analytics.deviceUsage.length, 2);
      assert.equal(analytics.accessModes.length, 2);

      // Verify no NaN or undefined values in metrics
      assert.equal(Number.isNaN(analytics.avgSessionMinutes), false);
      assert.equal(Number.isNaN(analytics.bounceRatePercentage), false);
      assert.ok(analytics.dailyTraffic.every((d) => d.visits === 0 && d.uniqueVisitors === 0));
      assert.ok(analytics.hourlyTraffic.every((h) => h.count === 0 && h.percentage === 0));
    });

    it("aggregates visits, unique sessions, devices, and sections accurately", () => {
      const todayIso = new Date().toISOString();
      const mockRows: SiteVisitRow[] = [
        {
          id: 1,
          pathname: "/temporada",
          device_type: "mobile",
          is_pwa: true,
          session_id: "session-1",
          duration_seconds: 120,
          country: "España",
          province: "Asturias",
          created_at: todayIso,
        },
        {
          id: 2,
          pathname: "/temporada/clasificacion",
          device_type: "mobile",
          is_pwa: true,
          session_id: "session-1", // Same session
          duration_seconds: 180,
          country: "España",
          province: "Asturias",
          created_at: todayIso,
        },
        {
          id: 3,
          pathname: "/juegos/porra",
          device_type: "desktop",
          is_pwa: false,
          session_id: "session-2",
          duration_seconds: 60,
          country: "España",
          province: "Madrid",
          created_at: todayIso,
        },
      ];

      const analytics = computePlatformAnalytics(mockRows);

      // Total visits in today's point
      const todayPoint = analytics.dailyTraffic[analytics.dailyTraffic.length - 1];
      assert.equal(todayPoint.visits, 3);
      assert.equal(todayPoint.uniqueVisitors, 2); // 2 distinct sessions

      // Sections
      const seasonSection = analytics.sectionUsage.find((s) => s.key === "temporada");
      assert.ok(seasonSection);
      assert.equal(seasonSection.visits, 2);

      const gamesSection = analytics.sectionUsage.find((s) => s.key === "juegos");
      assert.ok(gamesSection);
      assert.equal(gamesSection.visits, 1);

      // Devices: 2 mobile, 1 desktop
      const mobileDev = analytics.deviceUsage.find((d) => d.device === "mobile");
      assert.equal(mobileDev?.count, 2);
      const desktopDev = analytics.deviceUsage.find((d) => d.device === "desktop");
      assert.equal(desktopDev?.count, 1);

      // Access Modes: 2 PWA, 1 browser
      const pwaMode = analytics.accessModes.find((m) => m.mode === "pwa");
      assert.equal(pwaMode?.count, 2);
      const browserMode = analytics.accessModes.find((m) => m.mode === "browser");
      assert.equal(browserMode?.count, 1);

      // Provinces
      assert.equal(analytics.geographicProvinces[0].label, "Asturias");
      assert.equal(analytics.geographicProvinces[0].visits, 2);

      // Average duration (120 + 180 + 60) / 3 = 120s = 2.0 min
      assert.equal(analytics.avgSessionMinutes, 2.0);

      // Bounce rate: session-1 had 2 pages, session-2 had 1 page => 1 / 2 = 50.0%
      assert.equal(analytics.bounceRatePercentage, 50.0);

      // Pages per session: 3 visits / 2 sessions = 1.5 pages
      assert.equal(analytics.pagesPerSession, 1.5);
      assert.ok(analytics.matchDayMultiplier >= 1.0);
    });
  });
});
