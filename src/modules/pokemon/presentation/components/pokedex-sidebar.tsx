"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { formatPokedexNumber } from "../../domain/pokemon";
import type { PokemonType } from "../../domain/pokemon-type";
import { POKEDEX_PATH, pokemonPath, REGION_MAP_PATH } from "../routes";

export interface SidebarEntry {
  id: number;
  slug: string;
  name: string;
  types: readonly PokemonType[];
  spriteUrl: string;
}

export function PokedexSidebar({
  regionName,
  entries,
  types,
}: {
  regionName: string;
  entries: readonly SidebarEntry[];
  types: readonly PokemonType[];
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PokemonType | "">("");
  const deferredQuery = useDeferredValue(query);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  const needle = deferredQuery.trim().toLowerCase().replace(/^#0*/, "");
  const visible = entries.filter(
    (entry) =>
      (!type || entry.types.includes(type)) &&
      (!needle ||
        entry.name.toLowerCase().includes(needle) ||
        String(entry.id).startsWith(needle)),
  );

  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] flex-col border-r border-black/5 lg:flex dark:border-white/10">
      <div className="flex flex-col gap-2 border-b border-black/5 p-4 dark:border-white/10">
        {[
          { href: POKEDEX_PATH, label: "Overview" },
          { href: REGION_MAP_PATH, label: `${regionName} map` },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              pathname === link.href
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {link.label}
          </Link>
        ))}
        <label className="sr-only" htmlFor="pokedex-search">
          Search Pokémon
        </label>
        <input
          id="pokedex-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or number"
          className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-white/15"
        />
        <label className="sr-only" htmlFor="pokedex-type">
          Filter by type
        </label>
        <select
          id="pokedex-type"
          value={type}
          onChange={(e) => setType(e.target.value as PokemonType | "")}
          className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm capitalize outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-white/15 dark:[&>option]:bg-zinc-900"
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <p className="px-1 text-xs text-zinc-500 dark:text-zinc-400" aria-live="polite">
          {visible.length} of {entries.length} Pokémon
        </p>
      </div>

      <nav aria-label="Pokémon" className="flex-1 overflow-y-auto p-2">
        <ul>
          {visible.map((entry) => {
            const href = pokemonPath(entry.slug);
            const isActive = pathname === href;
            return (
              <li key={entry.id}>
                <Link
                  ref={isActive ? activeRef : undefined}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-2 py-1 text-sm transition ${
                    isActive
                      ? "bg-red-500 text-white"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Image
                    src={entry.spriteUrl}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 [image-rendering:pixelated]"
                  />
                  <span className="flex-1 truncate font-medium">{entry.name}</span>
                  <span
                    className={`font-mono text-xs ${
                      isActive ? "text-white/80" : "text-zinc-400"
                    }`}
                  >
                    {formatPokedexNumber(entry.id)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {visible.length === 0 && (
          <p className="p-4 text-center text-sm text-zinc-500">No Pokémon found.</p>
        )}
      </nav>
    </aside>
  );
}
