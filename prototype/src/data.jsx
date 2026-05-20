// Mock fantasy football data — Week 11, 2026 season context

const TEAMS = {
  KC: { name: "Kansas City", color: "#E31837" },
  BUF: { name: "Buffalo", color: "#00338D" },
  PHI: { name: "Philadelphia", color: "#004C54" },
  SF:  { name: "San Francisco", color: "#AA0000" },
  DAL: { name: "Dallas", color: "#003594" },
  MIA: { name: "Miami", color: "#008E97" },
  CIN: { name: "Cincinnati", color: "#FB4F14" },
  BAL: { name: "Baltimore", color: "#241773" },
  DET: { name: "Detroit", color: "#0076B6" },
  GB:  { name: "Green Bay", color: "#203731" },
  MIN: { name: "Minnesota", color: "#4F2683" },
  LAR: { name: "L.A. Rams", color: "#003594" },
  HOU: { name: "Houston", color: "#03202F" },
  NYJ: { name: "N.Y. Jets", color: "#125740" },
  ATL: { name: "Atlanta", color: "#A71930" },
  CHI: { name: "Chicago", color: "#0B162A" },
  TB:  { name: "Tampa Bay", color: "#D50A0A" },
  IND: { name: "Indianapolis", color: "#002C5F" },
  NO:  { name: "New Orleans", color: "#D3BC8D" },
  SEA: { name: "Seattle",    color: "#002244" },
};

function traj(seed, base, vol, trend = 0) {
  const out = [];
  let v = base;
  let rng = seed;
  for (let i = 0; i < 12; i++) {
    rng = (rng * 9301 + 49297) % 233280;
    const r = rng / 233280;
    v = v + (r - 0.5) * vol + trend;
    out.push(Math.max(0, +v.toFixed(1)));
  }
  return out;
}

