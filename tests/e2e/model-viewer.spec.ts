import { expect, test, type Page } from "@playwright/test";

// Headless Chrome renders WebGL in software, so 3D models take a while.
test.describe.configure({ timeout: 90_000 });

/** Opens the 3D view, retrying until React has hydrated the server-rendered button. */
async function show3DModel(page: Page) {
  const button = page.getByRole("button", { name: "3D model" });
  await expect(async () => {
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true", { timeout: 1_000 });
  }).toPass();
  return page.locator("model-viewer");
}

test.describe("3D models", () => {
  test("shows an animated 3D model with animation controls", async ({ page }) => {
    await page.goto("/pokedex/bulbasaur");

    const viewer = await show3DModel(page);

    // React sets `src` as a property on the custom element, not as an attribute.
    await expect
      .poll(() => viewer.evaluate((el) => (el as HTMLElement & { src: string }).src))
      .toMatch(/\/1\.glb$/);
    // The animation picker appears once the model has loaded.
    await expect(page.getByRole("combobox", { name: "Animation" })).toHaveValue(
      "model_skeleton|001aidle",
      { timeout: 60_000 },
    );

    await page.getByRole("button", { name: "❚❚ Pause" }).click();
    await expect(viewer).not.toHaveAttribute("auto-rotate");
    await expect
      .poll(() => viewer.evaluate((el) => (el as HTMLElement & { paused: boolean }).paused))
      .toBe(true);
  });

  test("gives models without animations a breathing motion", async ({ page }) => {
    await page.goto("/pokedex/squirtle");

    const viewer = await show3DModel(page);

    await expect(viewer).toHaveClass(/animate-idle-breathe/, { timeout: 60_000 });
    await expect(page.getByRole("combobox", { name: "Animation" })).toHaveCount(0);
  });
});
