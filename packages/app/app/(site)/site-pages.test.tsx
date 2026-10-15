import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { resolve } from "@/lib/container";
import { getCurrentUserEmail, getCurrentUserProgress } from "@/lib/current-user";
import { learningPath, lesson, resolveFrom, services, userProgress } from "@/testing/fixtures";
import DashboardPage, { metadata as dashboardMetadata } from "./dashboard/page";
import SiteLayout from "./layout";
import Home from "./page";
import LessonPage, { generateMetadata as lessonMetadata } from "./paths/[slug]/[lesson]/page";
import PathPage, { generateMetadata as pathMetadata } from "./paths/[slug]/page";
import PathsPage, { metadata as pathsMetadata } from "./paths/page";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
vi.mock("@/lib/container", () => ({ resolve: vi.fn() }));
vi.mock("@/lib/current-user", () => ({
  getCurrentUserProgress: vi.fn(),
  getCurrentUserEmail: vi.fn(() => Promise.resolve("ola@devmentor.dev")),
}));
// Async data components are unit-tested on their own (components/data-components.test.tsx).
vi.mock("@/components/path-grid", () => ({
  PathGrid: ({ featured }: { featured?: boolean }) => (
    <div>{featured ? "featured grid" : "all grid"}</div>
  ),
  PathGridSkeleton: () => <div>grid skeleton</div>,
}));

const pathParams = (slug: string) => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({}),
});
const lessonParams = (slug: string, lessonSlug: string) => ({
  params: Promise.resolve({ slug, lesson: lessonSlug }),
  searchParams: Promise.resolve({}),
});

function withServices() {
  const registry = services();
  resolveFrom(resolve, registry);
  return registry;
}

describe("SiteLayout", () => {
  it("wraps pages with the header, main landmark and footer", () => {
    render(
      <SiteLayout params={Promise.resolve({})}>
        <p>child</p>
      </SiteLayout>,
    );
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("main").textContent).toBe("child");
    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });
});

describe("Home", () => {
  it("renders the hero, benefits and featured paths", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Od pierwszej linijki kodu",
    );
    expect(screen.getByRole("link", { name: "Przeglądaj ścieżki" }).getAttribute("href")).toBe(
      "/paths",
    );
    expect(screen.getByRole("link", { name: "Kontynuuj naukę" }).getAttribute("href")).toBe(
      "/dashboard",
    );
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toContain(
      "Polecane ścieżki",
    );
    expect(screen.getByText("featured grid")).toBeTruthy();
  });
});

describe("PathsPage", () => {
  it("lists all paths", () => {
    render(<PathsPage />);
    expect(pathsMetadata.title).toBe("Ścieżki nauki");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Ścieżki nauki");
    expect(screen.getByText("all grid")).toBeTruthy();
  });
});

