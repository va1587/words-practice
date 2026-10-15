import Link from "next/link";
import { getLessons, getPathProgress } from "@/lib/data";
import type { LearningPath } from "@/lib/types";
import { LevelBadge } from "./level-badge";
import { ProgressBar } from "./progress-bar";

export function PathCard({ path }: { path: LearningPath }) {
  const progress = getPathProgress(path);

  return (
    <Link
      href={`/paths/${path.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 transition-colors hover:border-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <LevelBadge level={path.level} />
        <span className="text-xs text-muted">
          {path.hours} h · {getLessons(path).length} lekcji
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold group-hover:text-accent">
          {path.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{path.tagline}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {path.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-surface px-2 py-0.5 font-mono text-xs text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
      {progress.done > 0 && (
        <div className="mt-auto flex items-center gap-3">
          <ProgressBar percent={progress.percent} label={`Postęp: ${path.title}`} />
          <span className="text-xs tabular-nums text-muted">
            {progress.percent}%
          </span>
        </div>
      )}
    </Link>
  );
}
