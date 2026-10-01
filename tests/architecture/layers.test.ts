// Dependency rule: presentation → application → domain ← infrastructure.
import { describe, expect, it } from "vitest";
import { describeViolations, locate, PACKAGE, sourceFiles } from "./import-graph";

function violations(
  inLayer: (file: ReturnType<typeof locate>) => boolean,
  allowed: (from: ReturnType<typeof locate>, to: ReturnType<typeof locate> | null, specifier: string) => boolean,
) {
  return describeViolations(
    sourceFiles()
      .filter((f) => inLayer(locate(f.path)))
      .flatMap((f) =>
        f.imports
          .filter((i) => !allowed(locate(f.path), i.target ? locate(i.target) : null, i.specifier))
          .map((i) => ({ file: f.path, imports: i.specifier })),
      ),
  );
}

const sameModule = (a: ReturnType<typeof locate>, b: ReturnType<typeof locate>) =>
  b.area === "module" && b.module === a.module;

describe("layers", () => {
  it("has domain code that is pure: no frameworks, no other layers", () => {
    expect(
      violations(
        (f) => f.layer === "domain",
        (from, to) =>
          to !== null &&
          to.layer === "domain" &&
          (to.area === "shared" || sameModule(from, to)),
      ),
    ).toEqual([]);
  });

  it("has application code that only uses the domain and shared application contracts", () => {
    expect(
      violations(
        (f) => f.area === "module" && f.layer === "application",
        (from, to) =>
          to !== null &&
          ((sameModule(from, to) && (to.layer === "domain" || to.layer === "application")) ||
            (to.area === "shared" && (to.layer === "domain" || to.layer === "application"))),
      ),
    ).toEqual([]);
  });

  it("has infrastructure that implements the domain without reaching into other layers", () => {
    expect(
      violations(
        (f) => f.area === "module" && f.layer === "infrastructure",
        (from, to, specifier) =>
          to === null
            ? PACKAGE(specifier) === "react" // only for its request-scoped `cache`
            : sameModule(from, to) && (to.layer === "domain" || to.layer === "infrastructure"),
      ),
    ).toEqual([]);
  });

  it("has presentation that never touches infrastructure or the composition root", () => {
    expect(
      violations(
        (f) => f.area === "module" && f.layer === "presentation",
        (from, to) =>
          to === null ||
          to.area === "shared" ||
          (sameModule(from, to) && ["domain", "application", "presentation"].includes(to.layer!)) ||
          // Other modules only through their public API (checked in module-boundaries).
          (to.area === "module" && !sameModule(from, to)),
      ),
    ).toEqual([]);
  });

  it("has a shared kernel that depends on no module or route", () => {
    expect(
      violations(
        (f) => f.area === "shared",
        (_from, to) => to === null || to.area === "shared",
      ),
    ).toEqual([]);
  });

  it("keeps the shared domain and application layers free of frameworks", () => {
    expect(
      violations(
        (f) => f.area === "shared" && (f.layer === "domain" || f.layer === "application"),
        (_from, to) => to !== null && to.area === "shared" && to.layer !== "presentation",
      ),
    ).toEqual([]);
  });
});
