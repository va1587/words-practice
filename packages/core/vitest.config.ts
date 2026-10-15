import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "core",
    include: ["src/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/testing/**", "src/index.ts"],
      // Engineering standards §5.2: core must stay ≥ 90% covered.
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
    },
  },
});
