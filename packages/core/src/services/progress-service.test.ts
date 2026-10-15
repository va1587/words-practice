import { describe, expect, it } from "vitest";
import type { UserProgress } from "../domain/types";
import {
  FakeLearningPathRepository,
  FakeProgressRepository,
  pathFixture,
} from "../testing/fixtures";
import { ProgressService } from "./progress-service";

const ola: UserProgress = {
  userId: "1",
  name: "Ola",
  streakDays: 3,
  completedLessons: new Set(["frontend/html"]),
  activePaths: ["frontend"],
};

const service = new ProgressService({
  progressRepository: new FakeProgressRepository({ "ola@example.com": ola }),
  learningPathRepository: new FakeLearningPathRepository([
    pathFixture("frontend", [["html", "css"]]),
    pathFixture("backend", [["http"]]),
  ]),
});

describe("ProgressService", () => {
  it("returns progress of a known user and null otherwise", async () => {
    expect(await service.forUser("ola@example.com")).toBe(ola);
    expect(await service.forUser("nobody@example.com")).toBeNull();
  });

  it("builds a dashboard with progress of the user's active paths only", async () => {
    const dashboard = await service.dashboard("ola@example.com");
    expect(dashboard?.user).toBe(ola);
    expect(dashboard?.activePaths).toHaveLength(1);
    expect(dashboard?.activePaths[0]?.path.slug).toBe("frontend");
    expect(dashboard?.activePaths[0]?.progress).toMatchObject({ done: 1, total: 2, percent: 50 });
  });

  it("returns no dashboard for an unknown user", async () => {
    expect(await service.dashboard("nobody@example.com")).toBeNull();
  });
});
