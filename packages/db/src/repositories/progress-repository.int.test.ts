import type { MikroORM } from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seedDemoUser } from "../seed-data";
import { createTestOrm } from "../testing/orm";
import { MikroProgressRepository } from "./progress-repository";

let orm: MikroORM;
const repository = () => new MikroProgressRepository({ em: orm.em.fork() });

beforeAll(async () => {
  orm = await createTestOrm();
});
afterAll(() => orm.close());

describe("MikroProgressRepository", () => {
  it("findByUserEmail returns the user's completed lessons and active paths", async () => {
    const progress = await repository().findByUserEmail(seedDemoUser.email);
    expect(progress).toMatchObject({
      name: seedDemoUser.name,
      streakDays: seedDemoUser.streakDays,
    });
    expect([...(progress?.completedLessons ?? [])].sort()).toEqual(
      [...seedDemoUser.completedLessons].sort(),
    );
    expect(progress?.activePaths.sort()).toEqual([...seedDemoUser.activePaths].sort());
  });

  it("findByUserEmail returns null for an unknown email", async () => {
    expect(await repository().findByUserEmail("nobody@example.com")).toBeNull();
  });
});
