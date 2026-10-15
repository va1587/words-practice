import { describe, expect, it } from "vitest";
import { LearningPath } from "../entities";
import { collection, fakeEntityManager } from "../testing/fake-entity-manager";
import { MikroLearningPathRepository } from "./learning-path-repository";

const row = {
  slug: "react",
  title: "React",
  tagline: "t",
  description: "d",
  level: "intermediate",
  hours: 3,
  tags: ["React"],
  featured: true,
  modules: collection([
    {
      title: "Basics",
      lessons: collection([
        { slug: "jsx", title: "JSX", minutes: 10, summary: "s", body: ["b"], exercise: "e" },
      ]),
    },
  ]),
};

const expected = {
  slug: "react",
  title: "React",
  tagline: "t",
  description: "d",
  level: "intermediate",
  hours: 3,
  tags: ["React"],
  featured: true,
  modules: [
    {
      title: "Basics",
      lessons: [
        { slug: "jsx", title: "JSX", minutes: 10, summary: "s", body: ["b"], exercise: "e" },
      ],
    },
  ],
};

const populate = ["modules", "modules.lessons"];

describe("MikroLearningPathRepository", () => {
  it("findAll queries every path in display order and maps rows to the domain model", async () => {
    const { fake, em } = fakeEntityManager();
    fake.find.mockResolvedValue([row]);

    expect(await new MikroLearningPathRepository({ em }).findAll()).toEqual([expected]);
    expect(fake.find).toHaveBeenCalledWith(
      LearningPath,
      {},
      { populate, orderBy: { position: "asc" } },
    );
  });

  it("findFeatured filters featured paths", async () => {
    const { fake, em } = fakeEntityManager();
    fake.find.mockResolvedValue([row]);

    expect(await new MikroLearningPathRepository({ em }).findFeatured()).toEqual([expected]);
    expect(fake.find).toHaveBeenCalledWith(
      LearningPath,
      { featured: true },
      { populate, orderBy: { position: "asc" } },
    );
  });

  it("findBySlug maps a found row and returns null otherwise", async () => {
    const { fake, em } = fakeEntityManager();
    const repository = new MikroLearningPathRepository({ em });

    fake.findOne.mockResolvedValueOnce(row);
    expect(await repository.findBySlug("react")).toEqual(expected);
    expect(fake.findOne).toHaveBeenCalledWith(LearningPath, { slug: "react" }, { populate });

    expect(await repository.findBySlug("missing")).toBeNull();
  });
});
