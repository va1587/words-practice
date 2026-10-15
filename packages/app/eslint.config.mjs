import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { restrictImports, typeAwareStandards } from "../../eslint.shared.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...typeAwareStandards,
  // Data access goes through @devmentor/db repositories resolved from the DI container.
  restrictImports([
    {
      group: ["@mikro-orm/*", "pg"],
      message:
        "Do not use the ORM directly in the app — add a port in @devmentor/core and a repository in @devmentor/db.",
    },
  ]),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
