import Link from "next/link";
import { Suspense } from "react";
import { PathGrid, PathGridSkeleton } from "@/components/path-grid";

const features = [
  {
    title: "Uporządkowane ścieżki",
    text: "Zamiast chaosu tutoriali — moduły ułożone w logicznej kolejności, od podstaw do zaawansowanych tematów.",
  },
  {
    title: "Praktyka w każdej lekcji",
    text: "Każda lekcja kończy się zadaniem, które utrwala wiedzę na prawdziwym kodzie.",
  },
  {
    title: "Widoczny postęp",
    text: "Śledzisz ukończone lekcje, serię dni nauki i od razu wiesz, co dalej.",
  },
];

export default function Home() {
  return (
    <>
      <section className="border-b border-border bg-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 sm:py-28">
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            Ścieżki nauki dla programistów
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Od pierwszej linijki kodu do <span className="text-primary">pewnego siebie developera</span>.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            DevMentor prowadzi Cię krok po kroku przez frontend, backend i
            architekturę — z praktycznymi zadaniami i śledzeniem postępów.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/paths"
              className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Przeglądaj ścieżki
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-border bg-background px-5 py-3 text-sm font-medium hover:border-primary"
            >
              Kontynuuj naukę
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <h2 className="font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Polecane ścieżki
          </h2>
          <Link href="/paths" className="text-sm text-primary hover:underline">
            Wszystkie ścieżki →
          </Link>
        </div>
        <Suspense fallback={<PathGridSkeleton />}>
          <PathGrid featured />
        </Suspense>
      </section>
    </>
  );
}
