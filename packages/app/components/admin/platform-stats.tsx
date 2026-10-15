import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@devmentor/ui/components/card";
import { resolve } from "@/lib/container";

const gridClassName = "grid gap-4 sm:grid-cols-2 xl:grid-cols-4";

/** Platform statistics read from the database at request time. Render inside `<Suspense>`. */
export async function PlatformStats() {
  const stats = await (await resolve("adminService")).overview();

  const items = [
    { label: "Ścieżki nauki", value: stats.paths, hint: `${stats.modules} modułów` },
    { label: "Lekcje", value: stats.lessons, hint: "we wszystkich ścieżkach" },
    { label: "Użytkownicy", value: stats.users, hint: "zarejestrowane konta" },
    { label: "Ukończenia lekcji", value: stats.completions, hint: "łącznie" },
  ];

  return (
    <div className={gridClassName}>
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

export function PlatformStatsSkeleton() {
  return (
    <div className={gridClassName} role="status" aria-busy="true" aria-label="Ładowanie statystyk">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
