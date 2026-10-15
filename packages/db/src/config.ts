import { defineConfig, type Options } from "@mikro-orm/postgresql";
import { entities } from "./entities";

const DEFAULT_DATABASE_URL = "postgresql://devmentor:devmentor@localhost:5432/devmentor";

/**
 * Runtime ORM configuration shared by the app and the CLI.
 * Extensions (migrations, seeder) are added only in `mikro-orm.config.ts` so the
 * Next.js server bundle does not load CLI-only code.
 */
export function createConfig(overrides: Options = {}): Options {
  return defineConfig({
    clientUrl: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
    entities,
    pool: {
      min: Number(process.env.DATABASE_POOL_MIN ?? 0),
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
    },
    debug: process.env.DATABASE_DEBUG === "true",
    ...overrides,
  });
}
