import { PokeballIcon } from "@/shared/presentation/components/pokeball-icon";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 py-10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 md:flex-row dark:text-zinc-400">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <PokeballIcon className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
          Pokédex
        </div>
        <p>
          Data from{" "}
          <a
            href="https://pokeapi.co"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-4 hover:text-foreground hover:underline"
          >
            PokéAPI
          </a>
          . Pokémon and Pokémon names are trademarks of Nintendo.
        </p>
      </div>
    </footer>
  );
}
