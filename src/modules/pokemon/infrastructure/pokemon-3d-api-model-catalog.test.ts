import { describe, expect, it } from "vitest";
import { Pokemon3DApiModelCatalog } from "./pokemon-3d-api-model-catalog";

const MODELS =
  "https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt/regular";

describe("Pokemon3DApiModelCatalog", () => {
  const catalog = new Pokemon3DApiModelCatalog();

  it.each([1, 25, 151])("has a model for Kanto Pokémon #%i", (id) => {
    expect(catalog.findModelUrl(id)).toBe(`${MODELS}/${id}.glb`);
  });

  it.each([0, 152])("has no model outside Kanto (#%i)", (id) => {
    expect(catalog.findModelUrl(id)).toBeNull();
  });
});
