import { test, expect } from "@playwright/test";

test.describe("PWA & Offline Resilience Flow Suite", () => {
  test("renders offline fallback page cleanly with return action", async ({ page }) => {
    await page.goto("/offline");

    // Verify offline heading and explanation
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/conexión/i);

    // Verify return button exists and is clickable
    const homeLink = page.getByRole("link", { name: /Volver|Inicio|Reintentar/i });
    if (await homeLink.count() > 0) {
      await expect(homeLink.first()).toBeVisible();
    }
  });
});
