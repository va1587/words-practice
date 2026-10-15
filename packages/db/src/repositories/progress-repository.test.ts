import { describe, expect, it } from "vitest";
import { User } from "../entities";
import { collection, fakeEntityManager } from "../testing/fake-entity-manager";
import { MikroProgressRepository } from "./progress-repository";

describe("MikroProgressRepository", () => {
  it("maps a user's completions to lesson keys and enrollments to active path slugs", async () => {
    const { fake, em } = fakeEntityManager();
    fake.findOne.mockResolvedValue({
      id: 7,
      name: "Ola",
      streakDays: 3,
      completions: collection([
        { lesson: { slug: "jsx", module: { path: { slug: "react" } } } },
        { lesson: { slug: "dom", module: { path: { slug: "frontend" } } } },
      ]),
      enrollments: collection([{ path: { slug: "react" } }]),
    });

    const progress = await new MikroProgressRepository({ em }).findByUserEmail("ola@example.com");

    expect(progress).toEqual({
      userId: "7",
      name: "Ola",
      streakDays: 3,
      completedLessons: new Set(["react/jsx", "frontend/dom"]),
      activePaths: ["react"],
    });
    expect(fake.findOne).toHaveBeenCalledWith(
      User,
      { email: "ola@example.com" },
      { populate: ["enrollments.path", "completions.lesson.module.path"] },
    );
  });

  it("returns null for an unknown email", async () => {
    const { em } = fakeEntityManager();
    expect(
      await new MikroProgressRepository({ em }).findByUserEmail("nobody@example.com"),
    ).toBeNull();
  });
});
