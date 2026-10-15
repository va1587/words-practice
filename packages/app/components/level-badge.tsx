import { levelLabels, type Level } from "@devmentor/core";

const levelStyles: Record<Level, string> = {
  beginner: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  intermediate: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  advanced: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${levelStyles[level]}`}
    >
      {levelLabels[level]}
    </span>
  );
}
