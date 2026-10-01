import {
  aPokedex,
  aPokemon,
  KANTO,
  someEncounters,
  someLocations,
  someStats,
} from "@tests/support/builders";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PokemonProfile } from "../../application/get-pokemon-profile";
import { computePokedexStatistics } from "../../domain/pokedex-statistics";
import { PokedexOverviewView } from "./pokedex-overview-view";
import { PokedexShell } from "./pokedex-shell";
import { PokemonProfileView } from "./pokemon-profile-view";
import { RegionMapView } from "./region-map-view";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pokedex",
  useSearchParams: () => new URLSearchParams(),
}));

describe("PokedexShell", () => {
  it("frames the dashboard with navigation, the sidebar and the page", () => {
    Element.prototype.scrollIntoView = vi.fn();
    render(
      <PokedexShell region={KANTO} pokedex={aPokedex()}>
        <p>Page content</p>
      </PokedexShell>,
    );

    const header = within(screen.getByRole("banner"));
    expect(header.getByRole("link", { name: /Pokédex/ })).toHaveAttribute("href", "/");
    expect(header.getByRole("link", { name: "Kanto" })).toHaveAttribute("href", "/pokedex");
    expect(header.getByRole("link", { name: "Map" })).toHaveAttribute("href", "/pokedex/map");
    expect(header.getByRole("link", { name: "Back to home" })).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
    expect(screen.getByText("8 of 8 Pokémon")).toBeInTheDocument();
    // Only types present in the Pokédex are offered as filters.
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "All types",
      "normal",
      "water",
      "electric",
      "grass",
      "poison",
      "flying",
      "psychic",
    ]);
  });
});

describe("PokedexOverviewView", () => {
  it("summarises the Pokédex", () => {
    const pokedex = aPokedex();
    render(
      <PokedexOverviewView
        overview={{ region: KANTO, pokedex, statistics: computePokedexStatistics(pokedex) }}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("1 legendary, 1 mythical")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pokémon per type" })).toBeInTheDocument();
    const strongest = within(screen.getByRole("heading", { name: "Strongest Pokémon" }).closest("section")!);
    expect(strongest.getAllByRole("link")[0]).toHaveTextContent("1Mewtwo614");
    const all = within(screen.getByRole("heading", { name: "All 8 Pokémon" }).closest("section")!);
    expect(all.getAllByRole("link")).toHaveLength(8);
    expect(all.getByRole("link", { name: /Eevee/ })).toHaveAttribute("href", "/pokedex/eevee");
  });

  it("copes with an empty Pokédex", () => {
    render(
      <PokedexOverviewView
        overview={{ region: KANTO, pokedex: [], statistics: computePokedexStatistics([]) }}
      />,
    );
    expect(screen.getByRole("heading", { name: "All 0 Pokémon" })).toBeInTheDocument();
  });
});

describe("PokemonProfileView", () => {
  const bulbasaur = aPokemon();
  const ivysaur = aPokemon({ id: 2, slug: "ivysaur", name: "Ivysaur", evolvesFromId: 1 });

  function profile(overrides: Partial<PokemonProfile> = {}): PokemonProfile {
    return {
      region: KANTO,
      pokemon: ivysaur,
      evolutionLine: [[bulbasaur], [ivysaur]],
      regionAverageStats: someStats(),
      modelUrl: null,
      encounters: [],
      previous: bulbasaur,
      next: aPokemon({ id: 3, slug: "venusaur", name: "Venusaur" }),
      ...overrides,
    };
  }

  it("shows everything about a Pokémon", () => {
    render(<PokemonProfileView profile={profile()} />);

    expect(screen.getByRole("heading", { level: 1, name: "Ivysaur" })).toBeInTheDocument();
    expect(screen.getByText("Seed Pokémon")).toBeInTheDocument();
    expect(screen.getByText(/strange seed/)).toBeInTheDocument();
    expect(screen.getByText("Grassland")).toBeInTheDocument();
    expect(screen.getByText("Chlorophyll").closest("li")).toHaveTextContent("Hidden ability");
    expect(screen.getByRole("link", { name: /Kanto overview/ })).toHaveAttribute("href", "/pokedex");
    expect(screen.getByRole("link", { name: /#0001.*Bulbasaur/ })).toHaveAttribute("rel", "prev");
    expect(screen.getByRole("link", { name: /#0003.*Venusaur/ })).toHaveAttribute("rel", "next");
    expect(screen.getByRole("heading", { name: "Where to find" })).toBeInTheDocument();
    expect(screen.getByText("Wild encounters in Pokémon Red and Blue.")).toBeInTheDocument();
    expect(screen.queryByText(/Legendary|Mythical/)).not.toBeInTheDocument();
  });

  it("handles legendary Pokémon, missing data and the ends of the Pokédex", () => {
    render(
      <PokemonProfileView
        profile={profile({
          pokemon: aPokemon({
            id: 150,
            slug: "mewtwo",
            name: "Mewtwo",
            rarity: "legendary",
            description: "",
            habitat: "rough-terrain",
          }),
          evolutionLine: [[aPokemon({ id: 150, slug: "mewtwo", name: "Mewtwo" })]],
          previous: null,
          next: null,
          modelUrl: "https://models.test/150.glb",
        })}
      />,
    );

    expect(screen.getByText("★ Legendary")).toBeInTheDocument();
    expect(screen.getByText("Rough terrain")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /#0149/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3D model" })).toBeInTheDocument();
  });

  it("shows an unknown habitat", () => {
    render(<PokemonProfileView profile={profile({ pokemon: aPokemon({ habitat: null, rarity: "mythical" }) })} />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("★ Mythical")).toBeInTheDocument();
  });
});

describe("RegionMapView", () => {
  it("shows the region map with only what the client needs", () => {
    render(
      <RegionMapView
        map={{
          region: KANTO,
          locations: someLocations(),
          encounters: someEncounters(),
          pokedex: aPokedex(),
        }}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Kanto map" })).toBeInTheDocument();
    expect(screen.getByText("Where to catch every wild Pokémon in Pokémon Red and Blue.")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Map of Kanto" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "#0016 Pidgey" })).toBeInTheDocument();
  });
});
