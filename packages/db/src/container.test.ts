import type { MikroORM } from "@mikro-orm/postgresql";
import { createContainer, InjectionMode } from "awilix";
import { describe, expect, it, vi } from "vitest";
import { registerDb, type DbCradle } from "./container";
import { MikroLearningPathRepository } from "./repositories/learning-path-repository";
import { MikroProgressRepository } from "./repositories/progress-repository";
import { MikroStatsRepository } from "./repositories/stats-repository";

function setup() {
  const forks: { clear: ReturnType<typeof vi.fn> }[] = [];
  const orm = {
    em: {
      fork: vi.fn(() => {
        const em = { clear: vi.fn() };
        forks.push(em);
        return em;
      }),
    },
  } as unknown as MikroORM;
  const container = createContainer<DbCradle>({ injectionMode: InjectionMode.PROXY, strict: true });
  registerDb(container, orm);
  return { container, orm, forks };
}

describe("registerDb", () => {
  it("registers the ORM singleton and repositories implementing core ports", () => {
    const { container, orm } = setup();
    const scope = container.createScope();

    expect(scope.resolve("orm")).toBe(orm);
    expect(scope.resolve("learningPathRepository")).toBeInstanceOf(MikroLearningPathRepository);
    expect(scope.resolve("progressRepository")).toBeInstanceOf(MikroProgressRepository);
    expect(scope.resolve("statsRepository")).toBeInstanceOf(MikroStatsRepository);
  });

  it("forks one EntityManager per scope and clears it when the scope is disposed", async () => {
    const { container, forks } = setup();
    const first = container.createScope();
    const second = container.createScope();

    expect(first.resolve("em")).toBe(first.resolve("em"));
    expect(first.resolve("em")).not.toBe(second.resolve("em"));

    await first.dispose();
    expect(forks[0]?.clear).toHaveBeenCalledTimes(1);
    expect(forks[1]?.clear).not.toHaveBeenCalled();
  });
});
