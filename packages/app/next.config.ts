import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

// One `.env` for the whole monorepo lives in the repository root (Next.js only looks in packages/app).
loadEnvConfig(fileURLToPath(new URL("../..", import.meta.url)));

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Workspace packages ship TypeScript sources and are compiled by Next.
  transpilePackages: ["@devmentor/core", "@devmentor/db", "@devmentor/ui"],
  // MikroORM and the pg driver load modules dynamically — keep them out of the server bundle.
  serverExternalPackages: ["@mikro-orm/core", "@mikro-orm/sql", "@mikro-orm/postgresql", "pg"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
