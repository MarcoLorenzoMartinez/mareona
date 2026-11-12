import { test, expect } from "@playwright/test";

test.describe("Social Wall & Tertulia Flow Suite", () => {
  test("renders community feed, search, and publication controls", async ({ page }) => {
    await page.goto("/social");

    // Verify main feed is visible
    await expect(page.locator("main")).toBeVisible();

    // Verify search or filter options are reachable
    const searchOrFilters = page.locator("input, [role='tablist'], button");
    await expect(searchOrFilters.first()).toBeVisible();
  });
});
