import type { MikroORM } from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { LearningPath, Lesson, LessonCompletion, User } from "./entities";
import { createTestOrm } from "./testing/orm";
import { DatabaseSeeder } from "./seeders/DatabaseSeeder";

let orm: MikroORM;

beforeAll(async () => {
  orm = await createTestOrm();
});
afterAll(() => orm.close());

describe("DatabaseSeeder", () => {
  it("is idempotent — a second run does not duplicate data", async () => {
    const count = async () => {
      const em = orm.em.fork();
      return Promise.all([
        em.count(LearningPath),
        em.count(Lesson),
        em.count(User),
        em.count(LessonCompletion),
      ]);
    };
    const before = await count();

    await new DatabaseSeeder().run(orm.em.fork());

    expect(await count()).toEqual(before);
  });
});