const PLAYERS = [
  // QBs
  { id: "jallen",  name: "Josh Allen",       pos: "QB", team: "BUF", num: 17, age: 29, proj: 24.8, actual: 28.4, rank: 1,  prev: 1,  ros: 412.5, own: 99.8, trend: "up",   risk: "low",   adp: 12,  round: 2,  matchup: "vs KC", matchupRating: 4, traj: traj(11, 23, 5,  0.2),  notes: "Elite ceiling vs top-5 defense; weather clear.", boom: 62, bust: 12, snap: 100, tgt: 0, rush: 9.2, news: "Listed full participation Thursday.", ceiling: 36, floor: 18 },
  { id: "lamar",   name: "Lamar Jackson",    pos: "QB", team: "BAL", num: 8,  age: 28, proj: 23.2, actual: 19.6, rank: 2,  prev: 3,  ros: 388.1, own: 99.5, trend: "up",   risk: "low",   adp: 18,  round: 2,  matchup: "@CIN", matchupRating: 3, traj: traj(7,  22, 4,  0.4),  notes: "Bounce-back spot after slow road game.", boom: 58, bust: 14, snap: 100, tgt: 0, rush: 11.4, news: "Cleared from injury report.", ceiling: 34, floor: 17 },
  { id: "burrow",  name: "Joe Burrow",       pos: "QB", team: "CIN", num: 9,  age: 28, proj: 21.4, actual: 25.1, rank: 3,  prev: 4,  ros: 372.3, own: 98.9, trend: "up",   risk: "med",   adp: 32,  round: 3,  matchup: "vs BAL", matchupRating: 3, traj: traj(14, 21, 6,  0.3),  notes: "Volume is back — 42 attempts last two weeks.", boom: 54, bust: 18, snap: 100, tgt: 0, rush: 1.4, news: "Wrist tendinitis monitored, no game impact.", ceiling: 32, floor: 15 },
  { id: "hurts",   name: "Jalen Hurts",      pos: "QB", team: "PHI", num: 1,  age: 27, proj: 22.6, actual: 21.0, rank: 4,  prev: 2,  ros: 365.8, own: 99.7, trend: "down", risk: "low",   adp: 24,  round: 2,  matchup: "vs DAL", matchupRating: 5, traj: traj(21, 23, 4, -0.1),  notes: "Tush-push TDs floor; division revenge spot.", boom: 49, bust: 11, snap: 100, tgt: 0, rush: 9.8, news: "Fully healthy, full week of practice.", ceiling: 33, floor: 16 },

  // RBs
  { id: "cmcaff",  name: "Christian McCaffrey", pos: "RB", team: "SF",  num: 23, age: 29, proj: 22.1, actual: 18.2, rank: 1, prev: 1, ros: 295.4, own: 100, trend: "flat", risk: "med",   adp: 1,   round: 1, matchup: "@SEA", matchupRating: 3, traj: traj(3,  21, 6,  -0.2), notes: "Workload managed but still RB1 floor.", boom: 51, bust: 16, snap: 78, tgt: 5.4, rush: 18.2, news: "Probable — calf maintenance.", ceiling: 32, floor: 13 },
  { id: "bijan",   name: "Bijan Robinson",   pos: "RB", team: "ATL", num: 7,  age: 23, proj: 19.4, actual: 24.0, rank: 2,  prev: 4,  ros: 268.7, own: 99.9, trend: "up",   risk: "low",   adp: 4,   round: 1,  matchup: "vs CHI", matchupRating: 5, traj: traj(45, 16, 5,  0.6),  notes: "Touch share over 80% in 4 of last 5.", boom: 56, bust: 12, snap: 82, tgt: 4.8, rush: 17.6, news: "No injury designation.", ceiling: 30, floor: 12 },
  { id: "saquon",  name: "Saquon Barkley",   pos: "RB", team: "PHI", num: 26, age: 28, proj: 20.2, actual: 16.4, rank: 3,  prev: 2,  ros: 271.1, own: 100, trend: "down", risk: "med",   adp: 3,   round: 1,  matchup: "vs DAL", matchupRating: 4, traj: traj(8,  19, 7,  -0.3), notes: "Workload trending down vs game scripts.", boom: 48, bust: 22, snap: 71, tgt: 3.1, rush: 17.0, news: "Limited Wednesday, full Thursday.", ceiling: 28, floor: 10 },
  { id: "henry",   name: "Derrick Henry",    pos: "RB", team: "BAL", num: 22, age: 31, proj: 17.8, actual: 21.6, rank: 4,  prev: 6,  ros: 251.0, own: 99.8, trend: "up",   risk: "med",   adp: 9,   round: 2,  matchup: "@CIN", matchupRating: 4, traj: traj(99, 17, 6,  0.4),  notes: "Workhorse role in plus matchup.", boom: 47, bust: 20, snap: 64, tgt: 1.2, rush: 21.4, news: "Healthy.", ceiling: 28, floor: 9 },
  { id: "jacobs",  name: "Josh Jacobs",      pos: "RB", team: "GB",  num: 8,  age: 27, proj: 16.4, actual: 13.0, rank: 5,  prev: 5,  ros: 232.8, own: 99.0, trend: "flat", risk: "med",   adp: 22,  round: 3,  matchup: "vs CHI", matchupRating: 4, traj: traj(33, 15, 5,  0.0),  notes: "Goal-line work locked in.", boom: 41, bust: 24, snap: 68, tgt: 2.6, rush: 16.8, news: "Probable — knee.", ceiling: 25, floor: 7 },
  { id: "kamara",  name: "Alvin Kamara",     pos: "RB", team: "NO",  num: 41, age: 30, proj: 14.1, actual: 11.4, rank: 8,  prev: 7,  ros: 198.4, own: 96.8, trend: "down", risk: "high",  adp: 28,  round: 3,  matchup: "@LAR", matchupRating: 2, traj: traj(60, 14, 6,  -0.4), notes: "Tough matchup; receiving floor only.", boom: 32, bust: 30, snap: 70, tgt: 5.8, rush: 12.4, news: "Questionable — hip.", ceiling: 22, floor: 5 },

  // WRs
  { id: "jchase",  name: "Ja'Marr Chase",    pos: "WR", team: "CIN", num: 1,  age: 25, proj: 19.7, actual: 26.2, rank: 1,  prev: 1,  ros: 268.9, own: 100, trend: "up",   risk: "low",   adp: 2,   round: 1,  matchup: "vs BAL", matchupRating: 4, traj: traj(2,  19, 6,  0.5),  notes: "Target share 32% — alpha role unchallenged.", boom: 62, bust: 14, snap: 92, tgt: 11.4, rush: 0, news: "Healthy.", ceiling: 32, floor: 11 },
  { id: "jjeff",   name: "Justin Jefferson", pos: "WR", team: "MIN", num: 18, age: 26, proj: 18.6, actual: 14.2, rank: 2,  prev: 2,  ros: 254.7, own: 100, trend: "down", risk: "low",   adp: 5,   round: 1,  matchup: "@DET", matchupRating: 4, traj: traj(17, 18, 7,  -0.1), notes: "QB play has capped ceiling.", boom: 55, bust: 18, snap: 95, tgt: 10.2, rush: 0, news: "Healthy.", ceiling: 30, floor: 8 },
  { id: "ceeded",  name: "CeeDee Lamb",      pos: "WR", team: "DAL", num: 88, age: 26, proj: 17.4, actual: 12.8, rank: 3,  prev: 3,  ros: 234.2, own: 99.9, trend: "flat", risk: "med",   adp: 6,   round: 1,  matchup: "@PHI", matchupRating: 2, traj: traj(88, 17, 6,  -0.2), notes: "Shadow coverage likely on the road.", boom: 49, bust: 22, snap: 94, tgt: 11.8, rush: 0.4, news: "Healthy.", ceiling: 28, floor: 7 },
  { id: "amon",    name: "Amon-Ra St. Brown", pos: "WR", team: "DET", num: 14, age: 26, proj: 16.8, actual: 20.4, rank: 4,  prev: 6,  ros: 225.8, own: 99.8, trend: "up",   risk: "low",   adp: 11,  round: 2,  matchup: "vs MIN", matchupRating: 4, traj: traj(54, 16, 5,  0.3),  notes: "Goff connection has been elite this stretch.", boom: 52, bust: 16, snap: 88, tgt: 10.0, rush: 0, news: "Healthy.", ceiling: 27, floor: 9 },
  { id: "hill",    name: "Tyreek Hill",      pos: "WR", team: "MIA", num: 10, age: 31, proj: 15.4, actual: 8.6,  rank: 6,  prev: 4,  ros: 218.0, own: 99.5, trend: "down", risk: "high",  adp: 7,   round: 1,  matchup: "@HOU", matchupRating: 3, traj: traj(10, 18, 8,  -0.8), notes: "Volatile — Tua status driving variance.", boom: 44, bust: 36, snap: 84, tgt: 8.4,  rush: 1.2, news: "Wrist soreness — full practice Thursday.", ceiling: 28, floor: 5 },
  { id: "puka",    name: "Puka Nacua",       pos: "WR", team: "LAR", num: 17, age: 24, proj: 17.6, actual: 23.0, rank: 5,  prev: 8,  ros: 233.2, own: 99.6, trend: "up",   risk: "low",   adp: 14,  round: 2,  matchup: "vs NO", matchupRating: 5, traj: traj(72, 16, 6,  0.5),  notes: "Target monster — 30%+ share since Week 6.", boom: 56, bust: 14, snap: 90, tgt: 10.8, rush: 0, news: "Healthy.", ceiling: 30, floor: 9 },
  { id: "drake",   name: "Drake London",     pos: "WR", team: "ATL", num: 5,  age: 24, proj: 14.6, actual: 11.0, rank: 8,  prev: 9,  ros: 198.2, own: 98.1, trend: "flat", risk: "med",   adp: 21,  round: 3,  matchup: "vs CHI", matchupRating: 4, traj: traj(82, 14, 6,  0.0),  notes: "Solid floor, ceiling capped by Cousins.", boom: 39, bust: 24, snap: 92, tgt: 9.2,  rush: 0, news: "Healthy.", ceiling: 22, floor: 7 },
  { id: "smith",   name: "DeVonta Smith",    pos: "WR", team: "PHI", num: 6,  age: 27, proj: 13.2, actual: 9.8,  rank: 12, prev: 11, ros: 178.6, own: 96.2, trend: "down", risk: "med",   adp: 38,  round: 4,  matchup: "vs DAL", matchupRating: 3, traj: traj(63, 13, 6,  -0.1), notes: "Touchdown-dependent in this offense.", boom: 36, bust: 30, snap: 86, tgt: 7.4,  rush: 0, news: "Healthy.", ceiling: 22, floor: 5 },

  // TEs
  { id: "kelce",   name: "Travis Kelce",     pos: "TE", team: "KC",  num: 87, age: 36, proj: 11.2, actual: 14.8, rank: 1,  prev: 2,  ros: 158.4, own: 99.4, trend: "up",   risk: "med",   adp: 35,  round: 4,  matchup: "@BUF", matchupRating: 3, traj: traj(87, 11, 4,  0.2),  notes: "Red-zone share rebounding — TD upside.", boom: 41, bust: 26, snap: 84, tgt: 8.2, rush: 0, news: "Healthy.", ceiling: 22, floor: 4 },
  { id: "lakers",  name: "Sam LaPorta",      pos: "TE", team: "DET", num: 87, age: 24, proj: 10.4, actual: 12.0, rank: 2,  prev: 3,  ros: 144.7, own: 98.6, trend: "up",   risk: "low",   adp: 41,  round: 5,  matchup: "vs MIN", matchupRating: 4, traj: traj(44, 10, 4,  0.1),  notes: "Steady contributor; goal-line magnet.", boom: 38, bust: 22, snap: 80, tgt: 6.8, rush: 0, news: "Healthy.", ceiling: 18, floor: 4 },
  { id: "andrews", name: "Mark Andrews",     pos: "TE", team: "BAL", num: 89, age: 30, proj: 9.6,  actual: 6.4,  rank: 5,  prev: 4,  ros: 132.1, own: 96.8, trend: "down", risk: "med",   adp: 52,  round: 6,  matchup: "@CIN", matchupRating: 3, traj: traj(89, 10, 5,  -0.3), notes: "Snap share fluctuating with Likely usage.", boom: 30, bust: 32, snap: 64, tgt: 5.4, rush: 0, news: "Healthy.", ceiling: 18, floor: 3 },
];

