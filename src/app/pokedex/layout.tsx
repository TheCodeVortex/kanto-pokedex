import { getPokedex, KANTO_REGION, PokedexShell } from "@/modules/pokemon";

export default async function PokedexLayout({ children }: LayoutProps<"/pokedex">) {
  const pokedex = await getPokedex();
  return (
    <PokedexShell region={KANTO_REGION} pokedex={pokedex}>
      {children}
    </PokedexShell>
  );
}
