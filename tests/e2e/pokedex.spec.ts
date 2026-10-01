import { expect, test } from "@playwright/test";

test.describe("Pokédex dashboard", () => {
  test("summarises all 151 Kanto Pokémon", async ({ page }) => {
    await page.goto("/pokedex");

    await expect(page.getByText("151 of 151 Pokémon")).toBeVisible();
    await expect(page.getByRole("heading", { name: "All 151 Pokémon" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Strongest Pokémon" })).toBeVisible();
  });

  test("finds a Pokémon from the sidebar", async ({ page }) => {
    await page.goto("/pokedex");
    const sidebar = page.getByRole("navigation", { name: "Pokémon" });

    await page.getByRole("searchbox", { name: "Search Pokémon" }).fill("char");
    await expect(page.getByText("3 of 151 Pokémon")).toBeVisible();
    await sidebar.getByRole("link", { name: /Charizard/ }).click();

    await expect(page).toHaveURL("/pokedex/charizard");
    await expect(sidebar.getByRole("link", { name: /Charizard/ })).toHaveAttribute("aria-current", "page");
  });

  test("filters the sidebar by type", async ({ page }) => {
    await page.goto("/pokedex");

    await page.getByRole("combobox", { name: "Filter by type" }).selectOption("dragon");

    await expect(page.getByText("3 of 151 Pokémon")).toBeVisible();
  });

  test("shows a full profile and steps through the Pokédex", async ({ page }) => {
    await page.goto("/pokedex/eevee");

    await expect(page.getByRole("heading", { level: 1, name: "Eevee" })).toBeVisible();
    for (const section of ["Base stats", "Abilities", "Evolution", "Where to find"]) {
      await expect(page.getByRole("heading", { name: section })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: /Vaporeon/ }).first()).toBeVisible();

    await page.getByRole("link", { name: /#0134.*Vaporeon/ }).click();
    await expect(page).toHaveURL("/pokedex/vaporeon");
  });

  test("is a 404 for a Pokémon outside Kanto", async ({ page }) => {
    const response = await page.goto("/pokedex/pichu");
    expect(response?.status()).toBe(404);
  });
});
