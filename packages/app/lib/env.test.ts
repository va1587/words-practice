import { describe, expect, it } from "vitest";
import { readAppEnv } from "./env";

describe("readAppEnv", () => {
  it("defaults to the seeded demo account", () => {
    expect(readAppEnv({})).toEqual({ DEMO_USER_EMAIL: "ola@devmentor.dev" });
  });

  it("accepts a valid email and rejects an invalid one", () => {
    expect(readAppEnv({ DEMO_USER_EMAIL: "a@b.dev" }).DEMO_USER_EMAIL).toBe("a@b.dev");
    expect(() => readAppEnv({ DEMO_USER_EMAIL: "nope" })).toThrow(
      /Invalid application environment/,
    );
  });

  it("reads process.env by default", () => {
    expect(readAppEnv().DEMO_USER_EMAIL).toContain("@");
  });
});
