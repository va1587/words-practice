// The only place in the integration harness that reads `process.env`.

/** Environment for the temporary app instance: the current one plus overrides. */
export function childProcessEnv(overrides: Record<string, string>): NodeJS.ProcessEnv {
  return { ...process.env, ...overrides };
}
