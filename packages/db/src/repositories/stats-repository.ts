import type { PathSummary, PlatformStats, StatsRepository } from "@devmentor/core";
import type { EntityManager } from "@mikro-orm/postgresql";
import { LearningPath, Lesson, LessonCompletion, PathModule, User } from "../entities";

export class MikroStatsRepository implements StatsRepository {
  private readonly em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.em = em;
  }

  async platformStats(): Promise<PlatformStats> {
    const [paths, modules, lessons, users, completions] = await Promise.all([
      this.em.count(LearningPath),
      this.em.count(PathModule),
      this.em.count(Lesson),
      this.em.count(User),
      this.em.count(LessonCompletion),
    ]);
    return { paths, modules, lessons, users, completions };
  }

  async pathSummaries(): Promise<PathSummary[]> {
    const rows = await this.em.find(
      LearningPath,
      {},
      { populate: ["modules.lessons"], orderBy: { position: "asc" } },
    );
    return rows.map((p) => ({
      slug: p.slug,
      title: p.title,
      level: p.level,
      featured: p.featured,
      hours: p.hours,
      modules: p.modules.length,
      lessons: p.modules.getItems().reduce((sum, m) => sum + m.lessons.length, 0),
    }));
  }
}
