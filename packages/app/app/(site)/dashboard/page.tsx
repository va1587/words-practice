import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { resolve } from "@/lib/container";
import { getCurrentUserEmail } from "@/lib/current-user";

export const metadata: Metadata = {
  title: "Mój postęp",
};

export default async function DashboardPage() {
  const dashboard = await (await resolve("progressService")).dashboard(await getCurrentUserEmail());
  if (!dashboard) notFound();

  const { user, activePaths: active } = dashboard;

  const stats = [
    { label: "Ukończone lekcje", value: user.completedLessons.size },
    { label: "Seria dni nauki", value: `${user.streakDays} 🔥` },
    { label: "Aktywne ścieżki", value: active.length },
  ];

  const continueWith = active.find((a) => a.progress.nextLesson);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Cześć, {user.name} 👋</h1>
      <p className="mt-2 text-muted-foreground">Oto Twój postęp w nauce.</p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border p-5">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      {continueWith?.progress.nextLesson && (
        <Link
          href={`/paths/${continueWith.path.slug}/${continueWith.progress.nextLesson.slug}`}
          className="mt-8 flex flex-col gap-1 rounded-2xl bg-primary p-6 text-primary-foreground hover:opacity-90"
        >
          <span className="text-sm">Kontynuuj naukę · {continueWith.path.title}</span>
          <span className="text-xl font-semibold">{continueWith.progress.nextLesson.title} →</span>
        </Link>
      )}

      <h2 className="mt-12 text-xl font-semibold">Aktywne ścieżki</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {active.map(({ path, progress }) => (
          <li key={path.slug}>
            <Link
              href={`/paths/${path.slug}`}
              className="flex flex-col gap-3 rounded-2xl border border-border p-5 hover:border-primary sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="font-medium sm:w-56">{path.title}</span>
              <ProgressBar percent={progress.percent} label={`Postęp: ${path.title}`} />
              <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                {progress.done}/{progress.total} lekcji
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-muted-foreground">
        Szukasz czegoś nowego?{" "}
        <Link href="/paths" className="text-primary underline underline-offset-4">
          Przeglądaj ścieżki
        </Link>
      </p>
    </div>
  );
}
