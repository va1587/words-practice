import type {
  AdminService,
  Dashboard,
  LearningPath,
  LearningPathService,
  Lesson,
  ProgressService,
  UserProgress,
} from "@devmentor/core";
import { vi } from "vitest";

export function lesson(slug: string, title = slug): Lesson {
  return {
    slug,
    title,
    minutes: 15,
    summary: `${title} summary`,
    body: [`${title} body`],
    exercise: `${title} exercise`,
  };
}

export function learningPath(overrides: Partial<LearningPath> = {}): LearningPath {
  return {
    slug: "react",
    title: "React w praktyce",
    tagline: "Komponenty i stan",
    description: "Opis ścieżki",
    level: "intermediate",
    hours: 30,
    tags: ["React", "TypeScript"],
    featured: true,
    modules: [
      { title: "Komponenty", lessons: [lesson("jsx", "JSX"), lesson("props", "Propsy")] },
      { title: "Stan", lessons: [lesson("state", "Stan")] },
    ],
    ...overrides,
  };
}

export function userProgress(
  completed: string[] = [],
  overrides: Partial<UserProgress> = {},
): UserProgress {
  return {
    userId: "1",
    name: "Ola",
    streakDays: 6,
    completedLessons: new Set(completed),
    activePaths: ["react"],
    ...overrides,
  };
}

/** Service doubles resolved by the mocked `@/lib/container`. */
export function services() {
  const learningPathService = {
    list: vi.fn<LearningPathService["list"]>(),
    listFeatured: vi.fn<LearningPathService["listFeatured"]>(),
    get: vi.fn<LearningPathService["get"]>(),
    getLesson: vi.fn<LearningPathService["getLesson"]>(),
  };
  const progressService = {
    forUser: vi.fn<ProgressService["forUser"]>(),
    dashboard: vi.fn<(email: string) => Promise<Dashboard | null>>(),
  };
  const adminService = {
    overview: vi.fn<AdminService["overview"]>(),
    paths: vi.fn<AdminService["paths"]>(),
  };
  const config = { demoUserEmail: "ola@devmentor.dev" };
  return { learningPathService, progressService, adminService, config };
}

/** Wires `resolve` (mocked with `vi.mock("@/lib/container")`) to the given service doubles. */
export function resolveFrom(resolve: unknown, registry: ReturnType<typeof services>) {
  vi.mocked(resolve as (name: string) => Promise<unknown>).mockImplementation((name: string) =>
    Promise.resolve(registry[name as keyof typeof registry]),
  );
}
