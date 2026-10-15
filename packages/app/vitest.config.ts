import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL(".", import.meta.url)) };

export default defineConfig({
  resolve: { alias },
  test: {
    coverage: {
      provider: "v8",
      include: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}"],
      // AGENTS.md: 100% unit test coverage.
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
    projects: [
      {
        resolve: {
          alias: {
            ...alias,
            "server-only": fileURLToPath(new URL("./testing/empty-module.ts", import.meta.url)),
          },
        },
        test: {
          name: "app:unit",
          include: ["{app,components,lib}/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["./testing/setup.ts"],
        },
      },
      {
        resolve: { alias },
        // Temporary app instance on Testcontainers PostgreSQL, driven by agent-browser.
        test: {
          name: "app:integration",
          include: ["integration/**/*.int.test.ts"],
          environment: "node",
          globalSetup: ["./integration/global-setup.ts"],
          hookTimeout: 300_000,
          testTimeout: 60_000,
          fileParallelism: false,
        },
      },
    ],
  },
});
