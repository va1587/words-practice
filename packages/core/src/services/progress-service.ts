import type { LearningPathRepository, ProgressRepository } from "../domain/ports";
import { computePathProgress } from "../domain/progress";
import type { LearningPath, PathProgress, UserProgress } from "../domain/types";

export type Dashboard = {
  user: UserProgress;
  activePaths: { path: LearningPath; progress: PathProgress }[];
};

export class ProgressService {
  private readonly progress: ProgressRepository;
  private readonly paths: LearningPathRepository;

  constructor({
    progressRepository,
    learningPathRepository,
  }: {
    progressRepository: ProgressRepository;
    learningPathRepository: LearningPathRepository;
  }) {
    this.progress = progressRepository;
    this.paths = learningPathRepository;
  }

  forUser(email: string): Promise<UserProgress | null> {
    return this.progress.findByUserEmail(email);
  }

  async dashboard(email: string): Promise<Dashboard | null> {
    const user = await this.progress.findByUserEmail(email);
    if (!user) return null;

    const all = await this.paths.findAll();
    const activePaths = all
      .filter((p) => user.activePaths.includes(p.slug))
      .map((path) => ({ path, progress: computePathProgress(path, user.completedLessons) }));

    return { user, activePaths };
  }
}
