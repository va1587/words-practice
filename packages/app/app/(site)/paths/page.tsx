import type { Metadata } from "next";
import { Suspense } from "react";
import { PathGrid, PathGridSkeleton } from "@/components/path-grid";

export const metadata: Metadata = {
  title: "Ścieżki nauki",
};

export default function PathsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Ścieżki nauki</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Wybierz ścieżkę dopasowaną do Twojego poziomu. Każda składa się z modułów, lekcji i zadań
        praktycznych.
      </p>
      <div className="mt-8">
        <Suspense fallback={<PathGridSkeleton count={6} />}>
          <PathGrid />
        </Suspense>
      </div>
    </div>
  );
}