// Roster (your team)
const ROSTER_IDS = ["jallen", "cmcaff", "saquon", "jchase", "puka", "amon", "kelce", "henry", "smith"];
const STARTER_IDS = ["jallen", "cmcaff", "saquon", "jchase", "puka", "amon", "kelce"]; // 7 starters + DST + K
const BENCH_IDS = ["henry", "smith"]; // bench

// League scoring slots
const LEAGUE_SLOTS = ["QB", "RB", "RB", "WR", "WR", "FLEX", "TE", "DST", "K"];

// Per-week per-position scores for your team — 10 played weeks
const TEAM_POSITION_WEEKS = [
  { wk: 1,  QB: 24.2, RB1: 22.1, RB2: 14.8, WR1: 18.4, WR2: 12.0, FLEX: 11.2, TE: 13.5, DST: 7.5, K: 4.7, total: 128.4, opp: 112.3, w: true,  proj: 124.0, oppProj: 118.0 },
  { wk: 2,  QB: 28.1, RB1: 25.4, RB2: 16.2, WR1: 21.8, WR2: 14.4, FLEX: 12.8, TE: 11.0, DST: 8.0, K: 5.1, total: 142.8, opp: 98.2,  w: true,  proj: 126.0, oppProj: 119.0 },
  { wk: 3,  QB: 17.4, RB1: 16.8, RB2: 12.4, WR1: 14.2, WR2:  8.6, FLEX:  9.2, TE:  8.8, DST: 5.0, K: 3.7, total: 96.1,  opp: 118.0, w: false, proj: 128.0, oppProj: 115.0 },
  { wk: 4,  QB: 26.5, RB1: 19.2, RB2: 18.6, WR1: 17.4, WR2: 13.2, FLEX: 12.0, TE: 16.1, DST: 6.0, K: 5.2, total: 134.2, opp: 121.5, w: true,  proj: 122.0, oppProj: 117.0 },
  { wk: 5,  QB: 31.8, RB1: 28.0, RB2: 19.4, WR1: 22.6, WR2: 17.8, FLEX: 15.4, TE: 12.4, DST: 4.5, K: 4.8, total: 156.7, opp: 132.0, w: true,  proj: 128.0, oppProj: 121.0 },
  { wk: 6,  QB: 19.6, RB1: 14.2, RB2: 11.0, WR1: 16.8, WR2:  9.4, FLEX: 10.8, TE: 17.0, DST: 6.5, K: 4.1, total: 109.4, opp: 124.6, w: false, proj: 127.0, oppProj: 118.0 },
  { wk: 7,  QB: 25.6, RB1: 24.8, RB2: 15.4, WR1: 19.4, WR2: 12.8, FLEX: 13.6, TE: 14.2, DST: 7.5, K: 4.7, total: 138.0, opp: 105.1, w: true,  proj: 125.0, oppProj: 119.0 },
  { wk: 8,  QB: 22.0, RB1: 21.6, RB2: 13.8, WR1: 18.2, WR2: 11.0, FLEX: 11.4, TE: 11.6, DST: 6.5, K: 5.1, total: 121.2, opp: 119.8, w: true,  proj: 126.0, oppProj: 118.0 },
  { wk: 9,  QB: 29.4, RB1: 26.2, RB2: 17.6, WR1: 22.4, WR2: 15.6, FLEX: 14.0, TE: 13.4, DST: 4.5, K: 4.8, total: 147.9, opp: 110.4, w: true,  proj: 124.0, oppProj: 117.0 },
  { wk: 10, QB: 18.4, RB1: 16.0, RB2:  9.6, WR1: 15.4, WR2:  8.8, FLEX: 10.4, TE: 12.0, DST: 7.0, K: 5.0, total: 102.6, opp: 128.4, w: false, proj: 127.0, oppProj: 120.0 },
];

