import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import DashboardLoading from "./(site)/dashboard/loading";
import LessonLoading from "./(site)/paths/[slug]/[lesson]/loading";
import PathLoading from "./(site)/paths/[slug]/loading";
import AdminLayout, { metadata as adminMetadata } from "./admin/layout";
import AdminOverviewPage from "./admin/page";
import AdminPathsPage, { metadata as adminPathsMetadata } from "./admin/paths/page";
import RootLayout, { metadata } from "./layout";
import NotFound from "./not-found";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
}));
vi.mock("next/navigation", () => ({ usePathname: vi.fn(() => "/admin") }));
// Async data components are unit-tested on their own (components/data-components.test.tsx).
vi.mock("@/components/admin/platform-stats", () => ({
  PlatformStats: () => <div>stats</div>,
  PlatformStatsSkeleton: () => <div>stats skeleton</div>,
}));
vi.mock("@/components/admin/paths-table", () => ({
  PathsTable: () => <div>paths table</div>,
  PathsTableSkeleton: () => <div>table skeleton</div>,
}));

describe("RootLayout", () => {
  it("renders a Polish document with font variables and site metadata", () => {
    const html = renderToStaticMarkup(
      <RootLayout params={Promise.resolve({})}>
        <p>page</p>
      </RootLayout>,
    );
    expect(html).toContain('lang="pl"');
    expect(html).toContain("font-geist-sans font-geist-mono");
    expect(html).toContain("<p>page</p>");
    expect(metadata.title).toEqual({
      default: "DevMentor — ścieżki nauki dla programistów",
      template: "%s · DevMentor",
    });
  });
});

describe("loading states", () => {
  it.each([
    ["dashboard", DashboardLoading],
    ["path", PathLoading],
    ["lesson", LessonLoading],
  ])("%s shows the page skeleton", (_, Loading) => {
    render(<Loading />);
    expect(screen.getByRole("status", { name: "Ładowanie" })).toBeTruthy();
  });
});

describe("NotFound", () => {
  it("explains the error and links to the catalog", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Nie znaleziono strony");
    expect(screen.getByRole("link", { name: "Przeglądaj ścieżki" }).getAttribute("href")).toBe(
      "/paths",
    );
  });
});

describe("admin", () => {
  it("layout provides navigation, a way back to the site and admin metadata", () => {
    render(
      <AdminLayout params={Promise.resolve({})}>
        <p>admin page</p>
      </AdminLayout>,
    );
    expect(screen.getByText("Admin")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Przegląd" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(screen.getByRole("link", { name: "← Wróć do serwisu" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("main").textContent).toBe("admin page");
    expect(adminMetadata.title).toEqual({
      default: "Panel administracyjny",
      template: "%s · Admin DevMentor",
    });
  });

  it("overview page streams platform statistics", () => {
    render(<AdminOverviewPage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Przegląd");
    expect(screen.getByText("stats")).toBeTruthy();
  });

  it("paths page streams the paths table", () => {
    render(<AdminPathsPage />);
    expect(adminPathsMetadata.title).toBe("Ścieżki nauki");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Ścieżki nauki");
    expect(screen.getByText("paths table")).toBeTruthy();
  });
});
