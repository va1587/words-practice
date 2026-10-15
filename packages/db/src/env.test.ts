import { describe, expect, it } from "vitest";
import { readDbEnv } from "./env";

describe("readDbEnv", () => {
  it("falls back to the docker compose database and pool defaults in development", () => {
    expect(readDbEnv({})).toEqual({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://devmentor:devmentor@localhost:5432/devmentor",
      DATABASE_POOL_MIN: 0,
      DATABASE_POOL_MAX: 10,
      DATABASE_DEBUG: false,
    });
  });

  it("parses numbers and booleans from strings", () => {
    const env = readDbEnv({
      DATABASE_URL: "postgres://u:p@db:5432/app",
      DATABASE_POOL_MIN: "2",
      DATABASE_POOL_MAX: "20",
      DATABASE_DEBUG: "true",
    });
    expect(env).toMatchObject({
      DATABASE_POOL_MIN: 2,
      DATABASE_POOL_MAX: 20,
      DATABASE_DEBUG: true,
    });
  });

  it("requires DATABASE_URL in production", () => {
    expect(() => readDbEnv({ NODE_ENV: "production" })).toThrow(/DATABASE_URL is required/);
  });

  it("rejects non-PostgreSQL URLs and an inverted pool range", () => {
    expect(() => readDbEnv({ DATABASE_URL: "mysql://localhost/app" })).toThrow(/DATABASE_URL/);
    expect(() => readDbEnv({ DATABASE_POOL_MIN: "5", DATABASE_POOL_MAX: "2" })).toThrow(
      /must not exceed/,
    );
  });
});
