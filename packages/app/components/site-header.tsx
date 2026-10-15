import Link from "next/link";
import { NavLink } from "./nav-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-mono text-sm text-primary-foreground">
            {"</>"}
          </span>
          DevMentor
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink href="/paths">Ścieżki</NavLink>
          <NavLink href="/dashboard">Mój postęp</NavLink>
        </nav>
      </div>
    </header>
  );
}
