import type { MikroORM } from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seedPaths } from "../seed-data";
import { createTestOrm } from "../testing/orm";
import { MikroLearningPathRepository } from "./learning-path-repository";

let orm: MikroORM;
const repository = () => new MikroLearningPathRepository({ em: orm.em.fork() });

beforeAll(async () => {
  orm = await createTestOrm();
});
afterAll(() => orm.close());

describe("MikroLearningPathRepository", () => {
  it("findAll returns every path in display order with modules and lessons", async () => {
    const paths = await repository().findAll();
    expect(paths.map((p) => p.slug)).toEqual(seedPaths.map((p) => p.slug));

    const first = paths[0];
    const seeded = seedPaths[0];
    expect(first?.modules.map((m) => m.title)).toEqual(seeded?.modules.map((m) => m.title));
    expect(first?.modules[0]?.lessons.map((l) => l.slug)).toEqual(
      seeded?.modules[0]?.lessons.map((l) => l.slug),
    );
  });

  it("findFeatured returns only featured paths", async () => {
    const featured = await repository().findFeatured();
    expect(featured.map((p) => p.slug)).toEqual(
      seedPaths.filter((p) => p.featured).map((p) => p.slug),
    );
    expect(featured.every((p) => p.featured)).toBe(true);
  });

  it("findBySlug maps a path to the domain model", async () => {
    const path = await repository().findBySlug("react-in-practice");
    expect(path).toMatchObject({
      slug: "react-in-practice",
      level: "intermediate",
      tags: ["React", "TypeScript", "Testy"],
      featured: true,
    });
    expect(path?.modules[1]?.lessons[0]).toMatchObject({ slug: "use-state", minutes: 30 });
  });

  it("findBySlug returns null for an unknown slug", async () => {
    expect(await repository().findBySlug("does-not-exist")).toBeNull();
  });
});
