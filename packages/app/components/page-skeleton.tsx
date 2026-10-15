export function PageSkeleton() {
  return (
    <div
      className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 sm:px-6"
      aria-busy="true"
      aria-label="Ładowanie"
    >
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-5 w-full animate-pulse rounded bg-muted" />
      <div className="mt-6 h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
