import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AnalyticsMotif({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="400" y2="0">
          <stop stopColor="#95F9AE" stopOpacity="0" />
          <stop offset="0.35" stopColor="#95F9AE" stopOpacity="0.55" />
          <stop offset="0.65" stopColor="#95F9AE" stopOpacity="0.25" />
          <stop offset="1" stopColor="#95F9AE" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 140 Q60 120 100 130 T200 100 T300 115 T400 90"
        stroke="url(#lineGrad)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 165 Q80 150 140 160 T260 135 T400 125"
        stroke="#2A4A37"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 110 Q50 95 120 105 T240 75 T400 55"
        stroke="#95F9AE"
        strokeOpacity="0.2"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const scoringFormats = ["PPR", "Half PPR", "Standard"] as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-divider bg-gradient-to-b from-deep-green via-deep-green/95 to-surface">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `linear-gradient(#2A4A37 1px, transparent 1px), linear-gradient(90deg, #2A4A37 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">
            Fantasy intelligence platform
          </p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-white-mint sm:text-6xl lg:text-7xl">
            Sharper signal.
            <span className="block text-mint">Better decisions.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-text">
            Go beyond static rankings with floor and ceiling ranges, positional
            value, weekly trends, and start/sit context — an interpretation layer
            built for serious fantasy players.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#rankings-preview"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "h-11 px-6 text-base justify-center"
              )}
            >
              View Edge Board
            </Link>
            <Link
              href="#features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 border-divider bg-surface/30 px-6 text-base text-white-mint hover:bg-muted/50 hover:text-white-mint justify-center"
              )}
            >
              How it works
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-text">
              Scoring
            </span>
            {scoringFormats.map((label) => (
              <span
                key={label}
                className="rounded-full border border-divider bg-surface/60 px-3 py-1 text-xs font-medium text-white-mint"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="relative flex min-h-[220px] items-end justify-center lg:min-h-[320px]">
          <AnalyticsMotif className="absolute inset-x-0 bottom-0 h-48 w-full max-w-md opacity-90 lg:h-56" />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-divider bg-surface/80 p-5 shadow-[0_0_0_1px_rgba(149,249,174,0.08)] ring-1 ring-mint/10 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-mint">
                Live preview
              </p>
              <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[10px] font-medium text-mint">
                Week 12 · PPR
              </span>
            </div>
            <div className="space-y-3">
              {[
                { name: "J. Jefferson", pts: "22.4", band: "14 — 28" },
                { name: "B. Robinson", pts: "17.1", band: "11 — 23" },
                { name: "T. Kelce", pts: "15.8", band: "9 — 21" },
              ].map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between gap-3 border-b border-divider/60 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white-mint">{row.name}</p>
                    <p className="text-xs text-slate-text">Floor — ceiling (70% band)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-mint">{row.pts}</p>
                    <p className="text-[11px] tabular-nums text-slate-text">{row.band}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
