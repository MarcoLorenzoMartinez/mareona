import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSecurityHeaders, buildContentSecurityPolicy } from "../../src/lib/security/headers.ts";

describe("Security Headers & CSP Suite (OWASP Standard)", () => {
  it("generates Content Security Policy with necessary trusted origins", () => {
    const csp = buildContentSecurityPolicy();

    assert.ok(csp.includes("default-src 'self'"));
    assert.ok(csp.includes("frame-ancestors 'none'"));
    assert.ok(csp.includes("object-src 'none'"));
    assert.ok(csp.includes("base-uri 'self'"));

    // Supabase and OAuth avatares allowed for images and realtime connect
    assert.ok(csp.includes("https://*.supabase.co"));
    assert.ok(csp.includes("wss://*.supabase.co"));
    assert.ok(csp.includes("https://www.bdfutbol.com"));
    assert.ok(csp.includes("https://*.googleusercontent.com"));
  });

  it("provides comprehensive HTTP defense-in-depth headers", () => {
    const headers = getSecurityHeaders();
    const map = new Map(headers.map((h) => [h.key.toLowerCase(), h.value]));

    // Clickjacking protection
    assert.equal(map.get("x-frame-options"), "DENY");

    // MIME Sniffing protection
    assert.equal(map.get("x-content-type-options"), "nosniff");

    // Referrer policy
    assert.equal(map.get("referrer-policy"), "strict-origin-when-cross-origin");

    // Permissions policy disabling high-risk device hardware
    const permPolicy = map.get("permissions-policy") ?? "";
    assert.ok(permPolicy.includes("camera=()"));
    assert.ok(permPolicy.includes("microphone=()"));
    assert.ok(permPolicy.includes("geolocation=()"));

    // HSTS (Strict Transport Security)
    const hsts = map.get("strict-transport-security") ?? "";
    assert.ok(hsts.includes("max-age=63072000"));
    assert.ok(hsts.includes("includeSubDomains"));

    // CSP header present
    assert.ok(map.has("content-security-policy"));
  });
});
