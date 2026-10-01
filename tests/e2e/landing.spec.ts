import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("introduces the Pokédex with featured Pokémon", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Pokédex | Gotta know 'em all");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Gotta know");
    const featured = page.locator("#featured");
    await expect(featured.getByRole("link", { name: /Bulbasaur/ })).toBeVisible();
    await expect(featured.getByRole("link")).toHaveCount(6);
  });

  test("starts exploring from the header", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Start exploring" }).click();

    await expect(page).toHaveURL("/pokedex");
    await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
  });

  test("opens a featured Pokémon's profile", async ({ page }) => {
    await page.goto("/");

    await page.locator("#featured").getByRole("link", { name: /Pikachu/ }).click();

    await expect(page).toHaveURL("/pokedex/pikachu");
    await expect(page.getByRole("heading", { level: 1, name: "Pikachu" })).toBeVisible();
  });
});