// Future-week projections (W11-W14 projected only)
const TEAM_FUTURE_WEEKS = [
  { wk: 11, proj: 132.4, oppProj: 118.4 },
  { wk: 12, proj: 134.0, oppProj: 116.0 },
  { wk: 13, proj: 128.0, oppProj: 122.0 },
  { wk: 14, proj: 131.0, oppProj: 117.0 },
];

// Expected vs actual season totals per position group (Image 1 blocks)
const POSITION_PERFORMANCE = {
  QB:   { expected: 22.5, actual: 24.3, starters: 1, slotLabel: "QB",   color: "#F2C94C" },
  RB:   { expected: 17.8, actual: 18.6, starters: 2, slotLabel: "RB",   color: "#95F9AE" },
  WR:   { expected: 16.4, actual: 14.8, starters: 2, slotLabel: "WR",   color: "#7BD9F4" },
  TE:   { expected: 11.0, actual: 13.0, starters: 1, slotLabel: "TE",   color: "#D9A6F4" },
  FLEX: { expected: 13.4, actual: 12.0, starters: 1, slotLabel: "FLEX", color: "#D9FFE4" },
  DST:  { expected:  7.2, actual:  6.3, starters: 1, slotLabel: "DST",  color: "#FF9E5E" },
  K:    { expected:  6.8, actual:  4.7, starters: 1, slotLabel: "K",    color: "#A6B7AC" },
};

