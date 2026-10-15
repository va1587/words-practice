import { levels } from "@devmentor/core";
import { defineEntity, p } from "@mikro-orm/postgresql";

const LearningPathSchema = defineEntity({
  name: "LearningPath",
  properties: {
    id: p.integer().primary(),
    slug: p.string().unique(),
    title: p.string(),
    tagline: p.string(),
    description: p.text(),
    level: p.enum(levels),
    hours: p.integer(),
    tags: p.array().default([]),
    featured: p.boolean().default(false),
    position: p.integer().default(0),
    modules: () => p.oneToMany(PathModule).mappedBy("path").orderBy({ position: "asc" }),
  },
});
export class LearningPath extends LearningPathSchema.class {}
LearningPathSchema.setClass(LearningPath);

const PathModuleSchema = defineEntity({
  name: "PathModule",
  tableName: "path_module",
  properties: {
    id: p.integer().primary(),
    title: p.string(),
    position: p.integer(),
    path: () => p.manyToOne(LearningPath).deleteRule("cascade").index(),
    lessons: () => p.oneToMany(Lesson).mappedBy("module").orderBy({ position: "asc" }),
  },
});
export class PathModule extends PathModuleSchema.class {}
PathModuleSchema.setClass(PathModule);

const LessonSchema = defineEntity({
  name: "Lesson",
  uniques: [{ properties: ["module", "slug"] }],
  properties: {
    id: p.integer().primary(),
    slug: p.string(),
    title: p.string(),
    minutes: p.integer(),
    summary: p.text(),
    body: p.array().default([]),
    exercise: p.text(),
    position: p.integer(),
    module: () => p.manyToOne(PathModule).deleteRule("cascade"),
  },
});
export class Lesson extends LessonSchema.class {}
LessonSchema.setClass(Lesson);

const UserSchema = defineEntity({
  name: "User",
  tableName: "app_user",
  properties: {
    id: p.integer().primary(),
    email: p.string().unique(),
    name: p.string(),
    streakDays: p.integer().default(0),
    enrollments: () => p.oneToMany(Enrollment).mappedBy("user"),
    completions: () => p.oneToMany(LessonCompletion).mappedBy("user"),
  },
});
export class User extends UserSchema.class {}
UserSchema.setClass(User);

const EnrollmentSchema = defineEntity({
  name: "Enrollment",
  uniques: [{ properties: ["user", "path"] }],
  properties: {
    id: p.integer().primary(),
    user: () => p.manyToOne(User).deleteRule("cascade"),
    path: () => p.manyToOne(LearningPath).deleteRule("cascade").index(),
    enrolledAt: p.datetime().onCreate(() => new Date()),
  },
});
export class Enrollment extends EnrollmentSchema.class {}
EnrollmentSchema.setClass(Enrollment);

const LessonCompletionSchema = defineEntity({
  name: "LessonCompletion",
  uniques: [{ properties: ["user", "lesson"] }],
  properties: {
    id: p.integer().primary(),
    user: () => p.manyToOne(User).deleteRule("cascade"),
    lesson: () => p.manyToOne(Lesson).deleteRule("cascade").index(),
    completedAt: p.datetime().onCreate(() => new Date()),
  },
});
export class LessonCompletion extends LessonCompletionSchema.class {}
LessonCompletionSchema.setClass(LessonCompletion);

export const entities = [LearningPath, PathModule, Lesson, User, Enrollment, LessonCompletion];
