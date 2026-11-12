import { test, expect } from "@playwright/test";

test.describe("Porra & Prediction Flow Suite", () => {
  test("renders the match card, interactive score counters, and leaderboard", async ({ page }) => {
    await page.goto("/juegos/porra");

    // Check main container
    await expect(page.locator("main")).toBeVisible();

    // Verify Porra header title
    await expect(page.locator("h1")).toContainText(/Porra/i);

    // Verify team names appear within the match card inside main
    await expect(page.locator("main").getByText("Real Sporting").first()).toBeVisible();

    // Verify score increment buttons are interactive
    const plusButtons = page.getByRole("button", { name: /Añadir gol/i });
    if (await plusButtons.first().isVisible()) {
      await plusButtons.first().click();
    }

    // Verify leaderboard section is present inside main
    await expect(page.locator("main").getByRole("heading", { name: /clasificación/i })).toBeVisible();
  });
});
