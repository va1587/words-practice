import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

test("admin overview shows platform stats", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { level: 1, name: "Przegląd" })).toBeVisible();
  await expect(page.getByText("Ukończenia lekcji")).toBeVisible();
  await expectNoSeriousA11yViolations(page);
});

test("admin paths table lists every learning path", async ({ page }) => {
  await page.goto("/admin/paths");
  const rows = page.getByRole("row");
  await expect(rows).toHaveCount(5); // header + 4 seeded paths
  await expect(page.getByRole("cell", { name: /Frontend od podstaw/ })).toBeVisible();
  await expectNoSeriousA11yViolations(page);
});
