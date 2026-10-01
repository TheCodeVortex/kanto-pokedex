import type { PokemonModelCatalog } from "../domain/pokemon-model-catalog";

// Fan-made, Draco-compressed models from https://github.com/Pokemon-3D-api/assets.
// The 3D assets themselves are property of Nintendo / Creatures Inc. / GAME FREAK inc.
const MODELS_URL =
  "https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt/regular";

/** National Pokédex numbers confirmed to have a model in the source (all of Kanto). */
const FIRST_ID = 1;
const LAST_ID = 151;

export class Pokemon3DApiModelCatalog implements PokemonModelCatalog {
  findModelUrl(pokemonId: number): string | null {
    return pokemonId >= FIRST_ID && pokemonId <= LAST_ID
      ? `${MODELS_URL}/${pokemonId}.glb`
      : null;
  }
}
