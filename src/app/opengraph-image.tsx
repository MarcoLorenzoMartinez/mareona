import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const alt = "Mareona — La grada digital del Real Sporting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generates dynamic Open Graph and Twitter social card.
 * Adheres strictly to the brand identity: red (#e2001a) and white, zero blue,
 * clean sans-serif typography with official Sporting aesthetic.
 */
export default async function OpenGraphImage() {
  let logoDataUrl = "";
  try {
    const logoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));
    logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    // Graceful fallback if fs fails in edge environments
  }

  const tags = ["Marcadores en Vivo", "Porras y Minijuegos", "Muro Social", "Archivo Histórico"];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "60px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Top sporting stripes */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "14px",
            display: "flex",
            width: "100%",
          }}
        >
          <div style={{ flex: 1, backgroundColor: "#e2001a" }} />
          <div style={{ flex: 1, backgroundColor: "#ffffff" }} />
          <div style={{ flex: 1, backgroundColor: "#e2001a" }} />
          <div style={{ flex: 1, backgroundColor: "#ffffff" }} />
          <div style={{ flex: 1, backgroundColor: "#e2001a" }} />
          <div style={{ flex: 1, backgroundColor: "#ffffff" }} />
          <div style={{ flex: 1, backgroundColor: "#e2001a" }} />
        </div>

        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoDataUrl}
              alt="Logo"
              style={{ width: "84px", height: "84px", objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: "84px",
                height: "84px",
                backgroundColor: "#e2001a",
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "40px",
                fontWeight: 900,
              }}
            >
              M
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "42px",
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              Mareona
            </span>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#e2001a",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Real Sporting
            </span>
          </div>
        </div>

        {/* Main Punchline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "62px",
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            La grada digital del Real Sporting
          </h1>
          <p
            style={{
              fontSize: "25px",
              fontWeight: 500,
              color: "#475569",
              margin: 0,
              maxWidth: "960px",
            }}
          >
            Partidos en directo, porras, pasatiempos diarios, tertulia social y archivo histórico rojiblanco.
          </p>
        </div>

        {/* Bottom Feature Badges & Domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #f1f5f9",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                  borderRadius: "9999px",
                  padding: "8px 18px",
                  fontSize: "15px",
                  fontWeight: 700,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#94a3b8",
            }}
          >
            mareona.es
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
