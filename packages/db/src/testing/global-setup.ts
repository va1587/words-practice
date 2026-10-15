import type { TestProject } from "vitest/node";
import { startTestDatabase, type TestDatabase } from "./database";

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

let database: TestDatabase | undefined;

/** One migrated and seeded PostgreSQL container per `db:integration` run. */
export async function setup(project: TestProject) {
  database = await startTestDatabase();
  project.provide("databaseUrl", database.url);
}

export async function teardown() {
  await database?.stop();
}
