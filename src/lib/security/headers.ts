/**
 * Builds the Content Security Policy (CSP) directive string.
 * Restricts script execution, image sources and network connections strictly to
 * first-party assets and trusted third-party providers (Supabase, Google OAuth, BDFutbol).
 */
export function buildContentSecurityPolicy(): string {
  const scriptSrc =
    process.env.NODE_ENV === "production"
      ? "script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client"
      : "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com/gsi/client";

  const directives = [
    "default-src 'self'",
    scriptSrc,
    // Tailwind and dynamic CSS variables; stylesheet injected by Google Identity Services
    "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
    // Trusted media origins (Supabase storage, Google avatars, historical archives, sports CDNs)
    "img-src 'self' blob: data: https://*.supabase.co https://www.bdfutbol.com https://images.fotmob.com https://*.fotmob.com https://*.espncdn.com https://a.espncdn.com https://media.api-sports.io https://flagcdn.com https://*.googleusercontent.com",
    // Google fonts self-hosted via next/font
    "font-src 'self' data:",
    // API endpoints, Supabase REST & WebSocket Realtime channel, Google Identity Services
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.fotmob.com https://accounts.google.com/gsi/",
    // Google renders its sign-in button inside an iframe; every other embed stays blocked
    "frame-src https://accounts.google.com/gsi/",
    // Mitigate UI redress / Clickjacking attacks
    "frame-ancestors 'none'",
    // Restrict document base URI to prevent injection attacks
    "base-uri 'self'",
    // Restrict form submissions strictly to same-origin
    "form-action 'self'",
    // Disallow ancient plugin formats (Flash, Java Applets)
    "object-src 'none'",
  ];

  return directives.join("; ");
}

export interface SecurityHeaderEntry {
  readonly key: string;
  readonly value: string;
}

/**
 * Returns the production-ready HTTP security headers conforming to OWASP ASVS Level 2.
 */
export function getSecurityHeaders(): readonly SecurityHeaderEntry[] {
  return [
    {
      // Anti-Clickjacking: prevent the app from being embedded inside foreign iframes
      key: "X-Frame-Options",
      value: "DENY",
    },
    {
      // MIME Sniffing protection: prevent browser from executing non-executable mime types
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      // User privacy: pass origin only on cross-origin requests to prevent leaking path data
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      // Restrict access to sensitive hardware not utilized by Mareona
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
    {
      // Disable obsolete XSS filters in legacy browsers that introduced vulnerabilities
      key: "X-XSS-Protection",
      value: "0",
    },
    {
      // Enforce strict TLS/HTTPS for 2 years with preloading authorization
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(),
    },
  ];
}
