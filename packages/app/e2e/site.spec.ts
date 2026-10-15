import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

const pages = [
  { path: "/", heading: /Od pierwszej linijki kodu/, content: "Frontend od podstaw" },
  { path: "/paths", heading: "Ścieżki nauki", content: "Projektowanie systemów" },
  { path: "/paths/react-in-practice", heading: "React w praktyce", content: "Własne hooki" },
  { path: "/paths/system-design/caching", heading: "Cache", content: "Zadanie praktyczne" },
  { path: "/dashboard", heading: /Cześć, Ola/, content: "Aktywne ścieżki" },
];

for (const { path, heading, content } of pages) {
  test(`${path} renders data from the database and has no serious a11y violations`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByText(content).first()).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  });
}

test("learner navigates from the catalog to a lesson and to the next one", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Przeglądaj ścieżki" }).click();
  await expect(page).toHaveURL("/paths");

  await page.getByRole("link", { name: /React w praktyce/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "React w praktyce" })).toBeVisible();
  await expect(page.getByText("1/7")).toBeVisible(); // seeded: 1 of 7 lessons done

  await page.getByRole("link", { name: /^JSX i propsy \(ukończona\)/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "JSX i propsy" })).toBeVisible();

  await page.getByRole("link", { name: /Kompozycja komponentów →/ }).click();
  await expect(page).toHaveURL("/paths/react-in-practice/composition");
});

test("the header marks the current section", async ({ page }) => {
  await page.goto("/paths/backend-node");
  await expect(page.getByRole("link", { name: "Ścieżki", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("an unknown path shows the not-found page", async ({ page }) => {
  await page.goto("/paths/does-not-exist");
  await expect(page.getByRole("heading", { name: "Nie znaleziono strony" })).toBeVisible();
});
