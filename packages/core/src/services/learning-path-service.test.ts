import { describe, expect, it } from "vitest";
import { FakeLearningPathRepository, pathFixture } from "../testing/fixtures";
import { LearningPathService } from "./learning-path-service";

const frontend = pathFixture("frontend", [["html", "css"], ["js"]], true);
const backend = pathFixture("backend", [["http"]]);
const service = new LearningPathService({
  learningPathRepository: new FakeLearningPathRepository([frontend, backend]),
});

describe("LearningPathService", () => {
  it("lists all and featured paths", async () => {
    expect((await service.list()).map((p) => p.slug)).toEqual(["frontend", "backend"]);
    expect((await service.listFeatured()).map((p) => p.slug)).toEqual(["frontend"]);
  });

  it("returns a path by slug or null", async () => {
    expect((await service.get("backend"))?.title).toBe("backend");
    expect(await service.get("missing")).toBeNull();
  });

  it("returns a lesson with its neighbours across modules", async () => {
    const result = await service.getLesson("frontend", "css");
    expect(result?.path.slug).toBe("frontend");
    expect(result?.lesson.slug).toBe("css");
    expect(result?.prev?.slug).toBe("html");
    expect(result?.next?.slug).toBe("js");
  });

  it("has no previous lesson for the first and no next lesson for the last", async () => {
    expect((await service.getLesson("frontend", "html"))?.prev).toBeUndefined();
    expect((await service.getLesson("frontend", "js"))?.next).toBeUndefined();
  });

  it("returns null for an unknown path or lesson", async () => {
    expect(await service.getLesson("missing", "html")).toBeNull();
    expect(await service.getLesson("frontend", "missing")).toBeNull();
  });
});
