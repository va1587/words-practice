import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { AdminNav } from "./admin/admin-nav";
import { NavLink } from "./nav-link";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

describe("NavLink", () => {
  it.each([
    ["/paths", "page"],
    ["/paths/react/jsx", "page"],
    ["/dashboard", null],
    ["/pathsx", null],
  ])("on %s sets aria-current=%s", (pathname, current) => {
    vi.mocked(usePathname).mockReturnValue(pathname);
    render(<NavLink href="/paths">Ścieżki</NavLink>);
    const link = screen.getByRole("link", { name: "Ścieżki" });
    expect(link.getAttribute("aria-current")).toBe(current);
    expect(link.className).toContain(current ? "font-medium" : "text-muted-foreground");
  });
});

describe("SiteHeader", () => {
  it("links home and to the main sections", () => {
    vi.mocked(usePathname).mockReturnValue("/dashboard");
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: /DevMentor/ }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Mój postęp" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(screen.getByRole("link", { name: "Ścieżki" }).getAttribute("aria-current")).toBeNull();
  });
});

describe("AdminNav", () => {
  it("marks only the exact current admin page", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/paths");
    render(<AdminNav />);
    expect(screen.getByRole("link", { name: "Ścieżki nauki" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(screen.getByRole("link", { name: "Przegląd" }).getAttribute("aria-current")).toBeNull();
  });
});
