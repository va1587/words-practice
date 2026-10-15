import { Migrator } from "@mikro-orm/migrations";
import { MikroORM } from "@mikro-orm/postgresql";
import { SeedManager } from "@mikro-orm/seeder";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { fileURLToPath } from "node:url";
import { createConfig } from "../config";
import { DatabaseSeeder } from "../seeders/DatabaseSeeder";

export type TestDatabase = {
  url: string;
  stop: () => Promise<void>;
};

/**
 * Starts a throwaway PostgreSQL 17 (Testcontainers), applies the real migrations and seeds it.
 * Shared by the `db` and `app` integration suites (`@devmentor/db/testing`). Requires Docker.
 */
export async function startTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer("postgres:17-alpine").start();
  const url = container.getConnectionUri();

  const orm = await MikroORM.init(
    createConfig({
      clientUrl: url,
      extensions: [Migrator, SeedManager],
      migrations: {
        path: fileURLToPath(new URL("../migrations", import.meta.url)),
        // Never write `.snapshot-<dbName>.json` for throwaway test databases into the repo.
        snapshot: false,
      },
      // Load migration files through Vitest's module runner (TypeScript, extensionless imports).
      dynamicImportProvider: (id: string) => import(id),
    }),
  );
  try {
    await orm.migrator.up();
    await orm.seeder.seed(DatabaseSeeder);
  } finally {
    await orm.close();
  }

  return {
    url,
    stop: async () => {
      await container.stop();
    },
  };
}
