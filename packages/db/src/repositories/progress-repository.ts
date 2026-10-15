import { lessonKey, type ProgressRepository, type UserProgress } from "@devmentor/core";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "../entities";

export class MikroProgressRepository implements ProgressRepository {
  private readonly em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.em = em;
  }

  async findByUserEmail(email: string): Promise<UserProgress | null> {
    const user = await this.em.findOne(
      User,
      { email },
      {
        populate: [
          "enrollments.path",
          "completions.lesson.module.path",
        ],
      },
    );
    if (!user) return null;

    return {
      userId: String(user.id),
      name: user.name,
      streakDays: user.streakDays,
      completedLessons: new Set(
        user.completions
          .getItems()
          .map((c) => lessonKey(c.lesson.module.path.slug, c.lesson.slug)),
      ),
      activePaths: user.enrollments.getItems().map((e) => e.path.slug),
    };
  }
}
