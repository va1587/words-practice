// CLI-only configuration (`npm run db:migrate`, `db:seed`, ...).
import { existsSync } from "node:fs";
import { Migrator } from "@mikro-orm/migrations";
import { SeedManager } from "@mikro-orm/seeder";
import { createConfig } from "./src/config";

// The monorepo keeps a single `.env` in the repository root; variables already set win.
for (const file of ["../../.env.local", "../../.env"]) {
  const path = new URL(file, import.meta.url);
  if (existsSync(path)) process.loadEnvFile(path);
}

// MikroORM imports EVERY .ts file in the migrations/seeders directories — keep tests and helpers out of them.
export default createConfig({
  extensions: [Migrator, SeedManager],
  migrations: {
    path: "./src/migrations",
    pathTs: "./src/migrations",
  },
  seeder: {
    path: "./src/seeders",
    pathTs: "./src/seeders",
  },
});
