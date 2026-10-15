import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { resolve } from "@/lib/container";
import { getCurrentUserProgress } from "@/lib/current-user";
import { learningPath, resolveFrom, services, userProgress } from "@/testing/fixtures";
import { PathsTable, PathsTableSkeleton } from "./admin/paths-table";
import { PlatformStats, PlatformStatsSkeleton } from "./admin/platform-stats";
import { PathGrid, PathGridSkeleton } from "./path-grid";

vi.mock("@/lib/container", () => ({ resolve: vi.fn() }));
vi.mock("@/lib/current-user", () => ({ getCurrentUserProgress: vi.fn() }));

describe("PathGrid", () => {
  it("lists featured paths with the current user's progress", async () => {
    const registry = services();
    registry.learningPathService.listFeatured.mockResolvedValue([learningPath()]);
    resolveFrom(resolve, registry);
    vi.mocked(getCurrentUserProgress).mockResolvedValue(userProgress(["react/jsx"]));

    render(await PathGrid({ featured: true }));

    expect(screen.getByRole("link").getAttribute("href")).toBe("/paths/react");
    expect(screen.getByText("33%")).toBeTruthy();
    expect(registry.learningPathService.list).not.toHaveBeenCalled();
  });

  it("lists all paths without progress when there is no current user", async () => {
    const registry = services();
    registry.learningPathService.list.mockResolvedValue([
      learningPath(),
      learningPath({ slug: "node", title: "Node" }),
    ]);
    resolveFrom(resolve, registry);
    vi.mocked(getCurrentUserProgress).mockResolvedValue(null);

    render(await PathGrid({}));

    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("skeleton announces loading with a configurable number of cards", () => {
    const { rerender } = render(<PathGridSkeleton />);
    expect(screen.getByRole("status", { name: "Ładowanie ścieżek" }).children).toHaveLength(3);
    rerender(<PathGridSkeleton count={6} />);
    expect(screen.getByRole("status").children).toHaveLength(6);
  });
});

describe("PlatformStats", () => {
  it("shows the four platform statistics", async () => {
    const registry = services();
    registry.adminService.overview.mockResolvedValue({
      paths: 4,
      modules: 11,
      lessons: 25,
      users: 1,
      completions: 5,
    });
    resolveFrom(resolve, registry);

    render(await PlatformStats());

    expect(screen.getByText("Ścieżki nauki").parentElement?.textContent).toContain("4");
    expect(screen.getByText("11 modułów")).toBeTruthy();
    expect(screen.getByText("25")).toBeTruthy();
    expect(screen.getByText("Ukończenia lekcji").parentElement?.textContent).toContain("5");
  });

  it("skeleton announces loading", () => {
    render(<PlatformStatsSkeleton />);
    expect(screen.getByRole("status", { name: "Ładowanie statystyk" }).children).toHaveLength(4);
  });
});

describe("PathsTable", () => {
  it("renders one row per path with level, counts and featured status", async () => {
    const registry = services();
    registry.adminService.paths.mockResolvedValue([
      {
        slug: "react",
        title: "React",
        level: "intermediate",
        featured: true,
        hours: 30,
        modules: 3,
        lessons: 7,
      },
      {
        slug: "sd",
        title: "System design",
        level: "advanced",
        featured: false,
        hours: 20,
        modules: 2,
        lessons: 4,
      },
    ]);
    resolveFrom(resolve, registry);

    render(await PathsTable());

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    const [react, systemDesign] = rows.map((row) => within(row));
    expect(react?.getByRole("link", { name: "React" }).getAttribute("href")).toBe("/paths/react");
    expect(react?.getByText("Średniozaawansowany")).toBeTruthy();
    expect(react?.getByText("Polecana")).toBeTruthy();
    expect(react?.getByText("30 h")).toBeTruthy();
    expect(systemDesign?.getByText("Standardowa")).toBeTruthy();
  });

  it("skeleton announces loading", () => {
    render(<PathsTableSkeleton />);
    expect(screen.getByRole("status", { name: "Ładowanie ścieżek" })).toBeTruthy();
  });
});
