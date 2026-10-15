import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getLesson,
  getLessons,
  getPaths,
  getUserProgress,
  lessonKey,
} from "@/lib/data";

export function generateStaticParams() {
  return getPaths().flatMap((path) =>
    getLessons(path).map((l) => ({ slug: path.slug, lesson: l.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/paths/[slug]/[lesson]">): Promise<Metadata> {
  const { slug, lesson } = await params;
  return { title: getLesson(slug, lesson)?.lesson.title };
}

export default async function LessonPage({
  params,
}: PageProps<"/paths/[slug]/[lesson]">) {
  const { slug, lesson: lessonSlug } = await params;
  const result = getLesson(slug, lessonSlug);
  if (!result) notFound();

  const { path, lesson, prev, next } = result;
  const done = getUserProgress().completedLessons.has(
    lessonKey(path.slug, lesson.slug),
  );

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href={`/paths/${path.slug}`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← {path.title}
      </Link>

      <header className="mt-6">
        <p className="text-sm text-muted">
          {lesson.minutes} min{done && " · ukończona ✓"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {lesson.title}
        </h1>
        <p className="mt-3 text-lg text-muted">{lesson.summary}</p>
      </header>

      <div className="mt-8 flex flex-col gap-4 leading-7">
        {lesson.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-accent/40 bg-accent/5 p-6">
        <h2 className="font-semibold">Zadanie praktyczne</h2>
        <p className="mt-2 text-sm leading-6">{lesson.exercise}</p>
      </section>

      <nav className="mt-12 flex justify-between gap-4 border-t border-border pt-6 text-sm">
        {prev ? (
          <Link
            href={`/paths/${path.slug}/${prev.slug}`}
            className="text-muted hover:text-foreground"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/paths/${path.slug}/${next.slug}`}
            className="font-medium text-accent hover:underline"
          >
            {next.title} →
          </Link>
        ) : (
          <Link
            href={`/paths/${path.slug}`}
            className="font-medium text-accent hover:underline"
          >
            Koniec ścieżki — wróć do przeglądu
          </Link>
        )}
      </nav>
    </article>
  );
}
