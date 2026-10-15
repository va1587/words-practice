import { levelLabels } from "@devmentor/core";
import { Badge } from "@devmentor/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@devmentor/ui/components/table";
import Link from "next/link";
import { resolve } from "@/lib/container";

/** All learning paths with module/lesson counts. Render inside `<Suspense>`. */
export async function PathsTable() {
  const paths = await (await resolve("adminService")).paths();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tytuł</TableHead>
          <TableHead>Poziom</TableHead>
          <TableHead className="text-right">Moduły</TableHead>
          <TableHead className="text-right">Lekcje</TableHead>
          <TableHead className="text-right">Czas</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paths.map((path) => (
          <TableRow key={path.slug}>
            <TableCell>
              <Link href={`/paths/${path.slug}`} className="font-medium hover:underline">
                {path.title}
              </Link>
              <div className="font-mono text-xs text-muted-foreground">{path.slug}</div>
            </TableCell>
            <TableCell>{levelLabels[path.level]}</TableCell>
            <TableCell className="text-right tabular-nums">{path.modules}</TableCell>
            <TableCell className="text-right tabular-nums">{path.lessons}</TableCell>
            <TableCell className="text-right tabular-nums">{path.hours} h</TableCell>
            <TableCell>
              {path.featured ? (
                <Badge>Polecana</Badge>
              ) : (
                <Badge variant="outline">Standardowa</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function PathsTableSkeleton() {
  return (
    <div
      className="h-48 animate-pulse rounded-lg bg-muted"
      role="status"
      aria-busy="true"
      aria-label="Ładowanie ścieżek"
    />
  );
}
