import { MikroORM } from "@mikro-orm/postgresql";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getOrm } from "./orm";

const globalForOrm = globalThis as unknown as { __devmentorOrm?: unknown };

afterEach(() => {
  vi.restoreAllMocks();
  globalForOrm.__devmentorOrm = undefined;
});

describe("getOrm", () => {
  it("initializes the ORM once per process and reuses it", async () => {
    const orm = {} as MikroORM;
    const init = vi.spyOn(MikroORM, "init").mockResolvedValue(orm);

    expect(await getOrm()).toBe(orm);
    expect(await getOrm()).toBe(orm);
    expect(init).toHaveBeenCalledTimes(1);
  });

  it("forgets a failed initialization so the next call retries", async () => {
    const orm = {} as MikroORM;
    const init = vi
      .spyOn(MikroORM, "init")
      .mockRejectedValueOnce(new Error("connection refused"))
      .mockResolvedValueOnce(orm);

    await expect(getOrm()).rejects.toThrow("connection refused");
    expect(await getOrm()).toBe(orm);
    expect(init).toHaveBeenCalledTimes(2);
  });
});
