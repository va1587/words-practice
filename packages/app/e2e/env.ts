// The only place in the E2E suite that reads `process.env`.
export const e2eEnv = {
  ci: Boolean(process.env.CI),
  port: Number(process.env.E2E_PORT ?? 3100),
  databaseUrl:
    process.env.DATABASE_URL ?? "postgresql://devmentor:devmentor@localhost:5432/devmentor",
};
