import { describe, expect, it } from "vitest";
import { LearningPath, Lesson, LessonCompletion, PathModule, User } from "../entities";
import { collection, fakeEntityManager } from "../testing/fake-entity-manager";
import { MikroStatsRepository } from "./stats-repository";

describe("MikroStatsRepository", () => {
  it("platformStats counts every entity type", async () => {
    const { fake, em } = fakeEntityManager();
    const counts = new Map<unknown, number>([
      [LearningPath, 4],
      [PathModule, 11],
      [Lesson, 25],
      [User, 1],
      [LessonCompletion, 5],
    ]);
    fake.count.mockImplementation((entity: unknown) => Promise.resolve(counts.get(entity) ?? -1));

    expect(await new MikroStatsRepository({ em }).platformStats()).toEqual({
      paths: 4,
      modules: 11,
      lessons: 25,
      users: 1,
      completions: 5,
    });
  });

  it("pathSummaries sums lessons across modules", async () => {
    const { fake, em } = fakeEntityManager();
    fake.find.mockResolvedValue([
      {
        slug: "react",
        title: "React",
        level: "intermediate",
        featured: false,
        hours: 30,
        modules: collection([{ lessons: collection([1, 2]) }, { lessons: collection([3]) }]),
      },
    ]);

    expect(await new MikroStatsRepository({ em }).pathSummaries()).toEqual([
      {
        slug: "react",
        title: "React",
        level: "intermediate",
        featured: false,
        hours: 30,
        modules: 2,
        lessons: 3,
      },
    ]);
    expect(fake.find).toHaveBeenCalledWith(
      LearningPath,
      {},
      { populate: ["modules.lessons"], orderBy: { position: "asc" } },
    );
  });
});
