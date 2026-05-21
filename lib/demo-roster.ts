/**
 * Fixed demo franchise personas — IDs and display names stay mock;
 * live stats are merged by `sleeperId` in /api/nfl/roster-stats.
 */
export type DemoRosterPersona = {
  id: string;
  name: string;
  pos: string;
  team: string;
  sleeperId: string;
};

export const DEMO_CURRENT_WEEK = 10;
export const DEMO_SEASON = 2025;

/** Starters in lineup slot order (DST/K still mocked in team weeks). */
export const DEMO_STARTER_SLOTS: { slot: "QB" | "RB1" | "RB2" | "WR1" | "WR2" | "FLEX" | "TE"; id: string }[] = [
  { slot: "QB", id: "jallen" },
  { slot: "RB1", id: "cmcaff" },
  { slot: "RB2", id: "saquon" },
  { slot: "WR1", id: "jchase" },
  { slot: "WR2", id: "puka" },
  { slot: "FLEX", id: "amon" },
  { slot: "TE", id: "kelce" },
];

export type DemoTeamWeek = {
  wk: number;
  QB?: number;
  RB1?: number;
  RB2?: number;
  WR1?: number;
  WR2?: number;
  FLEX?: number;
  TE?: number;
  DST?: number;
  K?: number;
  total?: number;
};

export const DEMO_ROSTER_PERSONAS: DemoRosterPersona[] = [
  { id: "jallen", name: "Josh Allen", pos: "QB", team: "BUF", sleeperId: "4984" },
  { id: "cmcaff", name: "Christian McCaffrey", pos: "RB", team: "SF", sleeperId: "4034" },
  { id: "saquon", name: "Saquon Barkley", pos: "RB", team: "PHI", sleeperId: "4866" },
  { id: "jchase", name: "Ja'Marr Chase", pos: "WR", team: "CIN", sleeperId: "7564" },
  { id: "puka", name: "Puka Nacua", pos: "WR", team: "LAR", sleeperId: "9493" },
  { id: "amon", name: "Amon-Ra St. Brown", pos: "WR", team: "DET", sleeperId: "7547" },
  { id: "kelce", name: "Travis Kelce", pos: "TE", team: "KC", sleeperId: "1466" },
  { id: "henry", name: "Derrick Henry", pos: "RB", team: "BAL", sleeperId: "3198" },
  { id: "smith", name: "DeVonta Smith", pos: "WR", team: "PHI", sleeperId: "7525" },
];

export const DEMO_ROSTER_IDS = DEMO_ROSTER_PERSONAS.map((p) => p.id);
