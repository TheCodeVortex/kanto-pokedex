import { describe, expect, it } from "vitest";
import { ENCOUNTER_METHODS, isEncounterMethod } from "./encounter";

describe("encounter methods", () => {
  it("lists the methods of the original games", () => {
    expect(ENCOUNTER_METHODS).toContain("walk");
    expect(ENCOUNTER_METHODS).toContain("super-rod");
  });

  it("recognises known methods only", () => {
    expect(isEncounterMethod("surf")).toBe(true);
    expect(isEncounterMethod("headbutt")).toBe(false);
  });
});
