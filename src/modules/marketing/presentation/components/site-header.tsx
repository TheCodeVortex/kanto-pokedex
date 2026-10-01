import Link from "next/link";
import { POKEDEX_PATH } from "@/modules/pokemon";
import { PokeballIcon } from "@/shared/presentation/components/pokeball-icon";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#featured", label: "Pokémon" },
  { href: "#types", label: "Types" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-background/80 backdrop-blur-md dark:border-white/10">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <PokeballIcon className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
          Pokédex
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-400">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
        <Link
          href={POKEDEX_PATH}
          className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
        >
          Start exploring
        </Link>
      </div>
    </header>
  );
}
