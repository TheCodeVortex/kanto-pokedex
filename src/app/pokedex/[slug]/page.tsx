import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPokedex, getPokemonProfile, PokemonProfileView } from "@/modules/pokemon";

// Every Pokémon page is prerendered; unknown slugs are a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const pokedex = await getPokedex();
  return pokedex.map((pokemon) => ({ slug: pokemon.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/pokedex/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPokemonProfile(slug);
  if (!profile) return {};
  const { pokemon } = profile;
  return {
    title: `${pokemon.name} | Pokédex`,
    description: pokemon.description || `${pokemon.name}, the ${pokemon.genus}.`,
  };
}

export default async function PokemonPage({ params }: PageProps<"/pokedex/[slug]">) {
  const { slug } = await params;
  const profile = await getPokemonProfile(slug);
  if (!profile) notFound();
  return <PokemonProfileView profile={profile} />;
}
