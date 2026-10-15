import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts", "mikro-orm.config.ts"],
      // Test infrastructure and generated migrations (covered by db:integration) are not app code.
      exclude: ["src/**/*.test.ts", "src/testing/**", "src/migrations/**"],
      // AGENTS.md: 100% unit test coverage.
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
    projects: [
      {
        test: {
          name: "db:unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.int.test.ts"],
          environment: "node",
        },
      },
      {
        // Real PostgreSQL in Docker (Testcontainers) with real migrations and seed data.
        test: {
          name: "db:integration",
          include: ["src/**/*.int.test.ts"],
          environment: "node",
          globalSetup: ["./src/testing/global-setup.ts"],
          hookTimeout: 120_000,
          testTimeout: 30_000,
        },
      },
    ],
  },
});
