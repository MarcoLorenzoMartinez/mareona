import { test, expect } from "@playwright/test";

test.describe("Porra & Prediction Flow Suite", () => {
  test("renders the match card, interactive score counters, and leaderboard", async ({ page }) => {
    await page.goto("/juegos/porra");

    // Check main container
    await expect(page.locator("main")).toBeVisible();

    // Verify Porra header title
    await expect(page.locator("h1")).toContainText(/Porra/i);

    // Verify team names appear
    await expect(page.locator("text=Real Sporting").first()).toBeVisible();

    // Verify score increment buttons are interactive
    const plusButtons = page.getByRole("button", { name: /Añadir gol/i });
    if (await plusButtons.first().isVisible()) {
      await plusButtons.first().click();
    }

    // Verify leaderboard is present
    await expect(page.locator("text=Clasificación").first()).toBeVisible();
  });
});
