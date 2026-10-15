import type { LearningPathRepository } from "../domain/ports";
import { getLessons } from "../domain/progress";
import type { LearningPath, LessonInPath } from "../domain/types";

export class LearningPathService {
  private readonly paths: LearningPathRepository;

  constructor({ learningPathRepository }: { learningPathRepository: LearningPathRepository }) {
    this.paths = learningPathRepository;
  }

  list(): Promise<LearningPath[]> {
    return this.paths.findAll();
  }

  listFeatured(): Promise<LearningPath[]> {
    return this.paths.findFeatured();
  }

  get(slug: string): Promise<LearningPath | null> {
    return this.paths.findBySlug(slug);
  }

  async getLesson(pathSlug: string, lessonSlug: string): Promise<LessonInPath | null> {
    const path = await this.paths.findBySlug(pathSlug);
    if (!path) return null;

    const lessons = getLessons(path);
    const index = lessons.findIndex((l) => l.slug === lessonSlug);
    const lesson = lessons[index];
    if (!lesson) return null;

    return {
      path,
      lesson,
      prev: lessons[index - 1],
      next: lessons[index + 1],
    };
  }
}
