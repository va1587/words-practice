import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LevelBadge } from "@/components/level-badge";
import { ProgressBar } from "@/components/progress-bar";
import {
  getLessons,
  getPath,
  getPathProgress,
  getPaths,
  getUserProgress,
  lessonKey,
} from "@/lib/data";

export function generateStaticParams() {
  return getPaths().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/paths/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getPath(slug)?.title };
}

export default async function PathPage({ params }: PageProps<"/paths/[slug]">) {
  const { slug } = await params;
  const path = getPath(slug);
  if (!path) notFound();

  const progress = getPathProgress(path);
  const { completedLessons } = getUserProgress();
  const firstLesson = getLessons(path)[0];
  const cta = progress.nextLesson ?? firstLesson;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href="/paths" className="text-sm text-muted hover:text-foreground">
        ← Wszystkie ścieżki
      </Link>

      <header className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <LevelBadge level={path.level} />
          <span>{path.hours} h</span>
          <span>·</span>
          <span>{progress.total} lekcji</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {path.title}
        </h1>
        <p className="max-w-2xl text-lg text-muted">{path.description}</p>
        <div className="flex flex-col gap-2 rounded-2xl border border-border p-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex-1">
            <div className="mb-2 flex justify-between text-sm">
              <span>Twój postęp</span>
              <span className="tabular-nums text-muted">
                {progress.done}/{progress.total}
              </span>
            </div>
            <ProgressBar percent={progress.percent} />
          </div>
          <Link
            href={`/paths/${path.slug}/${cta.slug}`}
            className="rounded-full bg-accent px-5 py-2.5 text-center text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            {progress.done === 0
              ? "Zacznij ścieżkę"
              : progress.nextLesson
                ? "Kontynuuj"
                : "Powtórz od początku"}
          </Link>
        </div>
      </header>

      <ol className="mt-10 flex flex-col gap-6">
        {path.modules.map((module, i) => (
          <li key={module.title} className="rounded-2xl border border-border">
            <h2 className="border-b border-border px-5 py-4 font-semibold">
              <span className="mr-2 font-mono text-sm text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              {module.title}
            </h2>
            <ul className="divide-y divide-border">
              {module.lessons.map((l) => {
                const done = completedLessons.has(lessonKey(path.slug, l.slug));
                return (
                  <li key={l.slug}>
                    <Link
                      href={`/paths/${path.slug}/${l.slug}`}
                      className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-surface"
                    >
                      <span
                        aria-label={done ? "Ukończona" : "Do zrobienia"}
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                          done
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border"
                        }`}
                      >
                        {done ? "✓" : ""}
                      </span>
                      <span className="flex-1">{l.title}</span>
                      <span className="text-muted">{l.minutes} min</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
