import type { Metadata } from "next";
import { getPokedexOverview, PokedexOverviewView } from "@/modules/pokemon";

export const metadata: Metadata = {
  title: "Kanto Pokédex",
  description: "Browse the 151 Pokémon of the original series.",
};

export default async function PokedexPage() {
  const overview = await getPokedexOverview();
  return <PokedexOverviewView overview={overview} />;
}
