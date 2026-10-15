export type Level = "beginner" | "intermediate" | "advanced";

export const levels: readonly Level[] = ["beginner", "intermediate", "advanced"];

export const levelLabels: Record<Level, string> = {
  beginner: "Początkujący",
  intermediate: "Średniozaawansowany",
  advanced: "Zaawansowany",
};

export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  body: string[];
  exercise: string;
};

export type Module = {
  title: string;
  lessons: Lesson[];
};

export type LearningPath = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  level: Level;
  hours: number;
  tags: string[];
  featured: boolean;
  modules: Module[];
};

export type UserProgress = {
  userId: string;
  name: string;
  streakDays: number;
  /** Keys in the form `pathSlug/lessonSlug` — see `lessonKey`. */
  completedLessons: Set<string>;
  activePaths: string[];
};

export type PathProgress = {
  done: number;
  total: number;
  percent: number;
  nextLesson: Lesson | undefined;
};

export type LessonInPath = {
  path: LearningPath;
  lesson: Lesson;
  prev: Lesson | undefined;
  next: Lesson | undefined;
};

export type PlatformStats = {
  paths: number;
  modules: number;
  lessons: number;
  users: number;
  completions: number;
};

export type PathSummary = Pick<LearningPath, "slug" | "title" | "level" | "featured" | "hours"> & {
  modules: number;
  lessons: number;
};
