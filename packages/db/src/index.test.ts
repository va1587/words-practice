import { describe, expect, it } from "vitest";
import * as db from "./index";

describe("@devmentor/db public API", () => {
  it("exports entities, configuration, ORM access, DI registration and repositories", () => {
    for (const name of [
      "LearningPath",
      "PathModule",
      "Lesson",
      "User",
      "Enrollment",
      "LessonCompletion",
      "entities",
      "createConfig",
      "readDbEnv",
      "getOrm",
      "registerDb",
      "MikroLearningPathRepository",
      "MikroProgressRepository",
      "MikroStatsRepository",
    ]) {
      expect(db, name).toHaveProperty(name);
    }
  });
});
