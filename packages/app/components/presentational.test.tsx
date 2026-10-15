import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { learningPath } from "@/testing/fixtures";
import { LevelBadge } from "./level-badge";
import { PageSkeleton } from "./page-skeleton";
import { PathCard } from "./path-card";
import { ProgressBar } from "./progress-bar";
import { SiteFooter } from "./site-footer";

describe("LevelBadge", () => {
  it.each([
    ["beginner", "Początkujący", "emerald"],
    ["intermediate", "Średniozaawansowany", "amber"],
    ["advanced", "Zaawansowany", "rose"],
  ] as const)("renders %s with its label and color", (level, label, color) => {
    render(<LevelBadge level={level} />);
    expect(screen.getByText(label).className).toContain(color);
  });
});

describe("ProgressBar", () => {
  it("exposes progress to assistive technology with a default label", () => {
    render(<ProgressBar percent={40} />);
    const bar = screen.getByRole("progressbar", { name: "Postęp" });
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    expect((bar.firstChild as HTMLElement).style.width).toBe("40%");
  });

  it("accepts a custom label", () => {
    render(<ProgressBar percent={0} label="Postęp: React" />);
    expect(screen.getByRole("progressbar", { name: "Postęp: React" })).toBeTruthy();
  });
});

describe("PathCard", () => {
  const path = learningPath();

  it("shows level, duration, lesson count and tags, linking to the path", () => {
    render(<PathCard path={path} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/paths/react");
    expect(link.textContent).toContain("30 h · 3 lekcji");
    expect(screen.getByText("Średniozaawansowany")).toBeTruthy();
    expect(screen.getByText("TypeScript")).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("hides progress when nothing is done and shows it otherwise", () => {
    const { rerender } = render(
      <PathCard path={path} progress={{ done: 0, total: 3, percent: 0, nextLesson: undefined }} />,
    );
    expect(screen.queryByRole("progressbar")).toBeNull();

    rerender(
      <PathCard path={path} progress={{ done: 1, total: 3, percent: 33, nextLesson: undefined }} />,
    );
    expect(screen.getByRole("progressbar", { name: "Postęp: React w praktyce" })).toBeTruthy();
    expect(screen.getByText("33%")).toBeTruthy();
  });
});

describe("PageSkeleton", () => {
  it("announces loading", () => {
    render(<PageSkeleton />);
    expect(screen.getByRole("status", { name: "Ładowanie" }).getAttribute("aria-busy")).toBe(
      "true",
    );
  });
});

describe("SiteFooter", () => {
  it("renders the copyright", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo").textContent).toContain("© 2026 DevMentor");
  });
});
