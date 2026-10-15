import { describe, expect, it, vi } from "vitest";
import { fakeEntityManager } from "./testing/fake-entity-manager";

vi.mock("./seed-data", () => ({
  seedPaths: [],
  seedDemoUser: {
    email: "x@example.com",
    name: "X",
    streakDays: 0,
    activePaths: ["missing-path"],
    completedLessons: [],
  },
}));

describe("DatabaseSeeder with inconsistent seed data", () => {
  it("fails with a readable error when seed data references an unknown key", async () => {
    const { DatabaseSeeder } = await import("./seeders/DatabaseSeeder");
    const { em } = fakeEntityManager();

    await expect(new DatabaseSeeder().run(em)).rejects.toThrow(
      'DatabaseSeeder: seed data references unknown key "missing-path".',
    );
  });
});
