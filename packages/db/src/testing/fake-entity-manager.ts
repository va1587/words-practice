import type { EntityManager } from "@mikro-orm/postgresql";
import { vi } from "vitest";

/** Collection-like wrapper matching the parts of MikroORM `Collection` our repositories use. */
export function collection<T>(items: T[]) {
  return { getItems: () => items, length: items.length };
}

/** Minimal EntityManager double for repository/seeder unit tests (no database). */
export function fakeEntityManager() {
  const fake = {
    find: vi.fn<(...args: unknown[]) => Promise<unknown[]>>(() => Promise.resolve([])),
    findOne: vi.fn<(...args: unknown[]) => Promise<unknown>>(() => Promise.resolve(null)),
    count: vi.fn<(...args: unknown[]) => Promise<number>>(() => Promise.resolve(0)),
    create: vi.fn((_entity: unknown, data: Record<string, unknown>) => ({ ...data })),
    flush: vi.fn(() => Promise.resolve()),
  };
  return { fake, em: fake as unknown as EntityManager };
}
