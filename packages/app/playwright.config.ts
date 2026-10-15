import { defineConfig, devices } from "@playwright/test";
import { e2eEnv } from "./e2e/env";

const baseURL = `http://localhost:${e2eEnv.port}`;

/**
 * E2E tests run against a production build (`next start`): Cache Components / PPR behave
 * differently in `next dev`. Requires a migrated and seeded database (`npm run db:up && npm run db:migrate && npm run db:seed`).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: e2eEnv.ci,
  retries: e2eEnv.ci ? 1 : 0,
  reporter: e2eEnv.ci ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next build && npx next start --port ${e2eEnv.port}`,
    url: baseURL,
    reuseExistingServer: !e2eEnv.ci,
    timeout: 180_000,
    env: { DATABASE_URL: e2eEnv.databaseUrl },
  },
});
