import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Converts a hex color string (#rrggbb or #rgb) to RGB components [0..255].
 */
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0]! + cleanHex[0]!, 16);
    const g = parseInt(cleanHex[1]! + cleanHex[1]!, 16);
    const b = parseInt(cleanHex[2]! + cleanHex[2]!, 16);
    return [r, g, b];
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return [r, g, b];
  }
  throw new Error(`Invalid hex color string: "${hex}"`);
}

/**
 * Calculates sRGB linearized channel value according to WCAG 2.2 / IEC 61966-2-1.
 */
function linearizeChannel(val: number): number {
  const srgb = val / 255;
  return srgb <= 0.04045
    ? srgb / 12.92
    : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * Computes standard relative luminance (L) of an RGB color.
 */
function computeRelativeLuminance(r: number, g: number, b: number): number {
  const rLin = linearizeChannel(r);
  const gLin = linearizeChannel(g);
  const bLin = linearizeChannel(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculates WCAG contrast ratio between two colors (L1 >= L2).
 */
export function getContrastRatio(hexColor1: string, hexColor2: string): number {
  const [r1, g1, b1] = hexToRgb(hexColor1);
  const [r2, g2, b2] = hexToRgb(hexColor2);

  const l1 = computeRelativeLuminance(r1, g1, b1);
  const l2 = computeRelativeLuminance(r2, g2, b2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

describe("Accessibility & WCAG 2.2 AA Color Contrast Suite", () => {
  const globalsCssPath = path.resolve(process.cwd(), "src/app/globals.css");

  it("verifies relative luminance and contrast ratio calculation formula correctness", () => {
    // Pure black (#000000) on pure white (#ffffff) must be exactly 21:1
    const maxContrast = getContrastRatio("#ffffff", "#000000");
    assert.strictEqual(Math.round(maxContrast), 21);

    // Identical colors must be 1:1
    const identityContrast = getContrastRatio("#ffffff", "#ffffff");
    assert.strictEqual(identityContrast, 1);
  });

  it("verifies primary sporting red against white background meets WCAG AA for normal text (>= 4.5:1)", () => {
    const brandRed = "#e2001a";
    const whiteBg = "#ffffff";
    const ratio = getContrastRatio(brandRed, whiteBg);

    // Primary red is 4.95:1, surpassing the 4.5:1 minimum threshold
    assert.ok(
      ratio >= 4.5,
      `Primary brand red ${brandRed} on white ${whiteBg} ratio was ${ratio.toFixed(2)}, expected >= 4.5`
    );
  });

  it("verifies high-contrast primary strong red (#b80015) meets enhanced contrast (>= 6.5:1)", () => {
    const strongRed = "#b80015";
    const whiteBg = "#ffffff";
    const ratio = getContrastRatio(strongRed, whiteBg);

    assert.ok(
      ratio >= 6.5,
      `High-contrast red ${strongRed} on white ratio was ${ratio.toFixed(2)}, expected >= 6.5`
    );
  });

  it("verifies body text foreground (#171717) achieves AAA contrast on white (>= 7.0:1)", () => {
    const foreground = "#171717";
    const whiteBg = "#ffffff";
    const ratio = getContrastRatio(foreground, whiteBg);

    assert.ok(
      ratio >= 7.0,
      `Foreground text ${foreground} on white ratio was ${ratio.toFixed(2)}, expected >= 7.0`
    );
  });

  it("verifies secondary muted text (#525252) meets standard AA (>= 4.5:1)", () => {
    const mutedForeground = "#525252";
    const whiteBg = "#ffffff";
    const ratio = getContrastRatio(mutedForeground, whiteBg);

    assert.ok(
      ratio >= 4.5,
      `Muted text ${mutedForeground} on white ratio was ${ratio.toFixed(2)}, expected >= 4.5`
    );
  });

  it("verifies CSS design tokens in globals.css do not introduce blue tones in focus ring or selection", () => {
    const cssContent = fs.readFileSync(globalsCssPath, "utf-8");

    // The focus ring in AGENTS.md must be red/brand-based (--ring: #b80015), never blue
    const ringMatch = cssContent.match(/--ring:\s*([^;]+);/);
    assert.ok(ringMatch, "Expected --ring variable to be defined in globals.css");

    const ringValue = ringMatch[1]!.trim();
    assert.strictEqual(
      ringValue,
      "#b80015",
      "Focus ring must be corporate red (#b80015) to prevent default blue outlines"
    );

    // Ensure ::selection uses corporate red background
    assert.ok(
      cssContent.includes("::selection"),
      "CSS should configure custom ::selection styling"
    );
    assert.ok(
      cssContent.includes("background-color: #e2001a;"),
      "Selection must use corporate red"
    );
  });

  it("verifies semantic badge and muted UI colors meet WCAG 2.2 AA (>= 4.5:1)", () => {
    // neutral-600 (#525252) on surface (#fafafa)
    assert.ok(getContrastRatio("#525252", "#fafafa") >= 4.5, "neutral-600 on surface >= 4.5");
    // amber-700 (#b45309) and emerald-700 (#047857) with white text (#ffffff)
    assert.ok(getContrastRatio("#ffffff", "#b45309") >= 4.5, "white on amber-700 >= 4.5");
    assert.ok(getContrastRatio("#ffffff", "#047857") >= 4.5, "white on emerald-700 >= 4.5");
  });

  it("verifies color-scheme light declaration for consistent contrast rendering", () => {
    const cssContent = fs.readFileSync(globalsCssPath, "utf-8");
    assert.ok(
      cssContent.includes("color-scheme: light;"),
      "globals.css must declare color-scheme: light to prevent unauthorized browser dark-mode inversions"
    );
  });
});
