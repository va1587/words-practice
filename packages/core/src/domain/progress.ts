import type { LearningPath, Lesson, PathProgress } from "./types";

export function lessonKey(pathSlug: string, lessonSlug: string) {
  return `${pathSlug}/${lessonSlug}`;
}

export function getLessons(path: LearningPath): Lesson[] {
  return path.modules.flatMap((m) => m.lessons);
}

export function computePathProgress(
  path: LearningPath,
  completedLessons: ReadonlySet<string>,
): PathProgress {
  const lessons = getLessons(path);
  const isDone = (l: Lesson) => completedLessons.has(lessonKey(path.slug, l.slug));
  const done = lessons.filter(isDone).length;

  return {
    done,
    total: lessons.length,
    percent: lessons.length === 0 ? 0 : Math.round((done / lessons.length) * 100),
    nextLesson: lessons.find((l) => !isDone(l)),
  };
}
