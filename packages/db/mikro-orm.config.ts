// CLI-only configuration (`npm run db:migrate`, `db:seed`, ...).
import { Migrator } from "@mikro-orm/migrations";
import { SeedManager } from "@mikro-orm/seeder";
import { createConfig } from "./src/config";

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
