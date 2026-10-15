import { asClass, type AwilixContainer } from "awilix";
import type { LearningPathRepository, ProgressRepository, StatsRepository } from "./domain/ports";
import { AdminService } from "./services/admin-service";
import { LearningPathService } from "./services/learning-path-service";
import { ProgressService } from "./services/progress-service";

/** Dependencies that infrastructure packages must register for core services to resolve. */
export type CorePorts = {
  learningPathRepository: LearningPathRepository;
  progressRepository: ProgressRepository;
  statsRepository: StatsRepository;
};

export type CoreCradle = {
  learningPathService: LearningPathService;
  progressService: ProgressService;
  adminService: AdminService;
};

/** Registers core services. They are scoped, so each request scope gets its own instances. */
export function registerCore(container: AwilixContainer) {
  container.register({
    learningPathService: asClass(LearningPathService).scoped(),
    progressService: asClass(ProgressService).scoped(),
    adminService: asClass(AdminService).scoped(),
  });
}
