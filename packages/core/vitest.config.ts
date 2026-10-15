import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "core",
    include: ["src/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/testing/**"],
      // AGENTS.md: 100% unit test coverage.
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
  },
});
