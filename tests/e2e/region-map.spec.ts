import { expect, test } from "@playwright/test";

test.describe("Kanto map", () => {
  test("shows the Pokémon of a location clicked on the map", async ({ page }) => {
    await page.goto("/pokedex/map");
    const map = page.getByRole("group", { name: "Map of Kanto" });
    const panel = page.getByRole("complementary", { name: "Location details" });

    await map.getByRole("button", { name: "Route 1", exact: true }).click();

    await expect(panel.getByRole("heading", { name: "Route 1" })).toBeVisible();
    await expect(panel.getByRole("link", { name: /Pidgey/ })).toBeVisible();
    await expect(page).toHaveURL("/pokedex/map?location=kanto-route-1");
  });

  test("highlights where a Pokémon can be found", async ({ page }) => {
    await page.goto("/pokedex/map");

    await page.getByRole("combobox", { name: "Find a Pokémon" }).selectOption("mewtwo");

    await expect(page.getByText(/Mewtwo\s*appears in 1 location/)).toBeVisible();
    await expect(
      page.getByRole("group", { name: "Map of Kanto" }).getByRole("button", { name: "Cerulean Cave" }),
    ).toHaveAttribute("opacity", "1");
  });

  test("opens from a profile's 'Where to find' with the location selected", async ({ page }) => {
    await page.goto("/pokedex/pidgey");

    await page.getByRole("link", { name: /^Route 1 / }).click();

    await expect(page).toHaveURL("/pokedex/map?location=kanto-route-1&pokemon=pidgey");
    await expect(page.getByRole("complementary", { name: "Location details" }).getByRole("heading", { name: "Route 1" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Find a Pokémon" })).toHaveValue("pidgey");
  });

  test("works with the keyboard", async ({ page }) => {
    await page.goto("/pokedex/map");

    await page.getByRole("group", { name: "Map of Kanto" }).getByRole("button", { name: "Mt. Moon" }).focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("complementary", { name: "Location details" }).getByRole("link", { name: /Zubat/ })).toBeVisible();
  });
});
