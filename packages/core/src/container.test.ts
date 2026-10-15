import { asValue, createContainer, InjectionMode } from "awilix";
import { describe, expect, it } from "vitest";
import { registerCore, type CoreCradle, type CorePorts } from "./container";
import { AdminService } from "./services/admin-service";
import { LearningPathService } from "./services/learning-path-service";
import { ProgressService } from "./services/progress-service";
import {
  FakeLearningPathRepository,
  FakeProgressRepository,
  FakeStatsRepository,
} from "./testing/fixtures";

function createTestContainer() {
  const container = createContainer<CoreCradle & CorePorts>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });
  container.register({
    learningPathRepository: asValue(new FakeLearningPathRepository([])),
    progressRepository: asValue(new FakeProgressRepository({})),
    statsRepository: asValue(
      new FakeStatsRepository({ paths: 0, modules: 0, lessons: 0, users: 0, completions: 0 }, []),
    ),
  });
  registerCore(container);
  return container;
}

describe("registerCore", () => {
  it("resolves every core service once ports are registered", () => {
    const scope = createTestContainer().createScope();
    expect(scope.resolve("learningPathService")).toBeInstanceOf(LearningPathService);
    expect(scope.resolve("progressService")).toBeInstanceOf(ProgressService);
    expect(scope.resolve("adminService")).toBeInstanceOf(AdminService);
  });

  it("scopes services per request scope", () => {
    const container = createTestContainer();
    const first = container.createScope();
    const second = container.createScope();
    expect(first.resolve("learningPathService")).toBe(first.resolve("learningPathService"));
    expect(first.resolve("learningPathService")).not.toBe(second.resolve("learningPathService"));
  });
});
