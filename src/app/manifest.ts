import type { MetadataRoute } from "next";

/**
 * Web App Manifest served at /manifest.webmanifest. Colors mirror the brand
 * tokens in globals.css (`--primary`, `--background`).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Mareona",
    short_name: "Mareona",
    description: "Comunidad, datos y juegos de la afición del Real Sporting.",
    lang: "es",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#e2001a",
    categories: ["sports", "social", "games"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Temporada", url: "/temporada" },
      { name: "Juegos", url: "/juegos" },
      { name: "Archivo histórico", url: "/historico" },
    ],
  };
}
