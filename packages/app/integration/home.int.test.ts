import { afterAll, describe, expect, it } from "vitest";
import { Browser } from "./browser";

const browser = new Browser("integration-home");
afterAll(() => browser.close());

describe("home page", () => {
  it("renders the hero and featured paths read from PostgreSQL", async () => {
    await browser.open("/");
    await browser.waitForText("Frontend od podstaw");

    expect(await browser.text("h1")).toContain("Od pierwszej linijki kodu");
    // 3 of the 4 seeded paths are featured.
    expect(await browser.count('main a[href^="/paths/"]')).toBe(3);
    expect(await browser.text("main")).toContain("React w praktyce");
    expect(await browser.text("main")).not.toContain("Projektowanie systemów");
  });

  it("shows the demo user's progress on path cards", async () => {
    await browser.open("/");
    await browser.waitForText("Frontend od podstaw");
    // Seeded: 4 of 8 frontend lessons done → 50%.
    expect(await browser.text('a[href="/paths/frontend-foundations"]')).toContain("50%");
  });

  it("has no serious accessibility violations", async () => {
    await browser.open("/");
    await browser.waitForText("Frontend od podstaw");
    expect(await browser.seriousA11yViolations()).toEqual([]);
  });

  it("links to the catalog", async () => {
    await browser.open("/");
    await browser.clickLink("Przeglądaj ścieżki");
    await browser.waitForUrl("/paths");
    await browser.waitForText("Projektowanie systemów");
    expect(await browser.text("h1")).toBe("Ścieżki nauki");
  });
});
