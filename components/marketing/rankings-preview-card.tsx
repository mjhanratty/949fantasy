import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const previewRows = [
  {
    player: "Josh Allen",
    pos: "QB",
    tier: "T1",
    proj: "24.2",
    delta: "+1.8",
    matchup: "↑ BUF @ MIA",
    risk: "Low",
  },
  {
    player: "Saquon Barkley",
    pos: "RB",
    tier: "T1",
    proj: "19.4",
    delta: "+0.6",
    matchup: "PHI vs NYG",
    risk: "Med",
  },
  {
    player: "Ja'Marr Chase",
    pos: "WR",
    tier: "T1",
    proj: "21.1",
    delta: "+2.4",
    matchup: "↑ CIN vs CLE",
    risk: "Low",
  },
  {
    player: "Bijan Robinson",
    pos: "RB",
    tier: "T2",
    proj: "17.8",
    delta: "−0.9",
    matchup: "ATL @ NO",
    risk: "Med",
  },
  {
    player: "CeeDee Lamb",
    pos: "WR",
    tier: "T2",
    proj: "16.5",
    delta: "+0.3",
    matchup: "DAL vs WAS",
    risk: "Med",
  },
  {
    player: "Travis Kelce",
    pos: "TE",
    tier: "T1",
    proj: "15.8",
    delta: "+1.1",
    matchup: "↑ KC vs LV",
    risk: "Low",
  },
  {
    player: "Lamar Jackson",
    pos: "QB",
    tier: "T2",
    proj: "22.9",
    delta: "−0.4",
    matchup: "BAL @ PIT",
    risk: "Boom",
  },
  {
    player: "Garrett Wilson",
    pos: "WR",
    tier: "T3",
    proj: "13.2",
    delta: "+3.1",
    matchup: "↑ NYJ vs NE",
    risk: "Bust",
  },
  {
    player: "De'Von Achane",
    pos: "RB",
    tier: "T2",
    proj: "16.9",
    delta: "+2.0",
    matchup: "↑ MIA vs BUF",
    risk: "Boom",
  },
  {
    player: "George Kittle",
    pos: "TE",
    tier: "T2",
    proj: "12.4",
    delta: "−1.2",
    matchup: "SF @ SEA",
    risk: "Med",
  },
] as const;

function PosPill({ pos }: { pos: string }) {
  return (
    <Badge
      variant="outline"
      className="min-w-[2.25rem] justify-center border-divider bg-surface/80 px-2 py-0.5 text-[11px] font-semibold text-mint"
    >
      {pos}
    </Badge>
  );
}

function RiskLabel({ risk }: { risk: string }) {
  const tone =
    risk === "Low"
      ? "border-mint/40 bg-mint/10 text-mint"
      : risk === "Boom"
        ? "border-mint/50 bg-mint/15 text-white-mint"
        : risk === "Bust"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-divider bg-muted/40 text-slate-text";
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${tone}`}
    >
      {risk}
    </span>
  );
}

export function RankingsPreviewCard() {
  return (
    <section
      id="rankings-preview"
      className="border-b border-divider bg-surface py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-4xl tracking-tight text-white-mint sm:text-5xl">
            Edge Board preview
          </h2>
          <p className="mt-3 text-lg text-slate-text">
            Weekly rankings with projected points, movement, matchup context, and
            risk labels — the same signals you will get in product (sample data).
          </p>
        </div>

        <Card className="overflow-hidden border-divider bg-deep-green/50 ring-1 ring-mint/15">
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-mint to-transparent opacity-80" />
          <CardHeader className="border-b border-divider pb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-xl text-white-mint">
                  Rest-of-week · PPR
                </CardTitle>
                <CardDescription className="text-slate-text">
                  Tiers, projections, and weekly delta (illustrative).
                </CardDescription>
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-mint">
                Offense · Week 12
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left font-mono text-sm">
                <thead>
                  <tr className="border-b border-divider bg-surface/40 text-[11px] font-semibold uppercase tracking-wider text-slate-text">
                    <th className="px-4 py-3 font-medium">Player</th>
                    <th className="px-3 py-3 font-medium">Pos</th>
                    <th className="px-3 py-3 font-medium">Tier</th>
                    <th className="px-3 py-3 font-medium tabular-nums">Proj</th>
                    <th className="px-3 py-3 font-medium tabular-nums">Δ</th>
                    <th className="px-3 py-3 font-medium">Matchup</th>
                    <th className="px-4 py-3 font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr
                      key={row.player}
                      className="border-b border-divider/80 last:border-0 hover:bg-surface/30"
                    >
                      <td className="px-4 py-3 font-medium text-white-mint">
                        {row.player}
                      </td>
                      <td className="px-3 py-3">
                        <PosPill pos={row.pos} />
                      </td>
                      <td className="px-3 py-3 tabular-nums text-slate-text">
                        {row.tier}
                      </td>
                      <td className="px-3 py-3 tabular-nums font-semibold text-mint">
                        {row.proj}
                      </td>
                      <td
                        className={`px-3 py-3 tabular-nums font-medium ${row.delta.startsWith("+") ? "text-mint" : row.delta.startsWith("−") ? "text-slate-text" : "text-white-mint"}`}
                      >
                        {row.delta}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-text">{row.matchup}</td>
                      <td className="px-4 py-3">
                        <RiskLabel risk={row.risk} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
