import { describe, expect, it } from "vitest";
import { FakeStatsRepository } from "../testing/fixtures";
import { AdminService } from "./admin-service";

describe("AdminService", () => {
  it("exposes platform stats and path summaries from the stats port", async () => {
    const stats = { paths: 1, modules: 2, lessons: 3, users: 4, completions: 5 };
    const summaries = [
      {
        slug: "p",
        title: "P",
        level: "advanced" as const,
        featured: true,
        hours: 2,
        modules: 2,
        lessons: 3,
      },
    ];
    const service = new AdminService({
      statsRepository: new FakeStatsRepository(stats, summaries),
    });

    expect(await service.overview()).toEqual(stats);
    expect(await service.paths()).toEqual(summaries);
  });
});
