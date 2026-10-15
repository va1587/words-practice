import { lessonKey } from "@devmentor/core";
import { describe, expect, it } from "vitest";
import { seedDemoUser, seedPaths } from "./seed-data";

describe("seed data", () => {
  const lessonKeys = new Set(
    seedPaths.flatMap((p) =>
      p.modules.flatMap((m) => m.lessons.map((l) => lessonKey(p.slug, l.slug))),
    ),
  );

  it("has unique path slugs and lesson slugs unique within each path", () => {
    expect(new Set(seedPaths.map((p) => p.slug)).size).toBe(seedPaths.length);
    for (const path of seedPaths) {
      const slugs = path.modules.flatMap((m) => m.lessons.map((l) => l.slug));
      expect(new Set(slugs).size, path.slug).toBe(slugs.length);
    }
  });

  it("demo user references only existing paths and lessons", () => {
    for (const slug of seedDemoUser.activePaths) {
      expect(
        seedPaths.some((p) => p.slug === slug),
        slug,
      ).toBe(true);
    }
    for (const key of seedDemoUser.completedLessons) {
      expect(lessonKeys.has(key), key).toBe(true);
    }
  });

  it("generates lesson content from the lesson title", () => {
    const lesson = seedPaths[0]?.modules[0]?.lessons[0];
    expect(lesson?.summary).toContain(lesson?.title.toLowerCase());
    expect(lesson?.body).toHaveLength(3);
    expect(lesson?.exercise).toContain(lesson?.title);
  });
});
