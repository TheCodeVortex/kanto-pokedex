import { anEncounter } from "@tests/support/builders";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LocatedEncounter } from "../../application/get-pokemon-profile";
import { WhereToFind } from "./where-to-find";

const located = (locationName: string, overrides: Partial<LocatedEncounter> = {}) => ({
  ...anEncounter(overrides),
  locationName,
});

describe("WhereToFind", () => {
  it("explains how to get a Pokémon that isn't found in the wild", () => {
    render(<WhereToFind pokemonSlug="charizard" encounters={[]} regionName="Kanto" regionGames={["red", "blue"]} />);

    expect(screen.getByText(/caught in the wild in Red or Blue/)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("lists locations by method then chance, linking to the map", () => {
    render(
      <WhereToFind
        pokemonSlug="pidgey"
        regionName="Kanto"
        regionGames={["red", "blue"]}
        encounters={[
          located("Route 2", { locationSlug: "kanto-route-2", chance: 15 }),
          located("Safari Zone", { locationSlug: "kanto-safari-zone", method: "gift", chance: 100 }),
          located("Route 1", { locationSlug: "kanto-route-1", chance: 50, games: ["red"] }),
        ]}
      />,
    );

    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      expect.stringMatching(/^Route 1.*Tall grass & caves · Lv\. 2–5.*Red only.*50%$/),
      expect.stringMatching(/^Route 2.*15%$/),
      expect.stringMatching(/^Safari Zone.*Gift/),
      "See all on the Kanto map →",
    ]);
    expect(links[0]).toHaveAttribute("href", "/pokedex/map?location=kanto-route-1&pokemon=pidgey");
    expect(links[2].textContent).not.toMatch(/%/);
    expect(links[3]).toHaveAttribute("href", "/pokedex/map?pokemon=pidgey");
  });
});
