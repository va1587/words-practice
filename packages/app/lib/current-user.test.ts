import { describe, expect, it, vi } from "vitest";
import { userProgress, resolveFrom, services } from "@/testing/fixtures";
import { resolve } from "./container";
import { getCurrentUserEmail, getCurrentUserProgress } from "./current-user";

vi.mock("./container", () => ({ resolve: vi.fn() }));

describe("current user", () => {
  it("is the configured demo account until authentication exists", async () => {
    const registry = services();
    const progress = userProgress();
    registry.progressService.forUser.mockResolvedValue(progress);
    resolveFrom(resolve, registry);

    expect(await getCurrentUserEmail()).toBe("ola@devmentor.dev");
    expect(await getCurrentUserProgress()).toBe(progress);
    expect(registry.progressService.forUser).toHaveBeenCalledWith("ola@devmentor.dev");
  });
});
