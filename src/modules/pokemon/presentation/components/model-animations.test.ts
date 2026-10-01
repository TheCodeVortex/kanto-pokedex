import { describe, expect, it } from "vitest";
import { animationOptions, pickDefaultAnimation } from "./model-animations";

describe("pickDefaultAnimation", () => {
  it("prefers the default waiting loop", () => {
    expect(
      pickDefaultAnimation([
        "pm0150_00_00_00010_defaultidle01",
        "pm0150_00_00_00000_defaultwait01_loop",
      ]),
    ).toBe("pm0150_00_00_00000_defaultwait01_loop");
  });

  it("then an idle clip", () => {
    expect(pickDefaultAnimation(["model_skeleton|001run", "model_skeleton|001aidle"])).toBe(
      "model_skeleton|001aidle",
    );
  });

  it("skips clips where the Pokémon looks hurt or asleep", () => {
    expect(pickDefaultAnimation(["bd_ev107_sleeploop", "bd_run", "bd_landing_loop"])).toBe(
      "bd_landing_loop",
    );
  });

  it("falls back to the first clip, or nothing", () => {
    expect(pickDefaultAnimation(["Chariard_dizzy"])).toBe("Chariard_dizzy");
    expect(pickDefaultAnimation([])).toBeNull();
  });
});

describe("animationOptions", () => {
  it("turns clip names into readable labels", () => {
    expect(
      animationOptions([
        "model_skeleton|001aidle",
        "pm0150_00_00_00000_defaultwait01_loop",
        "bd_ev107_sleeploop",
        "faiyaa_10|bd_appear|Base Layer",
      ]).map((o) => o.label),
    ).toEqual(["Idle", "Default wait 01", "Sleep", "Appear"]);
  });

  it("numbers duplicate labels", () => {
    expect(
      animationOptions([
        "pm0150_00_00_00000_defaultwait01_loop",
        "pm0150_00_00_20000_defaultwait01_loop",
      ]),
    ).toEqual([
      { clip: "pm0150_00_00_00000_defaultwait01_loop", label: "Default wait 01" },
      { clip: "pm0150_00_00_20000_defaultwait01_loop", label: "Default wait 01 (2)" },
    ]);
  });

  it("keeps the raw name when nothing readable is left", () => {
    expect(animationOptions(["Base Layer"])[0].label).toBe("Base Layer");
    expect(animationOptions(["_"])[0].label).toBe("_");
  });
});