describe("PathPage", () => {
  it("uses the path title as metadata and leaves it empty for unknown paths", async () => {
    const registry = withServices();
    registry.learningPathService.get
      .mockResolvedValueOnce(learningPath())
      .mockResolvedValueOnce(null);
    expect(await pathMetadata(pathParams("react"))).toEqual({ title: "React w praktyce" });
    expect(await pathMetadata(pathParams("nope"))).toEqual({ title: undefined });
  });

  it("calls notFound for an unknown path", async () => {
    const registry = withServices();
    registry.learningPathService.get.mockResolvedValue(null);
    vi.mocked(getCurrentUserProgress).mockResolvedValue(null);
    await expect(PathPage(pathParams("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("invites to start when nothing is done and works without a signed-in user", async () => {
    const registry = withServices();
    registry.learningPathService.get.mockResolvedValue(learningPath());
    vi.mocked(getCurrentUserProgress).mockResolvedValue(null);

    render(await PathPage(pathParams("react")));

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("React w praktyce");
    expect(screen.getByText("0/3")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Zacznij ścieżkę" }).getAttribute("href")).toBe(
      "/paths/react/jsx",
    );
    expect(screen.getByRole("link", { name: /^JSX\s*\(do zrobienia\)/ })).toBeTruthy();
    expect(screen.getByText("01")).toBeTruthy();
    expect(screen.getByText("02")).toBeTruthy();
  });

  it("continues with the next unfinished lesson and marks completed ones", async () => {
    const registry = withServices();
    registry.learningPathService.get.mockResolvedValue(learningPath());
    vi.mocked(getCurrentUserProgress).mockResolvedValue(userProgress(["react/jsx"]));

    render(await PathPage(pathParams("react")));

    expect(screen.getByText("1/3")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kontynuuj" }).getAttribute("href")).toBe(
      "/paths/react/props",
    );
    expect(screen.getByRole("link", { name: /^JSX\s*\(ukończona\)/ })).toBeTruthy();
  });

  it("offers to repeat a completed path", async () => {
    const registry = withServices();
    registry.learningPathService.get.mockResolvedValue(learningPath());
    vi.mocked(getCurrentUserProgress).mockResolvedValue(
      userProgress(["react/jsx", "react/props", "react/state"]),
    );

    render(await PathPage(pathParams("react")));

    expect(screen.getByRole("link", { name: "Powtórz od początku" }).getAttribute("href")).toBe(
      "/paths/react/jsx",
    );
  });

  it("has no call to action for a path without lessons", async () => {
    const registry = withServices();
    registry.learningPathService.get.mockResolvedValue(learningPath({ modules: [] }));
    vi.mocked(getCurrentUserProgress).mockResolvedValue(null);

    render(await PathPage(pathParams("react")));

    expect(screen.queryByRole("link", { name: /Zacznij|Kontynuuj|Powtórz/ })).toBeNull();
  });
});

describe("LessonPage", () => {
  const path = learningPath();
  const [jsx, props, state] = [
    lesson("jsx", "JSX"),
    lesson("props", "Propsy"),
    lesson("state", "Stan"),
  ];

  it("uses the lesson title as metadata", async () => {
    const registry = withServices();
    registry.learningPathService.getLesson
      .mockResolvedValueOnce({ path, lesson: props, prev: jsx, next: state })
      .mockResolvedValueOnce(null);
    expect(await lessonMetadata(lessonParams("react", "props"))).toEqual({ title: "Propsy" });
    expect(await lessonMetadata(lessonParams("react", "nope"))).toEqual({ title: undefined });
  });

  it("calls notFound for an unknown lesson", async () => {
    const registry = withServices();
    registry.learningPathService.getLesson.mockResolvedValue(null);
    vi.mocked(getCurrentUserProgress).mockResolvedValue(null);
    await expect(LessonPage(lessonParams("react", "nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders content, exercise and links to neighbouring lessons", async () => {
    const registry = withServices();
    registry.learningPathService.getLesson.mockResolvedValue({
      path,
      lesson: props,
      prev: jsx,
      next: state,
    });
    vi.mocked(getCurrentUserProgress).mockResolvedValue(userProgress(["react/props"]));

    render(await LessonPage(lessonParams("react", "props")));

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Propsy");
    expect(screen.getByText("15 min · ukończona ✓")).toBeTruthy();
    expect(screen.getByText("Propsy body")).toBeTruthy();
    expect(screen.getByText("Propsy exercise")).toBeTruthy();
    expect(screen.getByRole("link", { name: "← JSX" }).getAttribute("href")).toBe(
      "/paths/react/jsx",
    );
    expect(screen.getByRole("link", { name: "Stan →" }).getAttribute("href")).toBe(
      "/paths/react/state",
    );
  });

  it("first lesson has no previous link, last lesson links back to the path", async () => {
    const registry = withServices();
    registry.learningPathService.getLesson.mockResolvedValue({
      path,
      lesson: jsx,
      prev: undefined,
      next: undefined,
    });
    vi.mocked(getCurrentUserProgress).mockResolvedValue(null);

    render(await LessonPage(lessonParams("react", "jsx")));

    expect(screen.getByText("15 min")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /^← JSX/ })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Koniec ścieżki — wróć do przeglądu" }).getAttribute("href"),
    ).toBe("/paths/react");
  });

  it("shows an unfinished lesson as not completed for a signed-in user", async () => {
    const registry = withServices();
    registry.learningPathService.getLesson.mockResolvedValue({
      path,
      lesson: state,
      prev: props,
      next: undefined,
    });
    vi.mocked(getCurrentUserProgress).mockResolvedValue(userProgress([]));

    render(await LessonPage(lessonParams("react", "state")));

    expect(screen.getByText("15 min")).toBeTruthy();
  });
});

describe("DashboardPage", () => {
  it("has a static title", () => {
    expect(dashboardMetadata.title).toBe("Mój postęp");
  });

  it("calls notFound when the current user does not exist", async () => {
    const registry = withServices();
    registry.progressService.dashboard.mockResolvedValue(null);
    await expect(DashboardPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(getCurrentUserEmail).toHaveBeenCalled();
  });

  it("shows statistics, the next lesson to continue and active paths", async () => {
    const registry = withServices();
    const path = learningPath();
    registry.progressService.dashboard.mockResolvedValue({
      user: userProgress(["react/jsx"]),
      activePaths: [
        {
          path,
          progress: { done: 1, total: 3, percent: 33, nextLesson: lesson("props", "Propsy") },
        },
      ],
    });

    render(await DashboardPage());

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Cześć, Ola 👋");
    expect(screen.getByText("6 🔥")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Propsy →/ }).getAttribute("href")).toBe(
      "/paths/react/props",
    );
    expect(screen.getByText("1/3 lekcji")).toBeTruthy();
  });

  it("has no continue card when every active path is finished", async () => {
    const registry = withServices();
    registry.progressService.dashboard.mockResolvedValue({
      user: userProgress([]),
      activePaths: [
        {
          path: learningPath(),
          progress: { done: 3, total: 3, percent: 100, nextLesson: undefined },
        },
      ],
    });

    render(await DashboardPage());

    expect(screen.queryByText(/Kontynuuj naukę/)).toBeNull();
    expect(screen.getByRole("link", { name: "Przeglądaj ścieżki" }).getAttribute("href")).toBe(
      "/paths",
    );
  });
});
