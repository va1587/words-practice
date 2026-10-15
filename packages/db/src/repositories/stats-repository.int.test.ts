import type { MikroORM } from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seedDemoUser, seedPaths } from "../seed-data";
import { createTestOrm } from "../testing/orm";
import { MikroStatsRepository } from "./stats-repository";

let orm: MikroORM;
const repository = () => new MikroStatsRepository({ em: orm.em.fork() });

const seededModules = seedPaths.flatMap((p) => p.modules);
const seededLessons = seededModules.flatMap((m) => m.lessons);

beforeAll(async () => {
  orm = await createTestOrm();
});
afterAll(() => orm.close());

describe("MikroStatsRepository", () => {
  it("platformStats counts content and activity", async () => {
    expect(await repository().platformStats()).toEqual({
      paths: seedPaths.length,
      modules: seededModules.length,
      lessons: seededLessons.length,
      users: 1,
      completions: seedDemoUser.completedLessons.length,
    });
  });

  it("pathSummaries returns per-path module and lesson counts in display order", async () => {
    const summaries = await repository().pathSummaries();
    expect(summaries).toEqual(
      seedPaths.map((p) => ({
        slug: p.slug,
        title: p.title,
        level: p.level,
        featured: p.featured ?? false,
        hours: p.hours,
        modules: p.modules.length,
        lessons: p.modules.reduce((sum, m) => sum + m.lessons.length, 0),
      })),
    );
  });
});
