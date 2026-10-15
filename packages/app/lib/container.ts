import "server-only";

import { registerCore, type CoreCradle } from "@devmentor/core";
import { getOrm, registerDb, type DbCradle } from "@devmentor/db";
import { asValue, createContainer, InjectionMode, type AwilixContainer } from "awilix";
import { after, connection } from "next/server";
import { cache } from "react";
import { readAppEnv } from "./env";

type AppConfig = {
  /** Current user until authentication exists — the seeded demo account. */
  demoUserEmail: string;
};

export type Cradle = CoreCradle & DbCradle & { config: AppConfig };

const globalForContainer = globalThis as unknown as {
  __devmentorContainer?: Promise<AwilixContainer<Cradle>>;
};

/**
 * Composition root: the only place that wires packages together.
 * Root container holds singletons (ORM + connection pool, config).
 */
function getRootContainer(): Promise<AwilixContainer<Cradle>> {
  globalForContainer.__devmentorContainer ??= (async () => {
    const container = createContainer<Cradle>({
      injectionMode: InjectionMode.PROXY,
      strict: true,
    });
    container.register({
      config: asValue({ demoUserEmail: readAppEnv().DEMO_USER_EMAIL }),
    });
    registerDb(container, await getOrm());
    registerCore(container);
    return container;
  })().catch((error) => {
    globalForContainer.__devmentorContainer = undefined;
    throw error;
  });
  return globalForContainer.__devmentorContainer;
}

/**
 * Request scope — created once per server render thanks to `React.cache`,
 * so scoped registrations (EntityManager fork, repositories, services) are per request.
 *
 * `connection()` marks every database access as request-time data: with Cache Components
 * Next.js otherwise tries to prerender it (at build time, or in the background for dynamic
 * params) and fails on non-deterministic values such as `Date.now()` used by the ORM.
 * Render callers inside `<Suspense>` (or a route with `loading.tsx`).
 *
 * The scope is disposed after the response is sent (`after()`), releasing scoped resources.
 */
const getRequestContainer = cache(async () => {
  await connection();
  const scope = (await getRootContainer()).createScope();
  after(() => scope.dispose());
  return scope;
});

export async function resolve<K extends keyof Cradle>(name: K): Promise<Cradle[K]> {
  return (await getRequestContainer()).resolve(name);
}
