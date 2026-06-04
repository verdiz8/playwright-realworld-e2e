import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  /*
   * Tag-based test selection — uncomment to filter by tag in CI or locally.
   * Grep supports regex; invert with grepInvert.
   *
   * Usage:
   *   npx playwright test --grep '@smoke'          # smoke tests only
   *   npx playwright test --grep '@smoke|@regression'
   *   npx playwright test --grep-invert '@slow'    # skip slow tests
   *
   * To tag a test, add an annotation in the test body:
   *   test('name', { tag: ['@smoke', '@regression'] }, async ({ page }) => { ... })
   */
  // grep: /@smoke/,
  // grepInvert: /@slow/,

  use: {
    baseURL: "https://www.saucedemo.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
