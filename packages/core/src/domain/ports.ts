import type { LearningPath, PathSummary, PlatformStats, UserProgress } from "./types";

/**
 * Ports implemented by infrastructure packages (e.g. `@devmentor/db`).
 * Core services depend only on these interfaces, never on an ORM.
 */
export interface LearningPathRepository {
  findAll(): Promise<LearningPath[]>;
  findFeatured(): Promise<LearningPath[]>;
  findBySlug(slug: string): Promise<LearningPath | null>;
}

export interface ProgressRepository {
  findByUserEmail(email: string): Promise<UserProgress | null>;
}

export interface StatsRepository {
  platformStats(): Promise<PlatformStats>;
  pathSummaries(): Promise<PathSummary[]>;
}
