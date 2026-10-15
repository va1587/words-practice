import { getLessons, type LearningPath, type PathProgress } from "@devmentor/core";
import Link from "next/link";
import { LevelBadge } from "./level-badge";
import { ProgressBar } from "./progress-bar";

export function PathCard({
  path,
  progress,
}: {
  path: LearningPath;
  progress?: PathProgress;
}) {
  return (
    <Link
      href={`/paths/${path.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary"
    >
      <div className="flex items-center justify-between gap-2">
        <LevelBadge level={path.level} />
        <span className="text-xs text-muted-foreground">
          {path.hours} h · {getLessons(path).length} lekcji
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold group-hover:text-primary">
          {path.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{path.tagline}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {path.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
      {progress && progress.done > 0 && (
        <div className="mt-auto flex items-center gap-3">
          <ProgressBar percent={progress.percent} label={`Postęp: ${path.title}`} />
          <span className="text-xs tabular-nums text-muted-foreground">
            {progress.percent}%
          </span>
        </div>
      )}
    </Link>
  );
}
