import { anEncounter } from "@tests/support/builders";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { RegionMap, type MapPokemon } from "./region-map";

const navigation = vi.hoisted(() => ({ search: "" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const pokemon: MapPokemon[] = [
  { id: 16, slug: "pidgey", name: "Pidgey", spriteUrl: "https://img.test/16.png" },
  { id: 19, slug: "rattata", name: "Rattata", spriteUrl: "https://img.test/19.png" },
  { id: 6, slug: "charizard", name: "Charizard", spriteUrl: "https://img.test/6.png" },
  { id: 150, slug: "mewtwo", name: "Mewtwo", spriteUrl: "https://img.test/150.png" },
];

const encounters = [
  anEncounter({ pokemonId: 16, chance: 50 }),
  anEncounter({ pokemonId: 19, chance: 50, games: ["red"] }),
  anEncounter({ pokemonId: 16, locationSlug: "kanto-route-2", chance: 45 }),
  anEncounter({ pokemonId: 150, locationSlug: "cerulean-cave", method: "only-one", minLevel: 70, maxLevel: 70, chance: 100 }),
  // A Pokémon outside the list (e.g. not in this Pokédex) is skipped.
  anEncounter({ pokemonId: 999, locationSlug: "cerulean-cave" }),
];

const locationNames = {
  "kanto-route-1": "Route 1",
  "kanto-route-2": "Route 2",
  "cerulean-cave": "Cerulean Cave",
  "pallet-town": "Pallet Town",
};

function renderMap() {
  const user = userEvent.setup();
  render(
    <RegionMap
      regionName="Kanto"
      regionGames={["red", "blue"]}
      locationNames={locationNames}
      encounters={encounters}
      pokemon={pokemon}
    />,
  );
  const map = () => within(screen.getByRole("group", { name: "Map of Kanto" }));
  const panel = () => within(screen.getByRole("complementary", { name: "Location details" }));
  return { user, map, panel };
}

describe("RegionMap", () => {
  let replaceState: MockInstance<History["replaceState"]>;

  beforeEach(() => {
    navigation.search = "";
    replaceState = vi.spyOn(window.history, "replaceState");
  });

  it("draws every town, landmark and route as a selectable location", () => {
    const { map, panel } = renderMap();

    expect(map().getAllByRole("button")).toHaveLength(47);
    expect(map().getByRole("button", { name: "Route 1" })).toBeInTheDocument();
    // Locations without a known name fall back to their slug.
    expect(map().getByRole("button", { name: "indigo-plateau" })).toBeInTheDocument();
    expect(panel().getByText(/Select a town, route or cave/)).toBeInTheDocument();
  });

  it("shows a location's Pokémon grouped by method when clicked", async () => {
    const { user, map, panel } = renderMap();

    await user.click(map().getByRole("button", { name: "Route 1" }));

    expect(map().getByRole("button", { name: "Route 1" })).toHaveAttribute("aria-pressed", "true");
    expect(panel().getByRole("heading", { name: "Route 1" })).toBeInTheDocument();
    expect(panel().getByText("2 Pokémon species found here")).toBeInTheDocument();
    expect(panel().getByRole("heading", { name: "Tall grass & caves" })).toBeInTheDocument();
    expect(panel().getByRole("link", { name: /Pidgey.*Lv\. 2–5.*50%/ })).toHaveAttribute("href", "/pokedex/pidgey");
    expect(panel().getByRole("link", { name: /Rattata.*Red only/ })).toBeInTheDocument();
    expect(replaceState).toHaveBeenLastCalledWith(null, "", "/pokedex/map?location=kanto-route-1");
  });

  it("shows one-time encounters without a chance and skips unknown Pokémon", async () => {
    const { user, map, panel } = renderMap();

    await user.click(map().getByRole("button", { name: "Cerulean Cave" }));

    expect(panel().getByRole("heading", { name: "One-time encounter" })).toBeInTheDocument();
    const mewtwo = panel().getByRole("link", { name: /Mewtwo/ });
    expect(mewtwo).toHaveTextContent("Lv. 70");
    expect(mewtwo).not.toHaveTextContent("%");
    expect(panel().getAllByRole("link")).toHaveLength(1);
  });

  it("says when a location has no wild Pokémon", async () => {
    const { user, map, panel } = renderMap();

    await user.click(map().getByRole("button", { name: "Pallet Town" }));

    expect(panel().getByText("No wild Pokémon here.")).toBeInTheDocument();
  });

  it("can be used with the keyboard", async () => {
    const { user, map, panel } = renderMap();
    const route2 = map().getByRole("button", { name: "Route 2" });

    route2.focus();
    await user.keyboard("{Enter}");
    expect(panel().getByRole("heading", { name: "Route 2" })).toBeInTheDocument();

    fireEvent.keyDown(map().getByRole("button", { name: "Pallet Town" }), { key: "Tab" });
    expect(panel().getByRole("heading", { name: "Route 2" })).toBeInTheDocument();

    fireEvent.keyDown(map().getByRole("button", { name: "Pallet Town" }), { key: " " });
    expect(panel().getByRole("heading", { name: "Pallet Town" })).toBeInTheDocument();
  });

  it("selects locations from the list too", async () => {
    const { user, panel } = renderMap();

    await user.selectOptions(panel().getByRole("combobox", { name: "Location" }), "kanto-route-2");
    expect(panel().getByRole("heading", { name: "Route 2" })).toBeInTheDocument();

    await user.selectOptions(panel().getByRole("combobox", { name: "Location" }), "");
    expect(panel().getByText(/Select a town, route or cave/)).toBeInTheDocument();
    expect(replaceState).toHaveBeenLastCalledWith(null, "", "/pokedex/map");
  });

  it("highlights where a Pokémon is found and dims the rest", async () => {
    const { user, map } = renderMap();

    await user.selectOptions(screen.getByRole("combobox", { name: "Find a Pokémon" }), "pidgey");

    expect(screen.getByText(/appears in/)).toHaveTextContent(
      "Pidgey appears in 2 locations, highlighted in red. View profile",
    );
    expect(screen.getByRole("link", { name: "View profile" })).toHaveAttribute("href", "/pokedex/pidgey");
    expect(map().getByRole("button", { name: "Pallet Town" })).toHaveAttribute("opacity", "0.35");
    expect(map().getByRole("button", { name: "Route 1" }).querySelector("polyline")).toHaveClass("stroke-red-500");
    expect(replaceState).toHaveBeenLastCalledWith(null, "", "/pokedex/map?pokemon=pidgey");

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.queryByText(/appears in/)).not.toBeInTheDocument();
    expect(map().getByRole("button", { name: "Pallet Town" })).toHaveAttribute("opacity", "1");
  });

  it("clears the search by choosing the empty option", async () => {
    const { user } = renderMap();
    const finder = screen.getByRole("combobox", { name: "Find a Pokémon" });

    await user.selectOptions(finder, "pidgey");
    await user.selectOptions(finder, "");

    expect(screen.queryByText(/appears in/)).not.toBeInTheDocument();
    expect(replaceState).toHaveBeenLastCalledWith(null, "", "/pokedex/map");
  });

  it("uses the singular for a Pokémon found in one location", async () => {
    const { user } = renderMap();

    await user.selectOptions(screen.getByRole("combobox", { name: "Find a Pokémon" }), "mewtwo");

    expect(screen.getByText(/appears in/)).toHaveTextContent("appears in 1 location,");
  });

  it("explains how to get a Pokémon that isn't found in the wild", async () => {
    const { user } = renderMap();

    await user.selectOptions(screen.getByRole("combobox", { name: "Find a Pokémon" }), "charizard");

    expect(screen.getByText(/caught in the wild/)).toHaveTextContent(
      "Charizard can’t be caught in the wild in Red or Blue.",
    );
  });

  it("restores the selection from the URL", () => {
    navigation.search = "location=kanto-route-1&pokemon=pidgey";
    const { map, panel } = renderMap();

    expect(panel().getByRole("heading", { name: "Route 1" })).toBeInTheDocument();
    expect(panel().getByRole("link", { name: /Pidgey/ })).toHaveClass("bg-red-500/10");
    expect(map().getByRole("button", { name: "Route 1" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("combobox", { name: "Find a Pokémon" })).toHaveValue("pidgey");
  });

  it("ignores unknown locations and Pokémon in the URL", () => {
    navigation.search = "location=atlantis&pokemon=agumon";
    const { panel } = renderMap();

    expect(panel().getByText(/Select a town, route or cave/)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Find a Pokémon" })).toHaveValue("");
  });

  it("shows a selected place with its own outline", async () => {
    const { user, map } = renderMap();
    const town = map().getByRole("button", { name: "Pallet Town" });

    await user.click(town);

    expect(town.querySelectorAll("circle.stroke-zinc-900")).toHaveLength(1);
  });

  it("has a legend", () => {
    renderMap();
    expect(screen.getByText("Sea route")).toBeInTheDocument();
    expect(screen.getByText("Selected")).toBeInTheDocument();
  });
});
