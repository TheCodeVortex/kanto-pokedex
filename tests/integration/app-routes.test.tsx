// Every Next.js route in src/app, rendered through the real modules with only
// the network replaced. Async pages are awaited, then their output rendered.
import RootLayout, { metadata as rootMetadata } from "@/app/layout";
import HomePage from "@/app/page";
import PokemonPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from "@/app/pokedex/[slug]/page";
import PokedexLayout from "@/app/pokedex/layout";
import RegionMapPage, { metadata as mapMetadata } from "@/app/pokedex/map/page";
import PokedexPage, { metadata as pokedexMetadata } from "@/app/pokedex/page";
import { stubPokeApi } from "@tests/support/poke-api-fixtures";
import { render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => "/pokedex",
  useSearchParams: () => new URLSearchParams(),
}));

const params = (slug: string) => ({ params: Promise.resolve({ slug }), searchParams: Promise.resolve({}) });

describe("app routes", () => {
  beforeEach(() => {
    stubPokeApi();
    Element.prototype.scrollIntoView = vi.fn();
  });

  describe("root layout", () => {
    it("sets up the document with the fonts and metadata", () => {
      const html = renderToString(
        <RootLayout params={Promise.resolve({})}>
          <p>child</p>
        </RootLayout>,
      );

      expect(html).toMatch(/<html lang="en" class="--font-geist-sans --font-geist-mono h-full antialiased">/);
      expect(html).toContain("<p>child</p>");
      expect(rootMetadata.title).toBe("Pokédex | Gotta know 'em all");
    });
  });

  describe("/", () => {
    it("renders the landing page", () => {
      const html = renderToString(<HomePage />);

      expect(html).toContain("Gotta know");
      expect(html).toContain('href="/pokedex"');
    });
  });

  describe("/pokedex", () => {
    it("wraps every Pokédex page in the dashboard shell", async () => {
      render(
        await PokedexLayout({
          children: <p>page</p>,
          params: Promise.resolve({}),
        } as LayoutProps<"/pokedex">),
      );

      expect(screen.getByText("page")).toBeInTheDocument();
      expect(screen.getByText("5 of 5 Pokémon")).toBeInTheDocument();
    });

    it("renders the overview", async () => {
      render(await PokedexPage());

      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "All 5 Pokémon" })).toBeInTheDocument();
      expect(pokedexMetadata.title).toBe("Kanto Pokédex");
    });
  });

  describe("/pokedex/[slug]", () => {
    it("prerenders every Kanto Pokémon and nothing else", async () => {
      expect(await generateStaticParams()).toEqual([
        { slug: "bulbasaur" },
        { slug: "ivysaur" },
        { slug: "pidgey" },
        { slug: "mewtwo" },
        { slug: "mew" },
      ]);
      expect(dynamicParams).toBe(false);
    });

    it("renders a Pokémon's profile", async () => {
      render(await PokemonPage(params("pidgey") as PageProps<"/pokedex/[slug]">));

      expect(screen.getByRole("heading", { level: 1, name: "Pidgey" })).toBeInTheDocument();
      const whereToFind = within(screen.getByRole("heading", { name: "Where to find" }).closest("section")!);
      expect(whereToFind.getByRole("link", { name: /Route 1/ })).toBeInTheDocument();
    });

    it("is a 404 for an unknown Pokémon", async () => {
      await expect(PokemonPage(params("pichu") as PageProps<"/pokedex/[slug]">)).rejects.toThrow(
        "NEXT_HTTP_ERROR_FALLBACK;404",
      );
    });

    it("describes each Pokémon for search engines", async () => {
      expect(await generateMetadata(params("bulbasaur") as PageProps<"/pokedex/[slug]">)).toEqual({
        title: "Bulbasaur | Pokédex",
        description: "A strange seed was planted on its back at birth. The Pokémon grows.",
      });
      // Without a Pokédex entry, the description falls back to name and category.
      expect(await generateMetadata(params("mew") as PageProps<"/pokedex/[slug]">)).toEqual({
        title: "mew | Pokédex",
        description: "mew, the .",
      });
      expect(await generateMetadata(params("pichu") as PageProps<"/pokedex/[slug]">)).toEqual({});
    });
  });

  describe("/pokedex/map", () => {
    it("renders the Kanto map", async () => {
      render(await RegionMapPage());

      expect(screen.getByRole("heading", { level: 1, name: "Kanto map" })).toBeInTheDocument();
      expect(screen.getByRole("group", { name: "Map of Kanto" })).toBeInTheDocument();
      expect(mapMetadata.title).toBe("Kanto map | Pokédex");
    });
  });
});
