import {
  DEMO_CURRENT_WEEK,
  DEMO_ROSTER_PERSONAS,
  DEMO_STARTER_SLOTS,
  type DemoTeamWeek,
} from "@/lib/demo-roster";

export type ScoringFormat = "ppr" | "half_ppr" | "std";

type SleeperStatLine = Record<string, number | undefined>;

const PTS_KEY: Record<ScoringFormat, keyof SleeperStatLine> = {
  ppr: "pts_ppr",
  half_ppr: "pts_half_ppr",
  std: "pts_std",
};

function readPoints(line: SleeperStatLine | undefined, scoring: ScoringFormat) {
  if (!line) return null;
  const key = PTS_KEY[scoring];
  const value = line[key];
  return typeof value === "number" && Number.isFinite(value) ? +value.toFixed(2) : null;
}

export async function fetchSleeperWeekStats(season: number, week: number) {
  const response = await fetch(
    `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      error: `Sleeper stats request failed for week ${week}`,
    };
  }

  const payload = (await response.json()) as Record<string, SleeperStatLine>;
  return { ok: true as const, status: response.status, week, payload };
}

export async function buildDemoRosterStats(options?: {
  season?: number;
  throughWeek?: number;
  scoring?: ScoringFormat;
}) {
  const season = options?.season ?? 2025;
  const throughWeek = options?.throughWeek ?? DEMO_CURRENT_WEEK;
  const scoring = options?.scoring ?? "ppr";

  const weekResults = await Promise.all(
    Array.from({ length: throughWeek }, (_, i) => fetchSleeperWeekStats(season, i + 1)),
  );

  const failed = weekResults.find((r) => !r.ok);
  if (failed && !failed.ok) {
    return {
      ok: false as const,
      error: failed.error,
      status: failed.status,
    };
  }

  const players: Record<
    string,
    {
      sleeperId: string;
      name: string;
      weeks: Record<number, number>;
      traj: number[];
      actual: number | null;
    }
  > = {};

  for (const persona of DEMO_ROSTER_PERSONAS) {
    const weeks: Record<number, number> = {};
    const traj: number[] = [];

    for (let wk = 1; wk <= throughWeek; wk++) {
      const weekPayload = weekResults[wk - 1];
      if (!weekPayload.ok) continue;
      const pts = readPoints(weekPayload.payload[persona.sleeperId], scoring);
      if (pts != null) {
        weeks[wk] = pts;
        traj.push(pts);
      }
    }

    const actual = weeks[DEMO_CURRENT_WEEK] ?? weeks[throughWeek] ?? null;

    players[persona.id] = {
      sleeperId: persona.sleeperId,
      name: persona.name,
      weeks,
      traj,
      actual,
    };
  }

  const teamWeeks: DemoTeamWeek[] = [];
  for (let wk = 1; wk <= throughWeek; wk++) {
    const row: DemoTeamWeek = { wk };
    let starterTotal = 0;
    let hasLive = false;

    for (const { slot, id } of DEMO_STARTER_SLOTS) {
      const pts = players[id]?.weeks[wk];
      if (pts != null) {
        row[slot] = pts;
        starterTotal += pts;
        hasLive = true;
      }
    }

    if (hasLive) {
      row.total = +starterTotal.toFixed(2);
    }
    teamWeeks.push(row);
  }

  return {
    ok: true as const,
    season,
    throughWeek,
    scoring,
    provider: "sleeper_public_api",
    currentWeek: DEMO_CURRENT_WEEK,
    players,
    teamWeeks,
  };
}
