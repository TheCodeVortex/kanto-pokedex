import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PokedexSidebar, type SidebarEntry } from "./pokedex-sidebar";

const navigation = vi.hoisted(() => ({ pathname: "/pokedex" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

const entries: SidebarEntry[] = [
  { id: 1, slug: "bulbasaur", name: "Bulbasaur", types: ["grass", "poison"], spriteUrl: "https://img.test/1.png" },
  { id: 25, slug: "pikachu", name: "Pikachu", types: ["electric"], spriteUrl: "https://img.test/25.png" },
  { id: 26, slug: "raichu", name: "Raichu", types: ["electric"], spriteUrl: "https://img.test/26.png" },
  { id: 134, slug: "vaporeon", name: "Vaporeon", types: ["water"], spriteUrl: "https://img.test/134.png" },
];

function renderSidebar() {
  const user = userEvent.setup();
  render(<PokedexSidebar regionName="Kanto" entries={entries} types={["grass", "electric", "water"]} />);
  const list = () => within(screen.getByRole("navigation", { name: "Pokémon" }));
  return { user, list };
}

describe("PokedexSidebar", () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    navigation.pathname = "/pokedex";
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  it("links to the overview and the region map, marking the current page", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Kanto map" })).toHaveAttribute("href", "/pokedex/map");
    expect(screen.getByRole("link", { name: "Kanto map" })).not.toHaveAttribute("aria-current");
  });

  it("lists every Pokémon and highlights the one being viewed", () => {
    navigation.pathname = "/pokedex/pikachu";
    const { list } = renderSidebar();

    expect(list().getAllByRole("link")).toHaveLength(4);
    expect(list().getByRole("link", { name: /Pikachu/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    expect(screen.getByText("4 of 4 Pokémon")).toBeInTheDocument();
  });

  it("searches by name", async () => {
    const { user, list } = renderSidebar();

    await user.type(screen.getByRole("searchbox", { name: "Search Pokémon" }), "  CHU ");

    expect(list().getAllByRole("link").map((l) => l.textContent)).toEqual([
      expect.stringContaining("Pikachu"),
      expect.stringContaining("Raichu"),
    ]);
    expect(screen.getByText("2 of 4 Pokémon")).toBeInTheDocument();
  });

  it("searches by Pokédex number, with or without # and leading zeros", async () => {
    const { user, list } = renderSidebar();
    const search = screen.getByRole("searchbox", { name: "Search Pokémon" });

    await user.type(search, "#0025");
    expect(list().getAllByRole("link")).toHaveLength(1);

    await user.clear(search);
    await user.type(search, "13");
    expect(list().getByRole("link", { name: /Vaporeon/ })).toBeInTheDocument();
  });

  it("filters by type and says when nothing matches", async () => {
    const { user, list } = renderSidebar();

    await user.selectOptions(screen.getByRole("combobox", { name: "Filter by type" }), "water");
    expect(list().getAllByRole("link")).toHaveLength(1);

    await user.type(screen.getByRole("searchbox", { name: "Search Pokémon" }), "pika");
    expect(list().queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText("No Pokémon found.")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "Filter by type" }), "");
    expect(list().getAllByRole("link")).toHaveLength(1);
  });
});
