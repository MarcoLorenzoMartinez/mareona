import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateAvatarFile,
  MAX_AVATAR_FILE_SIZE,
} from "../../src/lib/auth/avatar-validation.ts";

describe("validateAvatarFile", () => {
  it("accepts valid JPEG, PNG and WebP files under 3MB", () => {
    const validJpg = validateAvatarFile({
      size: 1024 * 1024,
      type: "image/jpeg",
    });
    const validPng = validateAvatarFile({
      size: 2 * 1024 * 1024,
      type: "image/png",
    });
    const validWebp = validateAvatarFile({
      size: 500 * 1024,
      type: "image/webp",
    });

    assert.equal(validJpg.valid, true);
    assert.equal(validPng.valid, true);
    assert.equal(validWebp.valid, true);
  });

  it("rejects files larger than 3MB", () => {
    const tooLarge = validateAvatarFile({
      size: MAX_AVATAR_FILE_SIZE + 1,
      type: "image/jpeg",
    });

    assert.equal(tooLarge.valid, false);
    assert.match(tooLarge.error ?? "", /demasiado pesada/);
  });

  it("rejects dangerous or disallowed MIME types (e.g. SVG to prevent XSS, PDF, HTML)", () => {
    const svgFile = validateAvatarFile({
      size: 1024,
      type: "image/svg+xml",
    });
    const pdfFile = validateAvatarFile({
      size: 1024,
      type: "application/pdf",
    });
    const htmlFile = validateAvatarFile({
      size: 1024,
      type: "text/html",
    });

    assert.equal(svgFile.valid, false);
    assert.match(svgFile.error ?? "", /Formato no compatible/);
    assert.equal(pdfFile.valid, false);
    assert.equal(htmlFile.valid, false);
  });
});
