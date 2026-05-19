import {
  BarChart3,
  Binary,
  Gauge,
  LineChart,
  Sparkles,
  Users,
} from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Premium weekly rankings",
    description:
      "Position-aware boards with tiers, projected points, and weekly movement so you always know who is rising or sliding.",
    icon: BarChart3,
  },
  {
    title: "Projections with range",
    description:
      "Floor, median, and ceiling bands that communicate uncertainty honestly — not false precision.",
    icon: Gauge,
  },
  {
    title: "Trends and history",
    description:
      "Multi-year usage and scoring context to spot role changes before they show up in the box score.",
    icon: LineChart,
  },
  {
    title: "Start / Sit intelligence",
    description:
      "Lineup decisions grounded in matchup, volatility, and comparable-player context — not gut feel alone.",
    icon: Users,
  },
  {
    title: "Draft value discovery",
    description:
      "Heatmap-style availability thinking and value pockets by draft slot — built for 10- and 12-team rooms.",
    icon: Binary,
  },
  {
    title: "Deep player pages",
    description:
      "Usage, matchup grades, boom/bust, risk, and the 949 interpretation layer on every profile.",
    icon: Sparkles,
  },
] as const;

export function FeatureGrid() {
  return (
    <section id="features" className="bg-deep-green/35 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-4xl tracking-tight text-white-mint sm:text-5xl">
            Built for the full season
          </h2>
          <p className="mt-3 text-lg text-slate-text">
            Rankings are table stakes. 949Fantasy is the layer that helps you
            understand value, volatility, and when to press your edge.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {features.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              className="border-divider bg-surface/40 transition-colors hover:border-mint/30 hover:ring-1 hover:ring-mint/10"
            >
              <CardHeader className="gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-divider bg-deep-green/60 text-mint">
                  <Icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-lg text-white-mint">{title}</CardTitle>
                <CardDescription className="text-base leading-relaxed text-slate-text">
                  {description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
