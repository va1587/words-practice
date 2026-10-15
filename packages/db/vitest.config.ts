import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
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
