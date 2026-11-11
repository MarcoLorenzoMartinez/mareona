import { describe, it } from "node:test";
import assert from "node:assert/strict";
import robots from "../../src/app/robots.ts";
import sitemap from "../../src/app/sitemap.ts";

describe("SEO Metadata Suite (robots & sitemap)", () => {
  it("generates safe robots.txt adhering to cybersecurity practices", () => {
    const robotsConfig = robots();

    // Verify rules exist
    assert.ok(Array.isArray(robotsConfig.rules) || typeof robotsConfig.rules === "object");
    const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;

    assert.equal(rules.allow, "/");
    // Verify standard API exclusion is present
    assert.deepEqual(rules.disallow, ["/api/"]);

    // Cybersecurity check: /admin should NOT be exposed in robots.txt disallow list
    const disallowList = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];
    assert.equal(disallowList.includes("/admin"), false);
    assert.equal(disallowList.includes("/admin/"), false);

    // Verify sitemap link
    assert.match(String(robotsConfig.sitemap), /sitemap\.xml$/);
  });

  it("generates comprehensive canonical sitemap with public sections and legal pages", () => {
    const sitemapEntries = sitemap();

    assert.ok(Array.isArray(sitemapEntries));
    assert.ok(sitemapEntries.length >= 20);

    const urls = sitemapEntries.map((e) => e.url);

    // Core home and season
    assert.ok(urls.some((u) => u.endsWith("mareona.es") || u.endsWith("mareona.es/")));
    assert.ok(urls.some((u) => u.includes("/temporada")));
    assert.ok(urls.some((u) => u.includes("/temporada/clasificacion")));

    // Games
    assert.ok(urls.some((u) => u.includes("/juegos/porra")));
    assert.ok(urls.some((u) => u.includes("/juegos/wordle")));

    // Historical
    assert.ok(urls.some((u) => u.includes("/historico")));
    assert.ok(urls.some((u) => u.includes("/historico/leyendas")));

    // Legal
    assert.ok(urls.some((u) => u.includes("/aviso-legal")));
    assert.ok(urls.some((u) => u.includes("/privacidad")));

    // Security check: private/admin paths MUST NOT appear in sitemap
    assert.equal(urls.some((u) => u.includes("/admin")), false);
    assert.equal(urls.some((u) => u.includes("/perfil")), false);
  });
});
