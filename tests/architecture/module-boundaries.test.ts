// Bounded contexts talk to each other, and routes talk to them, only through
// each module's public API (its index.ts). Only the composition root builds adapters.
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { describeViolations, locate, ROOT, sourceFiles } from "./import-graph";

const MODULES_DIR = join(ROOT, "src/modules");
const modules = readdirSync(MODULES_DIR).filter((entry) =>
  statSync(join(MODULES_DIR, entry)).isDirectory(),
);
const publicApi = (name: string) => `src/modules/${name}/index.ts`;

describe("module boundaries", () => {
  it("gives every module a public API", () => {
    expect(modules.length).toBeGreaterThan(0);
    for (const name of modules) {
      expect(sourceFiles().some((f) => f.path === publicApi(name)), name).toBe(true);
    }
  });

  it("only uses another module through its public API", () => {
    const deepImports = sourceFiles().flatMap((file) => {
      const from = locate(file.path);
      return file.imports
        .filter((i) => i.target && locate(i.target).area === "module")
        .filter((i) => {
          const to = locate(i.target!);
          const crossesBoundary = from.area !== "module" || from.module !== to.module;
          return crossesBoundary && i.target !== publicApi(to.module!);
        })
        .map((i) => ({ file: file.path, imports: i.specifier }));
    });
    expect(describeViolations(deepImports)).toEqual([]);
  });

  it("imports the public API with the module alias, not a relative path", () => {
    const relativeCrossings = sourceFiles().flatMap((file) =>
      file.imports
        .filter((i) => i.target && i.specifier.startsWith("."))
        .filter((i) => locate(file.path).module !== locate(i.target!).module)
        .map((i) => ({ file: file.path, imports: i.specifier })),
    );
    expect(describeViolations(relativeCrossings)).toEqual([]);
  });

  it("never imports from route files", () => {
    const intoApp = sourceFiles().flatMap((file) =>
      file.imports
        .filter((i) => i.target?.startsWith("src/app/") && !file.path.startsWith("src/app/"))
        .map((i) => ({ file: file.path, imports: i.specifier })),
    );
    expect(describeViolations(intoApp)).toEqual([]);
  });

  it("builds infrastructure adapters only in the composition root", () => {
    const infrastructureUsers = sourceFiles().flatMap((file) => {
      const from = locate(file.path);
      if (from.layer === "infrastructure") return [];
      return file.imports
        .filter((i) => i.target && locate(i.target).layer === "infrastructure")
        .filter(() => !file.path.endsWith("/composition.ts") && !file.path.endsWith("/index.ts"))
        .map((i) => ({ file: file.path, imports: i.specifier }));
    });
    expect(describeViolations(infrastructureUsers)).toEqual([]);
  });

  it("lays out every module with the standard layers only", () => {
    const allowed = new Set([
      "domain",
      "application",
      "infrastructure",
      "presentation",
      "index.ts",
      "composition.ts",
    ]);
    for (const name of modules) {
      const unexpected = readdirSync(join(MODULES_DIR, name)).filter((e) => !allowed.has(e));
      expect(unexpected, `src/modules/${name}`).toEqual([]);
    }
  });
});
