import { lessonKey } from "@devmentor/core";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolve } from "@/lib/container";
import { getCurrentUserProgress } from "@/lib/current-user";

export async function generateMetadata({
  params,
}: PageProps<"/paths/[slug]/[lesson]">): Promise<Metadata> {
  const { slug, lesson } = await params;
  const result = await (await resolve("learningPathService")).getLesson(slug, lesson);
  return { title: result?.lesson.title };
}

export default async function LessonPage({
  params,
}: PageProps<"/paths/[slug]/[lesson]">) {
  const { slug, lesson: lessonSlug } = await params;
  const [result, user] = await Promise.all([
    (await resolve("learningPathService")).getLesson(slug, lessonSlug),
    getCurrentUserProgress(),
  ]);
  if (!result) notFound();

  const { path, lesson, prev, next } = result;
  const done = user?.completedLessons.has(lessonKey(path.slug, lesson.slug)) ?? false;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href={`/paths/${path.slug}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← {path.title}
      </Link>

      <header className="mt-6">
        <p className="text-sm text-muted-foreground">
          {lesson.minutes} min{done && " · ukończona ✓"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {lesson.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{lesson.summary}</p>
      </header>

      <div className="mt-8 flex flex-col gap-4 leading-7">
        {lesson.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-primary/40 bg-primary/5 p-6">
        <h2 className="font-semibold">Zadanie praktyczne</h2>
        <p className="mt-2 text-sm leading-6">{lesson.exercise}</p>
      </section>

      <nav className="mt-12 flex justify-between gap-4 border-t border-border pt-6 text-sm">
        {prev ? (
          <Link
            href={`/paths/${path.slug}/${prev.slug}`}
            className="text-muted-foreground hover:text-foreground"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/paths/${path.slug}/${next.slug}`}
            className="font-medium text-primary hover:underline"
          >
            {next.title} →
          </Link>
        ) : (
          <Link
            href={`/paths/${path.slug}`}
            className="font-medium text-primary hover:underline"
          >
            Koniec ścieżki — wróć do przeglądu
          </Link>
        )}
      </nav>
    </article>
  );
}
