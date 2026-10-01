import { aPokemon } from "@tests/support/builders";
import { describe, expect, it } from "vitest";
import { formatPokedexNumber, heightInMetres, weightInKilograms } from "./pokemon";

describe("formatPokedexNumber", () => {
  it.each([
    [1, "#0001"],
    [25, "#0025"],
    [151, "#0151"],
    [1025, "#1025"],
  ])("formats %i as %s", (id, expected) => {
    expect(formatPokedexNumber(id)).toBe(expected);
  });
});

describe("units", () => {
  it("converts height from decimetres to metres", () => {
    expect(heightInMetres(aPokemon({ height: 17 }))).toBe(1.7);
  });

  it("converts weight from hectograms to kilograms", () => {
    expect(weightInKilograms(aPokemon({ weight: 905 }))).toBe(90.5);
  });
});
