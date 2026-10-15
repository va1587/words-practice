import { Card, CardContent } from "@devmentor/ui/components/card";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PathsTable, PathsTableSkeleton } from "@/components/admin/paths-table";

export const metadata: Metadata = {
  title: "Ścieżki nauki",
};

export default function AdminPathsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ścieżki nauki</h1>
        <p className="text-sm text-muted-foreground">
          Wszystkie ścieżki w kolejności wyświetlania.
        </p>
      </div>
      <Card>
        <CardContent>
          <Suspense fallback={<PathsTableSkeleton />}>
            <PathsTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
