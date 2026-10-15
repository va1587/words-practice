import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Workspace packages ship TypeScript sources and are compiled by Next.
  transpilePackages: ["@devmentor/core", "@devmentor/db", "@devmentor/ui"],
  // MikroORM and the pg driver load modules dynamically — keep them out of the server bundle.
  serverExternalPackages: [
    "@mikro-orm/core",
    "@mikro-orm/sql",
    "@mikro-orm/postgresql",
    "pg",
  ],
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
