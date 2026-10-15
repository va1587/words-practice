"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

/**
 * `usePathname()` is runtime data on dynamic routes, so with Cache Components it must sit
 * inside `<Suspense>` — the prerendered shell shows the link without the active state.
 */
export function NavLink(props: NavLinkProps) {
  return (
    <Suspense fallback={<NavAnchor {...props} active={false} />}>
      <ActiveNavLink {...props} />
    </Suspense>
  );
}

function ActiveNavLink(props: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === props.href || pathname.startsWith(`${props.href}/`);
  return <NavAnchor {...props} active={active} />;
}

function NavAnchor({ href, children, active }: NavLinkProps & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-md px-3 py-2 transition-colors ${
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
