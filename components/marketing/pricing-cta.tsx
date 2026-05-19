import Link from "next/link";
import { Check } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const bullets = [
  "Full Edge Board and weekly ranking updates",
  "Start/Sit Studio with floor — median — ceiling bands",
  "Draft board heatmaps and availability thinking",
  "Player pages with usage, matchup, and comparable context",
] as const;

export function PricingCTA() {
  return (
    <section id="pricing" className="border-t border-divider bg-gradient-to-b from-deep-green to-surface py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-2xl border border-divider bg-deep-green/60 p-8 shadow-[0_0_0_1px_rgba(149,249,174,0.06)] ring-1 ring-mint/10 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-12">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">
              Season pass
            </p>
            <h2 className="font-display text-4xl tracking-tight text-white-mint sm:text-5xl">
              Serious insight.
              <span className="block text-mint">Approachable price.</span>
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-slate-text">
              Unlock the full 949Fantasy board, tools, and player intelligence for
              the entire season — one simple pass.
            </p>
            <Separator className="max-w-sm bg-divider" />
            <ul className="flex flex-col gap-3 text-slate-text">
              {bullets.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-snug">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/15 text-mint">
                    <Check className="size-3" aria-hidden />
                  </span>
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center gap-6 rounded-xl border border-divider bg-surface/70 p-6 sm:p-8">
            <div>
              <p className="text-sm font-medium text-slate-text">949Fantasy</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-6xl text-mint sm:text-7xl">$9.49</span>
                <span className="text-sm text-slate-text">/ season</span>
              </div>
              <p className="mt-2 text-sm text-slate-text">
                One-time season pass for the full fantasy season. No hidden tiers on
                launch.
              </p>
            </div>
            <Link
              href="/season-pass"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "h-12 w-full justify-center text-base sm:w-auto sm:self-start sm:px-10"
              )}
            >
              Get season pass
            </Link>
            <p className="text-xs leading-relaxed text-slate-text">
              Billing and account flows ship next. This page is a static preview
              only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