// League positional averages by week (for heatmap "league" mode)
// Each array: avg points per starter at that position across all league teams
const LEAGUE_POS_AVG = {
  QB:  [20.2, 22.8, 18.4, 21.6, 24.0, 19.2, 22.4, 20.0, 23.2, 19.6],
  RB:  [14.6, 16.2, 13.0, 15.4, 17.8, 13.4, 15.0, 14.8, 16.6, 13.2],
  WR:  [13.4, 15.0, 12.4, 14.0, 16.2, 12.8, 14.4, 13.6, 15.2, 12.0],
  TE:  [ 9.6, 10.2,  8.4,  9.8, 11.4,  8.6,  9.4,  9.0, 10.6,  8.2],
  FLEX:[12.0, 13.8, 10.8, 12.6, 14.4, 11.0, 12.4, 11.8, 13.2, 10.8],
  DST: [ 6.4,  7.2,  5.8,  6.6,  7.0,  6.2,  6.8,  6.0,  6.4,  6.0],
  K:   [ 7.0,  7.8,  6.2,  7.4,  8.0,  6.6,  7.2,  6.8,  7.6,  6.4],
};

// League standings — 12 teams
const LEAGUE_STANDINGS = [
  { id: "you",   name: "The Vector Reapers",       owner: "You",        w: 7, l: 3, pf: 1277, pa: 1168, streak: "L1", rank: 2 },
  { id: "t01",   name: "Dynasty Warriors",         owner: "Mike S.",    w: 8, l: 2, pf: 1314, pa: 1142, streak: "W3", rank: 1 },
  { id: "t02",   name: "Saquon Family Robinson",   owner: "Alex P.",    w: 6, l: 4, pf: 1224, pa: 1198, streak: "W1", rank: 3 },
  { id: "t03",   name: "Bijan Mustard",            owner: "Jamie L.",   w: 6, l: 4, pf: 1198, pa: 1184, streak: "W2", rank: 4 },
  { id: "t04",   name: "Allen Wrenches",           owner: "Sam T.",     w: 5, l: 5, pf: 1196, pa: 1212, streak: "L2", rank: 5 },
  { id: "t05",   name: "Multiple Scorgasms",       owner: "Chris D.",   w: 5, l: 5, pf: 1184, pa: 1206, streak: "W1", rank: 6 },
  { id: "t06",   name: "Lamb Chops",               owner: "Pat M.",     w: 5, l: 5, pf: 1172, pa: 1196, streak: "L1", rank: 7 },
  { id: "t07",   name: "Mahomies & Co.",           owner: "Tay R.",     w: 4, l: 6, pf: 1148, pa: 1224, streak: "L3", rank: 8 },
  { id: "t08",   name: "Justifiably Jefferson",    owner: "Quinn K.",   w: 4, l: 6, pf: 1142, pa: 1232, streak: "W1", rank: 9 },
  { id: "t09",   name: "Hurts So Good",            owner: "Robin V.",   w: 3, l: 7, pf: 1102, pa: 1248, streak: "L4", rank: 10 },
  { id: "t10",   name: "Punt God",                 owner: "Casey N.",   w: 3, l: 7, pf: 1088, pa: 1264, streak: "L2", rank: 11 },
  { id: "t11",   name: "Last Place Lizards",       owner: "Drew H.",    w: 2, l: 8, pf: 1042, pa: 1296, streak: "L5", rank: 12 },
];

