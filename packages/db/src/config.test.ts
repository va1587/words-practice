import { describe, expect, it } from "vitest";
import { createConfig } from "./config";
import { entities } from "./entities";

describe("createConfig", () => {
  it("builds the runtime config from the validated environment", () => {
    const config = createConfig();
    expect(config).toMatchObject({
      clientUrl: "postgresql://devmentor:devmentor@localhost:5432/devmentor",
      entities,
      pool: { min: 0, max: 10, idleTimeoutMillis: 30_000 },
      debug: false,
    });
  });

  it("applies overrides on top of the defaults", () => {
    expect(createConfig({ clientUrl: "postgresql://other/db", debug: true })).toMatchObject({
      clientUrl: "postgresql://other/db",
      debug: true,
    });
  });
});
