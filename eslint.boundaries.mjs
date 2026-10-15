// Shared ESLint building blocks for workspace packages.
// Dependency direction (see AGENTS.md): app → core/db/ui, db → core; core and ui depend on no workspace package.
import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const workspacePackages = ["@devmentor/app", "@devmentor/core", "@devmentor/db", "@devmentor/ui"];

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
              message: "Import other workspace packages by name (@devmentor/...), never by relative path.",
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

/** Base config for framework-agnostic TypeScript packages (core, db, ui). */
export function packageConfig(...extra) {
  return tseslint.config(
    globalIgnores(["node_modules/**", "dist/**"]),
    ...tseslint.configs.recommended,
    ...extra,
  );
}
