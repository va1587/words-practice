import type { LearningPathRepository, ProgressRepository, StatsRepository } from "../domain/ports";
import type {
  LearningPath,
  Lesson,
  PathSummary,
  PlatformStats,
  UserProgress,
} from "../domain/types";

function lessonFixture(slug: string): Lesson {
  return { slug, title: slug, minutes: 10, summary: "", body: [], exercise: "" };
}

export function pathFixture(
  slug: string,
  moduleLessons: string[][],
  featured = false,
): LearningPath {
  return {
    slug,
    title: slug,
    tagline: "",
    description: "",
    level: "beginner",
    hours: 1,
    tags: [],
    featured,
    modules: moduleLessons.map((lessons, i) => ({
      title: `module-${i}`,
      lessons: lessons.map(lessonFixture),
    })),
  };
}

/** In-memory implementations of core ports for unit tests. */
export class FakeLearningPathRepository implements LearningPathRepository {
  constructor(private readonly paths: LearningPath[]) {}

  findAll() {
    return Promise.resolve(this.paths);
  }

  findFeatured() {
    return Promise.resolve(this.paths.filter((p) => p.featured));
  }

  findBySlug(slug: string) {
    return Promise.resolve(this.paths.find((p) => p.slug === slug) ?? null);
  }
}

export class FakeProgressRepository implements ProgressRepository {
  constructor(private readonly users: Record<string, UserProgress>) {}

  findByUserEmail(email: string) {
    return Promise.resolve(this.users[email] ?? null);
  }
}

export class FakeStatsRepository implements StatsRepository {
  constructor(
    private readonly stats: PlatformStats,
    private readonly summaries: PathSummary[],
  ) {}

  platformStats() {
    return Promise.resolve(this.stats);
  }

  pathSummaries() {
    return Promise.resolve(this.summaries);
  }
}
