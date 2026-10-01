import type { Metadata } from "next";
import { getRegionMap, RegionMapView } from "@/modules/pokemon";

export const metadata: Metadata = {
  title: "Kanto map | Pokédex",
  description: "Where to catch every wild Pokémon in Pokémon Red and Blue.",
};

export default async function RegionMapPage() {
  const map = await getRegionMap();
  return <RegionMapView map={map} />;
}
