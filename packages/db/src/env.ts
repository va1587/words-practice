import { z } from "zod";

// Local docker compose database (`npm run db:up`) — never used in production.
const DEVELOPMENT_DATABASE_URL = "postgresql://devmentor:devmentor@localhost:5432/devmentor";

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }).optional(),
    DATABASE_POOL_MIN: z.coerce.number().int().min(0).default(0),
    DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
    DATABASE_DEBUG: z.stringbool().default(false),
  })
  .refine((env) => env.DATABASE_POOL_MIN <= env.DATABASE_POOL_MAX, {
    message: "DATABASE_POOL_MIN must not exceed DATABASE_POOL_MAX",
    path: ["DATABASE_POOL_MIN"],
  })
  .refine((env) => env.NODE_ENV !== "production" || env.DATABASE_URL !== undefined, {
    message: "DATABASE_URL is required in production",
    path: ["DATABASE_URL"],
  })
  .transform(({ DATABASE_URL, ...env }) => ({
    ...env,
    DATABASE_URL: DATABASE_URL ?? DEVELOPMENT_DATABASE_URL,
  }));

export type DbEnv = z.infer<typeof schema>;

/** The only place in `@devmentor/db` that reads `process.env`. Throws a readable error on invalid values. */
export function readDbEnv(source: Record<string, string | undefined> = process.env): DbEnv {
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid database environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
