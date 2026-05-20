import Link from "next/link";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-50 border-b border-divider/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-display text-xl tracking-wide text-white-mint"
          >
            949<span className="text-mint">Fantasy</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-text">
            <Link
              href="/snapshot"
              className="hover:text-mint transition-colors font-medium text-white-mint/90"
            >
              App
            </Link>
            <a href="#rankings-preview" className="hover:text-mint transition-colors">
              Edge Board
            </a>
            <a href="#features" className="hover:text-mint transition-colors hidden sm:inline">
              Product
            </a>
            <a href="#pricing" className="hover:text-mint transition-colors">
              Season pass
            </a>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-divider bg-deep-green/40 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-slate-text sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-display text-lg tracking-wide text-white-mint">
            949Fantasy
          </p>
          <p className="max-w-md text-balance">
            Fantasy football analytics and intelligence. Not affiliated with the NFL
            or its teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
