import { defineConfig, type Options } from "@mikro-orm/postgresql";
import { entities } from "./entities";
import { readDbEnv } from "./env";

/**
 * Runtime ORM configuration shared by the app and the CLI.
 * Extensions (migrations, seeder) are added only in `mikro-orm.config.ts` so the
 * Next.js server bundle does not load CLI-only code.
 */
export function createConfig(overrides: Options = {}): Options {
  const env = readDbEnv();
  return defineConfig({
    clientUrl: env.DATABASE_URL,
    entities,
    pool: {
      min: env.DATABASE_POOL_MIN,
      max: env.DATABASE_POOL_MAX,
      idleTimeoutMillis: 30_000,
    },
    debug: env.DATABASE_DEBUG,
    ...overrides,
  });
}
