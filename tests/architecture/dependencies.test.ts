import { describe, expect, it } from "vitest";
import { describeViolations, locate, sourceFiles } from "./import-graph";

describe("dependencies", () => {
  it("has no circular imports", () => {
    const graph = new Map(
      sourceFiles().map((f) => [f.path, f.imports.flatMap((i) => (i.target ? [i.target] : []))]),
    );
    const cycles: string[] = [];
    const state = new Map<string, "visiting" | "done">();

    const visit = (file: string, trail: string[]) => {
      if (state.get(file) === "done") return;
      if (state.get(file) === "visiting") {
        cycles.push([...trail.slice(trail.indexOf(file)), file].join(" → "));
        return;
      }
      state.set(file, "visiting");
      for (const next of graph.get(file) ?? []) visit(next, [...trail, file]);
      state.set(file, "done");
    };
    for (const file of graph.keys()) visit(file, []);

    expect(cycles).toEqual([]);
  });

  it("keeps server-side data access out of client components", () => {
    const leaks = sourceFiles()
      .filter((f) => f.isClientComponent)
      .flatMap((file) =>
        file.imports
          .filter((i) => i.target)
          .filter((i) => {
            const to = locate(i.target!);
            return (
              to.layer === "infrastructure" ||
              to.layer === "application" ||
              i.target!.endsWith("/composition.ts") ||
              i.target!.endsWith("/index.ts")
            );
          })
          .map((i) => ({ file: file.path, imports: i.specifier })),
      );
    expect(describeViolations(leaks)).toEqual([]);
  });

  it("only marks presentation code as client components", () => {
    const misplaced = sourceFiles()
      .filter((f) => f.isClientComponent && locate(f.path).layer !== "presentation")
      .map((f) => f.path);
    expect(misplaced).toEqual([]);
  });

  it("keeps route files thin: they only use module public APIs, shared code and Next.js", () => {
    const routeImports = sourceFiles()
      .filter((f) => f.path.startsWith("src/app/"))
      .flatMap((file) =>
        file.imports
          .filter((i) => i.target !== null)
          .filter((i) => {
            const to = locate(i.target!);
            return !(to.area === "shared" || (to.area === "module" && i.target!.endsWith("/index.ts")));
          })
          .filter((i) => !i.target!.endsWith(".css"))
          .map((i) => ({ file: file.path, imports: i.specifier })),
      );
    expect(describeViolations(routeImports)).toEqual([]);
  });
});
