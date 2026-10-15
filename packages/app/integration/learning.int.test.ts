import { afterAll, describe, expect, it } from "vitest";
import { Browser } from "./browser";

const browser = new Browser("integration-learning");
afterAll(() => browser.close());

describe("learning paths", () => {
  it("path page lists modules, lessons and the user's progress", async () => {
    await browser.open("/paths/react-in-practice");
    await browser.waitForText("Własne hooki");

    expect(await browser.text("h1")).toBe("React w praktyce");
    expect(await browser.text("main")).toContain("1/7"); // seeded: 1 of 7 lessons done
    expect(await browser.text('a[href="/paths/react-in-practice/jsx"]')).toContain("(ukończona)");
  });

  it("learner goes from a lesson to the next one", async () => {
    await browser.open("/paths/react-in-practice/jsx");
    await browser.waitForText("Zadanie praktyczne");
    expect(await browser.text("h1")).toBe("JSX i propsy");

    await browser.clickLink("Kompozycja komponentów →");
    await browser.waitForUrl("/paths/react-in-practice/composition");
    await browser.waitForText("Zadanie praktyczne");
    expect(await browser.text("h1")).toBe("Kompozycja komponentów");
  });

  it("dashboard shows the demo user's statistics and active paths", async () => {
    await browser.open("/dashboard");
    await browser.waitForText("Aktywne ścieżki");

    expect(await browser.text("h1")).toContain("Cześć, Ola");
    const main = await browser.text("main");
    expect(main).toMatch(/Ukończone lekcje\s*5/);
    expect(main).toContain("4/8 lekcji");
  });

  it("header marks the current section", async () => {
    await browser.open("/paths/backend-node");
    await browser.waitForText("Podstawy HTTP");
    expect(await browser.attribute('header a[href="/paths"]', "aria-current")).toBe("page");
  });

  it("an unknown path shows the not-found page", async () => {
    await browser.open("/paths/does-not-exist");
    await browser.waitForText("Nie znaleziono strony");
  });

  it("public pages have no serious accessibility violations", async () => {
    for (const [path, text] of [
      ["/paths", "Projektowanie systemów"],
      ["/paths/react-in-practice", "Własne hooki"],
      ["/paths/system-design/caching", "Zadanie praktyczne"],
      ["/dashboard", "Aktywne ścieżki"],
    ] as const) {
      await browser.open(path);
      await browser.waitForText(text);
      expect(await browser.seriousA11yViolations(), path).toEqual([]);
    }
  });
});
