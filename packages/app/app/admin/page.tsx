import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@devmentor/ui/components/card";
import { Suspense } from "react";
import { resolve } from "@/lib/container";

export default function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Przegląd</h1>
        <p className="text-sm text-muted-foreground">Stan treści i aktywności użytkowników.</p>
      </div>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
    </div>
  );
}

async function Stats() {
  const stats = await (await resolve("adminService")).overview();

  const items = [
    { label: "Ścieżki nauki", value: stats.paths, hint: `${stats.modules} modułów` },
    { label: "Lekcje", value: stats.lessons, hint: "we wszystkich ścieżkach" },
    { label: "Użytkownicy", value: stats.users, hint: "zarejestrowane konta" },
    { label: "Ukończenia lekcji", value: stats.completions, hint: "łącznie" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{item.value}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">{item.hint}</CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
