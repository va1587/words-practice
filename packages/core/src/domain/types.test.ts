import { describe, expect, it } from "vitest";
import { levelLabels, levels } from "./types";

describe("levels", () => {
  it("are ordered from beginner to advanced and each has a Polish label", () => {
    expect(levels).toEqual(["beginner", "intermediate", "advanced"]);
    expect(levels.map((level) => levelLabels[level])).toEqual([
      "Początkujący",
      "Średniozaawansowany",
      "Zaawansowany",
    ]);
  });
});
