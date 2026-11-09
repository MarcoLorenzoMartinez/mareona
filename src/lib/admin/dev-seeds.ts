import type {
  AdminAuditLog,
  DisciplinaryUser,
  SystemAnnouncement,
  PlatformAnalytics,
} from "./types";
import type {
  FlaggedPostItem,
  BlockedAttemptItem,
} from "./moderation-actions";
import type { ProductHealthMetrics } from "./stats-actions";

/**
 * Realistic development seeds for testing the admin backoffice.
 * Simulates active production state (matches, active users, moderation queue, and audit trail).
 * NOTE: Scheduled for full removal before final public launch (see TODO_GO_LIVE.md).
 */

export const DEV_FLAGGED_POSTS: readonly FlaggedPostItem[] = [
  {
    id: "flagged-post-1",
    userId: "dev-user-pelayo",
    body: "A los del Oviedo les esperamos en la estación vieja antes de que llegue la policía, que sepan quién manda en Gijón.",
    moderationReason: "Sospecha de incitación a altercado entre aficiones",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    deletedAt: null,
    author: {
      username: "pelayo_gijon",
      displayName: "Pelayo Álvarez",
      avatarUrl: "/images/historical/quini-molinon.jpg",
    },
  },
  {
    id: "flagged-post-2",
    userId: "dev-user-marcos",
    body: "Consigue entradas VIP gratis para el palco de El Molinón registrándote en www.sporting-sorteo-entradas.online antes de las 20:00.",
    moderationReason: "Sospecha de estafa y enlace fraudulento",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    deletedAt: null,
    author: {
      username: "marcos_rsg",
      displayName: "Marcos Gijonés",
      avatarUrl: "/images/historical/villamarin-2015.jpg",
    },
  },
];

export const DEV_BLOCKED_ATTEMPTS: readonly BlockedAttemptItem[] = [
  {
    id: "blocked-attempt-1",
    userId: "dev-user-troll",
    body: "Sieg heil, inmigrantes fuera de Asturias y putos negros fuera del Sporting.",
    reason: "Proclamas fascistas y racismo explícito",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    author: {
      username: "troll_derbi99",
      displayName: "Aficionado99",
    },
  },
  {
    id: "blocked-attempt-2",
    userId: "dev-user-spam",
    body: "Eres un puto maricón te voy a abrir la cabeza cuando salgas del campo.",
    reason: "Homofobia flagrante y amenazas de violencia física",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    author: {
      username: "reventa_gijon",
      displayName: "Entradas Gijón",
    },
  },
];

