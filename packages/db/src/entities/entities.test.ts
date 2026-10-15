import { MikroORM } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";
import { createConfig } from "../config";
import {
  Enrollment,
  entities,
  LearningPath,
  Lesson,
  LessonCompletion,
  PathModule,
  User,
} from "./index";

// Synchronous discovery: builds real metadata without connecting to the database.
const metadata = new MikroORM(
  createConfig({ discovery: { skipSyncDiscovery: false } }),
).getMetadata();

describe("entities", () => {
  it("registers every entity with its table name", () => {
    expect(entities.map((e) => metadata.getByClassName(e.name).tableName)).toEqual([
      "learning_path",
      "path_module",
      "lesson",
      "app_user",
      "enrollment",
      "lesson_completion",
    ]);
  });

  it("declares relations between paths, modules, lessons and user progress", () => {
    expect(metadata.get(LearningPath).properties.modules.kind).toBe("1:m");
    expect(metadata.get(PathModule).properties.lessons.kind).toBe("1:m");
    expect(metadata.get(Lesson).properties.module.kind).toBe("m:1");
    expect(metadata.get(User).properties.enrollments.kind).toBe("1:m");
    expect(metadata.get(User).properties.completions.kind).toBe("1:m");
    expect(metadata.get(Enrollment).properties.path.kind).toBe("m:1");
    expect(metadata.get(LessonCompletion).properties.lesson.kind).toBe("m:1");
  });

  it("indexes foreign keys that are not covered by a unique constraint", () => {
    expect(metadata.get(PathModule).properties.path.index).toBe(true);
    expect(metadata.get(Enrollment).properties.path.index).toBe(true);
    expect(metadata.get(LessonCompletion).properties.lesson.index).toBe(true);
  });

  it("stamps creation dates for enrollments and completions", () => {
    const enrolledAt = metadata.get(Enrollment).properties.enrolledAt;
    const completedAt = metadata.get(LessonCompletion).properties.completedAt;
    expect(enrolledAt.onCreate?.({} as Enrollment, {} as never)).toBeInstanceOf(Date);
    expect(completedAt.onCreate?.({} as LessonCompletion, {} as never)).toBeInstanceOf(Date);
  });
});
