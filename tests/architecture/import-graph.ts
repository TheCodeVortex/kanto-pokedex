// Builds the import graph of src/ from the source text, so architecture rules
// can be checked without running the code.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

export const ROOT = resolve(__dirname, "../..");
const SRC = join(ROOT, "src");

export interface SourceFile {
  /** Path relative to the project root, with forward slashes, e.g. "src/app/page.tsx". */
  path: string;
  isClientComponent: boolean;
  imports: Import[];
}

export interface Import {
  specifier: string;
  /** Resolved project file for internal imports, null for packages. */
  target: string | null;
  typeOnly: boolean;
}

const IMPORT_PATTERN =
  /(?:^|\n)\s*(import|export)\s+(type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

const toProjectPath = (absolute: string) => relative(ROOT, absolute).split("\\").join("/");

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listSourceFiles(full);
    return /\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry) && !entry.endsWith(".d.ts")
      ? [full]
      : [];
  });
}

function resolveImport(fromFile: string, specifier: string): string | null {
  let base: string;
  if (specifier.startsWith("@/")) base = join(SRC, specifier.slice(2));
  else if (specifier.startsWith(".")) base = resolve(dirname(fromFile), specifier);
  else return null;

  const candidates = [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")];
  const found = candidates.find((c) => existsSync(c) && statSync(c).isFile());
  if (!found) throw new Error(`Cannot resolve "${specifier}" from ${toProjectPath(fromFile)}`);
  return toProjectPath(found);
}

let cache: SourceFile[] | null = null;

export function sourceFiles(): SourceFile[] {
  cache ??= listSourceFiles(SRC).map((file) => {
    const text = readFileSync(file, "utf8");
    const imports: Import[] = [];
    for (const match of text.matchAll(IMPORT_PATTERN)) {
      const specifier = match[3] ?? match[4];
      imports.push({
        specifier,
        target: resolveImport(file, specifier),
        typeOnly: Boolean(match[2]),
      });
    }
    return {
      path: toProjectPath(file),
      isClientComponent: /^\s*["']use client["']/.test(text),
      imports,
    };
  });
  return cache;
}

/** Module name and layer of a file, e.g. { module: "pokemon", layer: "domain" }. */
export function locate(path: string): { area: "app" | "module" | "shared"; module?: string; layer?: string } {
  const parts = path.split("/");
  if (parts[1] === "app") return { area: "app" };
  if (parts[1] === "shared") return { area: "shared", layer: parts[2] };
  return { area: "module", module: parts[2], layer: parts[3]?.replace(/\.tsx?$/, "") };
}

export const PACKAGE = (specifier: string) =>
  specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0];

/** Human-readable list of violations for assertion messages. */
export const describeViolations = (violations: { file: string; imports: string }[]) =>
  violations.map((v) => `${v.file} → ${v.imports}`);
