import { Badge } from "@devmentor/ui/components/badge";
import { Separator } from "@devmentor/ui/components/separator";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Panel administracyjny", template: "%s · Admin DevMentor" },
};

/** Back-office pages — built from shadcn/ui components (`@devmentor/ui`). */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="flex flex-col gap-4 border-b bg-muted/40 p-4 md:w-60 md:border-r md:border-b-0">
        <div className="flex items-center gap-2 px-2 font-semibold">
          DevMentor
          <Badge variant="secondary">Admin</Badge>
        </div>
        <Separator />
        <AdminNav />
        <Link href="/" className="mt-auto px-2 text-sm text-muted-foreground hover:text-foreground">
          ← Wróć do serwisu
        </Link>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
