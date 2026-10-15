import { MikroORM } from "@mikro-orm/postgresql";
import { createConfig } from "./config";

const globalForOrm = globalThis as unknown as { __devmentorOrm?: Promise<MikroORM> };

/**
 * One ORM instance (and therefore one connection pool) per process.
 * Cached on `globalThis` so Next.js dev HMR does not open a new pool on every reload.
 */
export function getOrm(): Promise<MikroORM> {
  globalForOrm.__devmentorOrm ??= MikroORM.init(createConfig()).catch((error) => {
    globalForOrm.__devmentorOrm = undefined;
    throw error;
  });
  return globalForOrm.__devmentorOrm;
}
