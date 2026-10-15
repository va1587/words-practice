import type * as domain from "@devmentor/core";
import type { EntityManager } from "@mikro-orm/postgresql";
import { LearningPath } from "../entities";

const populate = ["modules", "modules.lessons"] as const;

export class MikroLearningPathRepository implements domain.LearningPathRepository {
  private readonly em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.em = em;
  }

  async findAll() {
    const rows = await this.em.find(LearningPath, {}, { populate, orderBy: { position: "asc" } });
    return rows.map(toDomain);
  }

  async findFeatured() {
    const rows = await this.em.find(
      LearningPath,
      { featured: true },
      { populate, orderBy: { position: "asc" } },
    );
    return rows.map(toDomain);
  }

  async findBySlug(slug: string) {
    const row = await this.em.findOne(LearningPath, { slug }, { populate });
    return row ? toDomain(row) : null;
  }
}

function toDomain(row: LearningPath): domain.LearningPath {
  return {
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    level: row.level,
    hours: row.hours,
    tags: row.tags,
    featured: row.featured,
    modules: row.modules.getItems().map((m) => ({
      title: m.title,
      lessons: m.lessons.getItems().map((l) => ({
        slug: l.slug,
        title: l.title,
        minutes: l.minutes,
        summary: l.summary,
        body: l.body,
        exercise: l.exercise,
      })),
    })),
  };
}
