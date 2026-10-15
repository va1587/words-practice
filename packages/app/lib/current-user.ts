import "server-only";

import { cache } from "react";
import { resolve } from "./container";

/** Progress of the signed-in user. Until auth exists this is the seeded demo account. */
export const getCurrentUserProgress = cache(async () => {
  const [config, progressService] = await Promise.all([
    resolve("config"),
    resolve("progressService"),
  ]);
  return progressService.forUser(config.demoUserEmail);
});

export const getCurrentUserEmail = cache(async () => (await resolve("config")).demoUserEmail);
