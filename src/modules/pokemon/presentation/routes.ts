export const POKEDEX_PATH = "/pokedex";
export const REGION_MAP_PATH = `${POKEDEX_PATH}/map`;

export function pokemonPath(slug: string): string {
  return `${POKEDEX_PATH}/${slug}`;
}

export function regionMapPath(params: { location?: string; pokemon?: string } = {}): string {
  const search = new URLSearchParams();
  if (params.location) search.set("location", params.location);
  if (params.pokemon) search.set("pokemon", params.pokemon);
  const query = search.toString();
  return query ? `${REGION_MAP_PATH}?${query}` : REGION_MAP_PATH;
}
