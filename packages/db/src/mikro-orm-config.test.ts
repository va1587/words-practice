import { afterEach, describe, expect, it, vi } from "vitest";

const existsSync = vi.hoisted(() => vi.fn<(path: URL) => boolean>());
vi.mock("node:fs", () => ({ existsSync }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

async function loadCliConfig() {
  const loadEnvFile = vi.spyOn(process, "loadEnvFile").mockImplementation(() => undefined);
  const { default: config } = await import("../mikro-orm.config");
  return { config, loadedFiles: loadEnvFile.mock.calls.map(([path]) => String(path)) };
}

describe("CLI config (mikro-orm.config.ts)", () => {
  it("loads the root .env.local and .env when they exist", async () => {
    existsSync.mockReturnValue(true);
    const { loadedFiles } = await loadCliConfig();
    expect(loadedFiles.map((f) => f.split("/").pop())).toEqual([".env.local", ".env"]);
  });

  it("skips missing env files and registers migrations and seeder", async () => {
    existsSync.mockReturnValue(false);
    const { config, loadedFiles } = await loadCliConfig();
    expect(loadedFiles).toEqual([]);
    expect(config.extensions).toHaveLength(2);
    expect(config.migrations).toMatchObject({ path: "./src/migrations" });
    expect(config.seeder).toMatchObject({ path: "./src/seeders" });
  });
});
