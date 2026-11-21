import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Mareona - Real Sporting";

/**
 * Branded 1200x630 OpenGraph image for social sharing across all routes.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#e2001a",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "4px solid rgba(255,255,255,0.35)",
            borderRadius: "32px",
            padding: "48px 72px",
            backgroundColor: "rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: 78, fontWeight: 900, letterSpacing: "0.08em" }}>
            MAREONA
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, marginTop: 16, opacity: 0.92 }}>
            Real Sporting · Datos, Juegos y Comunidad
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
