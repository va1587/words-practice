import { computePathProgress } from "@devmentor/core";
import { resolve } from "@/lib/container";
import { getCurrentUserProgress } from "@/lib/current-user";
import { PathCard } from "./path-card";

const gridClassName = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

/** Learning paths read from the database at request time. Render inside `<Suspense>`. */
export async function PathGrid({ featured = false }: { featured?: boolean }) {
  const service = await resolve("learningPathService");
  const [paths, user] = await Promise.all([
    featured ? service.listFeatured() : service.list(),
    getCurrentUserProgress(),
  ]);

  return (
    <div className={gridClassName}>
      {paths.map((path) => (
        <PathCard
          key={path.slug}
          path={path}
          progress={user ? computePathProgress(path, user.completedLessons) : undefined}
        />
      ))}
    </div>
  );
}

export function PathGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={gridClassName} role="status" aria-busy="true" aria-label="Ładowanie ścieżek">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