export const DEV_ADMIN_USERS: readonly DisciplinaryUser[] = [
  {
    id: "dev-user-pelayo",
    username: "pelayo_gijon",
    displayName: "Pelayo Álvarez",
    avatarUrl: "/images/historical/quini-molinon.jpg",
    points: 420,
    isBanned: false,
    bannedUntil: null,
    bannedReason: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: "dev-user-cova",
    username: "cova_molinon",
    displayName: "Covadonga",
    avatarUrl: "/avatars/presets/bufanda.svg",
    points: 580,
    isBanned: false,
    bannedUntil: null,
    bannedReason: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
  },
  {
    id: "dev-user-nacho",
    username: "nacho_sporting",
    displayName: "Nacho RSG",
    avatarUrl: "/images/historical/el-molinon-uefa.jpg",
    points: 210,
    isBanned: false,
    bannedUntil: null,
    bannedReason: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
  {
    id: "dev-user-marcos",
    username: "marcos_rsg",
    displayName: "Marcos Gijonés",
    avatarUrl: "/images/historical/villamarin-2015.jpg",
    points: 350,
    isBanned: false,
    bannedUntil: null,
    bannedReason: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: "dev-user-troll",
    username: "troll_derbi99",
    displayName: "Aficionado99",
    avatarUrl: null,
    points: 10,
    isBanned: true,
    bannedUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    bannedReason: "Conducta antideportiva reiterada en la tertulia",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "dev-user-spam",
    username: "reventa_gijon",
    displayName: "Entradas Gijón",
    avatarUrl: null,
    points: 0,
    isBanned: true,
    bannedUntil: null,
    bannedReason: "Reventa no autorizada y enlaces sospechosos",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

export const DEV_SYSTEM_ANNOUNCEMENT: SystemAnnouncement = {
  id: "dev-announcement-1",
  message: "¡Abierta la porra para el próximo partido! Pronostica tu resultado antes del pitido inicial.",
  type: "info",
  isActive: true,
  readOnlyWall: false,
  createdBy: "system",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
};

export const DEV_PRODUCT_METRICS: ProductHealthMetrics = {
  totalUsers: 84,
  newUsersToday: 3,
  totalPosts: 128,
  flaggedPostsCount: 1,
  totalPredictions: 62,
  blockedAttemptsCount: 2,
};

export const DEV_AUDIT_LOGS: readonly AdminAuditLog[] = [
  {
    id: "log-1",
    adminId: "admin-system",
    action: "ban_user",
    targetType: "user",
    targetId: "dev-user-troll",
    metadata: { motivo: "Conducta antideportiva reiterada en tertulia", dias: 7 },
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: "log-2",
    adminId: "admin-system",
    action: "update_announcement",
    targetType: "banner",
    targetId: "global-banner",
    metadata: { prioridad: "info", activo: true },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "log-3",
    adminId: "admin-system",
    action: "soft_delete_post",
    targetType: "post",
    targetId: "post-89",
    metadata: { motivo: "Retirado por infracción de normas comunitarias" },
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: "log-4",
    adminId: "admin-system",
    action: "approve_post",
    targetType: "post",
    targetId: "post-88",
    metadata: { motivo: "Aprobado tras verificación manual" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "log-5",
    adminId: "admin-system",
    action: "purge_sports_cache",
    targetType: "cache",
    targetId: "temporada",
    metadata: { scope: "calendario_y_clasificacion" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
  },
];

export const DEV_PLATFORM_ANALYTICS: PlatformAnalytics = {
  dailyTraffic: [
    { date: "2026-10-27", label: "27 Oct", visits: 48, uniqueVisitors: 34, isMatchDay: false },
    { date: "2026-10-28", label: "28 Oct", visits: 55, uniqueVisitors: 38, isMatchDay: false },
    { date: "2026-10-29", label: "29 Oct", visits: 62, uniqueVisitors: 44, isMatchDay: false },
    { date: "2026-10-30", label: "30 Oct", visits: 70, uniqueVisitors: 50, isMatchDay: false },
    { date: "2026-10-31", label: "31 Oct", visits: 78, uniqueVisitors: 54, isMatchDay: false },
    { date: "2026-11-01", label: "1 Nov", visits: 118, uniqueVisitors: 84, isMatchDay: true }, // Partido
    { date: "2026-11-02", label: "2 Nov", visits: 82, uniqueVisitors: 58, isMatchDay: false },
    { date: "2026-11-03", label: "3 Nov", visits: 54, uniqueVisitors: 39, isMatchDay: false },
    { date: "2026-11-04", label: "4 Nov", visits: 51, uniqueVisitors: 36, isMatchDay: false },
    { date: "2026-11-05", label: "5 Nov", visits: 64, uniqueVisitors: 45, isMatchDay: false },
    { date: "2026-11-06", label: "6 Nov", visits: 73, uniqueVisitors: 52, isMatchDay: false },
    { date: "2026-11-07", label: "7 Nov", visits: 85, uniqueVisitors: 60, isMatchDay: false },
    { date: "2026-11-08", label: "8 Nov", visits: 126, uniqueVisitors: 92, isMatchDay: true }, // Partido
    { date: "2026-11-09", label: "9 Nov", visits: 88, uniqueVisitors: 62, isMatchDay: false },
  ],
  hourlyTraffic: [
    { hour: 0, label: "00h", count: 2, percentage: 2.1 },
    { hour: 1, label: "01h", count: 1, percentage: 1.1 },
    { hour: 2, label: "02h", count: 0, percentage: 0.0 },
    { hour: 3, label: "03h", count: 0, percentage: 0.0 },
    { hour: 4, label: "04h", count: 0, percentage: 0.0 },
    { hour: 5, label: "05h", count: 1, percentage: 1.1 },
    { hour: 6, label: "06h", count: 1, percentage: 1.1 },
    { hour: 7, label: "07h", count: 2, percentage: 2.1 },
    { hour: 8, label: "08h", count: 3, percentage: 3.2 },
    { hour: 9, label: "09h", count: 4, percentage: 4.3 },
    { hour: 10, label: "10h", count: 5, percentage: 5.3 },
    { hour: 11, label: "11h", count: 5, percentage: 5.3 },
    { hour: 12, label: "12h", count: 6, percentage: 6.4 },
    { hour: 13, label: "13h", count: 7, percentage: 7.4 },
    { hour: 14, label: "14h", count: 8, percentage: 8.5 },
    { hour: 15, label: "15h", count: 6, percentage: 6.4 },
    { hour: 16, label: "16h", count: 5, percentage: 5.3 },
    { hour: 17, label: "17h", count: 7, percentage: 7.4 },
    { hour: 18, label: "18h", count: 8, percentage: 8.5 },
    { hour: 19, label: "19h", count: 9, percentage: 9.6 },
    { hour: 20, label: "20h", count: 11, percentage: 11.7 },
    { hour: 21, label: "21h", count: 9, percentage: 9.6 },
    { hour: 22, label: "22h", count: 5, percentage: 5.3 },
    { hour: 23, label: "23h", count: 3, percentage: 3.2 },
  ],
  sectionUsage: [
    { key: "temporada", label: "Temporada y Partidos", percentage: 44, visits: 465 },
    { key: "juegos", label: "Porra y Juegos", percentage: 28, visits: 295 },
    { key: "social", label: "Tertulia Social", percentage: 17, visits: 179 },
    { key: "historico", label: "Archivo Histórico", percentage: 11, visits: 115 },
  ],
  deviceUsage: [
    { device: "mobile", label: "Móvil / PWA", percentage: 76, count: 801 },
    { device: "desktop", label: "Escritorio", percentage: 24, count: 253 },
  ],
  accessModes: [
    { mode: "pwa", label: "App instalada (PWA)", percentage: 62, count: 496 },
    { mode: "browser", label: "Navegador web móvil", percentage: 38, count: 305 },
  ],
  geographicProvinces: [
    { key: "asturias", label: "Asturias", percentage: 81, visits: 854 },
    { key: "madrid", label: "Madrid", percentage: 11, visits: 116 },
    { key: "leon", label: "León", percentage: 4, visits: 42 },
    { key: "otras", label: "Otras", percentage: 4, visits: 42 },
  ],
  geographicCountries: [
    { key: "es", label: "España", percentage: 92, visits: 970 },
    { key: "mx", label: "México", percentage: 4, visits: 42 },
    { key: "uk", label: "Reino Unido", percentage: 2, visits: 21 },
    { key: "otros", label: "Otros", percentage: 2, visits: 21 },
  ],
  avgSessionMinutes: 4 + 56 / 60, // 04:56
  bounceRatePercentage: 22.4,
};
