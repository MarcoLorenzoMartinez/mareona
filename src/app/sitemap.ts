import type { MetadataRoute } from "next";

interface RouteConfig {
  readonly path: string;
  readonly changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  readonly priority: number;
}

const CANONICAL_PUBLIC_ROUTES: readonly RouteConfig[] = [
  // Core & Matchday
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/temporada", changeFrequency: "daily", priority: 0.9 },
  { path: "/temporada/partidos", changeFrequency: "weekly", priority: 0.8 },
  { path: "/temporada/clasificacion", changeFrequency: "daily", priority: 0.8 },
  { path: "/temporada/plantilla", changeFrequency: "weekly", priority: 0.7 },
  { path: "/temporada/estadisticas", changeFrequency: "weekly", priority: 0.7 },
  { path: "/temporada/pizarra", changeFrequency: "weekly", priority: 0.6 },

  // Games & Trivia
  { path: "/juegos", changeFrequency: "daily", priority: 0.8 },
  { path: "/juegos/porra", changeFrequency: "daily", priority: 0.8 },
  { path: "/juegos/wordle", changeFrequency: "daily", priority: 0.7 },
  { path: "/juegos/quien-es", changeFrequency: "daily", priority: 0.7 },
  { path: "/juegos/pregunta-del-dia", changeFrequency: "daily", priority: 0.7 },
  { path: "/juegos/mas-o-menos", changeFrequency: "daily", priority: 0.7 },
  { path: "/juegos/album", changeFrequency: "weekly", priority: 0.7 },

  // Historical Archive
  { path: "/historico", changeFrequency: "weekly", priority: 0.8 },
  { path: "/historico/rivales", changeFrequency: "monthly", priority: 0.7 },
  { path: "/historico/efemerides", changeFrequency: "weekly", priority: 0.7 },
  { path: "/historico/legado", changeFrequency: "monthly", priority: 0.7 },

  // Social & PWA Install
  { path: "/social", changeFrequency: "daily", priority: 0.7 },
  { path: "/instalar", changeFrequency: "monthly", priority: 0.6 },

  // Legal & Transparency
  { path: "/aviso-legal", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacidad", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terminos", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
];

/**
 * Generates the canonical XML sitemap for Mareona.
 * Ensures search engines index exclusively legitimate public routes while omitting
 * private authenticated pages (/admin, /perfil).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://mareona.es").replace(/\/+$/, "");
  const lastModified = new Date();

  return CANONICAL_PUBLIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
