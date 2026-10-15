import { Suspense } from "react";
import { PlatformStats, PlatformStatsSkeleton } from "@/components/admin/platform-stats";

export default function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Przegląd</h1>
        <p className="text-sm text-muted-foreground">Stan treści i aktywności użytkowników.</p>
      </div>
      <Suspense fallback={<PlatformStatsSkeleton />}>
        <PlatformStats />
      </Suspense>
    </div>
  );
}
