import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Nie znaleziono strony
      </h1>
      <p className="text-muted">
        Ta ścieżka nie istnieje albo została przeniesiona.
      </p>
      <Link
        href="/paths"
        className="mt-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
      >
        Przeglądaj ścieżki
      </Link>
    </div>
  );
}
