import { expect, test } from "@playwright/test";

// Runs in the "mobile" project (Pixel 7 viewport).
test.describe("on a phone", () => {
  test("hides the sidebar and offers the map in the header", async ({ page }) => {
    await page.goto("/pokedex");

    await expect(page.getByRole("navigation", { name: "Pokémon" })).toBeHidden();
    await page.getByRole("banner").getByRole("link", { name: "Map" }).click();

    await expect(page).toHaveURL("/pokedex/map");
    await expect(page.getByRole("group", { name: "Map of Kanto" })).toBeVisible();
  });

  test("browses Pokémon from the overview grid", async ({ page }) => {
    await page.goto("/pokedex");

    await page.getByRole("link", { name: /#0025.*Pikachu/ }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Pikachu" })).toBeVisible();
  });

  test("has no horizontal scrolling", async ({ page }) => {
    for (const path of ["/", "/pokedex", "/pokedex/mewtwo", "/pokedex/map"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});
