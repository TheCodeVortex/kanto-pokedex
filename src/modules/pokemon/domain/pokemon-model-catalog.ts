/** Source of interactive 3D models (glTF binary, `.glb`) for Pokémon. */
export interface PokemonModelCatalog {
  /** URL of the Pokémon's 3D model, or null when none is available. */
  findModelUrl(pokemonId: number): string | null;
}
