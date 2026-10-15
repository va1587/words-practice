import { afterEach, describe, expect, it, vi } from "vitest";
import { Enrollment, LearningPath, Lesson, LessonCompletion, PathModule, User } from "./entities";
import { seedDemoUser, seedPaths } from "./seed-data";
import { DatabaseSeeder } from "./seeders/DatabaseSeeder";
import { fakeEntityManager } from "./testing/fake-entity-manager";

afterEach(() => {
  vi.restoreAllMocks();
});

function createdOf(fake: ReturnType<typeof fakeEntityManager>["fake"], entity: unknown) {
  return fake.create.mock.calls.filter(([e]) => e === entity).map(([, data]) => data);
}

describe("DatabaseSeeder", () => {
  it("skips seeding when content already exists", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const { fake, em } = fakeEntityManager();
    fake.count.mockResolvedValue(4);

    await new DatabaseSeeder().run(em);

    expect(fake.create).not.toHaveBeenCalled();
    expect(fake.flush).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith("DatabaseSeeder: content already present, skipping.");
  });

  it("creates paths, modules, lessons and the demo user's progress in one flush", async () => {
    const { fake, em } = fakeEntityManager();

    await new DatabaseSeeder().run(em);

    const modules = seedPaths.flatMap((p) => p.modules);
    expect(createdOf(fake, LearningPath)).toHaveLength(seedPaths.length);
    expect(createdOf(fake, LearningPath)[1]).toMatchObject({
      slug: seedPaths[1]?.slug,
      position: 1,
    });
    expect(createdOf(fake, LearningPath).every((p) => typeof p.featured === "boolean")).toBe(true);
    expect(createdOf(fake, PathModule)).toHaveLength(modules.length);
    expect(createdOf(fake, Lesson)).toHaveLength(modules.flatMap((m) => m.lessons).length);
    expect(createdOf(fake, User)).toEqual([
      { email: seedDemoUser.email, name: seedDemoUser.name, streakDays: seedDemoUser.streakDays },
    ]);
    expect(createdOf(fake, Enrollment)).toHaveLength(seedDemoUser.activePaths.length);
    expect(createdOf(fake, LessonCompletion)).toHaveLength(seedDemoUser.completedLessons.length);
    expect(fake.flush).toHaveBeenCalledTimes(1);
  });
});
