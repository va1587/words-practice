import "server-only";

import { z } from "zod";

const schema = z.object({
  /** Current user until authentication exists — the seeded demo account. */
  DEMO_USER_EMAIL: z.email().default("ola@devmentor.dev"),
});

export type AppEnv = z.infer<typeof schema>;

/** The only place in `@devmentor/app` that reads `process.env`. Throws a readable error on invalid values. */
export function readAppEnv(source: Record<string, string | undefined> = process.env): AppEnv {
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid application environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
