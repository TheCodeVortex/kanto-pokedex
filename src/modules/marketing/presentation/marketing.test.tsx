import { aPokedex } from "@tests/support/builders";
import { render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CtaSection } from "./components/cta-section";
import { FeaturedPokemonGrid, FeaturedPokemonSection } from "./components/featured-pokemon-section";
import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { TypesSection } from "./components/types-section";
import { LandingView } from "./views/landing-view";

/**
 * Server-renders a tree containing async components, as on a first page load:
 * Suspense boundaries that are still loading show their fallback.
 */
function renderOnServer(ui: React.ReactElement) {
  const container = document.createElement("div");
  container.innerHTML = renderToString(ui);
  document.body.append(container);
  return within(container);
}

// The marketing module only depends on the pokemon module's public API;
// replace its data access and keep its real components.
const pokemonApi = vi.hoisted(() => ({ getFeaturedPokemon: vi.fn() }));
vi.mock("@/modules/pokemon", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/modules/pokemon")>()),
  getFeaturedPokemon: pokemonApi.getFeaturedPokemon,
}));

describe("landing page sections", () => {
  it("has a header that starts exploring the Pokédex", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Start exploring" })).toHaveAttribute("href", "/pokedex");
    expect(screen.getByRole("link", { name: /Pokédex/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Types" })).toHaveAttribute("href", "#types");
  });

  it("has a hero with the main calls to action", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Gotta know ’em all.");
    expect(screen.getByRole("link", { name: "Explore Pokémon" })).toHaveAttribute("href", "/pokedex");
    expect(screen.getByRole("link", { name: "Browse by type" })).toHaveAttribute("href", "#types");
    expect(screen.getByRole("img", { name: "Pikachu" })).toHaveAttribute(
      "src",
      expect.stringContaining("official-artwork/25.png"),
    );
  });

  it("lists the features", () => {
    render(<FeaturesSection />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Instant search",
      "Detailed stats",
      "Type matchups",
      "Evolution chains",
    ]);
  });

  it("shows all 18 types", () => {
    render(<TypesSection />);
    expect(screen.getAllByRole("listitem")).toHaveLength(18);
  });

  it("ends with a call to action and credits", () => {
    render(
      <>
        <CtaSection />
        <SiteFooter />
      </>,
    );
    expect(screen.getByRole("link", { name: "Open the Pokédex" })).toHaveAttribute("href", "/pokedex");
    expect(screen.getByRole("link", { name: "PokéAPI" })).toHaveAttribute("href", "https://pokeapi.co");
  });
});

describe("featured Pokémon", () => {
  beforeEach(() => {
    pokemonApi.getFeaturedPokemon.mockReset();
  });

  it("shows a loading skeleton while the Pokémon load", () => {
    pokemonApi.getFeaturedPokemon.mockReturnValue(new Promise(() => {}));
    const page = renderOnServer(<FeaturedPokemonSection />);
    expect(page.getByRole("heading", { name: "Meet the classics" })).toBeInTheDocument();
    expect(page.getAllByText((_, el) => el?.classList.contains("animate-pulse") ?? false)).toHaveLength(6);
  });

  it("shows a card per featured Pokémon", async () => {
    pokemonApi.getFeaturedPokemon.mockResolvedValue(aPokedex().slice(0, 3));
    render(await FeaturedPokemonGrid());
    expect(screen.getAllByRole("link").map((l) => l.getAttribute("href"))).toEqual([
      "/pokedex/bulbasaur",
      "/pokedex/ivysaur",
      "/pokedex/pidgey",
    ]);
  });

  it("still renders when PokéAPI is unavailable", async () => {
    pokemonApi.getFeaturedPokemon.mockRejectedValue(new Error("PokeAPI GraphQL responded 503"));
    render(await FeaturedPokemonGrid());
    expect(screen.getByText(/The Pokémon are hiding right now/)).toBeInTheDocument();
  });
});

describe("LandingView", () => {
  it("puts the sections together", () => {
    pokemonApi.getFeaturedPokemon.mockReturnValue(new Promise(() => {}));
    const page = renderOnServer(<LandingView />);

    expect(page.getByRole("banner")).toBeInTheDocument();
    const main = within(page.getByRole("main"));
    expect(main.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Everything a trainer needs",
      "Meet the classics",
      "18 types, endless strategy",
      "Your adventure starts here",
    ]);
    expect(page.getByRole("contentinfo")).toBeInTheDocument();
  });
});
