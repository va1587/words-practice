import { describe, expect, it } from "vitest";
import { pathFixture } from "../testing/fixtures";
import { computePathProgress, getLessons, lessonKey } from "./progress";

describe("lessonKey", () => {
  it("joins path and lesson slugs", () => {
    expect(lessonKey("react", "jsx")).toBe("react/jsx");
  });
});

describe("getLessons", () => {
  it("flattens lessons of all modules in order", () => {
    const path = pathFixture("p", [["a", "b"], ["c"]]);
    expect(getLessons(path).map((l) => l.slug)).toEqual(["a", "b", "c"]);
  });
});

describe("computePathProgress", () => {
  const path = pathFixture("p", [["a", "b"], ["c"]]);

  it("reports zero progress and the first lesson as next when nothing is done", () => {
    const progress = computePathProgress(path, new Set());
    expect(progress).toMatchObject({ done: 0, total: 3, percent: 0 });
    expect(progress.nextLesson?.slug).toBe("a");
  });

  it("counts only lessons of this path and points to the first unfinished one", () => {
    const progress = computePathProgress(path, new Set(["p/a", "p/c", "other/b"]));
    expect(progress).toMatchObject({ done: 2, total: 3, percent: 67 });
    expect(progress.nextLesson?.slug).toBe("b");
  });

  it("has no next lesson when the path is complete", () => {
    const progress = computePathProgress(path, new Set(["p/a", "p/b", "p/c"]));
    expect(progress).toMatchObject({ done: 3, percent: 100, nextLesson: undefined });
  });

  it("returns 0% for a path without lessons", () => {
    expect(computePathProgress(pathFixture("empty", []), new Set()).percent).toBe(0);
  });
});
