"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { useState } from "react"

import { isSubNavActive, primaryNav, subNavItems } from "@/components/app/nav-config"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [navExpanded, setNavExpanded] = useState(true)

  const sectionPrefix = pathname.startsWith("/metrics")
    ? "/metrics"
    : pathname.startsWith("/performance") || pathname === "/playertape"
      ? "/performance"
      : pathname.startsWith("/games")
        ? "/games"
        : pathname.startsWith("/settings")
          ? "/settings"
          : null
  const subLinks = sectionPrefix
    ? subNavItems.filter((s) => s.prefix === sectionPrefix)
    : []

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-divider bg-surface/95 backdrop-blur-md">
        <div className="flex h-12 items-center gap-2 border-b border-divider/60 px-3 sm:h-14 sm:px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-mint hover:bg-muted/50"
            aria-expanded={navExpanded}
            aria-label={navExpanded ? "Collapse navigation" : "Expand navigation"}
            onClick={() => setNavExpanded((e) => !e)}
          >
            {navExpanded ? (
              <ChevronLeft className="size-4" aria-hidden />
            ) : (
              <ChevronRight className="size-4" aria-hidden />
            )}
          </Button>
          <Link
            href="/snapshot"
            className="shrink-0 font-display text-lg tracking-wide text-white-mint sm:text-xl"
          >
            949<span className="text-mint">Fantasy</span>
          </Link>
          {navExpanded ? (
            <nav
              className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1 sm:gap-2"
              aria-label="Primary"
            >
              {primaryNav.map(({ href, label }) => {
                const active =
                  pathname === href ||
                  pathname.startsWith(`${href}/`) ||
                  (href === "/performance" && pathname === "/playertape")
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "shrink-0 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                      active
                        ? "bg-mint/15 text-mint"
                        : "text-slate-text hover:bg-muted/40 hover:text-white-mint"
                    )}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
          ) : (
            <div className="flex flex-1 items-center justify-end gap-2">
              <span className="sr-only">Navigation collapsed</span>
              <Menu className="size-4 text-slate-text" aria-hidden />
            </div>
          )}
        </div>
        {navExpanded && subLinks.length > 0 && (
          <nav
            className="flex flex-wrap gap-1 border-b border-divider/40 bg-green-900/50 px-3 py-2 sm:px-4"
            aria-label="Section"
          >
            {subLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium sm:text-sm",
                  isSubNavActive(pathname, item)
                    ? "bg-mint/10 text-mint"
                    : "text-slate-text hover:text-white-mint"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="flex flex-1 flex-col border-divider bg-gradient-to-b from-surface to-deep-green/25">
        {children}
      </main>
    </div>
  )
}
