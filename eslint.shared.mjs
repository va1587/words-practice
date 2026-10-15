// Shared ESLint building blocks for all workspace packages.
// - Dependency direction (see AGENTS.md): app → core/db/ui, db → core; core and ui depend on no workspace package.
// - Coding standards (see .ai/specs/2026-10-15-tech-stack-and-engineering-standards.md §6).
import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const workspacePackages = ["@devmentor/app", "@devmentor/core", "@devmentor/db", "@devmentor/ui"];

const tsFiles = ["**/*.{ts,tsx,mts}"];

/**
 * `no-restricted-imports` config forbidding the given import patterns.
 * @param {{ group: string[], message: string }[]} patterns
 */
export function restrictImports(patterns) {
  return {
    files: ["**/*.{ts,tsx,mts,mjs,js}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*/src/**", "**/packages/*/src/**"],
              message:
                "Import other workspace packages by name (@devmentor/...), never by relative path.",
            },
            ...patterns,
          ],
        },
      ],
    },
  };
}

/** Patterns for workspace packages other than `self` that `self` must not import. */
export function forbidWorkspace(self, allowed = []) {
  const forbidden = workspacePackages.filter((p) => p !== self && !allowed.includes(p));
  return {
    group: forbidden.flatMap((p) => [p, `${p}/*`]),
    message: `${self} must not depend on this package (dependency direction: app → core/db/ui, db → core).`,
  };
}

/**
 * Type-aware TypeScript rules shared by every package (app included).
 * `projectService` finds the nearest tsconfig.json for each file.
 */
export const typeAwareStandards = [
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({ ...config, files: tsFiles })),
  {
    files: tsFiles,
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["error", { allow: ["info", "warn", "error"] }],
      eqeqeq: ["error", "smart"],
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message: "Read environment variables only in the package's validated env.ts module.",
        },
      ],
    },
  },
  {
    files: ["**/env.ts"],
    rules: { "no-restricted-properties": "off" },
  },
];

/** Base config for framework-agnostic TypeScript packages (core, db, ui). */
export function packageConfig(...extra) {
  return tseslint.config(
    globalIgnores(["node_modules/**", "dist/**", "coverage/**"]),
    ...tseslint.configs.recommended,
    ...typeAwareStandards,
    ...extra,
  );
}
