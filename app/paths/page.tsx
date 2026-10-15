import type { Metadata } from "next";
import { PathCard } from "@/components/path-card";
import { getPaths } from "@/lib/data";

export const metadata: Metadata = {
  title: "Ścieżki nauki",
};

export default function PathsPage() {
  const paths = getPaths();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Ścieżki nauki</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Wybierz ścieżkę dopasowaną do Twojego poziomu. Każda składa się z
        modułów, lekcji i zadań praktycznych.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paths.map((path) => (
          <PathCard key={path.slug} path={path} />
        ))}
      </div>
    </div>
  );
}