// Daily news feed
const NEWS = [
  { tag: "INJ",     team: "MIA", text: "Tua Tagovailoa upgraded to full practice Thursday; expected to start.", time: "12m ago", severity: "warn" },
  { tag: "USAGE",   team: "PHI", text: "Saquon Barkley snap share dipped to 62% last week — second-half blowout context.", time: "47m ago", severity: "info" },
  { tag: "WEATHER", team: "BUF", text: "Kansas City @ Buffalo: clear skies, 38°F, 6mph wind. No weather concern.", time: "1h ago",  severity: "info" },
  { tag: "TARGET",  team: "ATL", text: "Drake London leads ATL in routes run since Week 7 — sustaining 28% target share.", time: "2h ago",  severity: "good" },
  { tag: "OUT",     team: "MIN", text: "TJ Hockenson ruled out (knee). Josh Oliver bumps to TE1 with red-zone role.", time: "3h ago",  severity: "bad"  },
];

// NFL cities for the Games map (Image 10)
// Coords are in the user-provided SVG's space: viewBox 0 0 2000 1200
// Lat/lng from stadium CSV → projected to SVG viewBox 2000×1200
const NFL_CITIES = [
  { team: "ARI", city: "Glendale", indoor: true, x: 551, y: 749 },
  { team: "ATL", city: "Atlanta", indoor: true, x: 1601, y: 739 },
  { team: "BAL", city: "Baltimore", indoor: true, x: 1894, y: 500 },
  { team: "BUF", city: "Orchard Park", indoor: true, x: 1813, y: 348 },
  { team: "CAR", city: "Charlotte", indoor: true, x: 1735, y: 676 },
  { team: "CHI", city: "Chicago", indoor: false, x: 1480, y: 388 },
  { team: "CIN", city: "Cincinnati", indoor: false, x: 1597, y: 508 },
  { team: "CLE", city: "Cleveland", indoor: false, x: 1703, y: 403 },
  { team: "DAL", city: "Arlington", indoor: true, x: 1123, y: 783 },
  { team: "DEN", city: "Denver", indoor: true, x: 824, y: 480 },
  { team: "DET", city: "Detroit", indoor: true, x: 1652, y: 367 },
  { team: "GB", city: "Green Bay", indoor: false, x: 1463, y: 274 },
  { team: "HOU", city: "Houston", indoor: true, x: 1186, y: 916 },
  { team: "IND", city: "Indianapolis", indoor: true, x: 1535, y: 479 },
  { team: "JAX", city: "Jacksonville", indoor: false, x: 1705, y: 888 },
  { team: "KC", city: "Kansas City", indoor: false, x: 1221, y: 510 },
  { team: "LAC", city: "San Diego", indoor: false, x: 368, y: 781 },
  { team: "LAR", city: "St. Louis", indoor: false, x: 1383, y: 528 },
  { team: "LV", city: "Las Vegas", indoor: true, x: 177, y: 566 },
  { team: "MIA", city: "Miami Gardens", indoor: false, x: 1758, y: 1077 },
  { team: "MIN", city: "Minneapolis", indoor: true, x: 1267, y: 253 },
  { team: "NE", city: "Foxborough", indoor: false, x: 1910, y: 378 },
  { team: "NO", city: "New Orleans", indoor: true, x: 1387, y: 904 },
  { team: "NYG", city: "East Rutherford", indoor: false, x: 1910, y: 433 },
  { team: "NYJ", city: "East Rutherford", indoor: false, x: 1910, y: 433 },
  { team: "PHI", city: "Philadelphia", indoor: false, x: 1910, y: 473 },
  { team: "PIT", city: "Pittsburgh", indoor: false, x: 1766, y: 449 },
  { team: "SEA", city: "Seattle", indoor: false, x: 172, y: 140 },
  { team: "SF", city: "Santa Clara", indoor: false, x: 170, y: 568 },
  { team: "TB", city: "Tampa", indoor: true, x: 1672, y: 990 },
  { team: "TEN", city: "Nashville", indoor: true, x: 1512, y: 635 },
  { team: "WAS", city: "Landover", indoor: false, x: 1885, y: 516 },
];

