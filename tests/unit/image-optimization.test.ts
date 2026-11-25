import test from "node:test";
import assert from "node:assert/strict";
import { isNextImageSupportedUrl } from "../../src/components/media/image-optimization.ts";

test("isNextImageSupportedUrl accepts local raster images and supported remote CDNs", () => {
  assert.equal(isNextImageSupportedUrl("/images/cards/historical/bdf-2553.jpg"), true);
  assert.equal(isNextImageSupportedUrl("/crests/historical/sporting-modern.png"), true);
  assert.equal(isNextImageSupportedUrl("https://a.espncdn.com/i/teamlogos/soccer/500/3788.png"), true);
  assert.equal(isNextImageSupportedUrl("https://images.fotmob.com/image_resources/logo/teamlogo/8661.png"), true);
  assert.equal(isNextImageSupportedUrl("https://flagcdn.com/w40/es.png"), true);
});

test("isNextImageSupportedUrl rejects SVGs, invalid URLs, and BDFutbol optimizer proxy", () => {
  assert.equal(isNextImageSupportedUrl(null), false);
  assert.equal(isNextImageSupportedUrl(""), false);
  assert.equal(isNextImageSupportedUrl("/crests/test.svg"), false);
  assert.equal(isNextImageSupportedUrl("http://a.espncdn.com/logo.png"), false);
  assert.equal(isNextImageSupportedUrl("https://www.bdfutbol.com/i/j/2553f.jpg"), false);
  assert.equal(isNextImageSupportedUrl("https://www.bdfutbol.com/i/eg/11j.png"), false);
});
