import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;

// E2E tests run against a production build, as the Next.js testing guide recommends.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    // Uses the installed Google Chrome; run `npx playwright install chromium` and
    // remove `channel` to use Playwright's bundled browser instead.
    channel: "chrome",
    launchOptions: {
      // Software WebGL for the 3D model viewer in headless mode.
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" }, testIgnore: /mobile\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" }, testMatch: /mobile\.spec/ },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
