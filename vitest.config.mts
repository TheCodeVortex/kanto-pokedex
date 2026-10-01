import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const domSetup = "./tests/support/setup-dom.ts";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    restoreMocks: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      // Every source file counts, including ones no test imports.
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}"],
      thresholds: { 100: true },
      reporter: ["text-summary", "text", "html"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          // Unit tests live next to the code they test, in each layer's folder.
          include: ["src/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: [domSetup],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: [domSetup],
        },
      },
      {
        extends: true,
        test: {
          name: "architecture",
          include: ["tests/architecture/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