// Week 11 home club at shared venues (MetLife / LAC–LAR)
const WEEK11_HOME_AT_SHARED = { NYG: "NYJ", NYJ: "NYJ", LAC: "LAR", LAR: "LAR" };

const SHARED_STADIUM_GROUPS = [{ teams: ["NYG", "NYJ"] }, { teams: ["LAC", "LAR"] }];

function mapSiteForTeam(team, homeOverrides = WEEK11_HOME_AT_SHARED) {
  const group = SHARED_STADIUM_GROUPS.find((g) => g.teams.includes(team));
  if (!group) {
    const site = NFL_CITIES.find((c) => c.team === team);
    return { ...site, displayTeam: team };
  }
  const home = homeOverrides[team] ?? team;
  const site = NFL_CITIES.find((c) => c.team === home);
  return { ...site, displayTeam: home };
}

function buildMapMarkers(weekStatus, homeOverrides = WEEK11_HOME_AT_SHARED) {
  const statusRank = { you: 4, opp: 3, neutral: 2, off: 1 };
  const byKey = {};
  NFL_CITIES.forEach((city) => {
    const site = mapSiteForTeam(city.team, homeOverrides);
    const key = site.x + "," + site.y;
    const status = weekStatus[city.team] || "off";
    if (!byKey[key]) {
      byKey[key] = { ...site, team: site.displayTeam, teamsAtSite: [city.team], _status: status };
      return;
    }
    byKey[key].teamsAtSite.push(city.team);
    if ((statusRank[status] || 0) > (statusRank[byKey[key]._status] || 0)) byKey[key]._status = status;
    if (homeOverrides[city.team] === city.team || city.team === site.displayTeam) {
      byKey[key].team = site.displayTeam;
    }
  });
  return Object.values(byKey).map(({ _status, ...m }) => m);
}

// Per-week active locations for current week — used to color city dots
// "you" = your player there, "opp" = opponent's player there, "neutral" = a game but neither, "off" = bye
const WEEK11_GAMES = {
  KC: "you",   BUF: "you",  CIN: "you",  BAL: "you",  ATL: "you",
  PHI: "opp",  DAL: "opp",  GB: "neutral", CHI: "neutral", MIN: "neutral", DET: "neutral",
  HOU: "neutral", MIA: "neutral", SF: "you", SEA: "neutral",
  NO: "neutral", LAR: "you",
  CLE: "off", PIT: "off", IND: "off", LV: "off", LAC: "off", DEN: "off",
  CAR: "off", JAX: "off", TEN: "off", TB: "off", NE: "off", NYJ: "off",
  ARI: "off", WAS: "off",
};

const NFL_MAP_MARKERS = buildMapMarkers(WEEK11_GAMES, WEEK11_HOME_AT_SHARED);

Object.assign(window, {
  TEAMS, PLAYERS, NEWS,
  ROSTER_IDS, STARTER_IDS, BENCH_IDS, LEAGUE_SLOTS,
  TEAM_POSITION_WEEKS, TEAM_FUTURE_WEEKS,
  POSITION_PERFORMANCE, LEAGUE_POS_AVG, LEAGUE_STANDINGS,
  NFL_CITIES, WEEK11_GAMES, WEEK11_HOME_AT_SHARED, NFL_MAP_MARKERS, buildMapMarkers, mapSiteForTeam,
});

// ============================================================
// 18-week game log generator (Player Tape / candlesticks)
// ============================================================
const CURRENT_WEEK = 11;

// Possible opponents pool — used by schedule maker
const OPP_POOL = ["KC","BUF","PHI","SF","DAL","MIA","CIN","BAL","DET","GB","MIN","LAR","HOU","NYJ","ATL","CHI","TB","IND","NO","SEA"];
const INDOOR_TEAMS = new Set(["MIN","DET","NO","ATL","IND","DAL","HOU","ARI","LV","LAC"]);
const COLD_LATE_TEAMS = new Set(["BUF","GB","CHI","DEN","CLE","PIT","BAL","NYJ","NE","CIN","KC"]);

