export type Level = "beginner" | "intermediate" | "advanced";

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
  featured?: boolean;
  modules: Module[];
};

export type UserProgress = {
  name: string;
  streakDays: number;
  completedLessons: Set<string>;
  activePaths: string[];
};
