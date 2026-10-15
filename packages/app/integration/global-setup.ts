import { startTestDatabase, type TestDatabase } from "@devmentor/db/testing";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import type { TestProject } from "vitest/node";
import { childProcessEnv } from "./env";

declare module "vitest" {
  export interface ProvidedContext {
    appUrl: string;
  }
}

const appDir = fileURLToPath(new URL("..", import.meta.url));
const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");

let database: TestDatabase | undefined;
let server: ChildProcess | undefined;

/**
 * Temporary DevMentor instance for integration tests:
 * Testcontainers PostgreSQL (migrated + seeded) → production build → `next start` on a free port.
 * `npm run test:integration` (Turborepo) builds the app first; a missing build is built here.
 */
export async function setup(project: TestProject) {
  database = await startTestDatabase();

  if (!existsSync(new URL("../.next/BUILD_ID", import.meta.url))) {
    const build = spawnSync(process.execPath, [nextBin, "build"], {
      cwd: appDir,
      stdio: "inherit",
    });
    if (build.status !== 0) throw new Error("next build failed");
  }

  const port = await freePort();
  const appUrl = `http://localhost:${port}`;
  server = spawn(process.execPath, [nextBin, "start", "--port", String(port)], {
    cwd: appDir,
    env: childProcessEnv({ DATABASE_URL: database.url, NODE_ENV: "production" }),
    stdio: ["ignore", "inherit", "inherit"],
  });
  await waitForHttp(appUrl, 60_000);

  project.provide("appUrl", appUrl);
}

export async function teardown() {
  server?.kill("SIGTERM");
  await database?.stop();
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.unref();
    probe.on("error", reject);
    probe.listen(0, () => {
      const address = probe.address();
      probe.close(() =>
        typeof address === "object" && address
          ? resolve(address.port)
          : reject(new Error("no port")),
      );
    });
  });
}

async function waitForHttp(url: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // server not listening yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`App did not start at ${url} within ${timeoutMs} ms`);
}
