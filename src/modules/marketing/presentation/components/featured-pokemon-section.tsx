import { Suspense } from "react";
import {
  getFeaturedPokemon,
  PokemonCard,
  PokemonCardSkeleton,
  type Pokemon,
} from "@/modules/pokemon";

const SKELETON_COUNT = 6;

export function FeaturedPokemonSection() {
  return (
    <section id="featured" className="scroll-mt-16 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight">Meet the classics</h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              A few familiar faces to start your journey.
            </p>
          </div>
        </div>
        <Suspense fallback={<FeaturedPokemonSkeleton />}>
          <FeaturedPokemonGrid />
        </Suspense>
      </div>
    </section>
  );
}

export async function FeaturedPokemonGrid() {
  // The landing page should still render if PokéAPI is unavailable.
  const pokemon: Pokemon[] = await getFeaturedPokemon().catch(() => []);

  if (pokemon.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-black/10 p-10 text-center text-zinc-500 dark:border-white/15">
        The Pokémon are hiding right now. Please try again in a moment.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {pokemon.map((p) => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </div>
  );
}

function FeaturedPokemonSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <PokemonCardSkeleton key={i} />
      ))}
    </div>
  );
}
