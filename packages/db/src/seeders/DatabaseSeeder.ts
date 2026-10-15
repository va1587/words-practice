import type { EntityManager } from "@mikro-orm/postgresql";
import { Seeder } from "@mikro-orm/seeder";
import { Enrollment, LearningPath, Lesson, LessonCompletion, PathModule, User } from "../entities";
import { seedDemoUser, seedPaths } from "../seed-data";

/** Idempotent: skips when content already exists. */
export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    if ((await em.count(LearningPath)) > 0) {
      console.info("DatabaseSeeder: content already present, skipping.");
      return;
    }

    const paths = new Map<string, LearningPath>();
    const lessons = new Map<string, Lesson>();

    seedPaths.forEach((data, pathIndex) => {
      const path = em.create(LearningPath, {
        slug: data.slug,
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        level: data.level,
        hours: data.hours,
        tags: data.tags,
        featured: data.featured ?? false,
        position: pathIndex,
      });
      paths.set(data.slug, path);

      data.modules.forEach((moduleData, moduleIndex) => {
        const module = em.create(PathModule, {
          title: moduleData.title,
          position: moduleIndex,
          path,
        });
        moduleData.lessons.forEach((lessonData, lessonIndex) => {
          const lesson = em.create(Lesson, { ...lessonData, position: lessonIndex, module });
          lessons.set(`${data.slug}/${lessonData.slug}`, lesson);
        });
      });
    });

    const user = em.create(User, {
      email: seedDemoUser.email,
      name: seedDemoUser.name,
      streakDays: seedDemoUser.streakDays,
    });
    for (const slug of seedDemoUser.activePaths) {
      em.create(Enrollment, { user, path: required(paths, slug) });
    }
    for (const key of seedDemoUser.completedLessons) {
      em.create(LessonCompletion, { user, lesson: required(lessons, key) });
    }

    await em.flush();
  }
}

function required<T>(map: ReadonlyMap<string, T>, key: string): T {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`DatabaseSeeder: seed data references unknown key "${key}".`);
  }
  return value;
}
