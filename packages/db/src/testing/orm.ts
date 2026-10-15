import { MikroORM } from "@mikro-orm/postgresql";
import { inject } from "vitest";
import { createConfig } from "../config";

/** ORM connected to the Testcontainers database started in `global-setup.ts`. */
export function createTestOrm() {
  return MikroORM.init(createConfig({ clientUrl: inject("databaseUrl") }));
}
