export function ProgressBar({
  percent,
  label,
}: {
  percent: number;
  label?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Postęp"}
      className="h-2 w-full overflow-hidden rounded-full bg-surface"
    >
      <div
        className="h-full rounded-full bg-accent transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