function rng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function makeGameLog(player) {
  const r = rng(player.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 17 + 41);
  const byeWeek = 5 + Math.floor(r() * 7); // bye somewhere W5-W11
  const log = [];

  // Cumulative schedule
  let opponentsUsed = new Set([player.team]);
  for (let wk = 1; wk <= 18; wk++) {
    if (wk === byeWeek) {
      log.push({ wk, bye: true, played: wk < CURRENT_WEEK, proj: 0, actual: 0, ceiling: 0, floor: 0 });
      continue;
    }

    // Pick an opponent
    let opp;
    let tries = 0;
    do {
      opp = OPP_POOL[Math.floor(r() * OPP_POOL.length)];
      tries++;
    } while ((opp === player.team || opponentsUsed.has(opp)) && tries < 8);
    if (tries === 8) { opp = OPP_POOL[Math.floor(r() * OPP_POOL.length)]; }
    opponentsUsed.add(opp);

    const home = r() > 0.5;
    const homeTeam = home ? player.team : opp;
    const indoor = INDOOR_TEAMS.has(homeTeam);
    // Kickoff distribution
    const kr = r();
    let day = "Sun", kickoff = "1pm", icon = "sun";
    if (wk === 1 && kr < 0.2) { day = "Thu"; kickoff = "8:20pm"; icon = "moon"; }
    else if (kr < 0.55) { day = "Sun"; kickoff = "1pm"; icon = "sun"; }
    else if (kr < 0.78) { day = "Sun"; kickoff = "4:25pm"; icon = "dusk"; }
    else if (kr < 0.9)  { day = "Sun"; kickoff = "8:20pm"; icon = "moon"; }
    else if (kr < 0.96) { day = "Mon"; kickoff = "8:15pm"; icon = "moon"; }
    else                { day = "Thu"; kickoff = "8:20pm"; icon = "moon"; }
    // Saturday games late in season
    if (wk >= 15 && r() < 0.15) { day = "Sat"; kickoff = "8:15pm"; icon = "moon"; }

    // Weather — indoor games always clear
    let weather = "clear";
    if (!indoor) {
      const wr = r();
      if (wk >= 13 && COLD_LATE_TEAMS.has(homeTeam) && wr < 0.18) weather = "snow";
      else if (wk >= 10 && COLD_LATE_TEAMS.has(homeTeam) && wr < 0.30) weather = "windy";
      else if (wr < 0.10) weather = "rain";
      else if (wr < 0.14) weather = "fog";
      else weather = "clear";
    }

    // Holiday
    let holiday = null;
    if (wk === 12 && day === "Thu") holiday = "thx";
    if (wk === 16 && day === "Sat") holiday = "xmas";

    // Projection & actual
    const base = player.proj;
    const projVar = (r() - 0.5) * 4; // ±2
    const proj = Math.max(2, base + projVar);
    const ceiling = proj * (1.4 + r() * 0.2);
    const floor   = Math.max(0, proj * (0.45 + r() * 0.15));
    let actual = null;
    if (wk < CURRENT_WEEK) {
      // From traj if available
      const trajIdx = Math.min((player.traj || []).length - 1, wk - 1);
      const base2 = (player.traj && player.traj[trajIdx]) || proj;
      actual = Math.max(0, base2 + (r() - 0.5) * 2);
    } else if (wk === CURRENT_WEEK) {
      actual = player.actual; // current week
    }

    log.push({
      wk, opp, home, indoor, kickoff, day, weather, holiday,
      proj: +proj.toFixed(2),
      actual: actual != null ? +actual.toFixed(2) : null,
      ceiling: +ceiling.toFixed(2),
      floor: +floor.toFixed(2),
      played: wk < CURRENT_WEEK,
      bye: false,
    });
  }
  return log;
}

// Cache per-player game logs lazily
const _logCache = {};
function getGameLog(playerId) {
  if (!_logCache[playerId]) {
    const p = PLAYERS.find(x => x.id === playerId);
    if (!p) return [];
    _logCache[playerId] = makeGameLog(p);
  }
  return _logCache[playerId];
}

Object.assign(window, { CURRENT_WEEK, getGameLog, makeGameLog });
