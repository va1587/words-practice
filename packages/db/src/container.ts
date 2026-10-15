import type { CorePorts } from "@devmentor/core";
import type { EntityManager, MikroORM } from "@mikro-orm/postgresql";
import { asClass, asFunction, asValue, type AwilixContainer } from "awilix";
import { MikroLearningPathRepository } from "./repositories/learning-path-repository";
import { MikroProgressRepository } from "./repositories/progress-repository";
import { MikroStatsRepository } from "./repositories/stats-repository";

export type DbCradle = CorePorts & {
  orm: MikroORM;
  em: EntityManager;
};

/**
 * Registers the ORM (singleton, owns the connection pool), a forked EntityManager
 * per scope (isolated identity map per request, cleared when the scope is disposed) and
 * repositories implementing core ports.
 */
export function registerDb(container: AwilixContainer, orm: MikroORM) {
  container.register({
    orm: asValue(orm),
    em: asFunction(({ orm }: { orm: MikroORM }) => orm.em.fork())
      .scoped()
      .disposer((em) => em.clear()),
    learningPathRepository: asClass(MikroLearningPathRepository).scoped(),
    progressRepository: asClass(MikroProgressRepository).scoped(),
    statsRepository: asClass(MikroStatsRepository).scoped(),
  });
}
