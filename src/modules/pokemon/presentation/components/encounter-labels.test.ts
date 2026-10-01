import { anEncounter } from "@tests/support/builders";
import { describe, expect, it } from "vitest";
import { ENCOUNTER_METHODS } from "../../domain/encounter";
import {
  chanceLabel,
  ENCOUNTER_METHOD_LABELS,
  exclusiveGameLabel,
  levelRange,
} from "./encounter-labels";

describe("encounter labels", () => {
  it("labels every encounter method", () => {
    for (const method of ENCOUNTER_METHODS) {
      expect(ENCOUNTER_METHOD_LABELS[method]).toBeTruthy();
    }
  });

  it("formats a level or a level range", () => {
    expect(levelRange(anEncounter({ minLevel: 5, maxLevel: 5 }))).toBe("Lv. 5");
    expect(levelRange(anEncounter({ minLevel: 2, maxLevel: 5 }))).toBe("Lv. 2–5");
  });

  it("shows a chance only for random encounters", () => {
    expect(chanceLabel(anEncounter({ method: "super-rod", chance: 5 }))).toBe("5%");
    expect(chanceLabel(anEncounter({ method: "gift", chance: 100 }))).toBeNull();
  });

  it("flags encounters missing from some of the region's games", () => {
    const games = ["red", "blue"];
    expect(exclusiveGameLabel(anEncounter({ games: ["red"] }), games)).toBe("Red only");
    expect(exclusiveGameLabel(anEncounter({ games: ["red", "blue"] }), games)).toBeNull();
    expect(
      exclusiveGameLabel(anEncounter({ games: ["red", "green"] }), ["red", "green", "blue"]),
    ).toBe("Red & Green only");
  });
});
