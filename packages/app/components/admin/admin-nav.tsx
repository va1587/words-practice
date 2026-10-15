"use client";

import { buttonVariants } from "@devmentor/ui/components/button";
import { cn } from "@devmentor/ui/lib/utils";
import { BookOpen, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Przegląd", icon: LayoutDashboard },
  { href: "/admin/paths", label: "Ścieżki nauki", icon: BookOpen },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 md:flex-col">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: active ? "secondary" : "ghost" }),
              "justify-start",
            )}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
