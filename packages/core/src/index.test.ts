import { describe, expect, it } from "vitest";
import * as core from "./index";

describe("@devmentor/core public API", () => {
  it("exports services, domain helpers and DI registration", () => {
    expect(Object.keys(core).sort()).toEqual(
      [
        "AdminService",
        "LearningPathService",
        "ProgressService",
        "computePathProgress",
        "getLessons",
        "lessonKey",
        "levelLabels",
        "levels",
        "registerCore",
      ].sort(),
    );
  });
});
