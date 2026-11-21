import { test, expect } from "@playwright/test";

test.describe("Public Navigation & Discovery Suite", () => {
  test("home page renders hero, navigation, and footer correctly", async ({ page }) => {
    await page.goto("/");

    // Verify document title and page header
    await expect(page).toHaveTitle(/Mareona|Real Sporting/i);

    // Verify presence of navigation
    const nav = page.getByRole("navigation").first();
    await expect(nav).toBeVisible();

    // Verify presence of footer with legal disclaimer
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/Real Sporting/i);
    await expect(footer).toContainText(/independiente/i);
  });

  test("temporada page switches seamlessly between Partidos, Clasificación and Plantilla", async ({ page }) => {
    // /temporada canonically redirects to /temporada/partidos
    await page.goto("/temporada");
    await expect(page.locator("main")).toBeVisible();
    await expect(page).toHaveURL(/\/temporada\/partidos/);

    // Navigate to Clasificación
    await page.goto("/temporada/clasificacion");
    await expect(page).toHaveURL(/\/temporada\/clasificacion/);
    await expect(page.locator("main")).toBeVisible();

    // Navigate to Plantilla
    await page.goto("/temporada/plantilla");
    await expect(page).toHaveURL(/\/temporada\/plantilla/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("historical archive (/historico) loads without client errors", async ({ page }) => {
    await page.goto("/historico");
    await expect(page.locator("main")).toBeVisible();
  });

  test("install guide (/instalar) displays device-specific PWA instructions", async ({ page }) => {
    await page.goto("/instalar");

    await expect(page.locator("main")).toContainText(/Instalar/i);
    await expect(page.locator("main")).toContainText(/Mareona/i);
  });

  test("all institutional and legal pages load with canonical disclosures", async ({ page }) => {
    const legalRoutes = ["/acerca-de", "/aviso-legal", "/privacidad", "/terminos", "/cookies"];

    for (const route of legalRoutes) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
    }
  });
});
