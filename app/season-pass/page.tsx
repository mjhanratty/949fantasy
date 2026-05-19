import Link from "next/link";

import { SiteShell } from "@/components/marketing/site-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SeasonPassPage() {
  return (
    <SiteShell>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-24">
        <div className="max-w-md text-center">
          <h1 className="font-display text-4xl text-white-mint">Season pass</h1>
          <p className="mt-4 text-slate-text">
            Checkout and accounts are not wired up yet. Check back soon for the $9.49
            season pass.
          </p>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "mt-8 inline-flex border-divider"
            )}
          >
            Back to home
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
