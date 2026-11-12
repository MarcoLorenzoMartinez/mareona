import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const alt = "Mareona — Real Sporting: partidos, juegos y comunidad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Loads the brand logo as a base64 data URL.
 * URL resolution guarantees Vercel NFT bundles public/logo.png into the serverless function.
 */
function getLogoDataUrl(): string {
  try {
    const logoUrl = new URL("../../public/logo.png", import.meta.url);
    return `data:image/png;base64,${fs.readFileSync(logoUrl).toString("base64")}`;
  } catch {
    try {
      const p = path.join(process.cwd(), "public", "logo.png");
      return `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`;
    } catch {
      return "";
    }
  }
}

/**
 * Generates dynamic Open Graph and Twitter social card.
 * Pure minimalist layout with the official Mareona logo as the primary hero,
 * perfectly centered inside a safe 630x630 square zone for WhatsApp preview crops
 * as well as panoramic cards on Twitter, LinkedIn and Telegram.
 */
export default async function OpenGraphImage() {
  const logoDataUrl = getLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Centered Safe Zone (fits cleanly inside 630x630 square crop for WhatsApp) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          {logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoDataUrl}
              alt="Logo"
              style={{ width: "210px", height: "210px", objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: "190px",
                height: "190px",
                backgroundColor: "#e2001a",
                borderRadius: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "92px",
                fontWeight: 900,
              }}
            >
              M
            </div>
          )}

          <span
            style={{
              fontSize: "58px",
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              marginTop: "20px",
              lineHeight: 1,
            }}
          >
            Mareona
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#e2001a",
              borderRadius: "9999px",
              padding: "6px 22px",
              marginTop: "14px",
            }}
          >
            <span
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Real Sporting
            </span>
          </div>

          <span
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#64748b",
              marginTop: "16px",
              letterSpacing: "0.02em",
            }}
          >
            Partidos · Datos · Juegos · Comunidad
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
