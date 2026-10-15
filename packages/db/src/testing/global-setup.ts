import { Migrator } from "@mikro-orm/migrations";
import { MikroORM } from "@mikro-orm/postgresql";
import { SeedManager } from "@mikro-orm/seeder";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { fileURLToPath } from "node:url";
import type { TestProject } from "vitest/node";
import { createConfig } from "../config";
import { DatabaseSeeder } from "../seeders/DatabaseSeeder";

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

let container: StartedPostgreSqlContainer | undefined;

/** One PostgreSQL container per test run: migrated with the real migrations and seeded once. */
export async function setup(project: TestProject) {
  container = await new PostgreSqlContainer("postgres:17-alpine").start();
  const databaseUrl = container.getConnectionUri();

  const orm = await MikroORM.init(
    createConfig({
      clientUrl: databaseUrl,
      extensions: [Migrator, SeedManager],
      migrations: { path: fileURLToPath(new URL("../migrations", import.meta.url)) },
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

  project.provide("databaseUrl", databaseUrl);
}

export async function teardown() {
  await container?.stop();
}
