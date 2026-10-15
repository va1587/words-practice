import { levelLabels } from "@devmentor/core";
import { Badge } from "@devmentor/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@devmentor/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@devmentor/ui/components/table";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { resolve } from "@/lib/container";

export const metadata: Metadata = {
  title: "Ścieżki nauki",
};

export default function AdminPathsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ścieżki nauki</CardTitle>
        <CardDescription>Wszystkie ścieżki w kolejności wyświetlania.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
          <PathsTable />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function PathsTable() {
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
