import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "ui",
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}"],
      // AGENTS.md: 100% unit test coverage.
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
  },
});
