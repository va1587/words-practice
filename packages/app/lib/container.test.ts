import type * as Db from "@devmentor/db";
import { getOrm } from "@devmentor/db";
import { after, connection } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const afterCallbacks = vi.hoisted(() => [] as (() => unknown)[]);

vi.mock("next/server", () => ({
  connection: vi.fn(() => Promise.resolve()),
  after: vi.fn((callback: () => unknown) => afterCallbacks.push(callback)),
}));
vi.mock("@devmentor/db", async (importOriginal) => ({
  ...(await importOriginal<typeof Db>()),
  getOrm: vi.fn(),
}));

const clear = vi.fn();
const fakeOrm = { em: { fork: () => ({ clear }) } } as unknown as Awaited<
  ReturnType<typeof getOrm>
>;

afterEach(() => {
  afterCallbacks.length = 0;
  (globalThis as { __devmentorContainer?: unknown }).__devmentorContainer = undefined;
  vi.resetModules();
});

/** Fresh modules per test: the container is cached on `globalThis` and in module state. */
async function load() {
  const [{ resolve }, core] = await Promise.all([import("./container"), import("@devmentor/core")]);
  return { resolve, core };
}

describe("resolve", () => {
  it("resolves request-scoped services and marks the access as request-time", async () => {
    vi.mocked(getOrm).mockResolvedValue(fakeOrm);
    const { resolve, core } = await load();

    expect(await resolve("learningPathService")).toBeInstanceOf(core.LearningPathService);
    expect(await resolve("adminService")).toBeInstanceOf(core.AdminService);
    expect((await resolve("config")).demoUserEmail).toContain("@");
    expect(connection).toHaveBeenCalled();
  });

  it("builds the root container once and disposes each request scope after the response", async () => {
    vi.mocked(getOrm).mockResolvedValue(fakeOrm);
    const { resolve } = await load();

    await resolve("em");
    await resolve("em");
    expect(getOrm).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(2);

    await Promise.all(afterCallbacks.map((callback) => callback()));
    expect(clear).toHaveBeenCalledTimes(2);
  });

  it("retries building the container after a failed ORM initialization", async () => {
    vi.mocked(getOrm).mockRejectedValueOnce(new Error("db down")).mockResolvedValueOnce(fakeOrm);
    const { resolve, core } = await load();

    await expect(resolve("learningPathService")).rejects.toThrow("db down");
    expect(await resolve("learningPathService")).toBeInstanceOf(core.LearningPathService);
  });
});
