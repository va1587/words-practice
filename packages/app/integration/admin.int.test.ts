import { afterAll, describe, expect, it } from "vitest";
import { Browser } from "./browser";

const browser = new Browser("integration-admin");
afterAll(() => browser.close());

describe("admin panel", () => {
  it("overview shows platform statistics from PostgreSQL", async () => {
    await browser.open("/admin");
    await browser.waitForText("Ukończenia lekcji");

    expect(await browser.text("h1")).toBe("Przegląd");
    // Seeded: 4 paths (11 modules), 25 lessons, 1 user, 5 completions.
    const stats = await browser.text("main");
    expect(stats).toMatch(/Ścieżki nauki\s*4/);
    expect(stats).toContain("11 modułów");
    expect(stats).toMatch(/Lekcje\s*25/);
    expect(stats).toMatch(/Użytkownicy\s*1/);
    expect(stats).toMatch(/Ukończenia lekcji\s*5/);
  });

  it("paths table lists every learning path with its counts", async () => {
    await browser.open("/admin/paths");
    await browser.waitForText("Projektowanie systemów");

    expect(await browser.text("h1")).toBe("Ścieżki nauki");
    expect(await browser.count("tbody tr")).toBe(4);
    const table = await browser.text("table");
    expect(table).toContain("Frontend od podstaw");
    expect(table).toContain("Polecana");
    expect(table).toContain("Standardowa");
  });

  it("navigation marks the current admin section", async () => {
    await browser.open("/admin/paths");
    expect(await browser.attribute('aside a[href="/admin/paths"]', "aria-current")).toBe("page");
    expect(await browser.attribute('aside a[href="/admin"]', "aria-current")).toBeNull();
  });

  it("has no serious accessibility violations", async () => {
    for (const [path, text] of [
      ["/admin", "Ukończenia lekcji"],
      ["/admin/paths", "Projektowanie systemów"],
    ] as const) {
      await browser.open(path);
      await browser.waitForText(text);
      expect(await browser.seriousA11yViolations(), path).toEqual([]);
    }
  });
});
