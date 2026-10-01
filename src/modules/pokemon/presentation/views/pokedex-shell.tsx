import Link from "next/link";
import type { ReactNode } from "react";
import { PokeballIcon } from "@/shared/presentation/components/pokeball-icon";
import type { PokedexRegion } from "../../domain/pokedex-region";
import type { Pokemon } from "../../domain/pokemon";
import { POKEMON_TYPES } from "../../domain/pokemon-type";
import { PokedexSidebar, type SidebarEntry } from "../components/pokedex-sidebar";
import { POKEDEX_PATH, REGION_MAP_PATH } from "../routes";

export function PokedexShell({
  region,
  pokedex,
  children,
}: {
  region: PokedexRegion;
  pokedex: readonly Pokemon[];
  children: ReactNode;
}) {
  // Only send the client what the sidebar renders.
  const entries: SidebarEntry[] = pokedex.map(
    ({ id, slug, name, types, spriteUrl }) => ({ id, slug, name, types, spriteUrl }),
  );
  const types = POKEMON_TYPES.filter((type) =>
    pokedex.some((p) => p.types.includes(type)),
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-background/80 backdrop-blur-md dark:border-white/10">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <PokeballIcon className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
              Pokédex
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <Link
              href={POKEDEX_PATH}
              className="text-sm font-semibold text-zinc-600 hover:text-foreground dark:text-zinc-400"
            >
              {region.name}
            </Link>
          </div>
          <nav className="flex items-center gap-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href={REGION_MAP_PATH} className="transition hover:text-foreground lg:hidden">
              Map
            </Link>
            <Link href="/" className="transition hover:text-foreground">
              Back to home
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
        <PokedexSidebar regionName={region.name} entries={entries} types={types} />
        <div className="min-w-0 bg-zinc-50 dark:bg-zinc-950">{children}</div>
      </div>
    </div>
  );
}
